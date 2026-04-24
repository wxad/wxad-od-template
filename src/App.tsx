import { RuyiLayout } from "one-design-next"
import { useMemo, useState } from "react"
import { MENU_ITEMS, menuLabelForKey } from "./config/menuItems"
import { DefaultDashboard } from "./pages/DefaultDashboard"

export default function App() {
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
      <DefaultDashboard title={contentTitle} />
    </RuyiLayout>
  )
}
