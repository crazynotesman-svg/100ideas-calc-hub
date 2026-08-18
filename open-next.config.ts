import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Cloudflare config for CalcAtlas.
// The site is purely static (all calculator + preset pages are prerendered with
// dynamicParams=false). Use the read-only Static Assets incremental cache so those
// prerendered dynamic routes (e.g. /preset/[scenario]) are served directly from the
// deployed assets instead of an in-memory cache that does not persist across Worker
// instances — without this, every /preset/* page returns 404 on Cloudflare Workers.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
