export type MarketplaceFeeTier = {
  min: number;
  max: number;
  percent: number;
};

export const MARKETPLACE_FEE_TIERS: readonly MarketplaceFeeTier[] = [
  { min: 0, max: 999, percent: 25 },
  { min: 1_000, max: 4_999, percent: 20 },
  { min: 5_000, max: 14_999, percent: 15 },
  { min: 15_000, max: Number.POSITIVE_INFINITY, percent: 10 },
];

function validAmount(amount: number) {
  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
}

export function marketplaceFeePercent(amount: number) {
  const safeAmount = validAmount(amount);
  return MARKETPLACE_FEE_TIERS.find(
    (tier) => safeAmount >= tier.min && safeAmount <= tier.max,
  )?.percent ?? 10;
}

export function customerPrice(creatorAmount: number) {
  const safeCreatorAmount = validAmount(creatorAmount);
  const feePercent = marketplaceFeePercent(safeCreatorAmount);
  return Math.ceil((safeCreatorAmount * (1 + feePercent / 100)) / 10) * 10;
}

export function platformMargin(customerAmount: number, creatorAmount: number) {
  return Math.max(0, validAmount(customerAmount) - validAmount(creatorAmount));
}

export function creatorEarningFromCustomerOffer(customerOffer: number) {
  const safeCustomerOffer = validAmount(customerOffer);
  const feePercent = marketplaceFeePercent(safeCustomerOffer);
  return Math.floor((safeCustomerOffer * (1 - feePercent / 100)) * 100) / 100;
}

export function customerOfferFromCreatorEarning(creatorEarning: number) {
  const safeCreatorEarning = validAmount(creatorEarning);

  for (const tier of MARKETPLACE_FEE_TIERS) {
    const candidate = safeCreatorEarning / (1 - tier.percent / 100);
    if (candidate >= tier.min && candidate <= tier.max) {
      return Math.ceil(candidate * 100) / 100;
    }
  }

  return Math.ceil((safeCreatorEarning / 0.9) * 100) / 100;
}

export function featuredListingPrice(creatorAmount: number) {
  const safeCreatorAmount = validAmount(creatorAmount);
  if (safeCreatorAmount <= 0) return 499;
  if (safeCreatorAmount < 1_000) return Math.max(50, Math.ceil((safeCreatorAmount * 0.5) / 10) * 10);
  if (safeCreatorAmount < 2_500) return 799;
  if (safeCreatorAmount < 5_000) return 1_499;
  if (safeCreatorAmount < 10_000) return 2_499;
  return 4_999;
}
