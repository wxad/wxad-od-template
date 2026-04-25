'use client';

import {
  Button,
  DatePicker,
  Icon,
  RuyiLayout,
  Select,
  type RuyiMenuItem,
} from 'one-design-next';
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import assetFlowFixture from './data/asset-flow.json';

// 本地 fixtures，避免预览域等非 localhost 来源被 CDN CORS 拦截
const assetFlowCdnData = assetFlowFixture as Record<string, any>;

// ─── 常量（对齐 dmp-web AudienceAssetConversionPage.config.ts） ─────
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

const RELATIONSHIP_CONFIG = [
  { key: 1, label: '拉新', subtitle: '非5R到5R' },
  { key: 2, label: '蓄水', subtitle: '非5R到R1/R2' },
  { key: 3, label: '种草', subtitle: '非5R/R1/R2到R3' },
] as const;

const IN_LABELS = [
  '非5R 流入',
  'R1 触达',
  'R2 回应',
  'R3 共鸣',
  'R4 行动',
  'R5 信赖',
];
const OUT_LABELS = [
  '非5R 流出',
  'R1 触达',
  'R2 回应',
  'R3 共鸣',
  'R4 行动',
  'R5 信赖',
];

// 拉新/蓄水/种草激活的 in/out 索引（对齐 dmp-web helper.ts activeInAudienceTypes/activeOutAudienceTypes）
const RELATIONSHIP_ACTIVE: Record<
  number,
  { inActive: number[]; outActive: number[] }
> = {
  1: { inActive: [0], outActive: [1, 2, 3, 4, 5] }, // 拉新：非5R → R1-R5
  2: { inActive: [0], outActive: [1, 2] }, // 蓄水：非5R → R1/R2
  3: { inActive: [0, 1, 2], outActive: [3] }, // 种草：非5R/R1/R2 → R3
};

