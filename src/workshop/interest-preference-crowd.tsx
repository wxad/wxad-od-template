'use client';

import {
  Button,
  Card,
  Icon,
  Input,
  Link,
  Pagination,
  RuyiLayout,
  type RuyiMenuItem,
} from 'one-design-next';
import React, { useMemo, useState } from 'react';
import { NotificationPopoverTrigger } from '../../../../components/popover/demo/notification-popover-trigger';
import {
  CrowdPickCardGrid,
  type CrowdPickCard,
} from '../../../../skills/p2-block-catalog/references/crowd-pick-card-grid';

const NAV_ITEMS = ['首页', '洞察诊断', '人群策略', '策略应用', '全域度量'];

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

type CrowdCard = CrowdPickCard;

// 第一页：视频系列 + 语言/风格音乐系列（对齐截图）
const CARDS_PAGE_1: CrowdCard[] = [
  {
    name: '视频青年潮流爱好者',
    desc: '对视频高品质及潮流内容有兴趣的年轻人群',
    heat: 1,
    coverage: '-',
    r3Rate: '3.35%',
    penetration: '17.78%',
    frequency: '320',
    updatedAt: '2026-02-27',
  },
  {
    name: '视频新晋爱好者',
    desc: '腾讯视频新兴深度用户，对视频高品质内容有强烈兴趣',
    heat: 1,
    coverage: '-',
    r3Rate: '3.92%',
    penetration: '16.26%',
    frequency: '320',
    updatedAt: '2026-02-27',
  },
  {
    name: '视频深度爱好者',
    desc: '腾讯视频高粘性用户，长期对视频品质内容有稳定兴趣',
    heat: 1,
    coverage: '-',
    r3Rate: '4.08%',
    penetration: '17.51%',
    frequency: '320',
    updatedAt: '2026-02-27',
  },
  {
    name: '视频家庭场景品质观影者',
    desc: '对大屏家庭场景有高品质观影需求的人群',
    heat: 1,
    coverage: '-',
    r3Rate: '4.24%',
    penetration: '16.33%',
    frequency: '320',
    updatedAt: '2026-02-27',
  },
  {
    name: '俄语歌曲爱好',
    desc: '对俄语演唱的音乐有需求或兴趣的人群',
    heat: 1,
    coverage: '630 万',
    r3Rate: '2.89%',
    penetration: '10.83%',
    frequency: '338',
    updatedAt: '2025-07-31',
  },
  {
    name: '闽南语歌曲爱好',
    desc: '对闽南语演唱的音乐有需求或兴趣的人群',
    heat: 1,
    coverage: '1,797 万',
    r3Rate: '3.15%',
    penetration: '9.53%',
    frequency: '347',
    updatedAt: '2025-07-31',
  },
  {
    name: '韩语歌曲爱好',
    desc: '对韩语演唱的音乐有需求或兴趣的人群',
    heat: 1,
    coverage: '6,131 万',
    r3Rate: '3.68%',
    penetration: '16.93%',
    frequency: '340',
    updatedAt: '2025-07-31',
  },
  {
    name: '日语歌曲爱好',
    desc: '对日语演唱的音乐有需求或兴趣的人群',
    heat: 1,
    coverage: '4,185 万',
    r3Rate: '3.62%',
    penetration: '13.94%',
    frequency: '358',
    updatedAt: '2025-07-31',
  },
  {
    name: '纯音乐欣赏者',
    desc: '偏好无歌词的纯器乐演奏的音乐爱好者',
    heat: 1,
    coverage: '10,096 万',
    r3Rate: '3.43%',
    penetration: '11.44%',
    frequency: '365',
    updatedAt: '2025-07-31',
  },
  {
    name: '粤语歌曲爱好',
    desc: '对粤语演唱的音乐有需求或兴趣的人群',
    heat: 1,
    coverage: '10,720 万',
    r3Rate: '3.43%',
    penetration: '12.33%',
    frequency: '433',
    updatedAt: '2025-07-31',
  },
  {
    name: '爵士与蓝调乐迷',
    desc: '热衷即兴演奏及情感丰富的爵士蓝调人群',
    heat: 1,
    coverage: '333 万',
    r3Rate: '4.11%',
    penetration: '11.75%',
    frequency: '356',
    updatedAt: '2025-07-31',
  },
  {
    name: '儿童歌曲爱好者',
    desc: '针对儿童成长教育或娱乐需求的音乐受众',
    heat: 1,
    coverage: '768 万',
    r3Rate: '3.51%',
    penetration: '15.11%',
    frequency: '1 万',
    updatedAt: '2025-07-31',
  },
  {
    name: '国风音乐爱好者',
    desc: '喜欢融合中国传统元素的现代风格音乐人群',
    heat: 1,
    coverage: '1,369 万',
    r3Rate: '3.09%',
    penetration: '6.05%',
    frequency: '390',
    updatedAt: '2025-07-31',
  },
  {
    name: '古典音乐爱好者',
    desc: '欣赏古典艺术价值及复杂编曲的音乐爱好者',
    heat: 1,
    coverage: '347 万',
    r3Rate: '4.42%',
    penetration: '14.20%',
    frequency: '872',
    updatedAt: '2025-07-31',
  },
  {
    name: '轻音乐爱好者',
    desc: '倾向于舒缓放松的纯音乐或器乐作品人群',
    heat: 1,
    coverage: '1,997 万',
    r3Rate: '3.75%',
    penetration: '10.03%',
    frequency: '379',
    updatedAt: '2025-07-31',
  },
  {
    name: '民谣歌曲爱好',
    desc: '偏爱叙事性强、贴近生活的民谣风格人群',
    heat: 1,
    coverage: '3,359 万',
    r3Rate: '3.26%',
    penetration: '10.89%',
    frequency: '366',
    updatedAt: '2025-07-31',
  },
  {
    name: '嘻哈音乐爱好者',
    desc: '对说唱文化及街头风格音乐感兴趣的人群',
    heat: 1,
    coverage: '5,731 万',
    r3Rate: '3.49%',
    penetration: '14.64%',
    frequency: '375',
    updatedAt: '2025-07-31',
  },
  {
    name: '节奏布鲁斯爱好者',
    desc: '喜欢节奏感强且带有情感表达的R&B音乐人群',
    heat: 1,
    coverage: '4,836 万',
    r3Rate: '3.67%',
    penetration: '15.63%',
    frequency: '359',
    updatedAt: '2025-07-31',
  },
  {
    name: '摇滚音乐爱好者',
    desc: '热衷于强烈节奏和情感表达的摇滚风格人群',
    heat: 1,
    coverage: '8,691 万',
    r3Rate: '3.32%',
    penetration: '12.84%',
    frequency: '427',
    updatedAt: '2025-07-31',
  },
  {
    name: '电子音乐爱好者',
    desc: '偏好节奏感强、及现代感强的电子风格音乐人群',
    heat: 1,
    coverage: '9,197 万',
    r3Rate: '3.28%',
    penetration: '11.63%',
    frequency: '421',
    updatedAt: '2025-07-31',
  },
];

