import { Link } from "react-router-dom"
import { WORKSHOP_INDEX } from "../workshop/workshopModules"

/** 本地预览：列出全部 workshop，与文档站路由对齐 */
export function WorkshopIndex() {
  return (
    <div className="min-h-screen bg-[var(--odn-color-black-2)] p-8 text-[var(--odn-color-black-12)]">
      <h1 className="mb-2 text-xl font-semibold">如翼 Workshop（本地）</h1>
      <p className="mb-6 max-w-2xl text-sm text-[var(--odn-color-black-36)]">
        与 one-design-next 文档站路径一致：点击即进入整页示例。业务开发可从某一页起步，或打开{" "}
        <Link className="text-[var(--odn-color-blue-7)] underline" to="/starter">
          空白工作台模板
        </Link>
        。
      </p>
      <ul className="grid max-w-3xl grid-cols-1 gap-2 sm:grid-cols-2">
        {WORKSHOP_INDEX.map(({ slug, title }) => (
          <li key={slug}>
            <Link
              className="block rounded-lg border border-solid border-[var(--odn-color-black-6)] bg-white px-4 py-3 text-sm font-medium shadow-sm transition hover:border-[var(--odn-color-blue-6)]"
              to={`/workshop/${slug}`}
            >
              <span className="text-[var(--odn-color-black-10)]">{title}</span>
              <code className="mt-1 block text-xs text-[var(--odn-color-black-36)]">/workshop/{slug}</code>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
