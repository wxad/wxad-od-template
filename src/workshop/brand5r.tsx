'use client';

import {
  Button,
  Card,
  DatePicker,
  Icon,
  RuyiLayout,
  Select,
  Tooltip,
  type RuyiMenuItem,
} from 'one-design-next';
// @ts-ignore
import EChartsReact from 'echarts-for-react';
import React, { useEffect, useMemo, useState } from 'react';
import { CrowdAssetOverviewCard } from '../blocks/metric-card-group';
import triggerBench from './data/trigger-bench.json';
import triggerSelf from './data/trigger-self.json';
import r0Bench from './data/r0-bench.json';
import r0Self from './data/r0-self.json';
import r0Trend from './data/r0-trend.json';
import trend5r from './data/trend-5r.json';

// 本地 fixtures，避免预览域等非 localhost 来源被 CDN CORS 拦截
const brand5rChartFixtures = {
  triggerSelf,
  triggerBench,
  r0Self,
  r0Bench,
  trend5r,
  r0Trend,
};

// ─── 内联小数据 ─────────────
const data5RSelf = {
  date: 20260420,
  brand_name: '香奈儿/Chanel',
  total_r: '73322692',
  rdata: [
    { wuid_rate: 1, r_level: 0, wuid_cnt: '73322692' },
    { wuid_rate: 0.5248, r_level: 1, wuid_cnt: '38476813' },
    { wuid_rate: 0.4096, r_level: 2, wuid_cnt: '30036231' },
    { wuid_rate: 0.0634, r_level: 3, wuid_cnt: '4649366' },
    { wuid_rate: 0.0018, r_level: 4, wuid_cnt: '129197' },
    { wuid_rate: 0.0004, r_level: 5, wuid_cnt: '31085' },
  ],
};

const data5RBench = {
  date: 20260420,
  benchmark_type: 2,
  rdata: [
    { wuid_rate: 1, r_level: 0, wuid_cnt: '8355602' },
    { wuid_rate: 0.5735, r_level: 1, wuid_cnt: '4792331' },
    { wuid_rate: 0.3375, r_level: 2, wuid_cnt: '2819824' },
    { wuid_rate: 0.0823, r_level: 3, wuid_cnt: '687404' },
    { wuid_rate: 0.0051, r_level: 4, wuid_cnt: '42956' },
    { wuid_rate: 0.0016, r_level: 5, wuid_cnt: '13085' },
  ],
};

// 内联：/cgi-bin/board/brand/5r/insight?date=20260420&benchmark_type=2 返回
const insightData = [
  '人群资产总量对比行业均值有优势，超过777.53%',
  '本品牌R3资产对比行业均值有优势，超过576.37%',
];

// ─── 常量（对齐 dmp-web constants.ts） ─────────────
const BRAND_COLOR = '#6997F4';
const BENCH_COLOR = '#33D2CB';

const benchmarkTypeMap: Record<number, string> = {
  1: '竞品均值',
  2: '行业均值',
  3: '行业top5均值',
};

// ─── 导航配置 ──────────────────────────────────────────────
const NAV_ITEMS = ['首页', '洞察诊断', '人群策略', '策略应用', '全域度量', '生意'];
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

// ─── 工具函数 ─────────────
function formatNum(n: string | number) {
  return Number(n).toLocaleString();
}
function formatPct(n: number) {
  return `${(n * 100).toFixed(2)}%`;
}

// ─── 触点分析（对齐 dmp-web TouchpointAnalysis） ─────────

interface TriggerItem {
  trigger_id: number;
  trigger_name: string;
  level: number;
  proportion: number;
  tgi: string;
  children?: TriggerItem[];
}

