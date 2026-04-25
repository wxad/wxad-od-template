'use client';

import {
  Button,
  Cascader,
  Icon,
  RuyiLayout,
  Select,
  Table,
  type RuyiMenuItem,
  type TableProps,
  type TableSortOrder,
} from 'one-design-next';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { RyDateRangePicker } from '../blocks/ry-date-range-picker';

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

// 核心指标卡数据
const CONVERSION_METRICS = [
  {
    key: 'storage',
    title: '蓄水',
    subtitle: '(非5R到R1/R2)',
    count: 12345,
    rate: 0.023,
    benchmarkRate: 0.019,
    active: true,
  },
  {
    key: 'seeding',
    title: '种草',
    subtitle: '(非5R/R1/R2到R3)',
    count: 8901,
    rate: 0.018,
    benchmarkRate: 0.021,
    active: false,
  },
  {
    key: 'conversion',
    title: '转化',
    subtitle: '(非5R/R1/R2/R3到R4/R5)',
    count: 3456,
    rate: 0.009,
    benchmarkRate: 0.007,
    active: false,
  },
];

// 桑基图数据
// Left (in): 非5R, R1, R2, R3
// Right (out): R1, R2, R3, R4, R5
const SANKEY_MATRIX = [
  [8200, 4100, 0, 0, 0], // 非5R →
  [0, 3500, 2800, 0, 0], // R1 →
  [0, 0, 2100, 1600, 0], // R2 →
  [0, 0, 0, 1200, 900], // R3 →
];

const IN_LABELS = ['非5R', 'R1 触达', 'R2 回应', 'R3 共鸣'];
const OUT_LABELS = ['R1 触达', 'R2 回应', 'R3 共鸣', 'R4 行动', 'R5 信赖'];

// 关系激活映射：蓄水 / 种草 / 转化
const RELATIONSHIP_ACTIVE: Record<
  string,
  { inActive: number[]; outActive: number[] }
> = {
  storage: { inActive: [0], outActive: [0, 1] }, // 蓄水：非5R → R1/R2
  seeding: { inActive: [0, 1, 2], outActive: [2] }, // 种草：非5R/R1/R2 → R3
  conversion: { inActive: [0, 1, 2, 3], outActive: [3, 4] }, // 转化：非5R/R1/R2/R3 → R4/R5
};

// 触点效率表格数据
interface TouchpointRow {
  key: string;
  touchpointName: string;
  categoryId: string;
  categoryName: string;
  storageCount: number;
  storageRate: number;
  seedingCount: number;
  seedingRate: number;
  conversionCount: number;
  conversionRate: number;
}

const TOUCHPOINT_CATEGORIES = [
  { label: '全部触点', value: 'all' },
  { label: '合约硬广', value: 'contract' },
  { label: '品牌竞价', value: 'brand-bid' },
  { label: '效果竞价', value: 'effect-bid' },
  { label: '搜索广告', value: 'search' },
  { label: '视频号', value: 'channels' },
  { label: '公众号', value: 'official-account' },
  { label: '小程序', value: 'mini-program' },
];

