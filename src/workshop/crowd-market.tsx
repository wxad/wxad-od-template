'use client';

import clsx from 'clsx';
import {
  Button,
  Card,
  Icon,
  Input,
  RuyiLayout,
  Select,
  Tooltip,
  type RuyiMenuItem,
} from 'one-design-next';
import React, { useMemo, useRef, useState } from 'react';
import CrowdCardListBlock from '../blocks/crowd-card-list';

const NAV_ITEMS = [
  '首页',
  '洞察诊断',
  '人群策略',
  '策略应用',
  '全域度量',
];

// 顶栏 label → workshop 页面 slug（本文件独立维护，不与其他 workshop 页面共享）
const NAV_ROUTES: Record<string, string> = {
  '首页': 'home',
  '洞察诊断': 'compete-analysis',
  '人群策略': 'r-zero-crowd',
  '策略应用': 'insight-ip',
  '全域度量': 'review',
};

function navigateNav(label: string) {
  const slug = NAV_ROUTES[label];
  if (!slug || typeof window === 'undefined') return;
  // 替换当前 URL 最后一段为目标 slug，保留 ?fullscreen=1 等查询参数
  const url = new URL(window.location.href);
  const segments = url.pathname.replace(/\/+$/, '').split('/');
  segments[segments.length - 1] = slug;
  url.pathname = segments.join('/');
  window.location.href = url.toString();
}

const MENU_ITEMS: RuyiMenuItem[] = [
  {
    key: 'recommend',
    label: '推荐人群',
    icon: 'users',
    children: [
      { key: 'ai-crowd', label: 'AI智选人群' },
      { key: 'r0-audience-market', label: '推荐人群市场' },
    ],
  },
  {
    key: 'crowd-manage',
    label: '人群管理',
    icon: 'user-edit',
    children: [
      { key: 'crowd-list', label: '人群列表' },
      { key: 'crowd-insight', label: '人群观察' },
    ],
  },
];

// 菜单 key → workshop 页面 slug（本文件独立维护，不与其他 workshop 页面共享）
const MENU_ROUTES: Record<string, string> = {
  'ai-crowd': 'ai-smart-crowd',
  'r0-audience-market': 'r0-audience-market',
  'crowd-list': 'custom-audience-list',
  'crowd-insight': 'audience-profile',
};

function navigateMenu(key: string) {
  const slug = MENU_ROUTES[key];
  if (!slug || typeof window === 'undefined') return;
  // 替换当前 URL 最后一段为目标 slug，保留 ?fullscreen=1 等查询参数
  const url = new URL(window.location.href);
  const segments = url.pathname.replace(/\/+$/, '').split('/');
  segments[segments.length - 1] = slug;
  url.pathname = segments.join('/');
  window.location.href = url.toString();
}

// ---------- 品牌人群选择器 ----------

const BRAND_CROWDS = [
  { key: 'r1', label: '品牌 R1 人群' },
  { key: 'r2', label: '品牌 R2 人群' },
  { key: 'r3', label: '品牌 R3 人群' },
  { key: 'r4', label: '品牌 R4 人群' },
  { key: 'r5', label: '品牌 R5 人群' },
  { key: '5r', label: '品牌 5R 人群' },
];

type CustomCrowd = {
  id: string;
  name: string;
  size: number;
  status: '计算成功' | '计算失败' | '计算中' | '未计算';
  time?: string;
};

const CUSTOM_CROWDS: CustomCrowd[] = [
  {
    id: '2561025610',
    name: '410362-分众_深圳壹栈山前_常驻人群',
    size: 2929,
    status: '计算成功',
    time: '2026-01-05 21:14:14',
  },
  {
    id: '2561025611',
    name: '410362-分众_深圳壹栈山前_常驻人群',
    size: 2929,
    status: '计算失败',
    time: '2026-01-05 21:14:14',
  },
  {
    id: '2561025612',
    name: '410362-分众_深圳壹栈山前_常驻人群',
    size: 2929,
    status: '计算中',
    time: '2026-01-05 21:14:14',
  },
  {
    id: '2561025613',
    name: '410362-分众_深圳壹栈山前_常驻人群',
    size: 2929,
    status: '未计算',
  },
  {
    id: '2561025614',
    name: '410362-分众_深圳壹栈山前_常驻人群',
    size: 2929,
    status: '未计算',
  },
  {
    id: '2561025615',
    name: '410362-分众_深圳壹栈山前_常驻人群',
    size: 2929,
    status: '未计算',
  },
];

