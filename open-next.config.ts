import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal Cloudflare config for CalcAtlas.
// Incremental cache runs in-memory by default. For a shared cross-instance cache, add the
// R2 override documented at https://opennext.js.org/cloudflare/caching.
export default defineCloudflareConfig({});
