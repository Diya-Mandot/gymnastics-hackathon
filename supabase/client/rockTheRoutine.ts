/**
 * Framework-neutral Supabase helpers for the Rock the Routine UI.
 * Pass the browser or server Supabase client created by the frontend.
 */

type QueryClient = {
  from: (table: string) => any;
  rpc: (name: string, args?: Record<string, unknown>) => Promise<{ data: any; error: any }>;
};

export type AthleteFilters = {
  cause?: string;
  audience?: string;
  campaignType?: string;
  maxBudget?: number;
  availability?: string;
  platform?: string;
  featuredType?: 'Fan Favorite' | 'Rising Routine';
  inPersonAvailable?: boolean;
};

export type SponsorBrief = {
  businessGoal: string;
  audience: string;
  cause: string;
  campaignFormat: string;
  budget: number;
  athleteScope: 'one_athlete' | 'group' | 'team_wide';
};

function throwIfError(error: { message?: string } | null) {
  if (error) throw new Error(error.message ?? 'Supabase request failed');
}

export async function getAllAthletes(client: QueryClient, filters: AthleteFilters = {}) {
  let query = client.from('athletes').select('*').eq('is_demo', true);
  if (filters.cause) query = query.contains('causes', [filters.cause]);
  if (filters.audience) query = query.contains('audience_tags', [filters.audience]);
  if (filters.campaignType) query = query.contains('campaign_types', [filters.campaignType]);
  if (filters.platform) query = query.contains('social_platforms', [filters.platform]);
  if (filters.maxBudget !== undefined) query = query.lte('budget_min', filters.maxBudget);
  if (filters.availability) query = query.eq('availability', filters.availability);
  if (filters.featuredType) query = query.eq('featured_type', filters.featuredType);
  if (filters.inPersonAvailable !== undefined) query = query.eq('in_person_available', filters.inPersonAvailable);
  const { data, error } = await query.order('featured_type').order('name');
  throwIfError(error);
  return data;
}

export async function getAthleteBySlug(client: QueryClient, slug: string) {
  const { data, error } = await client
    .from('athletes')
    .select('*')
    .eq('slug', slug)
    .eq('is_demo', true)
    .single();
  throwIfError(error);
  return data;
}

export async function getCampaignBySlug(client: QueryClient, slug = 'confidence-starts-here') {
  const { data, error } = await client
    .from('campaigns')
    .select('*, athletes(*)')
    .eq('slug', slug)
    .eq('is_demo', true)
    .single();
  throwIfError(error);
  return data;
}

export async function getCampaignTasks(client: QueryClient, campaignId: string) {
  const { data, error } = await client
    .from('tasks')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('due_date');
  throwIfError(error);
  return data;
}

export async function submitSponsorMatcher(client: QueryClient, brief: SponsorBrief) {
  const { data, error } = await client.rpc('match_athletes', {
    p_business_goal: brief.businessGoal,
    p_audience: brief.audience,
    p_cause: brief.cause,
    p_campaign_format: brief.campaignFormat,
    p_budget: brief.budget,
    p_athlete_scope: brief.athleteScope,
  });
  throwIfError(error);
  return data;
}

export async function createDemoDonation(
  client: QueryClient,
  campaignSlug = 'confidence-starts-here',
  supporterName = 'Demo Judge',
) {
  const { data, error } = await client.rpc('create_demo_donation', {
    p_campaign_slug: campaignSlug,
    p_supporter_name: supporterName,
  });
  throwIfError(error);
  return data;
}

/** Call only from a server route using the service-role client. */
export async function resetDemo(client: QueryClient) {
  const { data, error } = await client.rpc('reset_confidence_starts_here_demo');
  throwIfError(error);
  return data;
}

export async function getAdminDashboard(client: QueryClient, campaignSlug = 'confidence-starts-here') {
  const campaign = await getCampaignBySlug(client, campaignSlug);
  const [tasks, donations, fanActions, prospects] = await Promise.all([
    getCampaignTasks(client, campaign.id),
    client.from('donations').select('*').eq('campaign_id', campaign.id).order('created_at', { ascending: false }).limit(10),
    client.from('fan_actions').select('*').eq('campaign_id', campaign.id).order('created_at', { ascending: false }).limit(10),
    client.from('sponsor_prospects').select('*').order('created_at', { ascending: false }).limit(10),
  ]);
  throwIfError(tasks.error);
  throwIfError(donations.error);
  throwIfError(fanActions.error);
  throwIfError(prospects.error);
  return { campaign, tasks: tasks.data, donations: donations.data, fanActions: fanActions.data, prospects: prospects.data };
}

export function subscribeToCampaignUpdates(
  client: any,
  campaignId: string,
  onUpdate: (event: unknown) => void,
) {
  return client
    .channel(`campaign:${campaignId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns', filter: `id=eq.${campaignId}` }, onUpdate)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'donations', filter: `campaign_id=eq.${campaignId}` }, onUpdate)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fan_actions', filter: `campaign_id=eq.${campaignId}` }, onUpdate)
    .subscribe();
}
