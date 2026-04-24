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
import React, { useState } from 'react';
import { ReviewMasterDetailLayout } from '../blocks/review-master-detail-layout';

// ─── 菜单 ─────
const MENU_ITEMS: RuyiMenuItem[] = [
  {
    key: 'review-group',
    label: '结案复盘',
    icon: 'chart',
    children: [
      { key: 'review', label: '营销复盘' },
      { key: 'merchant-review', label: '招商复盘' },
      { key: 'conversion-review', label: '转化复盘' },
    ],
  },
];

// 菜单 key → workshop 页面 slug（本文件独立维护，不与其他 workshop 页面共享）
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
  const url = new URL(window.location.href);
  const segments = url.pathname.replace(/\/+$/, '').split('/');
  segments[segments.length - 1] = slug;
  url.pathname = segments.join('/');
  window.location.href = url.toString();
}

// ─── 状态映射 ─────
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  STATUS_FINISHED: { label: '已完成', color: '#07C160' },
  STATUS_PENDING: { label: '计算中', color: '#296BEF' },
  STATUS_DRAFT: { label: '排队中', color: '#898b8f' },
  STATUS_FAILED: { label: '失败', color: '#E63D2E' },
};

// ─── Mock 列表（招商复盘任务） ─────
const MOCK_LIST = [
  { id: 2001001, title: '2026Q1 招商项目复盘', status: 'STATUS_FINISHED', create_time: 1713456000 },
  { id: 2001002, title: '春节档综艺招商复盘', status: 'STATUS_FINISHED', create_time: 1713369600 },
  { id: 2001003, title: '暑期IP招商效果分析', status: 'STATUS_FINISHED', create_time: 1713283200 },
  { id: 2001004, title: '双11招商项目复盘', status: 'STATUS_PENDING', create_time: 1713196800 },
  { id: 2001005, title: '年度招商复盘汇总', status: 'STATUS_FINISHED', create_time: 1713110400 },
  { id: 2001006, title: '热播剧集招商复盘', status: 'STATUS_FAILED', create_time: 1713024000 },
];

// ─── Mock 概览数据（招商复盘：reach + mind + conv） ─────
const MOCK_VIEW = {
  reach: [
    { name: 'exp', title: '曝光人数', value: 186520000, type: 'QUOTA_TYPE_NUMBER', tips: '招商项目广告曝光人群人数', avg: { history: 152300000 } },
    { name: 'exp_freq', title: '人均曝光频次', value: 4.2, type: 'QUOTA_TYPE_NUMBER', tips: '曝光人群的人均广告曝光次数', avg: { history: 3.8 } },
    { name: 'cost', title: '千次曝光成本', value: 1580, type: 'QUOTA_TYPE_MONEY', tips: '每千次广告曝光的花费', avg: { history: 1820 } },
  ],
  mind: [
    { name: 'before', title: '投前 5R 人群总资产', value: 32150000, type: 'QUOTA_TYPE_NUMBER', tips: '投前品牌5R人群总规模', avg: { history: 28500000 } },
    { name: 'after', title: '投后 5R 人群总资产', value: 98720000, type: 'QUOTA_TYPE_NUMBER', tips: '投后品牌5R人群总规模', avg: { history: 85600000 } },
    { name: 'growth', title: '5R 资产增长率', value: 20712, type: 'QUOTA_TYPE_PERCENT', tips: '5R人群增长率', avg: { history: 18500 } },
    { name: 'r1', title: 'R1 人数', value: 45280000, type: 'QUOTA_TYPE_NUMBER', tips: '投后R1人群规模', avg: null },
    { name: 'r2', title: 'R2 人数', value: 28360000, type: 'QUOTA_TYPE_NUMBER', tips: '投后R2人群规模', avg: null },
    { name: 'r3', title: 'R3 人数', value: 15820000, type: 'QUOTA_TYPE_NUMBER', tips: '投后R3人群规模', avg: null },
    { name: 'r4', title: 'R4 人数', value: 6520000, type: 'QUOTA_TYPE_NUMBER', tips: '投后R4人群规模', avg: null },
    { name: 'r5', title: 'R5 人数', value: 2740000, type: 'QUOTA_TYPE_NUMBER', tips: '投后R5人群规模', avg: null },
    { name: 'r3_rate', title: 'R3 流入率', value: 1250, type: 'QUOTA_TYPE_PERCENT', tips: 'R3人群流入率', avg: { history: 1080 } },
  ],
  conv: [
    { name: 'conv', title: '转化人数', value: 89200, type: 'QUOTA_TYPE_NUMBER', tips: '转化人数', avg: { history: 72500 } },
    { name: 'conv_rate', title: '转化率', value: 48, type: 'QUOTA_TYPE_PERCENT', tips: '转化率', avg: { history: 38 } },
    { name: 'conv_cost', title: '转化成本', value: 3250, type: 'QUOTA_TYPE_MONEY', tips: '单次转化成本', avg: { history: 3800 } },
    { name: 'ip_exp', title: 'IP曝光人数', value: 52300000, type: 'QUOTA_TYPE_NUMBER', tips: '视频IP曝光覆盖人数', avg: null },
    { name: 'ip_r3', title: 'IP受众R3流入', value: 4210000, type: 'QUOTA_TYPE_NUMBER', tips: 'IP受众R3人群流入数', avg: null },
  ],
};

