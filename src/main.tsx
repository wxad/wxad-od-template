import React, { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./app.css"

// one-design-next 部分组件产物使用了裸 React.createElement 但未 import React，
// 运行时把 React 挂到全局以兼容。见 MEMORY.md。
;(globalThis as unknown as { React: typeof React }).React = React

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
