'use client';

import clsx from 'clsx';
import { Icon, Select } from 'one-design-next';
import React, { useState } from 'react';

type SankeyNode = { label: string; value: string };
type StripDef = { from: number; to: number; thickness: number; metrics: string[]; flowValue?: string };
type ComputedStrip = StripDef & { leftH0: number; leftH1: number; rightH0: number; rightH1: number };

type MetricKey = '拉新' | '蓄水' | '种草';

const IN_NODES: SankeyNode[] = [
  { label: '非5R 流入', value: '6,324,914' },
  { label: 'R1 触达', value: '3,123,412' },
  { label: 'R2 回应', value: '723,412' },
  { label: 'R3 共鸣', value: '31,914' },
  { label: 'R4 行动', value: '4,914' },
  { label: 'R5 信赖', value: '914' },
];

const OUT_NODES: SankeyNode[] = [
  { label: '非5R 流失', value: '1,104' },
  { label: 'R1 触达', value: '1,223,412' },
  { label: 'R2 回应', value: '723,412' },
  { label: 'R3 共鸣', value: '31,914' },
  { label: 'R4 行动', value: '4,914' },
  { label: 'R5 信赖', value: '914' },
];

const STRIPS: StripDef[] = [
  { from: 0, to: 0, thickness: 6, metrics: ['拉新'], flowValue: '1,104' },
  { from: 0, to: 1, thickness: 150, metrics: ['拉新', '蓄水'], flowValue: '3,123,412' },
  { from: 0, to: 2, thickness: 60, metrics: ['拉新', '蓄水'], flowValue: '1,223,412' },
  { from: 0, to: 3, thickness: 18, metrics: ['拉新', '种草'], flowValue: '324,914' },
  { from: 0, to: 4, thickness: 6, metrics: ['拉新'], flowValue: '24,914' },
  { from: 1, to: 1, thickness: 16, metrics: ['蓄水'], flowValue: '224,234' },
  { from: 1, to: 2, thickness: 48, metrics: ['蓄水'], flowValue: '723,412' },
  { from: 1, to: 3, thickness: 30, metrics: ['蓄水', '种草'], flowValue: '324,914' },
  { from: 1, to: 4, thickness: 22, metrics: ['蓄水'], flowValue: '24,914' },
  { from: 1, to: 5, thickness: 12, metrics: ['蓄水'], flowValue: '914' },
  { from: 2, to: 2, thickness: 30, metrics: ['种草'], flowValue: '324,914' },
  { from: 2, to: 3, thickness: 16, metrics: ['种草'], flowValue: '6,324,914' },
  { from: 2, to: 4, thickness: 10, metrics: ['种草'], flowValue: '24,914' },
  { from: 2, to: 5, thickness: 6, metrics: ['种草'], flowValue: '457' },
  { from: 3, to: 3, thickness: 18, metrics: ['种草'], flowValue: '18,914' },
  { from: 3, to: 4, thickness: 10, metrics: ['种草'], flowValue: '4,914' },
  { from: 3, to: 5, thickness: 6, metrics: ['种草'], flowValue: '914' },
  { from: 4, to: 4, thickness: 12, metrics: ['种草'], flowValue: '4,914' },
  { from: 4, to: 5, thickness: 6, metrics: ['种草'], flowValue: '457' },
  { from: 5, to: 5, thickness: 10, metrics: ['种草'], flowValue: '914' },
];

const METRIC_CARDS: { title: MetricKey; subtitle: string; value: string; comparison: string; comparisonValue: string; positive: boolean }[] = [
  { title: '拉新', subtitle: '非5R到5R', value: '6,324,914', comparison: '超过行业均值', comparisonValue: '24.14%', positive: true },
  { title: '蓄水', subtitle: '非5R到R1/R2', value: '2,846,824', comparison: '超过行业均值', comparisonValue: '31.03%', positive: true },
  { title: '种草', subtitle: '非5R/R1/R2到R3到5R', value: '31,914', comparison: '低于行业均值', comparisonValue: '18.91%', positive: false },
];

