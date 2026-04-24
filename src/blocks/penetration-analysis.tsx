'use client';

import clsx from 'clsx';
import { Card, Icon } from 'one-design-next';
import React, { useState } from 'react';

// ─── 数据类型 ────────────────────────────────────────────

type CrowdItem = {
  name: string;
  brandRate: number;
  benchmarkRate: number;
};

type RankItem = {
  rank: number;
  name: string;
  change?: number;
  isSelf?: boolean;
};

// ─── Mock 数据 ────────────────────────────────────────────

const CROWD_DATA: CrowdItem[] = [
  { name: '奢美核心人群', brandRate: 14.8, benchmarkRate: 9.2 },
  { name: '运动户外泛兴趣人群', brandRate: 13.5, benchmarkRate: 11.8 },
  { name: '白酒行业人群', brandRate: 13.14, benchmarkRate: 8.88 },
  { name: '香水核心人群', brandRate: 10.2, benchmarkRate: 7.5 },
  { name: '奢侈品核心人群', brandRate: 8.6, benchmarkRate: 6.3 },
  { name: '预测换机人群', brandRate: 16.8, benchmarkRate: 14.2 },
  { name: '母婴兴趣人群', brandRate: 13.5, benchmarkRate: 10.1 },
  { name: '泛宠物人群', brandRate: 6.8, benchmarkRate: 4.5 },
  { name: '美妆城市女性向产品人群', brandRate: 9.5, benchmarkRate: 7.8 },
  { name: '熬夜人群', brandRate: 13.5, benchmarkRate: 11.2 },
];

const BRAND_RANKING: RankItem[] = [
  { rank: 1, name: '香奈儿/Chanel智慧紧肤精华乳霜', change: 1 },
  { rank: 2, name: '香奈儿/Chanel一号红山茶花乳霜补充装', change: -1 },
  { rank: 3, name: '香奈儿/Chanel智慧紧肤提拉乳霜', change: 2, isSelf: true },
  { rank: 4, name: '香奈儿/Chanel一号红山茶花乳霜' },
  { rank: 5, name: '香奈儿/Chanel奢华精萃密集焕白乳霜', change: -2 },
];

const INDUSTRY_RANKING: RankItem[] = [
  { rank: 1, name: '普拉达/PRADA焕颜面霜', change: 4 },
  { rank: 2, name: '雅诗兰黛/EsteeLauder白金级蕴能黑钻光璨面霜', change: -3 },
  { rank: 3, name: '资生堂/SHISEIDO光透耀白凝霜', change: 2 },
  { rank: 4, name: '悦诗风吟/INNISFREE胶原多肽绿茶神经酰胺塑弹霜', change: -4 },
  { rank: 8, name: '香奈儿/Chanel智慧紧肤提拉乳霜', change: -2, isSelf: true },
];

const MAX_RATE = 20;

// ─── 排名变化指示器 ────────────────────────────────────────

function RankChange({ change }: { change?: number }) {
  if (!change) return null;
  const isUp = change > 0;
  return (
    <span className={clsx('inline-flex items-center flex-none', isUp ? 'text-green-7' : 'text-red-7')}>
      <Icon name={isUp ? 'arrow-up' : 'arrow-down'} size={16} />
      <span className="text-sm tabular-nums">{Math.abs(change)}</span>
    </span>
  );
}

// ─── 排名列表 ────────────────────────────────────────────

