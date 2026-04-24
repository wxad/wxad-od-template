'use client';

import clsx from 'clsx';
import {
  Button,
  Card,
  DateRangePicker,
  Icon,
  RuyiLayout,
  Select,
  Tooltip,
  type RuyiMenuItem,
} from 'one-design-next';
// @ts-ignore
import EChartsReact from 'echarts-for-react';
import React, { useMemo, useState } from 'react';
import PenetrationAnalysisBlock from '../../../../skills/p2-block-catalog/references/penetration-analysis';

type MetricItem = {
  label: string;
  value: string;
  unit: string;
  color?: string;
  comparison: string;
  percentage: string;
};

type RankingItem = {
  rank: number;
  name: string;
  trend: number;
  isCurrent?: boolean;
};

type ProductDot = {
  name: string;
  x: number;
  y: number;
  assetRank: number;
  r3Rank: number;
  quadrant: 0 | 1 | 2 | 3;
  labelSide?: 'left' | 'right';
};

const NAV_ITEMS = ['首页', '洞察诊断', '人群策略', '策略应用', '全域度量'];

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

const R_COLORS = {
  total: 'var(--odn-color-black-12)',
  r1: '#296BEF',
  r2: '#35AFFF',
  r3: '#00C7BE',
  r4: '#95D609',
  r5: '#FFC300',
};

const METRICS: MetricItem[] = [
  {
    label: '人群总资产',
    value: '89,267,538',
    unit: '人',
    comparison: '超过 同类目-TOP5商品均值',
    percentage: '409.88%',
  },
  {
    label: 'R1 触达',
    value: '48,044,892',
    unit: '人',
    color: R_COLORS.r1,
    comparison: '超过 同类目-TOP5商品均值',
    percentage: '409.88%',
  },
  {
    label: 'R2 回应',
    value: '36,968,308',
    unit: '人',
    color: R_COLORS.r2,
    comparison: '超过 同类目-TOP5商品均值',
    percentage: '409.88%',
  },
  {
    label: 'R3 共鸣',
    value: '4,132,641',
    unit: '人',
    color: R_COLORS.r3,
    comparison: '超过 同类目-TOP5商品均值',
    percentage: '576.37%',
  },
  {
    label: 'R4 行动',
    value: '97,043',
    unit: '人',
    color: R_COLORS.r4,
    comparison: '超过 同类目-TOP5商品均值',
    percentage: '126.42%',
  },
  {
    label: 'R5 信赖',
    value: '24,654',
    unit: '人',
    color: R_COLORS.r5,
    comparison: '超过 同类目-TOP5商品均值',
    percentage: '88.34%',
  },
];

const DISTRIBUTION = [
  { label: 'R1 触达', color: R_COLORS.r1, ratio: 53.82 },
  { label: 'R2 回应', color: R_COLORS.r2, ratio: 41.41 },
  { label: 'R3 共鸣', color: R_COLORS.r3, ratio: 4.63 },
  { label: 'R4 行动', color: R_COLORS.r4, ratio: 0.11 },
  { label: 'R5 信赖', color: R_COLORS.r5, ratio: 0.03 },
];

const BRAND_RANK: RankingItem[] = [
  { rank: 3, name: '香奈儿/Chanel智慧紧肤提拉乳霜', trend: 2, isCurrent: true },
  { rank: 1, name: '香奈儿/Chanel智慧紧肤精华乳霜', trend: 1 },
  { rank: 2, name: '香奈儿/Chanel一号红山茶花乳霜补充装', trend: -1 },
  { rank: 4, name: '香奈儿/Chanel一号红山茶花乳霜', trend: 0 },
  { rank: 5, name: '香奈儿/Chanel奢华精萃密集焕白乳霜', trend: -2 },
];

const INDUSTRY_RANK: RankingItem[] = [
  {
    rank: 8,
    name: '香奈儿/Chanel智慧紧肤提拉乳霜',
    trend: -2,
    isCurrent: true,
  },
  { rank: 1, name: '普拉达/PRADA焕颜面霜', trend: 4 },
  { rank: 2, name: '雅诗兰黛/EsteeLauder白金级蕴能黑钻光璨面霜', trend: -3 },
  { rank: 3, name: '资生堂/SHISEIDO光透耀白凝霜', trend: 2 },
  { rank: 4, name: '悦诗风吟/INNISFREE胶原多肽塑弹霜', trend: -4 },
];

