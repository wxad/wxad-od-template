'use client';

import clsx from 'clsx';
import {
  Button,
  Card,
  Cascader,
  DatePicker,
  DateRangePicker,
  Dropdown,
  Icon,
  Popover,
  Select,
  Tabs,
} from 'one-design-next';
import React, { useState } from 'react';

/** 统计说明 + 产品手册：仅保留按钮间距，无额外描边容器 */
function StatsHelpActions() {
  return (
    <div className="flex shrink-0 items-center">
      <Popover
        placement="bottomRight"
        popup="非大盘数据，仅基于行业相关内容和广告数据抽样统计，仅供参考"
      >
        <Button light icon="info-circle">
          统计说明
        </Button>
      </Popover>
      <Button light icon="reportBook">
        产品手册
      </Button>
    </div>
  );
}

// ─── 模式 1：品牌心智度量 — 标准页面头部 ──────────────────────────

function BrandMindsetHeader() {
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date('2025-12-01'),
    new Date('2025-12-24'),
  ]);

  return (
    <Card className="rounded-[12px]" elevation={0}>
      <Card.Header
        title="品牌心智度量"
        className="pl-6 pr-3"
        style={{
          '--odn-card-title-font-size': '18px',
        }}
        topContent={<StatsHelpActions />}
      />
      <div className="flex items-center gap-3 border-t border-black-4 px-6 py-3">
        <Select
          prefix={
            <span className="text-[var(--odn-color-black-9)]">品牌/系列</span>
          }
          value="xiaomi"
          options={[
            { label: '小米汽车', value: 'xiaomi' },
            { label: '小米汽车/轿跑 SUV', value: 'xiaomi-suv' },
            { label: '小米汽车/MU7', value: 'xiaomi-mu7' },
          ]}
          className="w-[240px]"
        />
        <DateRangePicker
          prefix={<span className="text-black-9">日期范围</span>}
          value={dateRange}
          onChange={(val) => val && setDateRange(val)}
          lang="zhCN"
          className="w-[280px]"
        />
        <Select
          prefix={
            <span className="text-[var(--odn-color-black-9)]">参考系</span>
          }
          value="product"
          options={[{ label: '竞品均值', value: 'product' }]}
          className="w-[200px]"
        />
      </div>
    </Card>
  );
}

// ─── 模式 2：行业机会心智 — 无品牌筛选 ─────────────────────────

function IndustryMindsetHeader() {
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date('2025-12-01'),
    new Date('2025-12-24'),
  ]);

  return (
    <Card className="rounded-[12px]" elevation={0}>
      <Card.Header
        className="pl-6 pr-3"
        title={
          <h2 className="text-lg font-semibold text-black-12">行业机会心智</h2>
        }
        topContent={<StatsHelpActions />}
      />
      <div className="flex items-center gap-3 border-t border-black-4 px-6 py-3">
        <DateRangePicker
          prefix={<span className="text-black-9">日期范围</span>}
          value={dateRange}
          onChange={(val) => val && setDateRange(val)}
          lang="zhCN"
          className="w-[280px]"
        />
        <Select
          prefix={
            <span className="text-[var(--odn-color-black-9)]">参考系</span>
          }
          value="product"
          options={[{ label: '竞品均值', value: 'product' }]}
          className="w-[200px]"
        />
      </div>
    </Card>
  );
}

/** 心智详情页标题区：三级级联 + 面板内搜索（稿图：产品类心智 / 功效功能 / 清洁） */
const MINDSET_DETAIL_CASCADER_OPTIONS = [
  {
    label: '产品类心智',
    value: 'product-mind',
    children: [
      {
        label: '功效功能',
        value: 'efficacy',
        children: [
          { label: '清洁', value: 'clean' },
          { label: '美白', value: 'whitening' },
          { label: '保湿', value: 'moisturizing' },
          { label: '祛斑', value: 'freckle' },
          { label: '抗衰', value: 'anti-aging' },
          { label: '消炎', value: 'anti-inflammatory' },
          { label: '祛痘', value: 'acne' },
          { label: '祛疤', value: 'scar-removal' },
        ],
      },
      {
        label: '主观感受',
        value: 'subjective',
        children: [{ label: '示例', value: 'subjective-leaf' }],
      },
      {
        label: '质量保证',
        value: 'quality-assurance',
        children: [{ label: '示例', value: 'quality-leaf' }],
      },
      {
        label: '产品性能',
        value: 'performance',
        children: [{ label: '示例', value: 'performance-leaf' }],
      },
      {
        label: '产品设计',
        value: 'design',
        children: [{ label: '示例', value: 'design-leaf' }],
      },
      {
        label: '材质工艺',
        value: 'material',
        children: [{ label: '示例', value: 'material-leaf' }],
      },
      {
        label: '核心技术',
        value: 'core-tech',
        children: [{ label: '示例', value: 'core-tech-leaf' }],
      },
      {
        label: '价格定位',
        value: 'price',
        children: [{ label: '示例', value: 'price-leaf' }],
      },
    ],
  },
  {
    label: '品牌类心智',
    value: 'brand-mind',
    children: [
      {
        label: '品牌认知',
        value: 'brand-awareness',
        children: [{ label: '示例', value: 'brand-leaf' }],
      },
    ],
  },
  {
    label: '场景类心智',
    value: 'scene-mind',
    children: [
      {
        label: '使用场景',
        value: 'usage-scene',
        children: [{ label: '示例', value: 'scene-leaf' }],
      },
    ],
  },
];

