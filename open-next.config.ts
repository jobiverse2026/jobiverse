import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";

// Persist Next.js fetch/unstable_cache entries between Worker invocations.
// Without a remote cache every isolate can rebuild the partner-job catalogue,
// repeating several external API calls and expensive response parsing.
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
});
