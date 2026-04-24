'use client';

import {
  Button,
  Cascader,
  DatePicker,
  DateRangePicker,
  Icon,
  RuyiLayout,
  Select,
  Tabs,
  Tooltip,
} from 'one-design-next';
import React, { useMemo, useState } from 'react';
// @ts-ignore
import * as echarts from 'echarts';
import EChartsReact from 'echarts-for-react';
import homeTrendDataJson from './data/home-trend-data.json';
import homeViewDataJson from './data/home-view-data.json';
import rankConfigJson from './data/market-rank-config.json';
import rankDataJson from './data/market-rank-data.json';

// 本地 fixtures，避免预览域等非 localhost 来源被 CDN CORS 拦截
const homeCdnFixtures = {
  rankConfig: rankConfigJson,
  rankData: rankDataJson,
  trendData: homeTrendDataJson,
  viewData: homeViewDataJson,
};

const confData = {
  end_date: 20260420,
  setting: {
    scale: ['QUOTA_SCALE_R0', 'QUOTA_SCALE_R1', 'QUOTA_SCALE_R2', 'QUOTA_SCALE_R3', 'QUOTA_SCALE_R4', 'QUOTA_SCALE_R5'],
    scale_rank: 'QUOTA_SCALE_R0',
    shape: ['QUOTA_SHAPE_R1R2_RATE', 'QUOTA_SHAPE_R3_RATE', 'QUOTA_SHAPE_R3_FLOW_RATE', 'QUOTA_SHAPE_R4_FLOW_RATE', 'QUOTA_SHAPE_R4R5_FLOW_RATE'],
    shape_rank: 'QUOTA_SHAPE_R1R2_RATE',
    switch: ['QUOTA_SWITCH_R3_CUR', 'QUOTA_SWITCH_R3_CPT', 'QUOTA_SWITCH_R3_SWI', 'QUOTA_SWITCH_R3_NAN', 'QUOTA_SWITCH_R3_CUR_FLOW_RATE', 'QUOTA_SWITCH_R3_CPT_FLOW_RATE', 'QUOTA_SWITCH_R3_SWI_FLOW_RATE', 'QUOTA_SWITCH_R3_NAN_FLOW_RATE'],
    switch_rank: 'QUOTA_SWITCH_R3_CUR',
    strength: ['QUOTA_STRENGTH_FANS', 'QUOTA_STRENGTH_FANS_RATE', 'QUOTA_STRENGTH_MINI_APPS'],
    strength_rank: 'QUOTA_STRENGTH_FANS',
    trend: ['QUOTA_SCALE_R0', 'QUOTA_SCALE_R5'],
  },
};

const noticeData = {
  featureNoticeList: [],
  noticeList: [
    {
      content: '如翼触点体系全新升级，打造人群资产精细化分析能力。支持了多触点资产分布洞察、流转分析及投后效果复盘',
      createTime: '2026-01-15 21:01:26',
      id: 1000011,
      link: 'https://doc.weixin.qq.com/doc/w3_AdYAwQb5AJoCNfWj0HZOmSwGE1RDT',
      title: '【产品升级】',
    },
    {
      content: '"域外扩散"帮助广告主看清在腾讯域内投放广告后，广告效果数据在域外平台的扩散影响。1、季度投放量级达到门槛 2、完成品牌配置的广告主即可提需开放',
      createTime: '2025-09-16 14:25:22',
      id: 1000009,
      link: 'https://doc.weixin.qq.com/doc/w3_ALcAZAa9ACcCNUbB8auWMQiWl3Ph1?scode=AJEAIQdfAAoF6ie5nqAQ8AzgYRAG8',
      title: '【产品上新】',
    },
  ],
};

const reportData = {
  view: '16351581',
  view_avg: 2.1566155,
  cost: '76261126',
  ecpm: '4663',
  conv: '9645',
  conv_cost: '7906',
};

// ─────────────────────────────────────────────
// 常量（对齐 homePageData.tsx）
// ─────────────────────────────────────────────

const HomeIndexs = [
  { value: 'scale', label: '资产广度', fullLabel: '资产广度' },
  { value: 'shape', label: '资产深度', fullLabel: '资产深度' },
  { value: 'switch', label: '资产偏好度', fullLabel: '资产偏好度' },
  { value: 'strength', label: '资产持久度', fullLabel: '资产持久度' },
] as const;

const CoreIndexList = [
  {
    label: '曝光次数',
    value: 'view',
    tip: '选定周期内广告被展示给用户的次数（不含非标广告）',
  },
  {
    label: '花费 (元)',
    value: 'cost',
    tip: '选定周期内广告花费的成本（不含非标广告）',
  },
  { label: '人均曝光次数', value: 'view_avg', tip: '周期内人均广告曝光的次数' },
  { label: '千次展示均价 (元)', value: 'ecpm', tip: '一千次曝光的平均价格' },
  { label: '目标转化成本 (元)', value: 'conv_cost', tip: '一次转化的平均花费' },
  { label: '目标转化量', value: 'conv', tip: '转化的次数' },
] as const;

