-- Fictional data only. Safe to rerun after `supabase db reset`.

insert into public.athletes (
  slug, name, specialty, short_bio, quote, photo_url, story_video_url,
  causes, campaign_types, audience_tags, social_platforms, availability,
  in_person_available, budget_min, total_reach, engagement_rate, featured_type,
  impact_goal, current_raised
) values
  (
    'avery-davis', 'Avery Davis', 'All-Around',
    'A confident all-around gymnast and youth mentor who turns hard-earned lessons into encouragement for the next generation.',
    'Gymnastics taught me confidence. Mentoring younger girls taught me why it matters.',
    '/images/athletes/avery-davis.jpg', '/videos/avery-confidence-story.mp4',
    array['Youth Confidence', 'Mentorship'], array['Social Campaign', 'In-Person Event', 'Story Video'],
    array['Utah Families', 'Youth Sports'], array['Instagram', 'TikTok'], 'Available', true,
    5000, 128000, 8.4, 'Fan Favorite', 15000, 8240
  ),
  (
    'mia-torres', 'Mia Torres', 'Balance Beam',
    'A thoughtful beam specialist focused on making sport and community spaces more welcoming for everyone.',
    'The strongest teams make room for every person to belong.',
    '/images/athletes/mia-torres.jpg', null,
    array['Inclusion', 'Accessibility'], array['Social Campaign', 'Community Event'],
    array['Utah Families', 'Students'], array['Instagram'], 'Available', true,
    3500, 72000, 10.1, 'Rising Routine', 10000, 2450
  ),
  (
    'sofia-patel', 'Sofia Patel', 'Uneven Bars',
    'A bars specialist who connects precision, curiosity, and a love of helping young students see themselves in STEM.',
    'Practice taught me that progress comes from staying curious.',
    '/images/athletes/sofia-patel.jpg', null,
    array['Education', 'STEM'], array['Story Video', 'School Visit', 'Social Campaign'],
    array['Students', 'Utah Families'], array['Instagram', 'YouTube'], 'Available', true,
    4000, 61000, 9.2, 'Rising Routine', 12000, 1980
  ),
  (
    'jordan-lee', 'Jordan Lee', 'Floor Exercise',
    'An energetic floor performer who champions wellness, family connection, and sustainable routines beyond competition.',
    'The best routines are the ones that help people feel stronger together.',
    '/images/athletes/jordan-lee.jpg', null,
    array['Wellness', 'Family'], array['Social Campaign', 'In-Person Event', 'Sponsor Offer'],
    array['Utah Families', 'Wellness Enthusiasts'], array['Instagram', 'TikTok'], 'Limited', true,
    6000, 143000, 7.8, 'Fan Favorite', 15000, 3200
  )
on conflict (slug) do update set
  name = excluded.name,
  specialty = excluded.specialty,
  short_bio = excluded.short_bio,
  quote = excluded.quote,
  photo_url = excluded.photo_url,
  story_video_url = excluded.story_video_url,
  causes = excluded.causes,
  campaign_types = excluded.campaign_types,
  audience_tags = excluded.audience_tags,
  social_platforms = excluded.social_platforms,
  availability = excluded.availability,
  in_person_available = excluded.in_person_available,
  budget_min = excluded.budget_min,
  total_reach = excluded.total_reach,
  engagement_rate = excluded.engagement_rate,
  featured_type = excluded.featured_type,
  impact_goal = excluded.impact_goal,
  current_raised = excluded.current_raised;

insert into public.campaigns (
  slug, name, description, athlete_id, community_partner, sponsor_name,
  goal, current_raised, supporter_count, business_funding, fan_contributions, status
)
select
  'confidence-starts-here',
  'Confidence Starts Here',
  'A $15,000 Impact Routine that helps young girls build confidence through sport, mentorship, and community.',
  id,
  'Girls on the Run',
  'BrightPath Family Wellness (fictional)',
  15000, 8240, 186, 6500, 1740, 'active'
from public.athletes
where slug = 'avery-davis'
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  athlete_id = excluded.athlete_id,
  community_partner = excluded.community_partner,
  sponsor_name = excluded.sponsor_name,
  goal = excluded.goal,
  current_raised = excluded.current_raised,
  supporter_count = excluded.supporter_count,
  business_funding = excluded.business_funding,
  fan_contributions = excluded.fan_contributions,
  status = excluded.status;

insert into public.supporter_tiers (name, monthly_amount, description, benefits) values
  ('Free Red Rocks Fan', 0, 'Follow athlete stories and campaign updates.', array['Athlete stories', 'Campaign updates', 'QR activations', 'Sponsor offers']),
  ('Chalk Circle', 10, 'A monthly supporter tier for early campaign access.', array['Digital thank-you card', 'Athlete update video', 'Early campaign access']),
  ('Routine Partner', 25, 'A family-oriented monthly supporter tier.', array['Athlete-life videos', 'Family campaign offers', 'Quarterly behind-the-scenes update']),
  ('Impact Champion', 100, 'High-impact support with campaign recognition.', array['Thank-you video request', 'Digital impact report', 'Campaign recognition'])
on conflict (name) do update set
  monthly_amount = excluded.monthly_amount,
  description = excluded.description,
  benefits = excluded.benefits;

insert into public.tasks (campaign_id, title, owner_role, due_date, status, approval_state)
select c.id, v.title, v.owner_role, v.due_date, v.status, v.approval_state
from public.campaigns c
cross join (values
  ('Record athlete story', 'athlete', current_date + 1, 'done', 'approved'),
  ('Approve social creative', 'wrth_admin', current_date + 1, 'awaiting_approval', 'pending'),
  ('Publish QR campaign page', 'creative', current_date + 2, 'in_progress', 'not_required'),
  ('Schedule community activation', 'sponsor', current_date + 5, 'todo', 'not_required')
) as v(title, owner_role, due_date, status, approval_state)
where c.slug = 'confidence-starts-here'
  and not exists (
    select 1 from public.tasks t where t.campaign_id = c.id and t.title = v.title
  );

insert into public.sponsor_prospects (business_name, category, description, location, known_connection, estimated_budget, status)
select v.business_name, v.category, v.description, v.location, v.known_connection, v.estimated_budget, v.status
from (values
  ('BrightPath Family Wellness (fictional)', 'Wellness', 'Family wellness business aligned to youth confidence.', 'Salt Lake City, UT', 'Demo warm introduction', 15000::numeric, 'qualified'),
  ('Summit Smiles Dental (fictional)', 'Dental', 'Local family dental practice seeking a community partnership.', 'Salt Lake City, UT', null::text, 5000::numeric, 'researching')
) as v(business_name, category, description, location, known_connection, estimated_budget, status)
where not exists (
  select 1 from public.sponsor_prospects p where p.business_name = v.business_name
);
