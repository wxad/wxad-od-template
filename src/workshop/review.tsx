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
import reviewPageFixture from './data/review-page.json';

// 本地 fixtures，避免预览域等非 localhost 来源被 CDN CORS 拦截

// ─── 菜单（对齐截图：结案复盘 > 营销复盘/招商复盘/转化复盘） ─────
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
  生意: 'store-asset-distribution',
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

// ─── 状态映射（对齐 index.tsx mapStatus） ─────
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  STATUS_FINISHED: { label: '已完成', color: '#07C160' },
  STATUS_PENDING: { label: '计算中', color: '#296BEF' },
  STATUS_DRAFT: { label: '排队中', color: '#898b8f' },
  STATUS_FAILED: { label: '失败', color: '#E63D2E' },
};

// ─── 格式化数字 ─────
function fmtNum(v: number | null | undefined, type?: string): string {
  if (v === null || v === undefined) return '-';
  if (type === 'QUOTA_TYPE_PERCENT') return `${(v / 100).toFixed(2)}%`;
  if (type === 'QUOTA_TYPE_MONEY') return `¥${(v / 100).toFixed(2)}`;
  if (v >= 100000000) return `${(v / 100000000).toFixed(2)}亿`;
  if (v >= 10000) return `${(v / 10000).toFixed(0)}万`;
  return v.toLocaleString();
}

// ─── DataCard（严格对齐 .dataCard: 296×110, bg:#fafafb, radius:8px, p:16px 24px, mr/mb:16px） ─────
function DataCard({ item }: { item: any }) {
  return (
    <div
      className="w-[296px] h-[110px] bg-[#fafafb] rounded-lg px-6 py-4 mr-4 mb-4"
    >
      {/* .dataTitle: color:#0d0d0d, 14px, lineHeight:22px */}
      <div className="text-sm leading-[22px] text-[#0d0d0d]">
        {item.tips ? (
          <span className="cursor-pointer" style={{ textDecoration: 'underline dashed', textUnderlineOffset: '0.2em' }}>
            {item.title}
          </span>
        ) : (
          item.title
        )}
      </div>
      {/* .dataNum: color:#0d0d0d, 20px, 600, lineHeight:28px */}
      <div className="font-semibold text-[#0d0d0d] text-[20px] leading-[28px]">
        {fmtNum(item.value, item.type)}
      </div>
      {/* .diffBox: color:#626365 */}
      {item.avg !== null && item.avg !== undefined && typeof item.avg === 'object' && (
        <div className="text-xs text-[#626365]">
          <span className="mr-1">比本品历史均值 {fmtNum(item.avg?.history, item.type)}</span>
        </div>
      )}
    </div>
  );
}

