'use client';

import clsx from 'clsx';
import { HoverFill, Icon } from 'one-design-next';
import { Card } from 'one-design-next';
import React, { useState } from 'react';

/** 文档站里原为 dumi CodeBox；模板内用普通容器 */
function DemoBox({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}

// ─── 统一数据类型 ────────────────────────────────────────────

interface RankItem {
  rank: number;
  name: string;
  /** 排名变动值，正数=上升、负数=下降、0 或 undefined=不显示 */
  change?: number;
  /** 是否为当前 SPU（高亮置顶行） */
  isSelf?: boolean;
}

// ─── 趋势标记风格 ────────────────────────────────────────────
// 通过 variant 切换：
//   'text'  → 文本箭头 ↑/↓ + green-6/red-6（来自 metric-card-group）
//   'icon'  → Icon 箭头组件 + green-7/red-7（来自 penetration-analysis）

type TrendVariant = 'text' | 'icon';

function TrendBadge({ change, variant = 'text' }: { change?: number; variant?: TrendVariant }) {
  if (!change) return null;
  const isUp = change > 0;

  if (variant === 'icon') {
    return (
      <span className={clsx('inline-flex items-center flex-none', isUp ? 'text-green-7' : 'text-red-7')}>
        <Icon name={isUp ? 'arrow-up' : 'arrow-down'} size={16} />
        <span className="text-sm tabular-nums">{Math.abs(change)}</span>
      </span>
    );
  }

  // variant === 'text'
  return (
    <span
      className={clsx(
        'shrink-0 text-[length:var(--odn-font-size-comment)] tabular-nums font-medium',
        isUp ? 'text-green-6' : 'text-red-6',
      )}
    >
      {isUp ? '↑' : '↓'} {Math.abs(change)}
    </span>
  );
}

// ─── 统一单列排名组件 ────────────────────────────────────────

interface SingleRankingListProps {
  title: React.ReactNode;
  items: RankItem[];
  /** 趋势标记风格：'text' = 文本箭头 ↑/↓ | 'icon' = Icon 箭头 */
  trendVariant?: TrendVariant;
  /** 是否启用 HoverFill 行交互（资产排名风格启用，渗透率风格不启用） */
  hoverable?: boolean;
}

function SingleRankingList({
  title,
  items,
  trendVariant = 'text',
  hoverable = true,
}: SingleRankingListProps) {
  const selfItem = items.find((i) => i.isSelf);
  const otherItems = items.filter((i) => !i.isSelf);

  const Row = ({ item, isSelf }: { item: RankItem; isSelf?: boolean }) => {
    const content = (
      <div className="flex items-center p-2">
        <span
          className={clsx(
            'w-6 shrink-0 text-sm tabular-nums',
            isSelf ? 'text-black-10' : 'text-black-8',
          )}
        >
          {item.rank}
        </span>
        <span
          className={clsx(
            'min-w-0 flex-1 truncate text-[13px]',
            isSelf ? 'text-black-12' : 'text-black-9',
          )}
        >
          {item.name}
        </span>
        <TrendBadge change={item.change} variant={trendVariant} />
      </div>
    );

    if (hoverable) {
      return (
        <HoverFill className="-mx-2" bgClassName="rounded-lg">
          {content}
        </HoverFill>
      );
    }
    return <div className="-mx-2">{content}</div>;
  };

  return (
    <div className="px-6 pt-5 pb-4">
      <div className="mb-3 text-[length:var(--odn-font-size-text-sm)]">{title}</div>
      {selfItem && (
        <>
          <Row item={selfItem} isSelf />
          <div className="my-2 h-px bg-black-4" />
        </>
      )}
      {otherItems.map((item) => (
        <Row key={item.rank} item={item} />
      ))}
    </div>
  );
}

// ─── 标题构建工具 ────────────────────────────────────────────
// 静态标题：{scope} 同类目 SPU 的 {榜单类型}
// 动态标题：{scope} 同类目 SPU 在 {人群名} 的 {榜单类型}

function buildTitle(scope: string, dimensionLabel: string, activeCrowd?: string) {
  return (
    <div className="flex items-center gap-1 font-semibold text-black-12 whitespace-nowrap">
      <span>{scope}</span>
      <span>同类目 SPU</span>
      {activeCrowd && (
        <>
          <span className="text-black-9">在</span>
          <span>{activeCrowd}</span>
        </>
      )}
      <span className="text-black-9">的</span>
      <span>{dimensionLabel}</span>
    </div>
  );
}

// ─── Mock 数据 ────────────────────────────────────────────

const BRAND_RANK: RankItem[] = [
  { rank: 3, name: '香奈儿/Chanel智慧紧肤提拉乳霜', change: 2, isSelf: true },
  { rank: 1, name: '香奈儿/Chanel智慧紧肤精华乳霜', change: 1 },
  { rank: 2, name: '香奈儿/Chanel一号红山茶花乳霜补充装', change: -1 },
  { rank: 4, name: '香奈儿/Chanel一号红山茶花乳霜' },
  { rank: 5, name: '香奈儿/Chanel奢华精萃密集焕白乳霜', change: -2 },
];

const INDUSTRY_RANK: RankItem[] = [
  { rank: 8, name: '香奈儿/Chanel智慧紧肤提拉乳霜', change: -2, isSelf: true },
  { rank: 1, name: '普拉达/PRADA焕颜面霜', change: 4 },
  { rank: 2, name: '雅诗兰黛/EsteeLauder白金级蕴能黑钻光琉面霜', change: -3 },
  { rank: 3, name: '资生堂/SHISEIDO光透耀白凝霜', change: 2 },
  { rank: 4, name: '悦诗风吟/INNISFREE胶原多肽绿茶神经酰胺塑弹霜', change: -4 },
];

// ─── 配置项 ────────────────────────────────────────────────

const TREND_VARIANTS: { key: TrendVariant; label: string }[] = [
  { key: 'text', label: '文本箭头 ↑/↓' },
  { key: 'icon', label: 'Icon 箭头' },
];

// ─── 主组件 ────────────────────────────────────────────────

export default function DualRankingListBlock() {
  const [trendVariant, setTrendVariant] = useState<TrendVariant>('text');
  const [hoverable, setHoverable] = useState(true);

  return (
    <div className="flex flex-col gap-8">

      {/* ═══ 设置箱：风格切换 ═══ */}
      <DemoBox className="block p-6">
        <div className="mb-4 text-base font-semibold text-black-12">配置项</div>
        <div className="flex flex-col gap-3">
          {/* 趋势标记风格 */}
          <div className="flex items-center gap-3">
            <span className="w-24 text-sm text-black-10">趋势标记</span>
            <div className="flex gap-2">
              {TREND_VARIANTS.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  className={clsx(
                    'rounded-full px-3 py-1 text-sm transition-colors',
                    trendVariant === v.key
                      ? 'bg-blue-6 text-white'
                      : 'bg-black-2 text-black-10 hover:bg-black-3',
                  )}
                  onClick={() => setTrendVariant(v.key)}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          {/* HoverFill 开关 */}
          <div className="flex items-center gap-3">
            <span className="w-24 text-sm text-black-10">行悬浮交互</span>
            <div className="flex gap-2">
              {[
                { key: true, label: '开启 HoverFill' },
                { key: false, label: '关闭' },
              ].map((opt) => (
                <button
                  key={String(opt.key)}
                  type="button"
                  className={clsx(
                    'rounded-full px-3 py-1 text-sm transition-colors',
                    hoverable === opt.key
                      ? 'bg-blue-6 text-white'
                      : 'bg-black-2 text-black-10 hover:bg-black-3',
                  )}
                  onClick={() => setHoverable(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DemoBox>

      {/* ═══ 变体 1：左右排布（品牌 | 行业 并排，竖向分割线） ═══ */}
      <DemoBox className="block p-6">
        <div className="mb-4 text-base font-semibold text-black-12">
          变体 1 · 左右排布
        </div>
        <div className="mb-2 text-sm text-black-9">
          品牌与行业并排对比，竖向分割线。来自「资产概览」卡片底部排名。
        </div>
        <Card
          elevation={0}
          className="w-full overflow-hidden border border-solid border-black-4 [--odn-card-radius:12px]"
        >
          <div className="flex">
            <div className="min-w-0 flex-1 border-r border-solid border-black-4">
              <SingleRankingList
                title={buildTitle('本品牌', '人群总资产榜')}
                items={BRAND_RANK}
                trendVariant={trendVariant}
                hoverable={hoverable}
              />
            </div>
            <div className="min-w-0 flex-1">
              <SingleRankingList
                title={buildTitle('本行业', '人群总资产榜')}
                items={INDUSTRY_RANK}
                trendVariant={trendVariant}
                hoverable={hoverable}
              />
            </div>
          </div>
        </Card>
      </DemoBox>

      {/* ═══ 变体 2：上下排布（品牌在上、行业在下，横向分割线） ═══ */}
      <DemoBox className="block p-6">
        <div className="mb-4 text-base font-semibold text-black-12">
          变体 2 · 上下排布
        </div>
        <div className="mb-2 text-sm text-black-9">
          品牌在上、行业在下，横向分割线分隔。来自「渗透分析」面板右侧排名。
        </div>
        <Card
          elevation={0}
          className="w-full overflow-hidden border border-solid border-black-4 [--odn-card-radius:12px]"
        >
          <div className="flex flex-col">
            <div className="border-b border-solid border-black-4">
              <SingleRankingList
                title={buildTitle('本品牌', '渗透率榜', '奢美核心人群')}
                items={BRAND_RANK}
                trendVariant={trendVariant}
                hoverable={hoverable}
              />
            </div>
            <SingleRankingList
              title={buildTitle('本行业', '渗透率榜', '奢美核心人群')}
              items={INDUSTRY_RANK}
              trendVariant={trendVariant}
              hoverable={hoverable}
            />
          </div>
        </Card>
      </DemoBox>
    </div>
  );
}

// ─── 排名榜设计规律总结 ────────────────────────────────────────
//
// 从 metric-card-group 和 penetration-analysis 中提炼出的排名榜共性规律：
//
// 【统一组件 SingleRankingList】
// 通过 props 配置切换两种风格，而非维护两套组件：
//   - trendVariant: 'text' | 'icon'  → 切换趋势标记风格
//   - hoverable: boolean             → 切换是否启用 HoverFill 行交互
//
// 【布局变体（按排布方式分类）】
// 1. 左右排布：品牌 | 行业 并排，竖向分割线（border-r），flex 方向水平
//    - 场景：资产概览卡片底部排名
// 2. 上下排布：品牌在上、行业在下，横向分割线（border-b），flex 方向垂直
//    - 场景：渗透分析面板右侧排名
//
// 【行结构规律】
// - 排名序号：w-6 固定宽度 tabular-nums
// - 名称：flex-1 min-w-0 truncate 截断
// - 趋势标记：右对齐 shrink-0 / flex-none
// - 当前 SPU（isSelf）：置顶 + 分割线分隔
//
// 【标题公式】
// 静态：{scope} + 同类目 SPU + 的 + {榜单类型}
// 动态：{scope} + 同类目 SPU + 在 + {人群名} + 的 + {榜单类型}
// 关键词 text-black-12 高亮，助词「的」「在」text-black-9 弱化
//
// 【趋势标记变体】
// - text：文本 ↑/↓ + green-6/red-6，change === 0 或 undefined 隐藏
// - icon：Icon 箭头 + green-7/red-7，change undefined 隐藏
