'use client';

import {
  Button,
  Card,
  Icon,
  Input,
  Pagination,
  RuyiLayout,
  Select,
  Table,
  type RuyiMenuItem,
  type TableProps,
  type TableSortOrder,
} from 'one-design-next';
import React, { useMemo, useState } from 'react';
import { NotificationPopoverTrigger } from '../blocks/_internal/notification-popover-trigger';

const NAV_ITEMS = ['首页', '洞察诊断', '人群策略', '策略应用', '全域度量', '生意'];

// 人群策略菜单（本文件独立维护，不与其他 workshop 页面共享）
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

// 菜单 key → workshop 页面 slug（相对当前页面跳转：本地开发跳本地、发布环境跳发布）
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

// ─── 表格数据（对齐截图） ───
type CrowdStatus = 'pushed' | 'computed';

type CrowdRow = {
  key: string;
  name: string;
  target: string;
  status: CrowdStatus;
  size: number; // 万
  createdAt: string;
  pushDisabled?: boolean;
  deleteDisabled?: boolean;
};

const ROWS: CrowdRow[] = [
  {
    key: '1',
    name: '海蓝之谜面霜人群包策略_扩量人群',
    target: '海蓝之谜面霜',
    status: 'pushed',
    size: 6290,
    createdAt: '2026-04-07 14:40:23',
  },
  {
    key: '2',
    name: '海蓝之谜面霜人群包策略_平衡人群',
    target: '海蓝之谜面霜',
    status: 'computed',
    size: 4193,
    createdAt: '2026-04-07 14:40:23',
  },
  {
    key: '3',
    name: '海蓝之谜面霜人群包策略_精准人群',
    target: '海蓝之谜面霜',
    status: 'computed',
    size: 2097,
    createdAt: '2026-04-07 14:40:23',
  },
  {
    key: '4',
    name: '测试',
    target: '香奈儿蔚蓝珍藏男士香水',
    status: 'computed',
    size: 10000,
    createdAt: '2026-03-26 17:07:36',
  },
  {
    key: '5',
    name: '测试新人群',
    target: '香奈儿蔚蓝珍藏男士香水',
    status: 'computed',
    size: 100,
    createdAt: '2026-03-25 17:30:06',
  },
  {
    key: '6',
    name: '20260325xx',
    target: '香奈儿蔚蓝珍藏男士香水',
    status: 'computed',
    size: 1,
    createdAt: '2026-03-25 17:22:49',
  },
  {
    key: '7',
    name: '海蓝之谜面霜人群包推荐_扩量人群',
    target: '海蓝之谜面霜',
    status: 'computed',
    size: 9671,
    createdAt: '2026-03-13 20:34:52',
  },
  {
    key: '8',
    name: '海蓝之谜面霜人群包推荐_平衡人群',
    target: '海蓝之谜面霜',
    status: 'computed',
    size: 6448,
    createdAt: '2026-03-13 20:34:52',
  },
  {
    key: '9',
    name: '海蓝之谜面霜人群包推荐_精准人群',
    target: '海蓝之谜面霜',
    status: 'computed',
    size: 3224,
    createdAt: '2026-03-13 20:34:52',
  },
  {
    key: '10',
    name: 'Apple Watch S白领人群推广策略_扩量人群',
    target: 'iwatch s',
    status: 'pushed',
    size: 11870,
    createdAt: '2026-03-05 11:43:57',
    pushDisabled: true,
    deleteDisabled: true,
  },
  {
    key: '11',
    name: 'Apple Watch S白领人群推广策略_平衡人群',
    target: 'iwatch s',
    status: 'computed',
    size: 7913,
    createdAt: '2026-03-05 11:43:57',
  },
  {
    key: '12',
    name: 'Apple Watch S白领人群推广策略_精准人群',
    target: 'iwatch s',
    status: 'computed',
    size: 3957,
    createdAt: '2026-03-05 11:43:57',
  },
  {
    key: '13',
    name: '人群包推荐：爱吃馒头用户_扩量人群',
    target: '馒头',
    status: 'computed',
    size: 11360,
    createdAt: '2026-03-02 16:07:36',
  },
  {
    key: '14',
    name: '人群包推荐：爱吃馒头用户_平衡人群',
    target: '馒头',
    status: 'computed',
    size: 7573,
    createdAt: '2026-03-02 16:07:36',
  },
  {
    key: '15',
    name: '人群包推荐：爱吃馒头用户_精准人群',
    target: '馒头',
    status: 'computed',
    size: 3787,
    createdAt: '2026-03-02 16:07:36',
  },
  {
    key: '16',
    name: 'iWatch S11白领人群包推荐_扩量人群',
    target: 'iWatch S11',
    status: 'computed',
    size: 12358,
    createdAt: '2026-02-26 16:24:46',
  },
  {
    key: '17',
    name: 'iWatch S11白领人群包推荐_平衡人群',
    target: 'iWatch S11',
    status: 'computed',
    size: 8239,
    createdAt: '2026-02-26 16:24:45',
  },
  {
    key: '18',
    name: 'iWatch S11白领人群包推荐_精准人群',
    target: 'iWatch S11',
    status: 'computed',
    size: 4119,
    createdAt: '2026-02-26 16:24:45',
  },
  {
    key: '19',
    name: '母婴学步鞋人群推广策略_扩量人群',
    target: '泰兰尼斯稳稳鞋',
    status: 'pushed',
    size: 5780,
    createdAt: '2026-01-19 14:30:20',
    pushDisabled: true,
    deleteDisabled: true,
  },
  {
    key: '20',
    name: '母婴学步鞋人群推广策略_平衡人群',
    target: '泰兰尼斯稳稳鞋',
    status: 'pushed',
    size: 3854,
    createdAt: '2026-01-19 14:30:20',
  },
];

