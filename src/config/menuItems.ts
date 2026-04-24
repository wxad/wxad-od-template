import type { RuyiMenuItem } from "one-design-next"

/** 如翼侧栏菜单骨架：按需改 key / label / 层级 */
export const MENU_ITEMS: RuyiMenuItem[] = [
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

export function menuLabelForKey(
  items: RuyiMenuItem[],
  key: string,
): string | undefined {
  for (const item of items) {
    if (item.key === key) return item.label
    const children = item.children
    if (children) {
      const hit = menuLabelForKey(children, key)
      if (hit) return hit
    }
  }
  return undefined
}
