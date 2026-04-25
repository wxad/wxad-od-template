'use client';

import clsx from 'clsx';
import {
  Button,
  Card,
  Icon,
  RuyiLayout,
  Select,
  type RuyiMenuItem,
} from 'one-design-next';
import React, { useState } from 'react';
import MetricsOverview from '../blocks/metrics-overview';
import MindShareDictionary from '../blocks/mindshare-dictionary';
import { RyDateRangePicker } from '../blocks/ry-date-range-picker';

const BRAND_AVATAR =
  'https://wxa.wxs.qq.com/wxad-design/yijie/radar/1776411999700-330b1c2ca96a3403.jpg';

// ─── 导航配置 ──────────────────────────────────────────────

const NAV_ITEMS = ['首页', '洞察诊断', '人群策略', '策略应用', '全域度量', '生意'];

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
  // 替换当前 URL 最后一段为目标 slug，保留 ?fullscreen=1 等查询参数
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
  // 替换当前 URL 最后一段为目标 slug，保留 ?fullscreen=1 等查询参数
  const url = new URL(window.location.href);
  const segments = url.pathname.replace(/\/+$/, '').split('/');
  segments[segments.length - 1] = slug;
  url.pathname = segments.join('/');
  window.location.href = url.toString();
}

// ─── 品牌榜数据 ──────────────────────────────────────────

interface BrandRankItem {
  rank: number;
  name: string;
  avatar: string;
  trend: number;
  barMin: number;
  barMax: number;
  isCurrent?: boolean;
}

const BRAND_RANKING: BrandRankItem[] = [
  {
    rank: 2,
    name: '香奈儿/CHANEL',
    avatar: BRAND_AVATAR,
    trend: 4,
    barMin: 30,
    barMax: 40,
    isCurrent: true,
  },
  {
    rank: 1,
    name: '资生堂/SHISEIDO',
    avatar: BRAND_AVATAR,
    trend: 0,
    barMin: 40,
    barMax: 65,
  },
  {
    rank: 3,
    name: 'PRADA',
    avatar: BRAND_AVATAR,
    trend: 1,
    barMin: 40,
    barMax: 65,
  },
  {
    rank: 4,
    name: '雅诗兰黛/ESTEE LAUDER',
    avatar: BRAND_AVATAR,
    trend: 0,
    barMin: 30,
    barMax: 40,
  },
  {
    rank: 5,
    name: '兰蔻/LANCÔME',
    avatar: BRAND_AVATAR,
    trend: 1,
    barMin: 35,
    barMax: 40,
  },
  {
    rank: 6,
    name: '迪奥/DIOR',
    avatar: BRAND_AVATAR,
    trend: -1,
    barMin: 30,
    barMax: 40,
  },
  {
    rank: 7,
    name: '碧欧泉/BIOTHERM',
    avatar: BRAND_AVATAR,
    trend: 4,
    barMin: 30,
    barMax: 35,
  },
  {
    rank: 8,
    name: '倩碧/CLINIQUE',
    avatar: BRAND_AVATAR,
    trend: -2,
    barMin: 30,
    barMax: 35,
  },
  {
    rank: 9,
    name: "科颜氏/Kiehl's",
    avatar: BRAND_AVATAR,
    trend: 2,
    barMin: 25,
    barMax: 30,
  },
];

