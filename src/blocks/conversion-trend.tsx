'use client';

import React, { useEffect, useMemo, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════
// 转化趋势图（conversion-trend）
//
// 来源：workshop conversion-review.tsx 的 ConversionTrend（ECharts 版）
// 产品问题：沿时间轴展示"广告转化 vs 其他转化"的每日堆叠柱状图，
// 叠加转化占比折线，看趋势和广告贡献度变化。
// ═══════════════════════════════════════════════════════════════

export interface ConversionTrendItem {
  /** 日期（时间戳秒或毫秒） */
  date: number | string;
  /** 广告转化人数 */
  conv_uv: number;
  /** 其他转化人数 */
  other_conv_uv: number;
}

export interface ConversionTrendProps {
  /** 趋势数据 */
  items: ConversionTrendItem[];
  /** 标题（默认"转化人数趋势"） */
  title?: string;
  /** 副标题 / 说明（显示为虚线下划线的 tips） */
  tips?: string;
  /** 自定义图表高度 */
  height?: number;
  /** 超过多少条自动开启 dataZoom 滑块（默认 15） */
  zoomThreshold?: number;
}

function fmtDate(d: number | string): string {
  if (typeof d === 'string') return d;
  const ms = d > 1e11 ? d : d * 1000;
  const date = new Date(ms);
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function useECharts(
  containerRef: React.RefObject<HTMLDivElement | null>,
  option: any,
  deps: any[] = [],
) {
  useEffect(() => {
    if (!containerRef.current) return;
    let chart: any;
    import('echarts').then((echarts) => {
      if (!containerRef.current) return;
      chart = echarts.init(containerRef.current);
      chart.setOption(option);
    });
    return () => chart?.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * 转化趋势图（L3 区块）
 *
 * 堆叠柱状图（广告/其他转化人数）+ 折线图（转化占比），双 Y 轴。
 * items > zoomThreshold 时自动开启底部 dataZoom 滑块。
 */
export const ConversionTrend: React.FC<ConversionTrendProps> = ({
  items,
  title = '转化人数趋势',
  tips = '广告周期+转化周期内转化的分天趋势',
  height,
  zoomThreshold = 15,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const dates = items.map((d) => fmtDate(d.date));
  const convUv = items.map((d) => Number(d.conv_uv));
  const otherUv = items.map((d) => Number(d.other_conv_uv));
  const ratio = items.map((d) => {
    const c = Number(d.conv_uv);
    const o = Number(d.other_conv_uv);
    return c + o > 0 ? c / (c + o) : 0;
  });
  const showZoom = items.length > zoomThreshold;

  useECharts(
    chartRef,
    {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          shadowStyle: { color: 'rgba(74,97,143,0.08)' },
        },
      },
      legend: { show: false },
      grid: {
        top: 24,
        right: 8,
        bottom: showZoom ? 80 : 30,
        left: 8,
        containLabel: true,
      },
      dataZoom: showZoom
        ? [
            {
              type: 'slider',
              startValue: 0,
              endValue: 14,
              zoomLock: true,
              brushSelect: false,
            },
          ]
        : [],
      xAxis: {
        type: 'category',
        data: dates,
        axisTick: { show: false },
        axisLabel: { color: '#939599' },
        axisLine: { lineStyle: { color: 'rgba(24,24,24,0.25)' } },
      },
      yAxis: [
        {
          type: 'value',
          splitLine: { lineStyle: { color: 'rgba(24,24,24,0.1)' } },
          axisLabel: { color: '#939599' },
        },
        {
          type: 'value',
          splitLine: { show: false },
          axisLabel: {
            color: '#939599',
            formatter: (v: number) => `${(v * 100).toFixed(0)}%`,
          },
        },
      ],
      series: [
        {
          name: '广告转化人数',
          type: 'bar',
          stack: 'total',
          data: convUv,
          itemStyle: { color: '#4080FF' },
          barMaxWidth: 24,
          emphasis: { disabled: true },
        },
        {
          name: '其他转化人数',
          type: 'bar',
          stack: 'total',
          data: otherUv,
          itemStyle: { color: '#E2E5EA', borderRadius: [4, 4, 0, 0] },
          barMaxWidth: 24,
          emphasis: { disabled: true },
        },
        {
          name: '广告转化占比',
          type: 'line',
          yAxisIndex: 1,
          data: ratio,
          lineStyle: { color: '#E37318', width: 2 },
          itemStyle: { color: '#E37318' },
          symbol: 'none',
        },
      ],
    },
    [items],
  );

  const chartHeight = height ?? (showZoom ? 370 : 320);

  return (
    <div className="border border-[#edeef2] rounded-[12px] px-6 py-5 bg-white">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-base font-semibold text-[#0d0d0d]">
          {tips ? (
            <span
              className="cursor-pointer"
              style={{
                textDecoration: 'underline dashed',
                textUnderlineOffset: '0.2em',
              }}
              title={tips}
            >
              {title}
            </span>
          ) : (
            title
          )}
        </span>
      </div>
      <div className="border-b border-[#edeef2] -mx-6 mb-4" />
      <div className="flex items-center justify-center gap-4 text-xs text-[rgba(0,0,0,0.6)] mb-2">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-[#4080FF]" />
          广告转化人数
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-[#E2E5EA]" />
          其他转化人数
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-[3px] w-2 rounded-sm bg-[#E37318]" />
          广告转化占比
        </span>
      </div>
      <div ref={chartRef} style={{ height: chartHeight }} />
    </div>
  );
};

// ═══ Demo ═══════════════════════════════════════════════════════

const DEMO_ITEMS: ConversionTrendItem[] = [
  { date: '09-19', conv_uv: 120000, other_conv_uv: 100000 },
  { date: '09-21', conv_uv: 85000, other_conv_uv: 70000 },
  { date: '09-23', conv_uv: 70000, other_conv_uv: 50000 },
  { date: '09-25', conv_uv: 50000, other_conv_uv: 30000 },
  { date: '09-27', conv_uv: 25000, other_conv_uv: 25000 },
  { date: '09-29', conv_uv: 25000, other_conv_uv: 25000 },
  { date: '10-01', conv_uv: 80000, other_conv_uv: 70000 },
  { date: '10-03', conv_uv: 110000, other_conv_uv: 90000 },
  { date: '10-05', conv_uv: 150000, other_conv_uv: 90000 },
  { date: '10-07', conv_uv: 140000, other_conv_uv: 130000 },
  { date: '10-09', conv_uv: 120000, other_conv_uv: 110000 },
  { date: '10-11', conv_uv: 160000, other_conv_uv: 110000 },
  { date: '10-13', conv_uv: 170000, other_conv_uv: 170000 },
  { date: '10-15', conv_uv: 190000, other_conv_uv: 190000 },
  { date: '10-17', conv_uv: 195000, other_conv_uv: 195000 },
];

const ConversionTrendDemo = () => {
  return <ConversionTrend items={DEMO_ITEMS} />;
};

export default ConversionTrendDemo;
