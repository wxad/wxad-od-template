# workshop（如翼整页示例）

本目录页面由 **one-design-next** 文档站通过 `docs-pages/workshop/*.md` 的 `<code src>` 引入并打包。

- 依赖 `one-design-next` 的 alias（见父仓库 `.dumirc.ts`）。
- 复用区块时从父仓库引用：`../../../../skills/p2-block-catalog/references/...`。
- 独立运行 **Vite 模板**时默认入口仍为 `src/App.tsx`；若要在模板内直接预览某页，可自行改路由或入口（本 README 不强制）。