function BrandRankingCard() {
  return (
    <Card elevation={0} className="w-[380px] shrink-0">
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-base font-semibold text-black-12">
          心智品牌榜
        </span>
      </div>
      <div className="flex flex-col px-3 pb-3 gap-0.5">
        {BRAND_RANKING.map((item) => (
          <div
            key={item.rank}
            className={clsx(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              item.isCurrent ? 'bg-blue-1' : 'hover:bg-black-2',
            )}
          >
            <span
              className={clsx(
                'w-5 shrink-0 text-center text-sm tabular-nums font-medium',
                item.isCurrent ? 'text-blue-6' : 'text-black-9',
              )}
            >
              {item.rank}
            </span>
            <img
              src={item.avatar}
              alt=""
              className="size-6 rounded-full shrink-0 object-cover"
            />
            <span
              className={clsx(
                'flex-1 min-w-0 text-sm truncate',
                item.isCurrent ? 'text-blue-6 font-medium' : 'text-black-12',
              )}
            >
              {item.name}
            </span>
            {item.trend !== 0 && (
              <span
                className={clsx(
                  'shrink-0 text-xs tabular-nums',
                  item.trend > 0 ? 'text-green-7' : 'text-red-7',
                )}
              >
                {item.trend > 0 ? '↑' : '↓'}
                {Math.abs(item.trend)}
              </span>
            )}
            <div className="w-[100px] shrink-0 h-2 rounded-full bg-black-3 overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full',
                  item.isCurrent ? 'bg-blue-5' : 'bg-blue-4',
                )}
                style={{ width: `${item.barMax}%` }}
              />
            </div>
            <span className="text-[10px] text-black-8 tabular-nums shrink-0 w-[72px]">
              {item.barMin}%-{item.barMax}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── 人群洞察数据 ──────────────────────────────────────────

const CROWD_TAGS = [
  '高学历人群',
  '人事管理类人群',
  '零售/电商',
  '软件/互联网',
  '影游兴趣主播类人群',
  '视频影像兴趣相人群',
  '品科和优质人群',
  '新四方/人群',
  '立新购买/N/C级',
  '运新/AMSC',
];

const RADAR_SEGMENTS = [
  { label: '科技', angle: 0 },
  { label: '社交', angle: 30 },
  { label: '电竞', angle: 60 },
  { label: '旅游', angle: 90 },
  { label: '母婴', angle: 120 },
  { label: '美食', angle: 150 },
  { label: '时尚', angle: 180 },
  { label: '文化', angle: 210 },
  { label: '健康', angle: 240 },
  { label: '潮流', angle: 270 },
  { label: '教育', angle: 300 },
  { label: '理财', angle: 330 },
];

const CROWD_TABS = [
  '人群基础属性',
  '行业买方人群',
  '品牌的核心兴趣',
  '同品类偏好',
  '内容偏好–人文类',
  '浏览入口–公众号',
];

interface ChartBar {
  label: string;
  value: number;
}

const CHART_GROUPS: Record<
  string,
  { title: string; type: 'bar' | 'line'; data: ChartBar[] }[]
> = {
  人群基础属性: [
    {
      title: '性别',
      type: 'bar',
      data: [
        { label: '男性群体', value: 79 },
        { label: '女性群体', value: 21 },
      ],
    },
    {
      title: '年龄',
      type: 'bar',
      data: [
        { label: '18-24', value: 45 },
        { label: '25-29', value: 60 },
        { label: '30-34', value: 40 },
        { label: '35-39', value: 25 },
        { label: '40-49', value: 35 },
        { label: '50+', value: 10 },
      ],
    },
    {
      title: '城市',
      type: 'bar',
      data: [
        { label: '一线', value: 55 },
        { label: '新一线', value: 50 },
        { label: '二线', value: 40 },
        { label: '三线', value: 30 },
        { label: '四线', value: 15 },
        { label: '五线及以下', value: 10 },
      ],
    },
    {
      title: '省份',
      type: 'bar',
      data: [
        { label: '广东', value: 65 },
        { label: '浙江', value: 40 },
        { label: '江苏', value: 35 },
        { label: '北京', value: 30 },
        { label: '上海', value: 25 },
      ],
    },
    {
      title: '客群（购买能力）',
      type: 'line',
      data: [
        { label: 'A类', value: 35 },
        { label: 'B类', value: 55 },
        { label: 'C类', value: 60 },
        { label: 'D类', value: 40 },
        { label: 'E类', value: 20 },
      ],
    },
  ],
};

// ─── 心智人群洞察（暂无对应区块） ─────────────────────────────

function CrowdInsight() {
  const [activeTab, setActiveTab] = useState(CROWD_TABS[0]);
  const charts = CHART_GROUPS[activeTab] ?? CHART_GROUPS['人群基础属性']!;

  const radarRadius = 120;
  const radarCenter = 150;

  return (
    <Card elevation={0}>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-black-12">
            心智人群洞察
          </span>
          <span className="rounded-full bg-black-2 px-2 py-0.5 text-xs text-black-9">
            粉丝洞察
          </span>
          <span className="rounded-full bg-black-2 px-2 py-0.5 text-xs text-black-9">
            渠道本
          </span>
        </div>
      </div>

      <div className="px-6 pb-4">
        <div className="text-sm text-black-11 leading-relaxed">
          <p className="flex flex-wrap gap-1">
            <Icon
              name="zap"
              size={14}
              className="text-blue-6 shrink-0 mt-0.5"
            />
            <span>
              高学历人群、人事管理类人群、零售/电商、软件/互联网、影游兴趣主播类人群、视频影像兴趣相人群、
              品科和优质人群、新四方/人群、立新购买/N/C级、运新/AMSC、管理者
            </span>
          </p>
          <p className="mt-2 text-black-9 text-xs">
            黑钻超级IP 预测品牌P·米潮鞋·特殊爱好 如此 人人通P-女装P·男装 美容
            书角拍照晒图品牌关注 美妆品牌 演绎人格 新时尚可发妆前P·搭配一新
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-black-9">核心关键词：</span>
          {CROWD_TAGS.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blue-1 px-2.5 py-1 text-xs text-blue-6 cursor-pointer hover:bg-blue-2 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-sm text-black-9">所有TAPI关注于</span>
          <span className="text-sm text-black-9">|</span>
          <span className="text-sm text-black-9">成长TAN关注于</span>
        </div>

        <div className="flex justify-center py-6">
          <svg
            width={radarCenter * 2}
            height={radarCenter * 2}
            viewBox={`0 0 ${radarCenter * 2} ${radarCenter * 2}`}
          >
            {[1, 0.75, 0.5, 0.25].map((scale) => (
              <circle
                key={scale}
                cx={radarCenter}
                cy={radarCenter}
                r={radarRadius * scale}
                fill="none"
                stroke="rgba(24,24,24,0.08)"
                strokeWidth={1}
              />
            ))}
            <circle
              cx={radarCenter}
              cy={radarCenter}
              r={radarRadius * 0.3}
              fill="var(--odn-color-blue-2)"
            />
            <text
              x={radarCenter}
              y={radarCenter - 8}
              textAnchor="middle"
              className="text-[11px] font-semibold"
              fill="var(--odn-color-blue-6)"
            >
              年轻科技
            </text>
            <text
              x={radarCenter}
              y={radarCenter + 8}
              textAnchor="middle"
              className="text-[11px] font-semibold"
              fill="var(--odn-color-blue-6)"
            >
              爱好者
            </text>
            {RADAR_SEGMENTS.map((seg) => {
              const rad = (seg.angle - 90) * (Math.PI / 180);
              const x = radarCenter + Math.cos(rad) * (radarRadius + 16);
              const y = radarCenter + Math.sin(rad) * (radarRadius + 16);
              const lx = radarCenter + Math.cos(rad) * radarRadius;
              const ly = radarCenter + Math.sin(rad) * radarRadius;
              return (
                <g key={seg.label}>
                  <line
                    x1={radarCenter}
                    y1={radarCenter}
                    x2={lx}
                    y2={ly}
                    stroke="rgba(24,24,24,0.06)"
                    strokeWidth={1}
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[11px]"
                    fill="#666"
                  >
                    {seg.label}
                  </text>
                </g>
              );
            })}
            <polygon
              points={RADAR_SEGMENTS.map((seg) => {
                const randomR = 0.4 + Math.random() * 0.4;
                const rad = (seg.angle - 90) * (Math.PI / 180);
                const x = radarCenter + Math.cos(rad) * radarRadius * randomR;
                const y = radarCenter + Math.sin(rad) * radarRadius * randomR;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              }).join(' ')}
              fill="rgba(41,107,239,0.1)"
              stroke="var(--odn-color-blue-5)"
              strokeWidth={1.5}
            />
          </svg>
        </div>
      </div>

      <div className="border-t border-black-3">
        <div className="flex gap-0 px-6 pt-3 overflow-x-auto">
          {CROWD_TABS.map((tab) => (
            <button
              key={tab}
              className={clsx(
                'shrink-0 px-4 py-2.5 text-sm rounded-t-lg transition-colors',
                activeTab === tab
                  ? 'text-blue-6 font-medium border-b-2 border-blue-6'
                  : 'text-black-9 hover:text-black-12',
              )}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
          <div className="flex-1" />
          <Button light size="small" icon="download" iconPosition="left">
            下载数据
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4 p-6">
          {charts.map((chart) => (
            <div key={chart.title} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-black-12">
                  {chart.title}
                </span>
              </div>
              {chart.type === 'bar' ? (
                <BarChart data={chart.data} />
              ) : (
                <LineChart data={chart.data} />
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function BarChart({ data }: { data: ChartBar[] }) {
  const maxVal = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-end gap-1 h-[100px]">
        {data.map((d) => (
          <div
            key={d.label}
            className="flex-1 flex flex-col items-center justify-end h-full"
          >
            <div
              className="w-full max-w-[32px] bg-blue-4 hover:bg-blue-5 transition-colors rounded-t-sm"
              style={{ height: `${(d.value / maxVal) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1 text-[10px] text-black-8">
        {data.map((d) => (
          <div key={d.label} className="flex-1 text-center truncate">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ data }: { data: ChartBar[] }) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const w = 200;
  const h = 100;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - (d.value / maxVal) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col gap-1">
      <svg
        width="100%"
        viewBox={`0 0 ${w} ${h + 20}`}
        className="overflow-visible"
      >
        <polyline
          points={points}
          fill="none"
          stroke="#FFAC40"
          strokeWidth={2}
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * w;
          const y = h - (d.value / maxVal) * h;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={3}
              fill="#FFAC40"
              stroke="white"
              strokeWidth={1.5}
            />
          );
        })}
        {data.map((d, i) => (
          <text
            key={i}
            x={(i / (data.length - 1)) * w}
            y={h + 14}
            textAnchor="middle"
            className="text-[10px]"
            fill="#939599"
          >
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ─── 主页面 ──────────────────────────────────────────────

const MindshareDetail = () => {
  const [activeNav, setActiveNav] = useState('洞察诊断');
  const [activeMenu, setActiveMenu] = useState('mindshare-detail');
  const [mindDateRange, setMindDateRange] = useState<[Date, Date]>([
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
      {/* 区块: page-header（模式 3：心智详情） */}
      <div className="rounded-[16px] border border-black-4 bg-white">
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2 px-3">
            <span className="text-lg font-semibold text-black-12">清洗</span>
            <span className="rounded-full bg-black-3 px-2 py-0.5 text-xs text-black-9">
              大品牌心智/流量利用率
            </span>
            <Icon name="sort" size={16} className="text-black-9" />
          </div>
          <div className="flex items-center">
            <Button light icon="user-plus">
              添加人群
            </Button>
            <div className="mx-4 h-4 w-px bg-black-4" />
            <Button light icon="chart">
              统计说明
            </Button>
            <Button light icon="help-circle">
              产品手册
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 border-t border-black-4 px-6 py-4">
          <div className="flex items-center rounded-lg bg-black-4 p-[3px]">
            <button
              type="button"
              className="rounded-[5px] bg-white px-3 py-1 text-sm font-medium text-black-12 shadow-1"
            >
              本行业
            </button>
            <button
              type="button"
              className="rounded-[5px] px-3 py-1 text-sm text-black-9"
            >
              本品牌
            </button>
          </div>
          <RyDateRangePicker
            value={mindDateRange}
            onChange={setMindDateRange}
          />
          <Select
            prefix={<span className="text-black-9">参考系</span>}
            value="product"
            options={[{ label: '竞品均值', value: 'product' }]}
            className="w-[160px]"
          />
        </div>
      </div>

      {/* 区块: metrics-overview + 品牌榜 */}
      <div className="flex gap-4">
        <MetricsOverview />
        <BrandRankingCard />
      </div>

      {/* 区块: mindshare-dictionary */}
      <MindShareDictionary />

      {/* 心智人群洞察（暂无对应区块） */}
      <CrowdInsight />
    </RuyiLayout>
  );
};

export default MindshareDetail;
