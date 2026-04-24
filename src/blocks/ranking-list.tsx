'use client';

import {
  Card,
  HoverFill,
  Icon,
  ScrollArea,
  Select,
  Tooltip,
} from 'one-design-next';
import React, { useState } from 'react';

// ═══════════════════════════════════════════════════════════════
// 排名榜（4 变体）
//
// 产品问题：在某个维度上看"谁排前几"。
// 四个变体对应不同的细分问题：
//   - BrandRanking：品牌在某指标上的排位 + 区间范围（带 bar）
//   - ShareRanking：品牌的心智份额占比（百分比 + 总量）
//   - HotRanking  ：关键词/话题的热度（数值 + TOP3 副文本）
//   - SurgeRanking：谁在快速上升（增长心智量 + 增长百分比）
//
// 每个变体是独立组件，workshop 按需 import。
// ═══════════════════════════════════════════════════════════════

// ═══ 通用类型 ═══════════════════════════════════════════════════

export interface BrandRankItem {
  rank: number;
  /** 品牌名 */
  name: string;
  /** 品牌 logo */
  avatar: string;
  /** 趋势变化（正负数） */
  trend?: number;
  /** Bar 区间最小值（百分比） */
  barMin?: number;
  /** Bar 区间最大值（百分比） */
  barMax?: number;
  /** 是否为当前品牌（高亮） */
  isCurrent?: boolean;
}

export interface ShareRankItem {
  rank: number;
  /** 心智（三级） */
  level3_mind: string;
  /** 心智一级 */
  level1_mind: string;
  /** 心智二级 */
  level2_mind: string;
  /** 心智总量 */
  mind_total: number | string;
  /** 行业份额 */
  industry_share: string;
}

export interface HotRankItem {
  rank: number;
  /** 心智/关键词名 */
  name: string;
  /** 分类标签 */
  tag?: string;
  /** TOP3 副文本 */
  subText?: string;
  /** 心智量/热度数值 */
  volume: string;
}

export interface SurgeRankItem {
  rank: number;
  /** 心智/话题名 */
  name: string;
  /** 分类标签 */
  tag?: string;
  /** 增长心智量副文本 */
  volume: string;
  /** 增长率 */
  value: string;
}

// ═══ 通用小部件 ══════════════════════════════════════════════════

function TrendArrow({ trend }: { trend: number }) {
  if (trend === 0) return <span className="w-4" />;
  const isUp = trend > 0;
  return (
    <span
      className={`flex items-center text-sm ${
        isUp ? 'text-green-6' : 'text-red-6'
      }`}
    >
      <Icon name={isUp ? 'arrow-up' : 'arrow-down'} source="lucide" size={14} />
      {Math.abs(trend)}
    </span>
  );
}

const rankingTitle = (text: string) => (
  <span className="border-b border-dashed border-black-12 text-base font-semibold text-black-12">
    {text}
  </span>
);

const rankingCardFillClassName =
  'flex min-h-0 w-full min-w-0 flex-1 flex-col [--odn-card-radius:12px] h-full';

// ═══ 1. BrandRanking（品牌榜，带 bar 区间） ═════════════════════

export interface BrandRankingProps {
  title?: string;
  items: BrandRankItem[];
  className?: string;
  /** 是否显示 bar 区间（默认 true） */
  showBar?: boolean;
  /** Bar 宽度（px，默认 100） */
  barWidth?: number;
}

/**
 * 品牌榜（带 bar 区间）
 *
 * 最佳参考 workshop：mindshare-detail（心智品牌榜，含 isCurrent 高亮）
 * 适用场景：品牌在某指标上的排位 + 区间范围。"有多高"。
 */
