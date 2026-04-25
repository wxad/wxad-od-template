'use client';

import {
  Button,
  Card,
  HoverFill,
  Icon,
  RuyiLayout,
  ScrollArea,
  Select,
  type RuyiMenuItem,
} from 'one-design-next';
import React, { useState } from 'react';
import { RyDateRangePicker } from '../blocks/ry-date-range-picker';
const BRAND_AVATAR =
  'https://wxa.wxs.qq.com/wxad-design/yijie/radar/1776411999700-330b1c2ca96a3403.jpg';

// ─── 导航配置 ──────────────────────────────────────────────

const NAV_ITEMS = ['首页', '洞察诊断', '人群策略', '策略应用', '全域度量'];

// 洞察诊断菜单（本文件独立维护，不与其他 workshop 页面共享）
const MENU_ITEMS: RuyiMenuItem[] = [
  {
    key: 'market',
    label: '市场洞察',
    icon: 'search',
    children: [
      { key: 'compete-analysis', label: '竞争格局' },
      { key: 'search-insight', label: '搜索洞察' },
      { key: 'regional-insight', label: '区域洞察' },
    ],
  },
  {
    key: 'brand-asset',
    label: '品牌资产',
    icon: 'shield',
    children: [
      { key: 'brand-crowd-asset', label: '品牌人群资产' },
      { key: 'spu-crowd-asset', label: '商品人群资产' },
      { key: 'brand-asset-flow', label: '品牌资产流转' },
      { key: 'inner-spread', label: '域内传播' },
      { key: 'outer-spread', label: '域外扩散' },
    ],
  },
  {
    key: 'brand-mind',
    label: '品牌心智',
    icon: 'star',
    children: [
      { key: 'brand-mind-dashboard', label: '品牌心智度量' },
      { key: 'industry-opportunity-mind', label: '行业机会心智' },
    ],
  },
];

// 菜单 key → workshop 页面 slug（相对当前页面跳转：本地开发跳本地、发布环境跳发布）
const MENU_ROUTES: Record<string, string> = {
  'compete-analysis': 'compete-analysis',
  'search-insight': 'mind',
  'regional-insight': 'regional-insight',
  'brand-crowd-asset': 'brand5r',
  'spu-crowd-asset': 'spu-audience-asset',
  'brand-asset-flow': 'asset-flow',
  'inner-spread': 'content-asset',
  'outer-spread': 'outside',
  'brand-mind-dashboard': 'brand-mind-dashboard',
  'industry-opportunity-mind': 'industry-opportunity-mind',
};

