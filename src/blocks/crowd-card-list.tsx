'use client';

import {
  Card,
  Icon,
  Input,
  Pagination,
  Select,
  Tabs,
} from 'one-design-next';
import React, { useEffect, useMemo, useState } from 'react';

type TagType = 'hot' | 'view' | 'new' | 'industry';

interface CrowdItem {
  id: string;
  name: string;
  description?: string;
  tags: { label: string; type: TagType }[];
  coverageWan: number;
  penetration: number;
  r3Inflow: number;
  adCount: number;
  insightCount: number;
  updatedAt: string;
  launchedAt: string;
  starred: boolean;
}

type SortKey =
  | 'name'
  | 'coverageWan'
  | 'penetration'
  | 'r3Inflow'
  | 'adCount'
  | 'insightCount'
  | 'updatedAt'
  | 'launchedAt';

type SortDir = 'asc' | 'desc';

const TAG_STYLES: Record<TagType, { bg: string; text: string }> = {
  hot: { bg: 'var(--odn-color-orange-1)', text: 'var(--odn-color-orange-7)' },
  view: {
    bg: 'var(--odn-color-lightblue-1, #f5fbff)',
    text: 'var(--odn-color-lightblue-7, #2190d9)',
  },
  new: { bg: 'var(--odn-color-blue-1)', text: 'var(--odn-color-blue-7)' },
  industry: { bg: 'var(--odn-color-black-2)', text: 'var(--odn-color-black-12)' },
};

const TABS = [
  { key: 'industry', label: '行业优选' },
  { key: 'interest', label: '兴趣精选' },
  { key: 'theme', label: '主题甄选' },
  { key: 'favorite', label: '我的收藏' },
] as const;

const SORT_PRESET_OPTIONS = [
  { label: '按人群覆盖重叠排序', value: 'coverage' },
  { label: '按人群规模排序', value: 'scale' },
  { label: '按相似度排序', value: 'similarity' },
] as const;

const PRESET_SORT: Record<
  (typeof SORT_PRESET_OPTIONS)[number]['value'],
  { key: SortKey; dir: SortDir }
> = {
  coverage: { key: 'coverageWan', dir: 'desc' },
  scale: { key: 'coverageWan', dir: 'asc' },
  similarity: { key: 'penetration', dir: 'desc' },
};

const SORT_COLUMN_LABEL: Record<SortKey, string> = {
  name: '推荐人群',
  coverageWan: '覆盖量级',
  penetration: '人群渗透率',
  r3Inflow: 'R3 流入率',
  adCount: '投放次数',
  insightCount: '洞察次数',
  updatedAt: '更新日期',
  launchedAt: '上线日期',
};

// 行业筛选 Chips（与设计稿一致，第二层平铺）
const INDUSTRY_CHIPS = [
  { label: '全部行业', value: 'all' },
  { label: '手机通讯', value: '手机通讯' },
  { label: '运动户外', value: '运动' },
  { label: '美妆护肤', value: '美妆' },
  { label: '母婴食品', value: '母婴' },
  { label: 'IT办公', value: 'IT办公' },
  { label: '奢侈品', value: '奢侈品' },
  { label: '宠物生活', value: '宠物生活' },
  { label: '汽车', value: '数码' }, // 用 '数码' 映射到 mock 数据
  { label: '景区乐园', value: '景区乐园' },
  { label: '游戏', value: '游戏' },
  { label: '家居', value: '家居' },
  { label: '大健康', value: '大健康' },
  { label: '汽车后市场', value: '汽车后市场' },
  { label: '娱乐休闲', value: '娱乐休闲' },
  { label: '大家电', value: '大家电' },
  { label: '生活电器', value: '生活电器' },
  { label: '婴童用品', value: '婴童用品' },
  { label: '休闲食品', value: '休闲食品' },
  { label: '食品原料调料', value: '食品原料调料' },
  { label: '乳制品', value: '乳制品' },
  { label: '办公设备', value: '办公设备' },
  { label: '酒类', value: '酒类' },
  { label: '场景人群', value: '场景人群' },
];