const MIDPOINTS_BY_METRIC: Record<string, { value: string; toIdx: number }[]> = {
  拉新: [
    { value: '6,324,914', toIdx: 1 }, { value: '3,324,914', toIdx: 2 },
    { value: '324,914', toIdx: 3 }, { value: '24,914', toIdx: 4 }, { value: '457', toIdx: 5 },
  ],
  蓄水: [
    { value: '2,846,824', toIdx: 1 }, { value: '1,523,412', toIdx: 2 },
    { value: '423,412', toIdx: 3 }, { value: '12,914', toIdx: 4 }, { value: '914', toIdx: 5 },
  ],
  种草: [{ value: '31,914', toIdx: 3 }, { value: '4,914', toIdx: 4 }, { value: '914', toIdx: 5 }],
};

const GAP = 20;
const COL_W = 8;

// ─── 复制图标按钮 ────────────────────────────────────────

function CopyIcon({ withBg, className }: { withBg?: boolean; className?: string }) {
  if (withBg) {
    return (
      <span className={clsx('inline-flex items-center justify-center rounded-[4px] bg-[rgba(41,107,239,0.1)] p-0.5', className)}>
        <Icon name="copy" size={16} className="text-blue-6" />
      </span>
    );
  }
  return <Icon name="copy" size={16} className={clsx('text-black-6 hover:text-black-9 cursor-pointer transition-colors', className)} />;
}

// ─── 布局计算 ────────────────────────────────────────────

function computeLayout(inCount: number, outCount: number, strips: StripDef[], gap: number) {
  const inH = new Array(inCount).fill(0);
  const outH = new Array(outCount).fill(0);
  strips.forEach((s) => { inH[s.from] += s.thickness; outH[s.to] += s.thickness; });

  const build = (heights: number[]) => {
    const pos: { y: number; h: number }[] = [];
    let y = 0;
    for (let i = 0; i < heights.length; i++) {
      pos.push({ y, h: heights[i] });
      if (heights[i] > 0) y += heights[i] + gap;
    }
    return { pos, total: y > 0 ? y - gap : 0 };
  };

  const inL = build(inH);
  const outL = build(outH);

  const leftUsed = new Array(inCount).fill(0);
  const rightUsed = new Array(outCount).fill(0);
  const computed: ComputedStrip[] = strips.map((s) => {
    const lp = inL.pos[s.from];
    const rp = outL.pos[s.to];
    const leftH0 = lp.y + leftUsed[s.from];
    const leftH1 = leftH0 + s.thickness;
    leftUsed[s.from] += s.thickness;
    const rightH0 = rp.y + rightUsed[s.to];
    const rightH1 = rightH0 + s.thickness;
    rightUsed[s.to] += s.thickness;
    return { ...s, leftH0, leftH1, rightH0, rightH1 };
  });

  return { inPos: inL.pos, outPos: outL.pos, inH, outH, svgH: Math.max(inL.total, outL.total), strips: computed };
}

// ─── 侧栏条柱 ────────────────────────────────────────────

