'use client';

// @ts-ignore — d3 类型由项目依赖提供
import * as d3 from 'd3';
import clsx from 'clsx';
import { Button, Icon, Popover } from 'one-design-next';
import React, { useEffect, useMemo, useRef, useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// 心智图谱 d3.treemap（与 workshop brand-mind-dashboard 同源，对齐 components/chart/demo/treemap.tsx）
// ═══════════════════════════════════════════════════════════════════════════

/** 如翼品牌心智 API 行（mindMap.list 单项） */
export interface MindTreemapInputRow {
  level3_mind: string;
  mind_total?: number | string;
  mind_ratio?: number | string;
  level1_mind?: string;
  level2_mind?: string;
  industry_share?: string;
}

interface TreemapCellData {
  name: string;
  value: number;
  originalValue?: number;
  change?: number;
  level1?: string;
  level2?: string;
  industryShare?: string;
}

type HierarchyData = { children: TreemapCellData[] } | TreemapCellData;

export function MindTreemapD3({ items }: { items: MindTreemapInputRow[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const hoverTimer = useRef(0);
  const [currentHoverCellData, setCurrentHoverCellData] =
    useState<TreemapCellData | null>(null);
  const [offset, setOffset] = useState<[number, number]>([0, 0]);

  const TREEMAP_HEIGHT = 552;
  const top20 = useMemo(() => items.slice(0, 20), [items]);

  const onCellMouseEnter = (cellData: TreemapCellData, el: HTMLDivElement) => {
    clearTimeout(hoverTimer.current);
    const { right, top } = el.getBoundingClientRect();
    let off: [number, number] = [0, 0];
    if (wrapperRef.current) {
      const { right: wr, top: wt } = wrapperRef.current.getBoundingClientRect();
      off = [right - wr, top - wt];
    }
    setCurrentHoverCellData({ ...cellData });
    setOffset(off);
  };

  const onCellMouseLeave = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(
      () => setCurrentHoverCellData(null),
      200,
    );
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(Math.max(300, entry.contentRect.width));
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!wrapperRef.current || !top20.length || containerWidth <= 0) return;
    const width = containerWidth;
    const height = TREEMAP_HEIGHT;
    const targetMinWidth = 98;
    const targetMinHeight = 46;
    const targetMinArea = targetMinWidth * targetMinHeight;

    const data: TreemapCellData[] = top20.map((item) => {
      const ratio =
        item.mind_ratio && item.mind_ratio !== '9999'
          ? parseFloat(String(item.mind_ratio))
          : undefined;
      return {
        name: item.level3_mind,
        value: Math.max(0.001, +Number(item.mind_total) || 0.001),
        originalValue: +Number(item.mind_total),
        change: ratio,
        level1: item.level1_mind,
        level2: item.level2_mind,
        industryShare: item.industry_share,
      };
    });

    const minValue = Math.min(...data.map((d) => d.value));
    const maxValue = Math.max(...data.map((d) => d.value));

    let finalTargetRatio = 0;

    let testData = data.map((item) => ({
      ...item,
      value: Math.max(0.001, item.value),
    }));
    const testTreemap = d3
      .treemap<HierarchyData>()
      .size([width, height])
      .padding(4)
      .round(true);

    let testRoot = d3
      .hierarchy({ children: testData } as HierarchyData)
      .sum((d) => {
        if ('children' in d) return 0;
        const val = d.value;
        return isFinite(val) && val > 0 ? val : 0.001;
      })
      .sort((a, b) => (b.value || 0) - (a.value || 0));
    testTreemap(testRoot);

    const testLeaves =
      testRoot.leaves() as d3.HierarchyRectangularNode<HierarchyData>[];
    let testMinW = Infinity,
      testMinH = Infinity;
    testLeaves.forEach((n) => {
      const w = n.x1 - n.x0,
        h = n.y1 - n.y0;
      if (w > 0 && w < testMinW) testMinW = w;
      if (h > 0 && h < testMinH) testMinH = h;
    });

    if (
      !(
        testMinW >= targetMinWidth &&
        testMinH >= targetMinHeight &&
        isFinite(testMinW) &&
        isFinite(testMinH)
      )
    ) {
      let low = 0,
        high = 0.95;
      finalTargetRatio = 0.5;
      for (let i = 0; i < 10; i++) {
        const tr = (low + high) / 2;
        const bv = Math.max(0, (tr * maxValue - minValue) / (1 - tr));
        const adjData = data.map((item) => ({
          ...item,
          value: Math.max(0.001, item.value + bv),
        }));
        testRoot = d3
          .hierarchy({ children: adjData } as HierarchyData)
          .sum((d) => {
            if ('children' in d) return 0;
            return Math.max(0.001, d.value);
          })
          .sort((a, b) => (b.value || 0) - (a.value || 0));
        testTreemap(testRoot);
        const ls =
          testRoot.leaves() as d3.HierarchyRectangularNode<HierarchyData>[];
        let mw = Infinity,
          mh = Infinity;
        ls.forEach((n) => {
          const w = n.x1 - n.x0,
            h = n.y1 - n.y0;
          if (w > 0 && w < mw) mw = w;
          if (h > 0 && h < mh) mh = h;
        });
        if (
          mw >= targetMinWidth &&
          mh >= targetMinHeight &&
          isFinite(mw) &&
          isFinite(mh)
        ) {
          finalTargetRatio = tr;
          high = tr;
        } else {
          low = tr;
        }
        if (high - low < 0.01) break;
      }
    }

    let adjustedData = data.map((item) => ({ ...item }));
    if (finalTargetRatio > 0 && finalTargetRatio < 1) {
      const bv = Math.max(
        0,
        (finalTargetRatio * maxValue - minValue) / (1 - finalTargetRatio),
      );
      adjustedData = adjustedData.map((item) => ({
        ...item,
        value: item.value + bv,
      }));
    }
    adjustedData = adjustedData.map((item) => ({
      ...item,
      value: Math.max(0.001, item.value),
    }));

    let root = d3
      .hierarchy({ children: adjustedData } as HierarchyData)
      .sum((d) => {
        if ('children' in d) return 0;
        return Math.max(0.001, d.value);
      })
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemap = d3
      .treemap<HierarchyData>()
      .size([width, height])
      .padding(4)
      .round(true);

    for (let iter = 0; iter < 5; iter++) {
      treemap(root);
      const leaves =
        root.leaves() as d3.HierarchyRectangularNode<HierarchyData>[];
      let mw = Infinity,
        mh = Infinity,
        mArea = Infinity;
      leaves.forEach((n) => {
        const w = n.x1 - n.x0,
          h = n.y1 - n.y0,
          a = w * h;
        if (w > 0 && w < mw) mw = w;
        if (h > 0 && h < mh) mh = h;
        if (a > 0 && a < mArea) mArea = a;
      });
      if (
        mw >= targetMinWidth &&
        mh >= targetMinHeight &&
        isFinite(mw) &&
        isFinite(mh)
      )
        break;
      if (!isFinite(mw) || !isFinite(mh) || mArea <= 0) break;
      const sf = Math.sqrt(targetMinArea / mArea);
      if (!isFinite(sf) || sf <= 0) break;
      adjustedData = adjustedData.map((item) => ({
        ...item,
        value: Math.max(0.001, item.value * sf),
      }));
      root = d3
        .hierarchy({ children: adjustedData } as HierarchyData)
        .sum((d) => {
          if ('children' in d) return 0;
          return Math.max(0.001, d.value);
        })
        .sort((a, b) => (b.value || 0) - (a.value || 0));
    }

    treemap(root);

    const container = d3.select(wrapperRef.current);
    container.selectAll('*').remove();
    container
      .style('position', 'relative')
      .style('width', `${width}px`)
      .style('height', `${height}px`);

    const leaves =
      root.leaves() as d3.HierarchyRectangularNode<HierarchyData>[];

    const cells = container
      .selectAll('div[data-tm-cell]')
      .data(leaves)
      .enter()
      .append('div')
      .attr('data-tm-cell', '')
      .style('position', 'absolute')
      .style('background-color', 'rgba(41,107,239,0.06)')
      .style('overflow', 'hidden')
      .style('padding', '12px 0 0 16px')
      .style('white-space', 'nowrap')
      .style('cursor', 'pointer')
      .style('left', (d) => `${d.x0}px`)
      .style('top', (d) => `${d.y0}px`)
      .style('width', (d) => `${d.x1 - d.x0}px`)
      .style('height', (d) => `${d.y1 - d.y0}px`)
      .on('mouseenter', function (_event, d) {
        const cellData = (d as d3.HierarchyRectangularNode<HierarchyData>)
          .data as TreemapCellData;
        onCellMouseEnter(cellData, this as HTMLDivElement);
        d3.select(this).style('background-color', 'rgba(41,107,239,0.10)');
        d3.select(this)
          .select('[data-tm-content]')
          .style('opacity', '0')
          .style('visibility', 'hidden');
        d3.select(this)
          .select('[data-tm-hover]')
          .style('opacity', '1')
          .style('visibility', 'visible');
      })
      .on('mouseleave', function () {
        onCellMouseLeave();
        d3.select(this).style('background-color', 'rgba(41,107,239,0.06)');
        d3.select(this)
          .select('[data-tm-content]')
          .style('opacity', '1')
          .style('visibility', 'visible');
        d3.select(this)
          .select('[data-tm-hover]')
          .style('opacity', '0')
          .style('visibility', 'hidden');
      });

    cells.each(function (d) {
      const cell = d3.select(this);
      const cellData = (d as d3.HierarchyRectangularNode<HierarchyData>)
        .data as TreemapCellData;

      const contentWrapper = cell
        .append('div')
        .attr('data-tm-content', '')
        .style('transition', 'opacity 0.15s ease, visibility 0.15s ease');
      contentWrapper
        .append('div')
        .style('margin-bottom', '4px')
        .style('font-size', '14px')
        .style('line-height', '22px')
        .style('color', 'rgba(38,39,41,0.85)')
        .text(cellData.name);

      const valueRow = contentWrapper
        .append('div')
        .style('display', 'flex')
        .style('align-items', 'baseline')
        .style('flex-wrap', 'wrap')
        .style('gap', '4px');
      valueRow
        .append('div')
        .attr('data-tm-value', '')
        .style('font-size', '16px')
        .style('color', 'rgba(38,39,41,0.85)')
        .style('line-height', '24px')
        .text((cellData.originalValue || cellData.value).toLocaleString());

      if (cellData.change !== undefined && cellData.change !== 0) {
        const isPositive = cellData.change > 0;
        const changeContainer = valueRow
          .append('div')
          .attr('data-tm-change', '')
          .style('display', 'flex')
          .style('align-items', 'center')
          .style('margin-top', 'auto')
          .style('font-size', '12px')
          .style('line-height', '24px')
          .style('flex', 'none')
          .style('color', isPositive ? '#07C160' : '#E63D2E');
        const svg = changeContainer
          .append('svg')
          .attr('width', '14')
          .attr('height', '14')
          .attr('viewBox', '0 0 14 14');
        if (isPositive) {
          svg
            .append('path')
            .attr(
              'd',
              'M10.3721 5.81543L9.75293 6.43359L7.4375 4.11816V11.375H6.5625V4.11816L4.24707 6.43359L3.62793 5.81543L7 2.44336L10.3721 5.81543Z',
            )
            .attr('fill', 'currentColor');
        } else {
          svg
            .append('path')
            .attr(
              'd',
              'M7.4375 9.88086L9.75293 7.56543L10.3721 8.18457L7 11.5566L3.62793 8.18457L4.24707 7.56543L6.5625 9.88086V2.625H7.4375V9.88086Z',
            )
            .attr('fill', 'currentColor');
        }
        changeContainer
          .append('span')
          .text(`${Math.abs(cellData.change).toFixed(2)}%`);
      }

      const hoverIcon = cell
        .append('div')
        .attr('data-tm-hover', '')
        .style('position', 'absolute')
        .style('top', '0')
        .style('left', '0')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('justify-content', 'center')
        .style('width', '100%')
        .style('height', '100%')
        .style('z-index', '1')
        .style('opacity', '0')
        .style('visibility', 'hidden')
        .style('transition', 'opacity 0.15s ease, visibility 0.15s ease');
      hoverIcon
        .append('svg')
        .attr('width', '16')
        .attr('height', '16')
        .attr('viewBox', '0 0 16 16')
        .attr('fill', 'none')
        .append('path')
        .attr('fill-rule', 'evenodd')
        .attr('clip-rule', 'evenodd')
        .attr(
          'd',
          'M7.91637 3.2276C7.81874 3.12996 7.81874 2.97167 7.91637 2.87404L8.26992 2.52049C8.36755 2.42286 8.52585 2.42286 8.62348 2.52049L13.5732 7.47024L13.9268 7.82379C14.0244 7.92142 14.0244 8.07971 13.9268 8.17734L13.5732 8.5309L8.62348 13.4806C8.52584 13.5783 8.36755 13.5783 8.26992 13.4806L7.91637 13.1271C7.81874 13.0295 7.81874 12.8712 7.91637 12.7735L12.1893 8.50057H2.35357C2.2155 8.50057 2.10357 8.38864 2.10357 8.25057V7.75057C2.10357 7.61249 2.2155 7.50057 2.35357 7.50057H12.1893L7.91637 3.2276Z',
        )
        .attr('fill', '#262729')
        .attr('fill-opacity', '0.85');
    });

    requestAnimationFrame(() => {
      if (!wrapperRef.current) return;
      const checkBounds = (el: HTMLElement, cell: HTMLElement) => {
        const er = el.getBoundingClientRect(),
          cr = cell.getBoundingClientRect();
        if (
          !(
            er.left >= cr.left &&
            er.right <= cr.right &&
            er.top >= cr.top &&
            er.bottom <= cr.bottom
          )
        ) {
          el.style.display = 'none';
        }
      };
      wrapperRef.current.querySelectorAll('[data-tm-change]').forEach((el) => {
        const cell = el.closest('[data-tm-cell]') as HTMLElement;
        if (cell) checkBounds(el as HTMLElement, cell);
      });
      wrapperRef.current.querySelectorAll('[data-tm-value]').forEach((el) => {
        const cell = el.closest('[data-tm-cell]') as HTMLElement;
        if (cell) {
          checkBounds(el as HTMLElement, cell);
          if ((el as HTMLElement).style.display === 'none') {
            const ch = cell.querySelector('[data-tm-change]') as HTMLElement;
            if (ch) ch.style.display = 'none';
          }
        }
      });
    });
  }, [top20, containerWidth]);

  if (!top20.length)
    return (
      <div className="flex h-[552px] items-center justify-center text-sm text-[#898b8f]">
        无数据
      </div>
    );

  return (
    <div ref={containerRef} className="relative h-[552px] w-full">
      <Popover
        popup={
          currentHoverCellData ? (
            <div className="min-w-[208px]">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold">
                  {currentHoverCellData.name}
                </span>
                <span className="flex h-[20px] items-center rounded-[10px] bg-[rgba(73,89,122,0.05)] px-2 text-[8px] text-[rgba(38,38,41,0.72)]">
                  {currentHoverCellData.level1}/{currentHoverCellData.level2}
                </span>
              </div>
              <div className="my-4 h-px bg-[#ebebeb]" />
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span>心智量</span>
                  <span className="tabular-nums">
                    {(currentHoverCellData.originalValue || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>环比增长率</span>
                  {currentHoverCellData.change !== undefined ? (
                    <span
                      className="flex items-center"
                      style={{
                        color:
                          currentHoverCellData.change > 0
                            ? 'var(--odn-color-green-7)'
                            : currentHoverCellData.change < 0
                              ? 'var(--odn-color-red-7)'
                              : undefined,
                      }}
                    >
                      {currentHoverCellData.change > 0 && (
                        <svg width="16" height="16" viewBox="0 0 16 16">
                          <path
                            d="M11.8535 6.64648L11.1465 7.35352L8.5 4.70703V13H7.5V4.70703L4.85352 7.35352L4.14648 6.64648L8 2.79297L11.8535 6.64648Z"
                            fill="currentColor"
                          />
                        </svg>
                      )}
                      {currentHoverCellData.change < 0 && (
                        <svg width="16" height="16" viewBox="0 0 16 16">
                          <path
                            d="M8.5 11.293L11.1465 8.64648L11.8535 9.35352L8 13.207L4.14648 9.35352L4.85352 8.64648L7.5 11.293V3H8.5V11.293Z"
                            fill="currentColor"
                          />
                        </svg>
                      )}
                      {Math.abs(currentHoverCellData.change).toFixed(2)}%
                    </span>
                  ) : (
                    <span>-</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span>行业心智份额</span>
                  <span className="tabular-nums">
                    {currentHoverCellData.industryShare || '-'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div />
          )
        }
        popupRootStyle={{ pointerEvents: 'none' }}
        popupStyle={{
          transform: `translate3d(${offset[0]}px, ${offset[1]}px, 0)`,
        }}
        visible={!!currentHoverCellData}
        placement="topRight"
        arrowed={false}
        autoPlacements={[]}
        flip={false}
        shift={false}
      >
        <div ref={wrapperRef} />
      </Popover>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 文档站完整面板 demo：树图 = d3 真源；表格 = 同一批 mock 行映射为表格列
// ═══════════════════════════════════════════════════════════════════════════

interface TreemapItem {
  name: string;
  tag: string;
  volume: number;
  change: number;
  share: number;
}

type ViewMode = 'treemap' | 'table';
type SortKey = 'volume' | 'change' | 'share';
type SortDir = 'asc' | 'desc';

const MOCK_MIND_ROWS: MindTreemapInputRow[] = [
  {
    level3_mind: '杏仁酸',
    mind_total: 924914,
    mind_ratio: 20.23,
    level1_mind: '产品类心智',
    level2_mind: '功效功能',
    industry_share: '80.25%',
  },
  {
    level3_mind: '海先',
    mind_total: 824914,
    mind_ratio: 20.23,
    level1_mind: '产品类心智',
    level2_mind: '功效功能',
    industry_share: '79.42%',
  },
  {
    level3_mind: '氨基',
    mind_total: 724914,
    mind_ratio: 20.23,
    level1_mind: '产品类心智',
    level2_mind: '功效功能',
    industry_share: '78.12%',
  },
  {
    level3_mind: '品泽精',
    mind_total: 624914,
    mind_ratio: 20.23,
    level1_mind: '产品类心智',
    level2_mind: '功效功能',
    industry_share: '77.12%',
  },
  {
    level3_mind: '集范',
    mind_total: 524914,
    mind_ratio: 18.1,
    level1_mind: '产品类心智',
    level2_mind: '功效功能',
    industry_share: '72.12%',
  },
  {
    level3_mind: '小杯',
    mind_total: 424914,
    mind_ratio: 15.2,
    level1_mind: '产品类心智',
    level2_mind: '功效功能',
    industry_share: '68.12%',
  },
  {
    level3_mind: '金盏花',
    mind_total: 374914,
    mind_ratio: 12.0,
    level1_mind: '产品类心智',
    level2_mind: '功效功能',
    industry_share: '64.12%',
  },
  {
    level3_mind: '斯陪',
    mind_total: 324914,
    mind_ratio: 9.5,
    level1_mind: '产品类心智',
    level2_mind: '功效功能',
    industry_share: '58.12%',
  },
  {
    level3_mind: '淅通',
    mind_total: 274914,
    mind_ratio: -8.23,
    level1_mind: '产品类心智',
    level2_mind: '功效功能',
    industry_share: '53.12%',
  },
  {
    level3_mind: '素白',
    mind_total: 224914,
    mind_ratio: -12.23,
    level1_mind: '产品类心智',
    level2_mind: '功效功能',
    industry_share: '43.12%',
  },
];

function mindRowsToTableItems(rows: MindTreemapInputRow[]): TreemapItem[] {
  return rows.map((item) => {
    const ratio =
      item.mind_ratio && item.mind_ratio !== '9999'
        ? parseFloat(String(item.mind_ratio))
        : 0;
    const shareRaw = item.industry_share ?? '0';
    const shareNum = parseFloat(String(shareRaw).replace(/%/g, '')) || 0;
    return {
      name: item.level3_mind,
      tag: [item.level1_mind, item.level2_mind].filter(Boolean).join('/') || '—',
      volume: +Number(item.mind_total) || 0,
      change: ratio,
      share: shareNum,
    };
  });
}

function TableView({ data }: { data: TreemapItem[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('volume');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(data.length / pageSize);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const mul = sortDir === 'desc' ? -1 : 1;
      return (a[sortKey] - b[sortKey]) * mul;
    });
  }, [data, sortKey, sortDir]);

  const pageData = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <button type="button" onClick={() => handleSort(col)} className="ml-0.5 inline-flex flex-col text-black-6">
      <Icon
        name={
          sortKey === col && sortDir === 'asc'
            ? 'arrow-up'
            : sortKey === col && sortDir === 'desc'
              ? 'arrow-down'
              : 'switch'
        }
        size={14}
      />
    </button>
  );

  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="h-10 border-b border-black-5 text-[length:var(--odn-font-size-comment)] text-black-10">
            <th className="px-6 py-2.5 text-left font-normal">心智名称</th>
            <th className="px-6 py-2.5 text-left font-normal">心智类型</th>
            <th className="px-6 py-2.5 text-right font-normal">
              <span className="inline-flex items-center justify-end">
                心智量 <SortIcon col="volume" />
              </span>
            </th>
            <th className="px-6 py-2.5 text-right font-normal">
              <span className="inline-flex items-center justify-end">
                环比增长 <SortIcon col="change" />
              </span>
            </th>
            <th className="px-6 py-2.5 text-right font-normal">
              <span className="inline-flex items-center justify-end">
                行业份额 <SortIcon col="share" />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {pageData.map((item) => (
            <tr key={item.name} className="border-b border-black-5 hover:bg-black-2">
              <td className="px-6 py-[13px] text-[length:var(--odn-font-size-text-sm)] text-black-12">{item.name}</td>
              <td className="px-6 py-[13px] text-[length:var(--odn-font-size-text-sm)] text-black-12">{item.tag}</td>
              <td className="px-6 py-[13px] text-right tabular-nums text-[length:var(--odn-font-size-text-sm)] text-black-12">
                {item.volume.toLocaleString()}
              </td>
              <td
                className={clsx(
                  'px-6 py-[13px] text-right tabular-nums text-[length:var(--odn-font-size-text-sm)]',
                  item.change >= 0 ? 'text-black-12' : 'text-black-12',
                )}
              >
                {item.change.toFixed(2)}%
              </td>
              <td className="px-6 py-[13px] text-right tabular-nums text-[length:var(--odn-font-size-text-sm)] text-black-12">
                {item.share.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-end px-6 py-2.5">
          <div className="flex items-center">
            <button
              type="button"
              className={clsx(
                'flex size-[30px] items-center justify-center rounded-[6px]',
                page === 1 ? 'text-black-6' : 'text-black-11',
              )}
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <Icon name="chevron-left" size={16} />
            </button>
            <span className="w-14 text-center text-[length:var(--odn-font-size-text-sm)] text-black-12">
              {page}/{totalPages}
            </span>
            <button
              type="button"
              className={clsx(
                'flex size-[30px] items-center justify-center rounded-[6px]',
                page === totalPages ? 'text-black-6' : 'text-black-11',
              )}
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <Icon name="chevron-right" size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const tableDemoData = mindRowsToTableItems(MOCK_MIND_ROWS);

export default function TreemapPanel() {
  const [view, setView] = useState<ViewMode>('treemap');

  return (
    <div className="overflow-hidden rounded-[12px] bg-white">
      <div className="flex items-center justify-between border-b border-black-5 py-3.5 pl-3 pr-6">
        <div className="px-3 py-1.5">
          <span className="text-[length:var(--odn-font-size-headline-5)] font-semibold text-black-12">
            本品牌心智图谱
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button light size="medium">
            全部心智
          </Button>
          <div className="h-4 w-px bg-black-5" />
          <div className="flex items-center gap-0.5 rounded-[8px] bg-black-2 p-[3px]">
            <button
              type="button"
              className={clsx(
                'flex size-[30px] items-center justify-center rounded-[6px] transition-colors',
                view === 'treemap' ? 'bg-white shadow-1' : 'text-black-9',
              )}
              onClick={() => setView('treemap')}
            >
              <Icon name="grid" size={16} />
            </button>
            <button
              type="button"
              className={clsx(
                'flex size-[30px] items-center justify-center rounded-[6px] transition-colors',
                view === 'table' ? 'bg-white shadow-1' : 'text-black-9',
              )}
              onClick={() => setView('table')}
            >
              <Icon name="menu" size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        {view === 'treemap' ? (
          <MindTreemapD3 items={MOCK_MIND_ROWS} />
        ) : (
          <TableView data={tableDemoData} />
        )}
      </div>
    </div>
  );
}
