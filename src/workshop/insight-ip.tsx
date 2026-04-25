'use client';

import {
  Button,
  Card,
  Icon,
  Input,
  Pagination,
  RuyiLayout,
  Table,
  Tooltip,
  type RuyiMenuItem,
} from 'one-design-next';
import React, { useState } from 'react';

import insightIpFixture from './data/insight-ip.json';

// ─── 菜单（触点策略） ─────
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

// ─── Mock 频道数据（对齐 InsightBar：一级频道 + 二级频道） ─────
const MOCK_CHANNELS_L1 = [
  { elCidTypeName: '电视剧', tgi: 1.09, proportion: 79.24, userNum: 12340 },
  { elCidTypeName: '电影', tgi: 1.07, proportion: 47.67, userNum: 8760 },
  { elCidTypeName: '综艺', tgi: 1.17, proportion: 45.13, userNum: 8020 },
  { elCidTypeName: '动漫', tgi: 0.93, proportion: 38.09, userNum: 6420 },
  { elCidTypeName: '少儿', tgi: 1.13, proportion: 16.09, userNum: 3820 },
  { elCidTypeName: '纪录片', tgi: 1.28, proportion: 6.84, userNum: 4690 },
  { elCidTypeName: '体育', tgi: 1.10, proportion: 6.21, userNum: 3210 },
];

const MOCK_CHANNELS_L2 = [
  { mainGenre: '爱情', tgi: 1.06, proportion: 71.92, userNum: 5430 },
  { mainGenre: '古装', tgi: 1.09, proportion: 47.58, userNum: 4280 },
  { mainGenre: '都市', tgi: 1.16, proportion: 31.44, userNum: 3320 },
  { mainGenre: '悬疑', tgi: 1.15, proportion: 30.18, userNum: 3100 },
  { mainGenre: '剧情', tgi: 1.18, proportion: 18.43, userNum: 2710 },
  { mainGenre: '家庭', tgi: 1.20, proportion: 14.11, userNum: 2320 },
  { mainGenre: '武侠', tgi: 1.05, proportion: 13.05, userNum: 1930 },
];

