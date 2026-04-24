'use client';

import clsx from 'clsx';
import * as echarts from 'echarts/core';
import { LineChart, type LineSeriesOption } from 'echarts/charts';
import {
  GridComponent,
  type GridComponentOption,
  TooltipComponent,
  type TooltipComponentOption,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { Card, Icon } from 'one-design-next';
import React, { useEffect, useRef, useState } from 'react';

// ECharts 按需注册
echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

type TrendEChartsOption = echarts.ComposeOption<
  LineSeriesOption | GridComponentOption | TooltipComponentOption
>;

function readCssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

// ─── 数据类型 ────────────────────────────────────────────────

interface MetricData {
  label: string;
  value: string;
  change: number;
  refLabel: string;
  refValue: string;
  rank?: number;
  rankChange?: number;
  dotColor: string;
}

interface DistSegment {
  label: string;
  percent: number;
  color: string;
  dotColor: string;
}

interface TrendPoint {
  date: string;
  value: number;
  share: number;
}

// ─── Mock 数据 ────────────────────────────────────────────────

const METRICS: MetricData[] = [
  {
    label: '品牌心智量',
    value: '3,945,516',
    change: 13.04,
    refLabel: '{参考系}',
    refValue: '6,324,914',
    dotColor: 'bg-blue-6',
  },
  {
    label: '品牌行业份额',
    value: '24.14%',
    change: 13.04,
    refLabel: '{参考系}',
    refValue: '30.21%',
    rank: 7,
    rankChange: -1,
    dotColor: 'bg-orange-5',
  },
];

const DIST_SEGMENTS: DistSegment[] = [
  { label: '触达心智', percent: 5.63, color: 'bg-[#aade3a]', dotColor: 'bg-[#aade3a]' },
  { label: '互动心智', percent: 15.37, color: 'bg-[#33d2cb]', dotColor: 'bg-[#33d2cb]' },
  { label: '分享心智', percent: 20.79, color: 'bg-[#5dbfff]', dotColor: 'bg-[#5dbfff]' },
  { label: '搜索心智', percent: 63.21, color: 'bg-blue-5', dotColor: 'bg-blue-5' },
];

const TREND_DATA: TrendPoint[] = [
  { date: '07.17', value: 3100000, share: 30 },
  { date: '07.23', value: 2800000, share: 28 },
  { date: '07.30', value: 3200000, share: 32 },
  { date: '08.06', value: 3000000, share: 30 },
  { date: '08.13', value: 3400000, share: 33 },
  { date: '08.20', value: 3100000, share: 31 },
  { date: '08.27', value: 3600000, share: 35 },
  { date: '08.29', value: 3300000, share: 33 },
  { date: '09.05', value: 3800000, share: 37 },
  { date: '09.12', value: 3400000, share: 34 },
  { date: '09.19', value: 2500000, share: 28 },
  { date: '09.26', value: 2800000, share: 30 },
  { date: '10.03', value: 3200000, share: 32 },
  { date: '10.10', value: 3945516, share: 40 },
  { date: '10.17', value: 4800000, share: 48 },
];

// ─── ECharts 趋势折线图 ────────────────────────────────────────
//
// 用 echarts 重写原手写 SVG 版本：
// - 双轴（左品牌心智量万为单位，右行业份额%）
// - 主线蓝色实线 blue-5，对比线橙色虚线 #FFAC40
// - 网格线、轴文字颜色从 ODN CSS 变量读取
// - hover：十字虚线 + 双数据点放大 + tooltip（沿用原设计的"日期 / 心智量 / 行业份额"三行）
// - hover 事件通过 onHover 回调暴露给父级，用于标题栏切换日期显示

const Y_MAX_LEFT = 5000000;
const Y_MAX_RIGHT = 50;

/** 数字千分位格式化 */
function fmtNum(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function TrendChart({
  data,
  onHover,
}: {
  data: TrendPoint[];
  onHover: (idx: number | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onHoverRef = useRef(onHover);
  onHoverRef.current = onHover;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = echarts.init(el);

    const blue5 = readCssVar('--odn-color-blue-5', '#6997f4');
    const black3 = readCssVar('--odn-color-black-3', '#e2e5ea');
    const black5 = readCssVar('--odn-color-black-5', '#495a7a1f');
    const black9 = readCssVar('--odn-color-black-9', '#898b8f');
    const black12 = readCssVar('--odn-color-black-12', '#0d0d0d');
    const orange = '#FFAC40';

    const option: TrendEChartsOption = {
      animation: false,
      grid: {
        left: 56,
        right: 56,
        top: 34, // 给上方的轴标题留空间
        bottom: 28,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: black5,
            type: [3, 2],
            width: 1,
          },
        },
        backgroundColor: '#fff',
        borderColor: readCssVar('--odn-color-black-4', '#e2e5ea'),
        borderWidth: 1,
        padding: [10, 14],
        extraCssText: 'box-shadow: var(--odn-shadow-2);border-radius:8px;',
        textStyle: { color: black12, fontSize: 12 },
        formatter: (params) => {
          const arr = params as unknown as Array<{
            axisValueLabel: string;
            seriesName: string;
            value: number;
            color: string;
          }>;
          if (!arr.length) return '';
          const date = arr[0].axisValueLabel;
          const rows = arr
            .map((p) => {
              const fmt =
                p.seriesName === '品牌心智量'
                  ? fmtNum(p.value)
                  : `${p.value}%`;
              return `
                <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;margin-top:6px;">
                  <span style="display:inline-flex;align-items:center;gap:6px;color:${black9};">
                    <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${p.color};"></span>
                    ${p.seriesName}
                  </span>
                  <span style="color:${black12};font-weight:500;font-variant-numeric:tabular-nums;">${fmt}</span>
                </div>`;
            })
            .join('');
          return `<div style="min-width:180px;"><div style="color:${black12};font-weight:500;">${date}</div>${rows}</div>`;
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map((d) => d.date),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: black9,
          fontSize: 10,
          interval: 0, // 强制显示所有日期，与设计稿一致
          hideOverlap: false,
          margin: 12,
        },
      },
      yAxis: [
        {
          // 左轴：品牌心智量（千分位全数字，不用"万"简写，按设计稿）
          type: 'value',
          min: 0,
          max: Y_MAX_LEFT,
          interval: Y_MAX_LEFT / 5,
          name: '品牌心智量',
          nameLocation: 'end',
          nameGap: 14,
          nameTextStyle: {
            color: black9,
            fontSize: 11,
            align: 'right',
            verticalAlign: 'bottom',
          },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: black9,
            fontSize: 10,
            margin: 10,
            formatter: (v: number) => v.toLocaleString('en-US'),
          },
          splitLine: {
            lineStyle: {
              color: black3,
              width: 1,
            },
          },
        },
        {
          // 右轴：行业份额
          type: 'value',
          min: 0,
          max: Y_MAX_RIGHT,
          interval: Y_MAX_RIGHT / 5,
          name: '行业份额',
          nameLocation: 'end',
          nameGap: 14,
          nameTextStyle: {
            color: black9,
            fontSize: 11,
            align: 'left',
            verticalAlign: 'bottom',
          },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: black9,
            fontSize: 10,
            margin: 10,
            formatter: (v: number) => `${v}%`,
          },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: '品牌心智量',
          type: 'line',
          yAxisIndex: 0,
          data: data.map((d) => d.value),
          smooth: false,
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 5,
          itemStyle: { color: blue5, borderColor: '#fff', borderWidth: 2 },
          lineStyle: { color: blue5, width: 2 },
          emphasis: {
            scale: 1.6,
            itemStyle: { borderColor: '#fff', borderWidth: 2 },
          },
          z: 3,
        },
        {
          name: '行业份额',
          type: 'line',
          yAxisIndex: 1,
          data: data.map((d) => d.share),
          smooth: false,
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 5,
          itemStyle: { color: orange, borderColor: '#fff', borderWidth: 2 },
          lineStyle: { color: orange, width: 2, type: [5, 3] },
          emphasis: {
            scale: 1.6,
            itemStyle: { borderColor: '#fff', borderWidth: 2 },
          },
          z: 2,
        },
      ],
    };

    chart.setOption(option);

    // hover 事件：转发 dataIndex 给父级（用于标题栏日期切换）
    const handleShow = (e: { dataIndex?: number }) => {
      if (typeof e.dataIndex === 'number') onHoverRef.current(e.dataIndex);
    };
    const handleHide = () => onHoverRef.current(null);
    chart.on('showTip', handleShow as never);
    chart.on('hideTip', handleHide);
    el.addEventListener('mouseleave', handleHide);

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);

    return () => {
      ro.disconnect();
      el.removeEventListener('mouseleave', handleHide);
      chart.dispose();
    };
  }, [data]);

  return <div ref={containerRef} className="h-[216px] w-full" />;
}

