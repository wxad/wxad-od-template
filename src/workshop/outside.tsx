'use client';

import {
  Button,
  Icon,
  RuyiLayout,
  Select,
  Tooltip,
  type RuyiMenuItem,
} from 'one-design-next';
// @ts-ignore
import * as echarts from 'echarts';
import EChartsReact from 'echarts-for-react';
import React, { useEffect, useMemo, useState } from 'react';
import WordCloud from 'react-d3-cloud';
import { RyDateRangePicker } from '../blocks/ry-date-range-picker';
import outsideFixture from './data/outside.json';

// 本地 fixtures，避免预览域等非 localhost 来源被 CDN CORS 拦截
const outsideCdnData = outsideFixture as Record<string, any>;

// ─── 常量（对齐 dmp-web outside/common.ts + index.tsx） ─────
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

const colorBlue = '#6997F4';
const colorGreen = '#33D2CB';

const metricConf: Record<string, { title: string; tips: string }> = {
  volume: {
    title: '声量指数',
    tips: '所选时间段内，在腾讯以外的主流平台命中品牌关键词的内容发布量，为预估指数，不代表域外内容发布量真实数值。',
  },
  engagement: {
    title: '互动量指数',
    tips: '在所选时间段内，腾讯以外主流平台上与品牌相关内容的互动行为量（如转发、评论、点赞等），为预估指数，不代表域外互动量真实数值。',
  },
  nsr: {
    title: 'NSR',
    tips: '在所选时间段内，在腾讯以外主流平台上与品牌相关内容的情感识别情况，公式为(正面情感值-负面情感值)/(正面情感值+负面情感值)*100%。',
  },
};

const metricList = [
  { title: '曝光触达', items: ['volume'] },
  { title: '种草互动', items: ['engagement'] },
  { title: '口碑传播', items: ['nsr'] },
];

const metricOptions = [
  { value: 'volume', label: '声量指数' },
  { value: 'engagement', label: '互动量指数' },
  { value: 'nsr', label: 'NSR' },
];

const wordCloudOptions = [
  { value: 'positive', label: '正向内容' },
  { value: 'negative', label: '负向内容' },
];

