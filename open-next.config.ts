import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Static assets continue to use Cloudflare Assets/CDN. Avoid a remote Workers KV
// incremental cache so deployments and page requests do not consume the KV free tier.
export default defineCloudflareConfig({});
