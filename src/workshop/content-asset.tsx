'use client';

import {
  Button,
  RuyiLayout,
  Select,
  Tooltip,
  type RuyiMenuItem,
} from 'one-design-next';
// @ts-ignore
import EChartsReact from 'echarts-for-react';
import React, { useEffect, useRef, useState } from 'react';
import WordCloud from 'react-d3-cloud';
import { RyDateRangePicker } from '../blocks/ry-date-range-picker';
import contentAssetFixture from './data/content-asset.json';

// 本地 fixtures，避免预览域等非 localhost 来源被 CDN CORS 拦截
const contentAssetCdnData = contentAssetFixture as Record<string, any>;

// ─── 常量（对齐 dmp-web contentAsset/common.ts + index.tsx） ─────
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

const indicatorNameMap: Record<string, string> = {
  touch_cnt: '触达数',
  content_pub_cnt: '新发布内容数',
  search_cnt: '搜索数',
  interactive_cnt: '互动数',
  ad_click_cnt: '点击数',
};

const metricList = [
  { title: '曝光触达', items: ['touch_cnt', 'content_pub_cnt'] },
  { title: '种草互动', items: ['search_cnt', 'interactive_cnt'] },
  { title: '效果转化', items: ['ad_click_cnt'] },
];

const metricOptions = [
  { value: 'touch_cnt', label: '触达数' },
  { value: 'content_pub_cnt', label: '新发布内容数' },
  { value: 'search_cnt', label: '搜索数' },
  { value: 'interactive_cnt', label: '互动数' },
  { value: 'ad_click_cnt', label: '点击数' },
];

