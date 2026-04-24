'use client';

import clsx from 'clsx';
import { Icon, Popover } from 'one-design-next';
import React, { useState } from 'react';

// ─── Mock 数据 ────────────────────────────────────────────────

interface BarItem {
  label: string;
  value: number;
  benchmark: number;
}

const CROWD_DATA: BarItem[] = [
  { label: '奢美核心\n人群', value: 42, benchmark: 58 },
  { label: '运动户外泛\n兴趣人群', value: 35, benchmark: 60 },
  { label: '白酒行业\n人群', value: 33, benchmark: 55 },
  { label: '香水核心\n人群', value: 92, benchmark: 65 },
  { label: '奢侈品核心\n人群', value: 35, benchmark: 80 },
  { label: '预测换机\n人群', value: 68, benchmark: 70 },
  { label: '母婴兴趣\n人群', value: 58, benchmark: 55 },
  { label: '泛宠物\n人群', value: 72, benchmark: 60 },
  { label: '游戏人群', value: 60, benchmark: 82 },
];

const Y_LABELS = ['100%', '80%', '60%', '40%', '20%', '0'];
const MAX_Y = 100;
const CHART_H = 230;

// ─── Tooltip 卡片 ─────────────────────────────────────────────

function ChartTooltip({ item }: { item: BarItem }) {
  const diff = item.value - item.benchmark;
  const isHigher = diff >= 0;

  return (
    <div className="flex w-[252px] flex-col gap-2 rounded-[6px] border border-black-4 bg-white p-4 shadow-2">
      <span className="text-xs text-black-12">{item.label.replace('\n', '')}</span>
      <div className="flex flex-col gap-1">
        <div className="flex justify-end pr-[7px]">
          <span className="text-xs text-black-9">渗透率</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-2 bg-black-12" />
            <span className="text-xs text-black-12">本品历史均值</span>
          </div>
          <span className="pr-[7px] text-xs font-medium text-black-12">
            {item.benchmark.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 bg-[#6997f4]" />
            <span className="text-xs text-black-12">曝光人群渗透率</span>
          </div>
          <span className="text-xs font-medium text-black-12">
            {item.value.toFixed(2)}%
            <span className="font-normal text-black-10">*</span>
          </span>
        </div>
      </div>
      <div className="border-t border-black-4" />
      <p className="text-[10px] leading-[14px] text-black-10">
        *该指标对比本品历史均值{' '}
        <span className="font-semibold text-black-10">
          {item.benchmark.toFixed(2)}%
        </span>{' '}
        <span className={isHigher ? 'text-green-6' : 'text-red-6'}>
          {isHigher ? '高' : '低'}
        </span>{' '}
        <span
          className={clsx(
            'font-semibold',
            isHigher ? 'text-green-6' : 'text-red-6'
          )}
        >
          {Math.abs(diff).toFixed(2)}%
        </span>
      </p>
    </div>
  );
}

// ─── 单根柱子 ──────────────────────────────────────────────────

function Bar({
  item,
  hoveredIdx,
  idx,
  onHover,
}: {
  item: BarItem;
  hoveredIdx: number | null;
  idx: number;
  onHover: (idx: number | null) => void;
}) {
  const barH = (item.value / MAX_Y) * CHART_H;
  const benchmarkBottom = (item.benchmark / MAX_Y) * CHART_H;
  const isHovered = hoveredIdx === idx;
  const hasDim = hoveredIdx !== null && hoveredIdx !== idx;

  return (
    <Popover
      content={<ChartTooltip item={item} />}
      open={isHovered}
      placement="right-start"
      className="!p-0 !border-0 !shadow-none !bg-transparent"
    >
      <div
        className="relative flex flex-1 justify-center"
        style={{ height: CHART_H }}
        onMouseEnter={() => onHover(idx)}
        onMouseLeave={() => onHover(null)}
      >
        {/* Bar */}
        <div
          className={clsx(
            'absolute bottom-0 w-[28px] rounded-t-[2px] transition-opacity',
            hasDim ? 'opacity-40' : 'opacity-100'
          )}
          style={{
            height: barH,
            backgroundColor: '#6997f4',
          }}
        />
        {/* Benchmark line */}
        <div
          className="absolute left-1 right-1 border-t-2 border-black-12"
          style={{ bottom: benchmarkBottom }}
        />
      </div>
    </Popover>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────

const CrowdBarChart = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="overflow-hidden rounded-[8px] border border-black-4 bg-white">
      {/* Header */}
      <div className="flex items-center gap-0.5 px-6 py-5 text-sm">
        <span className="text-black-9">分</span>
        <span className="px-0.5 py-[5px] text-black-12">机会人群 (R0)</span>
        <span className="text-black-9">的</span>
        <button
          type="button"
          className="flex items-center gap-0.5 rounded-[4px] px-0.5 py-1"
        >
          <span className="text-black-12 underline underline-offset-2">
            渗透率
          </span>
          <Icon name="chevron-down" size={14} className="text-black-9" />
        </button>
      </div>

      {/* Legend + Chart */}
      <div className="flex flex-col gap-4 px-6 pb-6">
        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-[1px] bg-[#6997f4]" />
            <span className="text-xs text-black-12">曝光人群渗透率</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-0.5 w-2 bg-black-12" />
            <span className="text-xs text-black-12">品牌历史均值</span>
          </div>
        </div>

        {/* Chart area */}
        <div className="flex gap-3">
          {/* Y-axis */}
          <div
            className="flex shrink-0 flex-col items-end justify-between pb-[22px] text-xs tabular-nums text-black-8"
            style={{ height: CHART_H + 22 }}
          >
            {Y_LABELS.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>

          {/* Grid + Bars + X labels */}
          <div className="flex flex-1 flex-col">
            <div className="relative" style={{ height: CHART_H }}>
              {/* Grid lines */}
              {Y_LABELS.map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 border-t border-black-3"
                  style={{
                    top: (i / (Y_LABELS.length - 1)) * CHART_H,
                  }}
                />
              ))}
              {/* Axis line */}
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{
                  borderTop: '1px solid rgba(24,24,24,0.25)',
                }}
              />

              {/* Bars */}
              <div className="absolute inset-0 flex">
                {CROWD_DATA.map((item, i) => (
                  <Bar
                    key={i}
                    item={item}
                    idx={i}
                    hoveredIdx={hoveredIdx}
                    onHover={setHoveredIdx}
                  />
                ))}
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex">
              {CROWD_DATA.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-1 justify-center pt-2 text-center"
                >
                  <span className="whitespace-pre-line text-xs leading-5 text-black-8">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrowdBarChart;
