'use client';

import clsx from 'clsx';
import { Card, HoverFill, Icon, Popover } from 'one-design-next';
import React, { useState } from 'react';

interface RankItem {
  rank: number;
  name: string;
  trend: number;
  isCurrent?: boolean;
}

function RankingTrendBadge({ trend }: { trend: number }) {
  if (trend === 0) return null;
  const isUp = trend > 0;
  return (
    <span
      className={clsx(
        'shrink-0 text-[length:var(--odn-font-size-comment)] tabular-nums font-medium',
        isUp ? 'text-green-6' : 'text-red-6',
      )}
    >
      {isUp ? '↑' : '↓'} {Math.abs(trend)}
    </span>
  );
}

function MiniRankingList({
  title,
  items,
}: {
  title: React.ReactNode;
  items: RankItem[];
}) {
  const currentItem = items.find((i) => i.isCurrent);
  const otherItems = items.filter((i) => !i.isCurrent);

  return (
    <div>
      <div className="mb-3 text-[length:var(--odn-font-size-text-sm)]">{title}</div>
      {currentItem && (
        <>
          <HoverFill className="-mx-2" bgClassName="rounded-lg">
            <div className="flex items-center p-2">
              <span className="w-6 shrink-0 text-sm">{currentItem.rank}</span>
              <span className="min-w-0 flex-1 truncate text-[13px]">{currentItem.name}</span>
              <RankingTrendBadge trend={currentItem.trend} />
            </div>
          </HoverFill>
          <div className="my-2 border-b border-solid border-black-4" />
        </>
      )}
      {otherItems.map((item) => (
        <HoverFill key={item.rank} className="-mx-2" bgClassName="rounded-lg">
          <div className="flex items-center p-2">
            <span className="w-6 shrink-0 text-sm">{item.rank}</span>
            <span className="min-w-0 flex-1 truncate text-[13px]">{item.name}</span>
            <RankingTrendBadge trend={item.trend} />
          </div>
        </HoverFill>
      ))}
    </div>
  );
}

// ─── 5R 指标卡数据 ────────────────────────────────────────────

interface MetricItem {
  label: string;
  value: string;
  unit: string;
  colorVar: string;
  comparison: string;
  percentage: string;
}

const R5_COLORS = {
  total: 'var(--odn-color-black-12)',
  r1: 'var(--odn-color-blue-5)',
  r2: '#35AFFF',
  r3: '#00C7BE',
  r4: '#95D609',
  r5: '#FFC300',
};

const METRICS: MetricItem[] = [
  {
    label: '人群总资产',
    value: '89,267,538',
    unit: '人',
    colorVar: R5_COLORS.total,
    comparison: '超过 同类目 TOP5 商品均值',
    percentage: '409.88%',
  },
  {
    label: 'R1 触达',
    value: '48,044,892',
    unit: '人',
    colorVar: R5_COLORS.r1,
    comparison: '超过 同类目 TOP5 商品均值',
    percentage: '409.88%',
  },
  {
    label: 'R2 回应',
    value: '36,968,308',
    unit: '人',
    colorVar: R5_COLORS.r2,
    comparison: '超过 同类目 TOP5 商品均值',
    percentage: '409.88%',
  },
  {
    label: 'R3 共鸣',
    value: '4,132,641',
    unit: '人',
    colorVar: R5_COLORS.r3,
    comparison: '超过 同类目 TOP5 商品均值',
    percentage: '409.88%',
  },
  {
    label: 'R4 行动',
    value: '97,043',
    unit: '人',
    colorVar: R5_COLORS.r4,
    comparison: '超过 同类目 TOP5 商品均值',
    percentage: '409.88%',
  },
  {
    label: 'R5 信赖',
    value: '24,654',
    unit: '人',
    colorVar: R5_COLORS.r5,
    comparison: '超过 同类目 TOP5 商品均值',
    percentage: '409.88%',
  },
];

const DISTRIBUTION = [
  { label: 'R1 触达', color: R5_COLORS.r1, ratio: 53.82 },
  { label: 'R2 回应', color: R5_COLORS.r2, ratio: 41.41 },
  { label: 'R3 共鸣', color: R5_COLORS.r3, ratio: 4.63 },
  { label: 'R4 行动', color: R5_COLORS.r4, ratio: 0.11 },
  { label: 'R5 信赖', color: R5_COLORS.r5, ratio: 0.03 },
];

