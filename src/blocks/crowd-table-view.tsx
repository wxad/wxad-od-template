'use client';

import clsx from 'clsx';
import { Icon, Popover } from 'one-design-next';
import React, { useState } from 'react';

// ─── Mock 数据 ────────────────────────────────────────────────

interface CrowdRow {
  name: string;
  count: number;
  ratio: number;
}

const CROWD_DATA: CrowdRow[] = [
  { name: '奢美核心人群', count: 6222720, ratio: 11.39 },
  { name: '运动户外泛兴趣人群', count: 4770466, ratio: 8.73 },
  { name: '白酒行业人群', count: 4545104, ratio: 8.32 },
  { name: '香水核心人群', count: 3256650, ratio: 5.96 },
  { name: '奢侈品核心人群', count: 3004490, ratio: 5.5 },
  { name: '预测换机人群', count: 2652703, ratio: 4.86 },
  { name: '母婴兴趣人群', count: 2132919, ratio: 3.91 },
  { name: '泛宠物人群', count: 2104115, ratio: 3.85 },
  { name: '游戏人群', count: 7009, ratio: 0.01 },
];

interface TouchpointBar {
  label: string;
  value: number;
}

const TOUCHPOINT_MAP: Record<string, TouchpointBar[]> = {
  奢美核心人群: [
    { label: '闪屏', value: 65000 },
    { label: '朋友圈', value: 58000 },
    { label: '信息流', value: 92000 },
    { label: '贴片', value: 15000 },
    { label: 'OneShot', value: 12000 },
    { label: '公众号小\n程序等', value: 20000 },
    { label: '焦点图', value: 18000 },
    { label: '框内广告', value: 25000 },
    { label: '视频号', value: 42000 },
    { label: 'OTT外框', value: 38000 },
    { label: '搜一搜', value: 10000 },
  ],
};

function getDefaultTouchpoints(name: string): TouchpointBar[] {
  if (TOUCHPOINT_MAP[name]) return TOUCHPOINT_MAP[name];
  return [
    { label: '闪屏', value: Math.round(Math.random() * 80000 + 10000) },
    { label: '朋友圈', value: Math.round(Math.random() * 80000 + 10000) },
    { label: '信息流', value: Math.round(Math.random() * 80000 + 10000) },
    { label: '贴片', value: Math.round(Math.random() * 80000 + 10000) },
    { label: 'OneShot', value: Math.round(Math.random() * 80000 + 10000) },
    { label: '公众号小\n程序等', value: Math.round(Math.random() * 80000 + 10000) },
    { label: '焦点图', value: Math.round(Math.random() * 80000 + 10000) },
    { label: '框内广告', value: Math.round(Math.random() * 80000 + 10000) },
    { label: '视频号', value: Math.round(Math.random() * 80000 + 10000) },
    { label: 'OTT外框', value: Math.round(Math.random() * 80000 + 10000) },
    { label: '搜一搜', value: Math.round(Math.random() * 80000 + 10000) },
  ];
}

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

// ─── 左侧：人群排名表 ────────────────────────────────────────

function CrowdTable({
  data,
  selectedIdx,
  onSelect,
}: {
  data: CrowdRow[];
  selectedIdx: number;
  onSelect: (i: number) => void;
}) {
  const maxCount = Math.max(...data.map((d) => d.count));
  const barMaxW = 256;

  return (
    <div className="flex w-[304px] shrink-0 flex-col self-stretch border-r border-black-4">
      {/* Header */}
      <div className="flex h-16 items-center gap-0.5 px-6 text-sm">
        <span className="text-black-9">分</span>
        <span className="px-0.5 py-[5px] text-black-12">机会人群 (R0)</span>
        <span className="text-black-9">对比</span>
      </div>

      {/* Column Header */}
      <div className="relative flex h-8 items-center border-y border-black-4 px-6">
        <span className="text-xs text-black-9">机会人群 (R0)</span>
        <span className="absolute right-[105px] text-xs text-black-9">
          未曝光人数
        </span>
        <span className="absolute right-6 text-xs text-black-9">
          在R0中占比
        </span>
      </div>

      {/* Rows */}
      {data.map((row, i) => {
        const barW = (row.count / maxCount) * barMaxW;
        return (
          <button
            key={row.name}
            type="button"
            onClick={() => onSelect(i)}
            className={clsx(
              'relative flex h-12 w-full items-center border-b border-black-4 px-6 text-left transition-colors',
              selectedIdx === i ? 'bg-blue-1' : 'bg-white hover:bg-black-1'
            )}
          >
            <span className="max-w-[120px] truncate text-sm text-black-12">
              {row.name}
            </span>
            <span className="absolute right-[105px] text-sm tabular-nums text-black-12">
              {fmt(row.count)}
            </span>
            <span className="absolute right-6 text-sm tabular-nums text-black-12">
              {row.ratio.toFixed(2)}%
            </span>
            <div
              className="absolute bottom-px left-6 h-0.5 bg-[#6997f4]"
              style={{ width: barW }}
            />
          </button>
        );
      })}
    </div>
  );
}

