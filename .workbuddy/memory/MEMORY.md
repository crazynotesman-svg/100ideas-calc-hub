# 项目长期记忆 — CalcAtlas（全球化计算器聚合平台）

## 项目定位
四语言（en / de / es / zh）SEO 驱动的计算器聚合站，品牌名 **CalcAtlas**。
全部计算在浏览器端完成，无后端、无账号、无数据上传。部署目标：**Cloudflare Workers（经 OpenNext 适配器）**，自定义域名 `calc.100ideas.net`。

## 技术栈（已锁定）
Next.js 14.2.35 App Router · next-intl 3.26.5（`localePrefix: 'always'`）· Tailwind 3.4 ·
Shadcn 风格手写原语 · Zustand（单位制）· Recharts 2.15（仅 FIRE）· 零依赖纯函数计算引擎

## 不可破坏的约定
1. **hreflang 单一来源**：middleware 的 `alternateLinks: false`；alternates 只由
   `lib/seo/metadata.ts` 与 `app/sitemap.ts` 输出。改动前先跑 `npm run audit:seo`。
2. **slug 与语言无关**：一个计算器一个规范 URL 形状，靠 locale 前缀区分，
   保证 hreflang 双向自洽、链接权重集中。
3. **计算引擎必须是纯函数、时区无关**（day-number 算法），可在服务端预渲染出结果。
4. **CLS=0**：所有结果/图表/广告容器必须先占位再填充；条件渲染的元素要预留高度槽位。
5. **不持久化单位制偏好**（避免 hydration 偏移）。

## 部署（Cloudflare，已实测）
- **结论：用 OpenNext for Cloudflare → Workers，不用 next-on-pages / Pages Functions。**
- 根因：Next 14.2.35 的中间件（`@next/request-context` → `require("async_hooks")`）在 next-on-pages 的
  esbuild 边缘打包阶段无法解析 → 构建失败；且 next-on-pages 已被官方弃用，next-on-pages 1.13+ 与
  OpenNext 1.18+ 的 peer 都要求 `next >= 15`，锁死在 Next 14.2 上只能走 OpenNext。
- **锁定版本**：`@opennextjs/cloudflare@1.15.0`（peer 接受 `^14.2.35`）+ `wrangler@^4`。
  新版（1.18+/1.20）会要求 `next >=15`，切勿自动升级。
- 关键文件：`wrangler.toml`（`main=.open-next/worker.js` / `assets` / `services` / `nodejs_compat`）、
  `open-next.config.ts`、`public/_headers`、脚本 `cf:build`/`cf:deploy`。
- **禁止** `export const runtime = 'edge'`（OpenNext 不支持 edge runtime）。
- `NEXT_PUBLIC_SITE_URL` 兜底已改 `https://calc.100ideas.net`（config/site.config.ts）。
- 本地 `wrangler dev` 预览在本沙箱会因 workerd/esbuild panic 崩溃（环境限制），但 `cf:build` 产物正常，云端 `wrangler deploy` 不受影响。

### 关键坑：纯 SSG 预渲染动态路由在 Workers 上 404（GSC `sitemap-presets.xml` 无法抓取根因）
- **现象**：`/preset/[scenario]` 等 `dynamicParams=false` 的预渲染动态路由在 Cloudflare Workers 上**全部返回 404**，
  而基础计算器页（静态文件）正常 200。GSC 因 sitemap 内 URL 大面积 404，将 `sitemap-presets.xml` 标记为「无法抓取」。
- **排除项**：Cloudflare Builds UI 的 **Cache 开关无关**（启用并重新部署后 preset 仍 404）。
- **根因与修复**：OpenNext for Cloudflare 默认增量缓存为 in-memory，**不跨 Worker 实例持久化**，故 `dynamicParams=false`
  的预渲染结果在边缘读不到 → 404。纯 SSG 站必须在 `open-next.config.ts` 显式配置只读 Static Assets 增量缓存：
  ```ts
  import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";
  export default defineCloudflareConfig({
    incrementalCache: staticAssetsIncrementalCache,
    enableCacheInterception: true,
  });
  ```
  配置后 `cf:build` 会生成 `.open-next/cache/**/*.cache`（preset 页 + sitemap 本身），由 Static Assets 直接服务，preset 页转 200。
- **沙箱网络限制**：本沙箱对 `github.com` 的 egress 经代理返回 502（api.github.com / cloudflare.com 正常），
  故 `git push origin main` 无法在此环境完成，需用户在自有网络（绕过沙箱代理）执行推送以触发 Cloudflare Workers Builds 自动部署。

## 质量门禁（改完必跑）
```
npm run typecheck && npm run build      # 类型 + 静态预渲染（现 284 页：9 计算器 base + 60 预设 × 4 语言）
npx next start -p 3311                  # 另起终端
npm run audit:preindex -- http://127.0.0.1:3311  # 预索引 SEO 断言（canonical/hreflang/JSON-LD/sitemap 覆盖）
npm run audit:seo -- http://127.0.0.1:3311      # SEO 断言（标题/描述长度、hreflang 计数等）
npm run audit:engines -- http://127.0.0.1:3311  # 引擎数值对照
```
- **新增计算器时，必须同步扩展审计脚本里的硬编码路由清单**：`scripts/preindex-check.mjs`
  （`CALCULATORS` + `PRESETS`）、`scripts/seo-audit.mjs`（`routes`）。否则审计会"通过"但根本不校验
  新页面——上次复利计算器就因此漏掉 es 标题超长(86>75)、zh 描述过短(38<51) 两个真实 SEO 缺陷。
- 关键约束：`metaTitle` 渲染值 = i18n 值 + ` | CalcAtlas`（12 字符后缀），故 i18n 值须 ≤ 63 才满足 ≤75；
  **若 i18n 标题含 `&`，HTML 实体展开为 `&amp;` 每个 +4 字符**（seo-audit 按渲染后 HTML 计长，de 标题
  曾因此 76>75），估算渲染长度须按 `len(title)+4×count('&')+12` 计；
  `metaDescription` 须 > 50 且 ≤ 320 字符。

## 内容规模
`config/calculators.config.ts` 是唯一索引（驱动路由/sitemap/JSON-LD/列表）。
当前 9 个计算器：schengen / fire / tdee / compound / mortgage / body-fat-bmi / auto-loan / student-loan / lease-vs-buy（finance 类 6 个）。
四语言字典结构必须完全一致（新增计算器/预设要四语言同步补齐，含 `mortgagePresets`/`bodyFatPresets` 命名空间与
`common.bridge` 的 mortgage/secondary/body-fat-bmi 桥接文案）；审计脚本路由清单必须同步扩展。
