'use client';

import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore - react-d3-cloud 没有类型定义
import WordCloud from 'react-d3-cloud';

export interface WordCloudItem {
  /** 关键词文本 */
  text: string;
  /** 权重值（用于排序和显示） */
  value: number;
}

export type WordCloudColorScheme = 'positive' | 'negative' | Record<number, string>;

export interface WordCloudSectionProps {
  /** 词云数据 */
  data: WordCloudItem[];
  /** 高度（默认 260px） */
  height?: number;
  /** 色板方案。'positive'/'negative' 是内置方案，或传入自定义 tier→颜色映射 */
  colorScheme?: WordCloudColorScheme;
  /** 最多显示多少词（默认 40） */
  maxWords?: number;
  /** 附加 className */
  className?: string;
}

// ═══ Tier 分级（权重越高 tier 越低） ════════════════════════════
function getWordTier(index: number) {
  if (index === 0) return 1;
  if (index <= 3) return 2;
  if (index <= 8) return 3;
  if (index <= 15) return 4;
  if (index <= 24) return 5;
  return 6;
}

const TIER_SIZES: Record<number, number> = {
  1: 40,
  2: 32,
  3: 24,
  4: 16,
  5: 14,
  6: 12,
};

const TIER_WEIGHTS: Record<number, number> = {
  1: 600,
  2: 600,
  3: 400,
  4: 400,
  5: 400,
  6: 400,
};

const TIER_COLORS_POS: Record<number, string> = {
  1: '#296BEF',
  2: '#6997F4',
  3: '#33D2CB',
  4: '#FCB04C',
  5: '#8B8DFB',
  6: '#BABCC1',
};

const TIER_COLORS_NEG: Record<number, string> = {
  1: '#E63D2E',
  2: '#FF7875',
  3: '#FFA39E',
  4: '#FCB04C',
  5: '#8B8DFB',
  6: '#BABCC1',
};

/**
 * 通用词云段落（L2 区块）
 *
 * 以文字权重可视化一组关键词。出现在 mind / content-asset / outside 等洞察页。
 *
 * 与 `mindshare-dictionary` 的区别：
 *   - 本区块是通用词云段落，只有词云本身
 *   - `mindshare-dictionary` 是结构化的"热词榜 + 多层词云"组合，品牌心智专属
 */
export const WordCloudSection: React.FC<WordCloudSectionProps> = ({
  data,
  height = 260,
  colorScheme = 'positive',
  maxWords = 40,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(500);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(Math.max(300, entry.contentRect.width - 16));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!data.length) {
    return (
      <div className="py-20 text-center text-sm text-black-9">无数据</div>
    );
  }

  const sorted = [...data].sort((a, b) => b.value - a.value);
  const cloudData = sorted.slice(0, maxWords);

  const tierColors =
    typeof colorScheme === 'string'
      ? colorScheme === 'negative'
        ? TIER_COLORS_NEG
        : TIER_COLORS_POS
      : colorScheme;

  return (
    <div
      ref={containerRef}
      className={
        className ??
        `w-full rounded-md overflow-hidden`
      }
      style={{ height }}
    >
      <WordCloud
        data={cloudData}
        width={containerWidth}
        height={height - 10}
        font="PingFang SC"
        fontStyle="normal"
        fontWeight={(d: any) => {
          const idx = sorted.findIndex((w) => w.text === d.text);
          return TIER_WEIGHTS[getWordTier(idx === -1 ? 99 : idx)];
        }}
        fontSize={(word: any) => {
          const idx = sorted.findIndex((w) => w.text === word.text);
          return TIER_SIZES[getWordTier(idx === -1 ? 99 : idx)];
        }}
        spiral="archimedean"
        rotate={0}
        padding={2}
        random={() => 0.5}
        fill={(d: any) => {
          const idx = sorted.findIndex((w) => w.text === d.text);
          return tierColors[getWordTier(idx === -1 ? 99 : idx)];
        }}
      />
    </div>
  );
};

// ═══ Demo ═══════════════════════════════════════════════════════

const DEMO_DATA: WordCloudItem[] = [
  { text: '人工智能', value: 980 },
  { text: '云计算', value: 820 },
  { text: '大数据', value: 760 },
  { text: '区块链', value: 640 },
  { text: '机器学习', value: 560 },
  { text: '深度学习', value: 480 },
  { text: '神经网络', value: 420 },
  { text: '智能家居', value: 380 },
  { text: '自动驾驶', value: 340 },
  { text: '元宇宙', value: 310 },
  { text: '物联网', value: 280 },
  { text: '虚拟现实', value: 260 },
  { text: '增强现实', value: 240 },
  { text: '5G', value: 220 },
  { text: '边缘计算', value: 200 },
  { text: '分布式系统', value: 185 },
  { text: 'GPT', value: 170 },
  { text: '数字孪生', value: 160 },
  { text: '量子计算', value: 150 },
  { text: '脑机接口', value: 140 },
  { text: '芯片制造', value: 130 },
  { text: '开源生态', value: 120 },
  { text: '云原生', value: 115 },
  { text: '微服务', value: 110 },
  { text: '容器化', value: 105 },
];

const WordCloudSectionDemo = () => {
  return (
    <div className="p-4 bg-black-1 space-y-4">
      <div>
        <div className="mb-2 text-sm text-black-10">positive 色板（默认）</div>
        <div className="bg-white rounded-md">
          <WordCloudSection data={DEMO_DATA} />
        </div>
      </div>
      <div>
        <div className="mb-2 text-sm text-black-10">negative 色板</div>
        <div className="bg-white rounded-md">
          <WordCloudSection data={DEMO_DATA} colorScheme="negative" />
        </div>
      </div>
    </div>
  );
};

export default WordCloudSectionDemo;
