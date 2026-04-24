# 运行备忘

`one-design-next` 部分产物使用 `React.createElement` 但未在模块内 `import React`。入口 `src/main.tsx` 已将 `React` 挂到 `globalThis`，避免运行时 `React is not defined`。

若升级 React / 构建工具后出现问题，先检查该全局注入是否仍生效。
