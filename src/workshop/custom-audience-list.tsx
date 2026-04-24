'use client';

import {
  Button,
  Card,
  Dropdown,
  Icon,
  Input,
  Pagination,
  RuyiLayout,
  Select,
  Switch,
  Table,
  Tabs,
  Tooltip,
  type RuyiMenuItem,
  type TableProps,
  type TableSortOrder,
} from 'one-design-next';
import React, { useMemo, useState } from 'react';
import customAudienceListFixture from './data/custom-audience-list.json';

type AudienceRow = {
  id: number;
  name: string;
  subType: string;
  secondSubType: string;
  frontStatus: string;
  status: string;
  userNumber: number;
  createdTime: number;
  source: string;
  owner: boolean;
  locked: boolean;
  remainingDays: number;
  licenseStatus: string;
  errorCode: number;
};

// 人群策略菜单（本文件独立维护，不与其他 workshop 页面共享）
const NAV_ITEMS = ['首页', '洞察诊断', '人群策略', '策略应用', '全域度量'];

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
      { key: 'create', label: '新建人群' },
      { key: 'list', label: '人群列表' },
      { key: 'profile', label: '人群画像' },
    ],
  },
];

const MENU_ROUTES: Record<string, string> = {
  'r-zero-crowd': 'r-zero-crowd',
  interest: 'interest-preference-crowd',
  theme: 'theme-selection-crowd',
  ai: 'ai-smart-crowd',
  list: 'custom-audience-list',
  create: 'create-audience',
  profile: 'audience-profile',
};

