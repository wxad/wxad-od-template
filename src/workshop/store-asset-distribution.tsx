'use client';

import {
  Button,
  Cascader,
  DatePicker,
  Icon,
  RuyiLayout,
  Select,
  type RuyiMenuItem,
} from 'one-design-next';
// @ts-ignore
import EChartsReact from 'echarts-for-react';
import React, { useMemo, useState } from 'react';
import { CrowdAssetOverviewCard } from '../blocks/metric-card-group';
import { TouchpointAnalysis } from '../blocks/touchpoint-analysis';

// ─── 导航配置 ──────────────────────────────────────────────

const NAV_ITEMS = [
  '首页',
  '洞察诊断',
  '人群策略',
  '策略应用',
  '全域度量',
  '生意',
];

const MENU_ITEMS: RuyiMenuItem[] = [
  {
    key: 'wx-store',
    label: '微信小店',
    icon: 'shield',
    children: [
      { key: 'store-asset-distribution', label: '资产分布' },
      { key: 'store-asset-conversion', label: '资产流转' },
      { key: 'store-asset-profile', label: '资产画像' },
    ],
  },
];

// 菜单 key → workshop 页面 slug（相对当前页面跳转：本地开发跳本地、发布环境跳发布）
const MENU_ROUTES: Record<string, string> = {
  'store-asset-distribution': 'store-asset-distribution',
  'store-asset-conversion': 'store-asset-conversion',
  'store-asset-profile': 'store-asset-profile',
};

function navigateMenu(key: string) {
  const slug = MENU_ROUTES[key];
  if (!slug || typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const segments = url.pathname.replace(/\/+$/, '').split('/');
  segments[segments.length - 1] = slug;
  url.pathname = segments.join('/');
  window.location.href = url.toString();
}

// 顶栏 label → workshop 页面 slug（本文件独立维护，不与其他 workshop 页面共享）
const NAV_ROUTES: Record<string, string> = {
  首页: 'home',
  洞察诊断: 'compete-analysis',
  人群策略: 'r-zero-crowd',
  策略应用: 'insight-ip',
  全域度量: 'review',
  生意: 'store-asset-distribution',
};

function navigateNav(label: string) {
  const slug = NAV_ROUTES[label];
  if (!slug || typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const segments = url.pathname.replace(/\/+$/, '').split('/');
  segments[segments.length - 1] = slug;
  url.pathname = segments.join('/');
  window.location.href = url.toString();
}

// ─── Mock 数据 ─────────────────────────────────────────────

const STORE_OPTIONS = [
  { label: '腾讯科技官方旗舰店', value: 'store-1' },
  { label: '腾讯数码专营店', value: 'store-2' },
  { label: '腾讯智能生活馆', value: 'store-3' },
];

const COMPARE_OPTIONS = [
  {
    label: '类目均值',
    value: 'category-avg',
    children: [
      { label: '食品饮料', value: 'category-avg-food' },
      { label: '3C数码', value: 'category-avg-3c' },
    ],
  },
  {
    label: '类目Top5均值',
    value: 'category-top5',
    children: [
      { label: '食品饮料', value: 'category-top5-food' },
      { label: '3C数码', value: 'category-top5-3c' },
    ],
  },
  {
    label: '对比店铺均值',
    value: 'compare-store',
    children: [
      { label: '食品饮料', value: 'compare-store-food' },
      { label: '3C数码', value: 'compare-store-3c' },
    ],
  },
];

const TREND_DATES = [
  '04-14',
  '04-15',
  '04-16',
  '04-17',
  '04-18',
  '04-19',
  '04-20',
];
const TREND_BRAND = [125600, 128900, 131200, 127800, 135400, 138100, 142300];
const TREND_BENCHMARK = [98200, 99100, 97800, 100500, 101200, 99800, 102400];

const TIME_RANGE_OPTIONS = [
  { label: '近7天', value: '7d' },
  { label: '近1个月', value: '1m' },
  { label: '近3个月', value: '3m' },
];

// ─── 趋势折线图 ────────────────────────────────────────────

function AssetTrendChart() {
  const [timeRange, setTimeRange] = useState('7d');

  const chartOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderColor: '#e5e6eb',
        borderWidth: 1,
        textStyle: { color: '#313233', fontSize: 12 },
        formatter: (params: any) => {
          const date = params[0]?.axisValue;
          const rows = params
            .map(
              (p: any) =>
                `<div style="display:flex;align-items:center;gap:8px;margin-top:4px"><span style="display:inline-block;width:8px;height:2px;border-radius:1px;background:${p.color}"></span><span>${p.seriesName}</span><span style="font-weight:600;margin-left:auto">${Number(p.value).toLocaleString()}</span></div>`,
            )
            .join('');
          return `<div><div style="font-weight:600;margin-bottom:4px">${date}</div>${rows}</div>`;
        },
      },
      legend: {
        data: ['资产人数', '类目均值'],
        bottom: 0,
        itemWidth: 12,
        itemHeight: 2,
        textStyle: { fontSize: 12, color: '#646566' },
      },
      grid: { top: 16, left: 12, right: 12, bottom: 36, containLabel: true },
      xAxis: {
        type: 'category',
        data: TREND_DATES,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#e5e6eb' } },
        axisTick: { show: false },
        axisLabel: { color: '#898b8f', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
        axisLabel: {
          color: '#898b8f',
          fontSize: 11,
          formatter: (v: number) =>
            v >= 10000 ? `${(v / 10000).toFixed(0)}万` : String(v),
        },
      },
      series: [
        {
          name: '资产人数',
          type: 'line',
          data: TREND_BRAND,
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          showSymbol: false,
          itemStyle: { color: '#296BEF' },
          lineStyle: { width: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(41, 107, 239, 0.15)' },
                { offset: 1, color: 'rgba(41, 107, 239, 0.01)' },
              ],
            },
          },
        },
        {
          name: '类目均值',
          type: 'line',
          data: TREND_BENCHMARK,
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          showSymbol: false,
          itemStyle: { color: '#FCB04C' },
          lineStyle: { width: 2 },
        },
      ],
    }),
    [],
  );

  return (
    <div className="flex w-[480px] shrink-0 flex-col rounded-xl bg-white">
      <div className="flex h-16 items-center justify-between border-b border-[#e5e6eb] px-6">
        <span className="text-base font-semibold text-[#0d0d0d]">
          资产人数趋势
        </span>
        <Select
          prefix={
            <span className="text-[var(--odn-color-black-9)]">时间范围</span>
          }
          value={timeRange}
          onChange={(v) => setTimeRange(v as string)}
          options={TIME_RANGE_OPTIONS}
        />
      </div>
      <div className="flex-1 px-6 py-4">
        <EChartsReact
          style={{ height: 340, width: '100%' }}
          option={chartOption}
        />
      </div>
    </div>
  );
}