// ─── InsightBar（对齐 InsightBar/index.tsx + index.module.less） ─────
function InsightBar({
  title,
  subTitle,
  options,
  value,
  clickable,
  onChange,
}: {
  title: string;
  subTitle: string;
  options: any[];
  value?: string;
  clickable?: boolean;
  onChange?: (val: string) => void;
}) {
  const nameKey = options[0]?.elCidTypeName ? 'elCidTypeName' : 'mainGenre';

  return (
    <div className="min-h-[140px] flex-1" style={{ borderRight: clickable ? '1px solid var(--odn-color-black-4, #e9ebef)' : undefined }}>
      {/* .title: padding:16px 24px, 14px 600 */}
      <div className="px-6 py-4 text-[14px] font-semibold leading-[30px] text-[#0D0D0D]">
        {title}
      </div>
      <div className="px-4">
        {/* .contentHeader */}
        <div className="flex text-sm px-4 py-[9px] leading-[22px] text-[rgba(38,38,41,0.72)]">
          <div className="basis-[92px] text-left">{subTitle}</div>
          <div className="basis-[82px] pr-8 text-right">TGI</div>
          <div className="flex-1">目标人群占比</div>
        </div>
        {/* .barContent: height:272px overflow-y:auto */}
        <div className="h-[272px] overflow-y-auto">
          {options.map((item, i) => {
            const name = item[nameKey];
            const tgi = Math.round((item.tgi || 0) * 100);
            const proportion = item.proportion || 0;
            const isActive = clickable && value === name;
            return (
              <div
                key={i}
                className="flex items-center text-sm px-4 py-[9px] leading-[22px] text-[#0D0D0D] rounded-[6px]"
                style={{
                  cursor: clickable ? 'pointer' : 'default',
                  backgroundColor: isActive ? 'rgba(0,109,248,0.10)' : undefined,
                }}
                onClick={() => clickable && onChange?.(name)}
                onMouseEnter={(e) => { if (!isActive && clickable) e.currentTarget.style.backgroundColor = 'rgba(63,91,128,0.05)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = ''; }}
              >
                <div className="basis-[92px] text-left">{name}</div>
                <div className="basis-[82px] pr-8 text-right">{tgi}</div>
                <div className="flex flex-1 items-center">
                  {/* .bar: h:12px radius:2px bg:#439BFF */}
                  <span className="inline-block h-[12px] rounded-[2px] bg-[#439BFF]" style={{ width: (329 * proportion) / 100 }} />
                  {/* .percent: ml:8px font:OD-number 14px */}
                  <span className="ml-2 text-[14px] leading-[22px]">
                    {proportion ? `${(proportion / 100 * 100).toFixed(2)}%` : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 排名序号（对齐 IpTable .index .firstIndex .secondIndex .thirdIndex） ─────
function RankIndex({ index }: { index: number }) {
  const colors: Record<number, string> = { 0: '#FF6160', 1: '#FFA700', 2: '#FFCB00' };
  return (
    <span
      className="inline-flex items-center justify-center text-white w-[24px] h-[24px] rounded-[6px] text-[12px]"
      style={{ backgroundColor: colors[index] || '#E0E5EC' }}
    >
      {index + 1}
    </span>
  );
}

// ─── 播放状态标签（对齐 .hotNow / .notStartedYet） ─────
function PlayingStatus({ status }: { status: string }) {
  const isPlaying = status === '热播中';
  return (
    <span
      className="inline-block whitespace-nowrap px-3 py-[3px] rounded-[15px] text-[12px]"
      style={{
        color: isPlaying ? '#ED776D' : '#00C7BE',
        backgroundColor: isPlaying ? '#FFF8F7' : '#F2FCFC',
        border: `1px solid ${isPlaying ? '#FBDDDA' : '#CCF4F2'}`,
      }}
    >
      {status}
    </span>
  );
}

// ─── 表格列定义（对齐 IpTable 的 columns） ─────
const IP_TABLE_COLUMNS = [
  {
    key: 'index',
    dataIndex: 'index',
    title: '',
    width: 60,
    render: ({ rowIndex }: any) => <RankIndex index={rowIndex} />,
  },
  {
    key: 'contentTitle',
    dataIndex: 'contentTitle',
    title: 'IP 名称',
    width: 140,
    ellipsis: true,
    render: ({ row }: any) => <span className="cursor-pointer text-sm font-medium text-[#0d0d0d] hover:text-[#296BEF]">{row.contentTitle}</span>,
  },
  {
    key: 'score',
    dataIndex: 'score',
    title: '综合推荐值',
    width: 120,
    sorter: true,
    render: ({ row }: any) => row.score || '-',
  },
  {
    key: 'proportion',
    dataIndex: 'proportion',
    title: '目标人群占比',
    width: 120,
    sorter: true,
    render: ({ row }: any) => row.proportion ? `${row.proportion}%` : '-',
  },
  {
    key: 'tgi',
    dataIndex: 'tgi',
    title: 'TGI',
    width: 80,
    sorter: true,
    render: ({ row }: any) => row.tgi ? Math.round(Number(row.tgi) * 100) : '-',
  },
  {
    key: 'elCidTypeName',
    dataIndex: 'elCidTypeName',
    title: '频道',
    width: 100,
    ellipsis: true,
  },
  {
    key: 'rcmdScore',
    dataIndex: 'rcmdScore',
    title: '评分',
    width: 70,
    sorter: true,
    render: ({ row }: any) => row.rcmdScore ? Number(row.rcmdScore).toFixed(1) : '-',
  },
  {
    key: 'playingStatus',
    dataIndex: 'playingStatus',
    title: '播放状态',
    width: 104,
    render: ({ row }: any) => {
      const dt = row.premiereDt;
      const isPlaying = dt && Number(dt) <= Number(new Date().toISOString().slice(0, 10).replace(/-/g, ''));
      return <PlayingStatus status={isPlaying ? '热播中' : '未开播'} />;
    },
  },
  {
    key: 'director',
    dataIndex: 'director',
    title: '导演',
    width: 120,
    ellipsis: true,
    render: ({ row }: any) => row.director?.replace(/\+/g, '、') || '-',
  },
  {
    key: 'leadingActor',
    dataIndex: 'leadingActor',
    title: '主演',
    width: 180,
    ellipsis: true,
    render: ({ row }: any) => row.leadingActor?.replace(/\+/g, '、') || '-',
  },
  {
    key: 'premiereDt',
    dataIndex: 'premiereDt',
    title: '播放时间',
    width: 110,
    render: ({ row }: any) => {
      const dt = row.premiereDt;
      if (!dt) return '-';
      const s = String(dt);
      return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
    },
  },
  {
    key: 'operate',
    dataIndex: 'operate',
    title: '操作',
    width: 88,
    render: () => (
      <div className="flex gap-3 text-sm">
        <span className="cursor-pointer text-[#296BEF]">详情</span>
        <span className="cursor-pointer text-[#296BEF]">推送</span>
      </div>
    ),
  },
];

// ─── 主页面（对齐 insight/ip/index.tsx + index.module.less） ─────
export default function InsightIpPage() {
  const data = insightIpFixture as any;
  const [channel, setChannel] = useState('电视剧');
  const [playStatus, setPlayStatus] = useState('1');
  const [searchKey, setSearchKey] = useState('');
  const [page, setPage] = useState(1);
  const [activeNav, setActiveNav] = useState('策略应用');
  const [activeMenu, setActiveMenu] = useState('insight-ip');

  const ipList = data.ipList?.list || [];
  const filteredList = searchKey
    ? ipList.filter((d: any) => d.contentTitle?.includes(searchKey) || d.director?.includes(searchKey) || d.leadingActor?.includes(searchKey))
    : ipList;

  const firstLabel = MOCK_CHANNELS_L1.slice(0, 2).map((c) => c.elCidTypeName).join('、');

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
      {/* ListPage 1: EditCrowd header（对齐 EditCrowd HeaderComponent） */}
      <Card elevation={0} className="mb-4 px-6 py-4">
        <header className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="flex items-center gap-1 text-base font-semibold text-[#0D0D0D]">
              <Icon name="users" size={16} />
              目标人群：美妆行业意向人群
            </span>
            <span className="ml-6 text-sm text-[#626365]">33,783 万人</span>
            <span className="relative ml-8 flex items-center gap-2 pl-[17px]">
              <span className="absolute left-0 top-0 h-4 border-r border-[#E9EBEF]" />
              {['消费水平：中', '学历：初中', '性别：女', '常住城市等级：二线城市', '年龄：30-39'].map((t) => (
                <span
                  key={t}
                  className="whitespace-nowrap rounded border border-[rgba(63,91,128,0.16)] bg-[#FAFAFB] px-2 text-xs leading-5 text-[rgba(38,38,41,0.72)]"
                >
                  {t}
                </span>
              ))}
            </span>
          </div>
          <span className="flex shrink-0 cursor-pointer items-center gap-1 text-sm text-[#296BEF]">
            <Icon name="pencil" size={14} />
            编辑
          </span>
        </header>
      </Card>

      {/* ListPage 2: 频道匹配分析（对齐 .blockTitle + .insight + .insightChart） */}
      <Card elevation={0} className="mb-4 px-6 py-4">
        {/* .blockTitle: 16px 600 h:36px mb:16px */}
        <div className="text-[16px] font-semibold leading-[36px] mb-4 text-[#0D0D0D]">
          频道匹配分析
        </div>

        {/* .insight: flex */}
        <div className="flex items-center">
          {/* .insightLeft: 64px bg:gradient 蓝色 "洞察" */}
          <div
            className="flex shrink-0 items-center justify-center w-[64px] h-[56px] text-[#006DF8] text-[14px] font-semibold rounded-l-[8px]"
            style={{
              background: 'linear-gradient(180deg, #E3EEFF 0%, #F7F9FC 100%)',
            }}
          >
            洞察
          </div>
          {/* .insightRight */}
          <div className="flex flex-1 flex-col gap-2 px-6 py-4 bg-[#FAFAFB] rounded-r-[8px]">
            <div className="flex items-center leading-[24px]">
              <span className="mr-2 inline-block h-1 w-1 rounded-full bg-[#0D0D0D]" />
              在一级频道 <span className="px-1 font-semibold text-[#0D0D0D]">{firstLabel}</span> 下浓度较高
            </div>
          </div>
        </div>

        {/* .insightChart: flex mt:16px border radius:8px, border: 1px solid rgba(73,90,122,0.1) */}
        <div className="mt-4 flex overflow-hidden rounded-[8px] border border-[rgba(73,90,122,0.1)]">
          <InsightBar
            title="频道" subTitle="一级频道"
            options={MOCK_CHANNELS_L1}
            value={channel}
            clickable
            onChange={setChannel}
          />
          <InsightBar
            title={channel} subTitle="二级频道"
            options={MOCK_CHANNELS_L2}
          />
        </div>
      </Card>

      {/* ListPage 3: IP 匹配推荐 */}
      <Card elevation={0} className="p-0">
        <div className="px-6 py-4">
          {/* .blockTitle */}
          <div className="text-[16px] font-semibold leading-[36px] mb-4 text-[#0D0D0D]">
            IP 匹配推荐
          </div>

          {/* LabelRow: 类型 → ButtonGroup */}
          <div className="mb-3 flex items-center gap-4">
            <span className="shrink-0 text-sm text-[#626365] basis-[40px]">类型</span>
            <div className="flex gap-2">
              {[{ label: '热播内容', value: '1' }, { label: '招商项目推荐', value: '2' }].map((opt) => (
                <button
                  key={opt.value}
                  className="cursor-pointer rounded-md px-3 py-1 text-sm transition-colors"
                  style={{
                    fontWeight: playStatus === opt.value ? 600 : 400,
                    color: playStatus === opt.value ? '#296BEF' : '#0D0D0D',
                    backgroundColor: playStatus === opt.value ? '#F5F8FF' : 'transparent',
                  }}
                  onClick={() => setPlayStatus(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* LabelRow: 其他 → 搜索 */}
          <div className="mb-4 flex items-center gap-4">
            <span className="shrink-0 text-sm text-[#626365] basis-[40px]">其他</span>
            <Input
              leftElement={<Icon name="search" size={14} />}
              placeholder="请输入 IP 名称、导演或主演"
              value={searchKey}
              onChange={(v) => { setSearchKey(String(v ?? '')); setPage(1); }}
              className="w-[240px]"
            />
          </div>

          {/* IpTable（对齐 IpTable/index.tsx：OdnTable 排序+可排序列） */}
          <Table
            dataSource={filteredList.map((d: any, i: number) => ({ ...d, key: d.contentId || i }))}
            columns={IP_TABLE_COLUMNS}
            bordered={false}
            scroll={{ x: 1400 }}
          />

          {/* 分页 */}
          <div className="mt-4 flex justify-end">
            <Pagination
              showPrevNext
              totalSize={data.ipList?.totalNum || 0}
              pageSize={20}
              value={page}
              onChange={(_, p) => setPage(p)}
            />
          </div>
        </div>
      </Card>
    </RuyiLayout>
  );
}
