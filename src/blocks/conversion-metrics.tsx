'use client';

import { Card, Select } from 'one-design-next';
import * as echarts from 'echarts/core';
import { PieChart, type PieSeriesOption } from 'echarts/charts';
import {
  TitleComponent,
  type TitleComponentOption,
  TooltipComponent,
  type TooltipComponentOption,
} from 'echarts/components';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import React, { useEffect, useRef, useState } from 'react';

// ECharts 按需注册（tree-shaking 友好）
echarts.use([PieChart, TitleComponent, TooltipComponent, LabelLayout, CanvasRenderer]);

type EChartsOption = echarts.ComposeOption<
  PieSeriesOption | TitleComponentOption | TooltipComponentOption
>;

// ─── Mock 数据 ────────────────────────────────────────────────

interface MetricCard {
  label: string;
  value: string;
  comparison?: string;
}

const TOP_ROW: MetricCard[] = [
  { label: '广告转化人数', value: '4,850' },
  { label: '人群转化率', value: '0.19%', comparison: '比本品历史均值高7%' },
  { label: '人均转化成本', value: '30.9元', comparison: '比本品历史均值高7%' },
];

const BOTTOM_ROW: MetricCard[] = [
  { label: '广告转化次数', value: '5,245' },
  { label: '转化率', value: '0.14%', comparison: '比本品历史均值高7%' },
  { label: '广告转化频次', value: '1.08', comparison: '比本品历史均值高7%' },
];

const REFERENCE_OPTIONS = [
  { label: '本品历史均值', value: 'self' },
  { label: '行业均值', value: 'industry' },
  { label: '同品类均值', value: 'category' },
];

const DONUT_TOTAL_LABEL = '总转化人数';
const DONUT_TOTAL_VALUE = '8,080';

// 图例：三段人数（单次 + 多次 = 广告转化人数；广告转化占比 = 广告转化/总转化）
const CONVERTED_ONCE = 3980; // 单次转化人数
const CONVERTED_MULTI = 870; // 多次转化人数
const TOTAL_CONVERSION = 8080; // 总转化人数（含非广告）
const AD_CONVERTED = CONVERTED_ONCE + CONVERTED_MULTI; // 4,850
const NON_AD = TOTAL_CONVERSION - AD_CONVERTED; // 3,230（非广告转化，填充剩余环）
const AD_PCT = (AD_CONVERTED / TOTAL_CONVERSION) * 100; // 60.02%

// ─── 摘要行：数字高亮 ────────────────────────────────────────────

function SummaryText() {
  const segments: { text: string; highlight?: boolean }[] = [
    { text: '本次广告触达 ' },
    { text: '2,500,000', highlight: true },
    { text: ' 人，曝光 ' },
    { text: '3,750,000', highlight: true },
    { text: ' 次，人均曝光频次 ' },
    { text: '1.5', highlight: true },
    { text: ' 次。总花费 ' },
    { text: '150,000', highlight: true },
    { text: ' 元，人均触达成本 ' },
    { text: '0.06', highlight: true },
    { text: ' 元' },
  ];

  return (
    <p className="leading-7">
      {segments.map((s, i) => (
        <span
          key={i}
          className={
            s.highlight
              ? 'text-base font-semibold tabular-nums text-black-12'
              : 'text-sm text-black-9'
          }
        >
          {s.text}
        </span>
      ))}
    </p>
  );
}

// ─── 指标卡 ────────────────────────────────────────────────

function MetricCardCell({ card }: { card: MetricCard }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      <span
        className="border-b border-dashed border-black-9 text-sm text-black-12"
        style={{ width: 'fit-content' }}
      >
        {card.label}
      </span>
      <span className="text-xl font-semibold tabular-nums text-black-12">
        {card.value}
      </span>
      {card.comparison && (
        <span className="text-xs text-black-9">{card.comparison}</span>
      )}
    </div>
  );
}

// ─── 环形图（ECharts） ────────────────────────────────────────
//
// 用 pie 的 roundCap 模拟手写 SVG 的 strokeLinecap="round" 效果；
// 颜色从 ODN CSS 变量读取，保证与组件库主题同步。

function readCssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function DonutChart() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = echarts.init(el);

    const blue6 = readCssVar('--odn-color-blue-6', '#296bef');
    const blue3 = readCssVar('--odn-color-blue-3', '#bfd3fa');
    const black12 = readCssVar('--odn-color-black-12', '#0d0d0d');
    const black9 = readCssVar('--odn-color-black-9', '#898b8f');

    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          // params 类型在 ComposeOption 下是 CallbackDataParams，name/value/percent 可直接用
          const p = params as unknown as { name: string; value: number; percent: number };
          return `${p.name}<br/>${p.value.toLocaleString()} 人 (${p.percent}%)`;
        },
      },
      title: {
        text: DONUT_TOTAL_VALUE,
        subtext: DONUT_TOTAL_LABEL,
        left: 'center',
        top: 'center',
        // subtext 在上、text 在下 —— ECharts 原生顺序是 text 在上，
        // 设计稿要求 label 上、数值下，因此用 itemGap 负值 + 上下对换
        itemGap: -40,
        textStyle: {
          color: black12,
          fontSize: 20,
          fontWeight: 600,
        },
        subtextStyle: {
          color: black9,
          fontSize: 12,
          fontWeight: 400,
        },
      },
      series: [
        {
          name: '广告转化',
          type: 'pie',
          radius: ['62%', '82%'],
          startAngle: 90,
          avoidLabelOverlap: false,
          silent: false,
          label: { show: false },
          labelLine: { show: false },
          emphasis: { scale: false },
          itemStyle: {
            borderRadius: 16, // 模拟 strokeLinecap="round"
            borderColor: '#fff',
            borderWidth: 0,
          },
          data: [
            { value: AD_CONVERTED, name: '广告转化', itemStyle: { color: blue6 } },
            { value: NON_AD, name: '非广告转化', itemStyle: { color: blue3 } },
          ],
        },
      ],
    };

    chart.setOption(option);

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.dispose();
    };
  }, []);

  return <div ref={containerRef} className="h-[200px] w-[200px] shrink-0" />;
}

// ─── 图例 ────────────────────────────────────────────────

function DonutLegend() {
  const items = [
    { color: 'bg-blue-6', text: `广告转化占比 ${AD_PCT.toFixed(2)}%` },
    { color: 'bg-blue-3', text: `单次转化 ${CONVERTED_ONCE.toLocaleString()} 人` },
    {
      color: 'bg-blue-4',
      text: `多次转化 ${CONVERTED_MULTI.toLocaleString()} 人，人均转化 2.3 次`,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.text} className="flex items-start gap-2 text-sm text-black-12">
          <span
            className={`mt-1 inline-block size-2.5 shrink-0 rounded-[2px] ${item.color}`}
          />
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  );
}

// ─── 主组件 ────────────────────────────────────────────────
//
// 改动历程：
// v1 裸 div + 手写 SVG 环形图 + Button 参考系
// v2 Card 容器 + 灰底外层 + Select 参考系（本次开始）
// v3 环形图改用 ECharts（当前）——tree-shake 按需 import，颜色从 ODN CSS 变量读取

const ConversionMetrics = () => {
  const [reference, setReference] = useState('self');

  return (
    <div className="rounded-xl bg-[#f2f5fa] p-6">
      <Card
        elevation={0}
        className="w-full overflow-hidden [--odn-card-radius:12px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h3 className="text-base font-semibold text-black-12">
            <span className="border-b border-dashed border-black-9 pb-0.5">
              转化概览
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-black-9">参考系：</span>
            <Select
              value={reference}
              onChange={(v) => setReference(v as string)}
              options={REFERENCE_OPTIONS}
              size="small"
              popupMatchSelectWidth={false}
              className="min-w-[140px]"
            />
          </div>
        </div>

        {/* 摘要行 */}
        <div className="px-6 pb-4">
          <SummaryText />
        </div>

        {/* 主体：左指标卡 + 右环形图 */}
        <div className="flex gap-0 px-6 pb-6">
          {/* 左侧：指标卡网格 */}
          <div className="flex-1 overflow-hidden rounded-[8px] bg-black-1 p-3">
            <div className="grid grid-cols-3 gap-3">
              {TOP_ROW.map((card) => (
                <MetricCardCell key={card.label} card={card} />
              ))}
            </div>
            <div className="my-3 border-t border-black-4" />
            <div className="grid grid-cols-3 gap-3">
              {BOTTOM_ROW.map((card) => (
                <MetricCardCell key={card.label} card={card} />
              ))}
            </div>
          </div>

          {/* 右侧：环形图区域 */}
          <div className="flex w-[424px] shrink-0 flex-col items-center justify-center gap-6 pl-6">
            <DonutChart />
            <DonutLegend />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ConversionMetrics;
