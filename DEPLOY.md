# CalcAtlas — Cloudflare 部署指南

目标域名：**`https://calc.100ideas.net`**

## 1. 这套流水线做了什么

| 项 | 值 |
|---|---|
| 框架 | Next.js 14.2.35 (App Router) + next-intl 3.26.5 (`localePrefix: 'always'`) |
| Cloudflare 适配器 | `@opennextjs/cloudflare@1.15.0`（OpenNext for Cloudflare） |
| **部署目标** | **Cloudflare Workers**（不是 Pages Functions） |
| 自定义域名 | `calc.100ideas.net` 绑定到该 Worker |
| 构建产物 | `.open-next/`（worker.js + assets + middleware 包） |

> **重要：为什么是 Workers 而不是 Pages Functions？** 见第 2 节。

## 2. 为什么不用「Pages Git 控制台 + next-on-pages」这条路线

你原始蓝图设想的是 Cloudflare Pages 控制台连 GitHub、Framework preset = Next.js 的流水线。这条路在当前代码下**走不通**，原因已实测确认：

1. **next-on-pages 已弃用**：Cloudflare 官方在构建时明确提示 *"Please use the OpenNext adapter instead"*。
2. **async_hooks 不兼容**：next-on-pages 用 esbuild 把 Next 14.2 的中间件（`@next/request-context` → `require("async_hooks")`）打包到边缘（workerd）时无法解析 Node 内置，构建直接失败。试过 1.13.0 与 1.12.1，**同样报错**。
3. **版本地板已抬到 Next 15**：next-on-pages 1.13.16 与 OpenNext 1.18+ 的 peer 都要求 `next >= 15`，Next 14.2.35 已低于门槛。

结论：保留 Next 14.2.35（已验证、安全）的前提下，**唯一能成功构建的 Cloudflare 路径是 OpenNext → Workers**。端目标（`calc.100ideas.net` 上跑多语言站点）完全达成，只是底层是 Worker 而非 Pages 函数。

> 如果你一定要走「Pages 控制台 + next-on-pages」原流程，必须先升级到 Next 15（async params、`setRequestLocale` 等破坏性变更）——这是更大的迁移，可单独安排。

## 3. 前置条件

- Node ≥ 18.18（本地用 22），npm ≥ 9
- GitHub 仓库 `100ideas-calc-hub`
- Cloudflare 账号；`calc.100ideas.net` 已在 Cloudflare 添加为 zone（域名注册商处把 NS 改到 Cloudflare）
- 本地 `wrangler` 已登录：`npx wrangler login`

## 4. 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://calc.100ideas.net` | 已在 `config/site.config.ts` 兜底。控制台/CI 里建议显式再设一次，确保规范域名正确烘焙进 canonical/hreflang/sitemap。 |

## 5. 本地构建验证（CI 前先跑）

```bash
npm install
npm run cf:build          # = npx opennextjs-cloudflare build
```

成功标志：生成 `.open-next/worker.js`、`.open-next/middleware/handler.mjs`、`.open-next/assets/`。
全部 12 个计算器页（4 locale × 3）+ 首页/索引（各 4 locale）+ robots.txt + sitemap.xml 均预渲染，无 `runtime='nodejs'` 依赖。

> 说明：OpenNext 模型下，页面由 Cloudflare Worker（启用 `nodejs_compat`）按需渲染并经 CDN 缓存，不依赖传统 Node 服务器。本地 `wrangler dev` 预览若在本沙箱崩溃（workerd/esbuild panic），属环境限制，不影响云端 `wrangler deploy`。

## 6. 通过 CLI 部署

```bash
npx wrangler login          # 仅首次
npm run cf:deploy          # = opennextjs-cloudflare build && opennextjs-cloudflare deploy
```

首次部署会创建 Worker **`100ideas-calc-hub`**（Workers Builds 按 GitHub 仓库名强制命名；`wrangler.toml` 的 `name` 与 `services[].service` 必须与此一致，否则部署报 `[code: 10143]` 自引用绑定找不到 Worker）。

