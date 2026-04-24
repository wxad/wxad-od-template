'use client';

import { Checkbox, Icon } from 'one-design-next';
import clsx from 'clsx';
import React, { useState, useMemo } from 'react';

// ─── 类型 ────────────────────────────────────────────────

interface AreaItem {
  id: string;
  rank: number;
  name: string;
  penetration: number;
  address: string;
  stars: number;
  category?: string;
  distance?: number;
}

type ViewMode = 'store-list' | 'area-detail';

// ─── 模拟数据 ────────────────────────────────────────────

const STORES = [
  { id: 's1', name: '乐高品牌旗舰店(王府井店)', totalCrowd: 173 },
  { id: 's2', name: '蜜雪冰城(南关正街店)', totalCrowd: 92 },
  { id: 's3', name: '奈雪的茶(万象城店)', totalCrowd: 128 },
];

const AREAS: AreaItem[] = [
  {
    id: 'a1',
    rank: 1,
    name: '北京王府井银泰in88',
    penetration: 8.39,
    address: '北京市东城区王府井大街88号',
    stars: 5,
    category: '购物中心',
    distance: 60,
  },
  {
    id: 'a2',
    rank: 2,
    name: '淘汇新天',
    penetration: 8.02,
    address: '王府井大街219号地铁:8号线',
    stars: 5,
    category: '商场',
    distance: 120,
  },
  {
    id: 'a3',
    rank: 3,
    name: '金鱼胡同19号院',
    penetration: 7.89,
    address: '北京市东城区王府井东街与金鱼胡同交叉口东北方向61米左右',
    stars: 5,
    category: '住宅小区',
    distance: 200,
  },
  {
    id: 'a4',
    rank: 4,
    name: '王府井海港城',
    penetration: 7.6,
    address: '北京市东城区东华门街道柏树胡同与王府井大街交叉口西100米海港大厦',
    stars: 4,
    category: '商场',
    distance: 350,
  },
  {
    id: 'a5',
    rank: 5,
    name: '澳门中心',
    penetration: 7.43,
    address: '北京市东城区东华门街道王府井东街8号(近新东安百货)',
    stars: 4,
    category: '商业广场',
    distance: 280,
  },
  {
    id: 'a6',
    rank: 6,
    name: '东方新天地',
    penetration: 7.12,
    address: '北京市东城区东长安街1号',
    stars: 4,
    category: '购物中心',
    distance: 450,
  },
];

// ─── 排名徽章颜色 ──────────────────────────────────────────

function rankBadgeClass(rank: number): string {
  switch (rank) {
    case 1:
      return 'bg-[#ed776d] text-white font-semibold';
    case 2:
      return 'bg-[#fa8e00] text-white font-semibold';
    case 3:
      return 'bg-[#ffc300] text-white font-semibold';
    default:
      return 'bg-black-2 text-black-12 font-normal';
  }
}

// ─── 五星评级 ────────────────────────────────────────────

function StarRating({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Icon
          key={i}
          name="star"
          size={14}
          color={i < count ? '#F5A623' : 'var(--odn-color-black-4)'}
        />
      ))}
    </span>
  );
}

// ─── 区域卡片 ────────────────────────────────────────────