function SideCol({ positions, heights, strips, isLeft, activeMetric, hNode }: {
  positions: { y: number; h: number }[]; heights: number[]; strips: ComputedStrip[];
  isLeft: boolean; activeMetric: string; hNode: number | null;
}) {
  return (
    <div className="flex flex-col flex-none" style={{ gap: GAP, width: COL_W }}>
      {positions.map((pos, i) => {
        if (heights[i] === 0) return null;
        const ns = isLeft ? strips.filter((s) => s.from === i) : strips.filter((s) => s.to === i);
        return (
          <div key={i} className="flex flex-col" style={{ height: pos.h }}>
            {ns.map((s, j) => {
              const active = hNode !== null ? s.to === hNode : s.metrics.includes(activeMetric);
              return <div key={j} className={clsx('transition-colors duration-200', active ? 'bg-blue-6' : 'bg-black-6')} style={{ height: s.thickness }} />;
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── 桑基图主体 ────────────────────────────────────────────

function SankeyChart({ activeMetric }: { activeMetric: MetricKey }) {
  const [hNode, setHNode] = useState<number | null>(null);
  const [hStrip, setHStrip] = useState<{ from: number; to: number; flowValue?: string; x: number; y: number } | null>(null);

  const svgW = 600;
  const half = svgW / 2;
  const layout = computeLayout(IN_NODES.length, OUT_NODES.length, STRIPS, GAP);
  const midpoints = MIDPOINTS_BY_METRIC[activeMetric] ?? MIDPOINTS_BY_METRIC['拉新'];

  const isActive = (s: ComputedStrip) => hNode !== null ? s.to === hNode : s.metrics.includes(activeMetric);
  const sorted = [...layout.strips.filter((s) => !isActive(s)), ...layout.strips.filter(isActive)];

  return (
    <div className="flex items-start relative">
      {/* 左侧节点 */}
      <div className="flex-none w-[92px] pr-3">
        {IN_NODES.map((n, i) => {
          const pos = layout.inPos[i];
          if (pos.h === 0) return null;
          const active = hNode !== null
            ? layout.strips.some((s) => s.from === i && s.to === hNode)
            : activeMetric === '拉新' ? i === 0 : false;
          return (
            <div key={i} className="flex flex-col justify-center text-right" style={{ height: pos.h, marginBottom: i < IN_NODES.length - 1 ? GAP : 0 }}>
              <div className={clsx('text-xs font-medium leading-tight whitespace-nowrap', active ? 'text-blue-6' : 'text-black-9')}>{n.label}</div>
              <div className={clsx('text-sm font-semibold leading-tight tabular-nums', active ? 'text-blue-6' : 'text-black-12')}>{n.value}</div>
            </div>
          );
        })}
      </div>

      <SideCol positions={layout.inPos} heights={layout.inH} strips={layout.strips} isLeft activeMetric={activeMetric} hNode={hNode} />

      {/* SVG 流带 */}
      <div className="flex-1 relative min-w-0">
        <svg className="block w-full" style={{ height: layout.svgH }} viewBox={`0 0 ${svgW} ${layout.svgH}`} preserveAspectRatio="none" fill="none">
          {sorted.map((s) => {
            const act = isActive(s);
            return (
              <path
                key={`${s.from}-${s.to}`}
                d={`M0 ${s.leftH0}V${s.leftH1}C${half} ${s.leftH1} ${half} ${s.rightH1} ${svgW} ${s.rightH1}V${s.rightH0}C${half} ${s.rightH0} ${half} ${s.leftH0} 0 ${s.leftH0}Z`}
                fill={act ? 'var(--odn-color-blue-6)' : 'rgba(73,90,122,0.16)'}
                opacity={hStrip?.from === s.from && hStrip?.to === s.to ? 0.5 : act ? 0.3 : 0.15}
                className="transition-all duration-300 cursor-pointer"
                onMouseMove={(e) => {
                  const svg = e.currentTarget.closest('svg');
                  if (!svg) return;
                  const r = svg.getBoundingClientRect();
                  setHStrip({ from: s.from, to: s.to, flowValue: s.flowValue, x: e.clientX - r.left, y: e.clientY - r.top });
                }}
                onMouseLeave={() => setHStrip(null)}
              />
            );
          })}
        </svg>

        {/* 流带 Tooltip */}
        {hStrip?.flowValue && (
          <div
            className="absolute pointer-events-none z-10 bg-white rounded-[8px] px-6 py-5 flex items-center justify-between gap-4 whitespace-nowrap"
            style={{
              left: hStrip.x,
              top: hStrip.y - 50,
              transform: 'translateX(-50%)',
              boxShadow: '0 10px 36px rgba(0,0,0,0.16), 0 6px 15px rgba(0,0,0,0.07)',
            }}
          >
            <span className="text-sm font-semibold text-black-12">
              {IN_NODES[hStrip.from]?.label} → {OUT_NODES[hStrip.to]?.label}
            </span>
            <span className="text-sm font-semibold text-black-12 tabular-nums">{hStrip.flowValue}</span>
            <Icon name="copy" size={16} className="text-black-7" />
          </div>
        )}

        {/* 指标中间值标注 */}
        {hNode === null && midpoints.map((mp, i) => {
          const rp = layout.outPos[mp.toIdx];
          if (!rp) return null;
          return <div key={i} className="absolute right-8 text-sm font-semibold text-blue-6 tabular-nums" style={{ top: rp.y + rp.h / 2 - 10 }}>{mp.value}</div>;
        })}

        {/* 节点 hover 时的流入值 */}
        {hNode !== null && layout.strips.filter((s) => s.to === hNode).map((s) => {
          if (!s.flowValue) return null;
          return <div key={`lv-${s.from}`} className="absolute left-2 text-sm font-semibold text-blue-6 tabular-nums" style={{ top: (s.leftH0 + s.leftH1) / 2 - 10 }}>{s.flowValue}</div>;
        })}
      </div>

      <SideCol positions={layout.outPos} heights={layout.outH} strips={layout.strips} isLeft={false} activeMetric={activeMetric} hNode={hNode} />

      {/* 右侧节点 */}
      <div className="flex-none w-[100px] pl-3">
        {OUT_NODES.map((n, i) => {
          const pos = layout.outPos[i];
          if (pos.h === 0) return null;
          const active = hNode !== null ? hNode === i : false;
          return (
            <div
              key={i}
              className={clsx(
                'flex flex-col justify-center cursor-pointer rounded-[8px] px-2 -mx-2 transition-colors',
                active && 'bg-[rgba(41,107,239,0.05)]',
              )}
              style={{ height: pos.h, marginBottom: i < OUT_NODES.length - 1 ? GAP : 0 }}
              onMouseEnter={() => setHNode(i)}
              onMouseLeave={() => setHNode(null)}
            >
              <div className="flex items-center gap-1">
                <span className={clsx('text-xs font-medium leading-tight whitespace-nowrap', active ? 'text-blue-6' : 'text-black-9')}>{n.label}</span>
                {active && <CopyIcon withBg />}
              </div>
              <div className={clsx('text-sm font-semibold leading-tight tabular-nums', active ? 'text-blue-6' : 'text-black-12')}>{n.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 状态展板通用组件 ────────────────────────────────────

function StateSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3">
        <h4 className="text-sm font-medium text-black-12">{title}</h4>
        {description && <p className="text-xs text-black-8 mt-1">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function StateCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-black-7">{label}</span>
      <div className="rounded-lg border border-black-3 bg-white px-3 py-2">{children}</div>
    </div>
  );
}

// ─── 指标卡状态展板 ─────────────────────────────────────

function MetricCardShowcase() {
  return (
    <StateSection title="指标卡 (MetricCard)" description="3 种状态：选中态 / 悬停态 / 常态">
      <div className="grid grid-cols-3 gap-4">
        {/* 选中态 */}
        <StateCell label="选中态">
          <div className="rounded-[12px] border border-blue-6 bg-blue-1 px-5 py-3.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-black-12"><span className="font-semibold">拉新</span> <span className="text-black-12">(非5R到5R)</span></div>
              <CopyIcon withBg />
            </div>
            <div className="text-2xl font-semibold text-black-12 tabular-nums">6,324,914</div>
            <div className="text-xs"><span className="text-black-12">超过行业均值</span> <span className="font-medium text-red-6 tabular-nums">24.14%</span></div>
          </div>
        </StateCell>

        {/* 悬停态 */}
        <StateCell label="悬停态">
          <div className="rounded-[12px] border border-blue-4 bg-blue-1/50 px-5 py-3.5 flex flex-col gap-1.5 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="text-sm text-black-12"><span className="font-semibold">蓄水</span> <span>(非5R到R1/R2)</span></div>
              <CopyIcon />
            </div>
            <div className="text-2xl font-semibold text-black-12 tabular-nums">2,846,824</div>
            <div className="text-xs"><span className="text-black-12">超过行业均值</span> <span className="font-medium text-green-6 tabular-nums">31.03%</span></div>
          </div>
        </StateCell>

        {/* 常态 */}
        <StateCell label="常态">
          <div className="rounded-[12px] border border-black-3 bg-black-1 px-5 py-3.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-black-12"><span className="font-semibold">种草</span> <span>(非5R/R1/R2到R3)</span></div>
              <CopyIcon />
            </div>
            <div className="text-2xl font-semibold text-black-12 tabular-nums">31,914</div>
            <div className="text-xs text-black-8">低于行业均值</div>
          </div>
        </StateCell>
      </div>
    </StateSection>
  );
}

// ─── 节点卡状态展板 ─────────────────────────────────────

function NodeCardShowcase() {
  return (
    <StateSection title="节点卡 (NodeCard)" description="Active × Hover = 4 种组合。左侧节点右对齐，右侧节点左对齐">
      <div className="rounded-lg border border-black-3 bg-white overflow-hidden">
        {/* 表头 */}
        <div className="grid grid-cols-[100px_1fr_1fr] text-xs text-black-7 border-b border-black-3">
          <div className="px-3 py-2 border-r border-black-3" />
          <div className="px-3 py-2 border-r border-black-3 text-center">Actived（流带高亮）</div>
          <div className="px-3 py-2 text-center">Inactived（无高亮）</div>
        </div>

        {/* Hovered 行 */}
        <div className="grid grid-cols-[100px_1fr_1fr] border-b border-black-3">
          <div className="flex items-center px-3 text-xs text-black-9 border-r border-black-3 bg-black-1">Hovered</div>
          <div className="flex items-center justify-center p-3 border-r border-black-3">
            <div className="rounded-[8px] bg-[rgba(41,107,239,0.05)] px-2 py-1 w-[107px]">
              <div className="flex items-center gap-1">
                <CopyIcon withBg />
                <span className="text-sm font-semibold text-blue-6">R1 触达</span>
              </div>
              <div className="text-base font-semibold text-blue-6 tabular-nums">1,223,412</div>
            </div>
          </div>
          <div className="flex items-center justify-center p-3">
            <div className="rounded-[8px] bg-[rgba(73,89,122,0.05)] px-2 py-1 w-[107px]">
              <div className="text-sm font-semibold text-black-8">R2 回应</div>
              <div className="text-base font-semibold text-black-8 tabular-nums">723,412</div>
            </div>
          </div>
        </div>

        {/* Default 行 */}
        <div className="grid grid-cols-[100px_1fr_1fr]">
          <div className="flex items-center px-3 text-xs text-black-9 border-r border-black-3 bg-black-1">Default</div>
          <div className="flex items-center justify-center p-3 border-r border-black-3">
            <div className="rounded-[8px] px-2 py-1 w-[107px]">
              <div className="flex items-center gap-1">
                <CopyIcon />
                <span className="text-sm font-semibold text-blue-6">R1 触达</span>
              </div>
              <div className="text-base font-semibold text-blue-6 tabular-nums">1,223,412</div>
            </div>
          </div>
          <div className="flex items-center justify-center p-3">
            <div className="rounded-[8px] px-2 py-1 w-[107px]">
              <div className="text-sm font-semibold text-black-8">R2 回应</div>
              <div className="text-base font-semibold text-black-8 tabular-nums">723,412</div>
            </div>
          </div>
        </div>
      </div>
    </StateSection>
  );
}

// ─── Tooltip 状态展板 ────────────────────────────────────

function TooltipShowcase() {
  return (
    <StateSection title="流带 Tooltip (Popover)" description="Hover 流带时出现，展示流转方向和数值">
      <div className="grid grid-cols-2 gap-4">
        <StateCell label="Hover 态">
          <div
            className="inline-flex items-center justify-between gap-4 bg-white rounded-[8px] px-6 py-5 whitespace-nowrap w-full"
            style={{ boxShadow: '0 10px 36px rgba(0,0,0,0.16), 0 6px 15px rgba(0,0,0,0.07)' }}
          >
            <span className="text-sm font-semibold text-black-12">非 5R 机会 → R1 触达</span>
            <span className="text-sm font-semibold text-black-12 tabular-nums">3,123,412</span>
            <Icon name="copy" size={16} className="text-black-7" />
          </div>
        </StateCell>
        <StateCell label="样式说明">
          <div className="text-xs text-black-9 flex flex-col gap-1.5">
            <div><span className="text-black-7">圆角：</span>rounded-[8px]</div>
            <div><span className="text-black-7">内边距：</span>px-6 py-5（24px 20px）</div>
            <div><span className="text-black-7">阴影：</span>shadow-04 双层</div>
            <div><span className="text-black-7">内容：</span>方向标签 + 数值 + 复制图标</div>
          </div>
        </StateCell>
      </div>
    </StateSection>
  );
}

// ─── 主组件：三段式结构 ────────────────────────────────

const SankeyChartDemo = () => {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('拉新');

  return (
    <div>
      {/* ── 1. 预览：完整桑基图 ── */}
      <div className="py-6 px-4">
        <div className="text-center mb-4 flex flex-col gap-1">
          <h3 className="text-base font-semibold text-black-12">桑基图 · 资产流转</h3>
          <p className="text-sm text-black-9 max-w-lg mx-auto">
            5R 人群资产在周期内的流入/流出/流转关系。点击指标卡切换拉新/蓄水/种草高亮，hover 右侧节点查看流入构成，hover 流带查看流转人数。
          </p>
        </div>

        {/* 标题+筛选栏 */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[15px] font-semibold text-black-12">流转关系</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-black-8">对比</span>
            <Select
              className="w-[130px]"
              size="small"
              allowClear={false}
              value="industry"
              options={[
                { label: '行业均值', value: 'industry' },
                { label: '商品均值', value: 'product' },
                { label: '行业TOP5均值', value: 'top5' },
              ]}
            />
          </div>
        </div>

        {/* 指标卡片 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {METRIC_CARDS.map((c) => {
            const isSelected = activeMetric === c.title;
            return (
              <div
                key={c.title}
                className={clsx(
                  'rounded-[12px] p-4 cursor-pointer border transition-all duration-200',
                  isSelected
                    ? 'border-blue-6 bg-blue-1'
                    : 'border-black-3 bg-black-1 hover:border-blue-4 hover:bg-blue-1/50',
                )}
                onClick={() => setActiveMetric(c.title)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-black-10">
                    <span className={clsx('font-semibold', isSelected ? 'text-blue-6' : 'text-black-12')}>{c.title}</span>
                    <span className="ml-1 text-black-8">({c.subtitle})</span>
                  </div>
                  <CopyIcon withBg={isSelected} className={clsx(!isSelected && 'text-black-6 hover:text-black-9')} />
                </div>
                <div className={clsx('text-2xl font-semibold mb-1 tabular-nums', isSelected ? 'text-blue-6' : 'text-black-12')}>{c.value}</div>
                <div className="text-xs">
                  <span className="text-black-8">{c.comparison}</span>
                  <span className={clsx('ml-1 font-medium tabular-nums', c.positive ? 'text-green-6' : 'text-red-6')}>{c.comparisonValue}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 日期范围 */}
        <div className="px-1 pb-3 flex justify-between text-xs text-black-8">
          <span className="tabular-nums">25-08-18</span>
          <span className="tabular-nums">25-09-17</span>
        </div>

        {/* 桑基图主体 */}
        <SankeyChart activeMetric={activeMetric} />
      </div>

      {/* ── 2. 子元素状态展板 ── */}
      <div className="mt-8 rounded-xl border border-black-3 bg-black-1 p-6">
        <h3 className="text-[length:var(--odn-font-size-headline-5)] font-medium text-black-12 mb-6">
          子元素状态展板
        </h3>
        <div className="flex flex-col gap-8">
          <MetricCardShowcase />
          <NodeCardShowcase />
          <TooltipShowcase />
        </div>
      </div>

      {/* ── 3. 配置面板 ── */}
      <div className="border-t border-black-3 px-4 py-4 mt-4">
        <div className="text-[length:var(--odn-font-size-headline-5)] font-medium text-black-12 mb-3">
          配置项
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-[length:var(--odn-font-size-text-md)] text-black-9">
              当前指标
            </label>
            <Select
              value={activeMetric}
              onChange={(v) => setActiveMetric(v as MetricKey)}
              options={[
                { label: '拉新（非5R到5R）', value: '拉新' },
                { label: '蓄水（非5R到R1/R2）', value: '蓄水' },
                { label: '种草（非5R/R1/R2到R3到5R）', value: '种草' },
              ]}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[length:var(--odn-font-size-text-md)] text-black-9">
              对比参照
            </label>
            <Select
              value="industry"
              options={[
                { label: '行业均值', value: 'industry' },
                { label: '商品均值', value: 'product' },
                { label: '行业TOP5均值', value: 'top5' },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SankeyChartDemo;