function formatNum(v: any): string {
  const n = Number(v);
  if (isNaN(n)) return '--';
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

// 增长率渲染（对齐 dmp-web renderGrowth）
function renderGrowth(growth: string) {
  if (!growth) return null;
  if (growth === '0') return <span className="text-[#296bef]">持平</span>;
  const isNeg = growth.startsWith('-');
  const abs = isNeg ? growth.slice(1) : growth;
  return (
    <span className={isNeg ? 'text-[#ff0000]' : 'text-[#07c160]'}>
      {isNeg ? '低' : '高'} {abs}
    </span>
  );
}

// ─── 雷达图（对齐 dmp-web contentAsset RadarBox） ─────
function RadarChart({ report }: { report: any }) {
  const selectedIndex = ['touch_cnt', 'ad_click_cnt', 'search_cnt'];
  const dimensionNames = ['曝光触达', '效果转化', '种草互动'];

  const indicatorConfig = selectedIndex.map((idx, i) => ({
    name: dimensionNames[i],
    max:
      Math.max(+report[idx]?.self_cnt || 0, +report[idx]?.compare_cnt || 0) ||
      100,
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
                  value: selectedIndex.map((idx) => report[idx]?.self_cnt),
                  lineStyle: { color: colorBlue },
                  areaStyle: { color: 'rgba(105,151,244,0.16)' },
                },
                {
                  value: selectedIndex.map((idx) => report[idx]?.compare_cnt),
                  lineStyle: { color: colorGreen },
                  areaStyle: { color: 'rgba(51,210,203,0.16)' },
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
  selfData,
  compareData,
  yAxisName,
  referenceName,
}: {
  selfData: any[];
  compareData: any[];
  yAxisName: string;
  referenceName: string;
}) {
  const formatDate = (d: string) => {
    const s = String(d);
    return s.length >= 8 ? `${s.slice(4, 6)}-${s.slice(6, 8)}` : s;
  };
  const xData = (selfData || []).map((d: any) => formatDate(d.day));

  return (
    <EChartsReact
      className="w-full h-[312px] mb-6"
      option={{
        grid: { top: 40, right: 0, bottom: 0, left: 0, containLabel: true },
        tooltip: { show: true, trigger: 'axis' },
        xAxis: {
          axisTick: { show: false },
          axisLabel: { color: '#939393' },
          data: xData,
          axisLine: { lineStyle: { color: '#E6E8ED' } },
        },
        yAxis: [
          {
            type: 'value',
            name: yAxisName,
            nameTextStyle: {
              align: 'right',
              color: 'rgba(0,0,0,0.4)',
              padding: [0, 8, 0, 0],
            },
            splitNumber: 5,
            splitLine: { lineStyle: { color: ['#EDEFF2'] } },
            axisLabel: { color: '#939393' },
          },
        ],
        series: [
          {
            type: 'line',
            smooth: true,
            symbol: 'circle',
            showSymbol: false,
            symbolSize: 8,
            name: '本品',
            data: (selfData || []).map((d: any) => [
              formatDate(d.day),
              Math.round(+d.count),
            ]),
            color: colorBlue,
            itemStyle: { borderWidth: 2, borderColor: '#fff' },
          },
          {
            type: 'line',
            smooth: true,
            symbol: 'circle',
            showSymbol: false,
            symbolSize: 8,
            name: referenceName,
            data: (compareData || []).map((d: any) => [
              formatDate(d.day),
              Math.round(+d.count),
            ]),
            color: colorGreen,
            itemStyle: { borderWidth: 2, borderColor: '#fff' },
          },
        ],
      }}
    />
  );
}

// ─── 矩阵散点图（对齐 dmp-web EChartsReact scatter with markArea） ─────
const xAxisMin = -7,
  xAxisMax = 107,
  xAxisMiddle = (xAxisMin + xAxisMax) / 2;
const yAxisMin = -20,
  yAxisMax = 120,
  yAxisMiddle = (yAxisMin + yAxisMax) / 2;

function MatrixChart({
  matrixData,
  metricName,
  brandId,
}: {
  matrixData: any[];
  metricName: string;
  brandId: string;
}) {
  if (!matrixData?.length)
    return (
      <div className="flex items-center justify-center h-[400px] text-sm text-[#898b8f]">
        无数据
      </div>
    );

  return (
    <div className="relative">
      <span
        className="absolute top-[10px] right-[60px] z-[2] px-3 text-[14px] leading-[30px] text-[#fff] bg-[#296bef] rounded-[0_0_0_4px] opacity-70"
      >
        机会盘
      </span>
      <span
        className="absolute right-[60px] bottom-[60px] z-[2] px-3 text-[14px] leading-[30px] text-[#fff] bg-[#94b5f7] rounded-[4px_0_0] opacity-70"
      >
        突破盘
      </span>
      <span
        className="absolute bottom-[60px] left-[80px] z-[2] px-3 text-[14px] leading-[30px] text-[#fff] bg-[#fdc780] rounded-[0_4px_0_0] opacity-70"
      >
        探索盘
      </span>
      <span
        className="absolute top-[10px] left-[80px] z-[2] px-3 text-[14px] leading-[30px] text-[#fff] bg-[#fa8e00] rounded-[0_0_4px] opacity-70"
      >
        潜力盘
      </span>
      <EChartsReact
        className="h-[416px] w-full"
        notMerge
        option={{
          animation: false,
          grid: {
            left: 50,
            right: 60,
            top: 10,
            bottom: 40,
            containLabel: true,
          },
          dataZoom: [
            {
              type: 'slider',
              bottom: 6,
              showDataShadow: false,
              showDetail: false,
            },
            {
              type: 'slider',
              orient: 'vertical',
              showDataShadow: false,
              showDetail: false,
            },
          ],
          xAxis: { show: false, min: xAxisMin, max: xAxisMax },
          yAxis: [
            {
              type: 'value',
              show: false,
              min: yAxisMin,
              max: yAxisMax,
              splitLine: { show: false },
            },
          ],
          tooltip: {
            show: true,
            borderColor: '#EDEEF2',
            borderWidth: 1,
            borderRadius: 6,
          },
          series: matrixData.map((d: any, index: number) => ({
            type: 'scatter',
            data: [
              {
                name: d.brand_name,
                value: [+d.x_normalized_value, +d.y_normalized_value],
              },
            ],
            name: d.brand_name,
            symbolSize: 16,
            itemStyle: {
              color:
                String(d.brand_id) === String(brandId) ? '#6997F4' : '#33D2CB',
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{b}',
              color: 'rgba(0,0,0,0.95)',
              fontSize: 14,
            },
            markLine:
              index === 0
                ? {
                    symbol: 'none',
                    silent: true,
                    label: {
                      position: 'start',
                      fontSize: 12,
                      color: '#898B8F',
                    },
                    lineStyle: { type: 'solid', color: '#EDEFF2', width: 2 },
                    data: [
                      {
                        xAxis: xAxisMin,
                        label: {
                          formatter: `${metricName}低`,
                          offset: [28, 0],
                        },
                      },
                      {
                        xAxis: xAxisMax,
                        label: {
                          formatter: `${metricName}高`,
                          offset: [-28, 0],
                        },
                      },
                      {
                        yAxis: yAxisMin,
                        label: {
                          formatter: `${metricName}环比低`,
                          offset: [0, -6],
                        },
                      },
                      {
                        yAxis: yAxisMax,
                        label: {
                          formatter: `${metricName}环比高`,
                          offset: [0, 6],
                        },
                      },
                    ],
                  }
                : undefined,
            markArea:
              index === 0
                ? {
                    silent: true,
                    data: [
                      [
                        {
                          xAxis: xAxisMiddle,
                          yAxis: yAxisMax,
                          itemStyle: { color: '#e0e9fc' },
                        },
                        { xAxis: xAxisMax, yAxis: yAxisMiddle },
                      ],
                      [
                        {
                          xAxis: xAxisMin,
                          yAxis: yAxisMax,
                          itemStyle: { color: '#fde4c6' },
                        },
                        { xAxis: xAxisMiddle, yAxis: yAxisMiddle },
                      ],
                      [
                        {
                          xAxis: xAxisMin,
                          yAxis: yAxisMiddle,
                          itemStyle: { color: '#fff7ee' },
                        },
                        { xAxis: xAxisMiddle, yAxis: yAxisMin },
                      ],
                      [
                        {
                          xAxis: xAxisMiddle,
                          yAxis: yAxisMiddle,
                          itemStyle: { color: '#f4f7ff' },
                        },
                        { xAxis: xAxisMax, yAxis: yAxisMin },
                      ],
                    ],
                  }
                : undefined,
            zlevel: 1,
          })),
        }}
      />
    </div>
  );
}

// ─── 品牌排名列表（对齐 dmp-web RankListItem + self_rank 高亮行） ─────
function RankList({
  rankData,
  searchKey,
}: {
  rankData: any;
  searchKey: string;
}) {
  const list: any[] = rankData?.self_rank?.list || [];
  const filtered = searchKey
    ? list.filter((item: any) =>
        item.brand_name?.toLowerCase().includes(searchKey.toLowerCase()),
      )
    : list;

  // 找到本品牌（brand_id=1000040 即香奈儿）
  const selfItem = list.find(
    (item: any) => String(item.brand_id) === '1000040',
  );

  return (
    <div className="border-t-[1.5px] border-[#6997f4]">
      <div
        className="px-5 py-3 text-[#0d0d0d] text-[14px] font-semibold bg-[var(--odn-color-blue-1)] flex items-center gap-1"
      >
        本品排名
      </div>
      {/* 本品高亮行（对齐现网：蓝色排名+logo+品牌名） */}
      {selfItem && (
        <div
          className="flex items-center px-5 py-3 text-[14px] border-b border-[#e2e5ea]"
        >
          <span
            className="w-8 text-center text-[#296BEF] text-[14px] font-semibold"
          >
            {selfItem.no}
          </span>
          {selfItem.brand_logo ? (
            <img
              src={selfItem.brand_logo}
              alt=""
              className="w-7 h-7 rounded-full mr-2 object-cover"
            />
          ) : (
            <span
              className="w-7 h-7 rounded-full mr-2 inline-flex items-center justify-center bg-[#e2e5ea] text-[10px] text-[#898b8f]"
            >
              —
            </span>
          )}
          <span className="text-[#296BEF] font-semibold">
            {selfItem.brand_name}
          </span>
        </div>
      )}
      <div className={`overflow-y-auto ${selfItem ? 'h-[350px]' : 'h-[394px]'}`}>
        {filtered.map((item: any, i: number) => (
          <div
            key={i}
            className="flex items-center px-5 py-2 hover:bg-[#49597a08] text-[14px] text-[#0d0d0d]"
          >
            <span
              className="w-8 text-center text-[#898b8f] text-[12px]"
            >
              {item.no}
            </span>
            {item.brand_logo ? (
              <img
                src={item.brand_logo}
                alt=""
                className="w-6 h-6 rounded-full mr-2 object-cover"
              />
            ) : (
              <span
                className="w-6 h-6 rounded-full mr-2 inline-flex items-center justify-center bg-[#e2e5ea] text-[10px] text-[#898b8f]"
              >
                —
              </span>
            )}
            <span className="truncate flex-1">{item.brand_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 品牌关键词（对齐 dmp-web HotWords）─────
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
const TIER_COLORS: Record<number, string> = {
  1: '#296BEF',
  2: '#6997F4',
  3: '#33D2CB',
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

function HotWordsSection({ cloudData }: { cloudData: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries)
        setContainerWidth(Math.max(300, e.contentRect.width - 48));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const sorted = [...cloudData].sort((a: any, b: any) => +b.count - +a.count);
  const maxCount = sorted.length > 0 ? +sorted[0].count : 1;
  const wordCloudItems = sorted.map((item: any) => ({
    text: item.keyword,
    value: +item.count,
  }));

  return (
    <div
      className="flex h-[335px] border border-[#e2e5ea] rounded-lg"
    >
      {/* 左侧词列表（对齐 dmp-web HotWords .left） */}
      <div
        className="flex-1 min-w-0 border-r border-[#e2e5ea]"
      >
        <div
          className="text-[#0d0d0d] font-semibold text-[14px] mb-1 pt-5 px-6"
        >
          词列表
        </div>
        <div
          className="flex px-6 py-[9px] leading-[22px] text-[rgba(38,38,41,0.72)] text-[14px]"
        >
          <span className="w-[120px] shrink-0 mr-4">
            关键词
          </span>
          <span className="flex-1">内容数</span>
        </div>
        <div className="h-[230px] overflow-y-auto">
          {sorted.map((item: any, i: number) => (
            <div
              key={i}
              className="flex hover:bg-[#3f5b8008] px-6 py-[9px] leading-[22px] text-[14px] text-[#0d0d0d] rounded-[6px]"
            >
              <div
                className="w-[120px] shrink-0 mr-4 overflow-hidden text-ellipsis whitespace-nowrap"
                title={item.keyword}
              >
                {item.keyword}
              </div>
              <div className="flex-1 flex items-center">
                <span
                  className="inline-block rounded-[2px] h-3 bg-[#439bff] mr-2 min-w-[2px]"
                  style={{
                    width: Math.min((+item.count / maxCount) * 160, 160),
                  }}
                />
                <span
                  className="tabular-nums text-[14px] text-[#0d0d0d]"
                >
                  {formatNum(item.count)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 右侧词云图（对齐 dmp-web CustomWordCloud via react-d3-cloud） */}
      <div
        className="flex-[2] min-w-0 overflow-hidden h-full"
        ref={containerRef}
      >
        <div className="mx-6 my-5 h-full">
          <div
            className="text-[#0d0d0d] font-semibold text-[14px] mb-2.5"
          >
            词云图
          </div>
          {wordCloudItems.length > 0 && containerWidth > 0 && (
            <div className="overflow-hidden h-[260px]">
              <WordCloud
                data={wordCloudItems}
                width={containerWidth}
                height={250}
                font="PingFang SC"
                fontStyle="normal"
                fontWeight={(d: any) => {
                  const idx = sorted.findIndex(
                    (w: any) => w.keyword === d.text,
                  );
                  return TIER_WEIGHTS[getWordTier(idx === -1 ? 99 : idx)];
                }}
                fontSize={(word: any) => {
                  const idx = sorted.findIndex(
                    (w: any) => w.keyword === word.text,
                  );
                  return TIER_SIZES[getWordTier(idx === -1 ? 99 : idx)];
                }}
                spiral="archimedean"
                rotate={0}
                padding={2}
                random={() => 0.5}
                fill={(d: any) => {
                  const idx = sorted.findIndex(
                    (w: any) => w.keyword === d.text,
                  );
                  return TIER_COLORS[getWordTier(idx === -1 ? 99 : idx)];
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 主页面 ─────
export default function ContentAssetPage() {
  const cdnData = contentAssetCdnData;
  const [activeNav, setActiveNav] = useState('洞察诊断');
  const [activeMenu, setActiveMenu] = useState('inner-spread');
  const [metricForRank, setMetricForRank] = useState('touch_cnt');
  const [contentDateRange, setContentDateRange] = useState<[Date, Date]>([
    new Date('2026-03-23'),
    new Date('2026-04-21'),
  ]);
  const [metricForTrend, setMetricForTrend] = useState('touch_cnt');
  const [brandSearchKey, setBrandSearchKey] = useState('');

  const report = cdnData?.report;
  const rank = cdnData?.rank;
  const matrix = cdnData?.matrix;
  const trend = cdnData?.trend;
  const cloud = cdnData?.cloud;

  const referenceName = '行业均值';

  return (
    <RuyiLayout
      navItems={['首页', '洞察诊断', '人群策略', '策略应用', '全域度量']}
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
      {/* ═══ 1. 筛选栏 ═══ */}
      <div className="bg-white rounded-xl px-6 py-4 flex items-center gap-4">
        <RyDateRangePicker
          value={contentDateRange}
          onChange={setContentDateRange}
          triggerLabel="日期"
          triggerWidth="280px"
        />
        <Select
          value="compare_other_brand"
          options={[
            { label: '对比其他品牌', value: 'compare_other_brand' },
            { label: '对比自身历史', value: 'compare_self_history' },
          ]}
          className="w-[200px]"
          prefix={
            <span className="text-[var(--odn-color-black-9)]">对比模式</span>
          }
        />
        <Select
          value="industry_avg"
          options={[
            { label: '行业均值', value: 'industry_avg' },
            { label: '行业top5均值', value: 'industry_top5_avg' },
            { label: '竞品均值', value: 'cpt_avg', disabled: true },
          ]}
          className="w-[200px]"
          prefix={
            <span className="text-[var(--odn-color-black-9)]">参考系</span>
          }
        />
        <div className="ml-auto">
          <Button light icon="download" className="text-[#898B8F]">
            下载数据
          </Button>
        </div>
      </div>

      {/* ═══ 2. 品牌传播概览（对齐 dmp-web section 1） ═══ */}
      <div
        className="bg-white rounded-xl border border-[#e2e5ea]"
      >
        <div className="px-6 py-5 border-b border-[#e5e6eb]">
          <span className="text-base font-semibold text-[#0d0d0d]">
            品牌传播概览
          </span>
          <a
            href="https://doc.weixin.qq.com/doc/w3_AcgA_AYzAC0CNnssRntmQQl6RdvSO"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#898b8f] ml-2"
          >
            数据范围
          </a>
        </div>
        <div
          className="flex border border-[#e2e5ea] rounded-lg m-4"
        >
          {/* 左：雷达图 */}
          <div
            className="flex-1 min-w-0 border-r border-[#e2e5ea]"
          >
            <div className="flex items-center gap-4 mx-6 mt-6">
              <div className="flex items-center gap-1.5 text-xs text-[#0d0d0d]">
                <span
                  className="inline-block w-2.5 h-0.5 rounded"
                  style={{ backgroundColor: colorBlue }}
                />
                本品
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#0d0d0d]">
                <span
                  className="inline-block w-2.5 h-0.5 rounded"
                  style={{ backgroundColor: colorGreen }}
                />
                {referenceName}
              </div>
            </div>
            <div className="flex justify-center pt-6">
              {report && <RadarChart report={report} />}
            </div>
          </div>
          {/* 右：指标卡片（对齐 dmp-web metricBox） */}
          <div className="flex-[2] min-w-0">
            <div className="flex pt-5 pl-6">
              {metricList.map((col, ci) => (
                <div key={ci} className="flex-1">
                  <div
                    className="text-[#0d0d0d] font-semibold text-[14px] mb-5"
                  >
                    {col.title}
                  </div>
                  {col.items.map((item) => (
                    <div key={item} className="mb-6">
                      <Tooltip popup={indicatorNameMap[item]}>
                        <span className="text-sm text-[#0d0d0d] underline decoration-dashed underline-offset-4 decoration-[#c0c0c0] cursor-help">
                          {indicatorNameMap[item]}
                        </span>
                      </Tooltip>
                      <div className="mb-1 mt-1">
                        <span
                          className="tabular-nums text-[#0d0d0d] font-semibold text-[24px] mr-2"
                        >
                          {formatNum(report?.[item]?.self_cnt)}
                        </span>
                      </div>
                      <div
                        className="text-[#898b8f] text-[12px] mb-1"
                      >
                        比{referenceName}{' '}
                        <span>{formatNum(report?.[item]?.compare_cnt)}</span>{' '}
                        {renderGrowth(report?.[item]?.growth)}
                      </div>
                      <div className="text-[#898b8f] text-[12px]">
                        本品排名 <span>{report?.[item]?.self_rank}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 3. 品牌排名（对齐 dmp-web section 2：排名列表+矩阵散点图） ═══ */}
      <div
        className="bg-white rounded-xl border border-[#e2e5ea]"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e6eb]">
          <div>
            <span className="text-base font-semibold text-[#0d0d0d]">
              品牌排名
            </span>
            <span className="text-xs text-[#898b8f] ml-2">
              (更多指标排名详见「竞争格局」)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Select
              prefix="指标设置"
              value={metricForRank}
              onChange={(v) => setMetricForRank(v as string)}
              options={metricOptions}
            />
          </div>
        </div>
        <div
          className="flex h-[534px] border border-[#e2e5ea] rounded-lg m-4"
        >
          {/* 左：排名列表 */}
          <div
            className="flex-1 min-w-0 border-r border-[#e2e5ea] pt-5 px-6"
          >
            {rank && <RankList rankData={rank} searchKey={brandSearchKey} />}
          </div>
          {/* 右：矩阵分析 */}
          <div className="flex-[2] min-w-0 h-full">
            <div className="mx-6 my-5 h-full">
              <div className="flex items-center justify-between mb-5">
                <span
                  className="text-[#0d0d0d] font-semibold text-[14px]"
                >
                  矩阵分析
                </span>
              </div>
              <div className="flex mb-4">
                <div className="flex items-center gap-1.5 text-xs text-[#0d0d0d] mr-3">
                  <span
                    className="inline-block w-2 h-2 rounded-full bg-[#6997F4]"
                  />
                  本品牌
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#0d0d0d]">
                  <span
                    className="inline-block w-2 h-2 rounded-full bg-[#33D2CB]"
                  />
                  对比品牌
                </div>
              </div>
              <MatrixChart
                matrixData={matrix?.matrix || []}
                metricName={indicatorNameMap[metricForRank]}
                brandId="1000040"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 4. 趋势分析（对齐 dmp-web section 3） ═══ */}
      <div
        className="bg-white rounded-xl border border-[#e2e5ea]"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e6eb]">
          <span className="text-base font-semibold text-[#0d0d0d]">
            趋势分析
          </span>
          <Select
            prefix="指标设置"
            value={metricForTrend}
            onChange={(v) => setMetricForTrend(v as string)}
            options={metricOptions}
          />
        </div>
        <div
          className="pt-5 px-6 border border-[#e2e5ea] rounded-lg m-4"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-1.5 text-xs text-[#0d0d0d]">
              <span
                className="inline-block w-2.5 h-0.5 rounded"
                style={{ backgroundColor: colorBlue }}
              />
              本品牌
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#0d0d0d]">
              <span
                className="inline-block w-2.5 h-0.5 rounded"
                style={{ backgroundColor: colorGreen }}
              />
              {referenceName}
            </div>
          </div>
          {trend && (
            <TrendLineChart
              selfData={trend.self}
              compareData={trend.compare}
              yAxisName={indicatorNameMap[metricForTrend]}
              referenceName={referenceName}
            />
          )}
        </div>
      </div>

      {/* ═══ 5. 品牌关键词（对齐 dmp-web section 4：词列表+词云） ═══ */}
      <div
        className="bg-white rounded-xl border border-[#e2e5ea]"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e6eb]">
          <span className="text-base font-semibold text-[#0d0d0d]">
            品牌关键词
          </span>
          <div className="flex items-center gap-2">
            <Select
              prefix="关键词类型"
              value="all"
              options={[{ label: '不限', value: 'all' }]}
            />
          </div>
        </div>
        <div className="px-6 py-5">
          {cloud?.list && <HotWordsSection cloudData={cloud.list} />}
        </div>
      </div>
    </RuyiLayout>
  );
}
