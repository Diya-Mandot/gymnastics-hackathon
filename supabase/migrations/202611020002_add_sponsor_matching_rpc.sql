-- Deterministic sponsor matching for the demo.
-- Scores intentionally prioritize cause alignment over raw follower reach.

create or replace function public.match_athletes(
  p_business_goal text,
  p_audience text,
  p_cause text,
  p_campaign_format text,
  p_budget numeric,
  p_athlete_scope text
)
returns table (
  athlete_id uuid,
  athlete_slug text,
  athlete_name text,
  match_score numeric,
  score_breakdown jsonb,
  explanation text,
  recommended_campaign text
)
language sql
stable
set search_path = public
as $$
  with scored as (
    select
      a.id,
      a.slug,
      a.name,
      a.causes,
      a.audience_tags,
      a.campaign_types,
      a.availability,
      a.budget_min,
      case when exists (
        select 1 from unnest(a.causes) cause where lower(cause) = lower(trim(p_cause))
      ) then 100 else 35 end as cause_score,
      case when exists (
        select 1 from unnest(a.audience_tags) audience where lower(audience) = lower(trim(p_audience))
      ) then 100 else 40 end as audience_score,
      case when exists (
        select 1 from unnest(a.campaign_types) campaign_type where lower(campaign_type) = lower(trim(p_campaign_format))
      ) then 100 else 40 end as format_score,
      case when p_budget >= a.budget_min then 100 else greatest(0, round((p_budget / nullif(a.budget_min, 0)) * 100, 2)) end as budget_score,
      case when lower(a.availability) = 'available' then 100 else 25 end as availability_score
    from public.athletes a
    where a.is_demo = true
  ), ranked as (
    select
      *,
      round(
        (cause_score * 0.35) +
        (audience_score * 0.25) +
        (format_score * 0.20) +
        (budget_score * 0.10) +
        (availability_score * 0.10),
        2
      ) as total_score
    from scored
  )
  select
    id,
    slug,
    name,
    total_score,
    jsonb_build_object(
      'cause_alignment', cause_score,
      'audience_fit', audience_score,
      'campaign_format_fit', format_score,
      'budget_fit', budget_score,
      'availability', availability_score,
      'weights', jsonb_build_object(
        'cause_alignment', 35,
        'audience_fit', 25,
        'campaign_format_fit', 20,
        'budget_fit', 10,
        'availability', 10
      )
    ),
    format(
      '%s is a strong match for %s because her %s focus, %s audience fit, and %s campaign availability align with this brief.',
      name,
      coalesce(nullif(trim(p_business_goal), ''), 'your campaign'),
      coalesce(nullif(trim(p_cause), ''), 'community'),
      coalesce(nullif(trim(p_audience), ''), 'target'),
      lower(availability)
    ),
    'Confidence Starts Here'
  from ranked
  order by total_score desc, name asc
  limit 3;
$$;

comment on function public.match_athletes is
  'Returns the three best fictional demo athletes using 35/25/20/10/10 weighted matching.';

grant execute on function public.match_athletes(text, text, text, text, numeric, text) to anon, authenticated;
