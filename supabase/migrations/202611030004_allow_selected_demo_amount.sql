-- Preserve the selected amount from the supporter screen while remaining mock-only.
-- This supersedes the two-argument version without rewriting an already-applied migration.

drop function if exists public.create_demo_donation(text, text);

create function public.create_demo_donation(
  p_campaign_slug text,
  p_supporter_name text default 'Demo Judge',
  p_amount numeric default 10.00
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
  if p_amount <= 0 or p_amount > 1000 then
    raise exception 'Demo contribution must be between $0.01 and $1,000' using errcode = '22023';
  end if;

  select * into v_campaign
  from public.campaigns
  where slug = p_campaign_slug and is_demo = true and status = 'active'
  for update;
  if not found then
    raise exception 'Active demo campaign not found: %', p_campaign_slug using errcode = 'P0002';
  end if;

  insert into public.donations (
    campaign_id, athlete_id, supporter_name, amount, support_type, is_demo, thank_you_pack_sent
  ) values (
    v_campaign.id, v_campaign.athlete_id, coalesce(nullif(trim(p_supporter_name), ''), 'Demo Judge'),
    p_amount, 'one_time', true, true
  ) returning * into v_donation;

  update public.campaigns
  set current_raised = current_raised + v_donation.amount,
      supporter_count = supporter_count + 1,
      fan_contributions = fan_contributions + v_donation.amount
  where id = v_campaign.id
  returning * into v_campaign;

  update public.athletes set current_raised = current_raised + v_donation.amount
  where id = v_campaign.athlete_id;

  insert into public.fan_actions (campaign_id, athlete_id, action_type, detail, is_demo)
  values (
    v_campaign.id, v_campaign.athlete_id, 'donation',
    format('%s backed %s with $%s.', v_donation.supporter_name, (select name from public.athletes where id = v_campaign.athlete_id), to_char(v_donation.amount, 'FM999,999,990.00')),
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

revoke all on function public.create_demo_donation(text, text, numeric) from public;
grant execute on function public.create_demo_donation(text, text, numeric) to anon, authenticated;
