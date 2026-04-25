'use client';

import {
  Button,
  Cascader,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Icon,
  Input,
  RuyiLayout,
  Select,
  Tabs,
  Tooltip,
} from 'one-design-next';
import React, { useEffect, useMemo, useState } from 'react';
// @ts-ignore
import * as echarts from 'echarts';
import { RyDateRangePicker } from '../blocks/ry-date-range-picker';
import EChartsReact from 'echarts-for-react';
import bubbleDataJson from './data/compete-bubble-data.json';
import rankConfigJson from './data/market-rank-config.json';
import rankDataJson from './data/market-rank-data.json';

// 本地 fixtures，避免预览域等非 localhost 来源被 CDN CORS 拦截
const competeAnalysisChartFixtures = {
  rc: rankConfigJson,
  rd: rankDataJson,
  bubbleList: (bubbleDataJson as any)?.list || [],
};

// ─────────────────────────────────────────────
// 常量（对齐 dmp-web marketInsight/tabPage/share）
// ─────────────────────────────────────────────

function rankToCascaderNodes(items: any[]): any[] {
  return (items || []).map((item: any) => {
    const subs = item.rank?.filter((s: any) => s?.key);
    if (subs?.length) {
      return {
        label: item.name,
        value: item.key,
        children: subs.map((sub: any) => ({
          label: sub.name,
          value: sub.key,
        })),
      };
    }
    return { label: item.name, value: item.key };
  });
}

function buildCascaderOptions(rc: any) {
  return (rc?.metrics || []).map((group: any) => ({
    label: group.name,
    value: group.key,
    children: rankToCascaderNodes(group.rank || []),
  }));
}

function findMetricName(rc: any, key: string): string {
  for (const group of rc?.metrics || []) {
    if (group.key === key) return group.name;
    for (const item of group.rank || []) {
      if (item.key === key) return item.name;
      for (const sub of item.rank || []) {
        if (sub.key === key) return sub.name;
      }
    }
  }
  if (key.startsWith('industry_')) {
    const stripped = key.replace('industry_', '');
    for (const group of rc.metrics || []) {
      for (const item of group.rank || []) {
        if (item.key === stripped) return `行业${item.name}`;
      }
    }
  }
  return key;
}

function findMetricTips(rc: any, key: string): string {
  for (const group of rc?.metrics || []) {
    for (const item of group.rank || []) {
      if (item.key === key) return item.tips || '';
      for (const sub of item.rank || []) {
        if (sub.key === key) return sub.tips || '';
      }
    }
  }
  return '';
}

function findCascaderPath(rc: any, key: string): string[] {
  for (const group of rc?.metrics || []) {
    for (const item of group.rank || []) {
      if (item.key === key) return [group.key, item.key];
      for (const sub of item.rank || []) {
        if (sub.key === key) return [group.key, item.key, sub.key];
      }
    }
  }
  return [key];
}

// ─────────────────────────────────────────────
// 品牌排行榜列（对齐 dmp-web RankListItem）
// ─────────────────────────────────────────────

