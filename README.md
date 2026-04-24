# wxad-od-template

如翼业务侧的 **Vite + React + Tailwind v4 + one-design-next** 起步模板。

## 用法

```bash
npm install
npm run dev    # 本地预览
npm run build  # 生产构建（Vite）
npm run typecheck  # 可选：全量 tsc（workshop 与 one-design-next@latest 类型对齐仍在收敛中）
```

仓库根目录含 `.npmrc`（`legacy-peer-deps=true`），用于放宽 `react-d3-cloud` 等与 React 19 的 peer 冲突。若本机 `~/.npm` 缓存权限异常，可临时：`npm install --cache /tmp/npm-cache-odn`。

## 路由（完整 Workshop 站）

- **`/`**：全部 workshop 入口索引（路径与文档站 `/workshop/<slug>` 一致）。
- **`/workshop/:slug`**：懒加载整页（如 `/workshop/home`、`/workshop/r0-audience-market`）。
- **`/starter`**：空白 `RuyiLayout` + 示例工作台（从零开新页时用）。

「基于某一页开工」→ 直接打开或跳转到对应 URL 即可，无需再搭壳或让 AI 重写页面骨架。

## 目录

| 路径 | 说明 |
|------|------|
| `src/App.tsx` | `BrowserRouter` + 路由表 |
| `src/pages/WorkshopIndex.tsx` | 首页索引 |
| `src/pages/WorkshopPage.tsx` | `/workshop/:slug` 懒加载 |
| `src/pages/StarterShell.tsx` | `/starter` 空白壳 |
| `src/config/menuItems.ts` | 空白壳侧栏菜单 |
| `src/blocks/` | **区块唯一源码**（供 workshop / 文档站引用） |
| `src/workshop/` | **整页示例**（与 one-design-next `<code src>` 对齐） |
| `src/workshop/workshopModules.ts` | slug → 懒加载模块映射 |

## 与 one-design-next 同仓（git submodule）

本仓库作为子模块位于 `one-design-next/external/wxad-od-template` 时，文档站与模板共用 `src/blocks/` + `src/workshop/`。

克隆父仓库后：`git submodule update --init --recursive`。

## 依赖说明

已包含 workshop 常用库（echarts、d3、clsx 等）；业务页若只用到壳，可按需精简依赖。