function AreaCard({
  area,
  checked,
  onCheck,
  onClick,
  isActive,
}: {
  area: AreaItem;
  checked: boolean;
  onCheck: (checked: boolean) => void;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <div
      className={clsx(
        'rounded-[8px] border px-4 py-3 cursor-pointer transition-colors',
        isActive
          ? 'border-blue-5 bg-[rgba(41,107,239,0.03)]'
          : 'border-black-6 hover:border-blue-4',
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 pb-1">
        <span
          className={clsx(
            'flex size-5 shrink-0 items-center justify-center rounded-full text-xs',
            rankBadgeClass(area.rank),
          )}
        >
          {area.rank}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-black-12">
          {area.name}
        </span>
        <Checkbox
          checked={checked}
          onChange={(e) => {
            e.stopPropagation();
            onCheck(!checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className="flex flex-col gap-0 text-xs leading-5 text-black-10">
        <span>预估渗透率：{area.penetration}%</span>
        <span className="line-clamp-2">地址：{area.address}</span>
        <span className="flex items-center gap-1">
          推荐等级：
          <StarRating count={area.stars} />
        </span>
      </div>
    </div>
  );
}

// ─── 地图占位组件 ────────────────────────────────────────

function MapPlaceholder({ activeArea }: { activeArea: AreaItem | null }) {
  const markers = [
    { name: '北京', x: 68, y: 28 },
    { name: '上海', x: 78, y: 46 },
    { name: '广州', x: 62, y: 70 },
    { name: '深圳', x: 66, y: 74 },
    { name: '成都', x: 42, y: 54 },
    { name: '杭州', x: 76, y: 50 },
    { name: '武汉', x: 62, y: 50 },
    { name: '西安', x: 50, y: 42 },
    { name: '南京', x: 74, y: 44 },
    { name: '重庆', x: 46, y: 56 },
    { name: '长沙', x: 62, y: 58 },
    { name: '福州', x: 74, y: 60 },
    { name: '沈阳', x: 80, y: 24 },
    { name: '哈尔滨', x: 78, y: 14 },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#dfe8f5] via-[#e8eef8] to-[#d4e3f0]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.7) 0%, transparent 45%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.5) 0%, transparent 40%)',
        }}
      />

      {markers.map((m) => (
        <div
          key={m.name}
          className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
          style={{ left: `${m.x}%`, top: `${m.y}%` }}
        >
          <div className="flex size-7 items-center justify-center rounded-[6px] bg-orange-4 text-white shadow-sm">
            <Icon name="map-pin" size={14} />
          </div>
          <span className="mt-0.5 whitespace-nowrap text-[9px] text-black-10">{m.name}</span>
        </div>
      ))}

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-[8px] border border-dashed border-black-6 bg-white/60 px-6 py-3 backdrop-blur-sm">
          <span className="text-sm text-black-8">此区域接入腾讯地图 API</span>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-4 text-[9px] text-black-8">
        <div className="mb-0.5 flex items-end gap-1">
          <div className="w-12 border-t border-black-8" />
          <span>1000 公里</span>
        </div>
        <div className="flex items-end gap-1">
          <div className="w-8 border-t border-black-8" />
          <span>500 英里</span>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-2 right-4 text-[8px] text-black-7">
        腾讯地图 ©2025 Tencent
      </div>

      {activeArea && (
        <div className="absolute right-4 top-4 z-20 w-[280px] rounded-[10px] border border-black-4 bg-white p-4 shadow-2">
          <div className="flex items-start gap-2">
            <span
              className={clsx(
                'flex size-5 shrink-0 items-center justify-center rounded-full text-xs',
                rankBadgeClass(activeArea.rank),
              )}
            >
              {activeArea.rank}
            </span>
            <span className="text-sm font-semibold text-black-12">{activeArea.name}</span>
          </div>
          <div className="mt-2 flex flex-col gap-1 text-xs">
            <div className="flex">
              <span className="w-[70px] shrink-0 text-black-8">类目：</span>
              <span className="text-black-11">{activeArea.category}</span>
            </div>
            <div className="flex">
              <span className="w-[70px] shrink-0 text-black-8">地址：</span>
              <span className="text-black-11">{activeArea.address}</span>
            </div>
            <div className="flex">
              <span className="w-[70px] shrink-0 text-black-8">距离门店：</span>
              <span className="text-black-11">{activeArea.distance} 米</span>
            </div>
            <div className="flex items-center">
              <span className="w-[70px] shrink-0 text-black-8">推荐等级：</span>
              <StarRating count={activeArea.stars} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 子元素状态展示 ──────────────────────────────────────

function RankBadgeShowcase() {
  const ranks = [1, 2, 3, 4, 5];
  return (
    <div className="rounded-[8px] border border-black-4 bg-white p-4">
      <h4 className="mb-3 text-sm font-semibold text-black-12">排名徽章状态</h4>
      <div className="flex items-center gap-3">
        {ranks.map((r) => (
          <div key={r} className="flex flex-col items-center gap-1">
            <span
              className={clsx(
                'flex size-5 items-center justify-center rounded-full text-xs',
                rankBadgeClass(r),
              )}
            >
              {r}
            </span>
            <span className="text-[10px] text-black-8">
              {r <= 3 ? `第${r}名` : `第${r}名+`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardStateShowcase() {
  const mockArea: AreaItem = {
    id: 'demo',
    rank: 1,
    name: '示例区域名称',
    penetration: 8.39,
    address: '示例地址信息',
    stars: 5,
  };

  return (
    <div className="rounded-[8px] border border-black-4 bg-white p-4">
      <h4 className="mb-3 text-sm font-semibold text-black-12">卡片交互状态</h4>
      <div className="flex flex-col gap-3">
        <div>
          <span className="mb-1 block text-xs text-black-8">默认</span>
          <div className="rounded-[8px] border border-black-6 px-4 py-3">
            <div className="flex items-center gap-2 pb-1">
              <span className="flex size-5 items-center justify-center rounded-full bg-[#ed776d] text-xs font-semibold text-white">
                1
              </span>
              <span className="text-sm font-semibold text-black-12">{mockArea.name}</span>
            </div>
            <span className="text-xs text-black-10">预估渗透率：{mockArea.penetration}%</span>
          </div>
        </div>
        <div>
          <span className="mb-1 block text-xs text-black-8">选中 / 激活</span>
          <div className="rounded-[8px] border border-blue-5 bg-[rgba(41,107,239,0.03)] px-4 py-3">
            <div className="flex items-center gap-2 pb-1">
              <span className="flex size-5 items-center justify-center rounded-full bg-[#ed776d] text-xs font-semibold text-white">
                1
              </span>
              <span className="text-sm font-semibold text-black-12">{mockArea.name}</span>
            </div>
            <span className="text-xs text-black-10">预估渗透率：{mockArea.penetration}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StarRatingShowcase() {
  return (
    <div className="rounded-[8px] border border-black-4 bg-white p-4">
      <h4 className="mb-3 text-sm font-semibold text-black-12">推荐等级</h4>
      <div className="flex flex-col gap-2">
        {[5, 4, 3, 2, 1].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <StarRating count={s} />
            <span className="text-xs text-black-8">{s} 星</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 配置面板 ────────────────────────────────────────────

function ConfigPanel({
  viewMode,
  onViewModeChange,
  showMapCard,
  onShowMapCardChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  showMapCard: boolean;
  onShowMapCardChange: (v: boolean) => void;
}) {
  return (
    <div className="rounded-[8px] border border-black-4 bg-white p-4">
      <h4 className="mb-3 text-sm font-semibold text-black-12">配置项</h4>
      <div className="flex flex-col gap-3">
        <div>
          <span className="mb-1 block text-xs text-black-9">视图模式</span>
          <div className="flex gap-2">
            <button
              className={clsx(
                'rounded-[6px] px-3 py-1.5 text-xs transition-colors',
                viewMode === 'area-detail'
                  ? 'bg-blue-6 text-white'
                  : 'bg-black-2 text-black-10 hover:bg-black-3',
              )}
              onClick={() => onViewModeChange('area-detail')}
            >
              推荐区域列表
            </button>
            <button
              className={clsx(
                'rounded-[6px] px-3 py-1.5 text-xs transition-colors',
                viewMode === 'store-list'
                  ? 'bg-blue-6 text-white'
                  : 'bg-black-2 text-black-10 hover:bg-black-3',
              )}
              onClick={() => onViewModeChange('store-list')}
            >
              门店列表
            </button>
          </div>
        </div>
        <div>
          <label className="flex items-center gap-2">
            <Checkbox checked={showMapCard} onChange={() => onShowMapCardChange(!showMapCard)} />
            <span className="text-xs text-black-10">显示地图详情卡片</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ─── 门店列表视图 ────────────────────────────────────────

function StoreListView({ onDrillDown }: { onDrillDown: (storeId: string) => void }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-6 pb-2 pt-4">
        <span className="text-sm font-semibold text-black-12">门店信息</span>
        <span className="text-xs text-black-8">
          预估高价值区域的汇总人群数量为 3,262（未去重）
        </span>
      </div>
      <div className="flex flex-col gap-3 px-6 pb-4">
        {STORES.map((store) => (
          <div
            key={store.id}
            className="cursor-pointer rounded-[8px] border border-black-6 px-4 py-3 transition-colors hover:border-blue-4"
            onClick={() => onDrillDown(store.id)}
          >
            <div className="text-sm font-semibold text-black-12">{store.name}</div>
            <div className="mt-1 text-xs text-black-10">
              高价值区域数量：{store.totalCrowd}{' '}
              <span className="cursor-pointer text-blue-6 hover:underline">查看 &gt;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 主组件 ────────────────────────────────────────────────

const StoreInsightPanel = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('area-detail');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>('a1');
  const [showMapCard, setShowMapCard] = useState(true);

  const activeArea = useMemo(
    () => AREAS.find((a) => a.id === activeId) ?? null,
    [activeId],
  );

  const handleCheck = (id: string, checked: boolean) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (checkedIds.size === AREAS.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(AREAS.map((a) => a.id)));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── 预览 ─────────────────────────────────────── */}
      <div className="overflow-hidden rounded-[12px] border border-black-4 bg-white">
        <div className="flex" style={{ height: 560 }}>
          {/* 左侧面板 */}
          <div className="flex w-[360px] shrink-0 flex-col border-r border-black-4 overflow-hidden">
            {viewMode === 'store-list' ? (
              <StoreListView onDrillDown={() => setViewMode('area-detail')} />
            ) : (
              <>
                <div className="flex items-center gap-2 px-6 pb-2 pt-4">
                  <div className="flex min-w-0 flex-1 items-center gap-1">
                    <button
                      className="shrink-0 text-black-9 hover:text-black-12"
                      onClick={() => setViewMode('store-list')}
                    >
                      <Icon name="arrow-left" size={18} />
                    </button>
                    <span className="min-w-0 truncate text-base font-semibold text-black-12">
                      乐高品牌旗舰店(王府井店)
                    </span>
                  </div>
                  <Icon name="bar-chart" size={16} className="shrink-0 text-black-8" />
                  <div className="flex shrink-0 items-center gap-3 text-sm text-blue-6">
                    <button className="hover:underline">下载</button>
                    <button className="hover:underline" onClick={handleSelectAll}>
                      全选
                    </button>
                  </div>
                </div>

                <div className="px-6 pb-2 text-xs">
                  <span className="text-black-12">
                    预估高价值区域的汇总人群数量为 173
                  </span>
                  <span className="text-black-8">（未去重）</span>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-4">
                  <div className="flex flex-col gap-3">
                    {AREAS.map((area) => (
                      <AreaCard
                        key={area.id}
                        area={area}
                        checked={checkedIds.has(area.id)}
                        onCheck={(c) => handleCheck(area.id, c)}
                        onClick={() => setActiveId(area.id)}
                        isActive={activeId === area.id}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 右侧地图占位 */}
          <div className="flex-1 min-w-0">
            <MapPlaceholder activeArea={showMapCard ? activeArea : null} />
          </div>
        </div>
      </div>

      {/* ── 子元素状态展示 ──────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <RankBadgeShowcase />
        <CardStateShowcase />
        <StarRatingShowcase />
      </div>

      {/* ── 配置面板 ──────────────────────────────── */}
      <ConfigPanel
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showMapCard={showMapCard}
        onShowMapCardChange={setShowMapCard}
      />
    </div>
  );
};

export default StoreInsightPanel;