type MindsetCascaderOption = {
  label: string;
  value: string;
  children?: MindsetCascaderOption[];
};

function mindsetDetailLabels(path: string[] | null | undefined): string[] {
  if (!path?.length) return [];
  const out: string[] = [];
  let level: MindsetCascaderOption[] =
    MINDSET_DETAIL_CASCADER_OPTIONS as MindsetCascaderOption[];
  for (const v of path) {
    const hit = level.find((o) => o.value === v);
    if (!hit) break;
    out.push(String(hit.label));
    level = hit.children ?? [];
  }
  return out;
}

// ─── 模式 3/4：心智详情 — 单例示例，通过 Tab 切换状态 ───────────────

function MindsetDetailHeader() {
  const [scope, setScope] = useState<'industry' | 'brand'>('industry');
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date('2025-09-17'),
    new Date('2025-10-17'),
  ]);
  const [mindsetPath, setMindsetPath] = useState<string[] | null>([
    'product-mind',
    'efficacy',
    'clean',
  ]);
  const [mindsetCascaderVisible, setMindsetCascaderVisible] = useState(false);

  const mindsetLabels = mindsetDetailLabels(mindsetPath);
  const leaf = mindsetLabels[mindsetLabels.length - 1];
  const parentLabels = mindsetLabels.slice(0, -1);

  return (
    <Card className="rounded-[16px]" elevation={0}>
      <Card.Header
        title={
          <Cascader
            light
            allowClear={false}
            className="max-w-full min-w-[200px]"
            options={MINDSET_DETAIL_CASCADER_OPTIONS}
            value={mindsetPath}
            onChange={setMindsetPath}
            showInnerSearch
            placeholder="搜索心智"
            visible={mindsetCascaderVisible}
            onVisibleChange={setMindsetCascaderVisible}
          >
            <span
              className={clsx(
                '-ml-3 inline-flex items-center gap-2 py-1.5 pl-3 pr-2 rounded-lg cursor-pointer hover:bg-black-1',
                mindsetCascaderVisible && 'bg-black-1',
              )}
            >
              {leaf ? (
                <>
                  <span className="text-lg font-semibold text-black-12">
                    {leaf}
                  </span>
                  {parentLabels.length > 0 ? (
                    <span className="rounded-full bg-black-3 px-2 py-1 text-xs font-normal text-black-10">
                      {parentLabels.join('/')}
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="text-sm text-black-9">请选择心智</span>
              )}
              <Icon name="sort" size={16} />
            </span>
          </Cascader>
        }
        className="py-3"
        topContent={<StatsHelpActions />}
      />
      <div className="flex items-center gap-3 border-t border-black-4 px-6 py-3">
        <div className="shrink-0 rounded-lg bg-black-4 p-[3px]">
          <Tabs.ButtonGroup
            gap={0}
            items={[
              { value: 'industry', label: '本行业' },
              { value: 'brand', label: '本品牌' },
            ]}
            value={scope}
            onChange={(v) => setScope(v as 'industry' | 'brand')}
            style={{
              border: 'none',
              borderRadius: 8,
              background: 'transparent',
            }}
            itemStyle={{
              height: 30,
              fontSize: 14,
              lineHeight: '32px',
              color: 'var(--odn-color-black-9)',
            }}
            activeItemStyle={{
              fontWeight: 400,
              color: 'var(--odn-color-black-12)',
            }}
            indicatorStyle={{
              backgroundColor: 'var(--odn-color-solid-black-1)',
              boxShadow: 'var(--odn-shadow-1)',
              outline: 'none',
              borderRadius: 5,
            }}
          />
        </div>
        {scope === 'brand' ? (
          <Select
            prefix={
              <span className="text-[var(--odn-color-black-9)]">品牌/系列</span>
            }
            value="xiaomi"
            options={[
              { label: '小米汽车', value: 'xiaomi' },
              { label: '小米汽车/轿跑 SUV', value: 'xiaomi-suv' },
              { label: '小米汽车/MU7', value: 'xiaomi-mu7' },
            ]}
            className="w-[240px]"
          />
        ) : null}
        <DateRangePicker
          prefix={<span className="text-black-9">日期范围</span>}
          value={dateRange}
          onChange={(val) => val && setDateRange(val)}
          lang="zhCN"
          className="w-[280px]"
        />
        <Select
          prefix={
            <span className="text-[var(--odn-color-black-9)]">参考系</span>
          }
          value="product"
          options={[{ label: '竞品均值', value: 'product' }]}
          className="w-[200px]"
        />
      </div>
    </Card>
  );
}

// ─── 模式 5：SPU 筛选栏 ─────────────────────────────────────

const SPU_OPTIONS = [
  {
    label: '面部洗护',
    value: 'face-care',
    children: [
      {
        label: '乳液面霜',
        value: 'cream',
        children: [
          { label: '香奈儿/Chanel智慧紧肤精华乳霜', value: 'chanel-cream' },
          {
            label: '香奈儿/Chanel一号红山茶花乳霜补充装',
            value: 'chanel-cream-refill',
          },
          { label: '香奈儿/Chanel智慧紧肤提拉乳霜', value: 'chanel-lift' },
          { label: '香奈儿/Chanel一号红山茶花乳霜', value: 'chanel-camellia' },
          { label: '香奈儿/Chanel智慧紧肤修护晚霜', value: 'chanel-night' },
          { label: '香奈儿/Chanel山茶花保湿乳霜', value: 'chanel-moisture' },
          { label: '香奈儿（Chanel）红山茶花面霜', value: 'chanel-red' },
          { label: '香奈儿/Chanel山茶花润泽水感乳液', value: 'chanel-lotion' },
          { label: '兰蔻/Lancôme菁纯面霜', value: 'lancome-cream' },
        ],
      },
      { label: '化妆水', value: 'toner', children: [] },
      { label: '面部精华', value: 'essence', children: [] },
      { label: '男士护肤', value: 'men', children: [] },
      { label: '眼部护理', value: 'eye', children: [] },
      { label: '面膜/局部贴', value: 'mask', children: [] },
      { label: '面部洗护套装', value: 'set', children: [] },
      {
        label: '洁面',
        value: 'cleanser',
        children: [{ label: 'SK-II氨基酸洁面乳', value: 'skii-cleanser' }],
      },
      { label: '卸妆', value: 'remover', children: [] },
    ],
  },
  { label: '香水/香水用品', value: 'fragrance', children: [] },
  {
    label: '彩妆',
    value: 'makeup',
    children: [
      {
        label: '口红',
        value: 'lipstick',
        children: [{ label: 'YSL小金条', value: 'ysl-lipstick' }],
      },
    ],
  },
  { label: '防晒', value: 'sunscreen', children: [] },
];

function SpuFilterBar() {
  const [spuPath, setSpuPath] = useState<string[]>([
    'face-care',
    'cream',
    'chanel-cream',
  ]);
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>(
    'month',
  );
  const [dayValue, setDayValue] = useState<Date | null>(new Date('2025-02-15'));
  const [weekValue, setWeekValue] = useState<[Date, Date] | null>(null);
  const [monthValue, setMonthValue] = useState<[Date, Date] | null>([
    new Date('2025-02-01'),
    new Date('2025-02-28'),
  ]);
  const [ref, setRef] = useState('top5');

  return (
    <Card className="rounded-xl" elevation={0}>
      <Card.Header
        className="pl-6 pr-3"
        title={
          <h2 className="text-lg font-semibold text-black-12">商品人群资产</h2>
        }
        topContent={
          <div className="flex shrink-0 items-center">
            <Button light icon="user-add">
              添加人群
            </Button>
            <Button light icon="download-1">
              下载数据
            </Button>
          </div>
        }
      />
      <div className="flex flex-wrap items-center gap-3 border-t border-black-4 px-6 py-3">
        <Cascader
          className="min-w-[320px] max-w-[520px] flex-1"
          options={SPU_OPTIONS}
          value={spuPath}
          onChange={setSpuPath}
          separator=" > "
          displayRender={(labels) => (
            <span>
              <span className="text-black-9">商品</span>
              <span className="ml-1">{labels.join(' > ')}</span>
            </span>
          )}
        />
        <div className="flex items-center">
          <Select
            value={granularity}
            className="w-[88px]"
            style={{ '--odn-select-border-radius': '6px 0 0 6px' }}
            options={[
              { value: 'day', label: '按日' },
              { value: 'week', label: '按周' },
              { value: 'month', label: '按月' },
            ]}
            onChange={(v) => setGranularity(v as 'day' | 'week' | 'month')}
          />
          {granularity === 'day' ? (
            <DatePicker
              prefix={<span className="text-black-9">日期</span>}
              className="-ml-px min-w-[220px]"
              value={dayValue}
              onChange={(date) => setDayValue(date)}
              style={{ '--odn-dp-border-radius': '0 6px 6px 0' }}
              lang="zhCN"
            />
          ) : (
            <DatePicker
              prefix={<span className="text-black-9">日期</span>}
              className="-ml-px min-w-[220px]"
              picker={granularity}
              key={granularity}
              value={granularity === 'week' ? weekValue : monthValue}
              onChange={(date) => {
                if (granularity === 'week') setWeekValue(date);
                else setMonthValue(date);
              }}
              style={{ '--odn-dp-border-radius': '0 6px 6px 0' }}
              lang="zhCN"
            />
          )}
        </div>
        <Select
          className="min-w-[240px]"
          options={[
            { label: '同类目 TOP5 商品均值', value: 'top5' },
            { label: '同类目 TOP10 商品均值', value: 'top10' },
            { label: '同类目全部商品均值', value: 'all' },
          ]}
          value={ref}
          onChange={setRef}
          prefix={
            <span className="text-[var(--odn-color-black-9)]">参考系</span>
          }
        />
      </div>
    </Card>
  );
}

// ─── 模式 6：Tab 导航 ────────────────────────────────────────

function DetailPageTab() {
  const [activeTab, setActiveTab] = useState('awareness');

  return (
    <Card className="rounded-[12px]" elevation={0}>
      <div className="px-6">
        <Tabs.Default
          value={activeTab}
          onChange={setActiveTab}
          items={[
            { value: 'awareness', label: '表打点 duPool' },
            { value: 'interest', label: '表打点' },
            { value: 'compare', label: '表品牌' },
            { value: 'header', label: 'Header 元 头部题' },
            { value: 'detail', label: '表打点' },
            { value: 'media', label: '表品牌' },
            { value: 'paid', label: 'Cls in 头部题' },
            { value: 'owned', label: '表品牌 duPool' },
            { value: 'search', label: '表打点' },
            { value: 'social', label: '表品牌' },
          ]}
        />
      </div>
    </Card>
  );
}

// ─── 模式 7：模块头部 — 标题切换 + 视图切换 ──────────────────────

function ModuleHeaderSwitch() {
  const [title, setTitle] = useState('竞品 TOP20 心智');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  return (
    <Card className="rounded-[12px]" elevation={0}>
      <Card.Header
        className="pl-6 pr-3"
        size="medium"
        title={
          <div className="flex items-center gap-2">
            <Select
              light
              value={title}
              options={[
                { label: '本品 TOP20 心智', value: '本品 TOP20 心智' },
                { label: '竞品 TOP20 心智', value: '竞品 TOP20 心智' },
                { label: '行业 TOP20 心智', value: '行业 TOP20 心智' },
              ]}
              style={{
                '--odn-color-text': 'var(--odn-color-black-12)',
                '--odn-font-size': '16px',
                '--odn-selection-item-font-weight': 600,
              }}
              onChange={(v) => setTitle(String(v))}
              suffixIcon={
                <Icon
                  name="down-filled"
                  size={16}
                  color="var(--odn-color-black-11)"
                />
              }
            />
            <span className="ml-1 text-md font-semibold text-black-12">
              竞争矩阵
            </span>
          </div>
        }
        topContent={
          <div className="flex items-center gap-2">
            <Select
              value="all"
              options={[{ label: '全部心智', value: 'all' }]}
              light
            />
            <div className="shrink-0 rounded-lg bg-black-2 p-[3px]">
              <Tabs.ButtonGroup
                gap={0}
                items={[
                  {
                    value: 'chart',
                    label: (
                      <Icon name="menu" size={16} className="text-current" />
                    ),
                  },
                  {
                    value: 'table',
                    label: (
                      <Icon
                        name="card-distribute"
                        size={16}
                        className="text-current"
                      />
                    ),
                  },
                ]}
                value={viewMode}
                onChange={(v) => setViewMode(v as 'chart' | 'table')}
                style={{
                  border: 'none',
                  borderRadius: 6,
                  background: 'transparent',
                }}
                itemStyle={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 30,
                  height: 30,
                  padding: 0,
                  color: 'var(--odn-color-black-11)',
                }}
                indicatorStyle={{
                  backgroundColor: 'var(--odn-color-white)',
                  boxShadow: 'var(--odn-shadow-1)',
                  outline: 'none',
                  borderRadius: 6,
                }}
              />
            </div>
          </div>
        }
      />
      <div className="flex h-[80px] items-center justify-center border-t border-black-4 text-sm text-black-6">
        {viewMode === 'chart' ? '图表区域' : '表格区域'}
      </div>
    </Card>
  );
}

