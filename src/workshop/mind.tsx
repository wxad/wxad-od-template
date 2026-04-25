'use client';

import {
  Button,
  Checkbox,
  Dropdown,
  Icon,
  Input,
  Popover,
  RuyiLayout,
  Select,
  Tooltip,
} from 'one-design-next';
import React, { useMemo, useState } from 'react';
// @ts-ignore
import * as echarts from 'echarts';
import EChartsReact from 'echarts-for-react';
// @ts-ignore
import WordCloud from 'react-d3-cloud';

import mindShareRankJson from './data/mind-share-rank.json';
import mindTrendJson from './data/mind-trend.json';
import mindWordCloudJson from './data/mind-word-cloud.json';

// 本地 fixtures，避免预览域等非 localhost 来源被 CDN CORS 拦截
const mindSearchInsightFixtures = {
  shareRank: mindShareRankJson,
  trend: mindTrendJson,
  cloud: mindWordCloudJson,
};

// ─── 内联数据 ─────────────────────────────────

const reportDetail = {
  mind_insight_id: '115',
  name: 'test',
  analyze_time_start: '20250601',
  analyze_time_end: '20250715',
  compare_time_start: '20250601',
  compare_time_end: '20250715',
  status: 'SUCCESS',
  minds: [
    {
      mind_name: '默认名称1',
      include_keywords: [
        '滴滴出行',
        '游戏',
        '一点点奶茶',
        '京东电商',
        '微信运动',
      ],
      exclude_keywords: [],
      mind_id: '153',
    },
    {
      mind_name: '默认名称2',
      include_keywords: [
        '瑞幸咖啡',
        '一点点奶茶',
        '喜茶奶茶',
        '花小猪打车',
        '麻将',
        '美团外卖',
      ],
      exclude_keywords: [],
      mind_id: '154',
    },
  ],
};

const rankData = [
  { rank: 1, rankDod: 0, name: '默认名称1', value: '562644842', growth: '0' },
  { rank: 2, rankDod: 0, name: '默认名称2', value: '534876146', growth: '0' },
];

const matrixData = [
  {
    brand_name: '默认名称1',
    brand_id: '153',
    x_normalized_value: 100,
    y_normalized_value: 50,
    x_origin_value: '562644842.00',
    y_origin_value: '0.00%',
  },
  {
    brand_name: '默认名称2',
    brand_id: '154',
    x_normalized_value: 0,
    y_normalized_value: 50,
    x_origin_value: '534876146.00',
    y_origin_value: '0.00%',
  },
];

const keywordTypeOptions = [
  { label: '不限', value: 'all' },
  { label: '产品词', value: 'product_word' },
  { label: '商业概念', value: 'concept_name' },
];

