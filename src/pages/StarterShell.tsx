import { RuyiLayout } from "one-design-next"
import { Link } from "react-router-dom"
import { useMemo, useState } from "react"
import { MENU_ITEMS, menuLabelForKey } from "../config/menuItems"
import { DefaultDashboard } from "./DefaultDashboard"

/** 根路径：空白 RuyiLayout + 工作台占位，给「从 0 搭页」用 */
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
        示例整页见{" "}
        <Link className="text-[var(--odn-color-blue-7)] underline" to="/home">
          /home
        </Link>
        等；完整列表{" "}
        <Link className="text-[var(--odn-color-blue-7)] underline" to="/catalog">
          /catalog
        </Link>
        。
      </p>
      <DefaultDashboard title={contentTitle} />
    </RuyiLayout>
  )
}