// ─── 格式化 ─────
function fmtNum(v: number | null | undefined, type?: string): string {
  if (v === null || v === undefined) return '-';
  if (type === 'QUOTA_TYPE_PERCENT') return `${(v / 100).toFixed(2)}%`;
  if (type === 'QUOTA_TYPE_MONEY') return `¥${(v / 100).toFixed(2)}`;
  if (v >= 100000000) return `${(v / 100000000).toFixed(2)}亿`;
  if (v >= 10000) return `${(v / 10000).toFixed(0)}万`;
  return v.toLocaleString();
}

// ─── DataCard（对齐 .dataCard: 296×110） ─────
function DataCard({ item }: { item: any }) {
  return (
    <div className="w-[296px] h-[110px] bg-[#fafafb] rounded-[8px] px-6 py-4 mr-4 mb-4">
      <div className="text-sm leading-[22px] text-[#0d0d0d]">
        {item.tips ? <span className="cursor-pointer" style={{ textDecoration: 'underline dashed', textUnderlineOffset: '0.2em' }}>{item.title}</span> : item.title}
      </div>
      <div className="font-semibold text-[#0d0d0d] text-[20px] leading-[28px]">{fmtNum(item.value, item.type)}</div>
      {item.avg && typeof item.avg === 'object' && (
        <div className="text-xs text-[#626365]">
          <span className="mr-1">比本品历史均值 {fmtNum(item.avg?.history, item.type)}</span>
        </div>
      )}
    </div>
  );
}

