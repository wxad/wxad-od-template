'use client';

import {
  Button,
  Icon,
  RuyiLayout,
  Select,
  Tooltip,
  type RuyiMenuItem,
} from 'one-design-next';
// @ts-ignore
import EChartsReact from 'echarts-for-react';
import React, { useMemo, useState } from 'react';

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

const CROWD_ASSET_OPTIONS = [
  { label: '店铺5R总资产', value: '5r-total' },
  { label: '店铺R1人群', value: 'r1' },
  { label: '店铺R2人群', value: 'r2' },
  { label: '店铺R3人群', value: 'r3' },
  { label: '店铺R4人群', value: 'r4' },
  { label: '店铺R5人群', value: 'r5' },
];

interface ProfileCard {
  title: string;
  categories: string[];
  self: number[];
  benchmark: number[];
  tgi: number[];
}

const PROFILE_CARDS: ProfileCard[] = [
  { title: '性别', categories: ['男', '女'], self: [42.3, 57.7], benchmark: [48.1, 51.9], tgi: [88, 112] },
  { title: '年龄', categories: ['18-24', '25-29', '30-34', '35-39', '40-49', '50+'], self: [8.2, 22.5, 28.1, 18.6, 15.3, 7.3], benchmark: [12.1, 18.3, 20.5, 19.2, 17.8, 12.1], tgi: [68, 123, 137, 97, 86, 60] },
  { title: '城市等级', categories: ['一线城市', '新一线', '二线', '三线', '四线', '五线'], self: [28.5, 24.2, 18.6, 14.3, 9.2, 5.2], benchmark: [18.2, 20.5, 19.8, 17.6, 13.5, 10.4], tgi: [157, 118, 94, 81, 68, 50] },
  { title: '消费能力', categories: ['高', '中高', '中', '中低', '低'], self: [15.8, 28.3, 32.1, 16.5, 7.3], benchmark: [10.2, 22.1, 30.5, 22.8, 14.4], tgi: [155, 128, 105, 72, 51] },
  { title: '行业偏好', categories: ['美妆护肤', '食品饮料', '服饰鞋包', '3C数码', '家居日用', '母婴'], self: [18.5, 15.2, 14.8, 12.3, 10.5, 8.7], benchmark: [12.3, 14.8, 13.2, 10.5, 12.8, 9.2], tgi: [150, 103, 112, 117, 82, 95] },
  { title: '媒体偏好', categories: ['微信', '腾讯视频', 'QQ', '腾讯新闻', '小程序', '搜一搜'], self: [35.2, 18.5, 12.3, 10.8, 15.2, 8.0], benchmark: [30.1, 15.2, 14.8, 12.5, 10.2, 7.2], tgi: [117, 122, 83, 86, 149, 111] },
];

// ─── 画像卡片 ──────────────────────────────────────────────