function navigateMenu(key: string) {
  const slug = MENU_ROUTES[key];
  if (!slug || typeof window === 'undefined') return;
  // 替换当前 URL 最后一段为目标 slug：
  //   模板本地  http://localhost:5173/brand5r
  //   文档站    https://od-next.pages.woa.com/workshop/brand5r
  // 都能正确跳到同级页面，并保留 ?fullscreen=1 等查询参数。
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

// ─── 品牌心智榜数据 ──────────────────────────────────────────

interface BrandItem {
  rank: number;
  name: string;
  avatar: string;
  trend: number;
  value: string;
}

const BRAND_DATA: BrandItem[] = [
  {
    rank: 3,
    name: '香奈儿 CHANEL',
    avatar: BRAND_AVATAR,
    trend: 4,
    value: '35%-40%',
  },
  {
    rank: 1,
    name: '资生堂 SHISEIDO',
    avatar: BRAND_AVATAR,
    trend: 4,
    value: '40%-45%',
  },
  { rank: 2, name: 'SKII', avatar: BRAND_AVATAR, trend: 4, value: '40%-45%' },
  {
    rank: 4,
    name: '雅诗兰黛 ESTEE LAUDER',
    avatar: BRAND_AVATAR,
    trend: 4,
    value: '35%-40%',
  },
  {
    rank: 5,
    name: '兰蔻 LANCOME',
    avatar: BRAND_AVATAR,
    trend: 4,
    value: '35%-40%',
  },
  {
    rank: 6,
    name: '迪奥 DIOR',
    avatar: BRAND_AVATAR,
    trend: 4,
    value: '30%-35%',
  },
  {
    rank: 7,
    name: '碧欧泉 BIOTHERM',
    avatar: BRAND_AVATAR,
    trend: 4,
    value: '30%-35%',
  },
  { rank: 8, name: '倩碧', avatar: BRAND_AVATAR, trend: 4, value: '30%-35%' },
  {
    rank: 9,
    name: "科颜氏 Kiehl's",
    avatar: BRAND_AVATAR,
    trend: 4,
    value: '25%-30%',
  },
  {
    rank: 10,
    name: '海蓝之谜 LA MER',
    avatar: BRAND_AVATAR,
    trend: 4,
    value: '25%-30%',
  },
  {
    rank: 11,
    name: '欧莱雅 LOREAL',
    avatar: BRAND_AVATAR,
    trend: 4,
    value: '25%-30%',
  },
];

// ─── 热门心智榜数据 ──────────────────────────────────────────

interface MindshareItem {
  rank: number;
  name: string;
  tag: string;
  volume: string;
}

const HOT_DATA: MindshareItem[] = [
  { rank: 1, name: '杏仁酸', tag: '心智分类标签', volume: '6,324,914' },
  { rank: 2, name: '抛光', tag: '心智分类标签', volume: '5,324,914' },
  { rank: 3, name: '保湿', tag: '心智分类标签', volume: '4,324,914' },
  { rank: 4, name: '白泥膜', tag: '心智分类标签', volume: '4,124,914' },
  { rank: 5, name: '清洁', tag: '心智分类标签', volume: '3,924,914' },
  { rank: 6, name: '金盏花', tag: '心智分类标签', volume: '3,824,914' },
  { rank: 7, name: '爽肤', tag: '心智分类标签', volume: '3,624,914' },
  { rank: 8, name: '淡斑', tag: '心智分类标签', volume: '3,324,914' },
  { rank: 9, name: '湿敷', tag: '心智分类标签', volume: '3,124,914' },
  { rank: 10, name: '清洁', tag: '心智分类标签', volume: '2,124,914' },
];

// ─── 心智飙升榜数据 ──────────────────────────────────────────

interface SurgeItem {
  rank: number;
  name: string;
  tag: string;
  volume: string;
  value: string;
}

const SURGE_DATA: SurgeItem[] = [
  {
    rank: 1,
    name: '清洁',
    tag: '心智分类标签',
    volume: '6,324,914',
    value: '488.88%',
  },
  {
    rank: 2,
    name: '提亮',
    tag: '心智分类标签',
    volume: '6,324,914',
    value: '388.88%',
  },
  {
    rank: 3,
    name: '三修',
    tag: '心智分类标签',
    volume: '6,324,914',
    value: '288.88%',
  },
  {
    rank: 4,
    name: '焕亮',
    tag: '增长心智',
    volume: '6,324,914',
    value: '188.88%',
  },
  {
    rank: 5,
    name: '复合酸',
    tag: '心智分类标签',
    volume: '6,324,914',
    value: '88.88%',
  },
  {
    rank: 6,
    name: '控油',
    tag: '心智分类标签',
    volume: '6,324,914',
    value: '66.66%',
  },
  {
    rank: 7,
    name: 'PDRN',
    tag: '心智分类标签',
    volume: '6,324,914',
    value: '55.55%',
  },
  {
    rank: 8,
    name: '次抛',
    tag: '心智分类标签',
    volume: '6,324,914',
    value: '44.44%',
  },
  {
    rank: 9,
    name: '小样',
    tag: '增长心智',
    volume: '6,324,914',
    value: '33.33%',
  },
  {
    rank: 10,
    name: '透亮',
    tag: '心智分类标签',
    volume: '6,324,914',
    value: '22.22%',
  },
];

// ─── 趋势箭头（对齐 ranking-list） ──────────────────────────────
function TrendArrow({ trend }: { trend: number }) {
  if (trend === 0) return <span className="w-4" />;
  const isUp = trend > 0;
  return (
    <span
      className={`flex items-center text-sm ${isUp ? 'text-green-6' : 'text-red-6'}`}
    >
      <Icon name={isUp ? 'arrow-up' : 'arrow-down'} source="lucide" size={14} />
      {Math.abs(trend)}
    </span>
  );
}

const rankingCardFillClassName =
  'flex min-h-0 w-full min-w-0 flex-1 flex-col [--odn-card-radius:12px] h-full';

const rankingTitle = (text: string) => (
  <span className="border-b border-dashed border-black-12 text-base font-semibold text-black-12">
    {text}
  </span>
);

const MINDSHARE_SCOPE_OPTIONS = [
  { value: 'all', label: '全部心智' },
  { value: 'category', label: '按心智分类' },
];

function RankingMindshareSelect() {
  const [value, setValue] = useState('all');
  return (
    <Select
      prefix="范围"
      value={value}
      options={MINDSHARE_SCOPE_OPTIONS}
      onChange={(v) => setValue(String(v ?? 'all'))}
    />
  );
}

// ─── 品牌心智榜（对齐 ranking-list BrandRanking） ──────────────
function BrandRanking() {
  return (
    <Card elevation={0} className={`${rankingCardFillClassName} max-h-[656px]`}>
      <Card.Header
        title={rankingTitle('品牌心智榜')}
        className="h-15 border-b border-black-4"
        style={{ '--odn-card-title-font-size': '16px' } as React.CSSProperties}
      />
      <ScrollArea className="min-h-0 w-full flex-1">
        <div className="flex flex-col gap-3 p-3">
          {BRAND_DATA.map((item, i) => (
            <React.Fragment key={`${item.rank}-${item.name}`}>
              <HoverFill
                className="w-full rounded-[6px]"
                bgClassName="rounded-[6px]"
              >
                <div className="flex items-center gap-1 px-3 py-2">
                  <span className="w-[26px] shrink-0 text-sm text-black-9">
                    {item.rank}
                  </span>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="size-6 shrink-0 rounded border border-black-3 object-cover"
                    />
                    <div className="flex min-w-0 items-center">
                      <span className="truncate text-sm text-black-12">
                        {item.name}
                      </span>
                      <TrendArrow trend={item.trend} />
                    </div>
                  </div>
                  <span className="shrink-0 text-base text-black-12">
                    {item.value}
                  </span>
                </div>
              </HoverFill>
              {i === 0 && (
                <div className="px-3">
                  <div className="h-px bg-black-5" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}

// ─── 热门心智榜（对齐 ranking-list HotMindshareRanking） ──────
function HotMindshareRanking() {
  return (
    <Card elevation={0} className={rankingCardFillClassName}>
      <Card.Header
        title={rankingTitle('热门心智榜')}
        topContent={<RankingMindshareSelect />}
        className="h-15 border-b border-black-4"
        style={{ '--odn-card-title-font-size': '16px' } as React.CSSProperties}
      />
      <ScrollArea className="min-h-0 w-full flex-1">
        <div className="flex flex-col gap-2 p-3">
          {HOT_DATA.map((item) => (
            <HoverFill
              key={`${item.rank}-${item.name}-${item.volume}`}
              className="w-full rounded-[6px]"
              bgClassName="rounded-[6px]"
            >
              <div className="flex items-center gap-1 px-3 py-1">
                <span className="w-[26px] shrink-0 text-sm text-black-9">
                  {item.rank}
                </span>
                <div className="min-w-0 flex flex-1 flex-col justify-center">
                  <div className="flex items-center gap-1">
                    <span className="min-w-0 truncate text-sm text-black-12">
                      {item.name}
                    </span>
                    <span className="flex h-5 items-center rounded-full bg-black-2 px-2 text-[8px] text-black-10 whitespace-nowrap">
                      {item.tag}
                    </span>
                  </div>
                  <span className="truncate text-xs text-black-10">
                    TOP3 品牌：Freeplus、韩束、谷雨
                  </span>
                </div>
                <span className="shrink-0 text-base text-black-12">
                  {item.volume}
                </span>
              </div>
            </HoverFill>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}

// ─── 心智飙升榜（对齐 ranking-list SurgeRanking） ──────────────
function SurgeRanking() {
  return (
    <Card elevation={0} className={rankingCardFillClassName}>
      <Card.Header
        title={rankingTitle('心智飙升榜')}
        topContent={<RankingMindshareSelect />}
        className="h-15 border-b border-black-4"
        style={{ '--odn-card-title-font-size': '16px' } as React.CSSProperties}
      />
      <ScrollArea className="min-h-0 w-full flex-1">
        <div className="flex flex-col gap-2 p-3">
          {SURGE_DATA.map((item) => (
            <HoverFill
              key={`${item.rank}-${item.name}-${item.value}`}
              className="w-full rounded-[6px]"
              bgClassName="rounded-[6px]"
            >
              <div className="flex items-center gap-1 px-3 py-1">
                <span className="w-[26px] shrink-0 text-sm text-black-9">
                  {item.rank}
                </span>
                <div className="min-w-0 flex flex-1 flex-col justify-center">
                  <div className="flex items-center gap-1">
                    <span className="min-w-0 truncate text-sm text-black-12">
                      {item.name}
                    </span>
                    <span className="flex h-5 items-center rounded-full bg-black-2 px-2 text-[8px] text-black-10 whitespace-nowrap">
                      {item.tag}
                    </span>
                  </div>
                  <span className="truncate text-xs text-black-10">
                    增长心智量：{item.volume}
                  </span>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-base text-black-12">
                  <span className="text-green-6">
                    <Icon name="arrow-up" source="lucide" size={18} />
                  </span>
                  {item.value}
                </span>
              </div>
            </HoverFill>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}

// ─── 主页面 ──────────────────────────────────────────────

const IndustryMindshare = () => {
  const [activeNav, setActiveNav] = useState('洞察诊断');
  const [activeMenu, setActiveMenu] = useState('industry-opportunity-mind');
  const [industryDateRange, setIndustryDateRange] = useState<[Date, Date]>([
    new Date('2025-09-17'),
    new Date('2025-10-17'),
  ]);

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
      accountName="香奈儿/CHANEL – 美妆护肤"
      accountId="28392034"
      collapsible
      contentClassName="flex flex-col gap-4"
      headerRight={
        <>
          <div className="flex items-center gap-1.5 h-10 px-4 border border-black-6 rounded-full text-sm cursor-pointer">
            <Icon name="users" size={16} />
            <span className="text-black-11">人群夹</span>
            <span className="font-semibold tabular-nums">10</span>
          </div>
          <div className="ml-3 flex items-center">
            <Button light icon="bell" />
            <Button light icon="help-circle" />
            <Button light icon="setting" />
          </div>
        </>
      }
    >
      {/* 来源区块：page-header（模式 2：行业机会心智） */}
      <div className="rounded-[12px] border border-black-4 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-semibold text-black-12">行业机会心智</h2>
          <div className="flex items-center gap-2">
            <Button light icon="chart">
              统计说明
            </Button>
            <Button light icon="help-circle">
              产品手册
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-black-4 px-6 py-3">
          <RyDateRangePicker
            value={industryDateRange}
            onChange={setIndustryDateRange}
            triggerWidth="276px"
          />
        </div>
      </div>

      <div className="flex h-[656px] gap-4">
        <BrandRanking />
        <HotMindshareRanking />
        <SurgeRanking />
      </div>
    </RuyiLayout>
  );
};

export default IndustryMindshare;
