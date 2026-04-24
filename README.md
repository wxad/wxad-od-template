# wxad-od-template

如翼业务侧的 **Vite + React + Tailwind v4 + one-design-next** 起步模板。

## 用法

```bash
npm install
npm run dev    # 默认 http://localhost:5173/
npm run build
npm run typecheck  # 可选：全量 tsc
```

仓库根目录含 `.npmrc`（`legacy-peer-deps=true`）。若 `~/.npm` 权限异常：`npm install --cache /tmp/npm-cache-odn`。

## 路由

| 路径 | 说明 |
|------|------|
| **`/`** | **空项目**：`RuyiLayout` + 示例工作台（给接新需求从零搭页） |
| **`/home`**、**`/brand5r`**、**`/<slug>`** | 各如翼整页示例（与文档站内容同源；文档站 URL 仍为 `/workshop/<slug>`） |
| **`/catalog`** | 全部示例页的索引列表 |

「从某一页开工」→ 直接打开 `http://localhost:5173/home` 等即可。

## 目录

| 路径 | 说明 |
|------|------|
| `src/App.tsx` | `BrowserRouter` + 路由 |
| `src/pages/StarterShell.tsx` | 根路径空白壳 |
| `src/pages/WorkshopCatalog.tsx` | `/catalog` |
| `src/pages/WorkshopPage.tsx` | `/:slug` 懒加载 |
| `src/blocks/` | 区块唯一源码 |
| `src/workshop/` | 整页示例源码 |
| `src/workshop/workshopModules.ts` | slug → 懒加载映射 |

## 与 one-design-next

作为子模块位于 `one-design-next/external/wxad-od-template` 时，与文档站共用 `src/blocks/`、`src/workshop/`。

克隆父仓库：`git submodule update --init --recursive`。

**`@tencent/retail-ai-lib`** 会把 React 16 装在自身 `node_modules` 下，导致与模板 React 19 双实例、页面白屏（Invalid hook call）。安装后 **`postinstall`** 会删掉该嵌套副本；若你禁用了 scripts，请手删 `node_modules/@tencent/retail-ai-lib/node_modules` 下的 `react` / `react-dom` / `scheduler`。
