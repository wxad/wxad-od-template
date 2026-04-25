'use client';

import { Card, Popover, ScrollArea, Select, Tooltip } from 'one-design-next';
import clsx from 'clsx';
import React, { useCallback, useMemo, useState } from 'react';

// ─── 数据类型 ────────────────────────────────────────────────

interface TriggerNode {
  id: number;
  name: string;
  level: 1 | 2 | 3;
  tgi: number;
  coverage: number; // 0-1 decimal
  children?: TriggerNode[];
}

type SortField = 'tgi' | 'coverage';
type SortDir = 'desc' | 'asc';
type SortState = { field: SortField; dir: SortDir } | null;
type Dimension = 'all' | 'l2' | 'l3';

// ─── Mock 数据 ────────────────────────────────────────────────

const MOCK_DATA: TriggerNode[] = [
  {
    id: 1,
    name: '合约硬广',
    level: 1,
    tgi: 125,
    coverage: 0.042,
    children: [
      { id: 101, name: '开屏广告', level: 2, tgi: 142, coverage: 0.018 },
      { id: 102, name: '焦点图', level: 2, tgi: 108, coverage: 0.024 },
    ],
  },
  {
    id: 2,
    name: '品牌竞价',
    level: 1,
    tgi: 118,
    coverage: 0.035,
    children: [
      { id: 201, name: '微信朋友圈', level: 2, tgi: 135, coverage: 0.022 },
      { id: 202, name: '腾讯新闻', level: 2, tgi: 112, coverage: 0.008 },
      { id: 203, name: '腾讯视频', level: 2, tgi: 98, coverage: 0.005 },
    ],
  },
  {
    id: 3,
    name: '效果竞价',
    level: 1,
    tgi: 105,
    coverage: 0.068,
    children: [
      { id: 301, name: '微信朋友圈', level: 2, tgi: 115, coverage: 0.032 },
      { id: 302, name: '优量汇', level: 2, tgi: 96, coverage: 0.02 },
      { id: 303, name: '腾讯新闻', level: 2, tgi: 102, coverage: 0.016 },
    ],
  },
  {
    id: 4,
    name: '搜索广告',
    level: 1,
    tgi: 155,
    coverage: 0.025,
    children: [
      { id: 401, name: '微信搜一搜', level: 2, tgi: 168, coverage: 0.015 },
      { id: 402, name: 'QQ浏览器', level: 2, tgi: 132, coverage: 0.01 },
    ],
  },
  {
    id: 5,
    name: '内容营销',
    level: 1,
    tgi: 112,
    coverage: 0.045,
    children: [
      { id: 501, name: '视频号', level: 2, tgi: 125, coverage: 0.028 },
      { id: 502, name: '公众号', level: 2, tgi: 98, coverage: 0.017 },
    ],
  },
  {
    id: 6,
    name: '小程序',
    level: 1,
    tgi: 138,
    coverage: 0.052,
    children: [
      { id: 601, name: '品牌小程序', level: 2, tgi: 145, coverage: 0.035 },
      { id: 602, name: '电商小程序', level: 2, tgi: 128, coverage: 0.017 },
    ],
  },
  {
    id: 7,
    name: '企业微信',
    level: 1,
    tgi: 92,
    coverage: 0.018,
    children: [
      { id: 701, name: '企微对话', level: 2, tgi: 95, coverage: 0.012 },
      { id: 702, name: '企微朋友圈', level: 2, tgi: 88, coverage: 0.006 },
    ],
  },
  {
    id: 8,
    name: '线下',
    level: 1,
    tgi: 78,
    coverage: 0.008,
    children: [],
  },
];

/** Benchmark: ~0.8x coverage, ~0.9x tgi */
function deriveBenchmark(node: TriggerNode): TriggerNode {
  return {
    ...node,
    tgi: Math.round(node.tgi * 0.9),
    coverage: +(node.coverage * 0.8).toFixed(4),
    children: node.children?.map(deriveBenchmark),
  };
}

