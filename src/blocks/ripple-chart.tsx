'use client';

import clsx from 'clsx';
import {
  Button,
  Card,
  Icon,
  Select,
  Tooltip,
} from 'one-design-next';
import React, { useEffect, useMemo, useRef, useState } from 'react';

// ─── 数据类型 ────────────────────────────────────────────

type ViewMode = 'chart' | 'list';

type AudienceItem = {
  name: string;
  size: number;
  similarity: number;
  penetration: number;
  deliveryCount: number;
  insightCount: number;
  tags: string[];
  starred: boolean;
};

type LayoutNode = AudienceItem & {
  x: number;
  y: number;
  side: 1 | -1;
  dotSize: number;
  dotColor: string;
  dotOpacity: number;
};

type ColorMode = 'single' | 'multi';
type SimMapMode = 'rank' | 'value';

// ─── 工具函数 ────────────────────────────────────────────

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hexToRgb(hex: string) {
  const v = hex.replace('#', '');
  const n = parseInt(v, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mixHex(c1: string, c2: string, t: number) {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  return `rgb(${Math.round(lerp(a.r, b.r, t))}, ${Math.round(lerp(a.g, b.g, t))}, ${Math.round(lerp(a.b, b.b, t))})`;
}

function formatWan(v: number) {
  return `${Math.round(v / 10000).toLocaleString('zh-CN')}万`;
}

function hashUnit(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h << 5) - h + text.charCodeAt(i);
    h |= 0;
  }
  return (Math.abs(h) % 1000) / 1000;
}

// ─── Mock 数据 ────────────────────────────────────────────

const CROWD_NAMES = [
  '口香糖兴趣人群', '美妆男性向产品人群', '足球周边兴趣人群', '马拉松参与人群',
  '西式快餐兴趣人群', '滑雪兴趣人群', '城市精英车主', '游戏硬核玩家',
  '美妆功效成分党', '美妆熟龄向产品人群', '网球核心人群', '孕期品质人群',
  '自驾游爱好者', '耳机核心人群', '黄金饰品兴趣人群', '眼镜产品兴趣人群',
  '时尚潮流人群', '出境游探旅人群', '高奢商务人群', '预测换机人群',
  '泛宠物人群', '母婴兴趣人群', '奢侈品核心人群', '香水核心人群',
  '白酒行业人群', '运动户外泛兴趣人群', '奢美核心人群', '熬夜人群',
  '美妆城市女性向产品人群', '瑜伽爱好者',
];

const TAG_POOL: string[][] = [
  ['热投', '热览', '最新'],
  ['热投', '热览'],
  ['热投', '最新'],
  ['热览', '最新'],
  ['热投'],
  ['热览'],
  ['最新'],
  [],
];

function generateAudiences(count: number): AudienceItem[] {
  const similarities = Array.from({ length: count }, (_, i) => {
    const t = count <= 1 ? 0 : i / (count - 1);
    const base = 0.98 - t * 0.78;
    return Number(clamp(base + (hashUnit(CROWD_NAMES[i % CROWD_NAMES.length]) - 0.5) * 0.03, 0.2, 0.98).toFixed(4));
  });
  return Array.from({ length: count }, (_, i) => {
    const h = hashUnit(CROWD_NAMES[i % CROWD_NAMES.length]);
    return {
      name: CROWD_NAMES[i % CROWD_NAMES.length],
      size: Math.round(3_000_000 + hashUnit(CROWD_NAMES[i % CROWD_NAMES.length] + 's') * 57_000_000),
      similarity: similarities[i],
      penetration: Number((0.02 + hashUnit(CROWD_NAMES[i % CROWD_NAMES.length] + 'p') * 0.9).toFixed(4)),
      deliveryCount: Math.round(1000 + h * 8000),
      insightCount: Math.round(1000 + hashUnit(CROWD_NAMES[i % CROWD_NAMES.length] + 'i') * 8000),
      tags: [...TAG_POOL[i % TAG_POOL.length], '行业名称'],
      starred: i % 3 === 1,
    };
  });
}

// ─── 布局算法 ────────────────────────────────────────────

