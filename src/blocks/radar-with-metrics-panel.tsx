'use client';

import React from 'react';

export interface RadarMetricItem {
  /** 指标名 */
  label: string;
  /** 指标描述（hover tooltip） */
  description?: string;
  /** 本品数值（已格式化） */
  value: string;
  /** 对比参照值（已格式化） */
  compareValue?: string;
  /** 参照系名称 */
  referenceName?: string;
  /** 增长率（-100 ~ +∞，百分比值） */
  growth?: number;
  /** 本品排名 */
  rank?: number;
}

export interface RadarMetricColumn {
  /** 列标题 */
  title: string;
  /** 列内的指标列表 */
  items: RadarMetricItem[];
}

export interface RadarWithMetricsPanelProps {
  /** 左侧雷达图 slot（通常为 ECharts 雷达图实现） */
  radar: React.ReactNode;
  /** 左侧参照系名称 */
  referenceName?: string;
  /** 图例色（本品） */
  brandColor?: string;
  /** 图例色（参照系） */
  referenceColor?: string;
  /** 右侧指标列（2-3 列） */
  metrics: RadarMetricColumn[];
  /** 附加 className */
  className?: string;
}

function renderGrowth(growth?: number) {
  if (growth === undefined || growth === null) return null;
  if (growth === 0)
    return <span className="text-[#898b8f]">持平</span>;
  const isUp = growth > 0;
  return (
    <span className={isUp ? 'text-[#07C160]' : 'text-[#E63D2E]'}>
      {isUp ? '↑' : '↓'}
      {Math.abs(growth).toFixed(1)}%
    </span>
  );
}

/**
 * 雷达 + 指标列布局（L2 区块）
 *
 * 本品牌在某个维度上与参照系的多维对比。
 * 左侧雷达对比图（本品 vs 参照系）+ 图例 + 右侧 2-3 列指标卡。
 *
 * 出现页面：content-asset（域内传播）/ outside（域外扩散）。
 * 两个页面结构几乎相同，区别仅在参照系和指标名称。
 */
export const RadarWithMetricsPanel: React.FC<RadarWithMetricsPanelProps> = ({
  radar,
  referenceName = '行业均值',
  brandColor = '#296BEF',
  referenceColor = '#07C160',
  metrics,
  className,
}) => {
  return (
    <div
      className={
        className ??
        'flex gap-6 rounded-xl border border-[#e2e5ea] bg-white p-6'
      }
    >
      {/* 左：雷达图 + 图例 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-end gap-4 pb-2">
          <div className="flex items-center gap-1.5 text-xs text-[#0d0d0d]">
            <span
              className="inline-block w-2.5 h-0.5 rounded"
              style={{ backgroundColor: brandColor }}
            />
            本品
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#0d0d0d]">
            <span
              className="inline-block w-2.5 h-0.5 rounded"
              style={{ backgroundColor: referenceColor }}
            />
            {referenceName}
          </div>
        </div>
        <div className="flex justify-center pt-6">{radar}</div>
      </div>

      {/* 右：指标列 */}
      <div className="flex-[2] min-w-0">
        <div className="flex pt-5 pl-6 gap-6">
          {metrics.map((col, ci) => (
            <div key={ci} className="flex-1">
              <div className="text-[#0d0d0d] font-semibold text-[14px] mb-5">
                {col.title}
              </div>
              {col.items.map((item) => (
                <div key={item.label} className="mb-6">
                  <span
                    className="text-sm text-[#0d0d0d] underline decoration-dashed underline-offset-4 decoration-[#c0c0c0] cursor-help"
                    title={item.description}
                  >
                    {item.label}
                  </span>
                  <div className="mb-1 mt-1">
                    <span className="tabular-nums text-[#0d0d0d] font-semibold text-[24px] mr-2">
                      {item.value}
                    </span>
                  </div>
                  {item.compareValue !== undefined && (
                    <div className="text-[#898b8f] text-[12px] mb-1">
                      比{item.referenceName ?? referenceName}{' '}
                      <span>{item.compareValue}</span> {renderGrowth(item.growth)}
                    </div>
                  )}
                  {item.rank !== undefined && (
                    <div className="text-[#898b8f] text-[12px]">
                      本品排名 <span>{item.rank}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══ Demo ═══════════════════════════════════════════════════════

const DEMO_METRICS: RadarMetricColumn[] = [
  {
    title: '曝光表现',
    items: [
      {
        label: '曝光人数',
        description: '广告曝光覆盖的人数',
        value: '3.49 亿',
        compareValue: '2.87 亿',
        growth: 21.6,
        rank: 3,
      },
      {
        label: '触达频次',
        description: '人均广告曝光次数',
        value: '4.2 次',
        compareValue: '3.8 次',
        growth: 10.5,
        rank: 5,
      },
    ],
  },
  {
    title: '互动表现',
    items: [
      {
        label: '互动率',
        description: '互动行为人数 / 曝光人数',
        value: '3.25%',
        compareValue: '2.91%',
        growth: 11.7,
        rank: 2,
      },
      {
        label: '深度浏览率',
        description: '深度浏览人数 / 曝光人数',
        value: '1.48%',
        compareValue: '1.32%',
        growth: 12.1,
        rank: 4,
      },
    ],
  },
  {
    title: '转化表现',
    items: [
      {
        label: '转化率',
        description: '转化人数 / 曝光人数',
        value: '0.048%',
        compareValue: '0.032%',
        growth: 50.0,
        rank: 1,
      },
    ],
  },
];

const DemoRadar = () => (
  <div className="w-[320px] h-[320px] flex items-center justify-center rounded-full border-2 border-dashed border-[#c0c0c0] text-[#898b8f] text-sm">
    （雷达图 slot — 使用方接入 ECharts Radar）
  </div>
);

const RadarWithMetricsPanelDemo = () => {
  return (
    <RadarWithMetricsPanel
      radar={<DemoRadar />}
      referenceName="行业均值"
      metrics={DEMO_METRICS}
    />
  );
};

export default RadarWithMetricsPanelDemo;
