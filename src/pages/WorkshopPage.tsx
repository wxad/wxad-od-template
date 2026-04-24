import { lazy, Suspense, useMemo } from "react"
import { Navigate, useParams } from "react-router-dom"
import { WORKSHOP_SLUG_TO_IMPORT } from "../workshop/workshopModules"

function fallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--odn-color-black-2)] text-sm text-[var(--odn-color-black-36)]">
      加载页面…
    </div>
  )
}

export function WorkshopPage() {
  const { slug } = useParams<{ slug: string }>()
  const loader = slug ? WORKSHOP_SLUG_TO_IMPORT[slug] : undefined

  const LazyComp = useMemo(() => {
    if (!loader) return null
    return lazy(loader)
  }, [loader])

  if (!slug || !LazyComp) {
    return <Navigate to="/" replace />
  }

  const Comp = LazyComp
  return (
    <Suspense fallback={fallback()}>
      <Comp />
    </Suspense>
  )
}
