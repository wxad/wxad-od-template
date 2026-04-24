'use client';

import { Card, Icon, Popover } from 'one-design-next';
import clsx from 'clsx';
import React, { useMemo, useState } from 'react';

// ─── 数据类型 ────────────────────────────────────────────────

interface MetricCardData {
  key: string;
  label: string;
  value: number;
  unit: string;
  tgi: number;
}

interface TouchpointRow {
  category: string;
  media: string;
  tgi: number;
  coverage: number;
  coverageRef: number;
}

type SortField = 'tgi' | 'coverage';
type SortOrder = 'asc' | 'desc';

// ─── Mock 数据 ────────────────────────────────────────────────

const METRIC_CARDS: MetricCardData[] = [
  { key: 'contract-hard', label: '合约硬广', value: 65.12, unit: '%', tgi: 98 },
  { key: 'brand-bid', label: '品牌竞价', value: 42.35, unit: '%', tgi: 112 },
  { key: 'mutual-select', label: '互选', value: 38.67, unit: '%', tgi: 87 },
  { key: 'merchant', label: '招商项目', value: 29.81, unit: '%', tgi: 105 },
  { key: 'effect-bid', label: '效果竞价', value: 55.94, unit: '%', tgi: 93 },
  { key: 'brand-position', label: '品牌阵地', value: 31.22, unit: '%', tgi: 76 },
  { key: 'organic-search', label: '自然搜索', value: 18.45, unit: '%', tgi: 134 },
  { key: 'organic-content', label: '自然内容', value: 22.08, unit: '%', tgi: 118 },
];

const TOUCHPOINT_DATA: TouchpointRow[] = [
  { category: '合约硬广', media: '微信朋友圈', tgi: 132, coverage: 18.5, coverageRef: 13.2 },
  { category: '合约硬广', media: '微信视频号', tgi: 108, coverage: 11.2, coverageRef: 10.8 },
  { category: '合约硬广', media: '微信公众号', tgi: 97, coverage: 14.1, coverageRef: 12.6 },
  { category: '合约硬广', media: '微信小程序', tgi: 115, coverage: 15.8, coverageRef: 11.5 },
  { category: '合约硬广', media: '微信搜一搜', tgi: 89, coverage: 16.2, coverageRef: 14.0 },
  { category: '合约硬广', media: '腾讯视频', tgi: 76, coverage: 13.8, coverageRef: 14.5 },
  { category: '品牌竞价', media: '微信朋友圈', tgi: 142, coverage: 12.3, coverageRef: 8.5 },
  { category: '品牌竞价', media: '微信视频号', tgi: 98, coverage: 9.8, coverageRef: 10.2 },
  { category: '品牌竞价', media: '腾讯新闻', tgi: 85, coverage: 7.2, coverageRef: 8.0 },
  { category: '互选', media: '微信公众号', tgi: 125, coverage: 11.5, coverageRef: 9.3 },
  { category: '互选', media: '微信视频号', tgi: 110, coverage: 10.2, coverageRef: 8.8 },
  { category: '招商项目', media: '微信小程序', tgi: 95, coverage: 8.6, coverageRef: 9.1 },
  { category: '效果竞价', media: '微信朋友圈', tgi: 118, coverage: 14.5, coverageRef: 12.0 },
  { category: '效果竞价', media: 'QQ', tgi: 72, coverage: 6.3, coverageRef: 8.8 },
  { category: '效果竞价', media: '腾讯音乐', tgi: 88, coverage: 8.9, coverageRef: 9.5 },
  { category: '品牌阵地', media: '微信公众号', tgi: 135, coverage: 10.8, coverageRef: 7.2 },
  { category: '自然搜索', media: '微信搜一搜', tgi: 156, coverage: 12.6, coverageRef: 6.8 },
  { category: '自然搜索', media: '浏览器搜索', tgi: 102, coverage: 5.5, coverageRef: 5.3 },
  { category: '自然内容', media: '腾讯新闻', tgi: 91, coverage: 7.8, coverageRef: 8.2 },
  { category: '自然内容', media: 'IEG 游戏', tgi: 78, coverage: 9.2, coverageRef: 11.0 },
];

const MAX_COVERAGE = 20;

// ─── 子组件 ────────────────────────────────────────────────

