'use client';

import {
  Button,
  Icon,
  Input,
  Pagination,
  RuyiLayout,
  Select,
  Table,
  Tooltip,
  type RuyiMenuItem,
} from 'one-design-next';
import React, { useMemo, useState } from 'react';

import {
  AISearchBar,
  AISearchResultPanel,
} from '../blocks/ai-brief-input';
import createAudienceFixture from './data/create-audience.json';

// 本地 fixtures，避免预览域等非 localhost 来源被 CDN CORS 拦截
const createAudienceCdnData = createAudienceFixture as Record<string, any>;

// ─── 菜单 ─────
const NAV_ITEMS = ['首页', '洞察诊断', '人群策略', '策略应用', '全域度量', '生意'];

// 顶栏 label → workshop 页面 slug（本文件独立维护，不与其他 workshop 页面共享）
const NAV_ROUTES: Record<string, string> = {
  '首页': 'home',
  '洞察诊断': 'compete-analysis',
  '人群策略': 'r-zero-crowd',
  '策略应用': 'insight-ip',
  '全域度量': 'review',
  生意: 'store-asset-distribution',
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
      { key: 'r-zero-crowd', label: '行业优选' },
      { key: 'interest', label: '兴趣精选' },
      { key: 'theme', label: '主题甄选' },
      { key: 'ai', label: 'AI智选', badge: 'BETA' },
    ],
  },
  {
    key: 'custom',
    label: '自定义人群',
    icon: 'user-edit',
    children: [
      { key: 'create-audience', label: '新建人群', badge: 'NEW' },
      { key: 'audience-list', label: '人群列表' },
      { key: 'audience-profile', label: '人群画像' },
    ],
  },
];

