'use client';

import {
  Button,
  Icon,
  Input,
  Pagination,
  RuyiLayout,
  Select,
  Table,
  Tabs,
  type RuyiMenuItem,
} from 'one-design-next';
import React, { useState } from 'react';
import influencerTableRaw from './data/influencer-table.json';

// ─── 菜单 ─────
const MENU_ITEMS: RuyiMenuItem[] = [
  {
    key: 'touchpoint',
    label: '触点策略',
    icon: 'flag',
    children: [
      { key: 'insight-ip', label: '钜如翼' },
      { key: 'influencer', label: '翼红人' },
    ],
  },
];

const NAV_ITEMS = ['首页', '洞察诊断', '人群策略', '策略应用', '全域度量', '生意'];

// 菜单 key → workshop 页面 slug（本文件独立维护，不与其他 workshop 页面共享）
const MENU_ROUTES: Record<string, string> = {
  'insight-ip': 'insight-ip',
  influencer: 'influencer',
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

// ─── 筛选项 Mock（对齐 SelectionQuery.tsx 中 queryItemConfig + useFinderTradeMap.ts） ─────
const CATEGORY_OPTIONS = [
  '美妆',
  '美食',
  '时尚',
  '母婴',
  '科技数码',
  '汽车',
  '游戏',
  '旅行',
  '教育',
  '健身运动',
  '生活',
  '情感',
  '搞笑',
  '音乐',
  '影视',
  '三农',
  '财经',
].map((v) => ({ value: v, label: v }));

const PROMOTION_TYPES = [
  { value: '0', label: '品牌曝光' },
  { value: '3', label: '破圈种草' },
  { value: '1', label: '行动转化' },
  { value: '2', label: '商品推广' },
];

const FANS_LEVEL_OPTIONS = [
  { value: '[0,10000]', label: '<1万' },
  { value: '[10000,100000]', label: '1-10万' },
  { value: '[100000,500000]', label: '10-50万' },
  { value: '[500000,1000000]', label: '50-100万' },
  { value: '[1000000,5000000]', label: '100-500万' },
  { value: '[5000000,99999999]', label: '500万+' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
];

const CITY_OPTIONS = [
  '北京',
  '上海',
  '广州',
  '深圳',
  '杭州',
  '成都',
  '重庆',
  '武汉',
  '南京',
  '西安',
].map((v) => ({ value: v, label: v }));

const IDENTITY_OPTIONS = [
  { value: '1', label: '明星' },
  { value: '2', label: '达人' },
  { value: '3', label: 'KOC' },
  { value: '4', label: '专家' },
];

const INDUSTRY_OPTIONS = [
  { value: '1', label: '美妆个护' },
  { value: '2', label: '食品饮料' },
  { value: '3', label: '母婴亲子' },
  { value: '4', label: '3C数码' },
  { value: '5', label: '服饰箱包' },
  { value: '6', label: '家居日用' },
];

const TRADE_FEATURE_OPTIONS = [
  { value: '5', label: '行业推荐' },
  { value: '6', label: '新锐创作者' },
  { value: '7', label: '行业获奖' },
];

const PRICE_OPTIONS = [
  { value: '[0,200000]', label: '<0.2万' },
  { value: '[200000,500000]', label: '0.2-0.5万' },
  { value: '[500000,1000000]', label: '0.5-1万' },
  { value: '[1000000,2000000]', label: '1-2万' },
  { value: '[2000000,5000000]', label: '2-5万' },
  { value: '[5000000,10000000]', label: '5-10万' },
  { value: '[10000000,99999999]', label: '>10万' },
];

// ─── Mock 达人数据（对齐 FinderTradeItem） ─────
// 分类 ID → 名称映射（简化 mock，对齐 getFinderCategoryTagNames）
const CATEGORY_MAP: Record<number, string> = {
  32: '搞笑', 32003: '搞笑幽默', 33: '美妆', 33001: '美妆护肤', 34: '美食', 35: '时尚',
  36: '母婴', 37: '科技', 38: '汽车', 39: '游戏', 40: '旅行', 41: '教育', 42: '健身',
  43: '生活', 44: '情感', 45: '音乐', 46: '影视', 47: '三农', 48: '财经', 49: '摄影',
};

// 处理原始数据：添加 key/_categoryNames/_specialTags
function processData(list: any[]): any[] {
  return list.map((item, i) => ({
    ...item,
    key: item.appid || `${i}`,
    _categoryNames: [CATEGORY_MAP[item.category_level1], CATEGORY_MAP[item.category_level2]].filter(Boolean),
    _specialTags: item.tags?.includes(10799) ? ['水晶球洞察'] : [],
  }));
}

// 本地 fixtures，避免预览域等非 localhost 来源被 CDN CORS 拦截
const influencerTableFixture = processData(influencerTableRaw as any[]);

// ─── Codesign Icon（视频号 \e1f2 / 公众号 \e1f3） ─────
const CODESIGN_FONT_URL =
  'https://cdn2.codesign.qq.com/icons/LOD8r0BplyjRXkg/1766373959/iconfont.woff?t=742d037ccb8cf0450b941d8fc2bddf03';

function CodesignIcon({
  code,
  style,
}: {
  code: string;
  style?: React.CSSProperties;
}) {
  return (
    <>
      <style>{`@font-face { font-family: 'ruyi-icon'; src: url('${CODESIGN_FONT_URL}') format('woff'); font-weight: normal; font-style: normal; }`}</style>
      <span
        className="text-[18px] leading-[1]"
        style={{
          fontFamily: 'ruyi-icon',
          ...style,
        }}
      >
        {code}
      </span>
    </>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center mt-3">
      <label
        className="shrink-0 text-sm w-[100px] pl-3 leading-[36px] text-[#33373D94]"
      >
        {label}
      </label>
      <div
        className="flex min-w-0 flex-1 flex-wrap items-center gap-y-2 gap-x-0"
      >
        {children}
      </div>
    </div>
  );
}

// ─── CheckTag：对齐 CheckTags 的 tag pill（height:36px, padding:6px 12px, borderRadius:6px, color:rgba(32,33,38,0.58)） ─────
function CheckTag({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="cursor-pointer whitespace-nowrap border-0 text-sm px-3 py-1.5 rounded-[6px] leading-[24px]"
      style={{
        color: active
          ? 'var(--odn-color-primary, #296BEF)'
          : 'rgba(32, 33, 38, 0.58)',
        backgroundColor: active ? 'rgba(61, 126, 255, 0.06)' : 'transparent',
        fontWeight: active ? 600 : 400,
        border: active
          ? '1px solid rgba(61,126,255,0.8)'
          : '1px solid transparent',
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// QrCode SVG icon（对齐 NewPublisherBaseInfo 的二维码 icon）
function QrCodeIcon() {
  return (
    <svg className="ml-1 inline-block shrink-0 align-middle text-[#babcc1]" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M4 10H6.25V13.75H5V11.25H2.75V7.75H6.25V9H4V10ZM0.75 0.25H5.75C6.02614 0.25 6.25 0.473858 6.25 0.75V5.75C6.25 6.02614 6.02614 6.25 5.75 6.25H0.75C0.473858 6.25 0.25 6.02614 0.25 5.75V0.75C0.25 0.473858 0.473858 0.25 0.75 0.25ZM1.5 1.5V5H5V1.5H1.5ZM2.5 2.5H4V4H2.5V2.5ZM8.25 0.25H13.25C13.5261 0.25 13.75 0.473858 13.75 0.75V5.75C13.75 6.02614 13.5261 6.25 13.25 6.25H8.25C7.97386 6.25 7.75 6.02614 7.75 5.75V0.75C7.75 0.473858 7.97386 0.25 8.25 0.25ZM9 1.5V5H12.5V1.5H9ZM10 2.5H11.5V4H10V2.5ZM8.25 7.75H13.25C13.5261 7.75 13.75 7.97386 13.75 8.25V13.25C13.75 13.5261 13.5261 13.75 13.25 13.75H8.25C7.97386 13.75 7.75 13.5261 7.75 13.25V8.25C7.75 7.97386 7.97386 7.75 8.25 7.75ZM9 9V12.5H12.5V9H9ZM10 10H11.5V11.5H10V10ZM0.25 7.75H1.5V9H0.25V7.75ZM1.5 12.5H3.5V13.75H0.75C0.473858 13.75 0.25 13.5261 0.25 13.25V10H1.5V12.5Z" />
    </svg>
  );
}

// LiteTag（对齐 ColAccountTags 的分类标签：灰底小标签）
function LiteTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block max-w-[114px] truncate rounded text-xs px-1.5 py-px bg-[#f5f6f8] text-[rgba(51,55,61,0.72)] leading-[18px]">
      {children}
    </span>
  );
}

// 格式化万分比为百分比
function formatWToPercent(v: number | string | undefined): string {
  if (v === undefined || v === null || v === '') return '-';
  const n = Number(v);
  if (isNaN(n) || n === 0) return '-';
  return `${(n / 100).toFixed(2)}%`;
}

// 格式化金额（分→元）
function formatMoneyToYuan(v: number | string): string {
  const n = Number(v);
  if (!n || isNaN(n)) return '-';
  const yuan = n / 100;
  if (yuan >= 10000) return `¥ ${(yuan / 10000).toFixed(1)}万`;
  return `¥ ${yuan.toLocaleString()}`;
}

// ─── 表格列定义（严格对齐 FinderTableData.tsx tableCols 列顺序 + 各 Col 组件） ─────
const COLUMNS = [
  // 1. 视频号名称（对齐 ColFinderName → NewPublisherBaseInfo：头像+名称+二维码+城市+认证）
  {
    key: 'nickname',
    dataIndex: 'nickname',
    title: '视频号名称',
    width: 282,
    fixed: 'left' as const,
    render: ({ row }: any) => (
      <div className="flex items-center gap-3">
        <img src={row.avatar?.replace('/0', '/132')} className="h-10 w-10 shrink-0 rounded-full object-cover" alt="" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center">
            <span className="cursor-pointer truncate text-sm font-medium text-[#0d0d0d] hover:text-[#296BEF]">{row.nickname}</span>
            {row.qr_code && <QrCodeIcon />}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-[rgba(51,55,61,0.58)]">
            {row.city_label && <span className="rounded px-1 bg-[#f5f6f8]">{row.city_label}</span>}
            {row.auth_profession && (
              <span className="flex items-center gap-0.5">
                <CodesignIcon code={'\ue1f2'} style={{ fontSize: 12, color: '#eda20c' }} />
                <span className="max-w-[100px] truncate">{row.auth_profession}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    ),
  },
  // 2. 账号信息（对齐 ColAccountTags：分类标签 + 特殊标签）
  {
    key: 'account_tags',
    dataIndex: 'account_tags',
    title: '账号信息',
    width: 150,
    render: ({ row }: any) => (
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap gap-1">
          {row._categoryNames?.map((name: string) => <LiteTag key={name}>{name}</LiteTag>)}
        </div>
        {row._specialTags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {row._specialTags.slice(0, 2).map((tag: string) => (
              <span key={tag} className="inline-block truncate rounded text-xs px-1.5 py-px bg-[#eef3fe] text-[#296BEF] leading-[18px] max-w-[114px]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    ),
  },
  // 3. 投后5R人数排名（对齐 PostInvest5rRank）
  {
    key: 'post_invest_5r_rank',
    dataIndex: 'post_invest_5r_rank',
    title: '投后5R人数排名',
    width: 142,
    align: 'right' as const,
    sorter: true,
    render: ({ row }: any) => row.post_invest_5r_rank ?? '-',
  },
  // 4. R0浓度（对齐 ColR0Score：橙色）
  {
    key: 'r0_score',
    dataIndex: 'score',
    title: 'R0浓度',
    width: 115,
    align: 'right' as const,
    render: ({ row }: any) => (
      <span className="text-[#f78400]">{row.score > 0 ? row.score.toFixed(1) : '-'}</span>
    ),
  },
  // 5. 粉丝量级（对齐 ColCommonBase dataKey=fans_num_level）
  {
    key: 'fans_num',
    dataIndex: 'fans_num_level',
    title: '粉丝量级',
    width: 100,
    align: 'right' as const,
    sorter: true,
  },
  // 6. 平均播放量
  {
    key: 'avg_read_count',
    dataIndex: 'avg_read_count',
    title: '平均播放量',
    width: 137,
    align: 'right' as const,
    sorter: true,
  },
  // 7. 播放中位数
  {
    key: 'median_read_count',
    dataIndex: 'median_read_count',
    title: '播放中位数',
    width: 137,
    align: 'right' as const,
    sorter: true,
  },
  // 8. 社交指数（对齐 ColSocialInteractionIndex）
  {
    key: 'social_interaction_index',
    dataIndex: 'social_interaction_index',
    title: '社交指数',
    width: 135,
    align: 'right' as const,
    sorter: true,
  },
  // 9. 粉丝增长量
  {
    key: 'fans_num_increment',
    dataIndex: 'fans_num_increment',
    title: '粉丝增长量',
    width: 137,
    align: 'right' as const,
    sorter: true,
  },
  // 10. 粉丝增长率（对齐 ColFansNumGrowthRate：fans_num_growth_range 优先）
  {
    key: 'fans_num_growth_rate',
    dataIndex: 'fans_num_growth_rate',
    title: '粉丝增长率',
    width: 137,
    align: 'right' as const,
    sorter: true,
    render: ({ row }: any) => row.fans_num_growth_range || formatWToPercent(row.fans_num_growth_rate),
  },
  // 11. 平均互动量
  {
    key: 'avg_interaction_count',
    dataIndex: 'avg_interaction_count',
    title: '平均互动量',
    width: 135,
    align: 'right' as const,
    sorter: true,
  },
  // 12. 互动率（对齐 ColInteractionRate：formatWToPercent）
  {
    key: 'interaction_rate',
    dataIndex: 'interaction_rate',
    title: '互动率',
    width: 115,
    align: 'right' as const,
    sorter: true,
    render: ({ row }: any) => formatWToPercent(row.interaction_rate),
  },
  // 13. 预期CPM（对齐 ColExpectedCPM：formatMoney）
  {
    key: 'expected_cpm',
    dataIndex: 'expected_cpm',
    title: '预期CPM',
    width: 130,
    align: 'right' as const,
    sorter: true,
    render: ({ row }: any) => {
      const v = Number(row.expected_cpm);
      if (!v || isNaN(v)) return '-';
      if (v < 100) return '< 1';
      if (v > 100000) return '1000+';
      return `¥${(v / 100).toFixed(0)}`;
    },
  },
  // 14. 完播率（对齐 ColPlayFinishRate：formatWToPercent）
  {
    key: 'play_finish_rate',
    dataIndex: 'play_finish_rate',
    title: '完播率',
    width: 115,
    align: 'right' as const,
    sorter: true,
    render: ({ row }: any) => formatWToPercent(row.play_finish_rate),
  },
  // 15. 短视频报价（对齐 ColPrice：1~60s / 60s以上 双行）
  {
    key: 'price',
    dataIndex: 'short_video_price',
    title: '短视频报价',
    width: 170,
    fixed: 'right' as const,
    render: ({ row }: any) => (
      <div className="text-sm leading-5">
        <div className="flex items-center gap-1">
          <span className="text-xs text-[rgba(51,55,61,0.36)]">1~60s</span>
          <span>{Number(row.short_video_price) > 0 ? formatMoneyToYuan(row.short_video_price) : '-'}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-[rgba(51,55,61,0.36)]">60s以上</span>
          <span>{Number(row.long_video_price) > 0 ? formatMoneyToYuan(row.long_video_price) : '-'}</span>
        </div>
      </div>
    ),
  },
  // 16. 操作（对齐 Operation：洞察详情 + 推送）
  {
    key: 'operation',
    dataIndex: 'operation',
    title: '操作',
    width: 150,
    fixed: 'right' as const,
    render: () => (
      <div className="flex items-center gap-3">
        <span className="cursor-pointer text-sm text-[#296BEF]">洞察详情</span>
        <span className="cursor-pointer text-sm text-[#296BEF]">推送</span>
      </div>
    ),
  },
];

// ─── 主页面（对齐 InfluencerPage + FinderSelectionList + SelectionQuery + FinderTableData） ─────
export default function InfluencerPage() {
  const [activeTab, setActiveTab] = useState('industry');
  const [flowType, setFlowType] = useState('finder');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [activeNav, setActiveNav] = useState('策略应用');
  const [activeMenu, setActiveMenu] = useState('influencer');

  // 搜索状态
  const [searchKey, setSearchKey] = useState('');

  // 筛选状态（对齐 useQueryList 的 state）
  const [promotionType, setPromotionType] = useState<string>('0');
  const [category, setCategory] = useState<string[]>(['美妆']);
  const [tradeFeature, setTradeFeature] = useState<string>('5');
  const [fansLevel, setFansLevel] = useState<string[]>([]);
  const [gender, setGender] = useState<string[]>([]);
  const [city, setCity] = useState<string[]>([]);
  const [identity, setIdentity] = useState<string[]>([]);
  const [industry, setIndustry] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  const tableData = influencerTableFixture;

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
    >
      {/* 整体白色卡片容器（对齐 PageContainer + Tabs + tabContentWrapper） */}
      <div className="rounded-[12px] overflow-hidden">
        {/* ═══ Tabs（对齐 InfluencerPage.tsx: spaui Tabs + index.module.less .tabs） ═══ */}
        <div className="pl-6 bg-white">
          <Tabs.Default
            value={activeTab}
            onChange={(v: string) => setActiveTab(v)}
            gap={24}
            items={[
              { label: '如翼行业达人团', value: 'industry' },
              { label: 'Rx选达人', value: 'rx' },
              { label: '自定义TA选达人', value: 'custom' },
              { label: '达人水晶球洞察', value: 'crystal' },
            ]}
            className="text-black-10"
            style={
              {
                '--odn-tabs-item-font-size': '16px',
                '--odn-tabs-item-padding-top': '18px',
                '--odn-tabs-item-padding-bottom': '18px',
                '--odn-tabs-active-color': '#0d0d0d',
                '--odn-tabs-indicator-color': '#296BEF',
                '--odn-tabs-item-hover-color': '#1154db',
                '--odn-tabs-item-font-weight': '400',
              } as React.CSSProperties
            }
          />
        </div>

        {/* ═══ Tab Content（对齐 .tabContentWrapper: flex:1 flex-col bg:#fff） ═══ */}
        <div className="flex flex-1 flex-col bg-white">
          {/* FlowTypeTabs（对齐 FlowTypeTab: flex gap:24px padding:24px 24px 0, 16px 600, selected:#0d0d0d, default:#33373D94） */}
          {activeTab !== 'crystal' && (
            <div className="flex gap-6 pt-6 px-6">
              <div
                className="flex cursor-pointer items-center gap-1"
                onClick={() => setFlowType('finder')}
              >
                <CodesignIcon
                  code={'\ue1f2'}
                  style={{
                    color:
                      flowType === 'finder' ? '#f79e0f' : 'rgba(51,55,61,0.58)',
                  }}
                />
                <span
                  className="text-base font-semibold"
                  style={{
                    color: flowType === 'finder' ? '#0d0d0d' : '#33373D94',
                  }}
                >
                  视频号
                </span>
              </div>
              <div
                className="flex cursor-pointer items-center gap-1"
                onClick={() => setFlowType('free')}
              >
                <CodesignIcon
                  code={'\ue1f3'}
                  style={{
                    color:
                      flowType === 'free' ? '#07c160' : 'rgba(51,55,61,0.58)',
                  }}
                />
                <span
                  className="text-base font-semibold"
                  style={{
                    color: flowType === 'free' ? '#0d0d0d' : '#33373D94',
                  }}
                >
                  公众号
                </span>
              </div>
            </div>
          )}

          {/* ═══ SelectionQuery 筛选区域（对齐线上实际页面） ═══ */}
          <div className="pt-3 px-6">
            {/* 搜索账号 */}
            <FilterRow label="搜索账号">
              <Input leftElement={<Icon name="search" size={14} />} placeholder="输入视频号名称搜索达人，按回车键确认" value={searchKey} onChange={(v) => setSearchKey(String(v ?? ''))} className="w-[480px]" />
            </FilterRow>
            {/* 行业达人 */}
            <FilterRow label="行业达人">
              <Select light value="美妆护肤" options={[{ value: '美妆护肤', label: '美妆护肤' }, { value: '食品饮料', label: '食品饮料' }, { value: '3C数码', label: '3C数码' }]} className="mr-2" />
              <CheckTag label="投后5R(Top50%)" active onClick={() => {}} />
              <CheckTag label="R3流入(Top50%)" active={false} onClick={() => {}} />
              <CheckTag label="5R拉新(Top50%)" active={false} onClick={() => {}} />
            </FilterRow>
            {/* 营销目标 */}
            <FilterRow label="营销目标">
              {PROMOTION_TYPES.map((item) => (
                <CheckTag key={item.value} label={item.label} active={promotionType === item.value} onClick={() => setPromotionType(promotionType === item.value ? '' : item.value)} />
              ))}
            </FilterRow>
            {/* 达人领域：全部 + Select light 下拉 */}
            <FilterRow label="达人领域">
              <CheckTag label="全部" active={category.length === 0} onClick={() => setCategory([])} />
              {['汽车', '时尚', '财经', '科技', '摄影', '生活', '影视综', '游戏', '情感', '搞笑', '亲子', '美食'].map((name) => (
                <Select key={name} light placeholder={name} options={[{ value: `${name}-1`, label: `${name}-热门` }, { value: `${name}-2`, label: `${name}-新锐` }]} className="mr-0" />
              ))}
              <span className="flex shrink-0 cursor-pointer items-center whitespace-nowrap text-sm text-[#296BEF] px-2 py-1.5" onClick={() => setExpanded(!expanded)}>
                {expanded ? '收起更多领域' : '展开更多领域'}
              </span>
            </FilterRow>
            {/* 达人特征 */}
            <FilterRow label="达人特征">
              <CheckTag label="新面孔达人" active={tradeFeature === '5'} onClick={() => setTradeFeature(tradeFeature === '5' ? '' : '5')} />
              <Select light placeholder="职业身份" options={IDENTITY_OPTIONS} className="mr-2" />
              <Select light placeholder="粉丝量级" options={FANS_LEVEL_OPTIONS} className="mr-2" />
              <Select light placeholder="达人性别" options={GENDER_OPTIONS} className="mr-2" />
              <Select light placeholder="所在城市" options={CITY_OPTIONS} className="mr-2" />
              <CheckTag label="水晶球洞察" active={false} onClick={() => {}} />
            </FilterRow>
            {/* 内容特征 */}
            <FilterRow label="内容特征">
              <CheckTag label="真人出镜" active={false} onClick={() => {}} />
              <Select light placeholder="适合行业" options={INDUSTRY_OPTIONS} className="mr-2" />
              <Select light placeholder="拍摄风格" options={[{ value: '1', label: '口播' }, { value: '2', label: '剧情' }, { value: '3', label: '测评' }]} className="mr-2" />
              <Select light placeholder="内容调性" options={[{ value: '1', label: '专业' }, { value: '2', label: '接地气' }]} className="mr-2" />
              <Select light placeholder="定制能力" options={[{ value: '1', label: '强' }, { value: '2', label: '中' }]} className="mr-2" />
            </FilterRow>
            {/* 视频数据 */}
            <FilterRow label="视频数据">
              <CheckTag label="近十五天有发布" active={false} onClick={() => {}} />
              <Select light placeholder="播放中位数" options={[{ value: '1', label: '1万以上' }, { value: '2', label: '5万以上' }]} className="mr-2" />
              <Select light placeholder="互动率" options={[{ value: '1', label: '前5%' }, { value: '2', label: '前10%' }]} className="mr-2" />
            </FilterRow>
            {/* 合作信息 */}
            <FilterRow label="合作信息">
              <Select light placeholder="价格区间" options={PRICE_OPTIONS} className="mr-2" />
              <Select light placeholder="预期 CPM" options={[{ value: '1', label: '<100' }, { value: '2', label: '100-300' }]} className="mr-2" />
            </FilterRow>
          </div>

          {/* ═══ DmpBatchOperate 批量操作（对齐 DmpBatchOperate.tsx） ═══ */}
          {selectedRowKeys.length > 0 && (
            <div
              className="mx-6 flex items-center gap-3 rounded-lg px-4 py-2 mt-4 bg-[#f5f8ff] border border-[#d6e4ff]"
            >
              <span className="text-sm text-[#0d0d0d]">
                已选{' '}
                <span className="font-semibold text-[#296BEF]">
                  {selectedRowKeys.length}
                </span>{' '}
                个达人
              </span>
              <Button size="small" intent="primary">
                批量推送
              </Button>
              <Button size="small" light onClick={() => setSelectedRowKeys([])}>
                取消
              </Button>
            </div>
          )}

          {/* ═══ FinderTableData（对齐 DhxBaseTable + Column：checkbox + 首列fixed + 尾列fixed right） ═══ */}
          <div className="pt-4">
            <Table
              dataSource={tableData}
              columns={COLUMNS}
              bordered={false}
              scroll={{ x: 2200 }}
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys as string[]),
              }}
            />
          </div>

          {/* ═══ PageBar 分页（对齐 spaui PageBar：padding:32px 0, paddingRight:32px, textAlign:right） ═══ */}
          <div
            className="flex justify-end py-8 pr-8"
          >
            <Pagination
              showPrevNext
              totalSize={tableData.length}
              pageSize={50}
              value={page}
              onChange={(_, p) => setPage(p)}
            />
          </div>
        </div>
        {/* 闭合白色卡片容器 */}
      </div>
    </RuyiLayout>
  );
}
