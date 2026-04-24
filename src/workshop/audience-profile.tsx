'use client';

import {
  Button,
  Card,
  HoverFill,
  Icon,
  Input,
  Pagination,
  RuyiLayout,
  ScrollArea,
  Select,
  Tabs,
  type RuyiMenuItem,
} from 'one-design-next';
// @ts-ignore
import * as echarts from 'echarts';
import EChartsReact from 'echarts-for-react';
import React, { useMemo, useState } from 'react';
import audienceProfileFixture from './data/audience-profile.json';

// ─── 菜单（对齐 r-zero-crowd 的侧边栏） ─────
const MENU_ITEMS: RuyiMenuItem[] = [
  {
    key: 'recommend',
    label: '推荐人群',
    icon: 'users',
    children: [
      { key: 'r-zero-crowd', label: '行业优选' },
      { key: 'interest-select', label: '兴趣精选' },
      { key: 'theme-select', label: '主题甄选' },
      { key: 'ai-select', label: 'AI智选', badge: 'BETA' },
    ],
  },
  {
    key: 'custom',
    label: '自定义人群',
    icon: 'user-edit',
    children: [
      { key: 'create-audience', label: '新建人群' },
      { key: 'audience-list', label: '人群列表' },
      { key: 'audience-profile', label: '人群画像' },
    ],
  },
];

const NAV_ITEMS = ['首页', '洞察诊断', '人群策略', '策略应用', '全域度量'];

// 菜单 key → workshop 页面 slug（本文件独立维护，不与其他 workshop 页面共享）
const MENU_ROUTES: Record<string, string> = {
  'r-zero-crowd': 'r-zero-crowd',
  'interest-select': 'interest-preference-crowd',
  'theme-select': 'theme-selection-crowd',
  'ai-select': 'ai-smart-crowd',
  'create-audience': 'create-audience',
  'audience-list': 'custom-audience-list',
  'audience-profile': 'audience-profile',
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

// ─── 状态映射（对齐 mapStatus） ─────
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  SUCCESS: { label: '计算成功', color: '#07C160' },
  PROCESSING: { label: '计算中', color: '#296BEF' },
  ERROR: { label: '计算失败', color: '#E63D2E' },
  FROZEN: { label: '冻结', color: '#898b8f' },
};

