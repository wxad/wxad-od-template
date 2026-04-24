import { Button, Icon, Input } from "one-design-next"

/** Vite 模板默认工作台区：新页面可仿照此文件在 `src/pages/` 下新增 */
export function DefaultDashboard({ title }: { title: string }) {
  return (
    <div className="rounded-xl bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <p className="mb-4 text-sm text-[var(--odn-color-black-36)]">
        在 <code className="rounded bg-[var(--odn-color-black-4)] px-1">src/pages/</code>{" "}
        编写业务内容，或从 one-design-next 引入区块与组件。
      </p>
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
    </div>
  )
}