function computeLayout(
  audiences: AudienceItem[],
  config: { dotMax: number; distanceSpread: number; simMapMode: SimMapMode; colorMode: ColorMode; alphaMin: number; colorHigh: string; colorLow: string },
  canvasW: number,
  canvasH: number,
): LayoutNode[] {
  const DOT_MIN = 16;
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const minRadius = 120;
  const maxRadius = clamp(canvasW * 0.4, minRadius + 80, canvasW * 0.46);

  const sorted = [...audiences].sort((a, b) => b.similarity - a.similarity);
  const simRank = new Map(sorted.map((x, i) => [x, i]));
  const sims = audiences.map((x) => x.similarity);
  const minSim = Math.min(...sims);
  const maxSim = Math.max(...sims);
  const sizes = audiences.map((x) => x.size);
  const minSize = Math.min(...sizes);
  const maxSize = Math.max(...sizes);
  const pens = audiences.map((x) => x.penetration);
  const minPen = Math.min(...pens);
  const maxPen = Math.max(...pens);
  const topSim = maxSim > 0 ? maxSim : 1;

  const halfH = canvasH / 2 - 24;
  const angleExtent = clamp(Math.asin(clamp(halfH / maxRadius, 0.2, 0.98)) * (180 / Math.PI) - 3, 16, 34);

  const visuals = audiences.map((item) => {
    const rank = simRank.get(item) ?? 0;
    const rankNorm = audiences.length <= 1 ? 0 : rank / (audiences.length - 1);
    const valueNorm = maxSim === minSim ? 0 : 1 - (item.similarity - minSim) / (maxSim - minSim);
    const simNorm = config.simMapMode === 'rank' ? rankNorm : valueNorm;
    const spreadNorm = Math.pow(simNorm, config.distanceSpread);

    const sizeNorm = maxSize === minSize ? 0 : (item.size - minSize) / (maxSize - minSize);
    const dotSize = DOT_MIN + sizeNorm * (config.dotMax - DOT_MIN);

    const penNorm = maxPen === minPen ? 0 : (item.penetration - minPen) / (maxPen - minPen);
    let dotColor: string;
    let dotOpacity: number;

    if (config.colorMode === 'single') {
      dotColor = 'rgb(41, 107, 239)';
      const inversePenNorm = 1 - clamp(item.penetration / (maxPen || 1), 0, 1);
      dotOpacity = config.alphaMin + inversePenNorm * (1 - config.alphaMin);
    } else {
      dotColor = mixHex(config.colorLow, config.colorHigh, penNorm);
      const simOpacityNorm = clamp(item.similarity / topSim, 0, 1);
      dotOpacity = config.alphaMin + simOpacityNorm * (1 - config.alphaMin);
    }

    return { ...item, rankNorm: spreadNorm, dotSize, dotColor, dotOpacity };
  });

  const leftGroup: typeof visuals = [];
  const rightGroup: typeof visuals = [];
  const sortedForSlots = [...visuals].sort((a, b) => a.rankNorm - b.rankNorm);
  sortedForSlots.forEach((node, idx) => {
    (idx % 2 === 0 ? rightGroup : leftGroup).push(node);
  });

  function assignAngles(group: typeof visuals, startDeg: number, endDeg: number) {
    const start = (startDeg * Math.PI) / 180;
    const end = (endDeg * Math.PI) / 180;
    const step = group.length <= 1 ? 0 : (end - start) / (group.length - 1);
    group.forEach((node, idx) => {
      (node as any).anchorAngle = start + step * idx + (hashUnit(node.name) - 0.5) * 0.04;
    });
  }

  assignAngles(rightGroup, -angleExtent, angleExtent);
  assignAngles(leftGroup, 180 + angleExtent, 180 - angleExtent);

  const results: LayoutNode[] = [];
  const placedBounds: { left: number; right: number; top: number; bottom: number }[] = [];

  const order = [...visuals].sort((a, b) => b.dotSize - a.dotSize);

  order.forEach((node) => {
    const radius = minRadius + node.rankNorm * (maxRadius - minRadius);
    const baseAngle = (node as any).anchorAngle ?? 0;
    const angleStep = 0.025;
    const maxStep = 300;

    let bestX = cx + Math.cos(baseAngle) * radius;
    let bestY = cy + Math.sin(baseAngle) * radius;
    let bestOverlap = Infinity;

    for (let step = 0; step <= maxStep; step++) {
      const angles = step === 0 ? [baseAngle] : [baseAngle + step * angleStep, baseAngle - step * angleStep];
      for (const angle of angles) {
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        const labelW = node.name.length * 14 + 6 + node.dotSize;
        const halfH2 = Math.max(node.dotSize, 24) / 2;
        const side = x >= cx ? 1 : -1;
        const left = side < 0 ? x - labelW : x;
        const bounds = { left, right: left + labelW, top: y - halfH2, bottom: y + halfH2 };

        if (bounds.left < 8 || bounds.right > canvasW - 8 || bounds.top < 8 || bounds.bottom > canvasH - 8) continue;

        let overlap = 0;
        for (const pb of placedBounds) {
          const ox = Math.max(0, Math.min(bounds.right, pb.right) - Math.max(bounds.left, pb.left));
          const oy = Math.max(0, Math.min(bounds.bottom, pb.bottom) - Math.max(bounds.top, pb.top));
          overlap += ox * oy;
        }

        if (overlap < bestOverlap) {
          bestOverlap = overlap;
          bestX = x;
          bestY = y;
          if (overlap === 0) break;
        }
      }
      if (bestOverlap === 0) break;
    }

    const side: 1 | -1 = bestX >= cx ? 1 : -1;
    const labelW = node.name.length * 14 + 6 + node.dotSize;
    const halfH2 = Math.max(node.dotSize, 24) / 2;
    const bLeft = side < 0 ? bestX - labelW : bestX;
    placedBounds.push({ left: bLeft - 8, right: bLeft + labelW + 8, top: bestY - halfH2 - 8, bottom: bestY + halfH2 + 8 });

    results.push({
      ...node,
      x: bestX,
      y: bestY,
      side,
    });
  });

  return results;
}