## 7. 通过 GitHub 自动部署（Cloudflare Workers Builds / CI-CD）

1. Cloudflare 控制台 → **Workers & Pages** → **Create** → **Deploy from Git** → 连接 `100ideas-calc-hub`。2. 构建配置：
   - Build command：`npm ci && npm run cf:deploy`
   - （无「输出目录」概念——部署单元是 Worker，构建产出 `.open-next` 由 `opennextjs-cloudflare deploy` 消费）
   - 生产分支：`main`
   - ⚠️ **Worker 命名**：Workers Builds 会强制把 Worker 名设为仓库名 `100ideas-calc-hub`，并覆盖 `wrangler.toml` 的 `name`。因此 `wrangler.toml` 里的 `name` 与 `WORKER_SELF_REFERENCE` 绑定的 `service` 都必须写成 `100ideas-calc-hub`，否则部署失败 `[code: 10143]`。
3. 环境变量：`NEXT_PUBLIC_SITE_URL = https://calc.100ideas.net`（构建期变量）
4. 每次合并到 `main` 自动构建部署。

## 8. 绑定自定义域名 `calc.100ideas.net`

1. Cloudflare 控制台 → 你的 Worker **100ideas-calc-hub** → **Settings** → **Triggers** → **Custom Domains** → **Add `calc.100ideas.net`**。
2. DNS 前置：确保 `calc.100ideas.net` 的 zone 在 Cloudflare 管理下（注册商处 NS 已指向 Cloudflare）。添加后 Cloudflare 会自动下发 Universal SSL 证书。
3. 等边缘证书生效（通常几分钟），访问 `https://calc.100ideas.net/` 应 308 → `/en`。

## 9. 上线后验证

```bash
curl -I https://calc.100ideas.net/                 # 期望 308 -> /en
curl -s https://calc.100ideas.net/zh/calculators/health/tdee-macro-calculator \
  | grep -E 'rel="alternate"|rel="canonical"|application/ld\+json'
# 期望：5 条 hreflang（en/de/es/zh-Hans + x-default）、canonical 自指、JSON-LD 块
npm run audit:seo -- https://calc.100ideas.net     # 把审计脚本指向线上 URL
```

- **LCP / INP**：当前只在静态 HTML 层验证，需在边缘节点跑 Lighthouse 实测（目标 <1.0s / <50ms）。
- **Search Console**：提交 sitemap.xml，跑一次 hreflang 报告确认无冲突。

## 10. 风险与后续

- OpenNext 默认增量缓存是**内存级**；多实例共享缓存需加 R2 override（见 [OpenNext Cloudflare Caching](https://opennext.js.org/cloudflare/caching)）。
- `recharts@2.15` 上游已标记 2.x 不再活跃，暂留；后续可评估 v3。
- 若将来迁移到 Next 15，可平滑切回「Pages 控制台 + next-on-pages」或继续用 OpenNext（届时升 `@opennextjs/cloudflare` 到 1.18+）。

## 11. 本次为部署新增/修改的文件

- `wrangler.toml` — OpenNext Worker 配置（`main` / `assets` / `services` + `name` / `compatibility_date` / `nodejs_compat`）
- `open-next.config.ts` — OpenNext Cloudflare 配置
- `package.json` — 依赖 `@opennextjs/cloudflare@^1.15.0` + `wrangler@^4`；脚本 `cf:build` / `cf:preview` / `cf:deploy`
- `config/site.config.ts` — `NEXT_PUBLIC_SITE_URL` 兜底改为 `https://calc.100ideas.net`
- `public/_headers` — `_next/static` 长缓存
- `.gitignore` — 忽略 `.open-next` 等构建产物
- 移除 `@cloudflare/next-on-pages`；撤销临时 `export const runtime = 'edge'`（OpenNext 不支持 edge runtime）