function MetricCard({
  data,
  selected,
  onClick,
}: {
  data: MetricCardData;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex w-[200px] flex-col items-start justify-center gap-1 rounded-[8px] px-3 py-2',
        'text-left transition-colors',
        selected
          ? 'bg-blue-2 ring-1 ring-inset ring-blue-5'
          : 'hover:bg-black-2'
      )}
    >
      <span
        className={clsx(
          'text-sm font-semibold leading-[22px]',
          selected ? 'text-blue-6' : 'text-black-12'
        )}
        style={{ borderBottom: '1px dashed var(--odn-color-black-9)' }}
      >
        {data.label}
      </span>
      <span className="flex items-end gap-1">
        <span className="flex items-center gap-1">
          <span
            className={clsx(
              'font-mono text-base font-semibold leading-6',
              selected ? 'text-blue-6' : 'text-black-12'
            )}
          >
            {data.value.toFixed(2)}
          </span>
          <span className="font-mono text-sm text-black-9">{data.unit}</span>
        </span>
        <span className="flex items-center gap-0.5 text-black-9">
          <span className="text-xs leading-5">TGI</span>
          <span className="font-mono text-[13px] leading-[22px]">{data.tgi}</span>
        </span>
      </span>
    </button>
  );
}

function SortIcon({ active, order }: { active: boolean; order: SortOrder }) {
  return (
    <span className="inline-flex flex-col items-center justify-center gap-0">
      <Icon
        name="chevron-up"
        size={10}
        className={clsx(
          'transition-colors',
          active && order === 'asc' ? 'text-blue-6' : 'text-black-6'
        )}
      />
      <Icon
        name="chevron-down"
        size={10}
        className={clsx(
          '-mt-0.5 transition-colors',
          active && order === 'desc' ? 'text-blue-6' : 'text-black-6'
        )}
      />
    </span>
  );
}

function BulletBar({
  coverage,
  coverageRef,
  maxVal,
}: {
  coverage: number;
  coverageRef: number;
  maxVal: number;
}) {
  const barWidth = (coverage / maxVal) * 100;
  const refLeft = (coverageRef / maxVal) * 100;

  return (
    <div className="relative h-4 w-full">
      <div
        className="absolute left-0 top-0 h-4 bg-blue-5"
        style={{ width: `${Math.min(barWidth, 100)}%` }}
      />
      <div
        className="absolute top-[-1px] h-[18px] w-0.5 bg-black-10"
        style={{ left: `${Math.min(refLeft, 100)}%` }}
      />
    </div>
  );
}

// ─── 主组件 ────────────────────────────────────────────────