// ─── ReportList（左侧列表） ─────
function ReportList({ list, currentId, onSelect }: { list: any[]; currentId: number; onSelect: (id: number) => void }) {
  const [search, setSearch] = useState('');
  const filtered = list.filter((item) => !search || item.title.includes(search));
  return (
    <div className="flex h-full flex-col w-[324px] bg-white rounded-2xl">
      <div className="px-4 pt-4 pb-3">
        <Button intent="primary" icon="plus" className="w-full">新建招商复盘报告</Button>
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
                <div className="mt-1 pl-3.5 text-xs text-[rgba(51,55,61,0.36)]">ID: {item.id}　·　{new Date(item.create_time * 1000).toLocaleDateString()}</div>
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

// ─── OverviewTab ─────
function OverviewTab() {
  const { reach, mind, conv } = MOCK_VIEW;
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <div className="border-b border-[#edeef2] mt-3 -mx-6 mb-4" />
      {/* 智能总结 */}
      <div className="relative mb-2.5 overflow-hidden rounded-xl bg-[#F5F8FF]">
        <div className="flex items-center justify-between pl-4 pt-3 pr-3 leading-[30px]">
          <div className="flex items-center">
            <Icon name="book-open" size={14} className="mr-1" />
            <span className="text-sm font-bold" style={{ background: 'linear-gradient(90deg, #4D7EF7, #7B5CF5)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>智能总结</span>
          </div>
          <span className="cursor-pointer text-xs text-[rgba(51,55,61,0.58)]" onClick={() => setExpanded(!expanded)}>
            {expanded ? '收起' : '展开'}<Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={12} className="ml-0.5" />
          </span>
        </div>
        <div className="px-4 pb-3 pt-1 text-sm leading-6 text-[#0d0d0d] overflow-hidden" style={{ maxHeight: expanded ? 1000 : 132, transition: 'max-height 0.3s ease-in-out' }}>
          本次招商项目投放期间，品牌广告曝光覆盖 1.87 亿人，品牌 5R 总资产由投前 3,215 万增长至投后 9,872 万，增长率 207%。IP受众曝光覆盖 5,230 万人，其中 421 万人成功流入 R3 深度种草人群。转化人数 8.92 万，转化成本 ¥32.5，低于历史均值 ¥38.0，整体 ROI 表现优秀。建议后续加大优质 IP 资源投入，持续提升品牌心智渗透。
        </div>
        {!expanded && <div className="absolute bottom-0 w-full rounded-b-xl h-[100px]" style={{ background: 'linear-gradient(to top, #F5F8FF, transparent)' }} />}
        {expanded && <div className="px-4 pb-2 text-right text-xs text-[rgba(98,99,102,0.89)]">内容由 AI 生成，仅供参考</div>}
      </div>
      {/* 参考系 */}
      <div className="mb-4 flex items-center justify-end text-sm text-[#626365]">
        <span>参考系：</span>
        <span className="cursor-pointer font-medium text-[#0d0d0d]" style={{ textDecoration: 'underline dashed', textUnderlineOffset: '0.2em' }}>本品历史均值</span>
      </div>
      {/* 广告触达 */}
      <div className="pt-4 pb-2 border-b border-[#edeef2] mr-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[#0d0d0d]">
          <span className="inline-block h-4 w-4 rounded" style={{ background: 'linear-gradient(135deg, #6997F4, #A8C4FA)' }} />广告触达
        </div>
        <div className="flex flex-wrap">{reach.map((item) => <DataCard key={item.name} item={item} />)}</div>
      </div>
      {/* 品牌资产 */}
      <div className="pt-4 pb-2 border-b border-[#edeef2] mr-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[#0d0d0d]">
          <span className="inline-block h-4 w-4 rounded" style={{ background: 'linear-gradient(135deg, #F4A96E, #FAD4A8)' }} />品牌资产
        </div>
        <div className="flex flex-wrap">{mind.map((item) => <DataCard key={item.name} item={item} />)}</div>
      </div>
      {/* 转化效果 */}
      <div className="pt-4 pb-2 mr-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[#0d0d0d]">
          <span className="inline-block h-4 w-4 rounded" style={{ background: 'linear-gradient(135deg, #65D4A5, #A8EAC8)' }} />转化效果
        </div>
        <div className="flex flex-wrap">{conv.map((item) => <DataCard key={item.name} item={item} />)}</div>
      </div>
    </div>
  );
}

// ─── 占位 Tab ─────
function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <Icon name="bar-chart" size={48} className="text-[rgba(51,55,61,0.2)]" />
        <div className="mt-3 text-sm text-[rgba(51,55,61,0.58)]">{title}图表区域</div>
      </div>
    </div>
  );
}

// ─── 配置信息 ─────
function ConfigInfoTab() {
  const rows = [
    { label: '任务名称', value: '2026Q1 招商项目复盘' },
    { label: '投放日期', value: '2025-10-01 ~ 2026-03-31' },
    { label: '转化时长', value: '30天' },
    { label: '视频IP', value: '《热播综艺S2》《都市情感剧》' },
    { label: '创建时间', value: '2026-04-05 10:30:00' },
  ];
  return (
    <div className="p-6">
      <div className="rounded-lg border border-[#edeef2] p-4">
        <div className="mb-4 text-sm font-semibold text-[#0d0d0d]">基本信息</div>
        {rows.map((row) => (
          <div key={row.label} className="flex border-b border-[#f5f6f8] py-3 last:border-0">
            <span className="w-32 shrink-0 text-sm text-[rgba(51,55,61,0.58)]">{row.label}</span>
            <span className="text-sm text-[#0d0d0d]">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 主页面 ─────
export default function MerchantReviewPage() {
  const [currentId, setCurrentId] = useState(2001001);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <RuyiLayout
      navItems={['首页', '洞察诊断', '人群策略', '策略应用', '全域度量']}
      activeNav="全域度量"
      onNavChange={navigateNav}
      menuItems={MENU_ITEMS}
      activeMenu="merchant-review"
      onMenuChange={navigateMenu}
    >
      <ReviewMasterDetailLayout
        left={
          <ReportList
            list={MOCK_LIST}
            currentId={currentId}
            onSelect={setCurrentId}
          />
        }
        title="2026Q1 招商项目复盘"
        titleActions={
          <>
            <Button light size="small" icon="users">
              添加人群
            </Button>
            <Button light size="small" icon="copy">
              复制创建
            </Button>
            <Button light size="small" icon="download" />
            <Button light size="small" icon="external-link" />
            <Button light size="small" icon="trash" />
          </>
        }
        statusTag={{ label: '已完成', color: '#07C160', bgColor: '#e8f8ef' }}
        infoItems={[
          { label: '投放日期', value: '2025-10-01 ~ 2026-03-31' },
          { label: '转化时长', value: '30天' },
          { label: '视频IP', value: '《热播综艺S2》《都市情感剧》' },
        ]}
        tabs={[
          { label: '概览', value: 'overview' },
          { label: '资产广度', value: 'R' },
          { label: '资产深度', value: 'A' },
          { label: '资产偏好度', value: 'C' },
          { label: '资产持久度', value: 'E' },
          { label: '配置信息', value: 'config' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'R' && <PlaceholderTab title="资产广度 — 5R人群分析" />}
        {activeTab === 'A' && (
          <PlaceholderTab title="资产深度 — 5R人群流转（桑基图）" />
        )}
        {activeTab === 'C' && <PlaceholderTab title="资产偏好度 — 心智人群偏好" />}
        {activeTab === 'E' && <PlaceholderTab title="资产持久度 — 曝光频次" />}
        {activeTab === 'config' && <ConfigInfoTab />}
      </ReviewMasterDetailLayout>
    </RuyiLayout>
  );
}
