'use client';

import { Icon } from 'one-design-next';
import React from 'react';

export type CrowdPickCard = {
  /** 人群名称 */
  name: string;
  /** 人群描述 */
  desc: string;
  /** 热度等级（火苗数量）1-3 */
  heat: number;
  /** 覆盖人数（已格式化字符串） */
  coverage: string;
  /** R3 流入率（已格式化字符串） */
  r3Rate: string;
  /** 人群渗透率（已格式化字符串） */
  penetration: string;
  /** 使用频次（已格式化字符串） */
  frequency: string;
  /** 最后更新时间 */
  updatedAt: string;
};

export interface CrowdPickCardGridProps {
  /** 卡片数据 */
  cards: CrowdPickCard[];
  /** 卡片点击回调 */
  onCardClick?: (card: CrowdPickCard) => void;
  /** 对比链接点击回调 */
  onCompareClick?: (card: CrowdPickCard, e: React.MouseEvent) => void;
  /** 指标列配置（默认覆盖人数/R3流入率/人群渗透率/使用频次） */
  metricKeys?: Array<{
    label: string;
    key: keyof CrowdPickCard;
  }>;
  /** 栅格列数（默认 4） */
  columns?: 2 | 3 | 4;
  /** 附加 className */
  className?: string;
}

const DEFAULT_METRIC_KEYS: Array<{ label: string; key: keyof CrowdPickCard }> = [
  { label: '覆盖人数', key: 'coverage' },
  { label: 'R3流入率', key: 'r3Rate' },
  { label: '人群渗透率', key: 'penetration' },
  { label: '使用频次', key: 'frequency' },
];

const COLUMN_CLASS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

/**
 * 人群精选卡片网格（L2 区块）
 *
 * 在"从候选池挑选人群走下一步"的场景下复用。
 * 出现页面：行业优选 / 兴趣精选 / 主题甄选 等人群策略推荐页。
 *
 * 外层的 Tab / 分类筛选 / 搜索 / 分页由使用方自行编排。
 */
export const CrowdPickCardGrid: React.FC<CrowdPickCardGridProps> = ({
  cards,
  onCardClick,
  onCompareClick,
  metricKeys = DEFAULT_METRIC_KEYS,
  columns = 4,
  className,
}) => {
  return (
    <div
      className={`grid ${COLUMN_CLASS[columns]} gap-4${
        className ? ` ${className}` : ''
      }`}
    >
      {cards.map((card) => (
        <div
          key={card.name}
          className="w-full p-4 border border-black-6 rounded-xl cursor-pointer hover:bg-black-1 active:bg-black-2"
          onClick={() => onCardClick?.(card)}
        >
          <div className="flex items-center pb-1">
            <div className="text-sm flex-1 font-semibold min-w-0 text-ellipsis overflow-hidden whitespace-nowrap">
              {card.name}
            </div>
            <div
              className="flex-none ml-2 text-xs text-blue-6"
              onClick={(e) => {
                e.stopPropagation();
                onCompareClick?.(card, e);
              }}
            >
              对比
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center flex-none gap-0.5 mr-2">
              {Array.from({ length: card.heat }).map((_, i) => (
                <Icon
                  key={i}
                  size={14}
                  name="flame"
                  color="var(--odn-color-orange-6)"
                />
              ))}
            </div>
            <div className="flex-1 min-w-0 text-ellipsis overflow-hidden whitespace-nowrap text-xs text-black-10">
              {card.desc}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-x-4 gap-y-1.5 text-xs text-black-11 my-2">
            {metricKeys.map(({ label, key }) => (
              <div key={label} className="min-w-0">
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-black-9">
                  {label}
                </div>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {card[key]}
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-black-9">
            最后更新时间：{card.updatedAt}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Demo 数据（用于 dumi <code src> 预览） ────────────────────────────────

const DEMO_CARDS: CrowdPickCard[] = [
  {
    name: '萌娃家庭用车人群',
    desc: '对家庭场景用车感兴趣的人群',
    heat: 2,
    coverage: '6,952 万',
    r3Rate: '0.68%',
    penetration: '1.18%',
    frequency: '9,066',
    updatedAt: '2025-07-31',
  },
  {
    name: '电商大促人群',
    desc: '对电商促销有高度响应的人群',
    heat: 3,
    coverage: '11,152 万',
    r3Rate: '0.89%',
    penetration: '1.49%',
    frequency: '5,258',
    updatedAt: '2025-07-31',
  },
  {
    name: '居家烹饪爱好者',
    desc: '对烹饪食材有高意向的人群',
    heat: 1,
    coverage: '34,718 万',
    r3Rate: '1.02%',
    penetration: '1.15%',
    frequency: '525',
    updatedAt: '2025-10-13',
  },
  {
    name: '运动户外商品兴趣人群',
    desc: '对户外运动装备感兴趣的人群',
    heat: 2,
    coverage: '47,973 万',
    r3Rate: '0.77%',
    penetration: '0.94%',
    frequency: '2,753',
    updatedAt: '2025-07-31',
  },
  {
    name: '春运人群',
    desc: '春运期间有出行需求的人群',
    heat: 1,
    coverage: '63,193 万',
    r3Rate: '0.73%',
    penetration: '0.90%',
    frequency: '1,193',
    updatedAt: '2025-07-31',
  },
  {
    name: '豪华车潜客人群',
    desc: '对豪华车品牌有高度意向的人群',
    heat: 2,
    coverage: '37,552 万',
    r3Rate: '0.60%',
    penetration: '0.92%',
    frequency: '3,262',
    updatedAt: '2025-07-31',
  },
  {
    name: '新能源先锋人群',
    desc: '对新能源汽车品牌有高度关注',
    heat: 3,
    coverage: '11,829 万',
    r3Rate: '0.63%',
    penetration: '1.06%',
    frequency: '4,146',
    updatedAt: '2025-07-31',
  },
  {
    name: '数码科技发烧友',
    desc: '对数码新品有强烈尝鲜意愿',
    heat: 3,
    coverage: '22,186 万',
    r3Rate: '1.56%',
    penetration: '2.01%',
    frequency: '6,783',
    updatedAt: '2025-08-18',
  },
];

const CrowdPickCardGridDemo = () => {
  return <CrowdPickCardGrid cards={DEMO_CARDS} />;
};

export default CrowdPickCardGridDemo;