function formatNum(v: any): string {
  const n = Number(v);
  if (isNaN(n)) return '--';
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatPct(v: number): string {
  return `${(v * 100).toFixed(2)}%`;
}

// ─── 增长率渲染（对齐 dmp-web renderGrowth） ─────
function renderGrowth(data: any, key: string) {
  if (!data?.count || !data?.previous_period) return null;
  const current = Number(data.count);
  const previous = Number(data.previous_period);
  if (previous === 0) return null;

  const growthRate = Math.abs(((current - previous) / previous) * 100);
  const growthAbs = Math.abs(current - previous);

  if (current === previous) {
    return (
      <span>
        与上一周期{' '}
        <span>
          {formatNum(previous)}
          {key === 'nsr' ? '%' : ''}
        </span>{' '}
        <span className="text-[#296BEF]">持平</span>
      </span>
    );
  }

  const isHigher = current > previous;
  const color = isHigher ? '#52C41A' : '#FF4D4F';
  const text =
    key === 'nsr'
      ? isHigher
        ? `上升 ${growthAbs}%`
        : `下降 ${growthAbs}%`
      : isHigher
        ? `环比增长 ${growthRate.toFixed(0)}%`
        : `环比减少 ${growthRate.toFixed(0)}%`;

  return (
    <span>
      比上一周期{' '}
      <span>
        {formatNum(previous)}
        {key === 'nsr' ? '%' : ''}
      </span>{' '}
      <span style={{ color }}>{text}</span>
    </span>
  );
}

// ─── 雷达图（对齐 dmp-web RadarBox，只用 ECharts indicator.name 避免重叠） ─────
function RadarChart({ summary }: { summary: any }) {
  const selectedIndex = ['volume', 'nsr', 'engagement'];
  const dimensionNames = ['曝光触达', '口碑传播', '种草互动'];

  const indicatorConfig = selectedIndex.map((idx, i) => ({
    name: dimensionNames[i],
    max:
      Math.max(
        +summary[idx]?.count || 0,
        +summary[idx]?.previous_period || 0,
      ) || 100,
    min: 0,
  }));

  return (
    <div className="w-[300px] h-[260px]">
      <EChartsReact
        className="w-full h-full"
        option={{
          animation: true,
          radar: {
            shape: 'circle',
            splitNumber: 3,
            radius: '50%',
            center: ['50%', '55%'],
            axisLine: { lineStyle: { type: 'dashed' } },
            splitLine: { lineStyle: { color: '#e0e0e0' } },
            splitArea: { show: false },
            axisName: {
              color: '#626365',
              show: true,
              fontSize: 12,
              lineHeight: 20,
            },
            indicator: indicatorConfig,
          },
          series: [
            {
              type: 'radar',
              symbol: 'none',
              itemStyle: {
                borderWidth: 1,
                color: '#fff',
                borderColor: '#457EF1',
              },
              lineStyle: { width: 2 },
              silent: true,
              data: [
                {
                  value: selectedIndex.map((idx) => summary[idx]?.count),
                  lineStyle: { color: colorBlue },
                  areaStyle: { color: 'rgba(105,151,244, 0.16)' },
                },
                {
                  value: selectedIndex.map(
                    (idx) => summary[idx]?.previous_period,
                  ),
                  lineStyle: { color: colorGreen },
                  areaStyle: { color: 'rgba(51,210,203, 0.16)' },
                },
              ],
            },
          ],
        }}
      />
    </div>
  );
}

// ─── 趋势折线图（对齐 dmp-web TrendLineChart） ─────
function TrendLineChart({
  metricForTrend,
  trend,
}: {
  metricForTrend: string;
  trend: any;
}) {
  const yAxisNames = useMemo(() => {
    switch (metricForTrend) {
      case 'volume':
        return { outside: '域外声量指数', inside: '域内新发布内容数' };
      case 'engagement':
        return { outside: '域外互动量指数', inside: '域内互动量' };
      default:
        return {
          outside: `域外${metricConf[metricForTrend]?.title}`,
          inside: `域内${metricConf[metricForTrend]?.title}`,
        };
    }
  }, [metricForTrend]);

  const outsideData: any[] = trend?.[`outside_${metricForTrend}`] || [];
  const insideData: any[] = trend?.[`inside_${metricForTrend}`] || [];
  const isSingleDay = outsideData.length === 1;

  const formatDate = (d: string) => {
    const s = String(d);
    return `${s.slice(4, 6)}-${s.slice(6, 8)}`;
  };

  const option = useMemo(
    () => ({
      grid: { top: 40, right: 86, bottom: 0, left: 60, containLabel: true },
      tooltip: { show: true, trigger: 'axis' },
      xAxis: {
        axisTick: { show: false },
        axisLabel: { color: '#939393' },
        data: outsideData.map((d: any) => formatDate(d.date)),
        axisLine: { lineStyle: { color: '#E6E8ED' } },
      },
      yAxis: [
        {
          type: 'value',
          name: yAxisNames.outside,
          nameTextStyle: {
            align: 'right',
            color: 'rgba(0,0,0,0.4)',
            padding: [0, 8, 0, 0],
          },
          splitNumber: 5,
          splitLine: { lineStyle: { color: ['#EDEFF2'] } },
          axisLabel: { color: '#939393' },
        },
        {
          type: 'value',
          show: insideData.length > 0,
          name: yAxisNames.inside,
          position: 'right',
          nameTextStyle: {
            align: 'left',
            color: 'rgba(0,0,0,0.4)',
            padding: [0, 0, 0, 6],
          },
          splitLine: { show: false },
          axisLabel: { color: '#939393' },
        },
      ],
      series: [
        {
          type: 'line',
          smooth: true,
          yAxisIndex: 0,
          symbol: 'circle',
          showSymbol: isSingleDay,
          symbolSize: 8,
          name: yAxisNames.outside,
          data: outsideData.map((d: any) => [
            formatDate(d.date),
            Math.round(+d.count),
          ]),
          color: colorBlue,
          itemStyle: { borderWidth: 2, borderColor: '#fff' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colorBlue },
              { offset: 1, color: '#fff' },
            ]),
          },
        },
        {
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          symbol: 'circle',
          showSymbol: isSingleDay,
          symbolSize: 8,
          name: yAxisNames.inside,
          data: insideData.map((d: any) => [
            formatDate(d.date),
            Math.round(+d.count),
          ]),
          color: colorGreen,
          itemStyle: { borderWidth: 2, borderColor: '#fff' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colorGreen },
              { offset: 1, color: '#fff' },
            ]),
          },
        },
      ],
    }),
    [outsideData, insideData, yAxisNames, isSingleDay],
  );

  return (
    <EChartsReact
      className="w-full h-[312px] mb-6"
      option={option}
    />
  );
}

