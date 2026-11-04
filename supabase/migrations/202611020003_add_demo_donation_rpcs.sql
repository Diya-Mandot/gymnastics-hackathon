-- Atomic, payment-free contribution flow for the live QR demo.

create or replace function public.create_demo_donation(
  p_campaign_slug text,
  p_supporter_name text default 'Demo Judge'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_campaign public.campaigns;
  v_donation public.donations;
begin
  select * into v_campaign
  from public.campaigns
  where slug = p_campaign_slug
    and is_demo = true
    and status = 'active'
  for update;

  if not found then
    raise exception 'Active demo campaign not found: %', p_campaign_slug using errcode = 'P0002';
  end if;

  insert into public.donations (
    campaign_id, athlete_id, supporter_name, amount, support_type, is_demo, thank_you_pack_sent
  ) values (
    v_campaign.id, v_campaign.athlete_id, coalesce(nullif(trim(p_supporter_name), ''), 'Demo Judge'),
    10.00, 'one_time', true, true
  ) returning * into v_donation;

  update public.campaigns
  set
    current_raised = current_raised + v_donation.amount,
    supporter_count = supporter_count + 1,
    fan_contributions = fan_contributions + v_donation.amount
  where id = v_campaign.id
  returning * into v_campaign;

  update public.athletes
  set current_raised = current_raised + v_donation.amount
  where id = v_campaign.athlete_id;

  insert into public.fan_actions (campaign_id, athlete_id, action_type, detail, is_demo)
  values (
    v_campaign.id,
    v_campaign.athlete_id,
    'donation',
    format('%s backed %s with $10.', v_donation.supporter_name, (select name from public.athletes where id = v_campaign.athlete_id)),
    true
  );

  return jsonb_build_object(
    'donation_id', v_donation.id,
    'campaign_slug', v_campaign.slug,
    'campaign_total', v_campaign.current_raised,
    'supporter_count', v_campaign.supporter_count,
    'fan_contributions', v_campaign.fan_contributions,
    'amount', v_donation.amount,
    'is_demo', true,
    'thank_you_pack_sent', true
  );
end;
$$;

create or replace function public.reset_confidence_starts_here_demo()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_campaign public.campaigns;
begin
  select * into v_campaign
  from public.campaigns
  where slug = 'confidence-starts-here' and is_demo = true
  for update;

  if not found then
    raise exception 'Confidence Starts Here demo campaign not found' using errcode = 'P0002';
  end if;

  delete from public.donations where campaign_id = v_campaign.id and is_demo = true;
  delete from public.fan_actions where campaign_id = v_campaign.id and is_demo = true;

  update public.campaigns
  set current_raised = 8240, supporter_count = 186, business_funding = 6500, fan_contributions = 1740
  where id = v_campaign.id
  returning * into v_campaign;

  update public.athletes set current_raised = 8240 where id = v_campaign.athlete_id;

  return jsonb_build_object(
    'campaign_slug', v_campaign.slug,
    'campaign_total', v_campaign.current_raised,
    'supporter_count', v_campaign.supporter_count,
    'fan_contributions', v_campaign.fan_contributions,
    'reset', true
  );
end;
$$;

revoke all on function public.create_demo_donation(text, text) from public;
grant execute on function public.create_demo_donation(text, text) to anon, authenticated;

revoke all on function public.reset_confidence_starts_here_demo() from public, anon, authenticated;
grant execute on function public.reset_confidence_starts_here_demo() to service_role;

comment on function public.create_demo_donation is
  'Creates a clearly fake $10 contribution and atomically updates the realtime campaign totals.';
comment on function public.reset_confidence_starts_here_demo is
  'Service-role-only reset for rehearsal and presentation recovery.';