const PRODUCT_DOTS: ProductDot[] = [
  {
    name: '香奈儿智慧紧肤精华乳霜',
    x: 0.84,
    y: 0.32,
    assetRank: 1,
    r3Rank: 8,
    quadrant: 3,
    labelSide: 'left',
  },
  {
    name: '香奈儿智慧紧肤提拉乳霜',
    x: 0.76,
    y: 0.62,
    assetRank: 3,
    r3Rank: 3,
    quadrant: 1,
    labelSide: 'left',
  },
  {
    name: '香奈儿一号红山茶花乳霜',
    x: 0.28,
    y: 0.28,
    assetRank: 7,
    r3Rank: 7,
    quadrant: 2,
    labelSide: 'right',
  },
  {
    name: '香奈儿山茶花乳霜补充装',
    x: 0.35,
    y: 0.72,
    assetRank: 5,
    r3Rank: 2,
    quadrant: 0,
    labelSide: 'right',
  },
  {
    name: '普拉达焕颜面霜',
    x: 0.92,
    y: 0.74,
    assetRank: 2,
    r3Rank: 1,
    quadrant: 1,
    labelSide: 'left',
  },
  {
    name: '资生堂光透耀白凝霜',
    x: 0.68,
    y: 0.58,
    assetRank: 4,
    r3Rank: 4,
    quadrant: 1,
    labelSide: 'left',
  },
  {
    name: '雅诗兰黛黑钻光璨面霜',
    x: 0.52,
    y: 0.76,
    assetRank: 6,
    r3Rank: 2,
    quadrant: 0,
    labelSide: 'left',
  },
  {
    name: '悦诗风吟塑弹霜',
    x: 0.18,
    y: 0.58,
    assetRank: 9,
    r3Rank: 5,
    quadrant: 0,
    labelSide: 'right',
  },
  {
    name: '兰芝精华霜',
    x: 0.14,
    y: 0.22,
    assetRank: 10,
    r3Rank: 9,
    quadrant: 2,
    labelSide: 'right',
  },
  {
    name: '海蓝之谜焕活面霜',
    x: 0.48,
    y: 0.14,
    assetRank: 8,
    r3Rank: 10,
    quadrant: 2,
    labelSide: 'right',
  },
];

function DualRankingTrendBadge({ trend }: { trend: number }) {
  if (trend === 0) {
    return null;
  }

  const isUp = trend > 0;

  return (
    <span
      className={clsx(
        'shrink-0 text-[length:var(--odn-font-size-comment)] font-medium',
        isUp ? 'text-green-6' : 'text-red-6',
      )}
    >
      {isUp ? '↑' : '↓'} {Math.abs(trend)}
    </span>
  );
}