// 第二页：一条，仅为演示分页存在
const CARDS_PAGE_2: CrowdCard[] = [
  {
    name: '动漫主题曲爱好者',
    desc: '对动漫主题曲及二次元衍生音乐感兴趣的人群',
    heat: 1,
    coverage: '2,314 万',
    r3Rate: '3.41%',
    penetration: '13.28%',
    frequency: '402',
    updatedAt: '2025-07-31',
  },
];

function InterestCrowdCardGrid({ cards }: { cards: CrowdCard[] }) {
  return <CrowdPickCardGrid cards={cards} />;
}

const InterestPreferenceCrowdPage = () => {
  const [activeNav, setActiveNav] = useState('人群策略');
  const [activeMenu, setActiveMenu] = useState('interest');
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');

  const allCards = useMemo(() => [...CARDS_PAGE_1, ...CARDS_PAGE_2], []);
  const filtered = useMemo(
    () =>
      keyword.trim()
        ? allCards.filter((c) =>
            c.name.toLowerCase().includes(keyword.trim().toLowerCase()),
          )
        : allCards,
    [allCards, keyword],
  );

  const pageSize = 20;
  const pageCards = filtered.slice((page - 1) * pageSize, page * pageSize);

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
      <div className="space-y-4">
        <div className="text-black-10 pl-1 text-sm">
          精选特定兴趣偏好的人群，可在合约投放端选择为定向。
          <Link href="https://ruyi.qq.com/">如何选为定向</Link>
        </div>
        <Card>
          <Card.Header
            title="人群列表"
            style={
              { '--odn-card-title-font-size': '16px' } as React.CSSProperties
            }
            topContent={
              <div className="flex items-center gap-3">
                <Input
                  leftElement={<Icon name="search" />}
                  placeholder="搜索人群名称"
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setPage(1);
                  }}
                />
                <div className="flex items-center">
                  <Button light icon="menu" />
                  <Button light icon="card-distribute" />
                </div>
              </div>
            }
          />
          <div className="px-6 pb-6 space-y-4">
            <InterestCrowdCardGrid cards={pageCards} />
            <div className="flex justify-end pt-2">
              <Pagination
                showTotal
                showSizeChanger
                showQuickJumper
                value={page}
                totalSize={Math.max(filtered.length, 81)}
                pageSize={pageSize}
                onChange={(_, p) => setPage(p)}
              />
            </div>
          </div>
        </Card>
      </div>
    </RuyiLayout>
  );
};

export default InterestPreferenceCrowdPage;
