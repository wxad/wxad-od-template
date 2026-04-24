import { Link } from "react-router-dom"
import { WORKSHOP_INDEX } from "../workshop/workshopModules"

/** 本地示例目录（非首页）；文档站仍为 `/workshop/<slug>`，本模板为 `/<slug>` */
export function WorkshopCatalog() {
  return (
    <div className="min-h-screen bg-[var(--odn-color-black-2)] p-8 text-[var(--odn-color-black-12)]">
      <h1 className="mb-2 text-xl font-semibold">示例页面目录</h1>
      <p className="mb-6 max-w-2xl text-sm text-[var(--odn-color-black-36)]">
        首页为空白壳（<Link className="text-[var(--odn-color-blue-7)] underline" to="/">/</Link>
        ）；以下为各整页路由，与文档站页面一一对应（路径无前缀{" "}
        <code className="rounded bg-[var(--odn-color-black-4)] px-1">/workshop</code>）。
      </p>
      <ul className="grid max-w-3xl grid-cols-1 gap-2 sm:grid-cols-2">
        {WORKSHOP_INDEX.map(({ slug, title }) => (
          <li key={slug}>
            <Link
              className="block rounded-lg border border-solid border-[var(--odn-color-black-6)] bg-white px-4 py-3 text-sm font-medium shadow-sm transition hover:border-[var(--odn-color-blue-6)]"
              to={`/${slug}`}
            >
              <span className="text-[var(--odn-color-black-10)]">{title}</span>
              <code className="mt-1 block text-xs text-[var(--odn-color-black-36)]">/{slug}</code>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