function DualRankingList({
  title,
  items,
}: {
  title: React.ReactNode;
  items: RankingItem[];
}) {
  const currentItem = items.find((item) => item.isCurrent);
  const otherItems = items.filter((item) => !item.isCurrent);

  return (
    <div className="min-w-0 flex-1 px-6 py-5">
      <div className="mb-3 text-sm font-medium leading-[22px] text-black-12">
        {title}
      </div>
      {currentItem && (
        <>
          <div className="flex items-center justify-between rounded-lg py-2">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="w-5 shrink-0 text-center text-sm">
                {currentItem.rank}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">
                {currentItem.name}
              </span>
            </div>
            <DualRankingTrendBadge trend={currentItem.trend} />
          </div>
          <div className="my-3 border-b border-solid border-black-4" />
        </>
      )}
      <div className="flex flex-col">
        {otherItems.map((item) => (
          <div
            key={`${item.rank}-${item.name}`}
            className="flex items-center justify-between py-2"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="w-5 shrink-0 text-center text-sm text-black-9">
                {item.rank}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-black-12">
                {item.name}
              </span>
            </div>
            <DualRankingTrendBadge trend={item.trend} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ item, isFirst }: { item: MetricItem; isFirst: boolean }) {
  return (
    <div className="min-w-0 flex-1 rounded-[8px] px-4 py-3">
      <div className="mb-1 flex items-center gap-1.5">
        {!isFirst && (
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
        )}
        <span className="text-sm leading-[20px] text-black-9">
          {item.label}
        </span>
      </div>
      <div className="mb-1 flex items-end gap-1">
        <span className="text-base font-semibold leading-[24px] text-black-12">
          {item.value}
        </span>
        <span className="text-xs leading-[20px] text-black-9">{item.unit}</span>
      </div>
      <div className="truncate text-xs leading-[20px] text-black-9">
        {item.comparison}
      </div>
      <div className="text-xs leading-[20px] text-green-6">
        {item.percentage}
      </div>
    </div>
  );
}

function SpuDistributionSection() {
  // 将 PRODUCT_DOTS mock 数据转换为 ScatterChart 格式（对齐 dmp-web transformToChartData）
  const chartData = useMemo(() => {
    const maxRank = Math.max(
      ...PRODUCT_DOTS.map((d) => Math.max(d.assetRank, d.r3Rank)),
    );
    return PRODUCT_DOTS.map((dot) => {
      const x =
        maxRank > 1 ? 90 - (180 * (dot.assetRank - 1)) / (maxRank - 1) : 0;
      const y = maxRank > 1 ? 90 - (180 * (dot.r3Rank - 1)) / (maxRank - 1) : 0;
      const showOnLeft = x > 80;
      return {
        name: dot.name,
        value: [x, y],
        rank: { asset: dot.assetRank, r3: dot.r3Rank },
        label: {
          show: true,
          position: showOnLeft ? 'left' : 'right',
          offset: showOnLeft ? [-2, 0] : [2, 0],
          formatter: '{b}',
          color: '#262629B8',
          fontSize: 12,
        },
      };
    });
  }, []);

  const chartOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'item',
        padding: 0,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        extraCssText:
          'box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px;',
        formatter: (params: any) => {
          const { name, rank } = params.data;
          return `<div style="background:#fff;border-radius:8px;padding:16px;min-width:180px;color:#333">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <span style="font-weight:bold;font-size:14px">${name}</span>
            <span style="color:#999;font-size:12px;margin-left:10px">排名</span>
          </div>
          <div style="height:1px;background:#eee;margin-bottom:8px"></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px;line-height:22px">
            <span>资产占比排名</span><span style="font-weight:500">${rank.asset}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:14px;line-height:22px">
            <span>R3 流入率排名</span><span style="font-weight:500">${rank.r3}</span>
          </div>
        </div>`;
        },
      },
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        show: true,
        backgroundColor: '#F5F8FF',
        borderWidth: 0,
        containLabel: false,
      },
      xAxis: {
        min: -100,
        max: 100,
        splitLine: { show: false },
        axisLine: { show: false },
        axisLabel: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        min: -100,
        max: 100,
        splitLine: { show: false },
        axisLine: { show: false },
        axisLabel: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: 'scatter',
          symbolSize: 10,
          data: chartData,
          itemStyle: { color: '#6997F4', opacity: 1 },
          markLine: {
            silent: true,
            symbol: 'none',
            label: { show: false },
            lineStyle: { type: 'solid', color: '#fff', width: 3 },
            data: [{ xAxis: 0 }, { yAxis: 0 }],
            z: 1,
          },
          z: 10,
        },
      ],
      graphic: [
        // 四角标签（对齐 dmp-web CORNER_TAGS: bg=#D4E1FC text=#296BEF）
        ...[
          { left: 0, top: 0, text: '潜力盘' },
          { right: 0, top: 0, text: '机会盘' },
          { left: 0, bottom: 0, text: '探索盘' },
          { right: 0, bottom: 0, text: '突破盘' },
        ].map(({ text, ...pos }) => ({
          type: 'group',
          ...pos,
          z: 100,
          children: [
            {
              type: 'rect',
              shape: { width: 60, height: 24 },
              style: { fill: '#D4E1FC' },
            },
            {
              type: 'text',
              left: 10,
              top: 6,
              style: { text, fill: '#296BEF', fontSize: 12 },
            },
          ],
        })),
        // 坐标轴说明（对齐 dmp-web AXIS_LABELS）
        {
          type: 'text',
          left: 'center',
          top: 6,
          z: 100,
          style: { text: 'R3流入率高', fill: '#626365', fontSize: 10 },
        },
        {
          type: 'text',
          left: 'center',
          bottom: 6,
          z: 100,
          style: { text: 'R3流入率低', fill: '#626365', fontSize: 10 },
        },
        {
          type: 'text',
          left: 6,
          top: 'center',
          z: 100,
          style: { text: '资产占比低', fill: '#626365', fontSize: 10 },
        },
        {
          type: 'text',
          right: 6,
          top: 'center',
          z: 100,
          style: { text: '资产占比高', fill: '#626365', fontSize: 10 },
        },
      ],
    }),
    [chartData],
  );

  return (
    <div className="bg-white rounded-xl">
      <div className="px-6 py-5 border-b border-[#e5e6eb]">
        <Tooltip
          popup={
            <div>
              根据配置的竞品品牌，展示同一上级类目中的所有SPU排名分布。
              <br />
              横轴：SPU 5R资产占比（SPU 5R总资产/类目5R总资产）
              <br />
              纵轴：SPU R3流入率
            </div>
          }
        >
          <span className="text-base font-semibold text-[#0d0d0d]">
            商品排名分布
          </span>
        </Tooltip>
      </div>
      <div className="px-6 py-5">
        <EChartsReact
          option={chartOption}
          style={{ height: 400, width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
    </div>
  );
}

const SpuAudienceAssetPage = () => {
  const [activeNav, setActiveNav] = useState('洞察诊断');
  const [activeMenu, setActiveMenu] = useState('spu-crowd-asset');

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
      accountName="香奈儿/CHANEL - 美妆护肤"
      accountId="28392034"
      collapsible
      contentClassName="flex flex-col gap-4"
      headerRight={
        <>
          <div className="flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-black-6 px-4 text-sm">
            <Icon name="users" size={16} />
            <span className="text-black-11">人群夹</span>
            <span className="font-semibold">10</span>
          </div>
          <div className="ml-3 flex items-center">
            <Button light icon="bell" />
            <Button light icon="help-circle" />
            <Button light icon="setting" />
          </div>
        </>
      }
    >
      <div className="overflow-hidden rounded-[12px] border border-black-4 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-black-4 px-6 py-3">
          <div className="text-base font-medium text-black-12">
            商品人群资产
          </div>
          <div className="flex items-center gap-2">
            <Button light icon="user-pack">
              添加人群
            </Button>
            <Button light icon="download-1">
              下载数据
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 px-6 py-4">
          <Select
            prefix={<span className="text-black-9">SPU</span>}
            className="w-[360px]"
            value="spu-1"
            options={[
              {
                label: '面部洗护 > 乳液面霜 > 香奈儿/Chanel智慧紧肤提拉乳霜',
                value: 'spu-1',
              },
            ]}
          />
          <div className="flex items-center">
            <Select
              value="month"
              className="w-[92px]"
              style={
                {
                  '--odn-select-border-radius': '6px 0 0 6px',
                } as React.CSSProperties
              }
              options={[
                { value: 'day', label: '按日' },
                { value: 'month', label: '按月' },
                { value: 'quarter', label: '按季度' },
              ]}
            />
            <DateRangePicker
              className="-ml-px"
              value={[new Date('2025-12-01'), new Date('2026-02-28')]}
              style={
                {
                  '--odn-dp-border-radius': '0 6px 6px 0',
                } as React.CSSProperties
              }
            />
          </div>
          <Select
            prefix={<span className="text-black-9">参考系</span>}
            value="top5"
            options={[
              { value: 'same-brand', label: '同品牌-商品均值' },
              { value: 'same-category', label: '同类目-商品均值' },
              { value: 'top5', label: '同类目-TOP5商品均值' },
            ]}
          />
        </div>
      </div>

      <Card elevation={0}>
        <div className="px-6 py-5">
          <div className="mb-4 text-base font-semibold text-black-12">
            资产概览
          </div>
          <div className="flex px-0">
            {METRICS.map((item, index) => (
              <MetricCard key={item.label} item={item} isFirst={index === 0} />
            ))}
          </div>
          <div className="px-4 pb-5 pt-2">
            <div className="mb-3 flex items-center justify-between text-xs text-black-9">
              {DISTRIBUTION.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.label}</span>
                  <span className="tabular-nums text-black-12">
                    {item.ratio}%
                  </span>
                </div>
              ))}
            </div>
            <div className="flex h-3 w-full overflow-hidden rounded-full">
              {DISTRIBUTION.map((item) => (
                <div
                  key={item.label}
                  className="h-full"
                  style={{
                    width: `${item.ratio}%`,
                    backgroundColor: item.color,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card elevation={0}>
        <div className="flex gap-6">
          <DualRankingList
            title="本品牌 乳液面霜类目下 的 人群总资产榜"
            items={BRAND_RANK}
          />
          <DualRankingList
            title="本行业 乳液面霜类目下 的 人群总资产榜"
            items={INDUSTRY_RANK}
          />
        </div>
      </Card>

      <PenetrationAnalysisBlock />

      <SpuDistributionSection />
    </RuyiLayout>
  );
};

export default SpuAudienceAssetPage;