const MOCK_DATA: CrowdItem[] = [
  { id: '1', name: '美妆功效成分党', description: '对功效护肤有深度研究的人群', tags: [{ label: '热投', type: 'hot' }, { label: '热览', type: 'view' }, { label: '最新', type: 'new' }, { label: '美妆', type: 'industry' }], coverageWan: 1280, penetration: 18.6, r3Inflow: 4.32, adCount: 186, insightCount: 92, updatedAt: '2026-04-02', launchedAt: '2025-11-18', starred: true },
  { id: '2', name: '高奢商务人群', description: '对高端商务消费有高意向的人群', tags: [{ label: '热投', type: 'hot' }, { label: '美妆', type: 'industry' }], coverageWan: 420, penetration: 6.2, r3Inflow: 1.85, adCount: 64, insightCount: 41, updatedAt: '2026-03-28', launchedAt: '2025-09-05', starred: false },
  { id: '3', name: '运动健身人群', description: '对运动装备和健身有强需求的人群', tags: [{ label: '热览', type: 'view' }, { label: '最新', type: 'new' }, { label: '运动', type: 'industry' }], coverageWan: 2100, penetration: 22.1, r3Inflow: 5.9, adCount: 240, insightCount: 118, updatedAt: '2026-04-10', launchedAt: '2025-12-01', starred: true },
  { id: '4', name: '母婴精致育儿人群', description: '注重育儿品质的年轻父母', tags: [{ label: '热投', type: 'hot' }, { label: '母婴', type: 'industry' }], coverageWan: 960, penetration: 11.4, r3Inflow: 3.1, adCount: 132, insightCount: 76, updatedAt: '2026-04-08', launchedAt: '2025-10-22', starred: false },
  { id: '5', name: '数码极客发烧友', description: '对前沿数码产品有极高关注的人群', tags: [{ label: '热投', type: 'hot' }, { label: '热览', type: 'view' }, { label: '数码', type: 'industry' }], coverageWan: 780, penetration: 9.8, r3Inflow: 2.76, adCount: 178, insightCount: 105, updatedAt: '2026-04-01', launchedAt: '2025-08-14', starred: true },
  { id: '6', name: '轻奢箱包爱好者', description: '对轻奢品牌箱包感兴趣的人群', tags: [{ label: '最新', type: 'new' }, { label: '美妆', type: 'industry' }], coverageWan: 310, penetration: 4.5, r3Inflow: 1.2, adCount: 48, insightCount: 29, updatedAt: '2026-03-15', launchedAt: '2026-01-06', starred: false },
  { id: '7', name: '国潮服饰年轻人群', description: '热衷国潮服饰消费的Z世代', tags: [{ label: '热览', type: 'view' }, { label: '运动', type: 'industry' }], coverageWan: 1540, penetration: 16.3, r3Inflow: 4.01, adCount: 156, insightCount: 88, updatedAt: '2026-04-09', launchedAt: '2025-07-30', starred: false },
  { id: '8', name: '咖啡茶饮高频消费者', description: '对精品咖啡和茶饮有高频需求', tags: [{ label: '热投', type: 'hot' }, { label: '美妆', type: 'industry' }], coverageWan: 890, penetration: 10.2, r3Inflow: 2.95, adCount: 121, insightCount: 67, updatedAt: '2026-03-30', launchedAt: '2025-12-20', starred: false },
  { id: '9', name: '宠物经济核心人群', description: '宠物养育消费的核心用户群', tags: [{ label: '最新', type: 'new' }, { label: '母婴', type: 'industry' }], coverageWan: 670, penetration: 8.1, r3Inflow: 2.4, adCount: 98, insightCount: 54, updatedAt: '2026-04-06', launchedAt: '2025-11-02', starred: false },
  { id: '10', name: '汽车增换购意向人群', description: '有增购或换购汽车意向的人群', tags: [{ label: '热览', type: 'view' }, { label: '数码', type: 'industry' }], coverageWan: 1820, penetration: 14.7, r3Inflow: 3.88, adCount: 142, insightCount: 71, updatedAt: '2026-04-11', launchedAt: '2025-06-18', starred: false },
  { id: '11', name: '家居收纳美学人群', description: '对家居收纳有审美追求的人群', tags: [{ label: '美妆', type: 'industry' }], coverageWan: 540, penetration: 7.3, r3Inflow: 1.95, adCount: 76, insightCount: 44, updatedAt: '2026-03-22', launchedAt: '2025-09-28', starred: false },
  { id: '12', name: '游戏电竞核心玩家', description: '电竞游戏深度玩家群体', tags: [{ label: '热投', type: 'hot' }, { label: '最新', type: 'new' }, { label: '数码', type: 'industry' }], coverageWan: 1120, penetration: 13.5, r3Inflow: 3.62, adCount: 201, insightCount: 134, updatedAt: '2026-04-12', launchedAt: '2025-05-11', starred: false },
  { id: '13', name: '旅行户外探索人群', description: '热衷旅行和户外探险的群体', tags: [{ label: '热览', type: 'view' }, { label: '运动', type: 'industry' }], coverageWan: 980, penetration: 12.0, r3Inflow: 3.05, adCount: 112, insightCount: 63, updatedAt: '2026-04-04', launchedAt: '2025-10-08', starred: false },
  { id: '14', name: '健身瑜伽塑形人群', description: '注重健身塑形和瑜伽练习的人群', tags: [{ label: '热投', type: 'hot' }, { label: '运动', type: 'industry' }], coverageWan: 720, penetration: 9.4, r3Inflow: 2.58, adCount: 89, insightCount: 52, updatedAt: '2026-03-18', launchedAt: '2026-02-01', starred: false },
  { id: '15', name: '护肤抗初老人群', description: '关注抗初老护肤的年轻女性', tags: [{ label: '热览', type: 'view' }, { label: '最新', type: 'new' }, { label: '美妆', type: 'industry' }], coverageWan: 1350, penetration: 17.2, r3Inflow: 4.15, adCount: 168, insightCount: 96, updatedAt: '2026-04-07', launchedAt: '2025-12-15', starred: false },
  { id: '16', name: '零食快消尝鲜族', description: '热衷尝试新款零食快消品的群体', tags: [{ label: '美妆', type: 'industry' }], coverageWan: 610, penetration: 7.9, r3Inflow: 2.22, adCount: 71, insightCount: 38, updatedAt: '2026-03-25', launchedAt: '2025-11-30', starred: false },
  { id: '17', name: '投资理财稳健人群', description: '偏好稳健型投资理财的群体', tags: [{ label: '热览', type: 'view' }, { label: '数码', type: 'industry' }], coverageWan: 380, penetration: 5.1, r3Inflow: 1.42, adCount: 55, insightCount: 33, updatedAt: '2026-03-12', launchedAt: '2025-08-01', starred: false },
  { id: '18', name: '读书知识付费人群', description: '对知识付费和阅读有高需求的群体', tags: [{ label: '最新', type: 'new' }, { label: '母婴', type: 'industry' }], coverageWan: 290, penetration: 4.2, r3Inflow: 1.08, adCount: 42, insightCount: 27, updatedAt: '2026-04-03', launchedAt: '2026-01-20', starred: false },
  { id: '19', name: '影视综艺追剧人群', description: '深度追剧和综艺爱好者', tags: [{ label: '热投', type: 'hot' }, { label: '热览', type: 'view' }, { label: '运动', type: 'industry' }], coverageWan: 1680, penetration: 19.4, r3Inflow: 4.48, adCount: 195, insightCount: 102, updatedAt: '2026-04-13', launchedAt: '2025-04-09', starred: false },
  { id: '20', name: '萌宠短视频爱好者', description: '热衷萌宠内容的短视频用户', tags: [{ label: '热览', type: 'view' }, { label: '母婴', type: 'industry' }], coverageWan: 850, penetration: 10.8, r3Inflow: 2.88, adCount: 103, insightCount: 59, updatedAt: '2026-04-05', launchedAt: '2025-12-28', starred: false },
  { id: '21', name: '美妆熟龄向产品人群', description: '对成熟肌肤护理有需求的群体', tags: [{ label: '热投', type: 'hot' }, { label: '美妆', type: 'industry' }], coverageWan: 950, penetration: 12.3, r3Inflow: 3.45, adCount: 145, insightCount: 78, updatedAt: '2026-04-01', launchedAt: '2025-10-15', starred: false },
];

