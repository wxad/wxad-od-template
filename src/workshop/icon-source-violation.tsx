'use client';

import {
  Button,
  Icon,
  Input,
  Pagination,
  RuyiLayout,
  Table,
  Tabs,
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
  { key: 'role', label: '角色管理', icon: 'shield' },
  { key: 'member', label: '成员管理', icon: 'users' },
];

const ROLE_DATA = [
  { key: '1', name: '超级管理员', description: '拥有全部权限', members: 2 },
  { key: '2', name: '运营专员', description: '广告投放和数据查看权限', members: 5 },
  { key: '3', name: '数据分析师', description: '仅数据查看权限', members: 3 },
];

const columns: TableProps<(typeof ROLE_DATA)[0]>['columns'] = [
  { key: 'name', title: '角色名称', dataIndex: 'name' },
  { key: 'description', title: '描述', dataIndex: 'description' },
  { key: 'members', title: '关联成员', dataIndex: 'members' },
  {
    key: 'action',
    title: '操作',
    render: () => (
      <span className="flex gap-2">
        <Button variant="text" size="small"><Icon name="edit" /></Button>
        <Button variant="text" size="small"><Icon name="delete" /></Button>
      </span>
    ),
  },
];

export default () => {
  const [tab, setTab] = useState('role');
  const [activeNav, setActiveNav] = useState('首页');

  return (
    <RuyiLayout
      navItems={NAV_ITEMS}
      activeNav={activeNav}
      onNavChange={(nav) => {
        setActiveNav(nav);
        navigateNav(nav);
      }}
      menuItems={MENU_ITEMS}
      defaultMenuKey="role"
      title="权限设置"
    >
      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          { key: 'role', label: '角色列表' },
          { key: 'member', label: '成员列表' },
        ]}
      />
      <div className="flex justify-between my-4">
        <Input placeholder="搜索角色名称" className="w-60" />
        <Button variant="primary">新建角色</Button>
      </div>
      <Table columns={columns} dataSource={ROLE_DATA} />
      <div className="flex justify-end mt-4">
        <Pagination total={30} pageSize={10} current={1} />
      </div>
    </RuyiLayout>
  );
};