// ─── 左侧 ReportList（对齐 audience-profile 的 ReportList，复用相同结构） ─────
function ReportList({
  list,
  currentId,
  onSelect,
}: {
  list: any[];
  currentId: number;
  onSelect: (id: number) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = list.filter((item) => !search || item.title.includes(search));

  return (
    <div className="flex h-full flex-col w-[324px] bg-white rounded-[16px]">
      {/* 新建按钮 */}
      <div className="px-4 pt-4 pb-3">
        <Button intent="primary" icon="plus" className="w-full">
          新建营销复盘报告
        </Button>
      </div>
      {/* 搜索 */}
      <div className="px-4 pb-3">
        <Input
          leftElement={<Icon name="search" size={14} />}
          placeholder="搜索报告名称"
          value={search}
          onChange={(v) => setSearch(String(v ?? ''))}
          className="w-full"
        />
      </div>
      {/* 列表 */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 px-2">
          {filtered.map((item) => {
            const isActive = item.id === currentId;
            const st = STATUS_MAP[item.status] || STATUS_MAP.STATUS_FINISHED;
            return (
              <div
                key={item.id}
                className="cursor-pointer rounded-lg px-3 py-2.5 transition-colors"
                style={{ backgroundColor: isActive ? '#f5f8ff' : undefined }}
                onClick={() => onSelect(item.id)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: st.color }}
                  />
                  <span className="flex-1 truncate text-sm font-medium text-[#0d0d0d]">
                    {item.title}
                  </span>
                </div>
                <div className="mt-1 pl-3.5 text-xs text-[rgba(51,55,61,0.36)]">
                  ID: {item.id}　·　{new Date(item.create_time * 1000).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      {/* 分页 */}
      <div className="flex justify-center border-t border-[#edeef2] py-3">
        <Pagination showPrevNext totalSize={filtered.length} pageSize={20} value={1} onChange={() => {}} />
      </div>
    </div>
  );
}

// ─── 概览 Tab（严格对齐 Overview.tsx + index.module.less） ─────
function OverviewTab({ view }: { view: any }) {
  const reach = view?.reach || [];
  const mind = view?.mind || [];
  const conv = view?.conv || [];
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      {/* .divider: border-bottom:1px solid #edeef2, margin: 12px -24px 16px */}
      <div className="border-b border-[#edeef2] mt-3 -mx-6 mb-4" />

      {/* AI 智能总结卡片（对齐 Overview.tsx line 113-159） */}
      <div className="relative mb-2.5 overflow-hidden rounded-xl bg-[#F5F8FF]">
        <div className="flex items-center justify-between px-4 pt-3 pr-3 leading-[30px]">
          <div className="flex items-center">
            <Icon name="book-open" size={14} className="mr-1" />
            <span
              className="text-sm font-bold"
              style={{
                background: 'linear-gradient(90deg, #4D7EF7 0%, #7B5CF5 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              智能总结
            </span>
          </div>
          <span
            className="cursor-pointer text-xs text-[rgba(51,55,61,0.58)]"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '收起' : '展开'}
            <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={12} className="ml-0.5" />
          </span>
        </div>
        <div
          className="px-4 pb-3 pt-1 text-sm leading-6 text-[#0d0d0d] overflow-hidden"
          style={{
            maxHeight: expanded ? 1000 : 132,
            transition: 'max-height 0.3s ease-in-out',
          }}
        >
          本次投放期间（2025-04-07 ~ 2026-04-06），品牌广告曝光覆盖人群达 3.49 亿人，
          品牌 5R 总资产由投前 4,529 万增长至投后 1.53 亿，整体资产增长 238%。
          其中 R3（深度种草）人群增长最为显著，由投前 1,021 万增至 4,512 万，增幅 342%。
          投放带来 14.9 万转化用户，转化率 0.043%，千次曝光成本 ¥12.8。
          建议后续投放加大对 R2→R3 流转的引导力度，优化高频次触达策略以提升转化效率。
        </div>
        {!expanded && (
          <div
            className="absolute bottom-0 w-full rounded-b-xl h-[100px]"
            style={{ background: 'linear-gradient(to top, #F5F8FF, transparent)' }}
          />
        )}
        {expanded && (
          <div className="px-4 pb-2 text-right text-xs text-[rgba(98,99,102,0.89)]">
            内容由 AI 生成，仅供参考
          </div>
        )}
      </div>

      {/* 参考系选择器（对齐 .contentHeader: flex justify-end color:#626365） */}
      <div className="mb-4 flex items-center justify-end text-sm text-[#626365]">
        <span>参考系：</span>
        <span className="cursor-pointer font-medium text-[#0d0d0d]" style={{ textDecoration: 'underline dashed', textUnderlineOffset: '0.2em' }}>
          本品历史均值
        </span>
      </div>

      {/* 三板块（对齐 .sectionBox > .section + .dataBox: flex flex-wrap） */}
      {/* section1: 广告触达, flex:1, border-bottom */}
      <div className="pt-4 pb-2 border-b border-[#edeef2] mr-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[#0d0d0d]">
          <span className="inline-block h-4 w-4 rounded" style={{ background: 'linear-gradient(135deg, #6997F4, #A8C4FA)' }} />
          广告触达
        </div>
        <div className="flex flex-wrap">
          {reach.map((item: any) => (
            <DataCard key={item.name} item={item} />
          ))}
        </div>
      </div>

      {/* section2: 品牌资产, flex:2, border-bottom */}
      <div className="pt-4 pb-2 border-b border-[#edeef2] mr-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[#0d0d0d]">
          <span className="inline-block h-4 w-4 rounded" style={{ background: 'linear-gradient(135deg, #F4A96E, #FAD4A8)' }} />
          品牌资产
        </div>
        <div className="flex flex-wrap">
          {mind.map((item: any) => (
            <DataCard key={item.name} item={item} />
          ))}
        </div>
      </div>

      {/* section3: 转化效果, flex:1, 无 border-bottom */}
      <div className="pt-4 pb-2 mr-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[#0d0d0d]">
          <span className="inline-block h-4 w-4 rounded" style={{ background: 'linear-gradient(135deg, #65D4A5, #A8EAC8)' }} />
          转化效果
        </div>
        <div className="flex flex-wrap">
          {conv.map((item: any) => (
            <DataCard key={item.name} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 配置信息 Tab（对齐 ConfigInfo.tsx） ─────
function ConfigInfoTab({ setting }: { setting: any }) {
  const rows = [
    { label: '任务名称', value: setting?.title },
    { label: '投放日期', value: `${setting?.begin_date} ~ ${setting?.end_date}` },
    { label: '转化时长', value: setting?.duration ? `${setting.duration}天` : '-' },
    { label: '创建时间', value: setting?.create_time ? new Date(setting.create_time * 1000).toLocaleString() : '-' },
  ];

  return (
    <div className="p-6">
      <div className="rounded-lg border border-[#edeef2] p-4">
        <div className="mb-4 text-sm font-semibold text-[#0d0d0d]">基本信息</div>
        {rows.map((row) => (
          <div key={row.label} className="flex border-b border-[#f5f6f8] py-3 last:border-0">
            <span className="w-32 shrink-0 text-sm text-[rgba(51,55,61,0.58)]">{row.label}</span>
            <span className="text-sm text-[#0d0d0d]">{row.value || '-'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 占位 Tab ─────
function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <Icon name="bar-chart" size={48} style={{ color: 'rgba(51,55,61,0.2)' }} />
        <div className="mt-3 text-sm text-[rgba(51,55,61,0.58)]">
          {title}图表区域
        </div>
      </div>
    </div>
  );
}

// ─── 主页面（对齐 review/result/index.tsx：左右结构 + ReportList + BlockTab） ─────
export default function ReviewPage() {
  const data = reviewPageFixture as any;
  const [currentId, setCurrentId] = useState(1077009);
  const [activeTab, setActiveTab] = useState('overview');

  const detail = data?.detail;
  const list = data?.list || [];
  const setting = detail?.setting || {};
  const view = detail?.view || {};
  const st = STATUS_MAP[setting.status] || STATUS_MAP.STATUS_FINISHED;

  return (
    <RuyiLayout
      navItems={['首页', '洞察诊断', '人群策略', '策略应用', '全域度量', '生意']}
      activeNav="全域度量"
      onNavChange={navigateNav}
      menuItems={MENU_ITEMS}
      activeMenu="review"
      onMenuChange={navigateMenu}
    >
      <ReviewMasterDetailLayout
        left={
          <ReportList
            list={list}
            currentId={currentId}
            onSelect={setCurrentId}
          />
        }
        title={setting.title || '营销复盘报告'}
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
        statusTag={{
          label: st.label,
          color: st.color,
          bgColor: st.color === '#07C160' ? '#e8f8ef' : '#fef1f0',
        }}
        infoItems={[
          {
            label: '投放日期',
            value: `${setting.begin_date} ~ ${setting.end_date}`,
          },
          ...(setting.duration
            ? [{ label: '转化时长', value: `${setting.duration}天` }]
            : []),
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
        {activeTab === 'overview' && <OverviewTab view={view} />}
        {activeTab === 'R' && (
          <PlaceholderTab title="资产广度 — 5R人群分析 + 曝光人群分析" />
        )}
        {activeTab === 'A' && (
          <PlaceholderTab title="资产深度 — 5R人群流转分析（桑基图）" />
        )}
        {activeTab === 'C' && (
          <PlaceholderTab title="资产偏好度 — 心智人群偏好分析" />
        )}
        {activeTab === 'E' && (
          <PlaceholderTab title="资产持久度 — 曝光频次与转化率分析" />
        )}
        {activeTab === 'config' && <ConfigInfoTab setting={setting} />}
      </ReviewMasterDetailLayout>
    </RuyiLayout>
  );
}
