# wxad-od-template

如翼业务侧的 **Vite + React + Tailwind v4 + one-design-next** 起步模板。

## 用法

```bash
npm install
npm run dev    # 本地预览
npm run build  # 生产构建（Vite）
npm run typecheck  # 可选：全量 `tsc`（workshop 与 one-design-next@latest 类型对齐仍在收敛中）
```

仓库根目录含 `.npmrc`（`legacy-peer-deps=true`），用于放宽 `react-d3-cloud` 等与 React 19 的 peer 冲突。若本机 `~/.npm` 缓存权限异常，可临时指定缓存目录：`npm install --cache /tmp/npm-cache-odn`。

## 目录

| 路径 | 说明 |
|------|------|
| `src/App.tsx` | 应用壳：`RuyiLayout` + 侧栏 |
| `src/config/menuItems.ts` | 侧栏菜单数据，按需修改 |
| `src/pages/` | **业务页面模板**：默认 `DefaultDashboard.tsx` |
| `src/blocks/` | 区块参考实现（自 p2-block-catalog 迁入），供 `src/workshop/` 与业务页 `import` |
| `src/workshop/` | 如翼整页示例；与 one-design-next 文档站 `<code src>` 对齐，**本仓库内可独立类型检查与打包** |

## 与 one-design-next 同仓（git submodule）

当本仓库作为 **git submodule** 位于 `one-design-next/external/wxad-od-template` 时，文档站与模板共用同一套 `src/workshop/` + `src/blocks/` 源码。

克隆父仓库后请执行：`git submodule update --init --recursive`。

## 依赖说明

`package.json` 中已加入 workshop 常用库（echarts、clsx 等），便于将示例代码迁入 `src/pages/` 时无需再补依赖；仅用布局时可忽略。
