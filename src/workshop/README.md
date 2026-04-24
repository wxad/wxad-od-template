# workshop（如翼整页示例）

与 **one-design-next** 文档站 `docs-pages/workshop/*.md` 中 `<code src="../../external/wxad-od-template/src/workshop/...">` 对齐。

- 区块实现位于 **`../blocks/`**（自包含，可脱离父仓库运行）。
- 本目录页面通过 `../blocks/...` 引用区块；通知类 demo 入口在 `../blocks/_internal/notification-popover-trigger.tsx`。
- 评测总览使用 `./data/benchmark-site.json`（由父仓库 `.dumi/data/benchmark.json` 同步，构建文档站后可在模板侧更新该文件）。