const VS_OPTIONS = [
  { label: '竞品均值', value: 'cpt_avg' },
  { label: '行业均值', value: 'industry_avg' },
  { label: '行业TOP5均值', value: 'industry_top5_avg' },
] as const;

type DimKey = 'scale' | 'shape' | 'switch' | 'strength';
type VsKey = 'cpt_avg' | 'industry_avg' | 'industry_top5_avg';

// 趋势分析对比 key → trend 数据中 compare.name 的映射（对齐 dmp-web）
const TREND_VS_MAP: Record<string, string> = {
  cpt_avg: 'BOARD_QUOTA_CPT_RATE',
  industry_avg: 'BOARD_QUOTA_IND_RATE',
  industry_top5_avg: 'BOARD_QUOTA_IND_TOP5_RATE',
};
const TREND_VS_OPTIONS = [
  { label: '竞品均值', value: 'cpt_avg' },
  { label: '行业均值', value: 'industry_avg' },
  { label: '行业TOP5均值', value: 'industry_top5_avg' },
];

// 顶栏 label → workshop 页面 slug（本文件独立维护，不与其他 workshop 页面共享）
const NAV_ROUTES: Record<string, string> = {
  '首页': 'home',
  '洞察诊断': 'compete-analysis',
  '人群策略': 'r-zero-crowd',
  '策略应用': 'insight-ip',
  '全域度量': 'review',
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

// 找到一个 indicator 所属的维度 key
function findTrendDimKey(trendData: any, indicatorKey: string): string {
  for (const dimKey of ['scale', 'shape', 'switch', 'strength']) {
    if ((trendData?.[dimKey] || []).some((item: any) => item.name === indicatorKey)) return dimKey;
  }
  return 'scale';
}

// ─────────────────────────────────────────────
// 品牌资产趋势分析 — TrendChart（对齐 dmp-web TrendChart）
// ─────────────────────────────────────────────

function TrendChart({
  trendData,
  indicatorKey,
  vsKey,
  selectedIndicators,
  onIndicatorChange,
}: {
  trendData: any;
  indicatorKey: string;
  vsKey: string;
  selectedIndicators: string[];
  onIndicatorChange: (newKey: string) => void;
}) {
  const dimKey = findTrendDimKey(trendData, indicatorKey);
  const dimData: any[] = trendData[dimKey] || [];
  const indicatorData = dimData.find((item: any) => item.name === indicatorKey);
  if (!indicatorData) return <div className="flex-1 min-w-0 text-sm text-black-9 p-6">无数据</div>;

  const indicatorLabel = indicatorData.desc || indicatorKey;
  const isNumber = indicatorData.options?.[0]?.type === 'QUOTA_TYPE_NUMBER';
  const vsCompareKey = TREND_VS_MAP[vsKey] || 'BOARD_QUOTA_IND_TOP5_RATE';

  // 本品数据
  const seriesData1 = (indicatorData.options || []).map((item: any) => ({
    name: item.date,
    value: [
      item.date.split('-').slice(1).join('-'),
      isNumber ? item.value : item.value * 100,
    ],
  }));

  // 对比数据
  const compareData = (indicatorData.compare || []).find((c: any) => c.name === vsCompareKey);
  const seriesData2 = (compareData?.options || []).map((item: any) => ({
    name: item.date,
    value: [
      item.date.split('-').slice(1).join('-'),
      isNumber ? item.value : item.value * 100,
    ],
  }));

  const vsLabel = TREND_VS_OPTIONS.find((o) => o.value === vsKey)?.label || '';

  const chartOption = useMemo(
    () => ({
      animation: true,
      grid: { left: 0, right: 22, top: 10, bottom: 0, containLabel: true },
      xAxis: {
        type: 'category' as const,
        axisTick: { show: false },
        axisLabel: { color: '#939599' },
        axisLine: { lineStyle: { color: '#E6E8ED' } },
      },
      yAxis: [
        {
          type: 'value' as const,
          splitNumber: 5,
          splitLine: { lineStyle: { color: ['#EDEFF2'] } },
          minInterval: isNumber ? 1 : 0,
          axisLabel: {
            color: '#939393',
            formatter: isNumber ? '{value}' : '{value}%',
          },
        },
      ],
      tooltip: {
        show: true,
        trigger: 'axis' as const,
        formatter: (params: any) => {
          const date = params[0]?.data?.name || '';
          const rows = params
            .map(
              (row: any) =>
                `<div style="display:flex;justify-content:space-between;gap:16px"><span style="display:flex;align-items:center"><span style="width:8px;height:3px;border-radius:1px;background:${row.color};margin-right:6px;display:inline-block"></span>${row.seriesName}</span><span>${
                  isNumber
                    ? Number(row.value[1]).toLocaleString()
                    : `${Number(row.value[1]).toFixed(2)}%`
                }</span></div>`
            )
            .join('');
          return `<div style="font-size:12px"><div style="margin-bottom:8px;font-weight:500">${date}</div>${rows}</div>`;
        },
      },
      series: [
        {
          name: indicatorLabel,
          type: 'line',
          smooth: true,
          lineStyle: { color: '#6997F4' },
          itemStyle: { color: '#6997F4' },
          areaStyle: { opacity: 0.05 },
          symbol: 'circle',
          showSymbol: false,
          symbolSize: 8,
          data: seriesData1,
        },
        {
          name: vsLabel,
          type: 'line',
          smooth: true,
          lineStyle: { color: '#33D2CB' },
          itemStyle: { color: '#33D2CB' },
          areaStyle: { opacity: 0.05 },
          symbol: 'circle',
          showSymbol: false,
          symbolSize: 8,
          data: seriesData2,
        },
      ],
    }),
    [seriesData1, seriesData2, isNumber, indicatorLabel, vsLabel]
  );

  // 指标选择下拉（对齐 dmp-web SelectTree → Cascader 级联选择）
  const cascaderOptions = HomeIndexs.map((dim) => {
    const items = (trendData[dim.value] || []) as any[];
    return {
      label: dim.fullLabel,
      value: dim.value,
      children: items.map((item: any) => ({
        label: item.desc || item.name,
        value: item.name,
        disableCheckbox:
          selectedIndicators.includes(item.name) && item.name !== indicatorKey,
      })),
    };
  });

  return (
    <div className="flex-1 min-w-0">
      <div className="py-3">
        <Cascader
          allowClear={false}
          showInnerSearch
          options={cascaderOptions}
          value={[findTrendDimKey(trendData, indicatorKey), indicatorKey]}
          displayRender={(labels) => labels[labels.length - 1] || ''}
          onChange={(val) => {
            const path = val as string[];
            if (path?.length === 2) onIndicatorChange(path[1]);
          }}
        />
      </div>
      <span className="relative -top-1.5 text-xs text-[#939599]">
        {isNumber ? '人数' : '百分比'}
      </span>
      <EChartsReact
        echarts={echarts}
        style={{ height: 300, marginBottom: 24 }}
        option={chartOption}
      />
    </div>
  );
}

// 格式化核心指标数值（对齐 dmp-web 逻辑）
function formatCoreValue(key: string, raw: string | number): string {
  const v = Number(raw);
  if (isNaN(v)) return '-';
  switch (key) {
    case 'cost':
    case 'ecpm':
    case 'conv_cost':
      return v === 0
        ? '0'
        : (v / 100).toLocaleString('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
    case 'view_avg':
      return v.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    case 'view':
    case 'conv':
      return v.toLocaleString('zh-CN');
    default:
      return String(v);
  }
}

// ─────────────────────────────────────────────
// 行业排名概览
// ─────────────────────────────────────────────

function getDefaultRankKeys(rankConfig: any) {
  return [
    rankConfig?.x_default || 'total_5r_cnt_rank_value',
    rankConfig?.y_default || 'r3_flow_in_cnt_rank_value',
    rankConfig?.round_default || 'r4r5_flow_in_cnt_rank_value',
  ];
}

// 从 metrics 中找 key 对应的 name（含 industry_ 前缀 fallback）
function findMetricName(metrics: any[], key: string): string {
  if (!metrics) return key;
  for (const m of metrics) {
    if (m.key === key) return m.name;
    if (m.rank) {
      const found = m.rank.find((r: any) => r.key === key);
      if (found) return found.name;
    }
  }
  // industry_ 前缀 fallback：去掉前缀再查一次
  if (key.startsWith('industry_')) {
    const stripped = key.replace('industry_', '');
    for (const m of metrics) {
      if (m.rank) {
        const found = m.rank.find((r: any) => r.key === stripped);
        if (found) return `行业${found.name}`;
      }
    }
  }
  return key;
}

function RankListItem({
  listData,
  topN = 5,
}: {
  listData: any;
  topN?: number;
}) {
  if (!listData?.list?.length) {
    return <div className="py-8 text-center text-xs text-black-9">无数据</div>;
  }
  const curItem = listData.cur;
  const items = listData.list.slice(0, topN);

  return (
    <div>
      {/* 当前品牌（高亮行） */}
      {curItem && (
        <div className="flex items-center h-9 px-5 mb-2 bg-blue-1 text-sm">
          <span className="w-6 font-semibold text-brand-6 tabular-nums">
            {curItem.no === 9999 ? '' : curItem.no}
          </span>
          {curItem.brand_logo && (
            <img
              src={curItem.brand_logo}
              alt=""
              className="size-6 rounded-full border border-black-5 object-cover mr-2 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <span className="flex-1 truncate font-semibold text-brand-6">
            {curItem.brand_name}
          </span>
          {curItem.no === 9999 ? (
            <span className="text-black-9 text-xs">未上榜</span>
          ) : (
            curItem.dod !== 0 &&
            curItem.dod !== 9999 && (
              <span
                className={`flex items-center gap-0.5 text-xs tabular-nums ${curItem.dod > 0 ? 'text-[#07C160]' : 'text-[#E63D2E]'}`}
              >
                <Icon
                  name={curItem.dod > 0 ? 'up-filled' : 'down-filled'}
                  size={10}
                />
                {Math.abs(curItem.dod)}
              </span>
            )
          )}
        </div>
      )}
      {/* 列表 */}
      <div
        className="bg-black-1 py-2 h-[216px] overflow-auto"
      >
        {items.map((item: any, i: number) => (
          <div key={i} className="flex items-center h-10 px-5 text-sm">
            <span className="w-6 text-black-9 tabular-nums">{item.no}</span>
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

function IndustryRankSection({ rankConfig, rankData }: { rankConfig: any; rankData: any }) {
  const metrics = rankConfig?.metrics;
  const defaultRankKeys = getDefaultRankKeys(rankConfig);

  return (
    <div className="flex px-6 pb-2 gap-4">
      {defaultRankKeys.map((key: string) => (
        <div
          key={key}
          className="flex-1 border-t-[1.5px] border-solid border-[#6997F4]"
        >
          <div className="px-5 py-3 bg-blue-1 text-sm font-semibold text-black-12">
            {findMetricName(metrics, key)}
          </div>
          <RankListItem listData={rankData?.[key]} topN={5} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// 品牌资产概览 - RadarBox（对齐 dmp-web RadarBox/index.tsx）
// ─────────────────────────────────────────────

function insertLineBreaks(str: string, maxLength = 6) {
  const regex = new RegExp(`(.{${maxLength}})`, 'g');
  return str.replace(regex, '$1\n').trim();
}

function RadarBox({
  dimKey,
  title,
  overviewData,
  vsKey,
  selectedIndicators,
  defaultRankKey,
  onSelectedIndexChange,
}: {
  dimKey: DimKey;
  title: string;
  overviewData: any;
  vsKey: VsKey;
  selectedIndicators: string[];
  defaultRankKey: string;
  onSelectedIndexChange: (dimKey: string, newKeys: string[]) => void;
}) {
  const data = overviewData[dimKey];
  if (!data) return null;

  const curData: any[] = data.cur || [];
  const vsData: any[] = data[vsKey] || [];
  const allRanks: any[] = data.rank || [];

  // 对齐 dmp-web：indexValues 从 setting 拿，过滤掉在 cur 中找不到的，空的话取全部
  const curNames = new Set(curData.map((d: any) => d.name));
  const validSelected = selectedIndicators.filter((k) => curNames.has(k));
  const indexValues =
    validSelected.length > 0 ? validSelected : curData.map((d: any) => d.name);

  // indicator label 点击切换（对齐 dmp-web chartClick + popSelect）
  const [popState, setPopState] = useState<{
    show: boolean;
    activeIndicator: string;
    left: number;
    top: number;
  }>({ show: false, activeIndicator: '', left: 0, top: 0 });

  // 构建 popOptions：全部可选指标，已选中的 disabled
  const popOptions = curData.map((item: any) => ({
    value: item.name,
    label: item.desc,
    disabled: indexValues.includes(item.name),
  }));

  // 对齐 dmp-web getIndicatorConfig：从 curData 中按 indexValues 顺序取 desc
  const indicatorConfig = indexValues.map((indexKey) => {
    const matchItem = curData.find((item: any) => item.name === indexKey);
    let name = matchItem?.desc || indexKey;
    if (name.indexOf('\n') === -1 && name.length > 6) {
      name = insertLineBreaks(name);
    }
    return {
      key: matchItem?.name || indexKey,
      name,
    };
  });

  // 对齐 dmp-web：max = Math.max(curValue, vsValue)，min 处理负值
  const radarIndicator = indicatorConfig.map((cfg) => {
    const curVal = curData.find((d: any) => d.name === cfg.key)?.value || 0;
    const vsVal = vsData.find((d: any) => d.name === cfg.key)?.value || 0;
    const max = Math.max(curVal, vsVal) || 1;
    let min = Math.min(curVal, vsVal, 0);
    if (min < 0) min *= 1.2;
    return { name: cfg.name, max, min };
  });
  const curValues = indicatorConfig.map(
    (cfg) => curData.find((d: any) => d.name === cfg.key)?.value || 0,
  );
  const vsValues = indicatorConfig.map(
    (cfg) => vsData.find((d: any) => d.name === cfg.key)?.value || 0,
  );

  // 下拉箭头 base64（对齐 dmp-web rich.downMiddle）
  const arrowDown =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAMCAYAAABiDJ37AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACySURBVHgBtc7BCcIwFMbxr8+FXEOxuIIeRGqpKzROIFhCwR706FEQ8ewmOoJ3SUxKg2LbpK34P70k5McD/tGab/v4MWP0Ep7FBHkY+mNczqcrOmSMwch/kMTznt8KwZI0i9EyjanPTM8ecKNlGOwlxLQL+omRMqLF/OiZxw1PJx5olx+IWBTMVm2wUC1WbPmuKVqHlcAmqA2rBG2oC6sFq1AIPdgxK1hCi2yYE/xGXZjuBeuAcqZfg1RQAAAAAElFTkSuQmCC';
  const arrowUp =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAMCAYAAABiDJ37AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAChSURBVHgBxdLLDYMwDAZgO12k3YgNSqVe+sgMpTO4okLiABMwICLGAXHgQBJz4ZeiRJH9yQcDHBEqq4yoylJqTazgV9ZXYOikspvekWAMYx6aVQOe8vfz3oJ2wjXmvuDkSPxfaFJMwezrUfgX0b8AYz6hSTEVWxJDUYOloKjFNtCbXI3AM6jFQij6pZ32TIltoLlhB+e9mI+10jOvFDP3lxFkBX71ZoxC8gAAAABJRU5ErkJggg==';

  // 对齐 dmp-web echarts 配置（含 triggerEvent + axisName.formatter + rich）
  const chartOption = useMemo(
    () => ({
      animation: true,
      radar: {
        shape: 'circle' as const,
        splitNumber: 3,
        radius: '45%',
        axisLine: { lineStyle: { type: 'dashed' as const } },
        splitLine: { lineStyle: { color: '#e0e0e0' } },
        splitArea: { show: false },
        triggerEvent: true,
        axisName: {
          color: '#626365',
          show: true,
          lineHeight: 20,
          padding: 0,
          formatter: (value: string, indicator: any) => {
            const originName = indicator.name?.replace(/\n/g, '');
            if (originName === popState.activeIndicator) {
              return `{highlight|${value}} {arrowUp|}`;
            }
            return `${value} {arrowDown|}`;
          },
          rich: {
            highlight: { color: '#296BEF' },
            arrowUp: {
              verticalAlign: 'center' as const,
              width: 10,
              height: 6,
              backgroundColor: { image: arrowUp },
            },
            arrowDown: {
              verticalAlign: 'center' as const,
              width: 10,
              height: 6,
              backgroundColor: { image: arrowDown },
            },
          },
        },
        indicator: radarIndicator,
      },
      series: [
        {
          type: 'radar',
          symbol: 'none',
          itemStyle: { borderWidth: 1, color: '#fff', borderColor: '#457EF1' },
          lineStyle: { width: 2 },
          tooltip: { show: true },
          silent: true,
          data: [
            {
              value: curValues,
              name: '本品',
              lineStyle: { color: '#6997F4' },
              areaStyle: { color: 'rgba(105,151,244, 0.16)' },
            },
            {
              value: vsValues,
              name: '',
              lineStyle: { color: '#33D2CB' },
              areaStyle: { color: 'rgba(51,210,203, 0.16)' },
            },
          ],
        },
      ],
    }),
    [radarIndicator, curValues, vsValues, popState.activeIndicator],
  );

  // echarts click 事件（对齐 dmp-web chartClick）
  const handleChartClick = React.useCallback((param: any) => {
    const { name, event } = param;
    if (!name) return;
    const nameOrigin = name.split(' ')[0].replace(/[\n\t]/g, '');
    setPopState({
      show: true,
      activeIndicator: nameOrigin,
      left: event?.event?.layerX || 0,
      top: event?.event?.layerY || 0,
    });
  }, []);

  // 对齐 dmp-web：rankKey 默认用 setting 里的 xxx_rank，否则 rank[0].name
  const [rankKey, setRankKey] = useState(defaultRankKey || allRanks[0]?.name);
  const rankOptions =
    allRanks.find((r: any) => r.name === rankKey)?.options || [];

  // 对齐 dmp-web renderRanList：分离 cur 和 filterList
  const curRankItem = rankOptions.find((r: any) => r.is_cur);
  const otherRankItems = rankOptions.filter((r: any) => !r.is_cur);

  // 对齐 dmp-web selectData
  const selectData = allRanks.map((item: any) => ({
    label: item.desc,
    value: item.name,
  }));

  return (
    <div
      className="flex-1 min-w-0 rounded-lg border border-[#EDEEF2] relative pb-5"
    >
      {/* 标题 */}
      <div className="flex items-center px-6 py-5">
        <span className="text-sm font-semibold text-black-12 leading-6 whitespace-nowrap">
          {title}
        </span>
      </div>

      {/* 雷达图 — 对齐 dmp-web EChartsReact */}
      <div className="mx-auto relative">
        {indexValues.length > 0 && (
          <EChartsReact
            echarts={echarts}
            style={{ margin: '0 auto', height: 280 }}
            option={chartOption}
            onEvents={{ click: handleChartClick }}
          />
        )}
        {/* indicator 切换下拉（对齐 dmp-web popShow + Select） */}
        {popState.show && (
          <div
            className="absolute w-[180px] z-50"
            style={{
              left: popState.left - 40,
              top: popState.top + 10,
            }}
          >
            <Select
              visible={true}
              onVisibleChange={(open) => {
                if (!open)
                  setPopState({
                    show: false,
                    activeIndicator: '',
                    left: 0,
                    top: 0,
                  });
              }}
              value={popState.activeIndicator}
              options={popOptions}
              popupMatchSelectWidth={false}
              optionRender={(option) => {
                const item = curData.find((c: any) => c.name === option.value);
                const desc = item?.desc || String(option.label);
                return (
                  <Tooltip popup={desc} placement="right">
                    <div className="truncate">{option.label}</div>
                  </Tooltip>
                );
              }}
              onChange={(val) => {
                const idx = indicatorConfig.findIndex(
                  (c) => c.name.replace(/\n/g, '') === popState.activeIndicator,
                );
                if (idx >= 0) {
                  const newKeys = [...indexValues];
                  newKeys[idx] = val as string;
                  onSelectedIndexChange(dimKey, newKeys);
                }
                setPopState({
                  show: false,
                  activeIndicator: '',
                  left: 0,
                  top: 0,
                });
              }}
              className="opacity-0 h-0 w-0 absolute"
              dropdownStyle={{ width: 180 }}
            />
          </div>
        )}
      </div>

      {/* 排名下拉 + 列表 */}
      <div className="w-full">
        <div className="px-5 py-3">
          <Select
            light
            value={rankKey}
            onChange={(val) => setRankKey(val as string)}
            options={selectData.map((opt: any) => ({
              label: `${opt.label}排名`,
              value: opt.value,
            }))}
            popupMatchSelectWidth={false}
          />
        </div>

        {/* 当前品牌（蓝色高亮，分隔线） */}
        {curRankItem && (
          <div className="flex items-center text-xs h-8 mx-6 mb-2 pb-[14px] border-b border-[#EDEEF2]">
            <span className="w-4 mr-2.5 font-semibold text-[#6997F4] tabular-nums">
              {curRankItem.no}
            </span>
            <span className="text-black-12">{curRankItem.name}</span>
          </div>
        )}

        {/* 其他排名 */}
        {otherRankItems.map((item: any, i: number) => (
          <div
            key={i}
            className="flex items-center justify-between text-xs h-8 mx-6"
          >
            <div className="flex items-center">
              <span className="w-4 mr-2.5 font-semibold text-[#898B8F] tabular-nums">
                {item.no}
              </span>
              <span className="text-black-12">{item.name}</span>
            </div>
            {item.dod !== 0 && (
              <div className="flex items-center">
                <span
                  className={item.dod > 0 ? 'text-[#5AC724]' : 'text-[#E63D2E]'}
                >
                  {Math.abs(item.dod)}
                </span>
                <Icon
                  name={item.dod > 0 ? 'up' : 'down'}
                  size={10}
                  className="ml-1.5"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 页面头部
// ─────────────────────────────────────────────

function SectionHeader({
  title,
  right,
}: {
  title: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 px-6">
      <div className="flex-1 text-base font-semibold text-black-12 leading-6">
        {title}
      </div>
      {right && <div className="flex items-center gap-2 text-sm">{right}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// 主页面
// ─────────────────────────────────────────────

export default function Home() {
  const cdnData = homeCdnFixtures;
  const [activeNav, setActiveNav] = useState('首页');
  const [rankDateType, setRankDateType] = useState('week');
  const [vsKey, setVsKey] = useState<VsKey>('industry_top5_avg');

  // 核心指标日期范围（对齐 dmp-web：默认 end_date 同一天）
  const endDateStr = String((confData as any).end_date);
  const initDate = new Date(
    Number(endDateStr.slice(0, 4)),
    Number(endDateStr.slice(4, 6)) - 1,
    Number(endDateStr.slice(6, 8)),
  );
  const [coreIndexRange, setCoreIndexRange] = useState<[Date, Date] | null>([
    initDate,
    initDate,
  ]);

  // 品牌资产概览日期（单日选择器，对齐 dmp-web DatePicker type="single"）
  const [overviewDate, setOverviewDate] = useState<Date | null>(initDate);

  // 品牌资产趋势分析
  const trendStartDate = new Date(initDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [trendDateRange, setTrendDateRange] = useState<[Date, Date] | null>([
    trendStartDate,
    initDate,
  ]);
  const [trendVsKey, setTrendVsKey] = useState('industry_top5_avg');
  const [trendIndicators, setTrendIndicators] = useState<string[]>(
    () => (confData as any).setting?.trend || ['QUOTA_SCALE_R0', 'QUOTA_SCALE_R5']
  );

  const { rankConfig, rankData, trendData, viewData: overviewData } = cdnData || {};

  // 从 conf 中获取 setting 的 selected indicators（变为 state，支持 indicator 切换）
  const [selectedIndex, setSelectedIndex] = useState<Record<string, string[]>>(
    () => {
      const s = (confData as any).setting || {};
      return {
        scale: s.scale || [],
        shape: s.shape || [],
        switch: s.switch || [],
        strength: s.strength || [],
      };
    },
  );
  const setting = (confData as any).setting || {};

  const onSelectedIndexChange = React.useCallback(
    (dimKey: string, newKeys: string[]) => {
      setSelectedIndex((prev) => ({ ...prev, [dimKey]: newKeys }));
    },
    [],
  );

  const periodText =
    rankDateType === 'week'
      ? `${rankConfig?.latest_week_start?.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')}~${rankConfig?.latest_week_end?.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')}`
      : rankConfig?.latest_month?.replace(/(\d{4})(\d{2})/, '$1-$2');

  return (
    <RuyiLayout
      navItems={[
        '首页',
        '洞察诊断',
        '人群策略',
        '策略应用',
        '全域度量',
      ]}
      activeNav={activeNav}
      onNavChange={(nav) => {
        setActiveNav(nav);
        navigateNav(nav);
      }}
      menuItems={[]}
      accountName="香奈儿/Chanel – 美妆护肤"
      accountId="ID: 20458"
      contentClassName="flex flex-col gap-4"
    >
      {/* ═══ 重要通知 ═══ */}
      {noticeData.noticeList.length > 0 && (
        <div className="flex rounded-xl border border-[#CDE3FF] bg-[#F4F8FF] p-[7px]">
          <img
            src="https://dmp.gdtimg.com/static/dmp-web/prod/images/notice.a87d7f0a.svg"
            alt="notice"
            width={171}
            height={77}
            className="shrink-0"
          />
          <div className="flex-1 self-center ml-6 py-3 relative before:absolute before:top-3 before:left-[-12px] before:w-px before:h-[53px] before:bg-[#CDE3FF]">
            {noticeData.noticeList.map((item) => (
              <div
                key={item.id}
                className="flex h-[22px] mb-2 last:mb-0 leading-[22px] text-[0px] font-normal"
              >
                <span className="inline-block w-[84px] shrink-0 mr-2.5 text-black-9 whitespace-nowrap text-sm">
                  {item.createTime.split(' ')[0]}
                </span>
                <div
                  className="inline-block text-sm truncate align-top max-w-[calc(100vw-490px)]"
                >
                  <span>{item.title}</span>
                  <span>{item.content}</span>
                </div>
                <span
                  className="shrink-0 ml-2.5 text-sm text-brand-6 cursor-pointer leading-[22px]"
                  onClick={() => window.open(item.link, '_blank')}
                >
                  查看详情
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ 行业排名概览 ═══ */}
      <div className="bg-white rounded-xl">
        <div className="flex items-center justify-between py-4 px-6">
          <div className="flex items-center gap-4">
            <span className="text-base font-semibold text-black-12 leading-6">
              行业排名概览
            </span>
            <Tabs.ButtonGroup
              items={[
                { label: '周榜', value: 'week' },
                { label: '月榜', value: 'month' },
              ]}
              value={rankDateType}
              onChange={setRankDateType}
            />
            <span className="text-black-9 text-xs">统计周期:{periodText}</span>
          </div>
          <a
            href="/workshop/compete-analysis"
            className="text-brand-6 text-xs hover:underline"
          >
            查看完整榜单
          </a>
        </div>
        <IndustryRankSection rankConfig={rankConfig} rankData={rankData} />
      </div>

      {/* ═══ 核心指标概览 ═══ */}
      <div className="bg-white rounded-xl">
        <SectionHeader
          title="核心指标概览"
          right={
            <DateRangePicker
              value={coreIndexRange}
              onChange={setCoreIndexRange}
              lang="zhCN"
            />
          }
        />
        <div className="flex px-6 pb-6 pt-0 gap-4">
          {CoreIndexList.map((item) => {
            const raw = (reportData as any)[item.value];
            const formatted = formatCoreValue(item.value, raw);
            return (
              <div
                key={item.value}
                className="flex flex-1 min-w-[170px] max-w-[300px] flex-col items-start gap-1 rounded-lg bg-[#FAFAFB] px-6 py-4"
              >
                <Tooltip popup={item.tip}>
                  <span className="text-sm text-black-9 border-b border-dashed border-black-6 cursor-help">
                    {item.label}
                  </span>
                </Tooltip>
                <div className="text-2xl font-semibold text-black-12 tabular-nums leading-8">
                  {formatted}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ 品牌资产概览 ═══ */}
      <div className="bg-white rounded-xl min-h-[600px]">
        <SectionHeader
          title={
            <Tooltip
              popup={
                <>
                  <p className="font-medium text-black-12">
                    如何查看指标说明？
                  </p>
                  <p>1. 在雷达图中，将光标移到指标名称上即可查看该指标说明</p>
                  <p>
                    2.
                    在指标设置对话框中，将光标移到指标名称上即可查看该指标说明
                  </p>
                </>
              }
            >
              <span className="border-b border-dashed border-black-6 cursor-help">
                品牌资产概览
              </span>
            </Tooltip>
          }
          right={
            <div className="flex items-center gap-2">
              <DatePicker
                value={overviewDate}
                onChange={(date) => setOverviewDate(date)}
              />
              <span className="h-4 w-px bg-black-4 mx-1" />
              <Button light icon="setting">指标设置</Button>
              <Button light icon="user-pack">添加人群</Button>
              <Button light icon="download-1">下载数据</Button>
            </div>
          }
        />
        {/* 图例 — 对齐 dmp-web legend */}
        <div className="flex items-center px-4 text-sm">
          <span className="inline-flex items-center px-3 py-[7px]">
            <span
              className="mr-1 border-l-[8px] border-solid border-[#6997F4] w-1 h-1"
            />
            本品
          </span>
          <div className="inline-flex items-center">
            <span
              className="w-2 h-1 -mr-1.5 bg-[#33D2CB]"
            />
            <Select
              light
              value={vsKey}
              onChange={(val) => setVsKey(val as VsKey)}
              options={VS_OPTIONS.map((opt) => ({
                label: opt.label,
                value: opt.value,
              }))}
              popupMatchSelectWidth={false}
            />
          </div>
        </div>
        {/* 4 个雷达图 */}
        <div className="flex gap-4 px-6 py-2 pb-6">
          {HomeIndexs.map((dim) => (
            <RadarBox
              key={dim.value}
              dimKey={dim.value}
              title={dim.fullLabel}
              overviewData={overviewData}
              vsKey={vsKey}
              selectedIndicators={selectedIndex[dim.value] || []}
              defaultRankKey={setting[`${dim.value}_rank`] || ''}
              onSelectedIndexChange={onSelectedIndexChange}
            />
          ))}
        </div>
      </div>

      {/* ═══ 品牌资产趋势分析 ═══ */}
      <div className="bg-white rounded-xl">
        <SectionHeader
          title="品牌资产趋势分析"
          right={
            <div className="flex items-center gap-2">
              <DateRangePicker
                value={trendDateRange}
                onChange={(val) => setTrendDateRange(val)}
              />
              <Button light icon="setting">指标设置</Button>
              <Button light icon="download-1">下载数据</Button>
            </div>
          }
        />
        {/* 图例 */}
        <div className="flex items-center px-4 text-sm">
          <span className="inline-flex items-center px-3 py-[7px]">
            <span className="mr-1 border-l-[8px] border-solid border-[#6997F4] w-1 h-1" />
            本品
          </span>
          <div className="inline-flex items-center">
            <span className="w-2 h-1 -mr-1.5 bg-[#33D2CB]" />
            <Select
              light
              value={trendVsKey}
              onChange={(val) => setTrendVsKey(val as string)}
              options={TREND_VS_OPTIONS}
              popupMatchSelectWidth={false}
            />
          </div>
        </div>
        {/* 趋势图 */}
        <div className="flex gap-4 px-6 pb-6">
          {trendIndicators.map((indicatorKey, idx) => (
            <TrendChart
              key={indicatorKey + idx}
              trendData={trendData}
              indicatorKey={indicatorKey}
              vsKey={trendVsKey}
              selectedIndicators={trendIndicators}
              onIndicatorChange={(newKey) => {
                setTrendIndicators((prev) => {
                  const next = [...prev];
                  next[idx] = newKey;
                  return next;
                });
              }}
            />
          ))}
        </div>
      </div>
    </RuyiLayout>
  );
}