function RankingList({
  title,
  items,
  activeCrowd,
}: {
  title: { scope: string; crowd: string };
  items: RankItem[];
  activeCrowd: string;
}) {
  const selfItem = items.find((i) => i.isSelf);
  const otherItems = items.filter((i) => !i.isSelf);

  return (
    <div className="flex flex-col gap-[11px] px-6 pt-5 pb-4">
      {/* 标题 */}
      <div className="flex items-center gap-1 text-sm font-semibold whitespace-nowrap">
        <span className="text-black-12">{title.scope}</span>
        <span className="text-black-12">同类目 SPU</span>
        <span className="text-black-9">在</span>
        <span className="text-black-12">{activeCrowd}</span>
        <span className="text-black-9">的</span>
        <span className="text-black-12">渗透率榜</span>
      </div>

      {/* 当前 SPU 高亮行 */}
      {selfItem && (
        <div className="flex items-center py-2">
          <span className="w-6 text-sm tabular-nums text-black-10 flex-none">{selfItem.rank}</span>
          <span className="flex-1 min-w-0 text-sm text-black-12 truncate">{selfItem.name}</span>
          <RankChange change={selfItem.change} />
        </div>
      )}

      {/* 分割线 */}
      <div className="h-px bg-black-4" />

      {/* 其他排名 */}
      <div className="flex flex-col">
        {otherItems.map((item) => (
          <div key={item.rank} className="flex items-center py-2">
            <span className="w-6 text-sm tabular-nums text-black-8 flex-none">{item.rank}</span>
            <span className="flex-1 min-w-0 text-sm text-black-9 truncate">{item.name}</span>
            <RankChange change={item.change} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tooltip Popover ─────────────────────────────────────

function CrowdTooltip({
  item,
  style,
}: {
  item: CrowdItem;
  style: React.CSSProperties;
}) {
  return (
    <div
      className="absolute z-10 bg-white rounded-[8px] border border-black-4 p-4 w-[280px] flex flex-col gap-4"
      style={{
        ...style,
        boxShadow: '0 3px 5px rgba(0,0,0,0.05), 0 6px 15px rgba(0,0,0,0.05)',
      }}
    >
      <div className="flex items-start justify-between text-sm">
        <span className="font-semibold text-black-12">{item.name}</span>
        <span className="text-black-8">渗透率</span>
      </div>
      <div className="h-px bg-[#ebebeb]" />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-[1px] bg-blue-5 flex-none" />
            <span className="text-sm text-black-12">本品牌 SPU</span>
          </div>
          <span className="text-base tabular-nums text-black-12">{item.brandRate.toFixed(2)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-0.5 bg-blue-6 flex-none" />
            <span className="text-sm text-black-12">同类目 TOP5 商品均值</span>
          </div>
          <span className="text-base tabular-nums text-black-12">{item.benchmarkRate.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── 子弹图行 ────────────────────────────────────────────

function BulletRow({
  item,
  isActive,
  isHovered,
  onHover,
}: {
  item: CrowdItem;
  isActive: boolean;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
}) {
  const barWidthPct = (item.brandRate / MAX_RATE) * 100;
  const markerLeftPct = (item.benchmarkRate / MAX_RATE) * 100;

  return (
    <div
      className={clsx(
        'flex items-center h-10 cursor-pointer transition-colors',
        isActive && 'bg-[rgba(41,107,239,0.05)]',
        isHovered && !isActive && 'bg-[rgba(49,50,51,0.05)]',
      )}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* 人群名称 */}
      <div className="w-[216px] flex-none px-6 py-3 flex items-center">
        <span
          className={clsx(
            'text-sm truncate',
            isActive ? 'text-black-12' : 'text-[#626366]',
          )}
        >
          {item.name}
        </span>
      </div>

      {/* 条形图区域 */}
      <div className="flex-1 pr-10 py-2.5 relative">
        <div className="h-4 relative">
          {/* 品牌柱 */}
          <div
            className="absolute top-0 left-0 h-4 bg-blue-5 rounded-r-[1px]"
            style={{ width: `${barWidthPct}%` }}
          />
          {/* 基准线 */}
          <div
            className="absolute top-0 h-4 w-0.5 bg-blue-6"
            style={{ left: `${markerLeftPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── 主组件 ────────────────────────────────────────────

const PenetrationAnalysisDemo = () => {
  const [activeCrowdIdx, setActiveCrowdIdx] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const activeCrowd = CROWD_DATA[activeCrowdIdx];

  return (
    <div className="rounded-xl bg-[#f2f5fa] p-6">
      <Card
        elevation={0}
        className="w-full overflow-hidden [--odn-card-radius:12px]"
      >
        <Card.Header
          title={
            <div className="flex items-center gap-1">
              <span className="text-[length:var(--odn-font-size-headline-5)] font-semibold text-black-12">
                推荐人群
              </span>
              <button
                type="button"
                className="flex items-center gap-1 rounded-[4px] bg-[rgba(49,50,51,0.05)] px-2 py-1"
              >
                <span className="text-[length:var(--odn-font-size-headline-5)] font-semibold text-black-12">
                  渗透分析
                </span>
                <Icon name="chevron-down" size={14} className="text-black-9" />
              </button>
            </div>
          }
          className="h-16 border-b border-black-5"
          style={{ '--odn-card-title-font-size': '16px' } as React.CSSProperties}
        />

        {/* 主体内容 */}
        <div className="flex" style={{ height: 562 }}>
          {/* 左侧：子弹图 */}
          <div className="flex-1 border-r border-black-5 flex flex-col overflow-hidden relative">
            {/* 图表标题区 */}
            <div className="px-6 pt-5 pb-0 flex flex-col gap-4">
              {/* 动态标题 */}
              <div className="flex items-center gap-1 text-sm font-semibold whitespace-nowrap">
                <span className="text-black-12">本 SPU</span>
                <span className="text-black-9">在各</span>
                <span className="text-black-12">推荐人群</span>
                <span className="text-black-9">的</span>
                <span className="text-black-12">渗透率</span>
              </div>

              <div className="h-px bg-[#ebebeb]" />

              {/* 图例 + 搜索 */}
              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 h-3">
                    <span className="w-2 h-2 rounded-[1px] bg-blue-5 flex-none" />
                    <span className="text-xs text-[#626366] leading-3">本品牌 SPU</span>
                  </div>
                  <div className="flex items-center gap-2 h-3">
                    <span className="w-0.5 h-2 bg-blue-6 flex-none" />
                    <span className="text-xs text-[#626366] leading-3">同类目 TOP5 商品均值</span>
                  </div>
                </div>
                <Icon name="search" size={16} className="text-black-9 cursor-pointer" />
              </div>
            </div>

            {/* 子弹图行列表 */}
            <div className="flex-1 relative">
              {CROWD_DATA.map((item, i) => (
                <BulletRow
                  key={item.name}
                  item={item}
                  isActive={activeCrowdIdx === i}
                  isHovered={hoveredIdx === i}
                  onHover={(h) => {
                    setHoveredIdx(h ? i : null);
                    if (h) setActiveCrowdIdx(i);
                  }}
                />
              ))}

              {/* X 轴 */}
              <div className="absolute bottom-0 left-[216px] right-10 flex justify-between">
                {['0', '5%', '10%', '15%', '20%'].map((label) => (
                  <span key={label} className="text-xs text-[rgba(0,0,0,0.4)] leading-8">{label}</span>
                ))}
              </div>

              {/* Hover Tooltip */}
              {hoveredIdx !== null && (
                <CrowdTooltip
                  item={CROWD_DATA[hoveredIdx]}
                  style={{
                    left: 640,
                    top: hoveredIdx * 40 + 8,
                  }}
                />
              )}
            </div>
          </div>

          {/* 右侧：排名榜 */}
          <div className="flex-1 flex flex-col">
            <div className="border-b border-black-5">
              <RankingList
                title={{ scope: '本品牌', crowd: activeCrowd.name }}
                items={BRAND_RANKING}
                activeCrowd={activeCrowd.name}
              />
            </div>
            <RankingList
              title={{ scope: '本行业', crowd: activeCrowd.name }}
              items={INDUSTRY_RANKING}
              activeCrowd={activeCrowd.name}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PenetrationAnalysisDemo;
