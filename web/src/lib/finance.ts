// Revenue Intelligence model. Every input is a labelled, hypothetical assumption.
// Rule from the master plan: existing supporter revenue is shown but never counted as new.

export type FinanceInputs = {
  // A. Existing baseline (estimate, not verified)
  existingSupporters: number;
  existingPct25: number; // share of existing supporters on the $25 tier, 0-1
  // B. Incremental fan revenue
  newSupporters: number; // acquired during the year
  newPct25: number;
  avgMonthsActive: number; // average months a new supporter pays in year 1
  upgradeRate: number; // share of existing $10 supporters moving to $25
  upgradeMonths: number; // months at the higher tier in year 1
  oneTimeGifts: number;
  avgOneTimeGift: number;
  // C. New sponsorship revenue
  prospects: number;
  qualificationRate: number;
  proposalRate: number; // of qualified
  closeRate: number; // of proposals
  avgDealSize: number;
  collectionRate: number; // of signed value collected in year 1
  renewalRate: number; // signed deals expected to renew next year
  // D. Costs
  buildCost: number; // one-time, counted in year 1
  annualOperatingCost: number;
  variableCostRate: number; // fulfillment, processing, creative, as share of new collected funding
};

export const TIER_LOW = 10;
export const TIER_HIGH = 25;

export const scenarios: Record<"conservative" | "base" | "stretch", FinanceInputs> = {
  conservative: {
    existingSupporters: 475, existingPct25: 0.5,
    newSupporters: 120, newPct25: 0.3, avgMonthsActive: 6, upgradeRate: 0.05, upgradeMonths: 6,
    oneTimeGifts: 150, avgOneTimeGift: 20,
    prospects: 80, qualificationRate: 0.3, proposalRate: 0.5, closeRate: 0.25, avgDealSize: 10000,
    collectionRate: 0.8, renewalRate: 0.4,
    buildCost: 25000, annualOperatingCost: 20000, variableCostRate: 0.1,
  },
  base: {
    existingSupporters: 475, existingPct25: 0.5,
    newSupporters: 300, newPct25: 0.4, avgMonthsActive: 7, upgradeRate: 0.1, upgradeMonths: 6,
    oneTimeGifts: 400, avgOneTimeGift: 25,
    prospects: 120, qualificationRate: 0.4, proposalRate: 0.5, closeRate: 0.3, avgDealSize: 15000,
    collectionRate: 0.85, renewalRate: 0.5,
    buildCost: 25000, annualOperatingCost: 20000, variableCostRate: 0.1,
  },
  stretch: {
    existingSupporters: 475, existingPct25: 0.5,
    newSupporters: 600, newPct25: 0.5, avgMonthsActive: 8, upgradeRate: 0.15, upgradeMonths: 7,
    oneTimeGifts: 800, avgOneTimeGift: 30,
    prospects: 200, qualificationRate: 0.45, proposalRate: 0.55, closeRate: 0.35, avgDealSize: 25000,
    collectionRate: 0.9, renewalRate: 0.6,
    buildCost: 60000, annualOperatingCost: 35000, variableCostRate: 0.1,
  },
};

export type FinanceOutputs = ReturnType<typeof computeFinance>;

const avgTier = (pct25: number) => pct25 * TIER_HIGH + (1 - pct25) * TIER_LOW;

export function computeFinance(i: FinanceInputs) {
  // A. Existing (shown, never added to "new")
  const existingAnnualized = i.existingSupporters * avgTier(i.existingPct25) * 12;

  // B. Incremental fan revenue
  const newSupporterRevenue = i.newSupporters * avgTier(i.newPct25) * i.avgMonthsActive;
  const existingOn10 = i.existingSupporters * (1 - i.existingPct25);
  const upgradeRevenue = existingOn10 * i.upgradeRate * (TIER_HIGH - TIER_LOW) * i.upgradeMonths;
  const oneTimeRevenue = i.oneTimeGifts * i.avgOneTimeGift;
  const fanIncremental = newSupporterRevenue + upgradeRevenue + oneTimeRevenue;

  // C. Sponsorship funnel
  const qualified = i.prospects * i.qualificationRate;
  const proposals = qualified * i.proposalRate;
  const signedDeals = proposals * i.closeRate;
  const pipelineValue = proposals * i.avgDealSize; // everything that reached proposal
  const signedValue = signedDeals * i.avgDealSize;
  const sponsorCollected = signedValue * i.collectionRate;
  const expectedRenewalValue = signedDeals * i.renewalRate * i.avgDealSize; // next year, not counted

  // D. Net incremental benefit (year 1)
  const newCollected = fanIncremental + sponsorCollected;
  const variableCosts = newCollected * i.variableCostRate;
  const fixedCosts = i.buildCost + i.annualOperatingCost;
  const netIncremental = newCollected - variableCosts - fixedCosts;
  const breakEven = fixedCosts / (1 - i.variableCostRate);

  return {
    existingAnnualized,
    newSupporterRevenue,
    upgradeRevenue,
    oneTimeRevenue,
    fanIncremental,
    qualified,
    proposals,
    signedDeals,
    pipelineValue,
    signedValue,
    sponsorCollected,
    expectedRenewalValue,
    newCollected,
    variableCosts,
    fixedCosts,
    netIncremental,
    breakEven,
    totalWithExisting: existingAnnualized + newCollected,
  };
}

export const costStages = [
  { stage: "Competition prototype", build: "$0–$500 cash (excl. labor)", operating: "n/a" },
  { stage: "Lean pilot", build: "$15K–$40K", operating: "$12K–$35K / yr" },
  { stage: "Production implementation", build: "$60K–$150K", operating: "$35K–$100K / yr" },
  { stage: "Advanced expansion", build: "To be scoped", operating: "To be scoped" },
];