const BENCHMARK_DATA: TriggerNode[] = MOCK_DATA.map(deriveBenchmark);

// ─── 工具函数 ────────────────────────────────────────────────

function formatPct(v: number): string {
  return `${(v * 100).toFixed(2)}%`;
}

/** Flat row representation for the bullet chart. */
interface FlatRow {
  id: number;
  name: string;
  parentName?: string;
  tgi: number;
  coverage: number;
  benchmarkTgi: number;
  benchmarkCoverage: number;
}

function findBenchmarkNode(id: number, nodes: TriggerNode[]): TriggerNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findBenchmarkNode(id, n.children);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Flatten the data tree based on selected L1 ids and dimension.
 * - No selection (or multi-select): show all L1 items as rows.
 * - Single select + "l2": show L2 children of the selected L1.
 * - Single select + "l3": show L3 children if they exist (falls back to L2).
 */
function flattenRows(
  selectedIds: Set<number>,
  dimension: Dimension,
): FlatRow[] {
  // Nothing selected → show all L1
  if (selectedIds.size === 0) {
    return MOCK_DATA.map((n) => {
      const bm = findBenchmarkNode(n.id, BENCHMARK_DATA);
      return {
        id: n.id,
        name: n.name,
        tgi: n.tgi,
        coverage: n.coverage,
        benchmarkTgi: bm?.tgi ?? 0,
        benchmarkCoverage: bm?.coverage ?? 0,
      };
    });
  }

  // Multi-select → show only selected L1 items
  if (selectedIds.size > 1) {
    return MOCK_DATA.filter((n) => selectedIds.has(n.id)).map((n) => {
      const bm = findBenchmarkNode(n.id, BENCHMARK_DATA);
      return {
        id: n.id,
        name: n.name,
        tgi: n.tgi,
        coverage: n.coverage,
        benchmarkTgi: bm?.tgi ?? 0,
        benchmarkCoverage: bm?.coverage ?? 0,
      };
    });
  }

  // Single select → drill into children
  const parentId = [...selectedIds][0];
  const parent = MOCK_DATA.find((n) => n.id === parentId);
  if (!parent || !parent.children?.length) return [];

  const source = dimension === 'l3'
    ? parent.children.flatMap((c) => c.children?.length ? c.children : [c])
    : parent.children;

  return source.map((n) => {
    const bm = findBenchmarkNode(n.id, BENCHMARK_DATA);
    return {
      id: n.id,
      name: n.name,
      parentName: parent.name,
      tgi: n.tgi,
      coverage: n.coverage,
      benchmarkTgi: bm?.tgi ?? 0,
      benchmarkCoverage: bm?.coverage ?? 0,
    };
  });
}

function sortRows(rows: FlatRow[], sort: SortState): FlatRow[] {
  if (!sort) return rows;
  const { field, dir } = sort;
  return [...rows].sort((a, b) => {
    const diff = field === 'tgi' ? a.tgi - b.tgi : a.coverage - b.coverage;
    return dir === 'asc' ? diff : -diff;
  });
}

/** Compute "nice" max for axis, rounding up to a clean percentage. */
function niceMax(maxCov: number): number {
  const pct = maxCov * 100;
  if (pct <= 1) return 0.01;
  if (pct <= 2) return 0.02;
  if (pct <= 5) return 0.05;
  if (pct <= 8) return 0.08;
  if (pct <= 10) return 0.1;
  return Math.ceil(pct / 5) * 5 / 100;
}

function computeAxisTicks(max: number): string[] {
  const count = 5;
  return Array.from({ length: count }, (_, i) => {
    const v = (max / (count - 1)) * i;
    return `${(v * 100).toFixed(v === 0 ? 0 : 1)}%`;
  });
}

