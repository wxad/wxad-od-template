'use client';

import clsx from 'clsx';
import { Tooltip } from 'one-design-next';
import React, { useEffect, useRef, useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// 变体 A · MatrixScatterChart（品牌心智度量，对齐 dmp-web MatrixChart）
// ═══════════════════════════════════════════════════════════════════════════

export interface QuadrantConfig {
  label: string;
  bgColor: string;
  labelBg: string;
  labelColor: string;
  dotColor: string;
}

export type MatrixQuadrants = {
  q1: QuadrantConfig;
  q2: QuadrantConfig;
  q3: QuadrantConfig;
  q4: QuadrantConfig;
};

export function MatrixScatterChart({
  items,
  getXY,
  getLabel,
  quadrants,
  xAxisLabels,
  yAxisLabels,
}: {
  items: any[];
  getXY: (d: any) => [number, number];
  getLabel: (d: any) => string;
  quadrants: MatrixQuadrants;
  xAxisLabels: [string, string];
  yAxisLabels: [string, string];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 500, h: 556 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({ w: entry.contentRect.width, h: 556 });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const PADDING = 34;
  const GAP = 4;
  const toPixelX = (val: number) =>
    PADDING + (val / 100) * (size.w - 2 * PADDING);
  const toPixelY = (val: number) =>
    size.h - PADDING - (val / 100) * (size.h - 2 * PADDING);

  const getQuadrant = (x: number, y: number): QuadrantConfig => {
    if (x > 50 && y > 50) return quadrants.q1;
    if (x <= 50 && y > 50) return quadrants.q2;
    if (x <= 50 && y <= 50) return quadrants.q3;
    return quadrants.q4;
  };

  const getLabelAlign = (x: number): 'left' | 'right' => {
    return x > 50 ? 'right' : 'left';
  };

  const halfW = (size.w - GAP) / 2;
  const halfH = (556 - GAP) / 2;

  return (
    <div
      ref={containerRef}
      className="relative h-[556px] w-full overflow-hidden"
    >
      <div className="absolute inset-0 flex flex-wrap" style={{ gap: GAP }}>
        <div
          className="relative"
          style={{
            width: halfW,
            height: halfH,
            backgroundColor: quadrants.q2.bgColor,
          }}
        >
          <span
            className="absolute left-2 top-2 rounded px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: quadrants.q2.labelBg,
              color: quadrants.q2.labelColor,
            }}
          >
            {quadrants.q2.label}
          </span>
        </div>
        <div
          className="relative"
          style={{
            width: halfW,
            height: halfH,
            backgroundColor: quadrants.q1.bgColor,
          }}
        >
          <span
            className="absolute right-2 top-2 rounded px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: quadrants.q1.labelBg,
              color: quadrants.q1.labelColor,
            }}
          >
            {quadrants.q1.label}
          </span>
        </div>
        <div
          className="relative"
          style={{
            width: halfW,
            height: halfH,
            backgroundColor: quadrants.q3.bgColor,
          }}
        >
          <span
            className="absolute bottom-2 left-2 rounded px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: quadrants.q3.labelBg,
              color: quadrants.q3.labelColor,
            }}
          >
            {quadrants.q3.label}
          </span>
        </div>
        <div
          className="relative"
          style={{
            width: halfW,
            height: halfH,
            backgroundColor: quadrants.q4.bgColor,
          }}
        >
          <span
            className="absolute bottom-2 right-2 rounded px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: quadrants.q4.labelBg,
              color: quadrants.q4.labelColor,
            }}
          >
            {quadrants.q4.label}
          </span>
        </div>
      </div>

      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[#626365]">
        {xAxisLabels[0]}
      </span>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#626365]">
        {xAxisLabels[1]}
      </span>
      <span className="absolute left-1/2 top-1 -translate-x-1/2 text-xs text-[#626365]">
        {yAxisLabels[1]}
      </span>
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-[#626365]">
        {yAxisLabels[0]}
      </span>

      {items.map((d: any, i: number) => {
        const [x, y] = getXY(d);
        const px = toPixelX(x);
        const py = toPixelY(y);
        const q = getQuadrant(x, y);
        const label = getLabel(d);
        const labelSide = getLabelAlign(x);

        return (
          <Tooltip
            key={i}
            popup={
              <div className="min-w-[180px]">
                <div className="mb-2 text-sm font-semibold">{label}</div>
                <div className="text-xs text-[rgba(38,38,41,0.72)]">
                  {d.level1_mind}/{d.level2_mind}
                </div>
              </div>
            }
          >
            <div
              className="absolute flex items-center"
              style={{ left: px, top: py, transform: 'translate(-6px, -6px)' }}
            >
              {labelSide === 'right' && (
                <span className="mr-[6px] max-w-[160px] truncate whitespace-nowrap text-[13px] text-[rgba(38,38,41,0.72)]">
                  {label}
                </span>
              )}
              <div
                className="h-[12px] w-[12px] shrink-0 rounded-full opacity-70"
                style={{
                  backgroundColor: q.dotColor,
                }}
              />
              {labelSide === 'left' && (
                <span className="ml-[6px] max-w-[160px] truncate whitespace-nowrap text-[13px] text-[rgba(38,38,41,0.72)]">
                  {label}
                </span>
              )}
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}

/** 增长矩阵（统一蓝色四象限，对齐 dmp-web SelfMatrixCard） */
export const GROWTH_QUADRANTS: MatrixQuadrants = {
  q1: {
    label: '机会盘',
    bgColor: '#F5F8FF',
    labelBg: '#D4E1FC',
    labelColor: '#296BEF',
    dotColor: '#296BEF',
  },
  q2: {
    label: '潜力盘',
    bgColor: '#F5F8FF',
    labelBg: '#D4E1FC',
    labelColor: '#296BEF',
    dotColor: '#296BEF',
  },
  q3: {
    label: '探索盘',
    bgColor: '#F5F8FF',
    labelBg: '#D4E1FC',
    labelColor: '#296BEF',
    dotColor: '#296BEF',
  },
  q4: {
    label: '主力盘',
    bgColor: '#F5F8FF',
    labelBg: '#D4E1FC',
    labelColor: '#296BEF',
    dotColor: '#296BEF',
  },
};

/** 竞品矩阵（四色象限，对齐 dmp-web CompetitorMatrixCard） */
export const COMPETITOR_QUADRANTS: MatrixQuadrants = {
  q1: {
    label: '竞争激烈',
    bgColor: '#FFF8F7',
    labelBg: '#FBDDDA',
    labelColor: '#C33427',
    dotColor: '#E63D2E',
  },
  q2: {
    label: '本品劣势',
    bgColor: '#FFF8F0',
    labelBg: '#FEE8CC',
    labelColor: '#E68300',
    dotColor: '#FA8E00',
  },
  q3: {
    label: '蓝海市场',
    bgColor: '#F5FBFF',
    labelBg: '#D7EFFF',
    labelColor: '#5DBFFF',
    dotColor: '#35AFFF',
  },
  q4: {
    label: '本品优势',
    bgColor: '#F3FCF7',
    labelBg: '#CDF3DF',
    labelColor: '#06A452',
    dotColor: '#07C160',
  },
};

// ─── 文档站 mock（字段与 CDN growthMatrix / competitorMatrix 一致）────────

const MOCK_GROWTH_LIST = [
  {
    level3_mind: '成分',
    level1_mind: '产品类心智',
    level2_mind: '功效功能',
    industry_share_normalized: 32,
    mind_ratio_normalized: 28,
  },
  {
    level3_mind: '包装',
    level1_mind: '产品类心智',
    level2_mind: '形态体验',
    industry_share_normalized: 38,
    mind_ratio_normalized: 35,
  },
  {
    level3_mind: 'IP文化',
    level1_mind: '品牌类心智',
    level2_mind: '文化情感',
    industry_share_normalized: 42,
    mind_ratio_normalized: 30,
  },
  {
    level3_mind: '味道',
    level1_mind: '产品类心智',
    level2_mind: '感官体验',
    industry_share_normalized: 72,
    mind_ratio_normalized: 38,
  },
  {
    level3_mind: '保湿',
    level1_mind: '产品类心智',
    level2_mind: '功效功能',
    industry_share_normalized: 55,
    mind_ratio_normalized: 62,
  },
  {
    level3_mind: '抗老',
    level1_mind: '产品类心智',
    level2_mind: '功效功能',
    industry_share_normalized: 48,
    mind_ratio_normalized: 58,
  },
  {
    level3_mind: '清洁',
    level1_mind: '产品类心智',
    level2_mind: '基础护理',
    industry_share_normalized: 28,
    mind_ratio_normalized: 48,
  },
  {
    level3_mind: '小样',
    level1_mind: '渠道类心智',
    level2_mind: '试用转化',
    industry_share_normalized: 22,
    mind_ratio_normalized: 42,
  },
];

const MOCK_COMPETITOR_LIST = [
  {
    level3_mind: '抗老',
    level1_mind: '产品类心智',
    level2_mind: '功效功能',
    brand_mind_normalized: 38,
    competitor_mind_avg_normalized: 72,
  },
  {
    level3_mind: '淡化细纹',
    level1_mind: '产品类心智',
    level2_mind: '功效功能',
    brand_mind_normalized: 35,
    competitor_mind_avg_normalized: 32,
  },
  {
    level3_mind: '使用感受',
    level1_mind: '产品类心智',
    level2_mind: '体验口碑',
    brand_mind_normalized: 28,
    competitor_mind_avg_normalized: 40,
  },
  {
    level3_mind: '新技术应用',
    level1_mind: '产品类心智',
    level2_mind: '创新认知',
    brand_mind_normalized: 30,
    competitor_mind_avg_normalized: 36,
  },
  {
    level3_mind: '质地',
    level1_mind: '产品类心智',
    level2_mind: '形态体验',
    brand_mind_normalized: 78,
    competitor_mind_avg_normalized: 42,
  },
  {
    level3_mind: '透亮',
    level1_mind: '产品类心智',
    level2_mind: '功效功能',
    brand_mind_normalized: 62,
    competitor_mind_avg_normalized: 68,
  },
  {
    level3_mind: '洁面',
    level1_mind: '产品类心智',
    level2_mind: '基础护理',
    brand_mind_normalized: 58,
    competitor_mind_avg_normalized: 55,
  },
];

function MindMatrixDualDemo() {
  return (
    <div className="flex gap-4" data-odn-mindshare-matrix>
      <div className="min-w-0 flex-1 rounded-xl border border-[#e2e5ea] bg-white">
        <div className="px-6 py-4">
          <span className="text-base font-semibold text-[#0d0d0d]">
            本品 TOP10 心智增长矩阵
          </span>
        </div>
        <div className="px-6 pb-6">
          <MatrixScatterChart
            items={MOCK_GROWTH_LIST}
            getXY={(d) => [
              parseFloat(String(d.industry_share_normalized)),
              parseFloat(String(d.mind_ratio_normalized)),
            ]}
            getLabel={(d) => d.level3_mind}
            quadrants={GROWTH_QUADRANTS}
            xAxisLabels={['行业心智份额低', '行业心智份额高']}
            yAxisLabels={['环比增长率低', '环比增长率高']}
          />
        </div>
      </div>
      <div className="min-w-0 flex-1 rounded-xl border border-[#e2e5ea] bg-white">
        <div className="px-6 py-4">
          <span className="text-base font-semibold text-[#0d0d0d]">
            竞品 TOP10 心智竞争矩阵
          </span>
        </div>
        <div className="px-6 pb-6">
          <MatrixScatterChart
            items={MOCK_COMPETITOR_LIST}
            getXY={(d) => [
              parseFloat(String(d.brand_mind_normalized)),
              parseFloat(String(d.competitor_mind_avg_normalized)),
            ]}
            getLabel={(d) => d.level3_mind}
            quadrants={COMPETITOR_QUADRANTS}
            xAxisLabels={['本品心智量低', '本品心智量高']}
            yAxisLabels={['竞品心智量低', '竞品心智量高']}
          />
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// 变体 B · 资产占比 × R3 流入率（商品人群资产）
// ═══════════════════════════════════════════════════════════════════════════

type BrandDot = {
  name: string;
  x: number;
  y: number;
  quadrant: 0 | 1 | 2 | 3;
  assetRank: number;
  r3Rank: number;
  labelSide?: 'left' | 'right';
};

// ─── Mock 数据 ────────────────────────────────────────────

const BRANDS: BrandDot[] = [
  { name: '芭比波朗', x: 0.58, y: 0.16, quadrant: 0, assetRank: 2, r3Rank: 1, labelSide: 'left' },
  { name: '蒂普提克', x: 0.24, y: 0.48, quadrant: 0, assetRank: 8, r3Rank: 4, labelSide: 'right' },
  { name: '资生堂', x: 0.78, y: 0.44, quadrant: 0, assetRank: 3, r3Rank: 5, labelSide: 'left' },
  { name: '悦诗风吟', x: 0.26, y: 0.28, quadrant: 1, assetRank: 6, r3Rank: 3, labelSide: 'right' },
  { name: '普拉达', x: 0.9, y: 0.44, quadrant: 1, assetRank: 4, r3Rank: 2, labelSide: 'left' },
  { name: '欧莱雅', x: 0.15, y: 0.42, quadrant: 2, assetRank: 9, r3Rank: 9, labelSide: 'right' },
  { name: '娇韵诗', x: 0.46, y: 0.2, quadrant: 2, assetRank: 7, r3Rank: 6, labelSide: 'right' },
  { name: '兰芝', x: 0.15, y: 0.22, quadrant: 3, assetRank: 5, r3Rank: 7, labelSide: 'right' },
  { name: '海蓝之谜', x: 0.35, y: 0.54, quadrant: 3, assetRank: 10, r3Rank: 10, labelSide: 'right' },
  { name: '迪奥', x: 0.74, y: 0.14, quadrant: 3, assetRank: 1, r3Rank: 8, labelSide: 'left' },
];

const QUADRANT_META = [
  { label: '潜力盘', corner: 'top-left' as const },
  { label: '机会盘', corner: 'top-right' as const },
  { label: '探索盘', corner: 'bottom-left' as const },
  { label: '突破盘', corner: 'bottom-right' as const },
];

// ─── 散点组件 ────────────────────────────────────────────

function Dot({
  brand,
  isHovered,
  isFaded,
  onHover,
}: {
  brand: BrandDot;
  isHovered: boolean;
  isFaded: boolean;
  onHover: (name: string | null) => void;
}) {
  const isLeft = brand.labelSide === 'left';
  return (
    <div
      className="absolute flex items-center gap-1 cursor-pointer"
      style={{ left: `${brand.x * 100}%`, top: `${brand.y * 100}%`, transform: 'translate(-6px, -6px)' }}
      onMouseEnter={() => onHover(brand.name)}
      onMouseLeave={() => onHover(null)}
    >
      {isLeft && (
        <span
          className={clsx(
            'text-[13px] max-w-[80px] truncate text-center transition-opacity',
            isHovered ? 'text-black-12 font-semibold' : 'text-black-9',
            isFaded && 'opacity-30',
          )}
        >
          {brand.name}
        </span>
      )}
      <span
        className={clsx(
          'w-3 h-3 rounded-full bg-blue-5 flex-none transition-all',
          isHovered && 'ring-2 ring-blue-3 scale-125',
          isFaded && 'opacity-30',
        )}
      />
      {!isLeft && (
        <span
          className={clsx(
            'text-[13px] max-w-[80px] truncate text-center transition-opacity',
            isHovered ? 'text-black-12 font-semibold' : 'text-black-9',
            isFaded && 'opacity-30',
          )}
        >
          {brand.name}
        </span>
      )}
    </div>
  );
}

// ─── Tooltip ────────────────────────────────────────────

function DotTooltip({ brand }: { brand: BrandDot }) {
  const quadrant = QUADRANT_META[brand.quadrant];
  return (
    <div
      className="absolute z-20 bg-white rounded-[8px] border border-black-4 p-4 w-[180px] flex flex-col gap-3 pointer-events-none"
      style={{
        left: `${brand.x * 100}%`,
        top: `${brand.y * 100}%`,
        transform: brand.x > 0.6 ? 'translate(-190px, -50%)' : 'translate(20px, -50%)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-black-12">{brand.name}</span>
        <span className="text-xs text-black-8">{quadrant.label}</span>
      </div>
      <div className="h-px bg-black-4" />
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-black-10">资产占比</span>
          <span className="text-[13px] font-semibold text-black-12 tabular-nums">第 {brand.assetRank} 名</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-black-10">R3 流入率</span>
          <span className="text-[13px] font-semibold text-black-12 tabular-nums">第 {brand.r3Rank} 名</span>
        </div>
      </div>
    </div>
  );
}

// ─── 象限面板 ────────────────────────────────────────────

function QuadrantCell({
  meta,
  brands,
  hoveredName,
  onHover,
}: {
  meta: (typeof QUADRANT_META)[number];
  brands: BrandDot[];
  hoveredName: string | null;
  onHover: (name: string | null) => void;
}) {
  const isTop = meta.corner.startsWith('top');
  const isLeft = meta.corner.endsWith('left');

  const labelPos = clsx(
    'absolute flex items-center justify-center px-2 py-1',
    isTop ? 'top-0' : 'bottom-0',
    isLeft ? 'left-0' : 'right-0',
  );

  return (
    <div className="bg-blue-1 relative overflow-hidden">
      {/* 象限标签 */}
      <div className={clsx(labelPos, 'bg-blue-2')}>
        <span className="text-xs font-medium text-blue-6 leading-4">{meta.label}</span>
      </div>

      {/* 散点 */}
      {brands.map((b) => (
        <React.Fragment key={b.name}>
          <Dot
            brand={b}
            isHovered={hoveredName === b.name}
            isFaded={hoveredName !== null && hoveredName !== b.name}
            onHover={onHover}
          />
          {hoveredName === b.name && <DotTooltip brand={b} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── 主组件 ────────────────────────────────────────────

function AssetR3QuadrantScatter() {
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  const quadrantBrands = [0, 1, 2, 3].map((q) =>
    BRANDS.filter((b) => b.quadrant === q),
  );

  return (
    <div className="rounded-[12px] overflow-hidden border border-black-4 bg-white">
      {/* 标题栏 */}
      <div className="h-16 flex items-center px-6 py-4">
        <span className="text-sm font-semibold text-black-12">品牌排名分布</span>
      </div>

      {/* 四象限图表 */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 grid-rows-2 gap-1 relative" style={{ height: 520 }}>
          {QUADRANT_META.map((meta, i) => (
            <QuadrantCell
              key={meta.label}
              meta={meta}
              brands={quadrantBrands[i]}
              hoveredName={hoveredName}
              onHover={setHoveredName}
            />
          ))}

          {/* 轴标签 */}
          <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-xs text-[#626365] whitespace-nowrap">
            R3 流入率高
          </span>
          <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-xs text-[#626365] whitespace-nowrap">
            R3 流入率低
          </span>
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[#626365] whitespace-nowrap">
            资产占比低
          </span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#626365] whitespace-nowrap text-right">
            资产占比高
          </span>
        </div>
      </div>
    </div>
  );
}

export default function QuadrantScatterBlock() {
  return (
    <div className="flex flex-col gap-16" data-odn-quadrant-scatter>
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-black-9 px-1">
          变体 · 资产占比 × R3 流入率（商品人群资产）
        </h3>
        <AssetR3QuadrantScatter />
      </section>
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-black-9 px-1">
          变体 · 品牌心智双矩阵（与品牌心智度量 workshop 同源）
        </h3>
        <MindMatrixDualDemo />
      </section>
    </div>
  );
}
