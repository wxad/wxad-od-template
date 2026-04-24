# workshop（如翼整页示例）

本目录页面由 **one-design-next** 文档站通过 `docs-pages/workshop/*.md` 的 `<code src>` 引入并打包。

- 依赖 `one-design-next` 的 alias（见父仓库 `.dumirc.ts`）。
- 复用区块时从父仓库引用：`../../../../skills/p2-block-catalog/references/...`。
- **本子项目**的 `npm run build` / `tsc` 在 `tsconfig.app.json` 中已 **exclude** 本目录，避免单独构建时解析父路径失败；在父仓库用 Dumi 打包不受影响。
- 独立跑 Vite 请用 `src/pages/` + `App.tsx`；若要把某一页迁进模板，可复制到 `src/pages/` 并改掉对 `skills/` 的相对路径（或改为 npm 区块包）。
