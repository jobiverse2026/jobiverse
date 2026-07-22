export function isPaidAIEnabled() {
  return process.env.ENABLE_PAID_AI === "true" && process.env.AI_LAUNCH_MODE === "live";
}