const TOUCHPOINT_ROWS: TouchpointRow[] = [
  { key: '1', touchpointName: '朋友圈信息流广告', categoryId: 'contract', categoryName: '合约硬广', storageCount: 3210, storageRate: 0.042, seedingCount: 1890, seedingRate: 0.025, conversionCount: 620, conversionRate: 0.008 },
  { key: '2', touchpointName: '公众号底部广告', categoryId: 'contract', categoryName: '合约硬广', storageCount: 2450, storageRate: 0.031, seedingCount: 1320, seedingRate: 0.017, conversionCount: 480, conversionRate: 0.006 },
  { key: '3', touchpointName: '视频号信息流推荐', categoryId: 'channels', categoryName: '视频号', storageCount: 1980, storageRate: 0.038, seedingCount: 1560, seedingRate: 0.03, conversionCount: 720, conversionRate: 0.014 },
  { key: '4', touchpointName: '搜一搜品牌专区', categoryId: 'search', categoryName: '搜索广告', storageCount: 1720, storageRate: 0.052, seedingCount: 980, seedingRate: 0.03, conversionCount: 540, conversionRate: 0.016 },
  { key: '5', touchpointName: '品牌竞价-朋友圈', categoryId: 'brand-bid', categoryName: '品牌竞价', storageCount: 1560, storageRate: 0.028, seedingCount: 860, seedingRate: 0.015, conversionCount: 310, conversionRate: 0.006 },
  { key: '6', touchpointName: '效果竞价-视频号', categoryId: 'effect-bid', categoryName: '效果竞价', storageCount: 1340, storageRate: 0.035, seedingCount: 920, seedingRate: 0.024, conversionCount: 450, conversionRate: 0.012 },
  { key: '7', touchpointName: '视频号直播间', categoryId: 'channels', categoryName: '视频号', storageCount: 1280, storageRate: 0.045, seedingCount: 1100, seedingRate: 0.039, conversionCount: 680, conversionRate: 0.024 },
  { key: '8', touchpointName: '公众号文章内广告', categoryId: 'official-account', categoryName: '公众号', storageCount: 1150, storageRate: 0.022, seedingCount: 720, seedingRate: 0.014, conversionCount: 280, conversionRate: 0.005 },
  { key: '9', touchpointName: '小程序Banner广告', categoryId: 'mini-program', categoryName: '小程序', storageCount: 980, storageRate: 0.019, seedingCount: 540, seedingRate: 0.01, conversionCount: 190, conversionRate: 0.004 },
  { key: '10', touchpointName: '搜一搜竞价广告', categoryId: 'search', categoryName: '搜索广告', storageCount: 920, storageRate: 0.048, seedingCount: 680, seedingRate: 0.035, conversionCount: 380, conversionRate: 0.02 },
  { key: '11', touchpointName: '效果竞价-公众号', categoryId: 'effect-bid', categoryName: '效果竞价', storageCount: 860, storageRate: 0.026, seedingCount: 520, seedingRate: 0.016, conversionCount: 210, conversionRate: 0.006 },
  { key: '12', touchpointName: '视频号短视频', categoryId: 'channels', categoryName: '视频号', storageCount: 780, storageRate: 0.033, seedingCount: 640, seedingRate: 0.027, conversionCount: 350, conversionRate: 0.015 },
  { key: '13', touchpointName: '品牌竞价-视频号', categoryId: 'brand-bid', categoryName: '品牌竞价', storageCount: 720, storageRate: 0.024, seedingCount: 480, seedingRate: 0.016, conversionCount: 220, conversionRate: 0.007 },
  { key: '14', touchpointName: '小程序激励视频', categoryId: 'mini-program', categoryName: '小程序', storageCount: 650, storageRate: 0.021, seedingCount: 380, seedingRate: 0.012, conversionCount: 160, conversionRate: 0.005 },
  { key: '15', touchpointName: '公众号关注页广告', categoryId: 'official-account', categoryName: '公众号', storageCount: 580, storageRate: 0.018, seedingCount: 340, seedingRate: 0.011, conversionCount: 130, conversionRate: 0.004 },
];

// ─── 工具函数 ──────────────────────────────────────────────