function TriggerCard({
  item,
  isSelected,
  onClick,
  disabled,
}: {
  item: TriggerItem;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  // 对齐 dmp-web TriggerCard.module.less：白底，选中 #296bef14 浅蓝，hover #49597a0d
  return (
    <div
      className="flex flex-col justify-center rounded-lg cursor-pointer px-3 py-[7px]"
      style={{
        backgroundColor: isSelected ? '#296bef14' : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onClick={() => !disabled && onClick()}
      onMouseEnter={(e) => {
        if (!isSelected && !disabled)
          (e.currentTarget as HTMLElement).style.backgroundColor = '#49597a0d';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = isSelected
          ? '#296bef14'
          : '#fff';
      }}
    >
      <div className="text-sm font-semibold text-[#0d0d0d] leading-[22px] mb-1 truncate">
        {item.trigger_name}
      </div>
      <div className="flex items-baseline">
        <span className="text-base font-semibold text-[#313233] tabular-nums leading-[24px]">
          {formatPct(item.proportion)}
        </span>
        <span className="text-xs text-[#646566] ml-1 leading-[25px]">
          TGI {item.tgi}
        </span>
      </div>
    </div>
  );
}

function BulletChartRow({
  item,
  parentName,
  benchProportion,
  maxDataB,
}: {
  item: TriggerItem;
  parentName?: string;
  benchProportion?: number;
  maxDataB: number;
}) {
  const pct = item.proportion * 100;
  const benchPct = (benchProportion || 0) * 100;
  const barWidth = maxDataB > 0 ? (pct / maxDataB) * 100 : 0;
  const benchPos = maxDataB > 0 ? (benchPct / maxDataB) * 100 : 0;
  const displayName = parentName
    ? `${parentName} > ${item.trigger_name}`
    : item.trigger_name;

  return (
    <div className="flex items-center min-h-[40px] hover:bg-[#00000008] cursor-pointer">
      {/* 名称列（对齐 dmp-web nameCell w=200 pl=24） */}
      <div
        className="shrink-0 text-sm text-[#313233] truncate w-[200px] pl-6 pr-3"
        title={displayName}
      >
        {displayName}
      </div>
      {/* TGI 列（对齐 dmp-web tgiCell w=60 text-right） */}
      <div
        className="shrink-0 text-sm text-[#313233] text-right tabular-nums w-[60px] pr-3"
      >
        {item.tgi}
      </div>
      {/* 条形图列（对齐 dmp-web chartCell） */}
      <div
        className="flex-1 flex items-center min-h-[40px] pr-6 min-w-[300px]"
      >
        <div className="relative flex-1 h-[16px]">
          {/* 蓝色条形（对齐 dmp-web .bar #3b82f6） */}
          <div
            className="absolute left-0 top-0 h-full bg-[#3b82f6]"
            style={{
              width: `${barWidth}%`,
              borderRadius: '0 2px 2px 0',
              transition: 'width 0.3s ease',
            }}
          />
          {/* 黑色竖线（对齐 dmp-web .benchmark #313233） */}
          {benchPct > 0 && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-[2px] h-[18px] bg-[#313233] rounded-[1px]"
              style={{
                left: `${benchPos}%`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TouchpointAnalysisSection({
  triggerSelf,
  triggerBench,
}: {
  triggerSelf: any;
  triggerBench: any;
}) {
  const selfData: TriggerItem[] = triggerSelf?.trigger_data || [];
  const benchData: TriggerItem[] = triggerBench?.trigger_data || [];

  // 构建 benchmark 映射（按 trigger_id 索引，递归展开）
  const benchMap = useMemo(() => {
    const map: Record<number, TriggerItem> = {};
    const flatten = (items: TriggerItem[]) => {
      items.forEach((item) => {
        map[item.trigger_id] = item;
        if (item.children) flatten(item.children);
      });
    };
    flatten(benchData);
    return map;
  }, [benchData]);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const level1Items = selfData.filter((t) => t.level === 1);

  // 获取选中的一级触点名
  const selectedLevel1Names = level1Items
    .filter((t) => selectedIds.includes(t.trigger_id))
    .map((t) => t.trigger_name)
    .join(',');

  // 根据选中筛选二级触点，加上 parentName
  const chartItems = useMemo(() => {
    const selected =
      selectedIds.length > 0
        ? level1Items.filter((t) => selectedIds.includes(t.trigger_id))
        : level1Items;
    return selected.flatMap((parent) =>
      (parent.children || []).map((child) => ({
        ...child,
        _parentName: parent.trigger_name,
      })),
    );
  }, [level1Items, selectedIds]);

  // 动态刻度轴
  const maxDataB = useMemo(() => {
    const max = Math.max(...chartItems.map((t) => t.proportion * 100), 0.1);
    const tickBases = [0.05, 0.2, 0.5, 1, 2, 5, 10, 20, 25];
    for (const base of tickBases) {
      const niceMax = Math.ceil(max / base) * base;
      if (niceMax >= max) return Math.min(niceMax, 100);
    }
    return Math.ceil(max / 25) * 25;
  }, [chartItems]);

  const axisLabels = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const v = (maxDataB * i) / 4;
      if (v === 0) return '0%';
      return v < 1
        ? `${v.toFixed(2)}%`
        : Number.isInteger(v)
          ? `${v}%`
          : `${v.toFixed(1)}%`;
    });
  }, [maxDataB]);

  const handleCardClick = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // 判断卡片是否 disabled（无子触点）
  const hasLevel2 = (item: TriggerItem) => (item.children || []).length > 0;

  return (
    <div className="flex flex-col w-full bg-white rounded-xl">
      {/* 标题区域（对齐 dmp-web .header: py-5 px-6 border-bottom） */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e6eb] relative">
        <span className="text-base font-semibold text-[#0d0d0d] leading-[24px]">
          触点分析
        </span>
        <Button
          light
          icon="qualification"
          className="absolute right-5 text-[#626365]"
          onClick={() =>
            window.open(
              'https://doc.weixin.qq.com/doc/w3_AdYAwQb5AJoCNfWj0HZOmSwGE1RDT',
              '_blank',
            )
          }
        >
          触点体系说明
        </Button>
      </div>

      {/* 内容区域（对齐 dmp-web .content: flex min-h-[600px]） */}
      <div className="flex relative min-h-[600px]">
        {/* 左侧卡片区（对齐 dmp-web .leftPanel: w-224 border-right gap-8 p-12） */}
        <div
          className="flex flex-col gap-2 shrink-0 overflow-auto w-[224px] p-3 border-r border-[#495a7a1f]"
        >
          {level1Items.map((item) => (
            <TriggerCard
              key={item.trigger_id}
              item={item}
              isSelected={selectedIds.includes(item.trigger_id)}
              onClick={() => handleCardClick(item.trigger_id)}
              disabled={!hasLevel2(item)}
            />
          ))}
        </div>

        {/* 右侧图表区（对齐 dmp-web .rightPanel: absolute left=224） */}
        <div
          className="flex flex-col min-w-0 overflow-hidden absolute top-0 left-[224px] right-0 bottom-0"
        >
          {/* 顶部栏：维度切换器 + 图例（对齐 dmp-web .topBar h=56 border-bottom） */}
          <div className="flex items-center h-[56px] border-b border-[#495a7a29] pl-6 gap-3">
            {/* 维度切换器（对齐 dmp-web DimensionSwitcher） */}
            <span className="text-sm text-[#313233]">
              {selectedIds.length > 0 ? (
                <>
                  <span className="font-medium">{selectedLevel1Names}</span>
                  <span className="mx-1 text-[#898b8f]">的</span>
                </>
              ) : (
                <span className="font-medium">全部</span>
              )}
              <span>二级触点</span>
            </span>
            {/* 图例（对齐 dmp-web .legend） */}
            <div className="flex items-center gap-4 ml-3">
              <span className="flex items-center gap-2 text-xs text-[#646566]">
                <span
                  className="inline-block w-2 h-2 rounded-sm bg-[#3b82f6]"
                />
                人群覆盖度
              </span>
              <span className="flex items-center gap-2 text-xs text-[#646566]">
                <span
                  className="inline-block w-[2px] h-3 rounded-sm bg-[#313233]"
                />
                竞品均值
              </span>
            </div>
          </div>

          {/* 表头（对齐 dmp-web .header h=40 mt=12） */}
          <div className="flex items-center h-[40px] mt-3 pr-2">
            <div
              className="shrink-0 text-sm text-[#898b8f] px-3 w-[200px] pl-6"
            >
              触点
            </div>
            <div
              className="shrink-0 text-sm text-[#898b8f] text-right cursor-pointer select-none w-[60px] pr-3"
            >
              TGI <span className="text-[10px]">↕</span>
            </div>
            <div
              className="flex-1 text-sm text-[#898b8f] px-3 cursor-pointer select-none min-w-[300px]"
            >
              人群覆盖度 <span className="text-[10px]">↕</span>
            </div>
          </div>

          {/* 数据行（对齐 dmp-web .body 滚动区域） */}
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="flex flex-col gap-1 relative">
              {chartItems.map((item: any) => (
                <BulletChartRow
                  key={item.trigger_id}
                  item={item}
                  parentName={item._parentName}
                  benchProportion={benchMap[item.trigger_id]?.proportion}
                  maxDataB={maxDataB}
                />
              ))}
            </div>
          </div>

          {/* 刻度轴（对齐 dmp-web .axisContainer） */}
          <div
            className="flex items-start mb-3 pl-[260px] pr-6"
          >
            <span
              className="text-xs text-[#939599] absolute left-[248px]"
            >
              人群覆盖度
            </span>
            <div className="flex-1 flex justify-between relative h-5">
              {axisLabels.map((label, i) => (
                <span
                  key={i}
                  className="text-xs text-[#939599] whitespace-nowrap"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 5R 人群资产结构（对齐 dmp-web FRAssetStructure） ─────

/** 对齐 dmp-web widget/InsightBar/index.tsx + index.module.less */
function InsightBar({
  title,
  data,
  backgroundColor = '#439BFF',
}: {
  title: string;
  data: any[];
  backgroundColor?: string;
}) {
  const items = data.filter((d: any) => d.r_level !== 0);
  return (
    <div className="min-h-[140px]">
      {/* .title: 14px 600 h=30 line-height=30 mb=16 pl=16 */}
      <div
        className="h-[30px] leading-[30px] mb-4 pl-4 text-[14px] font-semibold text-[#0D0D0D]"
      >
        {title}
      </div>
      {/* .barContent: h=200 overflow-y=auto */}
      <div
        className="h-[200px] overflow-y-auto flex flex-col"
      >
        {items.map((item: any) => (
          /* .content: padding 9px 16px, line-height 22px, color #0D0D0D */
          <div
            key={item.r_level}
            className="flex items-center px-4 py-[9px] leading-[22px] text-[#0D0D0D] text-[14px]"
          >
            {/* .first */}
            <span className="text-left">R{item.r_level}</span>
            {/* .second: text-right, margin 0 32px, min-width 80 */}
            <span
              className="tabular-nums text-right mx-8 min-w-[80px]"
            >
              {formatNum(item.wuid_cnt)}
            </span>
            {/* .third: flex 1, flex items-center */}
            <div className="flex-1 flex items-center">
              {/* .bar: h=12 rounded=2 inline-block */}
              <span
                className="inline-block rounded-[2px] h-[12px]"
                style={{
                  width: Math.max(item.wuid_rate * 300, 0),
                  backgroundColor,
                }}
              />
              {/* .percent: ml=8 14px OD-number color=black-10 */}
              <span
                className="tabular-nums ml-2 text-[14px] text-[#626365] leading-[22px]"
              >
                {item.wuid_rate || item.wuid_rate === 0
                  ? `${(item.wuid_rate * 100).toFixed(2)}%`
                  : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetStructureSection() {
  // 对齐 dmp-web FRAssetStructure renderMessage
  const renderInsight = (msg: string) => {
    const boldKeywords = ['超过', '低于'];
    const keywordRegex = new RegExp(`(${boldKeywords.join('|')})`, 'g');
    const parts = msg.split(keywordRegex);
    return parts.map((part, i) => (
      <span
        key={i}
        style={{ fontWeight: boldKeywords.includes(part) ? 'bold' : 'normal' }}
      >
        {part}
      </span>
    ));
  };

  return (
    <div className="bg-white rounded-xl">
      {/* 标题（对齐 SectionLayout.Title） */}
      <div className="px-6 py-5 border-b border-[#e5e6eb]">
        <span className="text-base font-semibold text-[#0d0d0d]">
          5R 人群资产结构
        </span>
      </div>
      {/* 洞察 alert（对齐 dmp-web SectionLayout.Alert: #FAFAFB bg + 左侧蓝色渐变标签 + 右侧 • 项目符号） */}
      <div
        className="mx-6 mt-4 mb-4 flex items-center overflow-hidden rounded-lg bg-[#FAFAFB] text-[14px]"
      >
        <div
          className="shrink-0 text-center font-semibold self-stretch flex items-center justify-center w-[64px] text-[#296BEF] py-[22px]"
          style={{
            background: 'linear-gradient(180deg, #E3EEFF 0%, #F7F9FC 100%)',
            boxShadow: '-1px 0px 0px 0px #FFFFFF inset',
          }}
        >
          洞察
        </div>
        <div
          className="flex-1 flex flex-col pl-6 text-[#0D0D0D] py-4"
        >
          {insightData.map((msg, i) => (
            <span
              key={i}
              style={{ marginBottom: i < insightData.length - 1 ? 8 : 0 }}
            >
              <span className="mr-2">•</span>
              {renderInsight(msg)}
            </span>
          ))}
        </div>
      </div>
      {/* charWrapper（对齐 dmp-web .charWrapper: border #edeef2 rounded-8 flex, .splitLine border-right） */}
      <div
        className="mx-6 mb-6 flex border border-[#edeef2] rounded-lg"
      >
        <div
          className="flex-1 min-w-0 pt-4 px-4 pb-6 border-r border-[#edeef2]"
        >
          <InsightBar
            title="本品牌"
            data={data5RSelf.rdata}
            backgroundColor={BRAND_COLOR}
          />
        </div>
        <div className="flex-1 min-w-0 pt-4 px-4 pb-6">
          <InsightBar
            title="行业均值"
            data={data5RBench.rdata}
            backgroundColor={BENCH_COLOR}
          />
        </div>
      </div>
    </div>
  );
}

// ─── R0 渗透分析（对齐 dmp-web FRPenetrationAnalysis） ─────

function PenetrationAnalysisSection({
  r0Self,
  r0Bench,
}: {
  r0Self: any;
  r0Bench: any;
}) {
  const selfData = r0Self?.r0data || [];
  const benchData = r0Bench?.r0data || [];
  const benchMap = useMemo(() => {
    const map: Record<string, number> = {};
    benchData.forEach((d: any) => {
      map[d.targeting_id] = d.ratio;
    });
    return map;
  }, [benchData]);

  // 对齐 dmp-web FRPenetrationAnalysis renderMessage：把"对"和"的"之间的词加粗
  const renderAlertMessage = (msg: string) => {
    const result: React.ReactNode[] = [];
    let inBold = false;
    let boldStart = 0;
    for (let i = 0; i < msg.length; i++) {
      if (msg[i] === '对' && !inBold) {
        inBold = true;
        boldStart = i + 1;
        result.push(msg[i]);
      } else if (msg[i] === '的' && inBold) {
        inBold = false;
        result.push(
          <span key={`b-${boldStart}-${i}`} style={{ fontWeight: 'bold' }}>
            {msg.substring(boldStart, i)}
          </span>,
        );
        result.push(msg[i]);
      } else if (!inBold) {
        result.push(msg[i]);
      }
    }
    return result;
  };

  const industryId = '70';

  const alertMessage = useMemo(() => {
    const maxCurrent = selfData
      .filter((d: any) => d.targeting_industry === industryId)
      .sort((a: any, b: any) => b.ratio - a.ratio)[0];
    const maxOther = selfData
      .filter((d: any) => d.targeting_industry !== industryId)
      .sort((a: any, b: any) => b.ratio - a.ratio)[0];
    if (!maxCurrent && !maxOther) return '暂无数据';
    return `${maxCurrent ? `在本行业R0中, 品牌对 ${maxCurrent.targeting_name} 的渗透率最高。` : ''} ${maxOther ? `在跨行业R0中, 品牌对 ${maxOther.targeting_name} 的渗透率最高。` : ''}`;
  }, [selfData]);

  const chartOption = useMemo(() => {
    const xAxis = selfData.map((d: any) => d.targeting_name);
    const series1 = selfData.map((d: any) => d.ratio);
    const series2 = selfData.map((d: any) => benchMap[d.targeting_id] || 0);
    const maxSpan = Math.floor((16 * 100) / (selfData.length || 1));
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const name = params[0]?.axisValue;
          const rows = params
            .map(
              (p: any) =>
                `<div style="display:flex;align-items:center;gap:8px"><span style="display:inline-block;width:8px;height:8px;border-radius:1px;background:${p.color}"></span>${p.seriesName}: ${(p.value * 100).toFixed(4)}%</div>`,
            )
            .join('');
          return `<div><div style="font-weight:600;margin-bottom:4px">${name}</div>${rows}</div>`;
        },
      },
      legend: {
        data: ['本品牌', '行业均值'],
        left: -2,
        top: 8,
        itemWidth: 8,
        itemHeight: 8,
      },
      grid: { top: 52, left: 2, right: 0, containLabel: true },
      xAxis: [{ type: 'category', data: xAxis }],
      yAxis: [
        {
          type: 'value',
          axisLabel: { formatter: (v: number) => `${(v * 100).toFixed(2)}%` },
        },
      ],
      dataZoom: [{ show: true, start: 0, end: maxSpan, maxSpan }],
      series: [
        {
          name: '本品牌',
          type: 'bar',
          data: series1,
          barWidth: 25,
          itemStyle: { color: BRAND_COLOR, borderRadius: [2, 2, 0, 0] },
        },
        {
          name: '行业均值',
          type: 'bar',
          data: series2,
          barWidth: 25,
          itemStyle: { color: BENCH_COLOR, borderRadius: [2, 2, 0, 0] },
        },
      ],
    };
  }, [selfData, benchMap]);

  return (
    <Card elevation={0}>
      <div className="px-6 py-4">
        <Tooltip
          popup={
            '渗透率计算方式为：（本品牌人群总资产 ∩ 推荐人群 ）/ 推荐人群人数 * 100%'
          }
        >
          <span className="text-base font-semibold text-black-12">
            推荐人群渗透分析
          </span>
        </Tooltip>
      </div>
      <div
        className="mx-6 mb-4 flex items-center overflow-hidden rounded-lg bg-[#FAFAFB] text-[14px]"
      >
        <div
          className="shrink-0 text-center font-semibold self-stretch flex items-center justify-center w-[64px] text-[#296BEF] py-[22px]"
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
          <span>
            <span className="mr-2">•</span>
            {renderAlertMessage(alertMessage)}
          </span>
        </div>
      </div>
      <div className="px-6 pb-6">
        {selfData.length > 0 ? (
          <EChartsReact style={{ height: 450 }} option={chartOption} />
        ) : (
          <div className="flex items-center justify-center h-[450px] text-sm text-black-9">
            暂无数据
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── 近3个月趋势分析（对齐 dmp-web FRTrendAnalysis：左5R + 右R0 双图并排） ─────

const data5RSelectOptions = [
  { label: 'R1 人群总数', value: 1 },
  { label: 'R2 人群总数', value: 2 },
  { label: 'R3 人群总数', value: 3 },
  { label: 'R4 人群总数', value: 4 },
  { label: 'R5 人群总数', value: 5 },
];

// R0 人群选项（从 r0Self 数据里提取 targeting_name）
function useR0Options(r0Self: any) {
  return useMemo(() => {
    const items = r0Self?.r0data || [];
    return items.slice(0, 20).map((d: any) => ({
      label: d.targeting_name,
      value: d.targeting_id,
    }));
  }, [r0Self]);
}

function formatDate(d: number) {
  const s = String(d);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

function TrendAnalysisSection({
  trend5r,
  r0Trend,
  r0Self,
}: {
  trend5r: any;
  r0Trend: any;
  r0Self: any;
}) {
  const [legends, setLegends] = useState(['BRAND', 'BENCH']);
  const [r5Select, setR5Select] = useState(1);
  const r0Options = useR0Options(r0Self);
  const [r0Select, setR0Select] = useState('');

  // 默认选中第一个 R0 人群
  useEffect(() => {
    if (r0Options.length > 0 && !r0Select) {
      setR0Select(r0Options[0].value);
    }
  }, [r0Options]);

  const toggleLegend = (key: string) => {
    setLegends((prev) =>
      prev.includes(key) ? prev.filter((l) => l !== key) : [...prev, key],
    );
  };

  // 左侧：5R 趋势图（对齐 dmp-web Trend5Rchart）
  const chart5ROption = useMemo(() => {
    const selfList: any[] = trend5r?.self?.data || [];
    const benchList: any[] = trend5r?.bench?.data || [];
    if (!selfList.length) return null;

    const xAxis = selfList.map((d: any) => formatDate(d.date));
    const selfSeries = selfList.map((d: any) => {
      const rd = d.rdata?.find((r: any) => r.r_level === r5Select);
      return rd ? Number(rd.wuid_cnt) : 0;
    });
    const benchSeries = benchList.map((d: any) => {
      const rd = d.rdata?.find((r: any) => r.r_level === r5Select);
      return rd ? Number(rd.wuid_cnt) : 0;
    });

    return {
      tooltip: { trigger: 'axis' },
      grid: { top: 30, left: 10, right: 10, bottom: 30, containLabel: true },
      xAxis: [{ type: 'category', data: xAxis, boundaryGap: false }],
      yAxis: [
        {
          type: 'value',
          name: '数量',
          nameTextStyle: { fontSize: 12, color: '#898b8f' },
        },
      ],
      series: [
        {
          name: '本品牌',
          type: 'line',
          data: legends.includes('BRAND') ? selfSeries : [],
          smooth: false,
          symbol: 'none',
          itemStyle: { color: BRAND_COLOR },
        },
        {
          name: '行业均值',
          type: 'line',
          data: legends.includes('BENCH') ? benchSeries : [],
          smooth: false,
          symbol: 'none',
          itemStyle: { color: BENCH_COLOR },
        },
      ],
    };
  }, [trend5r, r5Select, legends]);

  // 右侧：R0 渗透率趋势图（对齐 dmp-web TrendR0chart）
  const chartR0Option = useMemo(() => {
    const selfList: any[] = r0Trend?.self?.data || [];
    const benchList: any[] = r0Trend?.bench?.data || [];
    if (!selfList.length) return null;

    const xAxis = selfList.map((d: any) => formatDate(d.date));
    const selfSeries = selfList.map((d: any) => d.ratio || 0);
    const benchSeries = benchList.map((d: any) => d.ratio || 0);

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const rows = params
            .map(
              (p: any) =>
                `<div style="display:flex;align-items:center;gap:8px"><span style="display:inline-block;width:8px;height:2px;border-radius:1px;background:${p.color}"></span>${p.seriesName}: ${(p.value * 100).toFixed(4)}%</div>`,
            )
            .join('');
          return `<div><b>${params[0]?.axisValue}</b>${rows}</div>`;
        },
      },
      grid: { top: 30, left: 10, right: 10, bottom: 30, containLabel: true },
      xAxis: [{ type: 'category', data: xAxis, boundaryGap: false }],
      yAxis: [
        {
          type: 'value',
          name: '数量',
          nameTextStyle: { fontSize: 12, color: '#898b8f' },
          axisLabel: { formatter: (v: number) => `${(v * 100).toFixed(2)}%` },
        },
      ],
      series: [
        {
          name: '本品牌',
          type: 'line',
          data: legends.includes('BRAND') ? selfSeries : [],
          smooth: false,
          symbol: 'none',
          itemStyle: { color: BRAND_COLOR },
        },
        {
          name: '行业均值',
          type: 'line',
          data: legends.includes('BENCH') ? benchSeries : [],
          smooth: false,
          symbol: 'none',
          itemStyle: { color: BENCH_COLOR },
        },
      ],
    };
  }, [r0Trend, legends]);

  return (
    <div className="bg-white rounded-xl">
      {/* 标题（对齐 dmp-web SectionLayout.Title） */}
      <div className="px-6 py-5 border-b border-[#e5e6eb]">
        <span className="text-base font-semibold text-[#0d0d0d]">
          近3个月趋势分析
        </span>
      </div>

      {/* 图例（对齐 dmp-web .trendLegend：可点击切换） */}
      <div className="flex flex-wrap mx-6 my-2.5">
        {[
          { key: 'BRAND', label: '本品牌', color: BRAND_COLOR },
          { key: 'BENCH', label: '竞品均值', color: BENCH_COLOR },
        ].map((item) => {
          const isActive = legends.includes(item.key);
          return (
            <div
              key={item.key}
              className="flex items-center mr-4 mb-1.5 cursor-pointer"
              onClick={() => toggleLegend(item.key)}
            >
              <span
                className="inline-block mr-1.5 w-2 h-2"
                style={{
                  backgroundColor: isActive ? item.color : '#aaa',
                }}
              />
              <span
                className="text-xs"
                style={{ color: isActive ? '#0d0d0d' : '#aaa' }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* 左右双图（对齐 dmp-web .charWrapper.noBorder + .trendHalfSection） */}
      <div className="flex mx-6 mb-6">
        {/* 左侧：5R 人群趋势 */}
        <div
          className="flex-1 min-w-0 mr-4 border border-[#edeef2] rounded-lg pl-6"
        >
          <div className="my-4">
            <Select
              prefix={<span className="text-[var(--odn-color-black-9)]">趋势</span>}
              value={r5Select}
              onChange={(v) => setR5Select(v as number)}
              options={data5RSelectOptions}
            />
          </div>
          {chart5ROption ? (
            <EChartsReact style={{ height: 350 }} option={chart5ROption} />
          ) : (
            <div className="flex items-center justify-center h-[350px] text-sm text-black-9">
              暂无数据
            </div>
          )}
        </div>
        {/* 右侧：R0 渗透率趋势 */}
        <div
          className="flex-1 min-w-0 border border-[#edeef2] rounded-lg pl-6"
        >
          <div className="my-4">
            <Select
              prefix={<span className="text-[var(--odn-color-black-9)]">趋势</span>}
              value={r0Select}
              onChange={(v) => setR0Select(v as string)}
              options={r0Options}
            />
          </div>
          {chartR0Option ? (
            <EChartsReact style={{ height: 350 }} option={chartR0Option} />
          ) : (
            <div className="flex items-center justify-center h-[350px] text-sm text-black-9">
              暂无数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 主页面 ──────────────────────────────────────────────

const BrandCrowdAsset = () => {
  const [activeNav, setActiveNav] = useState('洞察诊断');
  const [activeMenu, setActiveMenu] = useState('brand-crowd-asset');

  return (
    <RuyiLayout
      navItems={NAV_ITEMS}
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
      accountName="香奈儿/CHANEL – 美妆护肤"
      accountId="28392034"
      collapsible
      contentClassName="flex flex-col gap-4"
      headerRight={
        <>
          <div className="flex items-center gap-1.5 h-10 px-4 border border-black-6 rounded-full text-sm cursor-pointer">
            <Icon name="user-pack" size={16} />
            <span className="text-black-11">人群夹</span>
          </div>
          <div className="ml-3 flex items-center">
            <Button light icon="bell" />
            <Button light icon="help-circle" />
            <Button light icon="setting" />
          </div>
        </>
      }
    >
      {/* ═══ 1. pageHeader（保留不变） ═══ */}
      <div className="rounded-[12px] border border-black-4 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-semibold text-black-12">品牌人群资产</h2>
          <div className="flex items-center gap-2">
            <Button light icon="user-pack">
              添加人群
            </Button>
            <Button light icon="download-1">
              下载数据
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-black-4 px-6 py-3">
          <Select
            prefix={
              <span className="text-[var(--odn-color-black-9)]">对比模式</span>
            }
            value="competitor"
            options={[
              { label: '行业均值', value: 'industry' },
              { label: '行业top5', value: 'industry-top5' },
              { label: '竞品均值', value: 'competitor' },
            ]}
            className="w-[180px]"
          />
          <DatePicker value={new Date()} prefix="日期" className="w-[200px]" />
        </div>
      </div>

      {/* ═══ 2. 资产概览（保留不变） ═══ */}
      <CrowdAssetOverviewCard showRankings={false} />

      {/* ═══ 3. 触点分析（对齐 dmp-web TouchpointSection） ═══ */}
      <TouchpointAnalysisSection
        triggerSelf={brand5rChartFixtures.triggerSelf}
        triggerBench={brand5rChartFixtures.triggerBench}
      />

      {/* ═══ 4. 5R 人群资产结构（对齐 dmp-web FRAssetStructure） ═══ */}
      <AssetStructureSection />

      {/* ═══ 5. R0 渗透分析（对齐 dmp-web FRPenetrationAnalysis） ═══ */}
      <PenetrationAnalysisSection
        r0Self={brand5rChartFixtures.r0Self}
        r0Bench={brand5rChartFixtures.r0Bench}
      />

      {/* ═══ 6. 近3个月趋势分析（对齐 dmp-web FRTrendAnalysis：左5R + 右R0） ═══ */}
      <TrendAnalysisSection
        trend5r={brand5rChartFixtures.trend5r}
        r0Trend={brand5rChartFixtures.r0Trend}
        r0Self={brand5rChartFixtures.r0Self}
      />
    </RuyiLayout>
  );
};

export default BrandCrowdAsset;