// ─── 筛选栏 ─────────────────────────────────────────────────

function StoreFilterSection() {
  const [filterType, setFilterType] = useState<'store' | 'product'>('store');
  const [store, setStore] = useState('store-1');
  const [comparePath, setComparePath] = useState<string[]>([
    'category-avg',
    'category-avg-food',
  ]);

  return (
    <div className="flex items-center gap-3 border-t border-black-4 px-6 py-3">
      {/* 店铺 / 商品切换 */}
      <div className="flex shrink-0 items-center rounded-lg bg-black-2 p-[3px]">
        <button
          type="button"
          className={`rounded-md px-3 py-1 text-sm transition-colors ${
            filterType === 'store'
              ? 'bg-white font-medium text-black-12 shadow-sm'
              : 'text-black-9 hover:text-black-11'
          }`}
          onClick={() => setFilterType('store')}
        >
          店铺
        </button>
        <button
          type="button"
          className={`rounded-md px-3 py-1 text-sm transition-colors ${
            filterType === 'product'
              ? 'bg-white font-medium text-black-12 shadow-sm'
              : 'text-black-9 hover:text-black-11'
          }`}
          onClick={() => setFilterType('product')}
        >
          商品
        </button>
      </div>

      <Select
        prefix={<span className="text-[var(--odn-color-black-9)]">店铺</span>}
        value={store}
        onChange={(v) => setStore(v as string)}
        options={STORE_OPTIONS}
        allowClear={false}
        showSearch
      />

      <DatePicker
        prefix={<span className="text-[var(--odn-color-black-9)]">日期</span>}
        value={new Date('2026-04-20')}
        className="w-[200px]"
      />

      <Cascader
        prefix={<span className="text-[var(--odn-color-black-9)]">对比模式</span>}
        options={COMPARE_OPTIONS}
        value={comparePath}
        onChange={(val) => setComparePath(val as string[])}
      />
    </div>
  );
}

// ─── 主页面 ──────────────────────────────────────────────────

const StoreAssetDistributionPage = () => {
  const [activeNav, setActiveNav] = useState('生意');
  const [activeMenu, setActiveMenu] = useState('store-asset-distribution');

  return (
    <RuyiLayout
      navItems={NAV_ITEMS}
      activeNav={activeNav}
      onNavChange={(nav) => {
        setActiveNav(nav);
        navigateNav(nav);
      }}
      menuItems={MENU_ITEMS}
      activeMenu={activeMenu}
      onMenuChange={(key) => {
        setActiveMenu(key);
        navigateMenu(key);
      }}
      accountName="腾讯科技官方旗舰店"
      accountId="10086420"
      collapsible
      contentClassName="flex flex-col gap-4"
      headerRight={
        <>
          <div className="flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-black-6 px-4 text-sm">
            <Icon name="user-pack" size={16} />
            <span className="text-black-11">人群夹</span>
          </div>
          <div className="ml-3 flex items-center">
            <Button light icon="bell" />
            <Button light icon="help-circle" />
            <Button light icon="setting" />
          </div>
        </>
      }
    >
      {/* ═══ 1. 页面标题 + 筛选栏 ═══ */}
      <div className="rounded-[12px] border border-black-4 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-semibold text-black-12">人群资产分布</h2>
          <div className="flex items-center gap-2">
            <Button light icon="user-pack">
              添加人群
            </Button>
            <Button light icon="download-1">
              下载数据
            </Button>
            <Button light icon="book">
              产品手册
            </Button>
          </div>
        </div>
        <StoreFilterSection />
      </div>

      {/* ═══ 2. 资产概览 ═══ */}
      <CrowdAssetOverviewCard showRankings={false} />

      {/* ═══ 3. 资产人数趋势 + 触点分析 ═══ */}
      <div className="flex gap-4">
        <AssetTrendChart />
        <div className="min-w-0 flex-1">
          <TouchpointAnalysis />
        </div>
      </div>
    </RuyiLayout>
  );
};

export default StoreAssetDistributionPage;