// ─── 口碑分布饼图（对齐 dmp-web EChartsReact pie） ─────
function SentimentPie({ sentiment }: { sentiment: any }) {
  const positiveNum = Number(sentiment?.positive || 0);
  const normalNum = Number(sentiment?.normal || 0);
  const negativeNum = Number(sentiment?.negative || 0);

  return (
    <div className="flex flex-col items-center gap-6">
      <EChartsReact
        className="w-[220px] h-[220px]"
        option={{
          color: ['#296BEF', '#94B5F7', '#D4E1FC'],
          tooltip: { trigger: 'item', confine: true },
          series: [
            {
              name: '口碑分布',
              type: 'pie',
              radius: [60, 100],
              center: ['50%', '50%'],
              avoidLabelOverlap: false,
              label: { show: false },
              labelLine: { show: false },
              data: [
                { value: positiveNum, name: '正向' },
                { value: normalNum, name: '中性' },
                { value: negativeNum, name: '负向' },
              ],
            },
          ],
        }}
      />
      <div className="flex items-center gap-5">
        {[
          { label: '正向', color: '#296BEF' },
          { label: '中性', color: '#94B5F7' },
          { label: '负向', color: '#D4E1FC' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-1.5 text-xs text-[#0d0d0d]"
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 洞察提示（对齐 dmp-web renderInsightTipText） ─────
function InsightTip({ sentiment }: { sentiment: any }) {
  const positive = Number(sentiment?.positive || 0);
  const normal = Number(sentiment?.normal || 0);
  const negative = Number(sentiment?.negative || 0);
  const sum = positive + normal + negative;
  if (sum === 0) return null;

  const negRate = negative / sum;
  const posRate = positive / sum;
  const negAvgRate = sentiment?.negative_industry_avg_rate || 0;
  const posAvgRate = sentiment?.positive_industry_avg_rate || 0;
  const negDiff = negRate - negAvgRate;
  const posDiff = posRate - posAvgRate;

  let text: React.ReactNode = null;
  if (Math.abs(negDiff) > Math.abs(posDiff)) {
    const diffRate = negAvgRate > 0 ? negDiff / negAvgRate : 0;
    if (diffRate > 0) {
      text = (
        <div>
          所选分析周期范围内，品牌负面比例（{formatPct(negRate)}）高于行业均值（
          {formatPct(negAvgRate)}）{formatPct(Math.abs(diffRate))}
          ，相对不受好评，<span style={{ color: '#E63D2E' }}>风险较高</span>
          ，建议关注品牌负面口碑情况。
        </div>
      );
    } else {
      text = (
        <div>
          所选分析周期范围内，品牌负面比例（{formatPct(negRate)}）低于行业均值（
          {formatPct(negAvgRate)}）{formatPct(Math.abs(diffRate))}
          ，负面反馈较少，
          <span style={{ color: '#07C160' }}>口碑稳定性优于行业</span>
          ，可维持现有策略并强化用户信任感。
        </div>
      );
    }
  } else {
    const diffRate = posAvgRate > 0 ? posDiff / posAvgRate : 0;
    if (diffRate > 0) {
      text = (
        <div>
          所选分析周期范围内，品牌正面比例（{formatPct(posRate)}）高于行业均值（
          {formatPct(posAvgRate)}）{formatPct(Math.abs(diffRate))}
          ，口碑表现优异，<span style={{ color: '#07C160' }}>存在更多机会</span>
          ，可加强优势传播。
        </div>
      );
    } else {
      text = (
        <div>
          所选分析周期范围内，品牌正面比例（{formatPct(posRate)}）低于行业均值（
          {formatPct(posAvgRate)}）{formatPct(Math.abs(diffRate))}
          ，用户满意度相对不足，
          <span style={{ color: '#E63D2E' }}>存在改进空间</span>
          。建议优化产品，并针对性收集用户反馈以增强口碑。
        </div>
      );
    }
  }

  if (!text) return null;

  return (
    <div
      className="flex items-center overflow-hidden rounded-lg bg-[#FAFAFB] text-sm"
    >
      <div
        className="shrink-0 text-center font-semibold self-stretch flex items-center justify-center w-16 text-[#296BEF] py-[22px]"
        style={{
          background: 'linear-gradient(180deg, #E3EEFF 0%, #F7F9FC 100%)',
          boxShadow: '-1px 0px 0px 0px #FFFFFF inset',
        }}
      >
        洞察
      </div>
      <div
        className="flex-1 pl-6 text-[#0D0D0D] py-4"
      >
        {text}
      </div>
    </div>
  );
}

// ─── 词云（对齐 mind.tsx 的 react-d3-cloud CustomWordCloud） ─────

function getWordTier(index: number) {
  if (index === 0) return 1;
  if (index <= 3) return 2;
  if (index <= 8) return 3;
  if (index <= 15) return 4;
  if (index <= 24) return 5;
  return 6;
}
const TIER_SIZES: Record<number, number> = {
  1: 40,
  2: 32,
  3: 24,
  4: 16,
  5: 14,
  6: 12,
};
const TIER_COLORS_POS: Record<number, string> = {
  1: '#296BEF',
  2: '#6997F4',
  3: '#33D2CB',
  4: '#FCB04C',
  5: '#8B8DFB',
  6: '#BABCC1',
};
const TIER_COLORS_NEG: Record<number, string> = {
  1: '#E63D2E',
  2: '#FF7875',
  3: '#FFA39E',
  4: '#FCB04C',
  5: '#8B8DFB',
  6: '#BABCC1',
};
const TIER_WEIGHTS: Record<number, number> = {
  1: 600,
  2: 600,
  3: 400,
  4: 400,
  5: 400,
  6: 400,
};

function WordCloudSection({
  wordData,
  metric,
}: {
  wordData: any;
  metric: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(500);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(Math.max(300, entry.contentRect.width - 16));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const items: { keyword: string; count: string }[] = wordData?.[metric] || [];
  const sorted = [...items].sort((a, b) => Number(b.count) - Number(a.count));
  const cloudData = sorted
    .slice(0, 40)
    .map((item) => ({ text: item.keyword, value: Number(item.count) }));
  const tierColors = metric === 'positive' ? TIER_COLORS_POS : TIER_COLORS_NEG;

  if (!cloudData.length)
    return <div className="py-20 text-center text-sm text-black-9">无数据</div>;

  return (
    <div
      ref={containerRef}
      className="w-full h-[260px] rounded-md overflow-hidden"
    >
      <WordCloud
        data={cloudData}
        width={containerWidth}
        height={250}
        font="PingFang SC"
        fontStyle="normal"
        fontWeight={(d: any) => {
          const idx = sorted.findIndex((w) => w.keyword === d.text);
          return TIER_WEIGHTS[getWordTier(idx === -1 ? 99 : idx)];
        }}
        fontSize={(word: any) => {
          const idx = sorted.findIndex((w) => w.keyword === word.text);
          return TIER_SIZES[getWordTier(idx === -1 ? 99 : idx)];
        }}
        spiral="archimedean"
        rotate={0}
        padding={2}
        random={() => 0.5}
        fill={(d: any) => {
          const idx = sorted.findIndex((w) => w.keyword === d.text);
          return tierColors[getWordTier(idx === -1 ? 99 : idx)];
        }}
      />
    </div>
  );
}

// ─── 主页面 ─────
export default function OutsidePage() {
  const cdnData = outsideCdnData;
  const [activeNav, setActiveNav] = useState('洞察诊断');
  const [activeMenu, setActiveMenu] = useState('outer-spread');
  const [metricForTrend, setMetricForTrend] = useState('volume');
  const [outsideDateRange, setOutsideDateRange] = useState<[Date, Date]>([
    new Date('2026-04-13'),
    new Date('2026-04-19'),
  ]);
  const [wordCloudMetric, setWordCloudMetric] = useState('positive');

  const summary = cdnData?.summary;
  const trend = cdnData?.trend;
  const sentiment = cdnData?.sentiment;
  const word = cdnData?.word;

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
      accountName="Apple/苹果 – 3C数码"
      accountId="25610"
      contentClassName="flex flex-col gap-4"
    >
      {/* ═══ 1. 筛选栏（对齐 dmp-web ListPage filter） ═══ */}
      <div className="bg-white rounded-xl px-6 py-4 flex items-center">
        <RyDateRangePicker
          value={outsideDateRange}
          onChange={setOutsideDateRange}
          triggerWidth="280px"
        />
        <div className="ml-auto flex items-center gap-2">
          <Tooltip popup="所有域外数据为品牌在全网主流平台（除腾讯平台外）相关指标的分析结果，可用来衡量腾讯广告对品牌腾讯域外平台的广告效果影响，数据为预估指数，并非域外真实数值。">
            <Button light icon="info" className="text-[#898B8F]">
              指数化说明
            </Button>
          </Tooltip>
          <Button light icon="download" className="text-[#898B8F]">
            下载数据
          </Button>
        </div>
      </div>

      {/* ═══ 2. 域外传播概览（对齐 dmp-web section 1） ═══ */}
      <div className="bg-white rounded-xl">
        <div className="px-6 py-5 border-b border-[#e5e6eb]">
          <span className="text-base font-semibold text-[#0d0d0d]">
            域外传播概览
          </span>
        </div>
        <div className="flex px-6 py-5">
          {/* 左侧：雷达图 */}
          <div className="flex-1 min-w-0">
            {/* 图例（对齐 dmp-web legendBox） */}
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-1.5 text-xs text-[#0d0d0d]">
                <span
                  className="inline-block w-2.5 h-0.5 rounded"
                  style={{ backgroundColor: colorBlue }}
                />
                分析周期
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#0d0d0d]">
                <span
                  className="inline-block w-2.5 h-0.5 rounded"
                  style={{ backgroundColor: colorGreen }}
                />
                上一周期
              </div>
            </div>
            <div className="flex justify-center pt-6">
              {summary && <RadarChart summary={summary} />}
            </div>
          </div>

          {/* 右侧：指标卡片（对齐 dmp-web metricBox） */}
          <div className="flex-[2] min-w-0">
            <div className="flex gap-6 pt-5 pl-6">
              {metricList.map((col, colIdx) => (
                <div
                  key={colIdx}
                  className="flex-1 rounded-lg bg-[#fafafb] px-6 py-5 h-[204px]"
                >
                  <div className="text-sm font-semibold text-[#0d0d0d] mb-5">
                    {col.title}
                  </div>
                  {col.items.map((item) => (
                    <div key={item} className="mb-6">
                      <Tooltip popup={metricConf[item]?.tips}>
                        <span className="text-sm text-[#0d0d0d] underline decoration-dashed underline-offset-4 decoration-[#c0c0c0] cursor-help">
                          {metricConf[item]?.title}
                        </span>
                      </Tooltip>
                      <div className="mt-1 mb-1">
                        <span
                          className="tabular-nums text-[#0d0d0d] text-[24px] font-semibold mr-2"
                        >
                          {formatNum(summary?.[item]?.count)}
                          {item === 'nsr' ? '%' : ''}
                        </span>
                      </div>
                      <div
                        className="text-xs mb-1 text-[#898b8f]"
                      >
                        {renderGrowth(summary?.[item], item)}
                      </div>
                      {Number(summary?.[item]?.industry_avg) !== 0 && (
                        <div className="text-xs text-[#898b8f]">
                          行业均值{' '}
                          <span>
                            {summary?.[item]?.industry_avg}
                            {item === 'nsr' ? '%' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ 分隔线 ═══ */}
        <hr
          className="text-[#edeef2] my-5 border-none border-t border-[#edeef2]"
        />

        {/* ═══ 3. 趋势相关性分析（对齐 dmp-web section 2） ═══ */}
        <div className="px-6 pb-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-semibold text-[#0d0d0d]">
              趋势相关性分析
            </span>
            <Select
              prefix={
                <span className="text-[var(--odn-color-black-9)]">指标设置</span>
              }
              value={metricForTrend}
              onChange={(v) => setMetricForTrend(v as string)}
              options={metricOptions}
            />
          </div>
          {/* 图例 */}
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-1.5 text-xs text-[#0d0d0d]">
              <span
                className="inline-block w-2.5 h-0.5 rounded"
                style={{ backgroundColor: colorBlue }}
              />
              域外
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#0d0d0d]">
              <span
                className="inline-block w-2.5 h-0.5 rounded"
                style={{ backgroundColor: colorGreen }}
              />
              域内
            </div>
          </div>
          {trend && (
            <TrendLineChart metricForTrend={metricForTrend} trend={trend} />
          )}
        </div>

        {/* ═══ 分隔线 ═══ */}
        <hr
          className="text-[#edeef2] mt-0 mx-0 mb-5 border-none border-t border-[#edeef2]"
        />

        {/* ═══ 4. 口碑分析（对齐 dmp-web section 3） ═══ */}
        <div className="px-6 pb-6">
          <div className="mb-4">
            <span className="text-base font-semibold text-[#0d0d0d]">
              口碑分析
            </span>
          </div>
          {sentiment && <InsightTip sentiment={sentiment} />}
          <div className="flex mt-4 h-[335px]">
            {/* 左侧：口碑分布饼图 */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#0d0d0d] mb-1 pt-5">
                口碑分布图
              </div>
              {sentiment && <SentimentPie sentiment={sentiment} />}
            </div>
            {/* 右侧：词云 */}
            <div className="flex-[2] min-w-0 h-full">
              <div className="ml-6 mt-5 h-full">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-sm font-semibold text-[#0d0d0d]">
                    词云图
                  </span>
                  <div className="flex items-center gap-2.5">
                    <Tooltip popup="词云所展示的是在正向/负向内容中的高频词汇。情感判断基于内容整体，而非单个词语，同一词语可能因语境差异同时出现在不同情感词云中。">
                      <Icon
                        name="help-circle"
                        size={14}
                        className="text-[#898b8f] cursor-help"
                      />
                    </Tooltip>
                    <Select
                      prefix={
                        <span className="text-[var(--odn-color-black-9)]">
                          词云设置
                        </span>
                      }
                      value={wordCloudMetric}
                      onChange={(v) => setWordCloudMetric(v as string)}
                      options={wordCloudOptions}
                    />
                  </div>
                </div>
                {word && (
                  <WordCloudSection wordData={word} metric={wordCloudMetric} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </RuyiLayout>
  );
}
