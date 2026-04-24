'use client';

import {
  Button,
  Icon,
  Input,
  Pagination,
  RuyiLayout,
  ScrollArea,
  type RuyiMenuItem,
} from 'one-design-next';
import React, { useEffect, useMemo, useState } from 'react';
import { ReviewMasterDetailLayout } from '../../../../skills/p2-block-catalog/references/review-master-detail-layout';
import { ConversionTrend as ConversionTrendBlock } from '../../../../skills/p2-block-catalog/references/conversion-trend';
import conversionReviewFixture from './data/conversion-review.json';

// ─── 菜单 ─────
const MENU_ITEMS: RuyiMenuItem[] = [
  { key: 'review-group', label: '结案复盘', icon: 'chart', children: [
    { key: 'review', label: '营销复盘' },
    { key: 'merchant-review', label: '招商复盘' },
    { key: 'conversion-review', label: '转化复盘' },
  ]},
];

// 菜单 key → workshop 页面 slug
const MENU_ROUTES: Record<string, string> = {
  review: 'review',
  'merchant-review': 'merchant-review',
  'conversion-review': 'conversion-review',
};

function navigateMenu(key: string) {
  const slug = MENU_ROUTES[key];
  if (!slug || typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const segments = url.pathname.replace(/\/+$/, '').split('/');
  segments[segments.length - 1] = slug;
  url.pathname = segments.join('/');
  window.location.href = url.toString();
}

// 顶栏 label → workshop 页面 slug
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
  const url = new URL(window.location.href);
  const segments = url.pathname.replace(/\/+$/, '').split('/');
  segments[segments.length - 1] = slug;
  url.pathname = segments.join('/');
  window.location.href = url.toString();
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  STATUS_FINISHED: { label: '已完成', color: '#07C160' },
  STATUS_PENDING: { label: '计算中', color: '#296BEF' },
  STATUS_FAILED: { label: '失败', color: '#E63D2E' },
};

const MOCK_LIST = [
  { id: 3001001, title: '2026Q1 转化效果复盘', status: 'STATUS_FINISHED', create_time: 1713456000 },
  { id: 3001002, title: '春促转化归因分析', status: 'STATUS_FINISHED', create_time: 1713369600 },
  { id: 3001003, title: '618大促转化复盘', status: 'STATUS_PENDING', create_time: 1713283200 },
  { id: 3001004, title: '双11转化效果分析', status: 'STATUS_FINISHED', create_time: 1713196800 },
  { id: 3001005, title: '年度转化成本分析', status: 'STATUS_FAILED', create_time: 1713110400 },
];