// ─── 配置面板区块 ────────────────────────────────────────

function ConfigSlider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-black-10">{label}</span>
        <span className="text-xs tabular-nums text-black-12 font-medium">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-black-3 cursor-pointer accent-blue-6"
      />
    </div>
  );
}

// ─── Hover 弹窗 ────────────────────────────────────────

function NodePopover({ node, canvasW }: { node: LayoutNode; canvasW: number }) {
  const isRight = node.x > canvasW / 2;
  return (
    <div
      className="absolute z-20 bg-white rounded-[8px] border border-black-4 py-2.5 px-3 min-w-[240px] max-w-[300px] pointer-events-none"
      style={{
        left: isRight ? node.x - 260 : node.x + 20,
        top: node.y - 60,
        boxShadow: '0 8px 24px rgba(31,41,55,0.16)',
      }}
    >
      <div className="text-sm font-semibold text-black-12 mb-2">{node.name}</div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between text-[13px] text-black-10 leading-7">
          <span>人群规模</span>
          <span className="tabular-nums">{node.size.toLocaleString('zh-CN')}</span>
        </div>
        <div className="flex items-center justify-between text-[13px] text-black-10 leading-7">
          <span>人群相似度</span>
          <span className="tabular-nums">{(node.similarity * 100).toFixed(2)}%</span>
        </div>
        <div className="flex items-center justify-between text-[13px] text-black-10 leading-7">
          <span>人群渗透率</span>
          <span className="tabular-nums">{(node.penetration * 100).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── 列表视图 ────────────────────────────────────────

type SortKey = 'size' | 'similarity' | 'penetration' | 'deliveryCount' | 'insightCount';
type SortDir = 'asc' | 'desc';

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  '热投': { bg: 'var(--odn-color-orange-1)', text: 'var(--odn-color-orange-7)' },
  '热览': { bg: '#f5fbff', text: '#2190d9' },
  '最新': { bg: 'var(--odn-color-blue-1)', text: 'var(--odn-color-blue-7)' },
  '行业名称': { bg: 'var(--odn-color-black-2)', text: 'var(--odn-color-black-12)' },
};

function AudienceTag({ label }: { label: string }) {
  const color = TAG_COLORS[label] ?? TAG_COLORS['行业名称'];
  return (
    <span
      className="inline-flex items-center justify-center rounded px-[3px] pt-[2.5px] pb-[3.5px] text-[10px] leading-[10px]"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {label}
    </span>
  );
}

function SortIcon({ active }: { active: boolean; dir: SortDir }) {
  return (
    <span className="inline-flex flex-col items-center justify-center ml-0.5">
      <Icon name="unfold-filled" size={16} className={active ? 'text-blue-6' : 'text-black-8'} />
    </span>
  );
}

function ListView({
  audiences,
  seedSize,
}: {
  audiences: AudienceItem[];
  seedSize: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>('size');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [starredSet, setStarredSet] = useState<Set<number>>(
    () => new Set(audiences.map((a, i) => (a.starred ? i : -1)).filter((i) => i >= 0)),
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = useMemo(() => {
    const items = audiences.map((a, i) => ({ ...a, _idx: i }));
    items.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      return sortDir === 'desc' ? (bv as number) - (av as number) : (av as number) - (bv as number);
    });
    return items;
  }, [audiences, sortKey, sortDir]);

  const toggleStar = (idx: number) => {
    setStarredSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const COLUMNS: { key: SortKey; label: string; highlight?: boolean }[] = [
    { key: 'size', label: '覆盖量级', highlight: true },
    { key: 'similarity', label: '人群相似度' },
    { key: 'penetration', label: '人群渗透率' },
    { key: 'deliveryCount', label: '投放次数' },
    { key: 'insightCount', label: '洞察次数' },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: 'rgba(73,90,122,0.1)' }}>
            <th className="text-left px-6 py-4 font-semibold text-black-9 text-[14px] leading-[22px] whitespace-nowrap">
              推荐人群
            </th>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'text-right px-5 py-4 font-semibold text-[14px] leading-[22px] whitespace-nowrap cursor-pointer select-none',
                  sortKey === col.key && col.highlight ? 'text-blue-6' : 'text-black-9',
                )}
                onClick={() => toggleSort(col.key)}
              >
                <span className="inline-flex items-center gap-0.5 justify-end">
                  {col.label}
                  <SortIcon active={sortKey === col.key} dir={sortDir} />
                </span>
              </th>
            ))}
            <th className="text-left px-6 py-4 font-semibold text-black-9 text-[14px] leading-[22px] whitespace-nowrap w-[76px]">
              收藏
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item, rowIdx) => {
            const isEven = rowIdx % 2 === 1;
            return (
              <tr
                key={`${item.name}-${item._idx}`}
                className="border-b"
                style={{
                  borderColor: 'rgba(73,90,122,0.1)',
                  backgroundColor: isEven ? 'rgba(73,90,122,0.03)' : undefined,
                }}
              >
                <td className="px-6 py-[17px] whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-black-12 leading-[22px]">{item.name}</span>
                    <div className="flex items-center gap-1">
                      {item.tags.map((tag) => (
                        <AudienceTag key={tag} label={tag} />
                      ))}
                    </div>
                  </div>
                </td>
                <td
                  className="text-right px-5 py-[17px] whitespace-nowrap text-[14px] leading-[22px]"
                  style={{
                    background: isEven
                      ? 'linear-gradient(180deg, rgba(41,107,239,0.04) 0%, rgba(41,107,239,0.01) 100%)'
                      : 'linear-gradient(180deg, rgba(41,107,239,0.05) 0%, rgba(41,107,239,0.01) 100%)',
                  }}
                >
                  <span className="text-black-12">{Math.round(item.size / 10000).toLocaleString('zh-CN')}</span>
                  <span className="text-[13px] text-black-12">万</span>
                </td>
                <td className="text-right px-5 py-[17px] whitespace-nowrap text-[14px] text-black-12 leading-[22px]">
                  {(item.similarity * 100).toFixed(2)}%
                </td>
                <td className="text-right px-5 py-[17px] whitespace-nowrap text-[14px] text-black-12 leading-[22px]">
                  {(item.penetration * 100).toFixed(2)}%
                </td>
                <td className="text-right px-5 py-[17px] whitespace-nowrap text-[14px] text-black-12 leading-[22px] tabular-nums">
                  {item.deliveryCount.toLocaleString('zh-CN')}
                </td>
                <td className="text-right px-5 py-[17px] whitespace-nowrap text-[14px] text-black-12 leading-[22px] tabular-nums">
                  {item.insightCount.toLocaleString('zh-CN')}
                </td>
                <td className="pl-6 pr-3 py-[18px] w-[76px]">
                  <button
                    className="cursor-pointer bg-transparent border-none p-0"
                    onClick={() => toggleStar(item._idx)}
                  >
                    <Icon
                      name={starredSet.has(item._idx) ? 'star-filled' : 'star'}
                      size={20}
                      style={starredSet.has(item._idx) ? { color: '#e68300' } : undefined}
                    />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── 主组件 ────────────────────────────────────────────

const RippleChartBlock = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [crowdType, setCrowdType] = useState('r3');
  const [filterType, setFilterType] = useState('all');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const [dotMax, setDotMax] = useState(34);
  const [distanceSpread, setDistanceSpread] = useState(1.0);
  const [simMapMode, setSimMapMode] = useState<SimMapMode>('rank');
  const [colorMode, setColorMode] = useState<ColorMode>('single');
  const [alphaMin, setAlphaMin] = useState(0.15);
  const [colorHigh, setColorHigh] = useState('#296BEF');
  const [colorLow, setColorLow] = useState('#9448CE');
  const [canvasHeight, setCanvasHeight] = useState(320);
  const [audienceCount, setAudienceCount] = useState(20);
  const [dataVersion, setDataVersion] = useState(0);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(960);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setCanvasWidth(Math.round(w));
    });
    ro.observe(el);
    setCanvasWidth(Math.round(el.clientWidth));
    return () => ro.disconnect();
  }, []);

  const audiences = useMemo(
    () => generateAudiences(audienceCount),
    [audienceCount, dataVersion],
  );

  const layoutNodes = useMemo(
    () => computeLayout(audiences, { dotMax, distanceSpread, simMapMode, colorMode, alphaMin, colorHigh, colorLow }, canvasWidth, canvasHeight),
    [audiences, dotMax, distanceSpread, simMapMode, colorMode, alphaMin, colorHigh, colorLow, canvasWidth, canvasHeight],
  );

  const seedLabel = crowdType === 'r3' ? '品牌 R3 人群' : crowdType === 'r2' ? '品牌 R2 人群' : '品牌 R4 人群';

  return (
    <div className="flex flex-col gap-6">
      {/* ── 预览 ── */}
      <Card elevation={0} className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-black-3 px-3 py-3">
          <div className="flex items-center gap-2">
            <Select
              className="w-[120px]"
              style={{ '--odn-select-border-radius': '8px' } as React.CSSProperties}
              allowClear={false}
              value={crowdType}
              onChange={setCrowdType}
              options={[
                { label: '品牌 R3', value: 'r3' },
                { label: '品牌 R2', value: 'r2' },
                { label: '品牌 R4', value: 'r4' },
              ]}
            />
            <span className="text-base font-semibold text-black-12">的相似人群探索</span>
          </div>
          <div className="flex items-center gap-2">
            <Button light icon="download" iconPosition="left">下载数据</Button>
            <div className="flex items-center rounded-lg bg-black-1 p-[3px]">
              <button
                className={clsx('flex items-center justify-center rounded-md size-[30px] cursor-pointer', viewMode === 'list' ? 'bg-white' : '')}
                onClick={() => setViewMode('list')}
              >
                <Icon name="menu" size={16} />
              </button>
              <button
                className={clsx('flex items-center justify-center rounded-md size-[30px] cursor-pointer', viewMode === 'chart' ? 'bg-white' : '')}
                onClick={() => setViewMode('chart')}
              >
                <Icon name="grid" size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className={clsx('flex items-center justify-between px-3 py-3', viewMode === 'list' && 'border-b border-black-3')}>
          <div className="flex items-center gap-1">
            <Select
              className="w-[160px]"
              allowClear={false}
              value={filterType}
              onChange={setFilterType}
              options={[
                { label: '全部机会人群', value: 'all' },
                { label: '高相似人群', value: 'high' },
                { label: '潜力人群', value: 'potential' },
              ]}
            />
            <span className="text-sm text-black-12 ml-1">相似度 TOP{audienceCount} 人群</span>
          </div>
          {viewMode === 'chart' ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 px-3 py-[7px]">
                <span className="text-sm text-black-12">人群规模</span>
                <span className="text-sm text-black-12">高</span>
                <span className="inline-block rounded-full" style={{ width: 20, height: 20, backgroundColor: 'var(--odn-color-blue-6)' }} />
                <span className="inline-block rounded-full" style={{ width: 16, height: 16, backgroundColor: 'var(--odn-color-blue-5)' }} />
                <span className="inline-block rounded-full" style={{ width: 12, height: 12, backgroundColor: 'var(--odn-color-blue-4)' }} />
                <span className="text-sm text-black-12">低</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-[7px]">
                <span className="text-sm text-black-12">人群相似度</span>
                <span className="text-sm text-black-12">低</span>
                <span className="inline-block rounded-full size-3" style={{ backgroundColor: 'var(--odn-color-blue-4)' }} />
                <span className="inline-block rounded-full size-3" style={{ backgroundColor: 'var(--odn-color-blue-5)' }} />
                <span className="inline-block rounded-full size-3" style={{ backgroundColor: 'var(--odn-color-blue-6)' }} />
                <span className="text-sm text-black-12">高</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-[6px]">
              <span className="text-sm text-black-10">{seedLabel}规模</span>
              <span className="text-base tabular-nums text-black-11">295,317,468</span>
            </div>
          )}
        </div>

        {viewMode === 'chart' ? (
          <div className="px-6 pb-6">
            <div
              ref={canvasRef}
              className="relative w-full overflow-hidden rounded-xl"
              style={{
                height: canvasHeight,
                background: 'linear-gradient(90deg, rgba(41,107,239,0.05) 0%, rgba(41,107,239,0.05) 100%), #fff',
              }}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* 涟漪圆 */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: 800, height: 800, background: 'rgba(41,107,239,0.03)' }} />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: 440, height: 440, background: 'rgba(41,107,239,0.03)' }} />

              {/* 种子圆 */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center rounded-full bg-blue-6 text-white text-center size-[160px]" style={{ border: '1px solid #8eb1ff', boxShadow: 'inset 0 0 24px -8px rgba(255,255,255,0.5)' }}>
                <span className="text-sm leading-[22px]">{seedLabel}</span>
                <span className="text-lg font-semibold leading-[26px] tabular-nums">29,532万</span>
              </div>

              {/* 相似度轴 */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 w-[40%]">
                <span className="text-xs whitespace-nowrap" style={{ color: 'rgba(41,107,239,0.5)' }}>相似度低</span>
                <div className="flex-1 h-0" style={{ borderTop: '1px dashed rgba(41,107,239,0.2)' }} />
                <span className="text-xs whitespace-nowrap" style={{ color: 'rgba(41,107,239,0.5)' }}>相似度高</span>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 w-[40%]">
                <span className="text-xs whitespace-nowrap" style={{ color: 'rgba(41,107,239,0.5)' }}>相似度高</span>
                <div className="flex-1 h-0" style={{ borderTop: '1px dashed rgba(41,107,239,0.2)' }} />
                <span className="text-xs whitespace-nowrap" style={{ color: 'rgba(41,107,239,0.5)' }}>相似度低</span>
              </div>

              {/* 布局散点 */}
              {layoutNodes.map((node, i) => {
                const isDimmed = hoveredIdx !== null && hoveredIdx !== i;
                const isActive = hoveredIdx === i;
                return (
                  <div
                    key={`${node.name}-${i}`}
                    className={clsx(
                      'absolute flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-sm transition-opacity',
                      node.side < 0 && 'flex-row-reverse',
                      isDimmed && 'opacity-[0.18]',
                    )}
                    style={{
                      left: node.x,
                      top: node.y,
                      transform: node.side < 0 ? 'translate(-100%, -50%)' : 'translateY(-50%)',
                    }}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <span
                      className="inline-block rounded-full flex-none transition-transform"
                      style={{
                        width: node.dotSize,
                        height: node.dotSize,
                        background: node.dotColor,
                        opacity: node.dotOpacity,
                        border: '1px solid rgba(41,107,239,0.45)',
                        boxShadow: '0 1px 2px rgba(20,31,52,0.15)',
                        transform: isActive ? 'scale(1.15)' : undefined,
                      }}
                    />
                    <span className={clsx('text-black-12', isActive && 'font-semibold')}>{node.name}</span>
                  </div>
                );
              })}

              {/* Hover 弹窗 */}
              {hoveredIdx !== null && layoutNodes[hoveredIdx] && (
                <NodePopover node={layoutNodes[hoveredIdx]} canvasW={canvasWidth} />
              )}
            </div>
          </div>
        ) : (
          <ListView audiences={audiences} seedSize="295,317,468" />
        )}
      </Card>

      {/* ── 配置面板 ── */}
      <div className="rounded-[12px] border border-black-4 bg-white p-6">
        <h3 className="text-sm font-semibold text-black-12 mb-4">可视化参数配置</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <ConfigSlider
            label="点的尺寸（最大值）"
            value={dotMax}
            min={24}
            max={52}
            step={1}
            format={(v) => `${v}px`}
            onChange={setDotMax}
          />
          <ConfigSlider
            label="相似度距离扩散系数"
            value={distanceSpread}
            min={0.8}
            max={1.4}
            step={0.05}
            format={(v) => v.toFixed(2)}
            onChange={setDistanceSpread}
          />
          <ConfigSlider
            label="可视化区域高度"
            value={canvasHeight}
            min={320}
            max={720}
            step={10}
            format={(v) => `${v}px`}
            onChange={setCanvasHeight}
          />
          <ConfigSlider
            label="透明度下限"
            value={alphaMin}
            min={0.05}
            max={0.8}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={setAlphaMin}
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-black-10">相似度映射模式</span>
            <Select
              className="w-full"
              allowClear={false}
              value={simMapMode}
              onChange={(v: string) => setSimMapMode(v as SimMapMode)}
              options={[
                { label: '相对排名映射（Top1-TopN）', value: 'rank' },
                { label: '原值映射（按相似度数值）', value: 'value' },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-black-10">渗透率可视化方案</span>
            <div className="flex rounded-lg border border-black-4 overflow-hidden h-9">
              <button
                className={clsx(
                  'flex-1 text-[13px] cursor-pointer transition-colors border-none',
                  colorMode === 'single' ? 'bg-blue-6 text-white font-semibold' : 'bg-white text-black-10',
                )}
                onClick={() => setColorMode('single')}
              >
                单色方案
              </button>
              <button
                className={clsx(
                  'flex-1 text-[13px] cursor-pointer transition-colors border-none',
                  colorMode === 'multi' ? 'bg-blue-6 text-white font-semibold' : 'bg-white text-black-10',
                )}
                onClick={() => setColorMode('multi')}
              >
                多色方案
              </button>
            </div>
          </div>

          {colorMode === 'multi' && (
            <>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-black-10">高渗透率颜色</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorHigh}
                    onChange={(e) => setColorHigh(e.target.value)}
                    className="w-9 h-9 rounded-md border border-black-4 cursor-pointer p-1"
                  />
                  <span className="text-xs tabular-nums text-black-10">{colorHigh.toUpperCase()}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-black-10">低渗透率颜色</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorLow}
                    onChange={(e) => setColorLow(e.target.value)}
                    className="w-9 h-9 rounded-md border border-black-4 cursor-pointer p-1"
                  />
                  <span className="text-xs tabular-nums text-black-10">{colorLow.toUpperCase()}</span>
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-black-10">推荐人群数量</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={8}
                max={30}
                value={audienceCount}
                onChange={(e) => setAudienceCount(clamp(Number(e.target.value) || 20, 8, 30))}
                className="h-9 w-20 rounded-md border border-black-4 px-2.5 text-sm text-black-12 tabular-nums"
              />
              <Button
                light
                onClick={() => setDataVersion((v) => v + 1)}
              >
                随机生成
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RippleChartBlock;
