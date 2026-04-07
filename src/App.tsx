import {
  Button,
  Icon,
  Input,
  RuyiLayout,
  type RuyiMenuItem,
} from "one-design-next"
import { useState } from "react"

const MENU_ITEMS: RuyiMenuItem[] = [
  {
    key: "overview",
    label: "数据概览",
    icon: "chart-bar",
    children: [
      { key: "dashboard", label: "数据看板" },
      { key: "report", label: "数据报表" },
    ],
  },
  {
    key: "manage",
    label: "资源管理",
    icon: "folder",
    children: [
      { key: "list", label: "资源列表" },
      { key: "create", label: "新建资源" },
    ],
  },
  {
    key: "settings",
    label: "系统设置",
    icon: "setting",
    children: [
      { key: "general", label: "基本设置" },
      { key: "permission", label: "权限管理" },
    ],
  },
]

export default function App() {
  const [activeMenu, setActiveMenu] = useState("dashboard")

  return (
    <RuyiLayout
      menuItems={MENU_ITEMS}
      activeMenu={activeMenu}
      onMenuChange={setActiveMenu}
      collapsible
      accountName="品牌名称"
      accountId="12345678"
      className="h-screen"
    >
      {/* 一般在这里开始，以及需要的话修改上方的 MENU_ITEMS */}
      {/* <div className="rounded-xl bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">
          {MENU_ITEMS.flatMap((g) => g.children ?? []).find((c) => c.key === activeMenu)?.label}
        </h2>
        <div className="flex items-center gap-3">
          <Input
            leftElement={<Icon name="search" />}
            placeholder="搜索..."
            className="w-[320px]"
          />
          <Button intent="primary" icon="plus">
            新建
          </Button>
        </div>
      </div> */}
    </RuyiLayout>
  )
}