function formatNum(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatPct(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

// ─── 筛选栏 ─────────────────────────────────────────────────

function StoreFilterSection() {
  const [filterType, setFilterType] = useState<'store' | 'product'>('store');
  const [store, setStore] = useState('store-1');
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date('2026-04-14'),
    new Date('2026-04-20'),
  ]);
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

      <RyDateRangePicker
        value={dateRange}
        onChange={setDateRange}
        triggerLabel="日期范围"
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

// ─── 核心指标卡 ─────────────────────────────────────────────

function MetricCard({
  metric,
  isSelected,
  onClick,
}: {
  metric: (typeof CONVERSION_METRICS)[number];
  isSelected: boolean;
  onClick: () => void;
}) {
  const delta = metric.rate - metric.benchmarkRate;
  const isAbove = delta >= 0;

  return (
    <div
      className="flex flex-1 cursor-pointer flex-col gap-1.5 rounded-xl px-5 py-[14px] text-[#0d0d0d]"
      style={{
        border: isSelected ? '1px solid #296bef' : '1px solid #fafafb',
        backgroundColor: isSelected ? '#f5f8ff' : '#fafafb',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = '#f1f2f6';
          e.currentTarget.style.borderColor = '#f1f2f6';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isSelected
          ? '#f5f8ff'
          : '#fafafb';
        e.currentTarget.style.borderColor = isSelected ? '#296bef' : '#fafafb';
      }}
    >
      <div className="flex items-center justify-between text-[14px] leading-[22px]">
        <div>
          <span className="font-semibold">{metric.title}</span>
          <span className="text-[#898b8f]">{metric.subtitle}</span>
        </div>
        <Icon
          name="user-add"
          size={16}
          style={{ color: isSelected ? '#296bef' : '#0d0d0d' }}
        />
      </div>
      <div className="tabular-nums text-[24px] font-semibold leading-[32px]">
        {formatNum(metric.count)}
      </div>
      <div className="flex items-center gap-2 text-[12px] leading-[20px]">
        <span className="text-[#646566]">
          {metric.title === '蓄水'
            ? '蓄水率'
            : metric.title === '种草'
              ? '种草率'
              : '转化率'}{' '}
          <span className="tabular-nums font-medium text-[#0d0d0d]">
            {formatPct(metric.rate)}
          </span>
        </span>
        <span className="text-[#898b8f]">
          vs 类目均值{' '}
          <span
            className="tabular-nums"
            style={{ color: isAbove ? '#07C160' : '#E63D2E' }}
          >
            {isAbove ? '↑' : '↓'}{' '}
            {(Math.abs(delta) * 100).toFixed(2)}%
          </span>
        </span>
      </div>
    </div>
  );
}

// ─── 桑基图（对齐 asset-flow.tsx 的 SankeyChart 实现，适配小店 4×5 矩阵） ─────

interface SankeyLayout {
  inHeights: number[];
  outHeights: number[];
  inPositions: { y: number; h: number }[];
  outPositions: { y: number; h: number }[];
  strips: {
    inIdx: number;
    outIdx: number;
    value: number;
    height: number;
    leftH0: number;
    leftH1: number;
    rightH0: number;
    rightH1: number;
    isActive: boolean;
    color: string;
  }[];
  svgHeight: number;
  inValues: number[];
  outValues: number[];
}

function computeSankeyLayout(
  matrix: number[][],
  activeIn: number[],
  activeOut: number[],
): SankeyLayout {
  const nIn = 4;
  const nOut = 5;
  const minH = 4;
  const maxH = 64;
  const gap = 48;

  let minVal = Infinity;
  let maxVal = -Infinity;
  for (let i = 0; i < nIn; i++) {
    for (let j = 0; j < nOut; j++) {
      const v = matrix[i][j];
      if (v > 0) {
        minVal = Math.min(minVal, v);
        maxVal = Math.max(maxVal, v);
      }
    }
  }
  if (minVal === Infinity) {
    minVal = 0;
    maxVal = 1;
  }

  const getHeight = (v: number) => {
    if (v === 0) return 0;
    return ((v - minVal) / (maxVal - minVal)) * (maxH - minH) + minH;
  };

  const inHeights = new Array(nIn).fill(0);
  const outHeights = new Array(nOut).fill(0);

  for (let i = 0; i < nIn; i++) {
    for (let j = 0; j < nOut; j++) {
      const h = getHeight(matrix[i][j]);
      inHeights[i] += h;
      outHeights[j] += h;
    }
  }

  const inPositions: { y: number; h: number }[] = [];
  let y = 0;
  for (let i = 0; i < nIn; i++) {
    inPositions.push({ y, h: inHeights[i] });
    if (inHeights[i] > 0) y += inHeights[i] + gap;
  }
  const totalInH = y > 0 ? y - gap : 0;

  const outPositions: { y: number; h: number }[] = [];
  y = 0;
  for (let j = 0; j < nOut; j++) {
    outPositions.push({ y, h: outHeights[j] });
    if (outHeights[j] > 0) y += outHeights[j] + gap;
  }
  const totalOutH = y > 0 ? y - gap : 0;

  const leftUsed = new Array(nIn).fill(0);
  const rightUsed = new Array(nOut).fill(0);
  const strips: SankeyLayout['strips'] = [];

  for (let j = 0; j < nOut; j++) {
    for (let i = 0; i < nIn; i++) {
      const v = matrix[i][j];
      const h = getHeight(v);
      if (h === 0) continue;

      const leftH0 = inPositions[i].y + leftUsed[i];
      const leftH1 = leftH0 + h;
      leftUsed[i] += h;

      const rightH0 = outPositions[j].y + rightUsed[j];
      const rightH1 = rightH0 + h;
      rightUsed[j] += h;

      const isActive = activeIn.includes(i) && activeOut.includes(j);

      let color: string;
      if (isActive) {
        color = i === 0 ? '#296bef' : '#babcc1';
      } else {
        color = i === 0 ? '#d4e1fc' : '#e2e5ea';
      }

      strips.push({
        inIdx: i,
        outIdx: j,
        value: v,
        height: h,
        leftH0,
        leftH1,
        rightH0,
        rightH1,
        isActive,
        color,
      });
    }
  }

  const inValues = new Array(nIn).fill(0);
  const outValues = new Array(nOut).fill(0);
  for (let i = 0; i < nIn; i++) {
    for (let j = 0; j < nOut; j++) {
      inValues[i] += matrix[i][j];
      outValues[j] += matrix[i][j];
    }
  }

  return {
    inHeights,
    outHeights,
    inPositions,
    outPositions,
    strips,
    svgHeight: Math.max(totalInH, totalOutH),
    inValues,
    outValues,
  };
}

function StoreSankeyChart({
  activeMetric,
}: {
  activeMetric: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredStrip, setHoveredStrip] = useState<{
    inIdx: number;
    outIdx: number;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const { inActive, outActive } =
    RELATIONSHIP_ACTIVE[activeMetric] || RELATIONSHIP_ACTIVE.storage;

  const layout = useMemo(
    () => computeSankeyLayout(SANKEY_MATRIX, inActive, outActive),
    [inActive, outActive],
  );

  const svgWidth = 600;
  const halfWidth = svgWidth / 2;

  const sortedStrips = useMemo(() => {
    const passive = layout.strips.filter((s) => !s.isActive);
    const active = layout.strips.filter((s) => s.isActive);
    return [...passive, ...active];
  }, [layout.strips]);

  const handleMouseMove = useCallback(
    (
      e: React.MouseEvent<SVGPathElement>,
      s: SankeyLayout['strips'][number],
    ) => {
      const svg = e.currentTarget.closest('svg');
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      setHoveredStrip({
        inIdx: s.inIdx,
        outIdx: s.outIdx,
        value: s.value,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [],
  );

  const renderSideColumn = (
    positions: { y: number; h: number }[],
    heights: number[],
    isLeft: boolean,
  ) => (
    <div className="flex w-[8px] shrink-0 flex-col">
      {positions.map((pos, i) => {
        if (heights[i] === 0) return null;
        const nodeStrips = isLeft
          ? layout.strips.filter((s) => s.inIdx === i)
          : layout.strips.filter((s) => s.outIdx === i);
        return (
          <div
            key={i}
            className="flex flex-col"
            style={{
              height: pos.h,
              marginBottom:
                i < heights.length - 1 && heights[i] > 0 ? 48 : 0,
            }}
          >
            {nodeStrips.map((s, j) => (
              <div
                key={j}
                style={{ height: s.height, backgroundColor: s.color }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="relative">
      {/* 日期标签 */}
      <div className="flex items-center justify-between px-1 pb-4 text-xs text-[#898b8f]">
        <span>26-04-14</span>
        <span>26-04-20</span>
      </div>

      <div className="flex items-start">
        {/* 左侧标签 */}
        <div className="w-[100px] shrink-0 pr-2">
          {layout.inPositions.map((pos, i) => {
            if (layout.inHeights[i] === 0) return null;
            const isNodeActive = inActive.includes(i);
            return (
              <div
                key={i}
                className="flex cursor-pointer flex-col justify-center rounded-lg px-2 py-1 text-right font-semibold"
                style={{
                  height: pos.h,
                  marginBottom:
                    i < IN_LABELS.length - 1 && layout.inHeights[i] > 0
                      ? 48
                      : 0,
                  color: isNodeActive
                    ? 'rgba(41, 107, 239)'
                    : 'rgba(38, 38, 41, 0.72)',
                }}
              >
                <div className="flex items-center justify-end gap-0.5">
                  <Icon
                    name="user-add"
                    size={16}
                    style={{ color: 'inherit' }}
                  />
                  <span className="text-[14px] leading-[22px]">
                    {IN_LABELS[i]}
                  </span>
                </div>
                <div className="tabular-nums text-[16px] leading-[24px]">
                  {formatNum(layout.inValues[i])}
                </div>
              </div>
            );
          })}
        </div>

        {renderSideColumn(layout.inPositions, layout.inHeights, true)}

        {/* SVG 桑基图 */}
        <div className="relative min-w-0 flex-1">
          <svg
            ref={svgRef}
            className="block w-full"
            style={{ height: layout.svgHeight }}
            viewBox={`0 0 ${svgWidth} ${layout.svgHeight}`}
            preserveAspectRatio="none"
            fill="none"
          >
            {sortedStrips.map((s) => (
              <path
                key={`${s.inIdx}-${s.outIdx}`}
                fillRule="evenodd"
                clipRule="evenodd"
                d={[
                  `M 0 ${s.leftH0}`,
                  `V ${s.leftH1}`,
                  `C ${halfWidth} ${s.leftH1} ${halfWidth} ${s.rightH1} ${svgWidth} ${s.rightH1}`,
                  `V ${s.rightH0}`,
                  `C ${halfWidth} ${s.rightH0} ${halfWidth} ${s.leftH0} 0 ${s.leftH0}`,
                  'Z',
                ].join('')}
                fill={s.color}
                opacity={
                  hoveredStrip?.inIdx === s.inIdx &&
                  hoveredStrip?.outIdx === s.outIdx
                    ? 0.5
                    : 0.25
                }
                className="cursor-pointer transition-opacity"
                onMouseMove={(e) => handleMouseMove(e, s)}
                onMouseLeave={() => setHoveredStrip(null)}
              />
            ))}
          </svg>

          {/* Tooltip */}
          {hoveredStrip && (
            <div
              className="pointer-events-none absolute z-10 whitespace-nowrap rounded-[8px] bg-white px-6 py-5 text-[14px] font-semibold leading-[22px] text-[#0d0d0d]"
              style={{
                left: hoveredStrip.x,
                top: hoveredStrip.y - 50,
                transform: 'translateX(-50%)',
                boxShadow:
                  '0 10px 36px rgba(0,0,0,0.16), 0 6px 15px rgba(0,0,0,0.07)',
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <span>
                  {IN_LABELS[hoveredStrip.inIdx]} →{' '}
                  {OUT_LABELS[hoveredStrip.outIdx]}
                </span>
                <span className="tabular-nums">
                  {formatNum(hoveredStrip.value)}
                </span>
              </div>
            </div>
          )}
        </div>

        {renderSideColumn(layout.outPositions, layout.outHeights, false)}

        {/* 右侧标签 */}
        <div className="w-[100px] shrink-0 pl-2">
          {layout.outPositions.map((pos, i) => {
            if (layout.outHeights[i] === 0) return null;
            const isNodeActive = outActive.includes(i);
            return (
              <div
                key={i}
                className="flex cursor-pointer flex-col justify-center rounded-lg px-2 py-1 font-semibold"
                style={{
                  height: pos.h,
                  marginBottom:
                    i < OUT_LABELS.length - 1 && layout.outHeights[i] > 0
                      ? 48
                      : 0,
                  color: isNodeActive
                    ? 'rgba(41, 107, 239)'
                    : 'rgba(38, 38, 41, 0.72)',
                }}
              >
                <div className="flex items-center gap-0.5">
                  <span className="text-[14px] leading-[22px]">
                    {OUT_LABELS[i]}
                  </span>
                  <Icon
                    name="user-add"
                    size={16}
                    style={{ color: 'inherit' }}
                  />
                </div>
                <div className="tabular-nums text-[16px] leading-[24px]">
                  {formatNum(layout.outValues[i])}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 触点效率表格 ───────────────────────────────────────────

function TouchpointEfficiencyTable() {
  const [category, setCategory] = useState('all');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<TableSortOrder>(null);

  const handleSort = (key: string, order: TableSortOrder) => {
    setSortKey(key);
    setSortOrder(order);
  };

  const filteredRows = useMemo(() => {
    let rows =
      category === 'all'
        ? TOUCHPOINT_ROWS
        : TOUCHPOINT_ROWS.filter((r) => r.categoryId === category);

    if (sortKey && sortOrder) {
      rows = [...rows].sort((a, b) => {
        const av = a[sortKey as keyof TouchpointRow] as number;
        const bv = b[sortKey as keyof TouchpointRow] as number;
        return sortOrder === 'ascend' ? av - bv : bv - av;
      });
    }

    return rows;
  }, [category, sortKey, sortOrder]);

  const makeSortProps = (
    key: string,
  ): { sortOrder: TableSortOrder; onSort: (order: TableSortOrder) => void } => ({
    sortOrder: sortKey === key ? sortOrder : null,
    onSort: (order: TableSortOrder) => handleSort(key, order),
  });

  const columns: TableProps<TouchpointRow>['columns'] = [
    {
      title: '触点',
      dataIndex: 'touchpointName',
      key: 'touchpointName',
    },
    {
      title: '蓄水量',
      dataIndex: 'storageCount',
      key: 'storageCount',
      align: 'right',
      ...makeSortProps('storageCount'),
      render: ({ row }) => (
        <span className="tabular-nums">{formatNum(row.storageCount)}</span>
      ),
    },
    {
      title: '蓄水率',
      dataIndex: 'storageRate',
      key: 'storageRate',
      align: 'right',
      ...makeSortProps('storageRate'),
      render: ({ row }) => (
        <span className="tabular-nums">{formatPct(row.storageRate)}</span>
      ),
    },
    {
      title: '种草量',
      dataIndex: 'seedingCount',
      key: 'seedingCount',
      align: 'right',
      ...makeSortProps('seedingCount'),
      render: ({ row }) => (
        <span className="tabular-nums">{formatNum(row.seedingCount)}</span>
      ),
    },
    {
      title: '种草率',
      dataIndex: 'seedingRate',
      key: 'seedingRate',
      align: 'right',
      ...makeSortProps('seedingRate'),
      render: ({ row }) => (
        <span className="tabular-nums">{formatPct(row.seedingRate)}</span>
      ),
    },
    {
      title: '转化量',
      dataIndex: 'conversionCount',
      key: 'conversionCount',
      align: 'right',
      ...makeSortProps('conversionCount'),
      render: ({ row }) => (
        <span className="tabular-nums">{formatNum(row.conversionCount)}</span>
      ),
    },
    {
      title: '转化率',
      dataIndex: 'conversionRate',
      key: 'conversionRate',
      align: 'right',
      ...makeSortProps('conversionRate'),
      render: ({ row }) => (
        <span className="tabular-nums">{formatPct(row.conversionRate)}</span>
      ),
    },
  ];

  return (
    <div className="rounded-xl border border-[#edeef2] bg-white">
      <div className="flex items-center justify-between border-b border-[#e5e6eb] px-6 py-5">
        <span className="text-base font-semibold text-[#0d0d0d]">
          触点效率
        </span>
        <Select
          prefix={
            <span className="text-[var(--odn-color-black-9)]">触点类型</span>
          }
          value={category}
          onChange={(v) => setCategory(v as string)}
          options={TOUCHPOINT_CATEGORIES}
          allowClear={false}
        />
      </div>
      <div className="px-6 py-4">
        <Table<TouchpointRow>
          dataSource={filteredRows}
          columns={columns}
          rowHoverable
          scroll={{ y: 400 }}
        />
      </div>
    </div>
  );
}

// ─── 主页面 ──────────────────────────────────────────────────

const StoreAssetConversionPage = () => {
  const [activeNav, setActiveNav] = useState('生意');
  const [activeMenu, setActiveMenu] = useState('store-asset-conversion');
  const [activeMetric, setActiveMetric] = useState('storage');

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
          <h2 className="text-lg font-semibold text-black-12">人群资产流转</h2>
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

      {/* ═══ 2. 流转关系 ═══ */}
      <div className="rounded-xl border border-[#edeef2] bg-white">
        <div className="border-b border-[#e5e6eb] px-6 py-5">
          <span className="text-base font-semibold text-[#0d0d0d]">
            流转关系
          </span>
        </div>
        <div className="px-6 py-5">
          {/* 2a. 核心指标卡 */}
          <div className="mb-6 flex gap-4">
            {CONVERSION_METRICS.map((metric) => (
              <MetricCard
                key={metric.key}
                metric={metric}
                isSelected={activeMetric === metric.key}
                onClick={() => setActiveMetric(metric.key)}
              />
            ))}
          </div>

          {/* 2b. 桑基图 */}
          <StoreSankeyChart activeMetric={activeMetric} />
        </div>
      </div>

      {/* ═══ 3. 触点效率表格 ═══ */}
      <TouchpointEfficiencyTable />
    </RuyiLayout>
  );
};

export default StoreAssetConversionPage;