const STATUS_OPTIONS = [
  { label: '请选择', value: '' },
  { label: '推送成功', value: 'pushed' },
  { label: '计算成功', value: 'computed' },
];

const STATUS_LABEL: Record<CrowdStatus, string> = {
  pushed: '推送成功',
  computed: '计算成功',
};

function StatusDot({ status }: { status: CrowdStatus }) {
  // 两种状态都用绿色圆点，对齐截图
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block size-1.5 rounded-full bg-[#07C160]"
      />
      <span>{STATUS_LABEL[status]}</span>
    </span>
  );
}

function RowActions({ row }: { row: CrowdRow }) {
  const linkClass = 'text-sm cursor-pointer whitespace-nowrap';
  const active = 'text-blue-6 hover:text-blue-7';
  const disabled = 'text-black-6 cursor-not-allowed';
  return (
    <div className="flex items-center gap-4">
      <span className={`${linkClass} ${active}`}>详情</span>
      <span className={`${linkClass} ${active}`}>对比</span>
      <span className={`${linkClass} ${row.pushDisabled ? disabled : active}`}>
        一键推送
      </span>
      <span className={`${linkClass} ${active}`}>输入条件</span>
      <span
        className={`${linkClass} ${row.deleteDisabled ? disabled : active}`}
      >
        删除
      </span>
    </div>
  );
}

const AISmartCrowdPage = () => {
  const [activeNav, setActiveNav] = useState('人群策略');
  const [activeMenu, setActiveMenu] = useState('ai');
  const [statusFilter, setStatusFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [sortOrder, setSortOrder] = useState<TableSortOrder>('descend');
  const [createdSortOrder, setCreatedSortOrder] =
    useState<TableSortOrder>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return ROWS.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (kw && !`${r.name} ${r.target}`.toLowerCase().includes(kw))
        return false;
      return true;
    }).sort((a, b) => {
      if (sortOrder) {
        return sortOrder === 'ascend' ? a.size - b.size : b.size - a.size;
      }
      if (createdSortOrder) {
        const ta = new Date(a.createdAt.replace(' ', 'T')).getTime();
        const tb = new Date(b.createdAt.replace(' ', 'T')).getTime();
        return createdSortOrder === 'ascend' ? ta - tb : tb - ta;
      }
      return 0;
    });
  }, [statusFilter, keyword, sortOrder, createdSortOrder]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns: TableProps<CrowdRow>['columns'] = [
    { title: '人群名称', dataIndex: 'name', key: 'name' },
    { title: '商品/营销节点', dataIndex: 'target', key: 'target' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: ({ row }) => <StatusDot status={row.status} />,
    },
    {
      title: '人群规模(万)',
      dataIndex: 'size',
      key: 'size',
      align: 'right',
      sortOrder,
      onSort: (order) => {
        setSortOrder(order);
        setCreatedSortOrder(null);
      },
      render: ({ row }) => (
        <span className="tabular-nums">{row.size.toLocaleString()}</span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sortOrder: createdSortOrder,
      onSort: (order) => {
        setCreatedSortOrder(order);
        setSortOrder(null);
      },
      render: ({ row }) => (
        <span className="tabular-nums">{row.createdAt}</span>
      ),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: ({ row }) => <RowActions row={row} />,
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
      headerRight={
        <>
          <div className="flex items-center gap-1.5 h-10 px-4 border border-black-6 rounded-full text-sm cursor-pointer">
            <Icon name="users" size={16} />
            <span className="text-black-11">人群夹</span>
            <span className="font-semibold tabular-nums">20</span>
          </div>
          <NotificationPopoverTrigger
            initialVisible={false}
            stickyUntilCollapsed={false}
          />
          <Button light icon="help-circle" />
          <Button light icon="setting" />
        </>
      }
    >
      <Card className="rounded-xl" elevation={0}>
        <div className="px-6 pt-6 pb-4 flex items-center justify-between gap-4">
          <span className="text-base font-semibold text-black-12">
            人群列表
          </span>
        </div>
        <div className="px-6 pb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button intent="primary">新建AI智选人群</Button>
            <Button
              intent="primary"
              icon="user-pack"
              style={{
                '--odn-button-primary-bg':
                  'linear-gradient(90deg, #4DA4EC 0%, #4792F6 100%)',
                '--odn-button-primary-border-color': 'transparent',
                '--odn-button-primary-bg-hover':
                  'linear-gradient(90deg, #5AB0F0 0%, #5A9EF8 100%)',
                '--odn-button-primary-border-color-hover': 'transparent',
                '--odn-button-primary-bg-active':
                  'linear-gradient(90deg, #4090D8 0%, #3E82DE 100%)',
                '--odn-button-primary-border-color-active': 'transparent',
              }}
            >
              新建智选人群
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={statusFilter}
              options={STATUS_OPTIONS}
              className="w-[200px]"
              prefix={<span className="text-black-9">计算状态</span>}
              onChange={(v) => {
                setStatusFilter(String(v ?? ''));
                setPage(1);
              }}
            />
            <Input
              leftElement={<Icon name="search" />}
              placeholder="搜索人群名称/商品/营销节点"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              className="w-[280px]"
            />
          </div>
        </div>
        <div className="px-6">
          <Table<CrowdRow>
            dataSource={pageRows}
            columns={columns}
            rowHoverable
          />
        </div>
        <div className="flex justify-end px-6 py-4">
          <Pagination
            showTotal
            showSizeChanger
            showQuickJumper
            value={page}
            totalSize={Math.max(filtered.length, 81)}
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

export default AISmartCrowdPage;