function formatNum(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatPct(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

// ─── 拉新/蓄水/种草 关系块（对齐 dmp-web RelationshipBlock） ─────
function RelationshipBlock({
  config,
  value,
  delta,
  comparedLabel,
  isSelected,
  onClick,
}: {
  config: (typeof RELATIONSHIP_CONFIG)[number];
  value: number | null;
  delta: number | null;
  comparedLabel: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="flex-1 flex flex-col gap-1.5 rounded-xl cursor-pointer px-5 py-[14px] text-[#0d0d0d]"
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
      {/* titleRow（对齐 .titleRow: flex justify-between） */}
      <div
        className="flex items-center justify-between leading-[22px] text-[14px]"
      >
        <div>
          <span className="font-semibold">{config.label}</span>
          <span>（{config.subtitle}）</span>
        </div>
        <Icon
          name="user-add"
          size={16}
          style={{ color: isSelected ? '#296bef' : '#0d0d0d' }}
        />
      </div>
      {/* valueRow（对齐 .valueRow: OD-number 24px 600） */}
      <div
        className="tabular-nums text-[24px] font-semibold leading-[32px]"
      >
        {value !== null ? formatNum(value) : '暂无数据'}
      </div>
      {/* offsetRow（对齐 .offsetRow: 12px） */}
      <div className="text-[12px] leading-[20px]">
        {delta !== null ? (
          <>
            <span className="mr-1">
              {delta >= 0 ? '超过' : '低于'}
              {comparedLabel}
            </span>
            <span
              className="tabular-nums"
              style={{ color: delta >= 0 ? '#07C160' : '#E63D2E' }}
            >
              {(Math.abs(delta) * 100).toFixed(2)}%
            </span>
          </>
        ) : (
          '--'
        )}
      </div>
    </div>
  );
}

// ─── 桑基图（对齐 dmp-web SankeyGraph.tsx + StripPath.tsx） ─────

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

function computeSankeyFromMatrix(
  valueMatrix: number[][],
  activeIn: number[],
  activeOut: number[],
): SankeyLayout {
  const n = 6;
  const minH = 4;
  const maxH = 64;
  const gap = 48;

  // Find min/max non-zero values
  let minVal = Infinity;
  let maxVal = -Infinity;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const v = valueMatrix[i][j];
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

  // Build strips with left cumulative heights
  const strips: SankeyLayout['strips'] = [];
  const inHeights = new Array(n).fill(0);
  const outHeights = new Array(n).fill(0);

  // First pass: compute heights per in/out node
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const h = getHeight(valueMatrix[i][j]);
      inHeights[i] += h;
      outHeights[j] += h;
    }
  }

  // Compute positions with gap
  const inPositions: { y: number; h: number }[] = [];
  let y = 0;
  for (let i = 0; i < n; i++) {
    inPositions.push({ y, h: inHeights[i] });
    if (inHeights[i] > 0) y += inHeights[i] + gap;
  }
  const totalInH = y > 0 ? y - gap : 0;

  const outPositions: { y: number; h: number }[] = [];
  y = 0;
  for (let j = 0; j < n; j++) {
    outPositions.push({ y, h: outHeights[j] });
    if (outHeights[j] > 0) y += outHeights[j] + gap;
  }
  const totalOutH = y > 0 ? y - gap : 0;

  // Second pass: compute strip positions
  const leftUsed = new Array(n).fill(0);
  const rightUsed = new Array(n).fill(0);

  // Build strips in outKey-first order (like dmp-web sortedStripKeys)
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const v = valueMatrix[i][j];
      const h = getHeight(v);
      if (h === 0) continue;

      const leftH0 = inPositions[i].y + leftUsed[i];
      const leftH1 = leftH0 + h;
      leftUsed[i] += h;

      const rightH0 = outPositions[j].y + rightUsed[j];
      const rightH1 = rightH0 + h;
      rightUsed[j] += h;

      const isActive = activeIn.includes(i) && activeOut.includes(j);

      // 对齐 dmp-web getStripColor: inIndex===0 蓝色 其他灰色
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

  // Compute in/out totals
  const inValues = new Array(n).fill(0);
  const outValues = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      inValues[i] += valueMatrix[i][j];
      outValues[j] += valueMatrix[i][j];
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

function SankeyChart({
  flowData,
  relationship,
}: {
  flowData: any[];
  relationship: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredStrip, setHoveredStrip] = useState<{
    inIdx: number;
    outIdx: number;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  // Build 6x6 value matrix from flowData
  const valueMatrix = useMemo(() => {
    const m = Array.from({ length: 6 }, () => new Array(6).fill(0));
    flowData.forEach((item: any) => {
      m[item.pre_r][item.post_r] = Number(item.wuid_cnt);
    });
    return m;
  }, [flowData]);

  const { inActive, outActive } =
    RELATIONSHIP_ACTIVE[relationship] || RELATIONSHIP_ACTIVE[1];

  const layout = useMemo(
    () => computeSankeyFromMatrix(valueMatrix, inActive, outActive),
    [valueMatrix, inActive, outActive],
  );

  const svgWidth = 600;
  const halfWidth = svgWidth / 2;

  // Sort: passive first, active last
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

  // Side column bars
  const renderSideColumn = (
    positions: { y: number; h: number }[],
    heights: number[],
    isLeft: boolean,
  ) => (
    <div className="flex flex-col shrink-0 w-[8px]">
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
              marginBottom: i < 5 && heights[i] > 0 ? 48 : 0,
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
      {/* 日期标签（对齐 dmp-web renderCornerNode） */}
      <div
        className="flex items-center justify-between px-1 pb-4 text-xs text-[#898b8f]"
      >
        <span>26-03-21</span>
        <span>26-04-20</span>
      </div>

      <div className="flex items-start">
        {/* 左侧标签（对齐 dmp-web RelationshipSideNode） */}
        <div className="shrink-0 w-[100px] pr-2">
          {layout.inPositions.map((pos, i) => {
            if (layout.inHeights[i] === 0) return null;
            const isNodeActive = inActive.includes(i);
            return (
              <div
                key={i}
                className="flex flex-col justify-center text-right cursor-pointer rounded-lg px-2 py-1 font-semibold"
                style={{
                  height: pos.h,
                  marginBottom: i < 5 && layout.inHeights[i] > 0 ? 48 : 0,
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
                <div
                  className="tabular-nums text-[16px] leading-[24px]"
                >
                  {formatNum(layout.inValues[i])}
                </div>
              </div>
            );
          })}
        </div>

        {renderSideColumn(layout.inPositions, layout.inHeights, true)}

        {/* SVG 桑基图（对齐 dmp-web StripPath: 贝塞尔曲线） */}
        <div className="flex-1 relative min-w-0">
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
                    : s.isActive
                      ? 0.25
                      : 0.25
                }
                className="cursor-pointer transition-opacity"
                onMouseMove={(e) => handleMouseMove(e, s)}
                onMouseLeave={() => setHoveredStrip(null)}
              />
            ))}
          </svg>

          {/* Tooltip（对齐 dmp-web RelationPopoverContent） */}
          {hoveredStrip && (
            <div
              className="absolute pointer-events-none z-10 bg-white px-6 py-5 whitespace-nowrap text-[14px] leading-[22px] text-[#0d0d0d] font-semibold rounded-[8px]"
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
        <div className="shrink-0 w-[100px] pl-2">
          {layout.outPositions.map((pos, i) => {
            if (layout.outHeights[i] === 0) return null;
            const isNodeActive = outActive.includes(i);
            return (
              <div
                key={i}
                className="flex flex-col justify-center cursor-pointer rounded-lg px-2 py-1 font-semibold"
                style={{
                  height: pos.h,
                  marginBottom: i < 5 && layout.outHeights[i] > 0 ? 48 : 0,
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
                <div
                  className="tabular-nums text-[16px] leading-[24px]"
                >
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

// ─── 触点分析（对齐 brand5r 的 TouchpointAnalysisSection 复用） ─────

type TriggerItem = {
  trigger_id: number;
  trigger_name: string;
  level: number;
  proportion: number;
  tgi: string;
  children?: TriggerItem[];
};

function TriggerCard({
  item,
  isSelected,
  onClick,
  disabled,
}: {
  item: TriggerItem;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="flex flex-col justify-center rounded-lg px-3 py-[7px]"
      style={{
        backgroundColor: isSelected ? '#296bef14' : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onClick={() => !disabled && onClick()}
      onMouseEnter={(e) => {
        if (!isSelected && !disabled)
          (e.currentTarget as HTMLElement).style.backgroundColor = '#49597a0d';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = isSelected
          ? '#296bef14'
          : '#fff';
      }}
    >
      <div className="text-sm font-semibold text-[#0d0d0d] leading-[22px] mb-1 truncate">
        {item.trigger_name}
      </div>
      <div className="flex items-baseline">
        <span className="text-base font-semibold text-[#313233] tabular-nums leading-[24px]">
          {formatPct(item.proportion)}
        </span>
        <span className="text-xs text-[#646566] ml-1 leading-[25px]">
          TGI {item.tgi}
        </span>
      </div>
    </div>
  );
}

function BulletChartRow({
  item,
  parentName,
  benchProportion,
  maxDataB,
}: {
  item: TriggerItem;
  parentName?: string;
  benchProportion?: number;
  maxDataB: number;
}) {
  const pct = item.proportion * 100;
  const benchPct = (benchProportion || 0) * 100;
  const barWidth = maxDataB > 0 ? (pct / maxDataB) * 100 : 0;
  const benchPos = maxDataB > 0 ? (benchPct / maxDataB) * 100 : 0;
  const displayName = parentName
    ? `${parentName} > ${item.trigger_name}`
    : item.trigger_name;

  return (
    <div className="flex items-center min-h-[40px] hover:bg-[#00000008] cursor-pointer">
      <div
        className="shrink-0 text-sm text-[#313233] truncate w-[200px] pl-6 pr-3"
        title={displayName}
      >
        {displayName}
      </div>
      <div
        className="shrink-0 text-sm text-[#313233] text-right tabular-nums w-[60px] pr-3"
      >
        {item.tgi}
      </div>
      <div
        className="flex-1 flex items-center min-h-[40px] pr-6 min-w-[300px]"
      >
        <div className="relative flex-1 h-[16px]">
          <div
            className="absolute left-0 top-0 h-full bg-[#3b82f6]"
            style={{
              width: `${barWidth}%`,
              borderRadius: '0 2px 2px 0',
              transition: 'width 0.3s ease',
            }}
          />
          {benchPct > 0 && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-[2px] h-[18px] bg-[#313233] rounded-[1px]"
              style={{
                left: `${benchPos}%`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TouchpointSection({
  triggerSelf,
  triggerBench,
  subtitle,
}: {
  triggerSelf: any;
  triggerBench: any;
  subtitle: string;
}) {
  const selfData: TriggerItem[] = triggerSelf?.trigger_data || [];
  const benchData: TriggerItem[] = triggerBench?.trigger_data || [];

  const benchMap = useMemo(() => {
    const map: Record<number, TriggerItem> = {};
    const flatten = (items: TriggerItem[]) => {
      items.forEach((item) => {
        map[item.trigger_id] = item;
        if (item.children) flatten(item.children);
      });
    };
    flatten(benchData);
    return map;
  }, [benchData]);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const level1Items = selfData.filter((t) => t.level === 1);

  const selectedLevel1Names = level1Items
    .filter((t) => selectedIds.includes(t.trigger_id))
    .map((t) => t.trigger_name)
    .join(',');

  const chartItems = useMemo(() => {
    const selected =
      selectedIds.length > 0
        ? level1Items.filter((t) => selectedIds.includes(t.trigger_id))
        : level1Items;
    return selected.flatMap((parent) =>
      (parent.children || []).map((child) => ({
        ...child,
        _parentName: parent.trigger_name,
      })),
    );
  }, [level1Items, selectedIds]);

  const maxDataB = useMemo(() => {
    const max = Math.max(...chartItems.map((t) => t.proportion * 100), 0.1);
    const tickBases = [0.05, 0.2, 0.5, 1, 2, 5, 10, 20, 25];
    for (const base of tickBases) {
      const niceMax = Math.ceil(max / base) * base;
      if (niceMax >= max) return Math.min(niceMax, 100);
    }
    return Math.ceil(max / 25) * 25;
  }, [chartItems]);

  const axisLabels = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const v = (maxDataB * i) / 4;
      if (v === 0) return '0%';
      return v < 1
        ? `${v.toFixed(2)}%`
        : Number.isInteger(v)
          ? `${v}%`
          : `${v.toFixed(1)}%`;
    });
  }, [maxDataB]);

  const handleCardClick = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const hasLevel2 = (item: TriggerItem) => (item.children || []).length > 0;

  return (
    <div className="flex flex-col w-full bg-white rounded-xl">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e6eb] relative">
        <span className="text-base font-semibold text-[#0d0d0d] leading-[24px]">
          触点分析
          <span className="font-normal text-sm text-[#898b8f] ml-1">
            {subtitle}
          </span>
        </span>
        <Button
          light
          icon="qualification"
          className="absolute right-5 text-[#626365]"
          onClick={() =>
            window.open(
              'https://doc.weixin.qq.com/doc/w3_AdYAwQb5AJoCNfWj0HZOmSwGE1RDT',
              '_blank',
            )
          }
        >
          触点体系说明
        </Button>
      </div>

      <div className="flex relative min-h-[600px]">
        <div
          className="flex flex-col gap-2 shrink-0 overflow-auto w-[224px] p-3 border-r border-[#495a7a1f]"
        >
          {level1Items.map((item) => (
            <TriggerCard
              key={item.trigger_id}
              item={item}
              isSelected={selectedIds.includes(item.trigger_id)}
              onClick={() => handleCardClick(item.trigger_id)}
              disabled={!hasLevel2(item)}
            />
          ))}
        </div>

        <div
          className="flex flex-col min-w-0 overflow-hidden absolute top-0 left-[224px] right-0 bottom-0"
        >
          <div className="flex items-center h-[56px] border-b border-[#495a7a29] pl-6 gap-3">
            <span className="text-sm text-[#313233]">
              {selectedIds.length > 0 ? (
                <>
                  <span className="font-medium">{selectedLevel1Names}</span>
                  <span className="mx-1 text-[#898b8f]">的</span>
                </>
              ) : (
                <span className="font-medium">全部</span>
              )}
              <span>二级触点</span>
            </span>
            <div className="flex items-center gap-4 ml-3">
              <span className="flex items-center gap-2 text-xs text-[#646566]">
                <span
                  className="inline-block w-2 h-2 rounded-sm bg-[#3b82f6]"
                />
                人群覆盖度
              </span>
              <span className="flex items-center gap-2 text-xs text-[#646566]">
                <span
                  className="inline-block w-[2px] h-3 rounded-sm bg-[#313233]"
                />
                行业均值
              </span>
            </div>
          </div>

          <div className="flex items-center h-[40px] mt-3 pr-2">
            <div
              className="shrink-0 text-sm text-[#898b8f] px-3 w-[200px] pl-6"
            >
              触点
            </div>
            <div
              className="shrink-0 text-sm text-[#898b8f] text-right cursor-pointer select-none w-[60px] pr-3"
            >
              TGI <span className="text-[10px]">↕</span>
            </div>
            <div
              className="flex-1 text-sm text-[#898b8f] px-3 cursor-pointer select-none min-w-[300px]"
            >
              人群覆盖度 <span className="text-[10px]">↕</span>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-auto">
            <div className="flex flex-col gap-1 relative">
              {chartItems.map((item: any) => (
                <BulletChartRow
                  key={item.trigger_id}
                  item={item}
                  parentName={item._parentName}
                  benchProportion={benchMap[item.trigger_id]?.proportion}
                  maxDataB={maxDataB}
                />
              ))}
            </div>
          </div>

          <div
            className="flex items-start mb-3 pl-[260px] pr-6"
          >
            <span
              className="text-xs text-[#939599] absolute left-[248px]"
            >
              人群覆盖度
            </span>
            <div className="flex-1 flex justify-between relative h-5">
              {axisLabels.map((label, i) => (
                <span
                  key={i}
                  className="text-xs text-[#939599] whitespace-nowrap"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 主页面 ─────
const AssetFlow = () => {
  const cdnData = assetFlowCdnData;
  const [activeNav, setActiveNav] = useState('洞察诊断');
  const [activeMenu, setActiveMenu] = useState('brand-asset-flow');
  const [value, setValue] = useState<Date | null>(new Date('2026-04-20'));
  const [selectValue, setSelectValue] = useState<string>('-30');
  const [relationship, setRelationship] = useState(1); // 拉新=1

  // flowunion 数据
  const flowUnionSelf = cdnData?.['af-flowunion-self']?.flow_data || [];
  const flowUnionBench = cdnData?.['af-flowunion-bench']?.flow_data || [];

  // 拉新/蓄水/种草 block data
  const getBlockData = (flowType: number) => {
    const selfItem = flowUnionSelf.find((d: any) => d.flow_type === flowType);
    const benchItem = flowUnionBench.find((d: any) => d.flow_type === flowType);
    const selfVal = selfItem ? Number(selfItem.wuid_cnt) : null;
    const benchVal = benchItem ? Number(benchItem.wuid_cnt) : null;
    let delta: number | null = null;
    if (selfVal !== null && benchVal !== null && benchVal > 0) {
      delta = (selfVal - benchVal) / benchVal;
    }
    return { value: selfVal, delta };
  };

  const formatComparisonRange = () => {
    if (!value) return '';
    const end = new Date(value);
    const start = new Date(value);
    start.setDate(start.getDate() + Number(selectValue));
    const fmt = (d: Date) => {
      const y = String(d.getFullYear()).slice(2);
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    return `${fmt(start)} 对比 ${fmt(end)}`;
  };

  const subtitleMap: Record<number, string> = {
    1: '（拉新：非5R到5R）',
    2: '（蓄水：非5R到R1/R2）',
    3: '（种草：非5R/R1/R2到R3）',
  };

  return (
    <RuyiLayout
      navItems={['首页', '洞察诊断', '人群策略', '策略应用', '全域度量', '生意']}
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
      collapsible
      accountName="香奈儿/CHANEL – 美妆护肤"
      accountId="28392034"
      contentClassName="flex flex-col gap-4"
    >
      {/* ═══ 1. 资产流转 筛选栏（对齐 dmp-web AssetConversionCard） ═══ */}
      <div
        className="rounded-xl bg-white border border-[#edeef2]"
      >
        <div className="px-6 py-5 border-b border-[#e5e6eb]">
          <span className="text-base font-semibold text-[#0d0d0d]">
            资产流转
          </span>
        </div>
        <div className="flex items-center gap-3 px-6 py-3">
          <div className="flex">
            <DatePicker
              className="w-[160px]"
              style={
                {
                  '--odn-dp-border-radius': '6px 0 0 6px',
                } as React.CSSProperties
              }
              allowClear={false}
              value={value}
              onChange={setValue}
            />
            <Select
              className="-ml-px w-[160px]"
              style={
                {
                  '--odn-select-border-radius': '0 6px 6px 0',
                } as React.CSSProperties
              }
              allowClear={false}
              prefix={
                <span className="text-[var(--odn-color-black-9)]">对比</span>
              }
              value={selectValue}
              onChange={setSelectValue}
              options={[
                {
                  options: [
                    { value: '-1', label: '1 天前' },
                    { value: '-3', label: '3 天前' },
                    { value: '-7', label: '7 天前' },
                    { value: '-15', label: '15 天前' },
                    { value: '-30', label: '30 天前' },
                    { value: '-60', label: '60 天前' },
                    { value: '-90', label: '90 天前' },
                  ],
                },
              ]}
            />
          </div>
          <Select
            prefix={
              <span className="text-[var(--odn-color-black-9)]">参照值</span>
            }
            value="industry"
            options={[
              { label: '行业均值', value: 'industry' },
              { label: '竞品均值', value: 'competitor', disabled: true },
              { label: '行业 TOP5 均值', value: 'top5' },
            ]}
            className="w-[200px]"
          />
          <div className="text-sm ml-auto text-[#898b8f]">
            {formatComparisonRange()}
          </div>
        </div>
      </div>

      {/* ═══ 2. 流转关系（对齐 dmp-web ConversionRelationshipCard：拉新/蓄水/种草 + 桑基图） ═══ */}
      <div
        className="bg-white rounded-xl border border-[#edeef2]"
      >
        <div className="px-6 py-5 border-b border-[#e5e6eb]">
          <span className="text-base font-semibold text-[#0d0d0d]">
            流转关系
          </span>
        </div>
        <div className="px-6 py-5">
          {/* 拉新/蓄水/种草 三块（对齐 dmp-web RelationshipBlocks） */}
          <div className="flex gap-4 mb-6">
            {RELATIONSHIP_CONFIG.map((config) => {
              const { value: val, delta } = getBlockData(config.key);
              return (
                <RelationshipBlock
                  key={config.key}
                  config={config}
                  value={val}
                  delta={delta}
                  comparedLabel="行业均值"
                  isSelected={relationship === config.key}
                  onClick={() => setRelationship(config.key)}
                />
              );
            })}
          </div>

          {/* 桑基图 */}
          {cdnData?.['af-flow']?.flow_data ? (
            <SankeyChart
              flowData={cdnData['af-flow'].flow_data}
              relationship={relationship}
            />
          ) : (
            <div
              className="flex items-center justify-center h-[400px] text-sm text-[#898b8f]"
            >
              加载中...
            </div>
          )}
        </div>
      </div>

      {/* ═══ 3. 触点分析（对齐 dmp-web TouchpointSection） ═══ */}
      {cdnData && (
        <TouchpointSection
          triggerSelf={cdnData['af-trigger-self']}
          triggerBench={cdnData['af-trigger-bench']}
          subtitle={subtitleMap[relationship] || ''}
        />
      )}
    </RuyiLayout>
  );
};

export default AssetFlow;