// ─── 模式 8：模块级筛选器 ──────────────────────────────────────

function ModuleFilter() {
  const [level, setLevel] = useState('all');
  const [category, setCategory] = useState('all');

  return (
    <Card className="rounded-[12px]" elevation={0}>
      <div className="flex h-14 items-center px-6">
        <h3 className="text-base font-semibold text-black-12">心智层级结构</h3>
      </div>
      <div className="flex items-center gap-3 border-t border-black-4 px-6 py-3">
        <span className="text-sm text-black-9">层次</span>
        <Select
          value={level}
          options={[
            { label: '全部心智', value: 'all' },
            { label: '产品本心智', value: 'product' },
            { label: '品牌系心智', value: 'brand' },
            { label: '住型系心智', value: 'residence' },
          ]}
          onChange={setLevel}
          style={{ width: 140 }}
        />
        <span className="text-sm text-black-9">筛序</span>
        <Select
          value={category}
          options={[{ label: '全部心智', value: 'all' }]}
          onChange={setCategory}
          style={{ width: 140 }}
        />
        <span className="text-sm text-black-9">组件</span>
        <Select
          value="all"
          options={[{ label: '全部心智', value: 'all' }]}
          style={{ width: 140 }}
        />
      </div>
    </Card>
  );
}

// ─── 模式 9：统计说明 Popover ──────────────────────────────

