# wxad-od-template

如翼业务侧的 **Vite + React + Tailwind v4 + one-design-next** 起步模板。

## 用法

```bash
npm install
npm run dev    # 本地预览
npm run build  # 类型检查 + 生产构建
```

仓库根目录含 `.npmrc`（`legacy-peer-deps=true`），用于放宽 `react-d3-cloud` 等与 React 19 的 peer 冲突。若本机 `~/.npm` 缓存权限异常，可临时指定缓存目录：`npm install --cache /tmp/npm-cache-odn`。

## 目录

| 路径 | 说明 |
|------|------|
| `src/App.tsx` | 应用壳：`RuyiLayout` + 侧栏 |
| `src/config/menuItems.ts` | 侧栏菜单数据，按需修改 |
| `src/pages/` | **业务页面模板**：默认 `DefaultDashboard.tsx` |
| `src/workshop/` | 与 **one-design-next 文档站** 联动的整页示例（Dumi `<code src>`）；内含对父仓库 `skills/` 的相对引用，**本模板单独 `tsc` 已排除该目录**，勿在 `App.tsx` 中直接 import workshop 文件，除非你在 monorepo 内配好路径别名 |

## 与 one-design-next 同仓（git submodule）

当本仓库位于 `one-design-next/external/wxad-od-template` 时，`src/workshop/` 由文档站打包；子项目自身仍用 `src/pages/` + `App.tsx` 作为可运行模板。

克隆父仓库后请执行：`git submodule update --init --recursive`。

## 依赖说明

`package.json` 中已加入 workshop 常用库（echarts、clsx 等），便于将示例代码迁入 `src/pages/` 时无需再补依赖；仅用布局时可忽略。
