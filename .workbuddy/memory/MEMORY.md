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

## 质量门禁（改完必跑）
```
npm run typecheck && npm run build      # 类型 + 25 页静态预渲染
npx next start -p 3311                  # 另起终端
npm run audit:seo -- http://127.0.0.1:3311      # 20 页 SEO 断言
npm run audit:engines -- http://127.0.0.1:3311  # 引擎数值对照
```

## 内容规模
`config/calculators.config.ts` 是唯一索引（驱动路由/sitemap/JSON-LD/列表）。
四语言字典各 244 键，结构必须完全一致（新增文案要四语言同步补齐）。
