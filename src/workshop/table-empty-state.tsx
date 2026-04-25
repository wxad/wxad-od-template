'use client';

import {
  Button,
  Empty,
  Input,
  Pagination,
  RuyiLayout,
  Select,
  Table,
  type RuyiMenuItem,
  type TableProps,
} from 'one-design-next';
import React, { useState } from 'react';

const NAV_ITEMS = ['首页', '洞察诊断', '人群策略', '策略应用', '全域度量', '生意'];

// 顶栏 label → workshop 页面 slug（本文件独立维护，不与其他 workshop 页面共享）
const NAV_ROUTES: Record<string, string> = {
  '首页': 'home',
  '洞察诊断': 'compete-analysis',
  '人群策略': 'r-zero-crowd',
  '策略应用': 'insight-ip',
  '全域度量': 'review',
  生意: 'store-asset-distribution',
};

function navigateNav(label: string) {
  const slug = NAV_ROUTES[label];
  if (!slug || typeof window === 'undefined') return;
  // 替换当前 URL 最后一段为目标 slug，保留 ?fullscreen=1 等查询参数
  const url = new URL(window.location.href);
  const segments = url.pathname.replace(/\/+$/, '').split('/');
  segments[segments.length - 1] = slug;
  url.pathname = segments.join('/');
  window.location.href = url.toString();
}

const MENU_ITEMS: RuyiMenuItem[] = [
  { key: 'crowd-produce', label: '人群生产', icon: 'users' },
  { key: 'crowd-insight', label: '人群洞察', icon: 'search' },
];

const columns: TableProps<Record<string, string>>['columns'] = [
  { key: 'name', title: '人群名称', dataIndex: 'name' },
  { key: 'status', title: '状态', dataIndex: 'status' },
  { key: 'size', title: '规模', dataIndex: 'size' },
  { key: 'time', title: '创建时间', dataIndex: 'time' },
];

export default () => {
  const [data] = useState<Record<string, string>[]>([]);
  const [activeNav, setActiveNav] = useState('人群策略');

  return (
    <RuyiLayout
      navItems={NAV_ITEMS}
      activeNav={activeNav}
      onNavChange={(nav) => {
        setActiveNav(nav);
        navigateNav(nav);
      }}
      menuItems={MENU_ITEMS}
      defaultMenuKey="crowd-produce"
      title="人群策略"
    >
      <div className="flex gap-3 mb-4">
        <Select
          options={[{ label: '全部状态', value: 'all' }]}
          value="all"
          className="w-[140px]"
        />
        <Input placeholder="搜索人群名称" className="w-60" />
      </div>
      {data.length === 0 ? (
        <Empty description="暂无数据">
          <Button variant="primary">新建人群</Button>
        </Empty>
      ) : (
        <>
          <Table columns={columns} dataSource={data} />
          <div className="flex justify-end mt-4">
            <Pagination total={0} pageSize={10} current={1} />
          </div>
        </>
      )}
    </RuyiLayout>
  );
};
