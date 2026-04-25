'use client';

import {
  Button,
  Popover,
  RuyiLayout,
  Select,
  Tooltip,
  type RuyiMenuItem,
} from 'one-design-next';
import EChartsReact from 'echarts-for-react';
import React, { useMemo, useRef, useState } from 'react';
import {
  COMPETITOR_QUADRANTS,
  GROWTH_QUADRANTS,
  MatrixScatterChart,
} from '../blocks/quadrant-scatter';
import { RyDateRangePicker } from '../blocks/ry-date-range-picker';
import { MindTreemapD3 } from '../blocks/treemap-panel';
import brandMindDashboardFixture from './data/brand-mind-dashboard.json';

// 本地 fixtures，避免预览域等非 localhost 来源被 CDN CORS 拦截
const brandMindDashboardCdnData = brandMindDashboardFixture as Record<string, any>;

// ─── 常量 ─────
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

function formatNum(v: any): string {
  const n = Number(v);
  if (isNaN(n)) return '-';
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

// ─── 心智概览 指标块（对齐 dmp-web MindOverviewDetailBlock） ─────
function MindOverviewDetailBlock({ overview }: { overview: any }) {
  const dimensionColors = ['#aade3a', '#33d2cb', '#5dbfff', '#6997f4'];
  const dimensionLabels = ['触达心智', '互动心智', '友赞心智', '搜索心智'];
  const dimensionKeys = [
    'touch_percent',
    'interaction_percent',
    'share_percent',
    'search_percent',
  ];
  const dimensionValues = dimensionKeys.map((k) => overview?.[k] || '0%');
  const dimensionWidths = dimensionKeys.map(
    (k) => parseFloat(overview?.[k]) || 0.01,
  );

  return (
    <div
      className="border border-[#e2e5ea] rounded-[12px] px-6 py-5 h-[214px] box-border flex flex-col justify-between"
    >
      {/* 上部指标 */}
      <div className="flex gap-6">
        {/* 品牌心智量 */}
        <div
          className="flex-1 flex flex-col justify-between h-[102px]"
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-[8px] h-[3px] bg-[#296bef]"
            />
            <Tooltip popup="品牌内容与广告中，识别的心智的所有行为拟合形成的心智量汇总">
              <span
                className="text-[16px] font-semibold text-[#0d0d0d] border-b border-dashed border-[#898b8f]"
              >
                本品牌心智量
              </span>
            </Tooltip>
          </div>
          <div className="flex items-end gap-1.5">
            <span
              className="tabular-nums text-[30px] font-semibold leading-[38px] text-[#0d0d0d]"
            >
              {formatNum(overview?.brand_mind)}
            </span>
            <span
              className="text-[14px]"
              style={{
                color: overview?.brand_mind_ratio?.startsWith('-')
                  ? '#E63D2E'
                  : '#07C160',
              }}
            >
              {overview?.brand_mind_ratio}
            </span>
          </div>
          <div
            className="text-[14px] text-[#0d0d0d] h-[22px] flex items-center gap-2"
          >
            <span>行业均值</span>
            <span className="tabular-nums text-[16px]">
              {formatNum(overview?.ref_mind)}
            </span>
          </div>
        </div>

        <div
          className="w-0 h-[101px] shrink-0 border-l border-[rgba(73,90,122,0.12)]"
        />

        {/* 行业心智份额 */}
        <div
          className="flex-1 flex flex-col justify-between h-[102px]"
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-[8px] h-[3px] bg-[#fcb04c]"
            />
            <Tooltip popup="本品牌心智总量 / 行业心智总量">
              <span
                className="text-[16px] font-semibold text-[#0d0d0d] border-b border-dashed border-[#898b8f]"
              >
                本品牌行业心智份额
              </span>
            </Tooltip>
          </div>
          <div className="flex items-end gap-1.5">
            <span
              className="tabular-nums text-[30px] font-semibold leading-[38px] text-[#0d0d0d]"
            >
              {overview?.brand_share}
            </span>
            <span
              className="text-[14px]"
              style={{
                color: overview?.brand_share_ratio?.startsWith('-')
                  ? '#E63D2E'
                  : '#07C160',
              }}
            >
              {overview?.brand_share_ratio}
            </span>
          </div>
          <div
            className="text-[14px] text-[#0d0d0d] h-[22px] flex items-center gap-2"
          >
            <span>排名</span>
            <span className="tabular-nums text-[16px]">
              {overview?.industry_rank}
            </span>
            {overview?.rank_change > 0 && (
              <span className="text-[#07C160] text-[12px]">
                ↑{overview.rank_change}
              </span>
            )}
            {overview?.rank_change < 0 && (
              <span className="text-[#E63D2E] text-[12px]">
                ↓{Math.abs(overview.rank_change)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 下部维度条 */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          {dimensionLabels.map((label, i) => (
            <div key={i} className="flex-1 flex items-center gap-1.5 min-w-0">
              <span
                className="w-[8px] h-[8px] rounded-full shrink-0"
                style={{
                  backgroundColor: dimensionColors[i],
                }}
              />
              <Tooltip popup={`${label}占比`}>
                <span
                  className="text-[14px] text-[#0d0d0d] border-b border-dashed border-[#898b8f]"
                >
                  {label}
                </span>
              </Tooltip>
              <span
                className="tabular-nums text-[16px] font-semibold text-[#0d0d0d] whitespace-nowrap"
              >
                {dimensionValues[i]}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-px h-[8px]">
          {dimensionWidths.map((w, i) => (
            <div
              key={i}
              style={{
                flex: w,
                backgroundColor: dimensionColors[i],
                transition: 'flex 0.1s ease-in',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 心智趋势折线图（用 ECharts 替代自定义 SVG LineChart） ─────
function MindTrendChart({
  points,
  selectionStart,
  selectionEnd,
}: {
  points: any[];
  selectionStart: string;
  selectionEnd: string;
}) {
  const formatDate = (d: string) => `${d.slice(4, 6)}-${d.slice(6, 8)}`;

  const option = useMemo(() => {
    if (!points?.length) return null;
    const xData = points.map((p: any) => formatDate(p.date));
    const mindData = points.map((p: any) => +p.mind_total);
    const shareData = points.map((p: any) => parseFloat(p.industry_share));

    return {
      tooltip: { trigger: 'axis' },
      legend: { show: false },
      grid: { top: 40, right: 80, bottom: 30, left: 20, containLabel: true },
      xAxis: {
        type: 'category',
        data: xData,
        axisTick: { show: false },
        axisLabel: { color: '#939599', fontSize: 12 },
        axisLine: { lineStyle: { color: '#e8e8e8' } },
      },
      yAxis: [
        {
          type: 'value',
          name: '心智量',
          nameTextStyle: {
            color: '#939599',
            fontSize: 12,
            align: 'right',
            padding: [0, 8, 0, 0],
          },
          splitLine: { lineStyle: { color: '#e8e8e8' } },
          axisLabel: { color: '#939599', fontSize: 12 },
        },
        {
          type: 'value',
          name: '行业份额',
          nameTextStyle: {
            color: '#939599',
            fontSize: 12,
            align: 'left',
            padding: [0, 0, 0, 8],
          },
          position: 'right',
          splitLine: { show: false },
          axisLabel: { color: '#939599', fontSize: 12, formatter: '{value}%' },
        },
      ],
      series: [
        {
          name: '品牌心智量',
          type: 'line',
          yAxisIndex: 0,
          data: mindData,
          smooth: false,
          symbol: 'none',
          lineStyle: { color: '#6997F4', width: 2 },
          itemStyle: { color: '#6997F4' },
        },
        {
          name: '行业份额',
          type: 'line',
          yAxisIndex: 1,
          data: shareData,
          smooth: false,
          symbol: 'none',
          lineStyle: { color: '#FFAC40', width: 2 },
          itemStyle: { color: '#FFAC40' },
        },
      ],
    };
  }, [points]);

  if (!option)
    return (
      <div className="flex items-center justify-center h-[280px] text-sm text-[#898b8f]">
        加载中...
      </div>
    );
  return (
    <EChartsReact className="h-[280px] w-full" option={option} />
  );
}

// ─── TOP份额心智排行榜（对齐 dmp-web IndustryShareRankCard） ─────
function ShareRankCard({ items }: { items: any[] }) {
  return (
    <div className="w-[360px] shrink-0">
      <div
        className="bg-white rounded-xl border border-[#e2e5ea] h-full"
      >
        <div className="px-5 py-4 border-b border-[#e5e6eb]">
          <Tooltip
            popup={
              <div>
                <div>所选时间段内，本品牌的心智按行业心智份额降序排列</div>
                <div>
                  行业心智份额 = 该心智本品牌心智总量 / 该心智行业心智总量
                </div>
              </div>
            }
          >
            <span
              className="text-[16px] font-semibold text-[#0d0d0d] border-b border-dashed border-[#0d0d0d]"
            >
              本品牌TOP份额心智
            </span>
          </Tooltip>
        </div>
        <div className="h-[508px] overflow-y-auto px-5 py-3">
          {items.map((item: any, i: number) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 cursor-pointer hover:bg-[#49597a08] rounded-lg px-3 h-[50px]"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span
                  className="tabular-nums shrink-0 w-[24px] text-center text-[14px]"
                  style={{
                    color: i < 3 ? '#296BEF' : '#898b8f',
                    fontWeight: i < 3 ? 600 : 400,
                  }}
                >
                  {item.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-[#0d0d0d]">
                    {item.level3_mind}
                  </div>
                  <div className="text-xs text-[#898b8f] truncate">
                    {item.level1_mind}/{item.level2_mind}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <div className="tabular-nums text-sm text-[#0d0d0d]">
                  {formatNum(item.mind_total)}
                </div>
                <div className="tabular-nums text-xs text-[#898b8f]">
                  {item.industry_share}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 主页面 ─────
export default function BrandMindDashboardPage() {
  const cdnData = brandMindDashboardCdnData;
  const [activeNav, setActiveNav] = useState('洞察诊断');
  const [activeMenu, setActiveMenu] = useState('brand-mind-dashboard');
  const [dashboardDateRange, setDashboardDateRange] = useState<[Date, Date]>([
    new Date('2026-03-22'),
    new Date('2026-04-21'),
  ]);

  const overview = cdnData?.overview;
  const trend = cdnData?.trend;
  const shareRank = cdnData?.shareRank;
  const mindMap = cdnData?.mindMap;
  const growthMatrix = cdnData?.growthMatrix;
  const competitorMatrix = cdnData?.competitorMatrix;

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
      {/* ═══ 1. 顶部控制栏（对齐 dmp-web BrandMindDashboardCard） ═══ */}
      <div
        className="bg-white rounded-xl border border-[#e2e5ea]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e6eb]">
          <span className="text-lg font-semibold text-[#0d0d0d]">
            品牌心智度量
          </span>
          <div className="flex items-center gap-2">
            <Button light icon="download" className="text-[#898B8F]">
              下载数据
            </Button>
            <Button light icon="chart" className="text-[#898B8F]">
              统计说明
            </Button>
            <Button light icon="help-circle" className="text-[#898B8F]">
              产品手册
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 px-6 h-[68px]">
          <RyDateRangePicker
            value={dashboardDateRange}
            onChange={setDashboardDateRange}
            triggerWidth="280px"
          />
          <Select
            value="2"
            options={[
              { label: '行业均值', value: '2' },
              { label: '竞品均值', value: '1' },
              { label: '行业TOP5均值', value: '3' },
            ]}
            className="w-[200px]"
            prefix={
              <span className="text-[var(--odn-color-black-9)]">参照系</span>
            }
          />
        </div>
      </div>

      {/* ═══ 2+3. 心智概览 + TOP份额排行（对齐 dmp-web .cards flex row） ═══ */}
      <div className="flex gap-4">
        {/* 左侧：心智概览 */}
        <div className="flex-1 min-w-0 bg-white rounded-xl">
          <div className="px-6 py-4 border-b border-[#e5e6eb]">
            <span className="text-base font-semibold text-[#0d0d0d]">
              心智概览
            </span>
          </div>
          <div className="px-6 py-5 flex flex-col gap-6">
            {overview && <MindOverviewDetailBlock overview={overview} />}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block w-[10px] h-[2px] bg-[#6997F4] rounded-[1px]"
                />
                品牌心智量
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block w-[10px] h-[2px] bg-[#FFAC40] rounded-[1px]"
                />
                行业份额
              </div>
            </div>
            {trend && (
              <MindTrendChart
                points={trend.points}
                selectionStart="20260322"
                selectionEnd="20260421"
              />
            )}
          </div>
        </div>
        {/* 右侧：TOP份额排行 */}
        {shareRank && <ShareRankCard items={shareRank.list || []} />}
      </div>

      {/* ═══ 4. 心智图谱（对齐 dmp-web SelfMindTreeMapCard） ═══ */}
      <div className="bg-white rounded-xl">
        <div className="px-6 py-4">
          <Tooltip popup="所选时间段内，本品牌下心智按心智量降序排列截取TOP">
            <span
              className="text-[16px] font-semibold text-[#0d0d0d] border-b border-dashed border-[#0d0d0d]"
            >
              本品牌心智图谱
            </span>
          </Tooltip>
        </div>
        {mindMap && <MindTreemapD3 items={mindMap.list || []} />}
      </div>

      {/* ═══ 5+6. 增长矩阵 + 竞品矩阵（对齐 dmp-web .cards flex row） ═══ */}
      <div className="flex gap-4">
        {/* 增长矩阵 */}
        <div
          className="flex-1 min-w-0 bg-white rounded-xl border border-[#e2e5ea]"
        >
          <div className="px-6 py-4">
            <span className="text-base font-semibold text-[#0d0d0d]">
              本品 TOP10 心智增长矩阵
            </span>
          </div>
          <div className="px-6 pb-6">
            {growthMatrix?.list?.length > 0 ? (
              <MatrixScatterChart
                items={growthMatrix.list}
                getXY={(d) => [
                  parseFloat(d.industry_share_normalized),
                  parseFloat(d.mind_ratio_normalized),
                ]}
                getLabel={(d) => d.level3_mind}
                quadrants={GROWTH_QUADRANTS}
                xAxisLabels={['行业心智份额低', '行业心智份额高']}
                yAxisLabels={['环比增长率低', '环比增长率高']}
              />
            ) : (
              <div
                className="flex items-center justify-center text-sm text-[#898b8f] h-[556px]"
              >
                无数据
              </div>
            )}
          </div>
        </div>
        {/* 竞品矩阵 */}
        <div
          className="flex-1 min-w-0 bg-white rounded-xl border border-[#e2e5ea]"
        >
          <div className="px-6 py-4">
            <span className="text-base font-semibold text-[#0d0d0d]">
              竞品 TOP10 心智竞争矩阵
            </span>
          </div>
          <div className="px-6 pb-6">
            {competitorMatrix?.list?.length > 0 ? (
              <MatrixScatterChart
                items={competitorMatrix.list}
                getXY={(d) => [
                  parseFloat(d.brand_mind_normalized),
                  parseFloat(d.competitor_mind_avg_normalized),
                ]}
                getLabel={(d) => d.level3_mind}
                quadrants={COMPETITOR_QUADRANTS}
                xAxisLabels={['本品心智量低', '本品心智量高']}
                yAxisLabels={['竞品心智量低', '竞品心智量高']}
              />
            ) : (
              <div
                className="flex items-center justify-center text-sm text-[#898b8f] h-[556px]"
              >
                无数据
              </div>
            )}
          </div>
        </div>
      </div>
    </RuyiLayout>
  );
}
