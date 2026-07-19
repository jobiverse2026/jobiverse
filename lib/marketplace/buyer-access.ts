export type MarketplaceBuyerRole = "candidate" | "creator" | "employer";

export function requiredBuyerPortal(audience: string) {
  return audience === "employer" ? "employer" : "candidate";
}

export function canBuyMarketplaceService(role: string | null | undefined, audience: string) {
  if (audience === "employer") return role === "employer";
  return role === "candidate" || role === "creator";
}