// ─── 左侧任务列表（对齐 ReportList 组件：324px 宽 + 搜索 + 列表项 + 分页） ─────
function TaskList({
  items,
  currentId,
  onIdChange,
}: {
  items: any[];
  currentId: number;
  onIdChange: (id: number) => void;
}) {
  const [search, setSearch] = useState('');

  const filtered = items.filter(
    (item) =>
      !search ||
      item.name.includes(search) ||
      String(item.id).includes(search),
  );

  return (
    <div
      className="flex shrink-0 flex-col bg-white w-[324px] rounded-[16px]"
      style={{ height: 'calc(100vh - 120px)' }}
    >
      {/* 新建按钮 */}
      <div className="px-4 pt-4">
        <Button intent="primary" className="w-full" icon="plus">
          新建分析任务
        </Button>
      </div>

      {/* 搜索 */}
      <div className="px-4 py-3">
        <Input
          leftElement={<Icon name="search" size={16} />}
          placeholder="搜索任务名称/ID"
          value={search}
          onChange={(v) => setSearch(String(v ?? ''))}
        />
      </div>

      {/* 列表 */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-1 px-2">
          {filtered.map((item) => {
            const isActive = item.id === currentId;
            const st = STATUS_MAP[item.status] || STATUS_MAP.SUCCESS;
            return (
              <HoverFill
                key={item.id}
                className="w-full rounded-lg"
                bgClassName="rounded-lg"
              >
                <div
                  className="cursor-pointer rounded-lg px-3 py-2.5"
                  style={{
                    backgroundColor: isActive ? '#f5f8ff' : undefined,
                  }}
                  onClick={() => onIdChange(item.id)}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="shrink-0 rounded-full w-[6px] h-[6px]"
                      style={{
                        backgroundColor: st.color,
                      }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-[#0d0d0d]">
                      {item.name}
                    </span>
                  </div>
                  <div
                    className="mt-1 flex items-center gap-3 pl-4 text-xs text-[#898b8f]"
                  >
                    <span>ID: {item.id}</span>
                    <span>
                      {new Date(item.lastModifiedTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </HoverFill>
            );
          })}
        </div>
      </ScrollArea>

      {/* 分页 */}
      <div className="flex justify-center border-t border-[#edeef2] py-3">
        <Pagination
          showPrevNext
          totalSize={50}
          pageSize={20}
          value={1}
          onChange={() => {}}
        />
      </div>
    </div>
  );
}

// ─── ECharts 柱状图+折线图 卡片（对齐 chartB.tsx：竖向柱状图+TGI折线） ─────
function ChartBCard({
  title,
  subtitle,
  distribution,
}: {
  title: string;
  subtitle: string;
  distribution: any[];
}) {
  const option = useMemo(() => {
    if (!distribution?.length) return null;
    const categories = distribution.map((d: any) => d.dimensionValue);
    const crowdPercent = distribution.map(
      (d: any) => Math.round(d.percentage * 10000) / 100,
    );
    const tencentPercent = distribution.map(
      (d: any) => Math.round(d.tencentPercentage * 10000) / 100,
    );
    const tgiList = distribution.map((d: any) => d.tgi);

    const percentMax = Math.max(...crowdPercent, ...tencentPercent) * 1.3 || 10;
    const tgiMax = Math.max(...tgiList) * 1.3 || 200;

    return {
      tooltip: {
        trigger: 'axis',
        borderWidth: 0,
        backgroundColor: '#fff',
        textStyle: { color: '#0d0d0d', fontSize: 12 },
      },
      legend: {
        show: true,
        bottom: 0,
        data: ['大盘占比', '该人群包占比', 'TGI'],
        textStyle: { color: '#898b8f', fontSize: 12 },
        itemWidth: 12,
        itemHeight: 8,
      },
      grid: { left: 2, right: 2, top: 16, bottom: 40, containLabel: true },
      xAxis: [
        {
          data: categories,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#313233', fontSize: 12 },
        },
      ],
      yAxis: [
        {
          max: percentMax,
          axisLabel: { formatter: '{value}%' },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: '#f0f2f5' } },
        },
        {
          max: tgiMax,
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          type: 'bar',
          name: '大盘占比',
          data: tencentPercent,
          barWidth: 20,
          color: '#D8E5FE',
          itemStyle: { borderRadius: [2, 2, 0, 0] },
          yAxisIndex: 0,
        },
        {
          type: 'bar',
          name: '该人群包占比',
          data: crowdPercent,
          barWidth: 14,
          color: '#3E79F0',
          itemStyle: { borderRadius: [2, 2, 0, 0] },
          yAxisIndex: 0,
        },
        {
          type: 'line',
          name: 'TGI',
          data: tgiList,
          color: '#FFAE19',
          symbol: 'circle',
          symbolSize: 8,
          yAxisIndex: 1,
          itemStyle: { borderWidth: 1, borderColor: '#fff' },
        },
      ],
    };
  }, [distribution]);

  if (!option) return null;

  return (
    <div className="rounded-lg border border-[#edeef2] p-4">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-[#0d0d0d]">{title}</h3>
        {subtitle && (
          <span className="text-xs text-[#898b8f]">{subtitle}</span>
        )}
      </div>
      <EChartsReact style={{ height: 280, width: '100%' }} option={option} />
    </div>
  );
}

// ─── 横向条形图卡片（对齐 chartA.tsx：左标签+TGI列+条形图，数据>=9条时使用） ─────
function ChartACard({
  title,
  subtitle,
  distribution,
}: {
  title: string;
  subtitle: string;
  distribution: any[];
}) {
  const data = useMemo(() => {
    if (!distribution?.length) return [];
    return distribution.map((d: any) => ({
      label: d.dimensionValue,
      crowdPercent: Math.round(d.percentage * 10000) / 100,
      tencentPercent: Math.round(d.tencentPercentage * 10000) / 100,
      tgi: d.tgi,
    }));
  }, [distribution]);

  if (!data.length) return null;

  const maxPercent =
    Math.max(...data.map((d) => Math.max(d.crowdPercent, d.tencentPercent))) *
      1.2 || 1;

  return (
    <div className="rounded-lg border border-[#edeef2] p-4">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-[#0d0d0d]">{title}</h3>
        {subtitle && (
          <span className="text-xs text-[#898b8f]">{subtitle}</span>
        )}
      </div>
      {/* 表头 */}
      <div className="flex text-xs text-[#898b8f] h-[34px]">
        <div className="min-w-[110px]">{subtitle || title}</div>
        <div className="w-14 text-right">TGI</div>
        <div className="flex-1 pl-3">人群覆盖度</div>
      </div>
      {/* 数据行 */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: 34 * Math.min(data.length, 15) }}
      >
        {data.map((d, i) => (
          <div
            key={i}
            className="flex items-center text-sm h-[34px]"
          >
            <div
              className="shrink-0 truncate text-[#0d0d0d] min-w-[110px]"
              title={d.label}
            >
              {d.label}
            </div>
            <div
              className="w-14 shrink-0 text-right"
              style={{ color: d.tgi >= 100 ? '#0d0d0d' : '#898b8f' }}
            >
              {d.tgi}
            </div>
            <div className="relative flex-1 pl-3">
              {/* 大盘占比条 */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-[14px] bg-[#D8E5FE]"
                style={{
                  width: `${(d.tencentPercent / maxPercent) * 100}%`,
                  borderRadius: '0 2px 2px 0',
                }}
              />
              {/* 人群包占比条 */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-[10px] bg-[#3E79F0]"
                style={{
                  width: `${(d.crowdPercent / maxPercent) * 100}%`,
                  borderRadius: '0 2px 2px 0',
                }}
              />
              <span
                className="relative z-10 pl-1 text-xs text-white leading-[34px]"
              >
                {d.crowdPercent > 3 ? `${d.crowdPercent}%` : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* 图例 */}
      <div className="mt-3 flex items-center gap-6 text-xs text-[#898b8f]">
        <div className="flex items-center gap-1">
          <span
            className="inline-block rounded-sm w-3 h-2 bg-[#3E79F0]"
          />
          该人群包占比
        </div>
        <div className="flex items-center gap-1">
          <span
            className="inline-block rounded-sm w-3 h-2 bg-[#D8E5FE]"
          />
          大盘占比
        </div>
      </div>
    </div>
  );
}

// ─── 用户属性 Tab（对齐 userProperty.tsx：双列网格，>=9 条用 ChartA，<9 条用 ChartB） ─────
function UserPropertyTab({ tagInsightResult }: { tagInsightResult: any[] }) {
  const charts = tagInsightResult.filter(
    (v: any) => v.chartType === 'userProperty',
  );

  // 过滤掉 >300 条的城市数据
  const filtered = charts.filter(
    (c: any) => c.distribution?.length <= 300,
  );

  return (
    <div
      className="grid gap-4 grid-cols-[calc(50%-8px)_calc(50%-8px)]"
    >
      {filtered.map((chart: any, i: number) =>
        chart.distribution?.length >= 9 ? (
          <ChartACard
            key={i}
            title={chart.title}
            subtitle={chart.subTitle}
            distribution={chart.distribution}
          />
        ) : (
          <ChartBCard
            key={i}
            title={chart.title}
            subtitle={chart.subTitle}
            distribution={chart.distribution}
          />
        ),
      )}
    </div>
  );
}

// ─── 行业标签 Tab（对齐 industryLabel.tsx：双列网格） ─────
function IndustryLabelTab({ tagInsightResult }: { tagInsightResult: any[] }) {
  const charts = tagInsightResult.filter(
    (v: any) => v.chartType === 'industry',
  );
  const filtered = charts.filter(
    (c: any) => c.distribution?.length <= 300,
  );

  return (
    <div
      className="grid gap-4 grid-cols-[calc(50%-8px)_calc(50%-8px)]"
    >
      {filtered.map((chart: any, i: number) =>
        chart.distribution?.length > 6 ? (
          <ChartACard
            key={i}
            title={chart.title}
            subtitle={chart.subTitle}
            distribution={chart.distribution}
          />
        ) : (
          <ChartBCard
            key={i}
            title={chart.title}
            subtitle={chart.subTitle}
            distribution={chart.distribution}
          />
        ),
      )}
    </div>
  );
}

// ─── 用户行为 Tab（对齐 userBehavior.tsx：单列，全部用 ChartB/ChartC 柱状图+折线） ─────
function UserBehaviorTab({ tagInsightResult }: { tagInsightResult: any[] }) {
  const charts = tagInsightResult.filter(
    (v: any) => v.chartType === 'userBehavior',
  );

  return (
    <div className="flex flex-col gap-4">
      {charts.map((chart: any, i: number) => (
        <ChartBCard
          key={i}
          title={chart.title}
          subtitle={chart.subTitle}
          distribution={chart.distribution}
        />
      ))}
    </div>
  );
}

// ─── 配置信息 Tab（对齐 ConfigInfo.tsx） ─────
function ConfigInfoTab({ data }: { data: any }) {
  const { id, name, audience, lastModifiedTime, tagInsightContent } = data;
  const dimension = tagInsightContent?.dimension || [];

  // 对 dimension 做分组
  const dimensionData = dimension.reduce((acc: any[], item: any) => {
    const existing = acc.find((i: any) => i.name_lvl1 === item.name_lvl1);
    if (existing) {
      const existingLvl2 = existing.children.find(
        (i: any) => i.name_lvl2 === item.name_lvl2,
      );
      if (existingLvl2) {
        existingLvl2.name_lvl3 += `，${item.name_lvl3}`;
      } else {
        existing.children.push({
          name_lvl2: item.name_lvl2,
          name_lvl3: item.name_lvl3,
        });
      }
    } else {
      acc.push({
        name_lvl1: item.name_lvl1,
        children: [
          { name_lvl2: item.name_lvl2, name_lvl3: item.name_lvl3 },
        ],
      });
    }
    return acc;
  }, []);

  const InfoRow = ({
    title,
    content,
  }: {
    title: string;
    content: string | number;
  }) => (
    <div className="mb-6 flex">
      <span
        className="shrink-0 text-sm text-[#898b8f] min-w-[80px]"
      >
        {title}
      </span>
      <span className="text-sm text-[#0d0d0d]">{content}</span>
    </div>
  );

  return (
    <>
      <div
        className="-mx-6 my-3 border-b border-[#edeef2]"
      />
      <div className="text-sm text-[#0d0d0d]">
        <div className="mb-6 font-medium">基本信息</div>
        <InfoRow title="任务名称" content={name} />
        <InfoRow title="人群包" content={audience?.name} />
        <InfoRow
          title="人群规模"
          content={(audience?.userNumber || 0).toLocaleString()}
        />
        <InfoRow title="任务ID" content={id} />
        <InfoRow
          title="更新时间"
          content={new Date(lastModifiedTime).toLocaleString()}
        />
        {dimensionData.map((group: any) => (
          <div key={group.name_lvl1}>
            <div className="mb-6 mt-2 font-medium">{group.name_lvl1}</div>
            {group.children.map((child: any) => (
              <InfoRow
                key={child.name_lvl2}
                title={child.name_lvl2}
                content={child.name_lvl3}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

// ─── 主页面（对齐 AudienceProfileResultPage.tsx + index.module.less） ─────
export default function AudienceProfilePage() {
  const data = audienceProfileFixture as any;
  const [currentId, setCurrentId] = useState(242415);
  const [activeTab, setActiveTab] = useState('user-property');
  const [activeNav, setActiveNav] = useState('人群策略');
  const [activeMenu, setActiveMenu] = useState('audience-profile');

  const { detail, list } = data;
  const tagInsightResult = detail?.tagInsightResult || [];

  // 动态构建 tab 列表（对齐 getDetail 函数中的 tab 过滤逻辑）
  const hasUserProperty = tagInsightResult.some(
    (v: any) => v.chartType === 'userProperty',
  );
  const hasUserBehavior = tagInsightResult.some(
    (v: any) => v.chartType === 'userBehavior',
  );
  const hasIndustry = tagInsightResult.some(
    (v: any) => v.chartType === 'industry',
  );

  const tabs: { label: string; value: string }[] = [];
  if (hasUserProperty) tabs.push({ label: '用户属性', value: 'user-property' });
  if (hasUserBehavior)
    tabs.push({ label: '用户行为', value: 'user-behavior' });
  if (hasIndustry) tabs.push({ label: '行业标签', value: 'industry-label' });
  tabs.push({ label: '配置信息', value: 'config' });

  const st = STATUS_MAP[detail?.status] || STATUS_MAP.SUCCESS;

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
      title="如意"
    >
      {/* .container: flex */}
      <div className="flex gap-4">
        {/* 左: .listContainer: 324px, h:calc(100vh-120px), mr:16px */}
        <TaskList
          items={list}
          currentId={currentId}
          onIdChange={setCurrentId}
        />

        {/* 右: .resultContainer: flex:1, bg:#fff, radius:16px, padding:12px 24px */}
        <div
          className="min-w-0 flex-1 overflow-y-auto bg-white rounded-[16px] py-3 px-6"
          style={{
            height: 'calc(100vh - 120px)',
          }}
        >
          {/* .titleBtns: flex justify-between mb:12px */}
          <div className="mb-3 flex items-center justify-between">
            <p
              className="flex items-center gap-2 text-[#0D0D0D] text-[16px] font-medium"
            >
              {detail?.name}
              <Icon
                name="pencil"
                size={14}
                className="cursor-pointer text-[#898b8f]"
              />
            </p>
            <div className="flex gap-2">
              <Button light size="small">
                <div className="flex items-center gap-1">
                  <Icon name="refresh-cw" size={14} />
                  刷新
                </div>
              </Button>
              <Button light size="small">
                <div className="flex items-center gap-1">
                  <Icon name="download" size={14} />
                  下载
                </div>
              </Button>
              <Button light size="small">
                <div className="flex items-center gap-1">
                  <Icon name="trash-2" size={14} />
                  删除
                </div>
              </Button>
            </div>
          </div>

          {/* .taskInfo: mb:12px */}
          <div className="mb-3 flex items-center text-sm">
            <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: st.color === '#07C160' ? '#e8f8ef' : st.color === '#296BEF' ? '#e5eeff' : '#fef1f0', color: st.color }}>
              {st.label}
            </span>
            <span className="mx-2 text-[#D9D9D9]">
              |
            </span>
            <span className="mr-5 text-[#626365]">
              人群名称：{detail?.audience?.name}
            </span>
            <span className="text-[#626365]">
              人群规模: {(detail?.audience?.userNumber || 0).toLocaleString()}
            </span>
          </div>

          {/* BlockTab Tabs */}
          <Tabs
            value={activeTab}
            onChange={(v) => setActiveTab(String(v))}
            items={tabs.map((t) => ({ label: t.label, value: t.value }))}
          />

          {/* Tab 内容 */}
          <div className="mt-4">
            {activeTab === 'user-property' && (
              <UserPropertyTab tagInsightResult={tagInsightResult} />
            )}
            {activeTab === 'user-behavior' && (
              <UserBehaviorTab tagInsightResult={tagInsightResult} />
            )}
            {activeTab === 'industry-label' && (
              <IndustryLabelTab tagInsightResult={tagInsightResult} />
            )}
            {activeTab === 'config' && <ConfigInfoTab data={detail} />}
          </div>
        </div>
      </div>
    </RuyiLayout>
  );
}