function navigateMenu(key: string) {
  const slug = MENU_ROUTES[key];
  if (!slug || typeof window === 'undefined') return;
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

// ─── 常量（对齐 dmp-web src/constant/audience.ts） ───
const STATUS_OPTIONS = [
  { label: '全部状态', value: 'ALL' },
  { label: '在线', value: 'ONLINE' },
  { label: '不在线', value: 'OFFLINE' },
  { label: '上线中', value: 'LOADING' },
  { label: '计算中', value: 'NEW,PROCESSING' },
  { label: '计算失败', value: 'FAIL' },
  { label: '冻结', value: 'FREEZE,THAWING' },
  { label: '已过期', value: 'EXPIRED' },
];

const TYPE_OPTIONS = [
  { label: '全部类型', value: 'ALL' },
  { label: '行为人群', value: 'APP_ACTION_DATA,WEBSITE_ACTION_DATA,UNION_ACTION_DATA' },
  { label: '广告人群', value: 'AD' },
  { label: '组合人群', value: 'CUSTOM_AUDIENCE_COMBINE' },
  { label: '上传人群', value: 'PACKAGE' },
  { label: '关键词人群', value: 'KEYWORD' },
  { label: '智能拓展人群', value: 'LOOKALIKE,STATIC_LOOKALIKE' },
  { label: '分级人群', value: 'LAYER' },
  { label: 'AI智选', value: 'AI_R0' },
  { label: '规则人群', value: 'RULE' },
];

const OWNER_OPTIONS = [
  { label: '全部类型', value: 'ALL' },
  { label: '自建人群', value: 'TRUE' },
  { label: '授权人群', value: 'FALSE' },
];

const SUB_TYPE_LABEL: Record<string, string> = {
  AD: '广告人群',
  APP_ACTION_DATA: '行为人群',
  CUSTOM_AUDIENCE_COMBINE: '组合人群',
  RULE: '规则人群',
  KEYWORD: '关键词人群',
  LAYER: '分级人群',
  LBS_CROSS_CITY: 'LBS人群',
  LBS_POI: 'LBS人群',
  LOOKALIKE: '拓展人群',
  STATIC_LOOKALIKE: '拓展人群',
  OTT: '家庭人群',
  PACKAGE: '上传人群',
  UNION_ACTION_DATA: '行为人群',
  WEBSITE_ACTION_DATA: '行为人群',
  ANALYSIS: '行业洞察人群',
  AI_R0: 'AI智选',
};

const FRONT_STATUS_LABEL: Record<string, string> = {
  ONLINE: '在线',
  OFFLINE: '不在线',
  LOADING: '上线中',
  NEW: '计算中',
  PROCESSING: '计算中',
  ACTIVE: '可用',
  FAIL: '计算失败',
  FREEZE: '冻结',
  THAWING: '冻结',
  EXPIRED: '已过期',
};

const FRONT_STATUS_COLOR: Record<string, string> = {
  ONLINE: '#07C160',
  OFFLINE: '#898B8F',
  LOADING: '#4792F6',
  NEW: '#4792F6',
  PROCESSING: '#4792F6',
  ACTIVE: '#07C160',
  FAIL: '#E63D2E',
  FREEZE: '#898B8F',
  THAWING: '#898B8F',
  EXPIRED: '#898B8F',
};

// ─── 工具函数 ───
function formatTime(ms: number) {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatNumber(n: number) {
  if (n < 0) return '-';
  return n.toLocaleString('en-US');
}

// ─── 状态单元格 ───
function StatusCell({ row }: { row: AudienceRow }) {
  const main = FRONT_STATUS_LABEL[row.frontStatus] ?? row.frontStatus;
  const color = FRONT_STATUS_COLOR[row.frontStatus] ?? '#898B8F';
  const isOnline = row.frontStatus === 'ONLINE';
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block size-1.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm">{main}</span>
        {isOnline && (
          <>
            <span className="text-black-7 text-sm">|</span>
            <span className="text-blue-6 text-sm cursor-pointer">续期</span>
          </>
        )}
      </div>
      {isOnline && row.remainingDays > 0 && (
        <span className="text-xs text-black-9">
          {row.remainingDays}天后过期
        </span>
      )}
    </div>
  );
}

// ─── 人群名称单元格：带 pencil 图标（编辑） ───
function NameCell({ row }: { row: AudienceRow }) {
  return (
    <div className="flex items-center gap-1.5 group">
      <span className="text-sm text-black-12 truncate" title={row.name}>
        {row.name}
      </span>
      {row.subType !== 'AI_R0' && (
        <Icon
          name="edit"
          size={14}
          className="text-black-9 opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
        />
      )}
    </div>
  );
}

// ─── 操作单元格：根据所有者决定直接按钮 ───
function OperationCell({ row }: { row: AudienceRow }) {
  const canUse = row.frontStatus === 'ONLINE' && !row.locked;
  const linkClass = 'text-sm cursor-pointer whitespace-nowrap';
  const active = 'text-blue-6 hover:text-blue-7';
  const disabled = 'text-black-6 cursor-not-allowed';
  return (
    <div className="flex items-center gap-3">
      <span className={`${linkClass} ${canUse ? active : disabled}`}>授权</span>
      <span className={`${linkClass} ${canUse ? active : disabled}`}>拓展</span>
      <span className={`${linkClass} ${canUse ? active : disabled}`}>分级</span>
      <Dropdown
        menu={[
          { label: '人群详情', value: 'detail' },
          { label: '授权记录', value: 'auth-log' },
          { label: '复制', value: 'copy' },
          { label: '更新记录', value: 'update-log' },
          { label: '删除', value: 'delete' },
        ]}
      >
        <Icon
          name="more"
          size={16}
          className="text-black-9 cursor-pointer"
        />
      </Dropdown>
    </div>
  );
}

// ─── 主页面 ───
const CustomAudienceListPage = () => {
  const [activeNav, setActiveNav] = useState('人群策略');
  const [activeMenu, setActiveMenu] = useState('list');

  const [tab, setTab] = useState<'my' | 'toBeAdded'>('my');
  const [rows] = useState<AudienceRow[]>(
    customAudienceListFixture as AudienceRow[],
  );

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [ownerFilter, setOwnerFilter] = useState('ALL');
  const [keyword, setKeyword] = useState('');
  const [showFilter, setShowFilter] = useState(true);
  const [autoAccept, setAutoAccept] = useState(true);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<TableSortOrder>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const allRows = rows ?? [];

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return allRows
      .filter((r) => {
        if (statusFilter !== 'ALL') {
          const statusValues = statusFilter.split(',');
          if (!statusValues.includes(r.frontStatus)) return false;
        }
        if (typeFilter !== 'ALL') {
          const typeValues = typeFilter.split(',');
          if (!typeValues.includes(r.subType)) return false;
        }
        if (ownerFilter !== 'ALL') {
          const isOwn = ownerFilter === 'TRUE';
          if (r.owner !== isOwn) return false;
        }
        if (kw) {
          const hay = `${r.name} ${r.id}`.toLowerCase();
          if (!hay.includes(kw)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (!sortOrder) return 0;
        return sortOrder === 'ascend'
          ? a.userNumber - b.userNumber
          : b.userNumber - a.userNumber;
      });
  }, [allRows, statusFilter, typeFilter, ownerFilter, keyword, sortOrder]);

  // mock 接口的总数：前端用 Math.max 兜底到 11247（真实线上数）
  const totalSize = Math.max(filtered.length, 11247);
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns: TableProps<AudienceRow>['columns'] = [
    {
      title: '人群ID',
      dataIndex: 'id',
      key: 'id',
      render: ({ row }) => (
        <span className="tabular-nums text-sm">{row.id}</span>
      ),
    },
    {
      title: '人群名称',
      dataIndex: 'name',
      key: 'name',
      render: ({ row }) => <NameCell row={row} />,
    },
    {
      title: '类型',
      dataIndex: 'subType',
      key: 'subType',
      render: ({ row }) => SUB_TYPE_LABEL[row.subType] ?? '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: ({ row }) => <StatusCell row={row} />,
    },
    {
      title: '人群规模',
      dataIndex: 'userNumber',
      key: 'userNumber',
      align: 'right',
      sortOrder,
      onSort: (order) => setSortOrder(order),
      render: ({ row }) => {
        const v =
          row.status === 'FAIL' ||
          row.status === 'PROCESSING' ||
          row.status === 'NEW' ||
          row.userNumber === -1 ||
          row.subType === 'OTT'
            ? '-'
            : formatNumber(row.userNumber);
        return <span className="tabular-nums">{v}</span>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
      render: ({ row }) => (
        <span className="tabular-nums text-sm">{formatTime(row.createdTime)}</span>
      ),
    },
    {
      title: '是否支持竞价投放',
      dataIndex: 'source',
      key: 'source',
      render: ({ row }) =>
        row.source === 'ADVERTISER_OWN_DATA' ? '是' : '否',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: ({ row }) => <OperationCell row={row} />,
    },
  ];

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
      accountName="香奈儿/Chanel - 美妆护肤"
      accountId="25610"
    >
      <Card className="rounded-xl" elevation={0}>
        {/* 顶部 Tab */}
        <div className="px-6 pt-4 border-b border-black-4">
          <Tabs.Default
            items={[
              { value: 'my', label: '我的人群' },
              { value: 'toBeAdded', label: '待接收人群' },
            ]}
            value={tab}
            onChange={(_, v) => setTab(v as 'my' | 'toBeAdded')}
            gap={28}
            itemClassName="text-sm font-normal pb-3"
          />
        </div>

        {/* 工具栏 */}
        <div className="px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Button intent="primary" icon="import">
              上传人群
            </Button>
            <Button intent="primary" icon="user-pack">
              新建AI智选人群
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Input
              leftElement={<Icon name="search" />}
              placeholder="搜索人群名称/ID"
              value={keyword}
              onChange={(_, value) => {
                setKeyword(value);
                setPage(1);
              }}
              className="w-60"
            />
            <Button
              light
              icon="filter"
              onClick={() => setShowFilter((v) => !v)}
              className={
                showFilter ? 'text-[var(--odn-color-primary)]' : undefined
              }
            >
              筛选
            </Button>
            <Button light icon="code">
              批量操作
            </Button>
          </div>
        </div>

        {/* 筛选条 */}
        {showFilter && (
          <div className="px-6 pb-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Icon name="filter" size={14} className="text-black-10" />
              <Select
                value={statusFilter}
                options={STATUS_OPTIONS}
                prefix={<span className="text-black-9">状态：</span>}
                className="min-w-[160px]"
                onChange={(v) => {
                  setStatusFilter(String(v ?? 'ALL'));
                  setPage(1);
                }}
              />
              <Select
                value={typeFilter}
                options={TYPE_OPTIONS}
                prefix={<span className="text-black-9">类型：</span>}
                className="min-w-[180px]"
                onChange={(v) => {
                  setTypeFilter(String(v ?? 'ALL'));
                  setPage(1);
                }}
              />
              <Select
                value={ownerFilter}
                options={OWNER_OPTIONS}
                prefix={<span className="text-black-9">人群创建方式：</span>}
                className="min-w-[200px]"
                onChange={(v) => {
                  setOwnerFilter(String(v ?? 'ALL'));
                  setPage(1);
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Tooltip popup="自动接收被授权的人群，开启后无需手动确认">
                <span className="text-sm text-black-10 border-b border-dashed border-black-6">
                  自动接收授权
                </span>
              </Tooltip>
              <Switch checked={autoAccept} onChange={setAutoAccept} />
            </div>
          </div>
        )}

        {/* 表格 */}
        <div className="px-6">
          <Table<AudienceRow & { key: string }>
            dataSource={pageRows.map((r) => ({ ...r, key: String(r.id) }))}
            columns={columns as TableProps<AudienceRow & { key: string }>['columns']}
            rowHoverable
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selectedKeys,
              onChange: (keys) => setSelectedKeys(keys),
            }}
          />
        </div>

        {/* 分页 */}
        <div className="flex justify-end px-6 py-4">
          <Pagination
            showTotal
            showSizeChanger
            showQuickJumper
            value={page}
            totalSize={totalSize}
            pageSize={pageSize}
            onChange={(_, p) => setPage(p)}
            onPageSizeChange={(newPageSize) => {
              setPageSize(newPageSize);
              setPage(1);
            }}
          />
        </div>
      </Card>
    </RuyiLayout>
  );
};

export default CustomAudienceListPage;