// 菜单 key → workshop 页面 slug（本文件独立维护，不与其他 workshop 页面共享）
const MENU_ROUTES: Record<string, string> = {
  'r-zero-crowd': 'r-zero-crowd',
  interest: 'interest-preference-crowd',
  theme: 'theme-selection-crowd',
  ai: 'ai-smart-crowd',
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

// ─── Tab 枚举（对齐 data.tsx TagMap） ─────
type TabValue = 'Tag' | 'Crowd' | 'MyCrowd';
const TAB_OPTIONS: { value: TabValue; label: string; icon: string }[] = [
  { value: 'Tag', label: '从标签列表中选择', icon: 'message-circle-plus' },
  { value: 'Crowd', label: '从人群夹中选择', icon: 'users' },
  { value: 'MyCrowd', label: '从过往人群包中选择', icon: 'file-text' },
];

// ─── SquareTabs（对齐 components/Tabs：bg:#f6f7f8, gap:18px, p:6px, radius:6px, 选中白底） ─────
function SquareTabs({
  value,
  onChange,
}: {
  value: TabValue;
  onChange: (v: TabValue) => void;
}) {
  return (
    <div className="px-6 pt-4">
      <h2 className="pb-2 text-base font-semibold text-[#0d0d0d]">新建人群</h2>
      <div
        className="flex rounded-md gap-[18px] p-1.5 pb-2 bg-[#f6f7f8]"
      >
        {TAB_OPTIONS.map((tab) => {
          const isActive = value === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md cursor-pointer py-3 border border-transparent"
              style={{
                backgroundColor: isActive ? '#fff' : 'transparent',
              }}
            >
              <Icon
                name={tab.icon}
                size={16}
                style={{ color: isActive ? '#296BEF' : '#BABCC1' }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: isActive ? '#464749' : '#898b8f' }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 标签按钮（对齐 DmpButton size=small withBg + PanelTags.module.less .btn） ─────
// DmpButton: <span>, withBg → bg:rgba(73,89,122,0.05) radius:6px, small → padding:6px 11px font-size:12px line-height:20px
// PanelTags .btn: width:96px text-align:center text-overflow:ellipsis overflow:hidden white-space:nowrap
function TagBtn({ name }: { name: string }) {
  return (
    <span
      className="inline-block cursor-pointer truncate text-center text-[#0d0d0d] transition-colors active:bg-[rgba(73,90,122,0.1)] w-[96px] px-[11px] py-1.5 text-[12px] leading-[20px] rounded-[6px] bg-[rgba(73,89,122,0.05)]"
      title={name.length > 6 ? name : undefined}
    >
      {name}
    </span>
  );
}

// ─── Tab1: PanelTags（对齐 PanelTags.tsx + PanelTags.module.less） ─────
function PanelTags({ tagMap }: { tagMap: any }) {
  const [searchText, setSearchText] = useState('食杂零售');
  const [showResult, setShowResult] = useState(true);
  const tags = tagMap?.tags || [];
  const ORDER: Record<number, number> = {
    10002: 0,
    82664: 1,
    10004: 2,
    97916: 3,
  };
  const sorted = useMemo(
    () =>
      [...tags].sort(
        (a: any, b: any) => (ORDER[a.value] ?? 99) - (ORDER[b.value] ?? 99),
      ),
    [tags],
  );

  return (
    <div>
      {/* AI 搜索 + 结果面板: flex-col gap-3.5, padding:16px 24px 0 24px */}
      <div className="flex flex-col px-6 pt-4 gap-[14px]">
        <AISearchBar value={searchText} onChange={setSearchText} />
        {showResult && searchText.trim() !== '' && (
          <AISearchResultPanel searchText={searchText} onClose={() => setShowResult(false)} />
        )}
      </div>
      {/* container: padding:24px, padding-top:0, min-height:500px */}
      <div className="px-6 pb-6 min-h-[500px]">
        {sorted.map((tagGroup: any) => (
          // firstLevelTag: flex-col, gap:12px
          <div key={tagGroup.value} className="flex flex-col gap-3">
            {/* firstLevelTitle: font-size:14px, font-weight:500, margin-top:16px */}
            <h4 className="mt-4 text-sm font-medium text-[#0d0d0d]">
              {tagGroup.name}
            </h4>
            {(tagGroup.options || []).map((sub: any, subIdx: number) => (
              // subTagItem: flex, gap:24px
              <div key={sub.value} className="flex gap-6">
                {/* subTagName: min-width:110px, font-size:12px, color:#626365, margin-top:6px */}
                <span
                  className="shrink-0 text-xs text-[#626365] min-w-[110px] mt-1.5"
                >
                  {sub.name}
                </span>
                {/* tagBtns: flex-flow:wrap, gap:4px */}
                <div className="flex flex-wrap gap-1">
                  {(sub.options || []).map((tag: any) => (
                    <TagBtn key={tag.value} name={tag.name} />
                  ))}
                  {/* DigTools 注入：用户行为 && index===0 → 广告互动行为 / 关键词提取 / 明星粉丝 */}
                  {tagGroup.value === 82664 && subIdx === 0 && (
                    <>
                      <TagBtn name="广告互动行为" />
                      <TagBtn name="关键词提取" />
                      <TagBtn name="明星粉丝" />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab2: PanelCrowd（对齐 PanelCrowd/index.tsx + AudienceCartTable：OdnTable checkbox + 3列） ─────
const CROWD_CART_MOCK = [
  { key: '1', source: '行为兴趣偏向', condition: '行为兴趣偏向 > 美容护肤 > 面部护理', time: '2026-04-20 10:23:45' },
  { key: '2', source: '电商', condition: '电商 > 核心人群 > 食品饮料', time: '2026-04-19 14:05:12' },
  { key: '3', source: '基本信息', condition: '年龄 > 25-34', time: '2026-04-18 09:12:33' },
  { key: '4', source: '基本信息', condition: '性别 > 女', time: '2026-04-18 09:12:33' },
  { key: '5', source: '预测场所到访', condition: '预测场所到访 > 购物 > 超市便利', time: '2026-04-17 16:41:08' },
];

const CROWD_CART_COLUMNS = [
  { key: 'source', dataIndex: 'source', title: '人群来源', width: 120, ellipsis: true },
  { key: 'condition', dataIndex: 'condition', title: '提取条件', width: 500, ellipsis: true },
  { key: 'time', dataIndex: 'time', title: '添加时间', width: 200, ellipsis: true },
];

function PanelCrowd() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  return (
    <div className="pt-5 pb-5 pr-2 pl-6">
      <Table
        dataSource={CROWD_CART_MOCK}
        columns={CROWD_CART_COLUMNS}
        bordered={false}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as string[]),
        }}
      />
    </div>
  );
}

// ─── Tab3: PanelMyCrowd（对齐 PanelMyCrowd/index.tsx + MyAudienceTable：OdnTable checkbox + 5列） ─────
const MY_CROWD_TYPE_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'action', label: '行为人群' },
  { value: 'ad', label: '广告人群' },
  { value: 'package', label: '上传人群' },
  { value: 'keyword', label: '关键词人群' },
  { value: 'layer', label: '分级人群' },
  { value: 'aiR0', label: 'AI智选' },
  { value: 'rule', label: '规则人群' },
];

const MY_CROWD_MOCK = [
  { key: '10001', audienceId: '10001', audienceName: '美妆护肤核心人群', type: '行为人群', userNumber: '1,235,800', createTime: '2026-03-15 10:30:00' },
  { key: '10002', audienceId: '10002', audienceName: '食品饮料高意向人群', type: '行为人群', userNumber: '2,456,300', createTime: '2026-03-14 14:22:00' },
  { key: '10003', audienceId: '10003', audienceName: '母婴用品潜力人群', type: 'AI智选', userNumber: '890,200', createTime: '2026-03-12 09:15:00' },
  { key: '10004', audienceId: '10004', audienceName: '3C数码兴趣人群', type: '广告人群', userNumber: '3,102,500', createTime: '2026-03-10 16:45:00' },
  { key: '10005', audienceId: '10005', audienceName: '线下商超高频到店人群', type: '规则人群', userNumber: '567,100', createTime: '2026-03-08 11:20:00' },
  { key: '10006', audienceId: '10006', audienceName: '汽车购买意向人群', type: '关键词人群', userNumber: '1,789,400', createTime: '2026-03-05 08:50:00' },
  { key: '10007', audienceId: '10007', audienceName: '游戏核心玩家', type: '行为人群', userNumber: '4,320,600', createTime: '2026-02-28 15:30:00' },
  { key: '10008', audienceId: '10008', audienceName: '高端消费人群', type: '上传人群', userNumber: '345,700', createTime: '2026-02-25 10:10:00' },
  { key: '10009', audienceId: '10009', audienceName: '旅游出行偏好人群', type: '分级人群', userNumber: '2,103,900', createTime: '2026-02-20 13:45:00' },
  { key: '10010', audienceId: '10010', audienceName: '教育培训关注人群', type: 'AI智选', userNumber: '678,500', createTime: '2026-02-18 09:00:00' },
];

const MY_CROWD_COLUMNS = [
  { key: 'audienceId', dataIndex: 'audienceId', title: '人群ID', width: 120, ellipsis: true },
  { key: 'audienceName', dataIndex: 'audienceName', title: '人群名称', width: 300, ellipsis: true },
  { key: 'type', dataIndex: 'type', title: '类型', width: 200, ellipsis: true },
  { key: 'userNumber', dataIndex: 'userNumber', title: '人群规模', width: 100, align: 'right' as const },
  { key: 'createTime', dataIndex: 'createTime', title: '创建时间', width: 160 },
];

function PanelMyCrowd() {
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const filtered = MY_CROWD_MOCK.filter((item) => {
    const matchSearch = !searchText || item.audienceName.includes(searchText) || item.audienceId.includes(searchText);
    const matchType = typeFilter === 'all' || item.type === MY_CROWD_TYPE_OPTIONS.find((o) => o.value === typeFilter)?.label;
    return matchSearch && matchType;
  });

  const pageSize = 20;
  const totalPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col gap-4 pt-5 pb-5 pr-2 pl-6">
      {/* topOperation: flex, justify-content:flex-end, gap:16px */}
      <div className="flex items-center justify-end gap-4">
        <Input
          leftElement={<Icon name="search" size={16} />}
          placeholder="搜索人群名称/ID"
          value={searchText}
          onChange={(v) => { setSearchText(String(v ?? '')); setPage(1); }}
          className="w-[320px]"
        />
        <Select
          value={typeFilter}
          options={MY_CROWD_TYPE_OPTIONS}
          onChange={(v) => { setTypeFilter(String(v ?? 'all')); setPage(1); }}
          className="w-[200px]"
          prefix={<span className="text-[var(--odn-color-black-9)]">类型</span>}
        />
      </div>

      {/* MyAudienceTable: OdnTable checkbox + 5列 */}
      <Table
        dataSource={paged}
        columns={MY_CROWD_COLUMNS}
        bordered={false}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as string[]),
        }}
      />

      {/* bottomOperation: flex, justify-content:flex-end, gap:16px */}
      <div className="flex items-center justify-end gap-4">
        <Pagination
          showPrevNext
          totalSize={filtered.length}
          pageSize={pageSize}
          value={page}
          onChange={(_, p) => setPage(p)}
        />
        <span className="text-sm text-[#898b8f]">共 {totalPage} 页</span>
      </div>
    </div>
  );
}

// ─── CombinationRule（对齐 CombinationRule.tsx + CombinationRule.module.less） ─────
function CombinationRuleBox({
  title,
  isActive,
  onClick,
}: {
  title: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="cursor-pointer overflow-hidden min-h-[200px] pb-2 rounded-[8px]"
      style={{
        border: `1px solid ${isActive ? '#296bef' : '#e2e5ea'}`,
      }}
      onClick={onClick}
    >
      {/* .combinationHead: line-height:36px, padding:8px 16px, font-size:14px, font-weight:600 */}
      <div
        className="leading-[36px] px-4 py-2 text-[14px] font-semibold text-[#0d0d0d]"
      >
        {title}
      </div>

      {/* .nodata: height:138px, justify-content:center → img 60x60 + title(600,rgba(51,55,61,0.58)) + desc(12px,mt:4px) */}
      <div
        className="flex flex-col items-center justify-center h-[138px]"
      >
        <img src="https://dmp.gdtimg.com/static/dmp-web/prod/images/nodata.20140164.png" alt="" className="w-[60px] h-[60px]" />
        <div
          className="mt-3 font-semibold text-[rgba(51,55,61,0.58)] text-[14px]"
        >
          暂无人群
        </div>
        <div
          className="mt-1 text-[12px] text-[rgba(51,55,61,0.58)]"
        >
          请从左侧列表选择
        </div>
      </div>
    </div>
  );
}

// ─── Combination 右面板（对齐 Combination.tsx + Combination.module.less） ─────
function CombinationPanel() {
  const [audienceName, setAudienceName] = useState('');
  const [audienceDesc, setAudienceDesc] = useState('');
  const [activeGroup, setActiveGroup] = useState<'include1' | 'exclude1'>(
    'include1',
  );

  return (
    <div>
      {/* .head: padding:12px 0, line-height:32px → FlexItem: left=title, right=preview */}
      <div
        className="flex items-center justify-between py-3 leading-[32px]"
      >
        {/* .title: font-size:16px, font-weight:bold + .iconfont margin-left:4px color:#898B8F */}
        <span
          className="text-[16px] font-bold flex items-center text-[#0d0d0d]"
        >
          设置组合规则
          <Tooltip
            popup={
              <div>
                <p>定向人群与排除人群均遵循以下规则：</p>
                <p className="mt-[22px]">
                  <span className="font-semibold">组内并集：</span>
                  匹配组内的任一群体
                </p>
                <p>
                  <span className="font-semibold">组间交集：</span>
                  仅匹配组与组之间同时存在的群体
                </p>
              </div>
            }
          >
            <Icon
              name="info"
              size={14}
              className="ml-1 text-[#898B8F]"
            />
          </Tooltip>
        </span>
        {/* .preview: font-size:14px, color:#0D0D0D, gap:4px, flex, align-items:center */}
        <div
          className="flex items-center text-[14px] text-[#0D0D0D] gap-1"
        >
          <span>预计覆盖人数</span>
          {/* .init: padding-bottom:4px, font-size:20px, color:#296bef */}
          <span
            className="pb-1 text-[20px] text-[#296bef]"
            style={{
              fontFamily: 'PingFangSC-Semibold',
            }}
          >
            —
          </span>
        </div>
      </div>

      {/* CombinationRule: 定向人群 + 排除人群 */}
      {/* .combination padding:0 */}
      <div className="p-0">
        <CombinationRuleBox
          title="定向人群1"
          isActive={activeGroup === 'include1'}
          onClick={() => setActiveGroup('include1')}
        />
      </div>

      {/* .addBox: margin:8px 0, .add: color:#296bef, cursor:pointer, font-size:14px */}
      <div className="my-2">
        <span className="text-[#296bef] cursor-pointer text-[14px]">
          添加定向人群
        </span>
      </div>

      <div className="p-0">
        <CombinationRuleBox
          title="排除人群1"
          isActive={activeGroup === 'exclude1'}
          onClick={() => setActiveGroup('exclude1')}
        />
      </div>

      <div className="my-2">
        <span className="text-[#296bef] cursor-pointer text-[14px]">
          添加排除人群
        </span>
      </div>

      {/* .info: margin-top:24px, flex-col, gap:16px */}
      <div
        className="mt-6 flex flex-col gap-4"
      >
        {/* .subTitle: font-size:14px, font-weight:bold */}
        <div className="text-[14px] font-bold text-[#0d0d0d]">
          人群属性
        </div>

        {/* 人群名称：对齐 spaui Input prefix={<span>人群名称</span>} */}
        <Input
          leftElement={<span className="text-[14px] text-[#0d0d0d] whitespace-nowrap">人群名称</span>}
          placeholder="请输入"
          value={audienceName}
          onChange={(v) => setAudienceName(String(v ?? ''))}
          maxLength={32}
        />

        {/* 人群描述：对齐 spaui Input tagType="textarea" prefix={<span>人群描述</span>} */}
        <div className="flex items-start gap-2">
          <span className="shrink-0 pt-2 text-[14px] text-[#0d0d0d]">人群描述</span>
          <Input.Textarea
            className="flex-1"
            placeholder="请输入"
            value={audienceDesc}
            onChange={(e) => setAudienceDesc(e.target.value)}
            count={{ max: 100 }}
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        </div>

        {/* .btn: width:80px, margin-right:12px, displayType=primary */}
        <div>
          <Button intent="primary">生成人群</Button>
        </div>
      </div>
    </div>
  );
}

// ─── 主页面（对齐 index.tsx + index.module.less） ─────
export default function CreateAudiencePage() {
  const cdnData = createAudienceCdnData;
  const [activeNav, setActiveNav] = useState('人群策略');
  const [activeMenu, setActiveMenu] = useState('create-audience');
  const [tabValue, setTabValue] = useState<TabValue>('Tag');

  const tagMap = cdnData?.tagMap;

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
      collapsible
      accountName="香奈儿/CHANEL – 美妆护肤"
      accountId="28392034"
      // square: display:flex, gap:16px, height:calc(100vh-90px)
      contentClassName="flex gap-4 h-[calc(100vh-90px)]"
    >
      {/* ═══ 左面板（对齐 .left: flex:1, h:100%, bg:#fff, radius:12px, overflow-y:scroll） ═══ */}
      <div
        className="flex-1 min-w-0 overflow-y-auto bg-white h-full rounded-[12px]"
      >
        <SquareTabs value={tabValue} onChange={setTabValue} />

        {/* Tab 内容（display:block/none 对齐源码懒渲染方式） */}
        <div className={tabValue === 'Tag' ? 'block' : 'hidden'}>
          {tagMap && <PanelTags tagMap={tagMap} />}
        </div>
        <div className={tabValue === 'Crowd' ? 'block' : 'hidden'}>
          <PanelCrowd />
        </div>
        <div className={tabValue === 'MyCrowd' ? 'block' : 'hidden'}>
          <PanelMyCrowd />
        </div>
      </div>

      {/* ═══ 右面板（对齐 .right: padding:24px/12px top, width:480px, bg:#fff, radius:12px, overflow-y:scroll） ═══ */}
      <div
        className="shrink-0 overflow-y-auto bg-white w-[480px] h-full rounded-[12px] px-6 pt-3 pb-6"
      >
        <CombinationPanel />
      </div>
    </RuyiLayout>
  );
}