// ─── 格式化 ─────
function fmtNum(v: number): string {
  if (v >= 100000000) return `${(v / 100000000).toFixed(2)}亿`;
  if (v >= 10000) return `${(v / 10000).toFixed(1)}万`;
  return v.toLocaleString();
}
function fmtDate(d: number): string {
  const s = String(d);
  return `${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

// ─── ECharts 动态加载 ─────
function useECharts(containerRef: React.RefObject<HTMLDivElement | null>, option: any, deps: any[] = []) {
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

// ─── 左侧列表 ─────
function ReportList({ list, currentId, onSelect }: { list: any[]; currentId: number; onSelect: (id: number) => void }) {
  const [search, setSearch] = useState('');
  const filtered = list.filter((item) => !search || item.title.includes(search));
  return (
    <div className="flex h-full flex-col w-[324px] bg-white rounded-2xl">
      <div className="px-4 pt-4 pb-3">
        <Button intent="primary" icon="plus" className="w-full">新建转化复盘报告</Button>
      </div>
      <div className="px-4 pb-3">
        <Input leftElement={<Icon name="search" size={14} />} placeholder="搜索报告名称" value={search} onChange={(v) => setSearch(String(v ?? ''))} className="w-full" />
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 px-2">
          {filtered.map((item) => {
            const isActive = item.id === currentId;
            const st = STATUS_MAP[item.status] || STATUS_MAP.STATUS_FINISHED;
            return (
              <div key={item.id} className="cursor-pointer rounded-lg px-3 py-2.5 transition-colors" style={{ backgroundColor: isActive ? '#f5f8ff' : undefined }} onClick={() => onSelect(item.id)}>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: st.color }} />
                  <span className="flex-1 truncate text-sm font-medium text-[#0d0d0d]">{item.title}</span>
                </div>
                <div className="mt-1 pl-3.5 text-xs text-[rgba(51,55,61,0.36)]">
                  ID: {item.id}　·　{new Date(item.create_time * 1000).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="flex justify-center border-t border-[#edeef2] py-3">
        <Pagination showPrevNext totalSize={filtered.length} pageSize={20} value={1} onChange={() => {}} />
      </div>
    </div>
  );
}

// ─── SectionCard ─────
function SectionCard({ title, tips, children }: { title: string; tips?: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#edeef2] rounded-[12px] px-6 py-5 bg-white">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-base font-semibold text-[#0d0d0d]">
          {tips ? <span className="cursor-pointer" style={{ textDecoration: 'underline dashed', textUnderlineOffset: '0.2em' }}>{title}</span> : title}
        </span>
      </div>
      {children}
    </div>
  );
}

// ─── 1. 转化概览（对齐 ConversionOverview.tsx：摘要+3x2卡片+环形图） ─────
function ConversionOverview({ data }: { data: any }) {
  const conv = data?.view?.conv || [];
  const reach = data?.view?.reach || [];
  const convMap: Record<string, any> = {};
  conv.forEach((c: any) => { convMap[c.name] = c; });
  const reachMap: Record<string, any> = {};
  reach.forEach((r: any) => { reachMap[r.name] = r; });

  const expUv = reachMap.QUOTA_REVIEW_EXP?.value || 0;
  const expCnt = convMap.QUOTA_REVIEW_EXP_COUNT?.value || reachMap.QUOTA_REVIEW_EXP_COUNT?.value || 0;
  const totalConv = convMap.QUOTA_REVIEW_TOTAL_CONV?.value || 0;
  const adRatio = convMap.QUOTA_REVIEW_AD_CONV_RATIO?.value || 0;
  const singleConv = convMap.QUOTA_REVIEW_SINGLE_CONV?.value || 0;
  const multiConv = convMap.QUOTA_REVIEW_MULTI_CONV?.value || 0;
  const adConvCnt = convMap.QUOTA_REVIEW_AD_CONV_COUNT?.value || 0;
  const multiFreq = multiConv > 0 ? ((adConvCnt - singleConv) / multiConv).toFixed(1) : '0';

  const cards = [
    { title: '广告转化人数', value: fmtNum(convMap.QUOTA_REVIEW_CONV?.value || 0) },
    { title: '人群转化率', value: `${((convMap.QUOTA_REVIEW_CONV_RATE?.value || 0) * 100).toFixed(4)}%` },
    { title: '人均转化成本 (元)', value: `¥${((convMap.QUOTA_REVIEW_CONV_COST?.value || 0) / 100).toFixed(2)}` },
    { title: '广告转化次数', value: fmtNum(adConvCnt) },
    { title: '转化率', value: `${((convMap.QUOTA_REVIEW_CONV_PERCENT?.value || 0) * 100).toFixed(4)}%` },
    { title: '广告转化频次', value: convMap.QUOTA_REVIEW_AD_CONV_FREQ?.value?.toFixed(2) || '-' },
  ];

  const donutRef = React.useRef<HTMLDivElement>(null);
  const adConvUv = Math.round(totalConv * adRatio);
  const otherConvUv = Math.max(0, totalConv - adConvUv);
  useECharts(donutRef, {
    tooltip: { show: false },
    series: [
      { type: 'pie', radius: ['89%', '100%'], center: ['50%', '50%'], label: { show: false }, emphasis: { disabled: true }, itemStyle: { borderColor: '#fff', borderWidth: 2 },
        data: [{ value: singleConv, itemStyle: { color: '#bfd3fa' } }, { value: multiConv, itemStyle: { color: '#94b5f7' } }, { value: otherConvUv, itemStyle: { color: 'transparent' } }] },
      { type: 'pie', radius: ['64%', '85%'], center: ['50%', '50%'], label: { show: false }, emphasis: { disabled: true }, itemStyle: { borderColor: '#fff', borderWidth: 2 },
        data: [{ value: adConvUv, itemStyle: { color: '#296bef' } }, { value: otherConvUv, itemStyle: { color: '#E2E5EA' } }] },
    ],
  }, [totalConv]);

  return (
    <SectionCard title="转化概览" tips="本次广告营销活动的曝光与转化的整体概览">
      <div className="text-sm leading-[22px] text-[#626365] py-4 border-t border-b border-[#edeef2] mb-4 -mx-6 px-6">
        本次广告触达 <span className="font-medium text-[#0d0d0d]">{fmtNum(expUv)}</span> 人，
        曝光 <span className="font-medium text-[#0d0d0d]">{fmtNum(expCnt)}</span> 次，
        人均曝光频次 <span className="font-medium text-[#0d0d0d]">{reachMap.QUOTA_REVIEW_AVG_FREQ?.value?.toFixed(2) || '-'}</span> 次。
      </div>
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          {[0, 1].map((row) => (
            <div key={row} className="flex" style={{ paddingBottom: row === 0 ? 12 : 0, paddingTop: row === 1 ? 12 : 0, borderTop: row === 1 ? '1px solid #edeef2' : undefined }}>
              {cards.slice(row * 3, row * 3 + 3).map((card, i) => (
                <div key={card.title} className="flex-1" style={{ paddingLeft: i > 0 ? 16 : 0 }}>
                  <div className="mb-1 text-sm leading-[22px] text-[#626365] cursor-pointer" style={{ textDecoration: 'underline dashed', textUnderlineOffset: '0.2em' }}>{card.title}</div>
                  <div className="font-semibold text-[#0d0d0d] text-[20px] leading-[28px]">{card.value}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-3 pl-4 border-l border-[#edeef2]">
          <div className="flex flex-col gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-sm"><span className="h-2.5 w-2.5 rounded-sm bg-[#296bef]" />广告转化占比</div>
              <div className="font-semibold text-[20px] pl-5">{(adRatio * 100).toFixed(2)}%</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm"><span className="h-2.5 w-2.5 rounded-sm bg-[#bfd3fa]" />单次转化</div>
              <div className="text-sm pl-5"><span className="text-[16px] font-medium">{fmtNum(singleConv)}</span> 人</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm"><span className="h-2.5 w-2.5 rounded-sm bg-[#94b5f7]" />多次转化</div>
              <div className="text-sm pl-5"><span className="text-[16px] font-medium">{fmtNum(multiConv)}</span> 人，人均 <span className="text-[16px] font-medium">{multiFreq}</span> 次</div>
            </div>
          </div>
          <div className="relative flex h-[188px] w-[188px] shrink-0 items-center justify-center">
            <div ref={donutRef} className="w-[188px] h-[188px]" />
            <div className="absolute text-center">
              <div className="text-sm text-[rgba(0,0,0,0.95)] cursor-pointer" style={{ textDecoration: 'underline dashed', textUnderlineOffset: '0.2em' }}>总转化人数</div>
              <div className="text-[16px] text-[rgba(0,0,0,0.95)]">{fmtNum(totalConv)}</div>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ─── 2. 转化趋势（复用区块 conversion-trend） ─────
function ConversionTrend({ items }: { items: any[] }) {
  return <ConversionTrendBlock items={items} />;
}

// ─── 3. 触点分析（对齐 TriggerAnalysis.tsx：水平条形图） ─────
function TriggerAnalysis({ items, nameMap }: { items: any[]; nameMap: Record<string, string> }) {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const sorted = useMemo(() => [...items].sort((a, b) => Number(b.conv_uv) - Number(a.conv_uv)), [items]);
  const names = sorted.map((d) => nameMap[d.trigger_id] || `触点${d.trigger_id}`);
  const convUv = sorted.map((d) => Number(d.conv_uv));
  const convRate = sorted.map((d) => { const eu = Number(d.exp_uv); const cu = Number(d.conv_uv); return eu > 0 ? cu / eu : 0; });

  useECharts(chartRef, {
    tooltip: { trigger: 'axis' },
    legend: { show: false },
    grid: { top: 30, right: 80, bottom: 8, left: 8, containLabel: true },
    xAxis: [
      { type: 'value', position: 'top', splitLine: { lineStyle: { color: 'rgba(24,24,24,0.08)' } }, axisLabel: { color: '#939599' } },
      { type: 'value', position: 'top', splitLine: { show: false }, axisLabel: { color: '#939599', formatter: (v: number) => `${(v * 100).toFixed(2)}%` } },
    ],
    yAxis: { type: 'category', data: names, inverse: true, axisLabel: { color: '#0d0d0d', fontSize: 14 }, axisTick: { show: false }, axisLine: { show: false } },
    series: [
      { name: '转化人数', type: 'bar', data: convUv, itemStyle: { color: '#6997f4', borderRadius: [0, 2, 2, 0] }, barWidth: 16, emphasis: { disabled: true } },
      { name: '人群转化率', type: 'bar', xAxisIndex: 1, data: convRate, itemStyle: { color: '#ffc53d', borderRadius: [0, 2, 2, 0] }, barWidth: 16, emphasis: { disabled: true } },
    ],
  }, [items]);

  return (
    <div className="border border-[#edeef2] rounded-[12px] overflow-hidden bg-white">
      <div className="flex h-16 items-center justify-between border-b border-[#edeef2] px-6">
        <span className="text-base font-semibold text-[#0d0d0d]">触点分析</span>
        <div className="flex items-center gap-3 text-sm text-[#0d0d0d]">
          指标1：<span className="font-medium text-[#6997f4]">转化人数</span>
          <span className="h-4 border-r border-[rgba(0,0,0,0.1)]" />
          指标2：<span className="font-medium text-[#ffc53d]">人群转化率</span>
        </div>
      </div>
      <div ref={chartRef} className="px-4" style={{ height: Math.max(300, items.length * 48 + 60) }} />
    </div>
  );
}

// ─── 4. 曝光频次分析（对齐 FrequencyAnalysis.tsx：柱状图+折线图） ─────
function FrequencyAnalysis({ items }: { items: any[] }) {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const freqs = items.map((d) => d.freq >= 15 ? '15+' : String(d.freq));
  const expUv = items.map((d) => Number(d.exp_uv));
  const convRate = items.map((d) => { const eu = Number(d.exp_uv); const cu = Number(d.conv_uv); return eu > 0 ? cu / eu : 0; });

  useECharts(chartRef, {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { show: false },
    grid: { top: 24, right: 8, bottom: 30, left: 8, containLabel: true },
    xAxis: { type: 'category', data: freqs, name: '曝光频次', nameLocation: 'center', nameGap: 25, axisTick: { show: false }, axisLabel: { color: '#939599' } },
    yAxis: [
      { type: 'value', splitLine: { lineStyle: { color: 'rgba(24,24,24,0.1)' } }, axisLabel: { color: '#939599' } },
      { type: 'value', splitLine: { show: false }, axisLabel: { color: '#939599', formatter: (v: number) => `${(v * 100).toFixed(2)}%` } },
    ],
    series: [
      { name: '曝光人数', type: 'bar', data: expUv, itemStyle: { color: '#6997f4', borderRadius: [4, 4, 0, 0] }, barMaxWidth: 32, emphasis: { disabled: true } },
      { name: '人群转化率', type: 'line', yAxisIndex: 1, data: convRate, lineStyle: { color: '#E37318', width: 2 }, itemStyle: { color: '#E37318' }, symbol: 'circle', symbolSize: 6 },
    ],
  }, [items]);

  return (
    <SectionCard title="曝光频次分析" tips="不同曝光频次下的转化效果">
      <div className="flex items-center justify-center gap-4 text-xs text-[rgba(0,0,0,0.6)] mb-2">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-[#6997f4]" />曝光人数</span>
        <span className="flex items-center gap-1"><span className="inline-block h-[3px] w-2 rounded-sm bg-[#E37318]" />人群转化率</span>
      </div>
      <div ref={chartRef} className="h-[320px]" />
    </SectionCard>
  );
}

// ─── 5. 人群分析（对齐 AudienceAnalysis.tsx：水平条形图） ─────
function AudienceAnalysis({ items, nameMap }: { items: any[]; nameMap: Record<string, string> }) {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const sorted = useMemo(() => [...items].sort((a, b) => Number(b.conv_uv) - Number(a.conv_uv)), [items]);
  const names = sorted.map((d) => nameMap[d.audience_id] || `人群${d.audience_id}`);
  const convUv = sorted.map((d) => Number(d.conv_uv));
  const convRate = sorted.map((d) => { const eu = Number(d.exp_uv); const cu = Number(d.conv_uv); return eu > 0 ? cu / eu : 0; });

  useECharts(chartRef, {
    tooltip: { trigger: 'axis' },
    legend: { show: false },
    grid: { top: 30, right: 80, bottom: 8, left: 8, containLabel: true },
    xAxis: [
      { type: 'value', position: 'top', splitLine: { lineStyle: { color: 'rgba(24,24,24,0.08)' } }, axisLabel: { color: '#939599' } },
      { type: 'value', position: 'top', splitLine: { show: false }, axisLabel: { color: '#939599', formatter: (v: number) => `${(v * 100).toFixed(2)}%` } },
    ],
    yAxis: { type: 'category', data: names, inverse: true, axisLabel: { color: '#0d0d0d', fontSize: 14 }, axisTick: { show: false }, axisLine: { show: false } },
    series: [
      { name: '转化人数', type: 'bar', data: convUv, itemStyle: { color: '#6997f4', borderRadius: [0, 2, 2, 0] }, barWidth: 16, emphasis: { disabled: true } },
      { name: '人群转化率', type: 'bar', xAxisIndex: 1, data: convRate, itemStyle: { color: '#ffc53d', borderRadius: [0, 2, 2, 0] }, barWidth: 16, emphasis: { disabled: true } },
    ],
  }, [items]);

  return (
    <div className="border border-[#edeef2] rounded-[12px] overflow-hidden bg-white">
      <div className="flex h-16 items-center justify-between border-b border-[#edeef2] px-6">
        <span className="text-base font-semibold text-[#0d0d0d]">人群分析</span>
        <div className="flex items-center gap-3 text-sm text-[#0d0d0d]">
          指标1：<span className="font-medium text-[#6997f4]">转化人数</span>
          <span className="h-4 border-r border-[rgba(0,0,0,0.1)]" />
          指标2：<span className="font-medium text-[#ffc53d]">人群转化率</span>
        </div>
      </div>
      <div ref={chartRef} className="px-4" style={{ height: Math.max(300, items.length * 48 + 60) }} />
    </div>
  );
}

// ─── 主页面 ─────
export default function ConversionReviewPage() {
  const [currentId, setCurrentId] = useState(3001001);
  const data = conversionReviewFixture as any;

  const cd = data?.conversion_detail;
  const dailyItems = cd?.daily_trend?.items || [];
  const triggerItems = cd?.trigger?.items || [];
  const freqItems = cd?.frequency?.items || [];
  const audItems = useMemo(() => {
    const a = cd?.audience;
    if (!a) return [];
    return [...(a.r0 || []), ...(a.character_setting || []), ...(a.custom || [])];
  }, [cd]);
  const setting = data?.setting || {};

  return (
    <RuyiLayout navItems={['首页', '洞察诊断', '人群策略', '策略应用', '全域度量']} activeNav="全域度量" onNavChange={navigateNav} menuItems={MENU_ITEMS} activeMenu="conversion-review" onMenuChange={navigateMenu}>
      <ReviewMasterDetailLayout
        left={
          <ReportList
            list={MOCK_LIST}
            currentId={currentId}
            onSelect={setCurrentId}
          />
        }
        contentClassName="flex flex-1 flex-col gap-4 overflow-auto bg-[#f2f5fa] rounded-2xl"
        title={setting.title || '转化复盘报告'}
        titleActions={
          <>
            <Button light size="small" icon="copy">
              复制创建
            </Button>
            <Button light size="small" icon="trash" />
          </>
        }
        statusTag={{ label: '已完成', color: '#07C160', bgColor: '#e8f8ef' }}
        infoItems={[
          {
            label: '投放日期',
            value: `${setting.begin_date} ~ ${setting.end_date}`,
          },
          { label: '转化周期', value: `${setting.conversion_period}天` },
          {
            raw: true,
            value: '完整配置信息 →',
          },
        ]}
      >
        {/* 5 张卡片垂直铺排 */}
        {data && <ConversionOverview data={data} />}
        {dailyItems.length > 0 && <ConversionTrend items={dailyItems} />}
        {triggerItems.length > 0 && <TriggerAnalysis items={triggerItems} nameMap={data?.trigger_names || {}} />}
        {freqItems.length > 0 && <FrequencyAnalysis items={freqItems} />}
        {audItems.length > 0 && <AudienceAnalysis items={audItems} nameMap={data?.audience_names || {}} />}
      </ReviewMasterDetailLayout>
    </RuyiLayout>
  );
}