function RankColumn({
  title,
  tips,
  listData,
  brandSearchKey,
  isLast = false,
}: {
  title: string;
  tips: string;
  listData: any;
  brandSearchKey: string;
  isLast?: boolean;
}) {
  const curItem = listData?.cur;
  // 对齐 dmp-web：rankData = [cur, ...list]，slice(1) 显示其余
  const otherItems = (listData?.list || []).filter((item: any) =>
    brandSearchKey
      ? item.brand_name?.toLowerCase().includes(brandSearchKey.toLowerCase())
      : true,
  );

  const renderBrandRow = (
    item: any,
    opts: { isCur?: boolean; style?: React.CSSProperties },
  ) => (
    <div
      className="flex items-center text-sm relative px-6 py-2 text-[14px]"
      style={opts.style}
    >
      <span
        className="inline-block shrink-0 tabular-nums w-6 mr-3 font-semibold"
        style={{
          color: opts.isCur ? '#286bef' : '#898B8F',
        }}
      >
        {item.no === 9999 ? '' : item.no}
      </span>
      <img
        src={item.brand_logo || ''}
        alt=""
        className="size-5 rounded-full object-cover shrink-0 border border-[#eee] mr-2"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      <span
        className="truncate flex-1"
        style={{
          fontWeight: opts.isCur ? 600 : 400,
          color: opts.isCur ? '#286bef' : '#0D0D0D',
        }}
      >
        {item.brand_name}
      </span>
      {item.no === 9999 ? (
        <span className="text-xs text-black-9 shrink-0 ml-auto">未上榜</span>
      ) : (
        item.dod !== 0 &&
        item.dod !== 9999 &&
        Boolean(item.dod) && (
          <span
            className="flex items-center gap-0.5 text-xs tabular-nums shrink-0 ml-auto"
            style={{ color: item.dod > 0 ? '#07C160' : '#E63D2E' }}
          >
            <Icon name={item.dod > 0 ? 'up-filled' : 'down-filled'} size={10} />
            {Math.abs(item.dod)}
          </span>
        )
      )}
    </div>
  );

  return (
    <div className={`flex-1 min-w-0 ${isLast ? '' : 'mr-6'}`}>
      {/* subBoxTitle（对齐 dmp-web .subBoxTitle：padding 10.5px 20px 0, borderTop, bg #f4f8ff） */}
      <div
        className="flex items-center gap-1 font-semibold text-black-12 pt-[10.5px] px-5 text-[14px] leading-[22px] bg-[#f4f8ff] border-t-[1.5px] border-[#296bef]"
      >
        <span>{title}</span>
        {tips && (
          <Tooltip popup={tips}>
            <Icon
              name="question-circle"
              size={14}
              className="text-black-6 cursor-help"
            />
          </Tooltip>
        )}
      </div>

      {/* 当前品牌行（对齐 dmp-web：单独一个 div，marginBottom: 8） */}
      {curItem && (
        <div className="mb-2">
          {renderBrandRow(curItem, {
            isCur: true,
            style: {
              backgroundColor: '#f4f8ff',
              paddingTop: 12,
              color: '#286bef',
              fontWeight: 600,
            },
          })}
        </div>
      )}

      {/* 其他品牌列表（对齐 dmp-web：marginTop: 8，每行 #fafafb） */}
      <div className="mt-2 max-h-[400px] overflow-auto">
        {otherItems.map((item: any, i: number) => (
          <React.Fragment key={i}>
            {renderBrandRow(item, { style: { backgroundColor: '#fafafb' } })}
          </React.Fragment>
        ))}
        {otherItems.length === 0 && (
          <div
            className="py-8 text-center text-sm text-black-6 bg-[#fafafb]"
          >
            无数据
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 品牌排名分布（气泡散点图，对齐 dmp-web bubble chart）
// ─────────────────────────────────────────────

const SYMBOL_SIZE_MIN = 60;
const SYMBOL_SIZE_MAX = 200;

function BubbleChart({
  data,
  xName,
  yName,
  roundName,
  enableCircleSize,
  chartCurBrandId,
}: {
  data: any[];
  xName: string;
  yName: string;
  roundName: string;
  enableCircleSize: boolean;
  chartCurBrandId: string;
}) {
  // 对齐 dmp-web：xAxis/yAxis 范围
  const xAxisMin = -20;
  const xAxisMax = 120;
  const xAxisMiddle = (xAxisMin + xAxisMax) / 2;
  const yAxisMin = -110;
  const yAxisMax = 210;
  const yAxisMiddle = (yAxisMin + yAxisMax) / 2;

  // 对齐 dmp-web：每个品牌一个 series
  const chartOption = useMemo(
    () => ({
      animation: false,
      grid: { left: 20, right: 20, top: 5, bottom: 20 },
      xAxis: {
        show: false,
        axisTick: { show: false },
        splitNumber: 1,
        min: xAxisMin,
        max: xAxisMax,
        axisLine: { lineStyle: { color: '#898B8F' } },
      },
      yAxis: [
        {
          type: 'value' as const,
          show: false,
          min: yAxisMin,
          max: yAxisMax,
          splitLine: { show: false },
          axisTick: { show: false },
          axisLine: { lineStyle: { color: '#898B8F' } },
        },
      ],
      tooltip: {
        show: true,
        borderColor: '#EDEEF2',
        borderWidth: 1,
        borderRadius: 6,
      },
      series: data.map((d, index) => {
        const {
          brand_name,
          brand_id,
          x_normalized_value,
          y_normalized_value,
          round_normalized_value,
          x_origin_value,
          y_origin_value,
          round_origin_value,
        } = d;
        const isCur = Boolean(x_origin_value);
        const color = isCur ? '#6997F4' : '#33D2CB';

        return {
          type: 'scatter',
          data: [[Number(x_normalized_value), Number(y_normalized_value)]],
          name: brand_name,
          symbolSize: enableCircleSize
            ? Math.round(
                SYMBOL_SIZE_MIN +
                  (Number(round_normalized_value) / 100) *
                    (SYMBOL_SIZE_MAX - SYMBOL_SIZE_MIN),
              )
            : 100,
          itemStyle: {
            borderWidth: 2,
            borderColor: color,
            color: isCur ? 'rgba(105,151,244,0.1)' : 'rgba(51,210,203,0.1)',
          },
          emphasis: { focus: 'self' as const },
          label: {
            show: true,
            position: 'bottom' as const,
            distance: 15,
            formatter:
              String(brand_id) === String(chartCurBrandId)
                ? '{a|{a}}\n{b|本品}'
                : '{a}',
            width: 80,
            overflow: 'truncate' as const,
            rich: {
              a: {
                fontSize: 14,
                color: '#01031C',
                align: 'center' as const,
                height: 22,
              },
              b: {
                fontSize: 12,
                color: '#626366',
                align: 'center' as const,
                height: 20,
              },
            },
            fontSize: 14,
            align: 'center' as const,
            verticalAlign: 'middle' as const,
            color: '#01031C',
          },
          tooltip: {
            formatter: () => {
              let html = `<div style="font-size:12px;padding:4px"><p style="margin-bottom:4px;font-weight:500">${brand_name}</p>`;
              if (x_origin_value) {
                html += `<p style="display:flex;justify-content:space-between;width:250px"><span>${xName.replace(/排名$/, '')}</span><span style="font-weight:500">${x_origin_value}</span></p>`;
                html += `<p style="display:flex;justify-content:space-between;width:250px"><span>${yName.replace(/排名$/, '')}</span><span style="font-weight:500">${y_origin_value}</span></p>`;
                html += `<p style="display:flex;justify-content:space-between;width:250px"><span>${roundName.replace(/排名$/, '')}</span><span style="font-weight:500">${round_origin_value}</span></p>`;
              } else {
                html += `<p>非本品牌不支持显示具体数据</p>`;
              }
              html += '</div>';
              return html;
            },
          },
          // 十字标线（只在第一个 series 上）
          markLine:
            index === 0
              ? {
                  symbol: 'none',
                  silent: true,
                  lineStyle: {
                    type: 'solid' as const,
                    color: '#EDEFF2',
                    width: 2,
                  },
                  data: [
                    {
                      xAxis: xAxisMiddle,
                      label: {
                        formatter: `指标1:${xName}`,
                        position: 'start' as const,
                      },
                      lineStyle: { type: 'dashed' as const, width: 1 },
                    },
                    {
                      xAxis: xAxisMin,
                      label: { formatter: '低', position: 'start' as const },
                    },
                    {
                      xAxis: xAxisMax,
                      label: { formatter: '高', position: 'start' as const },
                      lineStyle: { type: 'dashed' as const, width: 1 },
                    },
                    {
                      yAxis: yAxisMiddle,
                      label: { position: 'top' as const, distance: [0, 0] },
                      lineStyle: { type: 'dashed' as const, width: 1 },
                    },
                    {
                      yAxis: yAxisMin,
                      label: { formatter: '低', position: 'start' as const },
                    },
                    {
                      yAxis: yAxisMax,
                      label: {
                        formatter: '高',
                        position: 'start' as const,
                        distance: [5, -40],
                      },
                      lineStyle: { type: 'dashed' as const, width: 1 },
                    },
                  ],
                }
              : undefined,
          zlevel: 1,
        };
      }),
    }),
    [data, xName, yName, roundName, enableCircleSize, chartCurBrandId],
  );

  if (data.length === 0) {
    return <div className="py-16 text-center text-sm text-black-6">无数据</div>;
  }

  return (
    <div>
      <span className="text-xs text-[#939599] relative -top-1">{`指标2:${yName}`}</span>
      <EChartsReact
        echarts={echarts}
        style={{ height: 430 }}
        option={chartOption}
      />
      <div className="flex gap-4 pl-2.5 text-sm">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-3 rounded-full border-2 border-[#6997F4] bg-[rgba(105,151,244,0.1)]"
          />
          本品牌
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-3 rounded-full border-2 border-[#33D2CB] bg-[rgba(51,210,203,0.1)]"
          />
          对比品牌
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 主页面（对齐 dmp-web marketInsight/index.tsx + tabPage/share）
// ─────────────────────────────────────────────

export default function CompeteAnalysis() {
  const cdnData = competeAnalysisChartFixtures;
  const [activeNav, setActiveNav] = useState('洞察诊断');

  const rc = cdnData?.rc;
  const rd = cdnData?.rd;
  const bubbleList = cdnData?.bubbleList || [];

  // 3 个指标 key（对齐 dmp-web xKey/yKey/roundKey）
  const [xKey, setXKey] = useState('');
  const [yKey, setYKey] = useState('');
  const [roundKey, setRoundKey] = useState('');

  // 数据加载后设置默认 key
  useEffect(() => {
    if (rc) {
      setXKey(rc.x_default || '');
      setYKey(rc.y_default || '');
      setRoundKey(rc.round_default || '');
    }
  }, [rc]);

  // 日期
  const weekEnd = rc?.latest_week_end;
  const initEnd = weekEnd
    ? new Date(
        Number(weekEnd.slice(0, 4)),
        Number(weekEnd.slice(4, 6)) - 1,
        Number(weekEnd.slice(6, 8)),
      )
    : new Date();
  const initStart = new Date(initEnd.getTime() - 6 * 24 * 60 * 60 * 1000);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>([
    initStart,
    initEnd,
  ]);

  // 品牌搜索
  const [brandSearchKey, setBrandSearchKey] = useState('');

  // Tab（对齐 dmp-web Tabs + TabPanel）
  const [tab, setTab] = useState('share');

  // 气泡图控制（对齐 dmp-web enableCircleSize + cptsSelected）
  const [enableCircleSize, setEnableCircleSize] = useState(true);

  const cascaderOptions = useMemo(() => buildCascaderOptions(rc), [rc]);

  // 对比品牌（从 rank 数据的 3 列品牌并集中取）
  const ctpBrandOptions = useMemo(() => {
    const brandMap = new Map<string, { value: string; label: string }>();
    for (const key of [xKey, yKey, roundKey]) {
      const data = rd?.[key];
      if (!data?.list) continue;
      for (const item of data.list) {
        if (item.brand_id && !brandMap.has(String(item.brand_id))) {
          brandMap.set(String(item.brand_id), {
            value: String(item.brand_id),
            label: item.brand_name,
          });
        }
      }
    }
    return Array.from(brandMap.values());
  }, [xKey, yKey, roundKey, rd]);

  const [cptsSelected, setCptsSelected] = useState<string[]>(() =>
    ctpBrandOptions.slice(0, 5).map((o) => o.value),
  );

  const xName = findMetricName(rc, xKey);
  const yName = findMetricName(rc, yKey);
  const roundName = findMetricName(rc, roundKey);
  const xTips = findMetricTips(rc, xKey);
  const yTips = findMetricTips(rc, yKey);
  const roundTips = findMetricTips(rc, roundKey);

  // 对齐 dmp-web setValueLabel
  const renderCascaderLabel = (prefix: string) => (labels: string[]) => (
    <span>
      <span className="text-[#898B8F]">{prefix} </span>
      {labels[labels.length - 1] || ''}
    </span>
  );

  // 侧边栏菜单（本文件独立维护，不与其他 workshop 页面共享）
  const [activeMenu, setActiveMenu] = useState('compete-analysis');

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

  const navigateMenu = (key: string) => {
    const slug = MENU_ROUTES[key];
    if (!slug || typeof window === 'undefined') return;
    // 替换当前 URL 最后一段为目标 slug，保留 ?fullscreen=1 等查询参数
    const url = new URL(window.location.href);
    const segments = url.pathname.replace(/\/+$/, '').split('/');
    segments[segments.length - 1] = slug;
    url.pathname = segments.join('/');
    window.location.href = url.toString();
  };

  // 顶栏 label → workshop 页面 slug（本文件独立维护，不与其他 workshop 页面共享）
  const NAV_ROUTES: Record<string, string> = {
    首页: 'home',
    洞察诊断: 'compete-analysis',
    人群策略: 'r-zero-crowd',
    策略应用: 'insight-ip',
    全域度量: 'review',
  };

  const navigateNav = (label: string) => {
    const slug = NAV_ROUTES[label];
    if (!slug || typeof window === 'undefined') return;
    // 替换当前 URL 最后一段为目标 slug，保留 ?fullscreen=1 等查询参数
    const url = new URL(window.location.href);
    const segments = url.pathname.replace(/\/+$/, '').split('/');
    segments[segments.length - 1] = slug;
    url.pathname = segments.join('/');
    window.location.href = url.toString();
  };

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
      accountName="香奈儿/Chanel – 美妆护肤"
      accountId="ID: 20458"
      contentClassName=""
    >
      {/* 对齐 dmp-web div.wrap */}
      <div className="rounded-xl">
        {/* Tabs sticky 置顶（对齐 dmp-web .tabs .spaui-tabs-head sticky top:0） */}
        <div className="sticky top-0 z-[1000] mb-4 pb-4 bg-white rounded-xl shadow-2xs">
          <div className="border-b border-black-4">
            <Tabs.Default
              className="ml-6"
              items={[{ label: '品牌竞争格局', value: 'share' }]}
              itemClassName="text-black py-[18px]"
              activeItemClassName="text-black"
              value={tab}
              onChange={setTab}
            />
          </div>
          <Collapsible defaultOpen>
            <div className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Cascader
                    options={cascaderOptions}
                    value={findCascaderPath(rc, xKey)}
                    displayRender={renderCascaderLabel('指标1')}
                    onChange={(val) => {
                      const p = val as string[];
                      if (p?.length >= 2) setXKey(p[p.length - 1]!);
                    }}
                    className="w-[200px]"
                  />
                  <Cascader
                    options={cascaderOptions}
                    value={findCascaderPath(rc, yKey)}
                    displayRender={renderCascaderLabel('指标2')}
                    onChange={(val) => {
                      const p = val as string[];
                      if (p?.length >= 2) setYKey(p[p.length - 1]!);
                    }}
                    className="w-[200px]"
                  />
                  <Cascader
                    options={cascaderOptions}
                    value={findCascaderPath(rc, roundKey)}
                    displayRender={renderCascaderLabel('指标3')}
                    onChange={(val) => {
                      const p = val as string[];
                      if (p?.length >= 2) setRoundKey(p[p.length - 1]!);
                    }}
                    className="w-[200px]"
                  />
                  <div className="flex items-center shrink-0">
                    <RyDateRangePicker
                      value={dateRange}
                      onChange={setDateRange}
                      triggerWidth="290px"
                    />
                  </div>
                </div>
                <div className="flex items-center shrink-0">
                  <Button light icon="download-1">
                    下载数据
                  </Button>
                  <CollapsibleTrigger asChild>
                    {({ isOpen }) => (
                      <Button
                        light
                        icon="mobilePage"
                        rightIcon="down"
                        className={
                          isOpen
                            ? undefined
                            : '[&_[data-odn-button-right-icon]]:rotate-180'
                        }
                      >
                        智能总结
                      </Button>
                    )}
                  </CollapsibleTrigger>
                </div>
              </div>
            </div>
            <CollapsibleContent className="overflow-hidden">
              <div className="bg-[#F3F8FF] mx-6 px-4 py-3 rounded-2xl text-sm">
                <p className="my-2 leading-6 first:mt-0 last:mb-0">
                  <strong className="font-semibold">
                    一、亮点优势：高端人群渗透与品牌心智双领先
                  </strong>
                  <br />
                  香奈儿在触达曝光环节优势显著，行业优选人群渗透率16.56%（第1名）、奢美意向人群渗透率24.06%（第1名）、硬奢人群渗透率45.47%（第1名），5R人群数8360万（第1名），均领跑行业。种草互动中搜索数43.1万（第1名），反映用户对品牌主动关注度高，印证其高端心智占位成功。
                </p>
                <p className="my-2 leading-6 first:mt-0 last:mb-0">
                  <strong className="font-semibold">
                    二、建议改进：流量转化效率待提升
                  </strong>
                  <br />
                  效果转化短板明显，R4R5流入综合指数排名63（虽
                  <strong className="font-semibold">上升3名</strong>
                  仍处尾部），R4R5流入率1.89%（第34名，
                  <strong className="font-semibold">下降1名</strong>
                  ），广告CTR仅0.77%（第41名）。种草互动中R3流入率1.89%（第29名），互动数4.96万（第3名，
                  <strong className="font-semibold">下降1名</strong>
                  ），显示流量沉淀与购买转化脱节，尤其高搜索未有效转为购买。
                </p>
                <p className="my-2 leading-6 first:mt-0 last:mb-0">
                  <strong className="font-semibold">
                    三、策略解法：强化搜索到购买的闭环承接
                  </strong>
                  <br />
                  聚焦“搜索热度高但转化弱”矛盾。①优化搜索落地页，突出限量款/礼赠场景，匹配奢美人群决策路径；②针对R3人群（540万）推送专属试用装+会员权益，降低首购门槛；③联动互选内容（当前互选观看1458次，第8名）植入“一键购”组件，提升组件点击率（当前0.00%，第22名）。
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {tab === 'share' && (
          <div className="flex flex-col">
            {/* ═══ 品牌排行榜（对齐 dmp-web div.box：独立白色卡片 padding 24px） ═══ */}
            <div
              className="bg-white rounded-xl pt-4 px-6 pb-6"
            >
              {/* boxHeader（对齐 dmp-web .boxHeader：h 30px, flex, justify-between, mb 16） */}
              <div
                className="flex items-center justify-between h-[30px] mb-4"
              >
                <div
                  className="text-[16px] font-semibold leading-[30px]"
                >
                  品牌排行榜
                </div>
                <Input
                  leftElement={<Icon name="search" size={16} />}
                  placeholder="请输入品牌名称"
                  value={brandSearchKey}
                  onChange={(e) => setBrandSearchKey(e.target.value)}
                  className="w-[200px]"
                />
              </div>
              {/* 3 个 subBox 并排（对齐 dmp-web display:flex + .subBox flex:1 mr:24） */}
              <div className="flex">
                <RankColumn
                  title={xName}
                  tips={xTips}
                  listData={rd?.[xKey]}
                  brandSearchKey={brandSearchKey}
                />
                <RankColumn
                  title={yName}
                  tips={yTips}
                  listData={rd?.[yKey]}
                  brandSearchKey={brandSearchKey}
                />
                <RankColumn
                  title={roundName}
                  tips={roundTips}
                  listData={rd?.[roundKey]}
                  brandSearchKey={brandSearchKey}
                  isLast
                />
              </div>
            </div>

            {/* ═══ 品牌排名分布（对齐 dmp-web div.box + .box：独立白色卡片，mt 16） ═══ */}
            <div
              className="bg-white rounded-xl mt-4 pt-4 px-6 pb-6"
            >
              <div className="flex items-start justify-between">
                <div
                  className="text-[16px] font-semibold leading-[30px] pb-[60px]"
                >
                  品牌排名分布
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={enableCircleSize}
                    onChange={() => setEnableCircleSize(!enableCircleSize)}
                  >
                    显示圆形大小(指标3)
                  </Checkbox>
                  <Select
                    mode="multiple"
                    value={cptsSelected}
                    onChange={(val) => setCptsSelected(val as string[])}
                    options={ctpBrandOptions}
                    placeholder="对比品牌筛选"
                    showSearch
                    popupMatchSelectWidth={false}
                    className="min-w-[144px]"
                    maxTagCount={0}
                    light
                    tagRender={() => (
                      <div className="flex items-center gap-1">
                        <div>对比品牌筛选</div>
                        {cptsSelected.length > 0 && (
                          <div className="flex items-center justify-center size-4 font-semibold text-white text-xs bg-blue-600 rounded-full">
                            {cptsSelected.length}
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
              <BubbleChart
                data={bubbleList}
                xName={xName}
                yName={yName}
                roundName={roundName}
                enableCircleSize={enableCircleSize}
                chartCurBrandId="1000040"
              />
            </div>
          </div>
        )}

        {tab === 'mobile' && (
          <div className="p-6 text-sm text-black-6 text-center py-20">
            机型竞争格局（待实现）
          </div>
        )}
      </div>
    </RuyiLayout>
  );
}