function HelpPopover() {
  return (
    <Card className="rounded-[12px]" elevation={0}>
      <div className="flex h-14 items-center justify-between px-6">
        <h3 className="text-base font-semibold text-black-12">PageName</h3>
        <StatsHelpActions />
      </div>
    </Card>
  );
}

// ─── 模式 10：转化复盘详情表头 ─────────────────────────────

function ConversionDetailHeader() {
  return (
    <Card className="rounded-[12px] px-6 pb-6 pt-4" elevation={0}>
      <div className="flex flex-col gap-2">
        <div className="flex h-9 items-center gap-10">
          <div className="flex flex-1 items-center gap-1">
            <span className="text-lg font-semibold text-black-12">
              转化复盘报告名称
            </span>
            <Button light icon="edit" />
          </div>
          <div className="flex items-center gap-2">
            <Button light icon="download-1">
              下载数据
            </Button>
            <div className="h-5 w-px bg-black-5" />
            <Button light icon="copy-new">
              复制创建
            </Button>
            <div className="h-5 w-px bg-black-5" />
            <Button light icon="down-filled">
              更多
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="rounded-full border border-[#cdf3df] bg-[#f3fcf7] px-2 py-1 text-sm font-medium text-[#07c160]">
            计算成功
          </span>
          <div className="h-4 w-px bg-[#d9d9d9]" />
          <div className="flex items-center gap-6">
            <span className="text-sm text-black-9">
              广告投放日期：2025-12-25 至 2026-02-14
            </span>
            <span className="text-sm text-black-9">转化周期：7 天</span>
            <button
              type="button"
              className="flex items-center text-sm text-black-9 hover:text-blue-6"
            >
              完整配置信息
              <Icon name="right" size={16} />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── 模式 11：策略详情 — 标题编辑 + 操作按钮 + 状态标签 + 元信息 + Tabs.Tag ──

function StrategyDetailHeader() {
  const [activeTab, setActiveTab] = useState('asset-breadth');

  const strategyTabs = [
    { value: 'overview', label: '概览' },
    { value: 'asset-breadth', label: '资产广度' },
    { value: 'asset-depth', label: '资产深度' },
    { value: 'asset-preference', label: '资产偏好度' },
    { value: 'health-durability', label: '健康持久度' },
    { value: 'config', label: '配置信息' },
  ];

  return (
    <Card className="rounded-[16px]" elevation={0}>
      <div className="flex flex-col gap-3 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-black-12">
              海蓝之谜–23.7.20~23.8.30–奢美小青
            </span>
            <Icon
              name="edit"
              size={14}
              className="text-black-9 cursor-pointer hover:text-blue-6"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button light icon="user-add">
              提取人群
            </Button>
            <div className="h-5 w-px bg-black-5" />
            <Button light icon="copy-new">
              复制创建
            </Button>
            <div className="h-5 w-px bg-black-5" />
            <Button light icon="download-1">
              下载数据
            </Button>
            <div className="h-5 w-px bg-black-5" />
            <Dropdown
              menu={[
                { key: 'export', label: '导出报告' },
                { key: 'share', label: '分享' },
                { key: 'delete', label: '删除', danger: true },
              ]}
            >
              <Button light>
                更多
                <Icon name="chevron-down" size={14} className="ml-0.5" />
              </Button>
            </Dropdown>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-green-3 bg-green-1 px-2 py-0.5 text-sm font-medium text-green-6">
            计算成功
          </span>
          <div className="h-4 w-px bg-black-5" />
          <span className="text-sm text-black-10">
            广告投放日期: 2023-08-01 至 2023-08-22
          </span>
          <span className="text-sm text-black-10">转化时长: 7 天</span>
        </div>
        <Tabs.Tag
          gap={8}
          items={strategyTabs}
          value={activeTab}
          onChange={(v) => setActiveTab(String(v))}
          itemClassName={(item) =>
            item.value === activeTab ? '' : 'transition-colors hover:bg-black-2'
          }
          itemStyle={{
            padding: '11px 12px',
            minHeight: 36,
            boxSizing: 'border-box',
            fontSize: 14,
            lineHeight: '20px',
            borderRadius: 4,
            backgroundColor: 'transparent',
            color: 'var(--odn-color-black-10)',
          }}
          activeItemStyle={{
            fontWeight: 400,
            color: 'var(--odn-color-blue-6)',
            backgroundColor: 'var(--odn-color-blue-1)',
            borderRadius: 4,
          }}
        />
      </div>
    </Card>
  );
}

// ─── 模式 12：门店客源分析 — 标题 + 副标题 + 复合门店选择器 + 推荐筛选 + 查询 ──

const MOCK_STORES = [
  '上海乐高乐园度假区(乐缤路店)',
  '茶百道(石油大学店)',
  '茶百道(大弯中学店)',
  '茶百道(太古里店)',
  '茶百道(仪陇店)',
  '茶百道(安堂店)',
  '蜜雪冰城(四中店)',
  '蜜雪冰城(南关正街店)',
  '蜜雪冰城(平江路南主街店)',
  '蜜雪冰城(一中南门店)',
  '蜜雪冰城(徐州云龙万达广场店)',
  '蜜雪冰城(海盛店)',
  '蜜雪冰城(紫气大道店)',
  '蜜雪冰城(幸福路店)',
  '蜜雪冰城(校外店)',
  '蜜雪冰城(南海区店)',
  '奈雪的茶(南山宝能太古城店)',
  '奈雪的茶(广州花城汇店)',
  '奈雪的茶(凯德MALL西直门店)',
  '奈雪的茶(万象城店)',
  '奈雪的茶(南京桥北印象汇店)',
  '奈雪的茶(南湾华发商都店)',
  '奈雪的茶(印象城店)',
  '奈雪的茶(大梅沙8号仓店)',
  '奈雪的茶(杭州万象城PRO店)',
  '奈雪的茶(布吉万象汇店)',
  '奈雪的茶(杭州萧山万象汇店)',
  '奈雪的茶(世茂广场店)',
  '奈雪的茶(河西金鹰店)',
  '奈雪的茶(南山万象天地三店)',
  '奈雪的茶(重庆龙湖北城天街3楼店)',
  '奈雪的茶(南山茂业店)',
  '奈雪的茶(石厦时代广场店)',
  '奈雪的茶(欢乐海岸店)',
  '奈雪的茶(深圳科技生态园PRO店)',
  '奈雪的茶(时代天街店)',
  '奈雪的茶(南山京基PRO店)',
  '奈雪的茶(东百南街商业中心店)',
  '奈雪的茶(武汉新天地店)',
  '奈雪的茶(昆山万象汇店)',
  '奈雪的茶(领展中心城店)',
  '奈雪的茶(西丽万科云城店)',
  '奈雪的茶(新南凯德广场店)',
  '奈雪的茶(金鹰新街口店)',
  '奈雪的茶(万菱汇PRO店)',
  '奈雪的茶(卓悦汇店)',
  '奈雪的茶(杨家坪万象城店)',
  '奈雪的茶(广州正佳广场店)',
  '奈雪的茶(海德汇一城三区店)',
  '奈雪的茶(花园城PRO店)',
  '喜茶(江门地王广场店)',
  '喜茶(广州荔湾领展广场店)',
  '喜茶(上海人广来福士店)',
  '喜茶(佛山杏坛建设路店)',
  '喜茶(上海兴业太古汇店)',
  '喜茶(广州花城汇南区店)',
  '喜茶(上海正大广场店)',
  '喜茶(东莞汇一城店)',
  '喜茶(苏州印象城店)',
  '喜茶(深圳绿景虹湾店)',
  '喜茶(南通万象城店)',
  '喜茶(上海万象城店)',
  '喜茶(沈阳大悦城店)',
  '喜茶(常州武进吾悦店)',
  '喜茶(北京三里屯太古里店)',
  '喜茶(南宁水晶城店)',
  '喜茶(广州北京路惠福东店)',
  '喜茶(南京大洋百货店)',
  '喜茶(上海美罗城店)',
  '喜茶(惠州风尚国际店)',
  '喜茶(杭州万象城店)',
  '喜茶(中山白水井店)',
  '喜茶(上海长宁龙之梦店)',
  '乐高品牌旗舰店(王府井店)',
  '蜜雪冰城(朝阳门店)',
  '蜜雪冰城(中关村店)',
  '蜜雪冰城(望京店)',
  '蜜雪冰城(三里屯店)',
  '蜜雪冰城(西单店)',
  '蜜雪冰城(国贸店)',
  '蜜雪冰城(五道口店)',
  '蜜雪冰城(大望路店)',
  '蜜雪冰城(亦庄店)',
  '蜜雪冰城(通州万达店)',
  '蜜雪冰城(房山长阳店)',
  '蜜雪冰城(昌平回龙观店)',
  '蜜雪冰城(顺义店)',
  '蜜雪冰城(丰台科技园店)',
  '蜜雪冰城(石景山万达店)',
  '蜜雪冰城(西红门荟聚店)',
  '蜜雪冰城(大兴天宫院店)',
  '蜜雪冰城(门头沟永旺店)',
  '蜜雪冰城(平谷万达店)',
  '蜜雪冰城(怀柔青春路店)',
  '蜜雪冰城(密云万象汇店)',
  '蜜雪冰城(延庆店)',
  '蜜雪冰城(燕郊天洋城店)',
  '蜜雪冰城(廊坊万达店)',
  '蜜雪冰城(固安店)',
];

function StoreAnalysisHeader() {
  const [expanded, setExpanded] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const selectedCount = MOCK_STORES.length;
  const maxCount = 100;
  const storeText = MOCK_STORES.join('，');

  return (
    <Card
      className="rounded-[12px]"
      elevation={0}
      data-odn-store-analysis-header
    >
      {/* 标题行 */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="text-base font-semibold text-black-12">
            门店客源分析
          </span>
          <span className="text-sm text-black-10">一方人群分析</span>
        </div>
        <div className="flex items-center">
          <button
            type="button"
            className="flex items-center gap-1 rounded-[6px] px-3 py-[7px] text-sm text-black-9 transition-colors hover:bg-black-2"
          >
            <Icon name="book" size={16} />
            使用手册
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded-[6px] px-3 py-[7px] text-sm text-black-9 transition-colors hover:bg-black-2"
          >
            <Icon name="help-circle" size={16} />
            概念说明
          </button>
        </div>
      </div>

      {/* 筛选行 */}
      <div className="flex items-start justify-end pr-6">
        <div className="flex min-w-0 flex-1 flex-wrap items-start gap-x-3 gap-y-6 pb-6 pl-6 pr-3">
          {/* 复合门店选择器 */}
          <div
            className="flex w-[640px] items-center gap-2 rounded-[6px] border border-black-6 px-3 py-px"
            role="button"
            tabIndex={0}
            onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
            onKeyDown={(e) =>
              e.key === 'Enter' && setStoreDropdownOpen(!storeDropdownOpen)
            }
          >
            <div className="flex shrink-0 items-center gap-1">
              <span className="text-sm text-black-9">关联门店</span>
              <Icon name="chevron-down" size={16} className="text-black-9" />
            </div>
            <div className="h-[34px] w-px shrink-0 bg-black-5" />
            <span className="min-w-0 flex-1 truncate text-sm text-black-12">
              {storeText}
            </span>
            <span className="shrink-0 text-sm text-black-9">
              {selectedCount}/{maxCount}
            </span>
            <Icon
              name="chevron-down"
              size={16}
              className="shrink-0 text-black-9"
            />
          </div>

          {/* 推荐模式 */}
          <Select
            prefix={
              <span className="text-[var(--odn-color-black-9)]">推荐模式</span>
            }
            value="normal"
            options={[
              { label: '常规推荐', value: 'normal' },
              { label: '精准推荐', value: 'precise' },
              { label: '广域推荐', value: 'wide' },
            ]}
            style={{ width: 190 }}
          />

          {/* 期望推荐数量 */}
          <div className="flex items-center gap-2 rounded-[6px] border border-black-6 px-3 py-[7px]">
            <span className="text-sm text-black-9">期望推荐数量</span>
            <span className="text-sm text-black-12">50</span>
          </div>

          {/* 展开更多 */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="rounded-[6px] border border-black-6 px-3 py-[7px] text-sm text-black-12 transition-colors hover:bg-black-2"
          >
            {expanded ? '收起' : '展开更多'}
          </button>
        </div>

        {/* 查询按钮 */}
        <Button className="shrink-0" size="medium">
          查询
        </Button>
      </div>
    </Card>
  );
}

// ─── 主组件 ─────────────────────────────────────────────────

/** 文档 demo 拼装：浅灰底内边距，非页面头部组件本体 */
function DemoShell(props: { children: React.ReactNode }) {
  return <div className="bg-[#f2f4f9] p-6">{props.children}</div>;
}

const PageHeaderBlock = () => {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="mb-2 text-base font-semibold text-black-12">页面头部</h3>
        <p className="mb-4 text-sm text-black-9">
          页面级标题 + 操作按钮 + 筛选栏，位于内容区最顶部。
        </p>
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-black-9">
              模式 1：品牌心智度量（标题 + 品牌筛选 + 日期 + 参考系）
            </h4>
            <DemoShell>
              <BrandMindsetHeader />
            </DemoShell>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-black-9">
              模式 2：行业机会心智（标题 + 日期 + 参考系）
            </h4>
            <DemoShell>
              <IndustryMindsetHeader />
            </DemoShell>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-black-9">
              模式 3/4：心智详情（通过 Tab 切换品牌状态）
            </h4>
            <DemoShell>
              <MindsetDetailHeader />
            </DemoShell>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-black-9">
              模式 5：商品人群资产（标题 + 操作 + 商品级联 + 时间粒度 + 参考系）
            </h4>
            <DemoShell>
              <SpuFilterBar />
            </DemoShell>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-black-9">
              模式 11：策略详情（标题编辑 + 操作按钮 + 状态标签 + 元信息 +
              Tabs.Tag）
            </h4>
            <DemoShell>
              <StrategyDetailHeader />
            </DemoShell>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-black-9">
              模式 12：门店客源分析（标题 + 副标题 + 复合门店选择器 + 推荐筛选 +
              查询）
            </h4>
            <DemoShell>
              <StoreAnalysisHeader />
            </DemoShell>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-black-12">模块头部</h3>
        <p className="mb-4 text-sm text-black-9">
          模块内部的标题栏、筛选、视图切换、Tab 导航。
        </p>
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-black-9">
              模式 6：Tab 导航
            </h4>
            <DemoShell>
              <DetailPageTab />
            </DemoShell>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-black-9">
              模式 7：标题切换 + 视图切换
            </h4>
            <DemoShell>
              <ModuleHeaderSwitch />
            </DemoShell>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-black-9">
              模式 8：模块级筛选器
            </h4>
            <DemoShell>
              <ModuleFilter />
            </DemoShell>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-black-12">辅助元素</h3>
        <p className="mb-4 text-sm text-black-9">
          统计说明 & 产品手册等帮助入口。
        </p>
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-black-9">
              模式 9：统计说明 & 产品手册 Popover
            </h4>
            <DemoShell>
              <HelpPopover />
            </DemoShell>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-black-9">
              模式 10：转化复盘详情表头（标题 + 状态标签 + 操作按钮 + 元信息）
            </h4>
            <DemoShell>
              <ConversionDetailHeader />
            </DemoShell>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PageHeaderBlock;