function ProfileCardChart({ card }: { card: ProfileCard }) {
  const chartOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#fff',
        borderColor: '#e5e6eb',
        borderWidth: 1,
        textStyle: { color: '#313233', fontSize: 12 },
      },
      legend: {
        data: ['本品人群占比', '大盘人群占比', 'TGI'],
        top: 0,
        itemWidth: 12,
        itemHeight: 8,
        textStyle: { fontSize: 12, color: '#646566' },
      },
      grid: { top: 36, left: 12, right: 48, bottom: 8, containLabel: true },
      xAxis: {
        type: 'value',
        max: 60,
        axisLabel: {
          color: '#898b8f',
          fontSize: 11,
          formatter: (v: number) => `${v}%`,
        },
        splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' as const } },
      },
      yAxis: {
        type: 'category',
        data: card.categories,
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#313233', fontSize: 12 },
      },
      series: [
        {
          name: '本品人群占比',
          type: 'bar',
          data: card.self,
          barWidth: 8,
          barGap: '30%',
          itemStyle: { color: '#3B82F6', borderRadius: [0, 4, 4, 0] },
        },
        {
          name: '大盘人群占比',
          type: 'bar',
          data: card.benchmark,
          barWidth: 8,
          itemStyle: { color: '#E5E7EB', borderRadius: [0, 4, 4, 0] },
        },
        {
          name: 'TGI',
          type: 'line',
          yAxisIndex: 0,
          data: card.tgi,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#FCB04C' },
          lineStyle: { width: 2, color: '#FCB04C' },
          // use a secondary xAxis for TGI so it doesn't share percentage scale
          xAxisIndex: 1,
        },
      ],
      // secondary xAxis for TGI (hidden)
    }),
    [card],
  );

  // Build a proper dual-axis option
  const dualOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis' as const,
        axisPointer: { type: 'shadow' as const },
        backgroundColor: '#fff',
        borderColor: '#e5e6eb',
        borderWidth: 1,
        textStyle: { color: '#313233', fontSize: 12 },
        formatter: (params: any) => {
          const cat = params[0]?.axisValue;
          const rows = params
            .map(
              (p: any) =>
                `<div style="display:flex;align-items:center;gap:8px;margin-top:4px"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${p.color}"></span><span>${p.seriesName}</span><span style="font-weight:600;margin-left:auto">${p.seriesName === 'TGI' ? p.value : p.value + '%'}</span></div>`,
            )
            .join('');
          return `<div><div style="font-weight:600;margin-bottom:4px">${cat}</div>${rows}</div>`;
        },
      },
      legend: {
        data: ['本品人群占比', '大盘人群占比', 'TGI'],
        top: 0,
        itemWidth: 12,
        itemHeight: 8,
        textStyle: { fontSize: 12, color: '#646566' },
      },
      grid: { top: 36, left: 12, right: 48, bottom: 8, containLabel: true },
      xAxis: [
        {
          type: 'value' as const,
          max: 60,
          axisLabel: {
            color: '#898b8f',
            fontSize: 11,
            formatter: (v: number) => `${v}%`,
          },
          splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' as const } },
        },
        {
          // secondary xAxis for TGI
          type: 'value' as const,
          max: 200,
          show: false,
        },
      ],
      yAxis: {
        type: 'category' as const,
        data: card.categories,
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#313233', fontSize: 12 },
      },
      series: [
        {
          name: '本品人群占比',
          type: 'bar',
          data: card.self,
          barWidth: 8,
          barGap: '30%',
          itemStyle: { color: '#3B82F6', borderRadius: [0, 4, 4, 0] },
        },
        {
          name: '大盘人群占比',
          type: 'bar',
          data: card.benchmark,
          barWidth: 8,
          itemStyle: { color: '#E5E7EB', borderRadius: [0, 4, 4, 0] },
        },
        {
          name: 'TGI',
          type: 'line',
          data: card.tgi,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#FCB04C' },
          lineStyle: { width: 2, color: '#FCB04C' },
          xAxisIndex: 1,
        },
      ],
    }),
    [card],
  );

  const height = Math.max(200, card.categories.length * 48 + 60);

  return (
    <EChartsReact
      style={{ height, width: '100%' }}
      option={dualOption}
    />
  );
}

// ─── 筛选栏 ─────────────────────────────────────────────────

function ProfileFilterSection() {
  const [store, setStore] = useState('store-1');
  const [crowdAsset, setCrowdAsset] = useState('5r-total');

  return (
    <div className="flex items-center gap-3 border-t border-black-4 px-6 py-3">
      <Select
        prefix={<span className="text-[var(--odn-color-black-9)]">店铺</span>}
        value={store}
        onChange={(v) => setStore(v as string)}
        options={STORE_OPTIONS}
        allowClear={false}
        showSearch
      />

      <Select
        prefix={<span className="text-[var(--odn-color-black-9)]">人群资产</span>}
        value={crowdAsset}
        onChange={(v) => setCrowdAsset(v as string)}
        options={CROWD_ASSET_OPTIONS}
        allowClear={false}
      />

      <div className="ml-auto flex items-center gap-1 text-sm text-black-9">
        <span>报告更新时间：2026-04-18</span>
        <Tooltip content="报告数据每周一更新">
          <Icon name="help-circle" size={14} className="cursor-pointer text-black-6" />
        </Tooltip>
      </div>
    </div>
  );
}

// ─── 主页面 ──────────────────────────────────────────────────

const StoreAssetProfilePage = () => {
  const [activeNav, setActiveNav] = useState('生意');
  const [activeMenu, setActiveMenu] = useState('store-asset-profile');

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
          <h2 className="text-lg font-semibold text-black-12">资产画像分析</h2>
          <div className="flex items-center gap-2">
            <Button light icon="download-1">
              下载数据
            </Button>
            <Button light icon="book">
              产品手册
            </Button>
          </div>
        </div>
        <ProfileFilterSection />
      </div>

      {/* ═══ 2. 画像卡片网格 ═══ */}
      <div className="grid grid-cols-2 gap-4">
        {PROFILE_CARDS.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-black-4 bg-white p-6"
          >
            <h3 className="mb-4 text-base font-semibold text-black-12">
              {card.title}
            </h3>
            <ProfileCardChart card={card} />
          </div>
        ))}
      </div>

      {/* ═══ 3. 底部提示 ═══ */}
      <div className="py-4 text-center text-sm text-black-9">
        自定义分析更多人群与维度，可
        <span className="cursor-pointer text-[#296BEF]">前往人群洞察</span>
      </div>
    </RuyiLayout>
  );
};

export default StoreAssetProfilePage;