function DistributionBarPopoverContent() {
  return (
    <>
      <div className="mb-2 flex items-center justify-between gap-8">
        <span className="text-[length:var(--odn-font-size-text-sm)] font-semibold text-black-12">
          5R 资产分布
        </span>
        <span className="text-[length:var(--odn-font-size-comment)] text-black-8">
          占比
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {DISTRIBUTION.map((seg) => (
          <div
            key={seg.label}
            className="flex items-center justify-between gap-8 text-[length:var(--odn-font-size-comment)]"
          >
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-black-10">{seg.label}</span>
            </div>
            <span className="tabular-nums font-semibold text-black-12">
              {seg.ratio.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

const BRAND_RANK: RankItem[] = [
  { rank: 3, name: '香奈儿/Chanel智慧紧肤提拉乳霜', trend: 2, isCurrent: true },
  { rank: 1, name: '香奈儿/Chanel智慧紧肤精华乳霜', trend: 1 },
  { rank: 2, name: '香奈儿/Chanel一号红山茶花乳霜补充装', trend: -1 },
  { rank: 4, name: '香奈儿/Chanel一号红山茶花乳霜', trend: 0 },
];

const INDUSTRY_RANK: RankItem[] = [
  {
    rank: 8,
    name: '香奈儿/Chanel智慧紧肤提拉乳霜',
    trend: -2,
    isCurrent: true,
  },
  { rank: 1, name: '普拉达/PRADA焕颜面霜', trend: 4 },
  { rank: 2, name: '雅诗兰黛/EsteeLauder白金级蕴能黑钻光琉面霜', trend: -3 },
  { rank: 3, name: '资生堂/SHISEIDO光透耀白凝霜', trend: 2 },
];

// ─── 流转指标卡数据 ────────────────────────────────────────────

interface FlowMetric {
  key: string;
  label: string;
  subtitle: string;
  value: string;
  comparison: 'above' | 'below';
  comparisonLabel: string;
  percentage: string;
}

const FLOW_METRICS: FlowMetric[] = [
  {
    key: 'acquisition',
    label: '拉新',
    subtitle: '(非5R到5R)',
    value: '6,324,914',
    comparison: 'above',
    comparisonLabel: '超过行业均值',
    percentage: '24.14%',
  },
  {
    key: 'nurturing',
    label: '蓄水',
    subtitle: '(非5R到R1/R2)',
    value: '2,846,824',
    comparison: 'above',
    comparisonLabel: '超过行业均值',
    percentage: '31.03%',
  },
  {
    key: 'seeding',
    label: '种草',
    subtitle: '(非5R/R1/R2到R3)',
    value: '31,914',
    comparison: 'below',
    comparisonLabel: '低于行业均值',
    percentage: '18.91%',
  },
];

// ─── 子组件 ────────────────────────────────────────────────

function MetricCard({ item, isFirst }: { item: MetricItem; isFirst: boolean }) {
  return (
    <HoverFill className="flex-1 px-4 py-3 min-w-0" bgClassName="rounded-lg">
      <div className="mb-1 flex items-center gap-1.5">
        {!isFirst && (
          <span
            className="size-2 shrink-0"
            style={{ backgroundColor: item.colorVar }}
          />
        )}
        <span className="border-b border-dashed border-black-9 text-[length:var(--odn-font-size-text-sm)] font-semibold text-black-12">
          {item.label}
        </span>
      </div>
      <div className="mb-1 flex items-baseline gap-1.5">
        <span className="text-[18px] font-semibold tabular-nums text-black-12">
          {item.value}
        </span>
        <span className="text-[length:var(--odn-font-size-text-sm)] text-black-10">
          {item.unit}
        </span>
      </div>
      <div className="text-[length:var(--odn-font-size-comment)] leading-relaxed text-black-9">
        <div>{item.comparison}</div>
        <div className="tabular-nums text-[length:var(--odn-font-size-text-sm)] text-green-7">
          {item.percentage}
        </div>
      </div>
    </HoverFill>
  );
}

function DistributionBar() {
  return (
    <div className="px-6 pb-6 pt-4">
      <Popover
        trigger="hover"
        placement="top"
        arrowed={false}
        popup={<DistributionBarPopoverContent />}
        popupClassName="rounded-[6px] bg-white px-4 py-3"
      >
        <div className="flex h-2 cursor-pointer gap-1 overflow-hidden">
          {DISTRIBUTION.map((seg) => (
            <div
              key={seg.label}
              className="transition-opacity duration-200"
              style={{
                width: `${seg.ratio}%`,
                backgroundColor: seg.color,
                minWidth: seg.ratio < 1 ? 4 : undefined,
              }}
            />
          ))}
        </div>
      </Popover>
    </div>
  );
}

function FlowCard({
  item,
  active,
  onClick,
}: {
  item: FlowMetric;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={clsx(
        'flex flex-1 min-w-0 cursor-pointer flex-col gap-1.5 overflow-hidden rounded-[12px] px-5 py-3.5 transition-colors duration-150',
        active
          ? 'border border-blue-6 bg-blue-1'
          : 'border border-transparent bg-black-1 hover:bg-solid-black-2',
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[length:var(--odn-font-size-text-sm)] font-semibold text-black-12">
            {item.label}
          </span>
          <span className="text-[length:var(--odn-font-size-text-sm)] text-black-12">
            {item.subtitle}
          </span>
        </div>
        <button
          type="button"
          className="shrink-0 text-black-8 transition-colors duration-150 hover:text-black-11"
          aria-label="添加到计算"
        >
          <Icon name="chart" size={16} />
        </button>
      </div>
      <div className="text-[length:var(--odn-font-size-headline-3)] font-semibold tabular-nums leading-8 text-black-12">
        {item.value}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[length:var(--odn-font-size-comment)] text-black-12">
          {item.comparisonLabel}
        </span>
        <span
          className={clsx(
            'tabular-nums text-[length:var(--odn-font-size-text-sm)]',
            item.comparison === 'above' ? 'text-red-6' : 'text-green-6',
          )}
        >
          {item.percentage}
        </span>
      </div>
    </div>
  );
}

export type CrowdAssetOverviewCardProps = {
  /** 为 false 时仅保留指标卡 + 分布条（如品牌人群资产 workshop 页） */
  showRankings?: boolean;
};

/** 5R 资产概览（指标卡 + 分布条；可选双列 SPU 排名），与区块文档一致，可供 workshop 页复用 */
export function CrowdAssetOverviewCard({
  showRankings = true,
}: CrowdAssetOverviewCardProps) {
  return (
    <Card
      elevation={0}
      className="w-full border border-solid border-black-4 [--odn-card-radius:12px]"
    >
      <Card.Header
        title="资产概览"
        style={{ '--odn-card-title-font-size': '16px' }}
        className="border-b border-black-4"
      />
      <div className="flex gap-2 px-6 pt-6">
        {METRICS.map((item, i) => (
          <MetricCard key={item.label} item={item} isFirst={i === 0} />
        ))}
      </div>
      <DistributionBar />
      {showRankings ? (
        <div className="flex border-t border-solid border-black-4">
          <div className="min-w-0 flex-1 border-r border-solid border-black-4 px-6 pt-5 pb-4">
            <MiniRankingList
              title={
                <div className="flex items-center gap-1 font-semibold text-black-12">
                  <span>本品牌</span>
                  <span>同类目 SPU</span>
                  <span className="text-black-10">的</span>
                  <span>人群总资产榜</span>
                </div>
              }
              items={BRAND_RANK}
            />
          </div>
          <div className="min-w-0 flex-1 px-5 py-4">
            <MiniRankingList
              title={
                <div className="flex items-center gap-1 font-semibold text-black-12">
                  <span>本行业</span>
                  <span>同类目 SPU</span>
                  <span className="text-black-10">的</span>
                  <span>人群总资产榜</span>
                </div>
              }
              items={INDUSTRY_RANK}
            />
          </div>
        </div>
      ) : null}
    </Card>
  );
}

// ─── 主组件 ────────────────────────────────────────────────

export default function MetricCardGroupBlock() {
  const [activeFlowKey, setActiveFlowKey] = useState('acquisition');

  return (
    <div className="flex flex-col gap-6">
      <CrowdAssetOverviewCard />

      {/* 人群流转指标卡 */}
      <Card
        elevation={0}
        className="w-full border border-solid border-black-4 [--odn-card-radius:12px]"
      >
        <Card.Header
          title="流转概览"
          style={{ '--odn-card-title-font-size': '16px' }}
          className="border-b border-black-4"
        />
        <div className="flex gap-4 px-6 pt-6 pb-6">
          {FLOW_METRICS.map((item) => (
            <FlowCard
              key={item.key}
              item={item}
              active={activeFlowKey === item.key}
              onClick={() => setActiveFlowKey(item.key)}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