export const BrandRanking: React.FC<BrandRankingProps> = ({
  title = '心智品牌榜',
  items,
  className,
  showBar = true,
  barWidth = 100,
}) => {
  return (
    <Card
      elevation={0}
      className={className ?? 'w-[380px] shrink-0'}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-base font-semibold text-black-12">{title}</span>
      </div>
      <div className="flex flex-col px-3 pb-3 gap-0.5">
        {items.map((item) => (
          <div
            key={item.rank}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              item.isCurrent ? 'bg-blue-1' : 'hover:bg-black-2'
            }`}
          >
            <span
              className={`w-5 shrink-0 text-center text-sm tabular-nums font-medium ${
                item.isCurrent ? 'text-blue-6' : 'text-black-9'
              }`}
            >
              {item.rank}
            </span>
            <img
              src={item.avatar}
              alt=""
              className="size-6 rounded-full shrink-0 object-cover"
            />
            <span
              className={`flex-1 min-w-0 text-sm truncate ${
                item.isCurrent ? 'text-blue-6 font-medium' : 'text-black-12'
              }`}
            >
              {item.name}
            </span>
            {item.trend !== undefined && item.trend !== 0 && (
              <span
                className={`shrink-0 text-xs tabular-nums ${
                  item.trend > 0 ? 'text-green-7' : 'text-red-7'
                }`}
              >
                {item.trend > 0 ? '↑' : '↓'}
                {Math.abs(item.trend)}
              </span>
            )}
            {showBar && item.barMax !== undefined && (
              <>
                <div
                  className="shrink-0 h-2 rounded-full bg-black-3 overflow-hidden"
                  style={{ width: barWidth }}
                >
                  <div
                    className={`h-full rounded-full ${
                      item.isCurrent ? 'bg-blue-5' : 'bg-blue-4'
                    }`}
                    style={{ width: `${item.barMax}%` }}
                  />
                </div>
                <span className="text-[10px] text-black-8 tabular-nums shrink-0 w-[72px]">
                  {item.barMin}%-{item.barMax}%
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

// ═══ 2. ShareRanking（份额榜） ══════════════════════════════════

export interface ShareRankingProps {
  title?: string;
  tooltip?: React.ReactNode;
  items: ShareRankItem[];
  className?: string;
}

/**
 * TOP 份额心智排行榜
 *
 * 最佳参考 workshop：brand-mind-dashboard（本品牌 TOP 份额心智）
 * 适用场景：品牌心智的份额占比（前 3 名用蓝色加粗强调）。"占了多少"。
 */
export const ShareRanking: React.FC<ShareRankingProps> = ({
  title = '本品牌TOP份额心智',
  tooltip,
  items,
  className,
}) => {
  return (
    <div className={className ?? 'w-[360px] shrink-0'}>
      <div className="bg-white rounded-xl border border-[#e2e5ea] h-full">
        <div className="px-5 py-4 border-b border-[#e5e6eb]">
          {tooltip ? (
            <Tooltip popup={tooltip}>
              <span className="text-[16px] font-semibold text-[#0d0d0d] border-b border-dashed border-[#0d0d0d]">
                {title}
              </span>
            </Tooltip>
          ) : (
            <span className="text-[16px] font-semibold text-[#0d0d0d]">
              {title}
            </span>
          )}
        </div>
        <div className="h-[508px] overflow-y-auto px-5 py-3">
          {items.map((item, i) => (
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
                  {item.mind_total}
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
};

// ═══ 3. HotRanking（热门心智榜） ═════════════════════════════════

export interface HotRankingProps {
  title?: string;
  items: HotRankItem[];
  /** 顶部操作区（通常是 Select） */
  topContent?: React.ReactNode;
  className?: string;
}

/**
 * 热门心智榜
 *
 * 最佳参考 workshop：industry-opportunity-mind（热门心智榜）
 * 适用场景：关键词/话题的热度。"多热"。
 */
export const HotRanking: React.FC<HotRankingProps> = ({
  title = '热门心智榜',
  items,
  topContent,
  className,
}) => {
  return (
    <Card elevation={0} className={className ?? rankingCardFillClassName}>
      <Card.Header
        title={rankingTitle(title)}
        topContent={topContent}
        className="h-15 border-b border-black-4"
        style={{ '--odn-card-title-font-size': '16px' } as React.CSSProperties}
      />
      <ScrollArea className="min-h-0 w-full flex-1">
        <div className="flex flex-col gap-2 p-3">
          {items.map((item) => (
            <HoverFill
              key={`${item.rank}-${item.name}-${item.volume}`}
              className="w-full rounded-[6px]"
              bgClassName="rounded-[6px]"
            >
              <div className="flex items-center gap-1 px-3 py-1">
                <span className="w-[26px] shrink-0 text-sm text-black-9">
                  {item.rank}
                </span>
                <div className="min-w-0 flex flex-1 flex-col justify-center">
                  <div className="flex items-center gap-1">
                    <span className="min-w-0 truncate text-sm text-black-12">
                      {item.name}
                    </span>
                    {item.tag && (
                      <span className="flex h-5 items-center rounded-full bg-black-2 px-2 text-[8px] text-black-10 whitespace-nowrap">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  {item.subText && (
                    <span className="truncate text-xs text-black-10">
                      {item.subText}
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-base text-black-12">
                  {item.volume}
                </span>
              </div>
            </HoverFill>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

// ═══ 4. SurgeRanking（飙升榜） ══════════════════════════════════

export interface SurgeRankingProps {
  title?: string;
  items: SurgeRankItem[];
  topContent?: React.ReactNode;
  className?: string;
}

/**
 * 心智飙升榜
 *
 * 最佳参考 workshop：industry-opportunity-mind（心智飙升榜）
 * 适用场景：谁在快速上升。"涨了多少"。
 */
export const SurgeRanking: React.FC<SurgeRankingProps> = ({
  title = '心智飙升榜',
  items,
  topContent,
  className,
}) => {
  return (
    <Card elevation={0} className={className ?? rankingCardFillClassName}>
      <Card.Header
        title={rankingTitle(title)}
        topContent={topContent}
        className="h-15 border-b border-black-4"
        style={{ '--odn-card-title-font-size': '16px' } as React.CSSProperties}
      />
      <ScrollArea className="min-h-0 w-full flex-1">
        <div className="flex flex-col gap-2 p-3">
          {items.map((item) => (
            <HoverFill
              key={`${item.rank}-${item.name}-${item.value}`}
              className="w-full rounded-[6px]"
              bgClassName="rounded-[6px]"
            >
              <div className="flex items-center gap-1 px-3 py-1">
                <span className="w-[26px] shrink-0 text-sm text-black-9">
                  {item.rank}
                </span>
                <div className="min-w-0 flex flex-1 flex-col justify-center">
                  <div className="flex items-center gap-1">
                    <span className="min-w-0 truncate text-sm text-black-12">
                      {item.name}
                    </span>
                    {item.tag && (
                      <span className="flex h-5 items-center rounded-full bg-black-2 px-2 text-[8px] text-black-10 whitespace-nowrap">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <span className="truncate text-xs text-black-10">
                    增长心智量：{item.volume}
                  </span>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-base text-black-12">
                  <span className="text-green-6">
                    <Icon name="arrow-up" source="lucide" size={18} />
                  </span>
                  {item.value}
                </span>
              </div>
            </HoverFill>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

// ═══ Demo ═══════════════════════════════════════════════════════

const BRAND_AVATAR =
  'https://wxa.wxs.qq.com/wxad-design/yijie/radar/1776411999700-330b1c2ca96a3403.jpg';

const DEMO_BRAND: BrandRankItem[] = Array.from({ length: 10 }, (_, i) => ({
  rank: i + 1,
  name: `品牌 ${i + 1}`,
  avatar: BRAND_AVATAR,
  trend: [4, 2, -1, 0, 3, -2, 1, 0, 5, -3][i],
  barMin: 15 + i,
  barMax: 25 + i,
  isCurrent: i === 2,
}));

const DEMO_SHARE: ShareRankItem[] = Array.from({ length: 8 }, (_, i) => ({
  rank: i + 1,
  level3_mind: ['美白', '补水', '抗皱', '敏感肌', '抗氧化', '祛痘', '修护', '提亮'][i],
  level1_mind: '功效',
  level2_mind: '基础护肤',
  mind_total: 6324914 - i * 100000,
  industry_share: `${(25 - i * 1.5).toFixed(2)}%`,
}));

const DEMO_HOT: HotRankItem[] = Array.from({ length: 8 }, (_, i) => ({
  rank: i + 1,
  name: ['敏感肌修复', '抗老', '美白', '补水', '控油', '祛痘', '提亮', '抗氧化'][i],
  tag: i % 3 === 0 ? '增长心智' : '心智分类标签',
  subText: 'TOP3 品牌：Freeplus、韩束、谷雨',
  volume: (6324914 - i * 180000).toLocaleString('en-US'),
}));

const DEMO_SURGE: SurgeRankItem[] = Array.from({ length: 8 }, (_, i) => ({
  rank: i + 1,
  name: ['纯净护肤', '早 C 晚 A', '冻干面膜', '成分党', '早 A 晚 C', '油敏肌', '屏障修护', '透明质酸'][i],
  tag: '心智分类标签',
  volume: (2340000 - i * 80000).toLocaleString('en-US'),
  value: `${(45 - i * 3).toFixed(1)}%`,
}));

const MINDSHARE_SCOPE_OPTIONS = [
  { value: 'all', label: '全部心智' },
  { value: 'category', label: '按心智分类' },
];

function RankingMindshareSelect() {
  const [value, setValue] = useState('all');
  return (
    <Select
      light
      size="small"
      value={value}
      options={MINDSHARE_SCOPE_OPTIONS}
      onChange={(v) => setValue(String(v ?? 'all'))}
    />
  );
}

const RankingListDemo = () => {
  return (
    <div className="flex flex-col gap-6 p-4 bg-black-1">
      <div>
        <div className="mb-2 text-sm text-black-10">BrandRanking · 品牌榜（带 bar 区间）</div>
        <BrandRanking items={DEMO_BRAND} />
      </div>
      <div>
        <div className="mb-2 text-sm text-black-10">ShareRanking · 份额榜</div>
        <ShareRanking items={DEMO_SHARE} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-[600px]">
          <div className="mb-2 text-sm text-black-10">HotRanking · 热门榜</div>
          <HotRanking items={DEMO_HOT} topContent={<RankingMindshareSelect />} />
        </div>
        <div className="h-[600px]">
          <div className="mb-2 text-sm text-black-10">SurgeRanking · 飙升榜</div>
          <SurgeRanking items={DEMO_SURGE} topContent={<RankingMindshareSelect />} />
        </div>
      </div>
    </div>
  );
};

export default RankingListDemo;
