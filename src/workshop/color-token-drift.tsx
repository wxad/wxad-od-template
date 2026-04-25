'use client';

import { Card, RuyiLayout, Table, type RuyiMenuItem, type TableProps } from 'one-design-next';
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
  { key: 'overview', label: '数据总览', icon: 'chart-bar' },
  { key: 'trend', label: '趋势分析', icon: 'trending-up' },
];

const KPI_DATA = [
  { label: '投放花费', value: '¥128,450', color: 'var(--odn-color-primary)' },
  { label: '曝光量', value: '3,456,789', color: 'var(--odn-color-success)' },
  { label: '点击量', value: '89,234', color: 'var(--odn-color-warning)' },
  { label: '转化量', value: '2,345', color: 'var(--odn-color-info)' },
];

const RANK_DATA = [
  { key: '1', rank: 1, name: '618 大促计划', spend: '¥32,100', ctr: '2.58%' },
  { key: '2', rank: 2, name: '品牌曝光计划', spend: '¥28,400', ctr: '1.92%' },
  { key: '3', rank: 3, name: '新品推广计划', spend: '¥15,600', ctr: '3.21%' },
];

const columns: TableProps<(typeof RANK_DATA)[0]>['columns'] = [
  { key: 'rank', title: '排名', dataIndex: 'rank' },
  { key: 'name', title: '计划名称', dataIndex: 'name' },
  { key: 'spend', title: '消耗', dataIndex: 'spend' },
  { key: 'ctr', title: '点击率', dataIndex: 'ctr' },
];

export default () => {
  const [activeNav, setActiveNav] = useState('全域度量');
  return (
    <RuyiLayout
      navItems={NAV_ITEMS}
      activeNav={activeNav}
      onNavChange={(nav) => {
        setActiveNav(nav);
        navigateNav(nav);
      }}
      menuItems={MENU_ITEMS}
      defaultMenuKey="overview"
      title="数据中心"
    >
      <div className="grid grid-cols-4 gap-4 mb-6">
        {KPI_DATA.map((kpi) => (
          <Card key={kpi.label} title={kpi.label} size="small">
            <div className="text-[28px] font-semibold" style={{ color: kpi.color }}>{kpi.value}</div>
          </Card>
        ))}
      </div>
      <Card title="Top 广告计划排行" className="mb-6">
        <Table columns={columns} dataSource={RANK_DATA} />
      </Card>
    </RuyiLayout>
  );
};