// ─── 主组件 ────────────────────────────────────────────────
//
// 改动说明：
// 1. 使用 Card 组件包裹，形成标准卡片区块（Card elevation={0}）
// 2. 外层加 bg-[#f2f5fa] 页面底色，Card 白色背景在上面形成前景/背景分离
// 3. 折线图 SVG 精调：统一 viewBox 坐标系，getX/scaleY 显式定义绘图区边界

const MetricsOverview = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const hoveredPoint = hoveredIdx !== null ? TREND_DATA[hoveredIdx] : null;

  return (
    <div className="rounded-xl bg-[#f2f5fa] p-6">
      <Card
        elevation={0}
        className="w-full overflow-hidden [--odn-card-radius:12px]"
      >
        {/* 标题栏 */}
        <div className="flex h-16 items-center gap-2 px-6">
          <span className="text-[length:var(--odn-font-size-headline-5)] font-semibold text-black-12">
            {hoveredPoint ? hoveredPoint.date : '2025-09-17 至 2025-10-17'}
          </span>
          <span className="text-[length:var(--odn-font-size-headline-5)] font-semibold text-black-12">
            <span className="border-b border-dashed border-black-9">心智</span>概览
          </span>
        </div>

        {/* 内容区 */}
        <div className="flex flex-col gap-6 px-6 pb-6">
          {/* 指标卡 + 分布条：内卡容器 */}
          <div className="rounded-[12px] border border-black-6 px-6 py-5">
            {/* 双指标行 */}
            <div className="flex gap-6">
              {METRICS.map((m, idx) => {
                const isPositive = m.change >= 0;
                return (
                  <React.Fragment key={m.label}>
                    {idx > 0 && <div className="w-px self-stretch bg-black-5" />}
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={clsx('inline-block size-3 rounded-[2px]', m.dotColor)}
                          style={{ padding: '2px', backgroundClip: 'content-box' }}
                        />
                        <span className="border-b border-dashed border-black-9 text-[length:var(--odn-font-size-headline-5)] font-semibold text-black-12">
                          {m.label}
                        </span>
                      </div>
                      <div className="flex items-end gap-1.5">
                        <span className="text-[30px] font-semibold leading-[38px] tabular-nums text-black-12">
                          {m.value}
                        </span>
                        <span
                          className={clsx(
                            'flex items-center tabular-nums text-[length:var(--odn-font-size-text-sm)]',
                            isPositive ? 'text-green-7' : 'text-red-7',
                          )}
                        >
                          <Icon name={isPositive ? 'arrow-up' : 'arrow-down'} size={16} />
                          {Math.abs(m.change).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[length:var(--odn-font-size-text-sm)] text-black-12">
                        <span>{m.refLabel}</span>
                        <span className="tabular-nums text-[length:var(--odn-font-size-headline-5)]">
                          {m.refValue}
                        </span>
                        {m.rank != null && (
                          <>
                            <span className="flex items-center gap-1">
                              <span>排名</span>
                              <span className="tabular-nums text-[length:var(--odn-font-size-headline-5)]">
                                {m.rank}
                              </span>
                              {m.rankChange != null && (
                                <span
                                  className={clsx(
                                    'flex items-center tabular-nums text-[length:var(--odn-font-size-comment)]',
                                    m.rankChange < 0 ? 'text-red-7' : 'text-green-7',
                                  )}
                                >
                                  <Icon name={m.rankChange < 0 ? 'arrow-down' : 'arrow-up'} size={14} />
                                  {Math.abs(m.rankChange)}
                                </span>
                              )}
                            </span>
                            <span className="cursor-pointer text-[length:var(--odn-font-size-comment)] text-blue-6">
                              查看榜单
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* 四维心智分布 */}
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex flex-wrap gap-4">
                {DIST_SEGMENTS.map((seg) => (
                  <div key={seg.label} className="flex flex-1 items-center gap-1.5 overflow-hidden">
                    <span className={clsx('inline-block size-3 rounded-[2px]', seg.dotColor)} />
                    <span className="border-b border-dashed border-black-9 text-[length:var(--odn-font-size-text-sm)] text-black-12">
                      {seg.label}
                    </span>
                    <span className="tabular-nums text-[length:var(--odn-font-size-headline-5)] font-semibold text-black-12">
                      {seg.percent.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex h-2 w-full gap-px">
                {DIST_SEGMENTS.map((seg) => (
                  <div key={seg.label} className={clsx('h-full', seg.color)} style={{ width: `${seg.percent}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* 双轴趋势折线图 */}
          <div className="pt-2">
            <TrendChart data={TREND_DATA} onHover={setHoveredIdx} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MetricsOverview;