const STATUS_STYLE: Record<CustomCrowd['status'], string> = {
  计算成功: 'text-green-6',
  计算失败: 'text-red-6',
  计算中: 'text-orange-6',
  未计算: 'text-black-8',
};

function CrowdSourcePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'brand' | 'custom'>('brand');
  const [customFilter, setCustomFilter] = useState('all');
  const [customSearch, setCustomSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const displayLabel = BRAND_CROWDS.find((c) => c.key === value)?.label
    ? BRAND_CROWDS.find((c) => c.key === value)!.label.replace(' 人群', '')
    : CUSTOM_CROWDS.find((c) => c.id === value)
      ? `${CUSTOM_CROWDS.find((c) => c.id === value)!.name}`
      : '品牌 R3';

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-black-4 bg-white hover:border-blue-5 cursor-pointer transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="text-base font-semibold text-black-12 max-w-[260px] truncate">
          {displayLabel}
        </span>
        <Icon name={open ? 'up' : 'down'} size={16} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-[420px] bg-white rounded-xl shadow-xl border border-black-3 z-50 overflow-hidden">
          <div className="flex border-b border-black-3">
            <button
              className={clsx(
                'flex-1 text-sm py-3 text-center cursor-pointer transition-colors',
                tab === 'brand'
                  ? 'text-blue-6 font-semibold border-b-2 border-blue-6'
                  : 'text-black-9 hover:text-black-12',
              )}
              onClick={() => setTab('brand')}
            >
              品牌人群资产
            </button>
            <button
              className={clsx(
                'flex-1 text-sm py-3 text-center cursor-pointer transition-colors',
                tab === 'custom'
                  ? 'text-blue-6 font-semibold border-b-2 border-blue-6'
                  : 'text-black-9 hover:text-black-12',
              )}
              onClick={() => setTab('custom')}
            >
              自定义人群
            </button>
          </div>

          {tab === 'brand' ? (
            <div className="py-1">
              {BRAND_CROWDS.map((c) => (
                <button
                  key={c.key}
                  className={clsx(
                    'w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors',
                    value === c.key
                      ? 'text-blue-6 bg-blue-1'
                      : 'text-black-11 hover:bg-black-1',
                  )}
                  onClick={() => {
                    onChange(c.key);
                    setOpen(false);
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 px-4 py-3">
                <Select
                  className="w-[100px]"
                  size="small"
                  allowClear={false}
                  prefix={<span className="text-black-9">状态</span>}
                  value={customFilter}
                  options={[
                    { label: '全部', value: 'all' },
                    { label: '计算成功', value: '计算成功' },
                    { label: '计算中', value: '计算中' },
                  ]}
                  onChange={setCustomFilter}
                />
                <Input
                  className="flex-1"
                  size="small"
                  placeholder="请输入"
                  value={customSearch}
                  onChange={setCustomSearch}
                  leftElement={<Icon name="search" size={14} />}
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-black-8 border-b border-black-3">
                      <th className="text-left font-normal px-4 py-2">
                        人群ID
                      </th>
                      <th className="text-left font-normal px-2 py-2">
                        人群名称
                      </th>
                      <th className="text-right font-normal px-2 py-2">
                        人群量级
                      </th>
                      <th className="text-left font-normal px-2 py-2">状态</th>
                      <th className="text-left font-normal px-2 py-2">
                        计算时间
                      </th>
                      <th className="text-right font-normal px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {CUSTOM_CROWDS.map((c) => (
                      <tr
                        key={c.id}
                        className={clsx(
                          'border-b border-black-2 cursor-pointer transition-colors',
                          value === c.id ? 'bg-blue-1' : 'hover:bg-black-1',
                        )}
                        onClick={() => {
                          if (c.status === '计算成功') {
                            onChange(c.id);
                            setOpen(false);
                          }
                        }}
                      >
                        <td className="px-4 py-2.5 text-black-10 tabular-nums">
                          {c.id}
                        </td>
                        <td className="px-2 py-2.5 text-black-11 max-w-[120px] truncate">
                          {c.name}
                        </td>
                        <td className="px-2 py-2.5 text-right text-black-10 tabular-nums">
                          {c.size.toLocaleString()}
                        </td>
                        <td
                          className={clsx(
                            'px-2 py-2.5',
                            STATUS_STYLE[c.status],
                          )}
                        >
                          {c.status}
                        </td>
                        <td className="px-2 py-2.5 text-black-8 tabular-nums">
                          {c.time || '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {c.status === '计算成功' && (
                            <span className="text-blue-6 cursor-pointer hover:underline">
                              重新计算
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- 涟漪图数据 ----------

type RippleDot = {
  name: string;
  x: number;
  y: number;
  size: 'sm' | 'md' | 'lg';
  similarity: 'low' | 'mid' | 'high';
  align: 'left' | 'right';
  scale: number;
  industry: string;
  deliveries: number;
  insights: number;
  simPercent: string;
  penetration: string;
};

const RIPPLE_DOTS: RippleDot[] = [
  {
    name: '口香糖兴趣人群',
    x: 10,
    y: 8,
    size: 'sm',
    similarity: 'mid',
    align: 'left',
    scale: 3211,
    industry: '食品',
    deliveries: 856,
    insights: 423,
    simPercent: '42.3%',
    penetration: '8.1%',
  },
  {
    name: '美妆男性向产品人群',
    x: 22,
    y: 18,
    size: 'md',
    similarity: 'low',
    align: 'left',
    scale: 7654,
    industry: '美妆',
    deliveries: 1243,
    insights: 892,
    simPercent: '28.5%',
    penetration: '5.3%',
  },
  {
    name: '足球周边兴趣人群',
    x: 30,
    y: 18,
    size: 'md',
    similarity: 'mid',
    align: 'left',
    scale: 5432,
    industry: '运动',
    deliveries: 976,
    insights: 654,
    simPercent: '51.2%',
    penetration: '9.8%',
  },
  {
    name: '马拉松参与人群',
    x: 14,
    y: 37,
    size: 'sm',
    similarity: 'low',
    align: 'left',
    scale: 2100,
    industry: '运动',
    deliveries: 432,
    insights: 287,
    simPercent: '22.1%',
    penetration: '4.2%',
  },
  {
    name: '西式快餐兴趣人群',
    x: 25,
    y: 37,
    size: 'lg',
    similarity: 'low',
    align: 'left',
    scale: 12890,
    industry: '食品',
    deliveries: 2345,
    insights: 1567,
    simPercent: '31.4%',
    penetration: '6.7%',
  },
  {
    name: '滑雪兴趣人群',
    x: 12,
    y: 66,
    size: 'lg',
    similarity: 'high',
    align: 'left',
    scale: 8765,
    industry: '运动',
    deliveries: 1892,
    insights: 1234,
    simPercent: '78.3%',
    penetration: '15.6%',
  },
  {
    name: '城市精英车主',
    x: 32,
    y: 63,
    size: 'lg',
    similarity: 'mid',
    align: 'left',
    scale: 15432,
    industry: '汽车',
    deliveries: 3456,
    insights: 2345,
    simPercent: '55.8%',
    penetration: '11.2%',
  },
  {
    name: '游戏硬核玩家',
    x: 15,
    y: 85,
    size: 'md',
    similarity: 'low',
    align: 'left',
    scale: 9876,
    industry: '游戏',
    deliveries: 2134,
    insights: 1567,
    simPercent: '25.6%',
    penetration: '5.1%',
  },
  {
    name: '美妆功效成分党',
    x: 38,
    y: 85,
    size: 'sm',
    similarity: 'low',
    align: 'left',
    scale: 4321,
    industry: '美妆',
    deliveries: 876,
    insights: 543,
    simPercent: '33.2%',
    penetration: '6.8%',
  },
  {
    name: '美妆熟龄向产品人群',
    x: 58,
    y: 13,
    size: 'md',
    similarity: 'high',
    align: 'right',
    scale: 10321,
    industry: '美妆',
    deliveries: 2456,
    insights: 1789,
    simPercent: '66.6%',
    penetration: '66.6%',
  },
  {
    name: '网球核心人群',
    x: 72,
    y: 15,
    size: 'lg',
    similarity: 'high',
    align: 'right',
    scale: 8888,
    industry: '运动',
    deliveries: 1654,
    insights: 1123,
    simPercent: '72.4%',
    penetration: '14.3%',
  },
  {
    name: '孕期品质人群',
    x: 86,
    y: 11,
    size: 'sm',
    similarity: 'low',
    align: 'right',
    scale: 3456,
    industry: '母婴',
    deliveries: 654,
    insights: 432,
    simPercent: '21.3%',
    penetration: '4.5%',
  },
  {
    name: '自驾游爱好者',
    x: 66,
    y: 34,
    size: 'sm',
    similarity: 'mid',
    align: 'right',
    scale: 5678,
    industry: '旅游',
    deliveries: 1098,
    insights: 765,
    simPercent: '48.7%',
    penetration: '9.1%',
  },
  {
    name: '耳机核心人群',
    x: 83,
    y: 35,
    size: 'md',
    similarity: 'low',
    align: 'right',
    scale: 7654,
    industry: '数码',
    deliveries: 1432,
    insights: 987,
    simPercent: '29.8%',
    penetration: '5.6%',
  },
  {
    name: '黄金饰品兴趣人群',
    x: 76,
    y: 55,
    size: 'md',
    similarity: 'mid',
    align: 'right',
    scale: 6543,
    industry: '珠宝',
    deliveries: 1234,
    insights: 876,
    simPercent: '52.1%',
    penetration: '10.4%',
  },
  {
    name: '眼镜产品兴趣人群',
    x: 62,
    y: 58,
    size: 'md',
    similarity: 'low',
    align: 'right',
    scale: 4321,
    industry: '配饰',
    deliveries: 876,
    insights: 654,
    simPercent: '35.4%',
    penetration: '7.2%',
  },
  {
    name: '时尚潮流人群',
    x: 70,
    y: 80,
    size: 'sm',
    similarity: 'high',
    align: 'right',
    scale: 11234,
    industry: '服饰',
    deliveries: 2567,
    insights: 1876,
    simPercent: '68.9%',
    penetration: '13.7%',
  },
  {
    name: '出境游探旅人群',
    x: 85,
    y: 80,
    size: 'lg',
    similarity: 'high',
    align: 'right',
    scale: 15678,
    industry: '旅游',
    deliveries: 3456,
    insights: 2345,
    simPercent: '74.2%',
    penetration: '14.8%',
  },
  {
    name: '高奢商务人群',
    x: 55,
    y: 85,
    size: 'lg',
    similarity: 'mid',
    align: 'right',
    scale: 13456,
    industry: '奢品',
    deliveries: 2987,
    insights: 2123,
    simPercent: '58.3%',
    penetration: '11.6%',
  },
];

const DOT_SIZE_MAP = { sm: 12, md: 20, lg: 28 } as const;
const DOT_COLOR_MAP = {
  low: 'var(--odn-color-blue-4)',
  mid: 'var(--odn-color-blue-5)',
  high: 'var(--odn-color-blue-6)',
} as const;

// ---------- 气泡 Tooltip ----------

function BubbleTooltipContent({
  dot,
  crowdLabel,
}: {
  dot: RippleDot;
  crowdLabel: string;
}) {
  return (
    <div className="min-w-[200px] text-xs">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-sm text-black-12">{dot.name}</span>
        <span className="text-black-8">{dot.industry}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
        <div className="flex justify-between">
          <span className="text-black-8">人群规模(万人)</span>
          <span className="text-black-12 tabular-nums">
            {dot.scale.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-black-8">投放次数</span>
          <span className="text-black-12 tabular-nums">
            {dot.deliveries.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-black-8">洞察次数</span>
          <span className="text-black-12 tabular-nums">
            {dot.insights.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="border-t border-black-3 pt-2">
        <div className="text-black-8 mb-1.5">对比 {crowdLabel}</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="flex justify-between">
            <span className="text-black-8">人群相似度</span>
            <span className="text-black-12 tabular-nums">{dot.simPercent}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black-8">人群渗透率</span>
            <span className="text-black-12 tabular-nums">
              {dot.penetration}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- 涟漪图 ----------

const CATEGORY_OPTIONS = [
  { label: '全部机会人群', value: 'all' },
  { label: '行业优选', value: 'industry' },
  { label: '兴趣精选', value: 'interest' },
  { label: '主题甄选', value: 'theme' },
];

function RippleChart() {
  const [crowdSource, setCrowdSource] = useState('r3');
  const [category, setCategory] = useState('all');
  const [rippleView, setRippleView] = useState<'chart' | 'list'>('chart');

  const crowdLabel =
    BRAND_CROWDS.find((c) => c.key === crowdSource)?.label?.replace(
      ' 人群',
      '',
    ) || '品牌 R3';

  return (
    <Card elevation={0} className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-black-3 px-3 py-3">
        <div className="flex items-center gap-2">
          <CrowdSourcePicker value={crowdSource} onChange={setCrowdSource} />
          <span className="text-base font-semibold text-black-12">
            的相似人群探索
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button light icon="download" iconPosition="left">
            下载数据
          </Button>
          <div className="flex items-center rounded-lg bg-black-1 p-[3px]">
            <button
              className={clsx(
                'flex items-center justify-center rounded-md size-[30px] cursor-pointer transition-colors',
                rippleView === 'list' ? 'bg-white shadow-sm' : '',
              )}
              onClick={() => setRippleView('list')}
            >
              <Icon name="menu" size={16} />
            </button>
            <button
              className={clsx(
                'flex items-center justify-center rounded-md size-[30px] cursor-pointer transition-colors',
                rippleView === 'chart' ? 'bg-white shadow-sm' : '',
              )}
              onClick={() => setRippleView('chart')}
            >
              <Icon name="grid" size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-1">
          <Select
            className="w-[160px]"
            allowClear={false}
            value={category}
            onChange={setCategory}
            options={CATEGORY_OPTIONS}
          />
          <span className="text-sm text-black-12 ml-1">似度 TOP20 人群</span>
        </div>
        <div className="flex items-center gap-2">
          {rippleView === 'chart' && (
            <>
              <div className="flex items-center gap-3 px-3 py-[7px]">
                <span className="text-sm text-black-12">人群规模</span>
                <span className="text-sm text-black-12">高</span>
                <span
                  className="inline-block rounded-full w-5 h-5 bg-[var(--odn-color-blue-6)]"
                />
                <span
                  className="inline-block rounded-full w-4 h-4 bg-[var(--odn-color-blue-5)]"
                />
                <span
                  className="inline-block rounded-full w-3 h-3 bg-[var(--odn-color-blue-4)]"
                />
                <span className="text-sm text-black-12">低</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-[7px]">
                <span className="text-sm text-black-12">人群相似度</span>
                <span className="text-sm text-black-12">低</span>
                <span
                  className="inline-block rounded-full size-3 bg-[var(--odn-color-blue-4)]"
                />
                <span
                  className="inline-block rounded-full size-3 bg-[var(--odn-color-blue-5)]"
                />
                <span
                  className="inline-block rounded-full size-3 bg-[var(--odn-color-blue-6)]"
                />
                <span className="text-sm text-black-12">高</span>
              </div>
            </>
          )}
          {rippleView === 'list' && (
            <span className="text-sm text-black-9">
              {crowdLabel} 人群规模{' '}
              <span className="font-semibold text-black-12 tabular-nums">
                295,317,468
              </span>
            </span>
          )}
        </div>
      </div>

      {rippleView === 'chart' ? (
        <div className="px-6 pb-6">
          <div
            className="relative w-full overflow-hidden rounded-xl h-[328px]"
            style={{
              background:
                'linear-gradient(90deg, rgba(41,107,239,0.05) 0%, rgba(41,107,239,0.05) 100%), #fff',
            }}
          >
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border w-[840px] h-[840px]"
              style={{
                borderColor: 'rgba(41,107,239,0.08)',
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border w-[506px] h-[506px]"
              style={{
                borderColor: 'rgba(41,107,239,0.12)',
              }}
            />

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center rounded-full bg-blue-6 text-white text-center size-[160px]">
              <span className="text-sm leading-[22px]">{crowdLabel} 人群</span>
              <span className="text-lg font-semibold leading-[26px] tabular-nums">
                295,317,468
              </span>
            </div>

            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 w-[40%]">
              <span
                className="text-xs whitespace-nowrap text-[rgba(41,107,239,0.5)]"
              >
                相似度低
              </span>
              <div
                className="flex-1 h-0"
                style={{ borderTop: '1px dashed rgba(41,107,239,0.2)' }}
              />
              <span
                className="text-xs whitespace-nowrap text-[rgba(41,107,239,0.5)]"
              >
                相似度高
              </span>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 w-[40%]">
              <span
                className="text-xs whitespace-nowrap text-[rgba(41,107,239,0.5)]"
              >
                相似度高
              </span>
              <div
                className="flex-1 h-0"
                style={{ borderTop: '1px dashed rgba(41,107,239,0.2)' }}
              />
              <span
                className="text-xs whitespace-nowrap text-[rgba(41,107,239,0.5)]"
              >
                相似度低
              </span>
            </div>

            {RIPPLE_DOTS.map((dot) => {
              const s = DOT_SIZE_MAP[dot.size];
              return (
                <Tooltip
                  key={dot.name}
                  content={
                    <BubbleTooltipContent
                      dot={dot}
                      crowdLabel={`${crowdLabel} 人群`}
                    />
                  }
                >
                  <div
                    className="absolute flex items-center gap-2 cursor-pointer"
                    style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                  >
                    {dot.align === 'left' && (
                      <span className="text-sm text-black-12 whitespace-nowrap">
                        {dot.name}
                      </span>
                    )}
                    <span
                      className="inline-block rounded-full flex-none"
                      style={{
                        width: s,
                        height: s,
                        backgroundColor: DOT_COLOR_MAP[dot.similarity],
                      }}
                    />
                    {dot.align === 'right' && (
                      <span className="text-sm text-black-12 whitespace-nowrap">
                        {dot.name}
                      </span>
                    )}
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>
      ) : (
        <RippleTableView crowdLabel={crowdLabel} />
      )}
    </Card>
  );
}

// ---------- 涟漪图 - 表格视图 ----------

type SortKey =
  | 'scale'
  | 'simPercent'
  | 'penetration'
  | 'deliveries'
  | 'insights';

function RippleTableView({ crowdLabel }: { crowdLabel: string }) {
  const [sortKey, setSortKey] = useState<SortKey>('scale');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = useMemo(() => {
    const getValue = (d: RippleDot) => {
      switch (sortKey) {
        case 'scale':
          return d.scale;
        case 'simPercent':
          return parseFloat(d.simPercent);
        case 'penetration':
          return parseFloat(d.penetration);
        case 'deliveries':
          return d.deliveries;
        case 'insights':
          return d.insights;
      }
    };
    return [...RIPPLE_DOTS].sort((a, b) =>
      sortDir === 'desc'
        ? getValue(b) - getValue(a)
        : getValue(a) - getValue(b),
    );
  }, [sortKey, sortDir]);

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      className="text-left font-normal px-3 py-2.5 text-black-9 cursor-pointer select-none hover:text-black-12 transition-colors whitespace-nowrap"
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center gap-0.5">
        {label}
        <span
          className={clsx(
            'text-[10px]',
            sortKey === field ? 'text-blue-6' : 'text-black-5',
          )}
        >
          {sortKey === field ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
        </span>
      </span>
    </th>
  );

  return (
    <div className="px-3 pb-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black-3">
            <th className="text-left font-normal px-3 py-2.5 text-black-9">
              推荐人群
            </th>
            <SortHeader label="覆盖量级" field="scale" />
            <SortHeader label="人群相似度" field="simPercent" />
            <SortHeader label="人群渗透率" field="penetration" />
            <SortHeader label="投放次数" field="deliveries" />
            <SortHeader label="洞察次数" field="insights" />
            <th className="text-center font-normal px-3 py-2.5 text-black-9">
              收藏
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((dot, i) => (
            <tr
              key={dot.name}
              className={clsx(
                'border-b border-black-2 transition-colors hover:bg-blue-1',
                i === 1 && 'bg-orange-1/30',
              )}
            >
              <td className="px-3 py-3">
                <span className="font-medium text-black-12">{dot.name}</span>
                <span className="ml-2 inline-flex items-center gap-1">
                  <span
                    className="inline-flex h-4 px-[3px] rounded text-[10px] leading-[10px] bg-[var(--odn-color-orange-1)] text-[var(--odn-color-orange-7)]"
                  >
                    热投
                  </span>
                  <span
                    className="inline-flex h-4 px-[3px] rounded text-[10px] leading-[10px] bg-[var(--odn-color-lightblue-1,#f5fbff)] text-[var(--odn-color-lightblue-7,#2190d9)]"
                  >
                    热览
                  </span>
                  <span
                    className="inline-flex h-4 px-[3px] rounded text-[10px] leading-[10px] bg-[var(--odn-color-blue-1)] text-[var(--odn-color-blue-7)]"
                  >
                    最新
                  </span>
                  <span
                    className="inline-flex h-4 px-[3px] rounded text-[10px] leading-[10px] bg-[var(--odn-color-black-2)] text-[var(--odn-color-black-12)]"
                  >
                    {dot.industry}
                  </span>
                </span>
              </td>
              <td className="px-3 py-3 text-black-11 tabular-nums">
                <div className="flex items-center gap-2">
                  <div className="w-[80px] h-1.5 bg-black-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-5 rounded-full"
                      style={{
                        width: `${Math.min(100, (dot.scale / 16000) * 100)}%`,
                      }}
                    />
                  </div>
                  <span>{(dot.scale / 10).toFixed(0)}万</span>
                </div>
              </td>
              <td className="px-3 py-3 text-black-11 tabular-nums">
                {dot.simPercent}
              </td>
              <td className="px-3 py-3 text-black-11 tabular-nums">
                {dot.penetration}
              </td>
              <td className="px-3 py-3 text-black-11 tabular-nums">
                {dot.deliveries.toLocaleString()}
              </td>
              <td className="px-3 py-3 text-black-11 tabular-nums">
                {dot.insights.toLocaleString()}
              </td>
              <td className="px-3 py-3 text-center">
                <Icon
                  name="star"
                  size={18}
                  color={
                    i < 2
                      ? 'var(--odn-color-orange-6)'
                      : 'var(--odn-color-black-5)'
                  }
                  className="cursor-pointer"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- 主页面 ----------

const CrowdMarket = () => {
  const [activeNav, setActiveNav] = useState('人群策略');
  const [activeMenu, setActiveMenu] = useState('r0-audience-market');

  return (
    <RuyiLayout
      navItems={NAV_ITEMS}
      activeNav={activeNav}
      onNavChange={(nav) => {
        setActiveNav(nav);
        navigateNav(nav);
      }}
      menuItems={MENU_ITEMS}
      activeMenu={activeMenu}
      onMenuChange={(key) => {
        setActiveMenu(key);
        navigateMenu(key);
      }}
      accountName="品牌名称/BrandName - 行业名称"
      accountId="28392034"
      collapsible
      contentClassName="flex flex-col gap-4"
      headerRight={
        <>
          <div className="flex items-center gap-1.5 h-10 px-4 border border-black-6 rounded-full text-sm cursor-pointer">
            <Icon name="users" size={16} />
            <span className="text-black-11">人群夹</span>
            <span className="font-semibold tabular-nums">10</span>
          </div>
          <div className="ml-3 flex items-center">
            <Button light icon="bell" />
            <Button light icon="help-circle" />
            <Button light icon="setting" />
          </div>
        </>
      }
    >
      {/* 来源区块：page-header（模式 1 变体：推荐人群市场） */}
      <div className="rounded-[12px] border border-black-4 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-semibold text-black-12">推荐人群市场</h2>
          <span className="text-sm text-blue-6 cursor-pointer">
            以下人群可在合约投放端选择为定向，具体操作可
            <span className="underline">查看指引</span>
          </span>
        </div>
      </div>

      <RippleChart />

      {/* 来源区块：crowd-card-list */}
      <CrowdCardListBlock />
    </RuyiLayout>
  );
};

export default CrowdMarket;