const PAGE_SIZE = 10;

function TagBadge({ tag }: { tag: { label: string; type: TagType } }) {
  const style = TAG_STYLES[tag.type];
  return (
    <span
      className="inline-flex h-4 items-center justify-center whitespace-nowrap rounded px-[3px] text-[10px] leading-[10px]"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {tag.label}
    </span>
  );
}

function StarButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="cursor-pointer"
      aria-label={active ? '取消收藏' : '收藏'}
      onClick={onClick}
    >
      <Icon
        name="star"
        size={18}
        color={
          active
            ? 'var(--odn-color-orange-6)'
            : 'var(--odn-color-black-5)'
        }
      />
    </button>
  );
}

function SortGlyph({ active, dir }: { active: boolean; dir: SortDir | null }) {
  if (!active || !dir) {
    return <span className="ml-0.5 font-mono text-black-6">↕</span>;
  }
  return (
    <span className="ml-0.5 font-mono text-blue-6">
      {dir === 'asc' ? '↑' : '↓'}
    </span>
  );
}

// ─── Mode 1: 卡片视图 ────────────────────────────────────────

function CardGridView({
  items,
  favorites,
  onToggleFavorite,
}: {
  items: CrowdItem[];
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <div className="px-6 pt-6 pb-6 grid grid-cols-3 gap-x-3 gap-y-3">
      {items.map((card) => (
        <div
          key={card.id}
          className="group relative flex flex-col gap-1 justify-center rounded-lg border border-black-4 bg-white px-5 py-4 hover:shadow-sm transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-1">
            <span className="text-base font-semibold text-black-12 truncate">
              {card.name}
            </span>
            <div className="flex items-center gap-1">
              {card.tags.map((tag) => (
                <TagBadge key={tag.label} tag={tag} />
              ))}
            </div>
          </div>
          <div className="absolute right-[17px] top-[17px]">
            <StarButton
              active={favorites.has(card.id)}
              onClick={() => onToggleFavorite(card.id)}
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-black-12">
            <span>
              R3流入率{' '}
              <span className="tabular-nums">{card.r3Inflow.toFixed(2)}%</span>
            </span>
            <span>
              人群渗透率{' '}
              <span className="tabular-nums">{card.penetration.toFixed(2)}%</span>
            </span>
          </div>
          <div className="flex items-end gap-[3px]">
            <span className="text-xl font-semibold text-black-12 tabular-nums">
              {card.coverageWan.toLocaleString('zh-CN')}
            </span>
            <span className="text-xs text-black-12 leading-6">万人</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Mode 2: 表格视图 ────────────────────────────────────────

const TABLE_COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'name', label: '推荐人群' },
  { key: 'coverageWan', label: '覆盖量级' },
  { key: 'penetration', label: '人群渗透率' },
  { key: 'r3Inflow', label: 'R3 流入率' },
  { key: 'adCount', label: '投放次数' },
  { key: 'insightCount', label: '洞察次数' },
  { key: 'updatedAt', label: '更新日期' },
  { key: 'launchedAt', label: '上线日期' },
];

function TableView({
  items,
  favorites,
  onToggleFavorite,
  sortKey,
  sortDir,
  onHeaderClick,
  page,
  onPageChange,
  totalCount,
}: {
  items: CrowdItem[];
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onHeaderClick: (key: SortKey) => void;
  page: number;
  onPageChange: (page: number) => void;
  totalCount: number;
}) {
  return (
    <>
      <div className="overflow-x-auto mx-6 mt-6 rounded-lg border border-black-3">
        <table className="w-full min-w-[960px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-black-3 bg-black-1 text-left text-black-9">
              {TABLE_COLUMNS.map((col) => (
                <th key={col.key} className="px-3 py-2.5 font-medium">
                  <button
                    type="button"
                    className="inline-flex items-center text-black-9 hover:text-black-12"
                    onClick={() => onHeaderClick(col.key)}
                  >
                    {col.label}
                    <SortGlyph
                      active={sortKey === col.key}
                      dir={sortKey === col.key ? sortDir : null}
                    />
                  </button>
                </th>
              ))}
              <th className="px-3 py-2.5 font-medium text-black-9">收藏</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr
                key={row.id}
                className="border-b border-black-3 transition-colors hover:bg-black-1"
              >
                <td className="px-3 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-medium text-black-12">{row.name}</span>
                    <div className="flex flex-wrap items-center gap-1">
                      {row.tags.map((tag) => (
                        <TagBadge key={`${row.id}-${tag.label}`} tag={tag} />
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 tabular-nums text-black-12">
                  {row.coverageWan.toLocaleString('zh-CN')}
                  <span className="text-black-9">万</span>
                </td>
                <td className="px-3 py-3 tabular-nums text-black-12">
                  {row.penetration.toFixed(2)}%
                </td>
                <td className="px-3 py-3 tabular-nums text-black-12">
                  {row.r3Inflow.toFixed(2)}%
                </td>
                <td className="px-3 py-3 tabular-nums text-black-12">
                  {row.adCount}
                </td>
                <td className="px-3 py-3 tabular-nums text-black-12">
                  {row.insightCount}
                </td>
                <td className="px-3 py-3 tabular-nums text-black-9">
                  {row.updatedAt}
                </td>
                <td className="px-3 py-3 tabular-nums text-black-9">
                  {row.launchedAt}
                </td>
                <td className="px-3 py-3">
                  <StarButton
                    active={favorites.has(row.id)}
                    onClick={() => onToggleFavorite(row.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end px-6 py-4">
        <Pagination
          value={page}
          totalSize={totalCount}
          pageSize={PAGE_SIZE}
          showTotal
          onChange={(_, p) => onPageChange(p)}
        />
      </div>
    </>
  );
}

// ─── 主组件 ────────────────────────────────────────────────

type ViewMode = 'card' | 'table';

const CrowdCardListBlock = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['key']>('industry');
  const [industry, setIndustry] = useState('all');
  const [search, setSearch] = useState('');
  const [sortPreset, setSortPreset] =
    useState<(typeof SORT_PRESET_OPTIONS)[number]['value']>('coverage');
  const [columnSort, setColumnSort] = useState<{
    key: SortKey;
    dir: SortDir;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(MOCK_DATA.filter((c) => c.starred).map((c) => c.id)),
  );

  const sortKey = columnSort?.key ?? PRESET_SORT[sortPreset].key;
  const sortDir = columnSort?.dir ?? PRESET_SORT[sortPreset].dir;

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredItems = useMemo(() => {
    let rows = [...MOCK_DATA];

    if (activeTab === 'favorite') {
      rows = rows.filter((r) => favorites.has(r.id));
    }

    if (search.trim()) {
      const q = search.trim();
      rows = rows.filter((r) => r.name.includes(q));
    }

    if (industry !== 'all') {
      rows = rows.filter((r) =>
        r.tags.some((t) => t.type === 'industry' && t.label === industry),
      );
    }

    const mul = sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') {
        return (av - bv) * mul;
      }
      return String(av).localeCompare(String(bv), 'zh-CN') * mul;
    });

    return rows;
  }, [activeTab, search, industry, sortKey, sortDir, favorites]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search, industry, sortPreset, columnSort]);

  const pagedItems = useMemo(
    () =>
      viewMode === 'table'
        ? filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
        : filteredItems,
    [filteredItems, page, viewMode],
  );

  const handleHeaderClick = (key: SortKey) => {
    setColumnSort((prev) => {
      if (prev?.key === key) {
        return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      }
      return { key, dir: 'desc' };
    });
  };

  const sortSelectOptions = [
    ...SORT_PRESET_OPTIONS,
    ...(columnSort
      ? [
          {
            label: `当前：${SORT_COLUMN_LABEL[columnSort.key]}（${
              columnSort.dir === 'asc' ? '升序' : '降序'
            }）`,
            value: '__column__',
          },
        ]
      : []),
  ];

  // 页面级浅灰底背景（与页面头部 DemoShell 一致），内层为 rounded-[12px] 白色 Card 面板
  return (
    <div className="bg-[#f2f4f9] p-6">
      <Card className="rounded-[12px]" elevation={0}>
        {/* 第一层：分类 Tab | 搜索 + 视图切换 —— 全部走 one-design-next 组件 */}
        <div className="flex items-center justify-between gap-3 px-6 pr-4 py-4 border-b border-black-4">
          <Tabs.Default
            items={TABS.map((t) => ({ value: t.key, label: t.label }))}
            value={activeTab}
            onChange={(v) => setActiveTab(v as (typeof TABS)[number]['key'])}
          />
          <div className="flex items-center gap-3 shrink-0">
            <Input
              className="w-[240px]"
              leftElement={<Icon name="search" />}
              placeholder="请输入"
              value={search}
              onChange={setSearch}
            />
            <Tabs.ButtonGroup
              items={[
                {
                  value: 'table',
                  label: <Icon name="menu" size={16} />,
                },
                {
                  value: 'card',
                  label: <Icon name="card-distribute" size={16} />,
                },
              ]}
              value={viewMode}
              onChange={(v) => setViewMode(v as ViewMode)}
            />
          </div>
        </div>

        {/* 第二层：行业 Chips + 排序选择器 —— 行业 Chips 用 Tabs.Tag（DS 原生 Tag 风格 Tab） */}
        <div className="flex items-start justify-between gap-3 px-6 py-4">
          <div className="min-w-0 flex-1">
            <Tabs.Tag
              items={INDUSTRY_CHIPS.map((c) => ({
                value: c.value,
                label: c.label,
              }))}
              value={industry}
              onChange={(v) => setIndustry(v as string)}
            />
          </div>
          <Select
            className="w-[220px] shrink-0"
            allowClear={false}
            value={columnSort ? '__column__' : sortPreset}
            options={sortSelectOptions}
            onChange={(v) => {
              if (v === '__column__') return;
              setSortPreset(v as (typeof SORT_PRESET_OPTIONS)[number]['value']);
              setColumnSort(null);
            }}
          />
        </div>

        {/* 视图内容 */}
        {viewMode === 'card' && (
          <CardGridView
            items={pagedItems}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}
        {viewMode === 'table' && (
          <TableView
            items={pagedItems}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            sortKey={sortKey}
            sortDir={sortDir}
            onHeaderClick={handleHeaderClick}
            page={page}
            onPageChange={setPage}
            totalCount={filteredItems.length}
          />
        )}
      </Card>
    </div>
  );
};

export default CrowdCardListBlock;