// ─── 排序图标 ────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir?: SortDir }) {
  return (
    <span className="inline-flex flex-col items-center justify-center leading-none">
      <svg width="8" height="5" viewBox="0 0 8 5" className="mb-px">
        <path
          d="M4 0L7.5 5H0.5L4 0Z"
          fill={active && dir === 'asc' ? 'var(--odn-color-blue-6)' : 'var(--odn-color-black-6)'}
        />
      </svg>
      <svg width="8" height="5" viewBox="0 0 8 5">
        <path
          d="M4 5L0.5 0H7.5L4 5Z"
          fill={active && dir === 'desc' ? 'var(--odn-color-blue-6)' : 'var(--odn-color-black-6)'}
        />
      </svg>
    </span>
  );
}

// ─── TriggerCard (左侧面板) ─────────────────────────────────

function TriggerCard({
  node,
  selected,
  disabled,
  onClick,
}: {
  node: TriggerNode;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const inner = (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={clsx(
        'flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left transition-colors',
        disabled && 'cursor-not-allowed opacity-60',
        !disabled && !selected && 'hover:bg-[#49597a0d]',
        selected && 'bg-[#296bef14]',
      )}
    >
      <span className="text-sm font-semibold leading-[22px] text-black-12">
        {node.name}
      </span>
      <span className="flex items-end gap-1.5">
        <span
          className={clsx(
            'font-mono text-base font-semibold leading-6 tabular-nums',
            selected ? 'text-blue-6' : 'text-black-12',
          )}
        >
          {formatPct(node.coverage)}
        </span>
        <span className="flex items-center gap-0.5 pb-px text-black-9">
          <span className="text-xs leading-5">TGI</span>
          <span className="font-mono text-[13px] leading-[22px] tabular-nums">
            {node.tgi}
          </span>
        </span>
      </span>
    </button>
  );

  if (disabled) {
    return (
      <Tooltip content={`${node.name}一级触点下无细分触点`}>
        {inner}
      </Tooltip>
    );
  }

  return inner;
}

// ─── BulletRow 行 ────────────────────────────────────────────

function BulletRowContent({
  row,
  maxCov,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: {
  row: FlatRow;
  maxCov: number;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const barWidthPct = maxCov > 0 ? (row.coverage / maxCov) * 100 : 0;
  const benchmarkLeftPct = maxCov > 0 ? (row.benchmarkCoverage / maxCov) * 100 : 0;

  return (
    <div
      className={clsx(
        'flex h-10 items-center transition-colors',
        isHovered && 'bg-[rgba(49,50,51,0.04)]',
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Name */}
      <div className="w-[200px] shrink-0 overflow-hidden px-6">
        <span className="block truncate text-sm text-black-12">
          {row.name}
        </span>
      </div>
      {/* TGI */}
      <div className="flex w-[60px] shrink-0 items-center justify-end">
        <span className="font-mono text-sm tabular-nums text-black-12">
          {row.tgi}
        </span>
      </div>
      {/* Bar */}
      <div className="relative flex flex-1 items-center px-6">
        <div className="relative h-4 w-full">
          <div
            className="absolute left-0 top-0 h-4 rounded-r-[2px] bg-blue-5"
            style={{ width: `${Math.min(barWidthPct, 100)}%` }}
          />
          <div
            className="absolute top-[-1px] h-[18px] w-[2px] bg-[#313233]"
            style={{ left: `${Math.min(benchmarkLeftPct, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function BulletRow({
  row,
  maxCov,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: {
  row: FlatRow;
  maxCov: number;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <Popover
      open={isHovered}
      onOpenChange={(open) => {
        if (!open) onMouseLeave();
      }}
      placement="right-start"
      className="!border-0 !bg-transparent !p-0 !shadow-none"
      content={
        <div className="flex w-[260px] flex-col gap-2 rounded-lg border border-black-4 bg-white p-4 shadow-2">
          <span className="text-sm font-semibold text-black-12">
            {row.parentName ? `${row.parentName} > ${row.name}` : row.name}
          </span>
          <div className="border-t border-black-4" />
          {/* 本品 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-black-12">本品</span>
            <div className="flex items-center justify-between">
              <span className="text-xs text-black-9">人群覆盖度</span>
              <span className="font-mono text-xs font-semibold tabular-nums text-black-12">
                {formatPct(row.coverage)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-black-9">TGI</span>
              <span className="font-mono text-xs font-semibold tabular-nums text-black-12">
                {row.tgi}
              </span>
            </div>
          </div>
          {/* 参考系 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-black-12">参考系</span>
            <div className="flex items-center justify-between">
              <span className="text-xs text-black-9">人群覆盖度</span>
              <span className="font-mono text-xs font-semibold tabular-nums text-black-12">
                {formatPct(row.benchmarkCoverage)}
              </span>
            </div>
          </div>
        </div>
      }
    >
      <BulletRowContent
        row={row}
        maxCov={maxCov}
        isHovered={isHovered}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    </Popover>
  );
}

// ─── 主组件 ────────────────────────────────────────────────

export const TouchpointAnalysis = () => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sort, setSort] = useState<SortState>(null);
  const [dimension, setDimension] = useState<Dimension>('l2');
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);

  // ── 卡片点击（切换选中） ──
  const handleCardClick = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    // Reset dimension when selection changes
    setDimension('l2');
  }, []);

  // ── 排序切换：default → desc → asc → default ──
  const handleSort = useCallback((field: SortField) => {
    setSort((prev) => {
      if (!prev || prev.field !== field) return { field, dir: 'desc' };
      if (prev.dir === 'desc') return { field, dir: 'asc' };
      return null; // asc → back to default
    });
  }, []);

  // ── 计算行数据 ──
  const rows = useMemo(
    () => flattenRows(selectedIds, dimension),
    [selectedIds, dimension],
  );

  const sortedRows = useMemo(() => sortRows(rows, sort), [rows, sort]);

  const maxCov = useMemo(() => {
    const allCov = sortedRows.flatMap((r) => [r.coverage, r.benchmarkCoverage]);
    const rawMax = Math.max(...allCov, 0);
    return niceMax(rawMax);
  }, [sortedRows]);

  const axisTicks = useMemo(() => computeAxisTicks(maxCov), [maxCov]);

  // ── 维度选择器逻辑 ──
  const isSingleSelect = selectedIds.size === 1;
  const singleSelectedNode = isSingleSelect
    ? MOCK_DATA.find((n) => selectedIds.has(n.id))
    : null;
  const hasChildren = !!singleSelectedNode?.children?.length;

  // ── 标题文本 ──
  const dimensionLabel = useMemo(() => {
    if (selectedIds.size === 0) return '全部媒体';
    if (selectedIds.size > 1) return `已选 ${selectedIds.size} 项`;
    return singleSelectedNode?.name ?? '全部媒体';
  }, [selectedIds, singleSelectedNode]);

  return (
    <Card
      elevation={0}
      className="w-full overflow-hidden [--odn-card-radius:12px] [--tp-left-width:224px]"
    >
      {/* Header */}
      <div className="flex h-16 items-center border-b border-black-4 px-6">
        <h3 className="text-base font-semibold text-black-12">触点分析</h3>
      </div>

      <div className="flex" style={{ height: 520 }}>
        {/* ── 左侧：TriggerCard 列表 ── */}
        <ScrollArea className="w-[var(--tp-left-width)] shrink-0 border-r border-black-4">
          <div className="flex flex-col gap-1 p-3">
            {MOCK_DATA.map((node) => {
              const disabled = !node.children?.length;
              return (
                <TriggerCard
                  key={node.id}
                  node={node}
                  selected={selectedIds.has(node.id)}
                  disabled={disabled}
                  onClick={() => handleCardClick(node.id)}
                />
              );
            })}
          </div>
        </ScrollArea>

        {/* ── 右侧：BulletChart ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* 工具栏：维度切换 + 图例 */}
          <div className="flex h-14 items-center justify-between px-6">
            <div className="flex items-center gap-3">
              {isSingleSelect && hasChildren ? (
                <Select
                  value={dimension}
                  onChange={(v) => setDimension(v as Dimension)}
                  options={[
                    { label: '二级触点', value: 'l2' },
                    { label: '三级触点', value: 'l3' },
                  ]}
                  size="small"
                  allowClear={false}
                  popupMatchSelectWidth={false}
                  className="min-w-[100px]"
                  style={{ '--odn-select-border-radius': '6px' } as React.CSSProperties}
                />
              ) : (
                <span className="text-sm font-semibold text-black-12">
                  {dimensionLabel}
                </span>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 text-xs text-black-9">
              <span className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-[1px] bg-blue-5" />
                人群覆盖度
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-[14px] w-[2px] bg-[#313233]" />
                参考系
              </span>
            </div>
          </div>

          {/* 分割线 */}
          <div className="mx-6 border-t border-black-4" />

          {/* 表头 */}
          <div className="flex items-center px-0 pt-1">
            <div className="w-[200px] shrink-0 px-6 py-2">
              <span className="text-sm text-black-9">触点</span>
            </div>
            <button
              type="button"
              onClick={() => handleSort('tgi')}
              className="flex w-[60px] shrink-0 cursor-pointer items-center justify-end gap-1 py-2"
            >
              <span className="text-sm text-black-9">TGI</span>
              <SortIcon
                active={sort?.field === 'tgi'}
                dir={sort?.field === 'tgi' ? sort.dir : undefined}
              />
            </button>
            <button
              type="button"
              onClick={() => handleSort('coverage')}
              className="flex flex-1 cursor-pointer items-center gap-1 px-6 py-2"
            >
              <span className="text-sm text-black-9">人群覆盖度</span>
              <SortIcon
                active={sort?.field === 'coverage'}
                dir={sort?.field === 'coverage' ? sort.dir : undefined}
              />
            </button>
          </div>

          {/* 滚动体 + 坐标轴 */}
          <div className="flex min-h-0 flex-1 flex-col">
            {/* 坐标轴背景网格线 */}
            <div className="relative flex-1">
              {/* Grid lines */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{ left: 260, right: 24 }}
              >
                <div className="flex h-full">
                  {axisTicks.map((_, i) => (
                    <div key={i} className="flex h-full flex-1 justify-start">
                      <div className="h-full w-px bg-black-3" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Scrollable rows */}
              <ScrollArea className="h-full">
                {sortedRows.length > 0 ? (
                  sortedRows.map((row) => (
                    <BulletRow
                      key={row.id}
                      row={row}
                      maxCov={maxCov}
                      isHovered={hoveredRowId === row.id}
                      onMouseEnter={() => setHoveredRowId(row.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    />
                  ))
                ) : (
                  <div className="flex h-32 items-center justify-center text-sm text-black-8">
                    暂无数据
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* X 轴刻度 */}
            <div className="flex shrink-0 items-center pb-3 pt-1">
              <div className="w-[260px] shrink-0" />
              <div className="flex flex-1 pr-6">
                {axisTicks.map((tick, i) => (
                  <span
                    key={i}
                    className={clsx(
                      'flex-1 font-mono text-xs tabular-nums text-black-6',
                      i === 0 ? 'text-left' : i === axisTicks.length - 1 ? 'text-right' : 'text-center',
                    )}
                  >
                    {tick}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ─── Demo wrapper (default export for <code src>) ─────────────

function TouchpointAnalysisDemo() {
  return (
    <div className="rounded-xl bg-[#f2f5fa] p-6">
      <TouchpointAnalysis />
    </div>
  );
}

export default TouchpointAnalysisDemo;
