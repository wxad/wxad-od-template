import { RuyiLayout } from "one-design-next"
import { Link } from "react-router-dom"
import { useMemo, useState } from "react"
import { MENU_ITEMS, menuLabelForKey } from "../config/menuItems"
import { DefaultDashboard } from "./DefaultDashboard"

/** 不含业务 workshop 的空白壳，给「从 0 搭页」用 */
export function StarterShell() {
  const [activeMenu, setActiveMenu] = useState("dashboard")

  const contentTitle = useMemo(
    () => menuLabelForKey(MENU_ITEMS, activeMenu) ?? "工作台",
    [activeMenu],
  )

  return (
    <RuyiLayout
      menuItems={MENU_ITEMS}
      activeMenu={activeMenu}
      onMenuChange={setActiveMenu}
      collapsible
      accountName="品牌名称"
      accountId="12345678"
      className="h-screen"
      contentClassName="space-y-4"
    >
      <p className="text-sm text-[var(--odn-color-black-36)]">
        <Link className="text-[var(--odn-color-blue-7)] underline" to="/">
          ← 返回 Workshop 索引
        </Link>
      </p>
      <DefaultDashboard title={contentTitle} />
    </RuyiLayout>
  )
}