const TouchpointAnalysis = () => {
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const handleCardClick = (key: string) => {
    setSelectedCards((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const selectedCategories = useMemo(() => {
    if (selectedCards.size === 0) return null;
    return METRIC_CARDS.filter((c) => selectedCards.has(c.key)).map((c) => c.label);
  }, [selectedCards]);

  const filteredData = useMemo(() => {
    let data = TOUCHPOINT_DATA;
    if (selectedCategories) {
      data = data.filter((row) => selectedCategories.includes(row.category));
    }
    if (sortField) {
      data = [...data].sort((a, b) => {
        const diff = sortField === 'tgi' ? a.tgi - b.tgi : a.coverage - b.coverage;
        return sortOrder === 'asc' ? diff : -diff;
      });
    }
    return data;
  }, [selectedCategories, sortField, sortOrder]);

  const dropdownLabel = useMemo(() => {
    if (selectedCards.size === 0) return '全部媒体';
    if (selectedCards.size === 1) {
      const card = METRIC_CARDS.find((c) => selectedCards.has(c.key));
      return card?.label ?? '全部媒体';
    }
    return `已选 ${selectedCards.size} 项`;
  }, [selectedCards]);

  const showCategory = selectedCards.size === 0 || selectedCards.size > 1;

  return (
    <div className="rounded-xl bg-[#f2f5fa] p-6">
      <Card
        elevation={0}
        className="w-full overflow-hidden [--odn-card-radius:12px]"
      >
        {/* Header */}
        <div className="flex h-16 items-center border-b border-black-4 px-6">
          <h3 className="text-base font-semibold text-black-12">触点分析</h3>
        </div>

        <div className="flex">
          {/* 左侧：指标卡组 */}
          <div className="flex w-[224px] shrink-0 flex-col gap-2 border-r border-black-4 p-3">
            {METRIC_CARDS.map((card) => (
              <MetricCard
                key={card.key}
                data={card}
                selected={selectedCards.has(card.key)}
                onClick={() => handleCardClick(card.key)}
              />
            ))}
          </div>

          {/* 右侧：子弹图区域 */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* 工具栏：下拉 + 图例 */}
            <div className="flex h-14 items-center gap-2 px-3">
              <button
                type="button"
                className="flex items-center gap-1 rounded-[6px] px-2 py-1.5 text-xs font-semibold text-black-12 hover:bg-black-2"
              >
                {dropdownLabel}
                <Icon name="chevron-down" size={16} className="text-black-9" />
              </button>
              <div className="flex items-center gap-4 text-xs text-black-9">
                <span className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-[1px] bg-blue-5" />
                  人群覆盖度
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-0.5 bg-black-10" />
                  人群覆盖度参考系
                </span>
              </div>
            </div>

            {/* 分割线 */}
            <div className="mx-6 border-t border-black-4" />

            {/* 表头 */}
            <div className="flex items-center pt-3">
              <div className="w-[200px] shrink-0 px-6 py-2">
                <span className="text-sm text-black-9">媒体</span>
              </div>
              <button
                type="button"
                onClick={() => handleSort('tgi')}
                className="flex w-20 shrink-0 items-center justify-end gap-1 px-4 py-2"
              >
                <span className="text-sm text-black-9">TGI</span>
                <SortIcon active={sortField === 'tgi'} order={sortOrder} />
              </button>
              <button
                type="button"
                onClick={() => handleSort('coverage')}
                className="flex flex-1 items-center gap-1 px-6 py-2"
              >
                <span className="text-sm text-black-9">人群覆盖度</span>
                <SortIcon active={sortField === 'coverage'} order={sortOrder} />
              </button>
            </div>

            {/* 图表坐标背景 */}
            <div className="relative flex flex-col pb-8">
              {/* 坐标轴背景网格 */}
              <div
                className="pointer-events-none absolute inset-0 flex"
                style={{ paddingLeft: 280, paddingRight: 40 }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex h-full flex-1 flex-col items-start"
                  >
                    <div className="h-full w-px bg-black-3" />
                  </div>
                ))}
              </div>

              {/* 数据行 */}
              {filteredData.map((row, idx) => (
                <Popover
                  key={`${row.category}-${row.media}`}
                  open={hoveredRow === idx}
                  onOpenChange={(open) => setHoveredRow(open ? idx : null)}
                  content={
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-black-12">
                        {showCategory ? `${row.category} > ${row.media}` : row.media}
                      </span>
                      <div className="border-t border-black-4" />
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-sm text-black-9">人群覆盖度</span>
                          <span className="font-mono text-sm font-semibold text-black-12">
                            {row.coverage.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-sm text-black-9">人群覆盖度参考系</span>
                          <span className="font-mono text-sm font-semibold text-black-12">
                            {row.coverageRef.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-sm text-black-9">TGI</span>
                          <span className="font-mono text-sm font-semibold text-black-12">
                            {row.tgi}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                >
                  <div
                    className={clsx(
                      'flex h-10 items-center transition-colors',
                      hoveredRow === idx && 'bg-black-2'
                    )}
                    onMouseEnter={() => setHoveredRow(idx)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <div className="w-[200px] shrink-0 overflow-hidden px-6">
                      <span className="block truncate text-sm text-black-12">
                        {showCategory ? `${row.category} > ${row.media}` : row.media}
                      </span>
                    </div>
                    <div className="flex w-20 shrink-0 items-center justify-end px-6">
                      <span className="font-mono text-sm tabular-nums text-black-12">
                        {row.tgi}
                      </span>
                    </div>
                    <div className="flex flex-1 items-center px-6">
                      <BulletBar
                        coverage={row.coverage}
                        coverageRef={row.coverageRef}
                        maxVal={MAX_COVERAGE}
                      />
                    </div>
                  </div>
                </Popover>
              ))}

              {/* X 轴刻度 */}
              <div
                className="flex items-center text-xs text-black-6"
                style={{ paddingLeft: 280, paddingRight: 40 }}
              >
                {['0', '5%', '10%', '15%', '20%'].map((tick, i) => (
                  <span
                    key={tick}
                    className="flex-1 text-center font-mono tabular-nums"
                    style={i === 0 ? { textAlign: 'left' } : undefined}
                  >
                    {tick}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TouchpointAnalysis;