// ─── 右侧：资源触点柱状图 ────────────────────────────────────

const CHART_H = 230;
const Y_LABELS = ['100,000', '80,000', '60,000', '40,000', '20,000', '0'];
const MAX_Y = 100000;

function TouchpointChart({
  crowdName,
  data,
}: {
  crowdName: string;
  data: TouchpointBar[];
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-0.5 px-6 py-5 text-sm">
        <span className="text-black-12">{crowdName}</span>
        <span className="text-black-9">分</span>
        <span className="text-black-12">资源触点</span>
        <span className="text-black-9">的</span>
        <button
          type="button"
          className="flex items-center gap-0.5 rounded-[4px] px-0.5 py-1"
        >
          <span className="text-black-12 underline underline-offset-2">
            未曝光人数
          </span>
          <Icon name="chevron-down" size={14} className="text-black-9" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-6">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-[1px] bg-[#6997f4]" />
          <span className="text-xs text-black-12">未曝光人数</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex gap-3 px-6 pb-6 pt-4">
        {/* Y-axis */}
        <div
          className="flex shrink-0 flex-col items-end justify-between pb-[22px] text-xs tabular-nums text-black-8"
          style={{ height: CHART_H + 22 }}
        >
          {Y_LABELS.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>

        {/* Grid + Bars */}
        <div className="flex flex-1 flex-col">
          <div className="relative" style={{ height: CHART_H }}>
            {/* Grid lines */}
            {Y_LABELS.map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-black-3"
                style={{ top: (i / (Y_LABELS.length - 1)) * CHART_H }}
              />
            ))}
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{ borderTop: '1px solid rgba(24,24,24,0.25)' }}
            />

            {/* Bars */}
            <div className="absolute inset-0 flex">
              {data.map((item, i) => {
                const barH = (item.value / MAX_Y) * CHART_H;
                const isHovered = hoveredIdx === i;
                const hasDim = hoveredIdx !== null && hoveredIdx !== i;

                return (
                  <Popover
                    key={i}
                    open={isHovered}
                    placement="right-start"
                    className="!p-0 !border-0 !shadow-none !bg-transparent"
                    content={
                      <div className="flex w-[200px] flex-col gap-2 rounded-[6px] border border-black-4 bg-white p-4 shadow-2">
                        <span className="text-xs text-black-12">
                          {item.label.replace('\n', '')}
                        </span>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="inline-block h-2 w-2 bg-[#6997f4]" />
                            <span className="text-xs text-black-12">
                              未曝光人数
                            </span>
                          </div>
                          <span className="text-xs font-medium tabular-nums text-black-12">
                            {fmt(item.value)}
                          </span>
                        </div>
                      </div>
                    }
                  >
                    <div
                      className="relative flex flex-1 justify-center"
                      style={{ height: CHART_H }}
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      <div
                        className={clsx(
                          'absolute bottom-0 w-[28px] rounded-t-[2px] transition-opacity',
                          hasDim ? 'opacity-40' : 'opacity-100'
                        )}
                        style={{ height: barH, backgroundColor: '#6997f4' }}
                      />
                    </div>
                  </Popover>
                );
              })}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex">
            {data.map((item, i) => (
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
  );
}

// ─── 主组件 ───────────────────────────────────────────────────

const CrowdTableView = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedCrowd = CROWD_DATA[selectedIdx];
  const touchpoints = getDefaultTouchpoints(selectedCrowd.name);

  return (
    <div className="flex overflow-hidden rounded-[8px] border border-black-4 bg-white">
      <CrowdTable
        data={CROWD_DATA}
        selectedIdx={selectedIdx}
        onSelect={setSelectedIdx}
      />
      <TouchpointChart
        crowdName={selectedCrowd.name}
        data={touchpoints}
      />
    </div>
  );
};

export default CrowdTableView;