const MENU_ITEMS = [
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

// ─── 工具函数 ─────────────────────────────────

function formatDate(s: string) {
  if (!s || s.length !== 8) return '';
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

function formatNum(v: string | number) {
  const n = Number(v);
  if (isNaN(n)) return '-';
  return n.toLocaleString('zh-CN');
}

// ─── RankTable（对齐 dmp-web src/components/RankTable） ─────

function RankTable({ list }: { list: typeof rankData }) {
  return (
    <div
      className="flex flex-col gap-2 pr-2 pt-2 pb-2 max-h-[312px] overflow-y-auto w-[380px]"
    >
      {list.map((item, i) => (
        <div
          key={i}
          className="flex items-center justify-between bg-black-1 rounded px-3 h-[50px]"
        >
          <div
            className="font-semibold tabular-nums text-brand-6 text-sm mr-3 w-[9px] whitespace-nowrap"
          >
            {item.rank}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-black-12 font-semibold text-[13px] leading-[22px]"
            >
              {item.name}
            </div>
            <div
              className="flex items-center gap-2 text-black-10 text-[12px] leading-[20px]"
            >
              <Tooltip popup="类目下累计搜索次数经指数化处理，非真实值">
                <span className="border-b border-dashed border-black-6 cursor-help">
                  搜索数指数
                </span>
              </Tooltip>
              <span className="tabular-nums">{formatNum(item.value)}</span>
            </div>
          </div>
          <div
            className="ml-3 text-sm tabular-nums w-[56px] whitespace-nowrap"
          >
            {Number(item.growth) === 0 ? (
              <span className="text-black-9">0%</span>
            ) : Number(item.growth) > 0 ? (
              <span className="text-[#07C160]">+{item.growth}%</span>
            ) : (
              <span className="text-[#E63D2E]">{item.growth}%</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MatrixChart（对齐 dmp-web src/components/MatrixChart） ─────

const BG_BLUE = '#e5edfd';
const FG_BLUE = '#296bef';
const BG_GREEN = '#eafaf9';
const FG_GREEN = '#33d2cb';
const BG_ORANGE = '#fef5e9';
const FG_ORANGE = '#fcb04c';
const MX_OPACITY = 0.7;
const xMin = -7,
  xMax = 107,
  yMin = -20,
  yMax = 120;
const xMid = (xMin + xMax) / 2,
  yMid = (yMin + yMax) / 2;

function MatrixChart({
  data,
  showTextLabel,
}: {
  data: typeof matrixData;
  showTextLabel: boolean;
}) {
  const option = useMemo(
    () => ({
      animation: false,
      grid: { left: -30, right: 0, top: 0, bottom: -20, containLabel: true },
      xAxis: {
        show: false,
        min: xMin,
        max: xMax,
        splitNumber: 1,
        axisTick: { show: false },
      },
      yAxis: [
        {
          type: 'value' as const,
          show: false,
          min: yMin,
          max: yMax,
          splitLine: { show: false },
          axisTick: { show: false },
        },
      ],
      tooltip: {
        show: true,
        borderColor: '#EDEEF2',
        borderWidth: 1,
        borderRadius: 6,
      },
      series: data.map((d, idx) => {
        const color =
          d.x_normalized_value > 50
            ? d.y_normalized_value > 50
              ? FG_BLUE
              : FG_GREEN
            : d.y_normalized_value > 50
              ? FG_GREEN
              : FG_ORANGE;
        return {
          type: 'scatter',
          data: [
            {
              name: d.brand_name,
              value: [d.x_normalized_value, d.y_normalized_value],
            },
          ],
          name: d.brand_name,
          symbolSize: 10,
          itemStyle: { color, opacity: MX_OPACITY },
          label: {
            show: showTextLabel,
            position: 'right' as const,
            formatter: '{b}',
            color: 'rgba(0,0,0,0.95)',
            fontSize: 13,
          },
          tooltip: {
            formatter: (p: any) =>
              `<div style="font-size:13px"><p style="margin-bottom:4px">${p.seriesName}</p>${d.x_origin_value ? `<p style="display:flex;justify-content:space-between;width:220px"><span>搜索数指数</span><span style="font-weight:500">${formatNum(d.x_origin_value)}</span></p>` : ''}${d.y_origin_value ? `<p style="display:flex;justify-content:space-between;width:220px"><span>搜索增长率</span><span style="font-weight:500">${d.y_origin_value}</span></p>` : ''}</div>`,
          },
          markArea:
            idx === 0
              ? {
                  silent: true,
                  data: [
                    [
                      {
                        xAxis: xMid,
                        yAxis: yMax,
                        itemStyle: { color: BG_BLUE },
                        label: { show: false },
                      },
                      { xAxis: xMax, yAxis: yMid },
                    ],
                    [
                      {
                        xAxis: xMin,
                        yAxis: yMax,
                        itemStyle: { color: BG_GREEN },
                        label: { show: false },
                      },
                      { xAxis: xMid, yAxis: yMid },
                    ],
                    [
                      {
                        xAxis: xMin,
                        yAxis: yMid,
                        itemStyle: { color: BG_ORANGE },
                        label: { show: false },
                      },
                      { xAxis: xMid, yAxis: yMin },
                    ],
                    [
                      {
                        xAxis: xMid,
                        yAxis: yMid,
                        itemStyle: { color: BG_GREEN },
                        label: { show: false },
                      },
                      { xAxis: xMax, yAxis: yMin },
                    ],
                  ],
                }
              : undefined,
          zlevel: 1,
        };
      }),
    }),
    [data, showTextLabel],
  );

  return (
    <div className="flex gap-1">
      {/* 左侧 Y 轴标注 */}
      <div
        className="flex flex-col justify-between text-xs text-[#898b8f] w-[50px] leading-[20px] h-[365px]"
      >
        <div>
          <div>搜索</div>
          <div>增长率</div>
          <div>高</div>
        </div>
        <div>
          <div>搜索</div>
          <div>增长率</div>
          <div>低</div>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {/* 顶部色条 */}
        <div className="flex rounded-t overflow-hidden">
          <div
            className="flex-1 h-[2.5px]"
            style={{ backgroundColor: BG_GREEN }}
          >
            <div
              className="w-full h-full"
              style={{ backgroundColor: FG_GREEN, opacity: MX_OPACITY }}
            />
          </div>
          <div
            className="flex-1 h-[2.5px]"
            style={{ backgroundColor: BG_BLUE }}
          >
            <div
              className="w-full h-full"
              style={{ backgroundColor: FG_BLUE, opacity: MX_OPACITY }}
            />
          </div>
        </div>
        {/* 图表 + 四角标签 */}
        <div className="relative">
          <span
            className="absolute top-0 right-0 z-10 text-sm text-white leading-[30px] px-3 rounded-bl"
            style={{ background: FG_BLUE, opacity: MX_OPACITY }}
          >
            机会盘
          </span>
          <span
            className="absolute bottom-0 right-0 z-10 text-sm text-white leading-[30px] px-3 rounded-tl"
            style={{ background: FG_GREEN, opacity: MX_OPACITY }}
          >
            突破盘
          </span>
          <span
            className="absolute bottom-0 left-0 z-10 text-sm text-white leading-[30px] px-3 rounded-tr"
            style={{ background: FG_ORANGE, opacity: MX_OPACITY }}
          >
            探索盘
          </span>
          <span
            className="absolute top-0 left-0 z-10 text-sm text-white leading-[30px] px-3 rounded-br"
            style={{ background: FG_GREEN, opacity: MX_OPACITY }}
          >
            潜力盘
          </span>
          <EChartsReact
            echarts={echarts}
            className="h-[360px] w-full"
            option={option}
            notMerge
          />
        </div>
        {/* 底部色条 */}
        <div className="flex rounded-b overflow-hidden">
          <div
            className="flex-1 h-[2.5px]"
            style={{ backgroundColor: BG_ORANGE }}
          >
            <div
              className="w-full h-full"
              style={{ backgroundColor: FG_ORANGE, opacity: MX_OPACITY }}
            />
          </div>
          <div
            className="flex-1 h-[2.5px]"
            style={{ backgroundColor: BG_GREEN }}
          >
            <div
              className="w-full h-full"
              style={{ backgroundColor: FG_GREEN, opacity: MX_OPACITY }}
            />
          </div>
        </div>
        {/* X 轴标注 */}
        <div
          className="flex items-center justify-between text-xs text-[#898b8f] h-5"
        >
          <div>搜索数指数低</div>
          <div>搜索数指数高</div>
        </div>
      </div>
    </div>
  );
}

// ─── RankListItem（对齐 dmp-web IndustryRankList/RankListItem） ─────

function RankListItem({
  listData,
  searchKey,
}: {
  listData: any;
  searchKey?: string;
}) {
  if (!listData?.list?.length)
    return <div className="py-8 text-center text-xs text-black-9">无数据</div>;
  const curItem = listData.cur;
  const allItems = [curItem, ...listData.list];
  const items = searchKey
    ? allItems.filter((item: any) =>
        item?.brand_name?.toLowerCase().includes(searchKey.toLowerCase()),
      )
    : allItems;

  return (
    <div>
      {/* 第一行（当前品牌高亮） */}
      {items[0] && (
        <div className="flex items-center h-9 px-5 bg-blue-1 text-sm">
          <span
            className="font-semibold text-brand-6 tabular-nums mr-3 w-[9px]"
          >
            {items[0].no === 9999 ? '' : items[0].no}
          </span>
          {items[0].brand_logo && (
            <img
              src={items[0].brand_logo}
              alt=""
              className="size-6 rounded-full border border-black-5 object-cover mr-2 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <span className="flex-1 truncate font-semibold text-brand-6">
            {items[0].brand_name}
          </span>
          {items[0].no === 9999 && (
            <span className="text-black-9 text-xs">未上榜</span>
          )}
          {items[0].no !== 9999 &&
            items[0].dod !== 0 &&
            items[0].dod !== 9999 &&
            Boolean(items[0].dod) && (
              <span
                className={`flex items-center gap-0.5 text-xs tabular-nums ${items[0].dod > 0 ? 'text-[#07C160]' : 'text-[#E63D2E]'}`}
              >
                <Icon
                  name={items[0].dod > 0 ? 'up-filled' : 'down-filled'}
                  size={10}
                />
                {Math.abs(items[0].dod)}
              </span>
            )}
        </div>
      )}
      {/* 其余排名 */}
      <div className="max-h-[280px] overflow-auto">
        {items.slice(1).map((item: any, i: number) => (
          <div key={i} className="flex items-center h-9 px-5 text-sm">
            <span
              className="text-black-9 tabular-nums mr-3 w-[9px]"
            >
              {item.no}
            </span>
            {item.brand_logo && (
              <img
                src={item.brand_logo}
                alt=""
                className="size-6 rounded-full border border-black-5 object-cover mr-2 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <span className="flex-1 truncate text-black-12">
              {item.brand_name}
            </span>
            {item.dod !== 0 && item.dod !== 9999 && Boolean(item.dod) && (
              <span
                className={`flex items-center gap-0.5 text-xs tabular-nums ${item.dod > 0 ? 'text-[#07C160]' : 'text-[#E63D2E]'}`}
              >
                <Icon
                  name={item.dod > 0 ? 'up-filled' : 'down-filled'}
                  size={10}
                />
                {Math.abs(item.dod)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RankSection（对齐 dmp-web src/components/RankSection） ─────

function RankSection({
  rankData,
  brandSearchKey,
}: {
  rankData: any;
  brandSearchKey: string;
}) {
  return (
    <div className="flex items-start">
      {/* 分析周期排名 */}
      <div
        className="flex-1 min-w-0 border-t-[1.5px] border-[#6997F4]"
      >
        <div className="px-5 py-3 bg-blue-1 text-sm font-semibold text-black-12">
          分析周期排名
        </div>
        <RankListItem
          listData={rankData?.analyze_rank}
          searchKey={brandSearchKey}
        />
      </div>
      {/* 减号连接符 */}
      <div
        className="shrink-0 mx-[7px] mt-[41px] w-[12px] h-[3px] bg-[#d9d9d9]"
      />
      {/* 对比周期排名 */}
      <div
        className="flex-1 min-w-0 border-t-[1.5px] border-[#6997F4]"
      >
        <div className="px-5 py-3 bg-blue-1 text-sm font-semibold text-black-12">
          对比周期排名
        </div>
        <RankListItem
          listData={rankData?.compare_rank}
          searchKey={brandSearchKey}
        />
      </div>
      {/* 等号连接符 */}
      <div
        className="shrink-0 mx-[7px] mt-[41px] w-[12px] h-[7px]"
        style={{
          background:
            'linear-gradient(180deg, #d9d9d9 2.5px, transparent 2.5px, transparent 4.5px, #d9d9d9 4.5px)',
        }}
      />
      {/* 排名提升榜 */}
      <div
        className="flex-1 min-w-0 border-t-[1.5px] border-[#6997F4]"
      >
        <div className="px-5 py-3 bg-blue-1 text-sm font-semibold text-black-12">
          排名提升榜
        </div>
        <RankListItem
          listData={rankData?.increase_rank}
          searchKey={brandSearchKey}
        />
      </div>
    </div>
  );
}

// ─── LineChart（对齐 dmp-web src/components/LineChart） ─────

function TrendLineChart({
  data,
  title,
  yAxisName = '搜索数指数',
}: {
  data: any[];
  title: string;
  yAxisName?: string;
}) {
  const chartData = useMemo(
    () =>
      (data || []).map((d: any) => ({
        day: d.day,
        count: Math.round(parseInt(d.search_count) || 0),
      })),
    [data],
  );

  const xData = chartData.map((d) => {
    const s = d.day;
    return s.length === 8 ? `${s.slice(4, 6)}-${s.slice(6, 8)}` : s;
  });

  const hasOnlyOne = chartData.length === 1;

  const option = useMemo(
    () => ({
      grid: { top: 20, right: 10, bottom: 20, left: 0, containLabel: true },
      tooltip: {
        show: true,
        trigger: 'axis' as const,
        padding: [16, 4],
        formatter: (params: any) => {
          const p = params[0];
          return `<div style="font-size:12px"><p style="margin-bottom:4px;font-weight:500">${p?.name}</p><div style="display:flex;align-items:center"><div style="width:10px;height:2px;border-radius:1px;background:#6997F4;margin-right:8px"></div><span style="margin-right:16px">${yAxisName}</span><span style="font-weight:500">${formatNum(p?.value?.[1] ?? p?.value)}</span></div></div>`;
        },
      },
      animationDuration: 500,
      xAxis: {
        axisTick: { show: false },
        axisLabel: { color: '#939393' },
        data: xData,
        axisLine: { lineStyle: { color: '#E6E8ED' } },
      },
      yAxis: [
        {
          type: 'value' as const,
          splitNumber: 5,
          splitLine: { lineStyle: { color: ['#EDEFF2'] } },
          axisLabel: { color: '#939393', formatter: '{value}' },
        },
      ],
      series: [
        {
          type: 'line',
          smooth: true,
          symbol: 'circle',
          showSymbol: hasOnlyOne,
          symbolSize: 8,
          lineStyle: { type: 'solid' as const },
          data: chartData.map((d) => [xData[chartData.indexOf(d)], d.count]),
          color: '#6997F4',
          itemStyle: { borderWidth: 2, borderColor: '#fff' },
        },
      ],
    }),
    [chartData, xData, hasOnlyOne, yAxisName],
  );

  if (!chartData.length)
    return (
      <div className="flex-1 py-20 text-center text-sm text-black-9">
        暂无数据
      </div>
    );

  return (
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold text-black-12 mb-5">{title}</div>
      <span className="text-[12px] text-[#898B8F] font-normal">
        {yAxisName}
      </span>
      <EChartsReact
        echarts={echarts}
        className="w-full h-[270px] mb-6"
        option={option}
      />
    </div>
  );
}

// ─── 词云（对齐 dmp-web src/components/WordCloud） ─────

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

function CustomWordCloud({
  data,
  width,
  height,
  tooltipValueLabel = '搜索数指数',
}: {
  data: { text: string; value: number }[];
  width: number;
  height: number;
  tooltipValueLabel?: string;
}) {
  if (!data?.length)
    return <div className="py-20 text-center text-sm text-black-9">无数据</div>;

  return (
    <div
      className="relative rounded-[6px] mx-auto"
      style={{ width, height }}
    >
      <WordCloud
        data={data}
        width={width}
        height={height}
        font="PingFang SC"
        fontStyle="normal"
        fontWeight={(d: any) => {
          const sorted = [...data].sort((a, b) => b.value - a.value);
          const idx = sorted.findIndex(
            (w) => w.value === d.value && w.text === d.text,
          );
          return TIER_WEIGHTS[getWordTier(idx === -1 ? 99 : idx)];
        }}
        fontSize={(word: any) => {
          const sorted = [...data].sort((a, b) => b.value - a.value);
          const idx = sorted.findIndex(
            (w) => w.value === word.value && w.text === word.text,
          );
          return TIER_SIZES[getWordTier(idx === -1 ? 99 : idx)];
        }}
        spiral="archimedean"
        rotate={0}
        padding={2}
        random={() => 0.5}
        fill={(d: any, i: number) => {
          const sorted = [...data].sort((a, b) => b.value - a.value);
          const idx = sorted.findIndex(
            (w) => w.value === d.value && w.text === d.text,
          );
          return TIER_COLORS[getWordTier(idx === -1 ? 99 : idx)];
        }}
      />
    </div>
  );
}

// ─── 热门词列表（对齐 dmp-web mind.module.less .keywordList） ─────

function KeywordList({ data, searchKey }: { data: any[]; searchKey: string }) {
  const filtered = searchKey
    ? data.filter((d: any) =>
        d.keyword.toLowerCase().includes(searchKey.toLowerCase()),
      )
    : data;
  const maxCount = Math.max(
    ...filtered.map((d: any) => parseInt(d.search_count) || 1),
    1,
  );

  return (
    <div className="shrink-0 w-[395px]">
      <div
        className="flex items-center px-5 text-sm text-black-10 h-[30px]"
      >
        <div className="shrink-0 w-[160px] mr-4">关键词</div>
        <div className="flex-1">搜索数指数</div>
      </div>
      <div className="h-[240px] overflow-y-auto">
        {filtered.map((item: any, i: number) => {
          const val = parseInt(item.search_count) || 0;
          const pct = Math.min((val / maxCount) * 100, 100);
          return (
            <div
              key={i}
              className="flex items-center text-sm px-5 h-[40px]"
            >
              <div
                className="shrink-0 w-[160px] mr-4 truncate"
                title={item.keyword}
              >
                {item.keyword}
              </div>
              <div className="flex-1 flex items-center">
                <div
                  className="flex-1 h-3 bg-black-3 rounded-sm overflow-hidden mr-2 min-w-[2px]"
                >
                  <div
                    className="h-full bg-blue-5 rounded-sm"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span
                  className="tabular-nums text-sm w-[72px] shrink-0 whitespace-nowrap text-right"
                >
                  {formatNum(item.search_count)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PartTitle（对齐 dmp-web src/components/PartHeader） ─────

function PartTitle({
  title,
  titleTips,
  right,
  style,
}: {
  title: string;
  titleTips?: string;
  right?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ height: 68, ...style }}
    >
      <div className="flex items-center gap-1">
        <span
          className="text-base font-semibold text-black-12"
          style={{ lineHeight: 1 }}
        >
          {title}
        </span>
        {titleTips && (
          <Tooltip popup={titleTips}>
            <Icon
              name="info-circle"
              size={14}
              className="text-black-8 cursor-help"
            />
          </Tooltip>
        )}
      </div>
      {right && <div className="flex items-center">{right}</div>}
    </div>
  );
}

// ─── SectionCard（对齐 dmp-web src/components/Card/SectionCard） ─────

function SectionCard({
  title,
  extro,
  children,
  style,
  headerBordered = true,
}: {
  title?: React.ReactNode;
  extro?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  headerBordered?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl" style={{ marginBottom: 0, ...style }}>
      {title && (
        <div
          className="flex items-center justify-between px-6"
          style={{
            height: 56,
            borderBottom: headerBordered
              ? '1px solid var(--odn-color-black-4)'
              : 'none',
          }}
        >
          <div className="text-base font-semibold text-black-12">{title}</div>
          {extro}
        </div>
      )}
      <div className="px-6">{children}</div>
    </div>
  );
}

// ─── 主页面 ─────────────────────────────────

export default function SearchInsight() {
  const cdnData = mindSearchInsightFixtures;
  const [activeNav, setActiveNav] = useState('洞察诊断');
  const [activeMenu, setActiveMenu] = useState('search-insight');
  const [activeKey, setActiveKey] = useState(reportDetail.minds[0].mind_id);
  const [showTextLabel, setShowTextLabel] = useState(true);
  const [brandSearchKey, setBrandSearchKey] = useState('');
  const [excludeMindWords, setExcludeMindWords] = useState(true);
  const [keywordType, setKeywordType] = useState('all');

  const activeTab = reportDetail.minds.find((m) => m.mind_id === activeKey);
  const slideTabItems = reportDetail.minds.map((m) => ({
    key: m.mind_id,
    value: m.mind_id,
    label: m.mind_name,
  }));

  const { shareRank, trend, cloud } = cdnData;

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
      accountName="香奈儿/Chanel – 美妆护肤"
      accountId="ID: 20458"
      contentClassName="flex flex-col gap-4"
    >
      {/* ═══ 顶部固定栏（对齐 SectionCard headerBordered={false}） ═══ */}
      <SectionCard
        title="自定义搜索洞察"
        extro={
          <Popover popup="因行业搜索等数据较为敏感，指数化即对真实值加脱敏算法后得到的近似值。脱敏可保证大小顺序，如美妆类目搜索真实值 > 护肤类目搜索真实值，指数化后大小不变">
            <Button light icon="info-circle" className="text-black-10">
              指数化说明
            </Button>
          </Popover>
        }
        headerBordered={false}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '#f3f5f6 0px -8px 0px 8px, 0px 3px 6px rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex flex-col gap-3 pb-4">
          <div className="flex items-center justify-between">
            <Select
              prefix={<span className="text-[var(--odn-color-black-9)]">报告</span>}
              value={reportDetail.mind_insight_id}
              options={[
                {
                  label: reportDetail.name,
                  value: reportDetail.mind_insight_id,
                },
              ]}
            />
            <div className="flex items-center gap-2">
              <Button light icon="file-text">
                查看输入条件
              </Button>
              <Button light icon="user-pack">
                添加人群
              </Button>
              <Button light intent="primary" icon="plus">
                新建报告
              </Button>
            </div>
          </div>
          <div
            className="flex items-center gap-4 text-[12px] leading-[20px] font-normal text-[#898B8F]"
          >
            <span>
              分析周期：{formatDate(reportDetail.analyze_time_start)} 至{' '}
              {formatDate(reportDetail.analyze_time_end)}
            </span>
            <span className="ml-4">
              对比周期：{formatDate(reportDetail.compare_time_start)} 至{' '}
              {formatDate(reportDetail.compare_time_end)}
            </span>
          </div>
        </div>
      </SectionCard>

      {/* ═══ 搜索标签分布（多标签时显示） ═══ */}
      {reportDetail.minds.length > 1 && (
        <SectionCard
          title="搜索标签分布"
          extro={
            <Button light icon="download-1">
              下载数据
            </Button>
          }
        >
          <div className="flex py-4">
            <div>
              <div className="text-sm font-semibold text-black-12 mb-2">
                标签排名
              </div>
              <RankTable list={rankData} />
            </div>
            <div className="flex-1 min-w-0 ml-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-black-12">
                  矩阵分析
                </span>
                <Checkbox
                  checked={showTextLabel}
                  onChange={() => setShowTextLabel(!showTextLabel)}
                >
                  显示文字
                </Checkbox>
              </div>
              <MatrixChart data={matrixData} showTextLabel={showTextLabel} />
            </div>
          </div>
        </SectionCard>
      )}

      {/* ═══ 标签详情 ═══ */}
      <SectionCard
        title={
          slideTabItems.length > 1 ? (
            <Dropdown
              menu={slideTabItems}
              onSelect={(val) => setActiveKey(val as string)}
            >
              <div className="flex items-center gap-1 cursor-pointer">
                <span>标签详情 - {activeTab?.mind_name}</span>
                <Icon name="sort" size={16} />
              </div>
            </Dropdown>
          ) : (
            <span>标签详情 - {activeTab?.mind_name}</span>
          )
        }
        extro={
          <Button light icon="download-1">
            下载数据
          </Button>
        }
      >
        {/* 品牌份额排名 */}
        <PartTitle
          title="品牌份额排名"
          titleTips={
            '当前标签下的品牌份额倒序排名。品牌份额="既搜索对应标签又搜索对应品牌的人群"在"标签搜索人群"的占比'
          }
          right={
            <Input
              leftElement={<Icon name="search" size={16} />}
              placeholder="请输入品牌名称"
              value={brandSearchKey}
              onChange={(e) => setBrandSearchKey(e.target.value)}
              className="w-[200px]"
            />
          }
        />
        <div className="pb-6">
          <RankSection rankData={shareRank} brandSearchKey={brandSearchKey} />
        </div>

        <div className="h-px bg-black-5 -mx-6" />

        {/* 人群关联搜索 */}
        <PartTitle
          title="人群关联搜索"
          titleTips="当前标签搜索人群还爱搜什么。即搜索人群在分析周期内本行业的热门搜索关键词"
          right={
            <div className="flex items-center">
              <Input
                leftElement={<Icon name="search" size={16} />}
                placeholder="请输入"
                value={brandSearchKey}
                onChange={(e) => setBrandSearchKey(e.target.value)}
                className="w-[160px] mr-4"
              />
              <Checkbox
                checked={excludeMindWords}
                onChange={() => setExcludeMindWords(!excludeMindWords)}
                className="mr-4"
              >
                排除标签包含词
              </Checkbox>
              <Select
                prefix={
                  <span className="text-[var(--odn-color-black-9)]">
                    关键词类型
                  </span>
                }
                value={keywordType}
                onChange={(v) => setKeywordType(v as string)}
                options={keywordTypeOptions}
                popupMatchSelectWidth={false}
              />
            </div>
          }
        />
        <div className="flex pt-0">
          <div>
            <div
              className="text-sm font-semibold px-5 leading-[22px]"
            >
              热门词
            </div>
            <KeywordList data={cloud?.list || []} searchKey={brandSearchKey} />
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-sm font-semibold px-5 leading-[22px]"
            >
              词云图
            </div>
            <div className="px-6 py-5 h-[295px]">
              <CustomWordCloud
                data={(cloud?.list || []).map((d: any) => ({
                  text: d.keyword,
                  value: parseInt(d.search_count) || 0,
                }))}
                width={600}
                height={255}
                tooltipValueLabel="搜索数指数"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-black-5 -mx-6 mt-6" />

        {/* 标签搜索趋势 */}
        <PartTitle title="标签搜索趋势" />
        <div className="flex gap-4 pb-6 h-[360px]">
          <TrendLineChart
            data={trend?.analyze || []}
            title="分析周期变化趋势"
          />
          <TrendLineChart
            data={trend?.compare || []}
            title="对比周期变化趋势"
          />
        </div>
      </SectionCard>
    </RuyiLayout>
  );
}
