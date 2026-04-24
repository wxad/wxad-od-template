'use client';

import {
  Button,
  Card,
  Icon,
  Input,
  Link,
  Pagination,
  RuyiLayout,
  Tabs,
  type RuyiMenuItem,
} from 'one-design-next';
import React, { useState } from 'react';
import { NotificationPopoverTrigger } from '../blocks/_internal/notification-popover-trigger';
import {
  CrowdPickCardGrid,
  type CrowdPickCard,
} from '../blocks/crowd-pick-card-grid';

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

const INDUSTRY_CARDS: CrowdCard[] = [
  {
    name: '萌娃家庭用车人群',
    desc: '对家庭场景用车感兴趣的人群',
    heat: 2,
    coverage: '6,952 万',
    r3Rate: '0.68%',
    penetration: '1.18%',
    frequency: '9,066',
    updatedAt: '2025-07-31',
  },
  {
    name: '电商大促人群',
    desc: '对电商促销有高度响应的人群',
    heat: 3,
    coverage: '11,152 万',
    r3Rate: '0.89%',
    penetration: '1.49%',
    frequency: '5,258',
    updatedAt: '2025-07-31',
  },
  {
    name: '居家烹饪爱好者',
    desc: '对烹饪食材有高意向的人群',
    heat: 1,
    coverage: '34,718 万',
    r3Rate: '1.02%',
    penetration: '1.15%',
    frequency: '525',
    updatedAt: '2025-10-13',
  },
  {
    name: '运动户外商品兴趣人群',
    desc: '对户外运动装备感兴趣的人群',
    heat: 2,
    coverage: '47,973 万',
    r3Rate: '0.77%',
    penetration: '0.94%',
    frequency: '2,753',
    updatedAt: '2025-07-31',
  },
];

const CROSS_INDUSTRY_CARDS: CrowdCard[] = [
  {
    name: '春运人群',
    desc: '春运期间有出行需求的人群',
    heat: 1,
    coverage: '63,193 万',
    r3Rate: '0.73%',
    penetration: '0.90%',
    frequency: '1,193',
    updatedAt: '2025-07-31',
  },
  {
    name: '豪华车潜客人群',
    desc: '对豪华车品牌有高度意向的人群',
    heat: 2,
    coverage: '37,552 万',
    r3Rate: '0.60%',
    penetration: '0.92%',
    frequency: '3,262',
    updatedAt: '2025-07-31',
  },
  {
    name: '汽车意向人群',
    desc: '对汽车产品有高意向的人群',
    heat: 2,
    coverage: '21,658 万',
    r3Rate: '0.77%',
    penetration: '1.26%',
    frequency: '4,221',
    updatedAt: '2025-07-31',
  },
  {
    name: '新能源先锋人群',
    desc: '对新能源汽车品牌有高度关注',
    heat: 3,
    coverage: '11,829 万',
    r3Rate: '0.63%',
    penetration: '1.06%',
    frequency: '4,146',
    updatedAt: '2025-07-31',
  },
  {
    name: '高端母婴消费人群',
    desc: '对高端母婴产品有消费偏好',
    heat: 2,
    coverage: '8,745 万',
    r3Rate: '1.35%',
    penetration: '1.82%',
    frequency: '1,567',
    updatedAt: '2025-09-20',
  },
  {
    name: '健身达人活跃群体',
    desc: '在健身运动领域高度活跃',
    heat: 1,
    coverage: '15,320 万',
    r3Rate: '0.91%',
    penetration: '0.78%',
    frequency: '932',
    updatedAt: '2025-11-05',
  },
  {
    name: '数码科技发烧友',
    desc: '对数码新品有强烈尝鲜意愿',
    heat: 3,
    coverage: '22,186 万',
    r3Rate: '1.56%',
    penetration: '2.01%',
    frequency: '6,783',
    updatedAt: '2025-08-18',
  },
  {
    name: '宠物生活爱好者',
    desc: '对宠物用品有持续消费习惯',
    heat: 2,
    coverage: '18,903 万',
    r3Rate: '0.82%',
    penetration: '1.33%',
    frequency: '2,109',
    updatedAt: '2026-02-10',
  },
];

const CROWD_CATEGORIES = [
  '全部行业',
  '手机通讯',
  '连锁餐饮',
  '运动户外',
  '美妆护肤',
  '母婴食品',
  'IT tob',
  '珠宝玉石钟表',
  '奢侈品',
  '潮流服饰',
  '宠物生活',
  '汽车',
  '景区乐园',
  '游戏',
  '家居',
  '大健康',
  '眼镜',
  '旅游局',
  '娱乐休闲',
  '大家电',
  '生活电器',
  '休闲食品',
  '食品原料调料',
  '乳制品',
  '电子教育',
  '办公设备',
  '酒类',
  '游轮',
  '汽车后市场',
];

const CROWD_LIST_ITEMS: CrowdCard[] = [
  {
    name: '眼镜产品兴趣人群',
    desc: '关注眼镜在视力矫正上的专业性与舒适性，也场...',
    heat: 1,
    coverage: '7,104 万',
    r3Rate: '0.91%',
    penetration: '1.08%',
    frequency: '0',
    updatedAt: '2026-01-30',
  },
  {
    name: '黄金饰品兴趣人群',
    desc: '关注黄金工艺，追求饰品兼具投资保值与日常搭...',
    heat: 2,
    coverage: '5,074 万',
    r3Rate: '4.90%',
    penetration: '3.35%',
    frequency: '0',
    updatedAt: '2026-01-15',
  },
  {
    name: '足球周边兴趣人群',
    desc: '对足球运动及足球俱乐部周边兴趣人群的人群',
    heat: 1,
    coverage: '3,422 万',
    r3Rate: '0.79%',
    penetration: '-',
    frequency: '1,315',
    updatedAt: '2025-11-28',
  },
  {
    name: '出境游旅客人群',
    desc: '对出境旅游有较强消费能力也经验丰富的人群',
    heat: 2,
    coverage: '3,127 万',
    r3Rate: '1.34%',
    penetration: '1.27%',
    frequency: '2,204',
    updatedAt: '2026-03-21',
  },
  {
    name: '滑雪兴趣人群',
    desc: '关注滑雪雪场关联动态，对滑雪运动感兴趣的人群',
    heat: 1,
    coverage: '1,258 万',
    r3Rate: '1.00%',
    penetration: '1.02%',
    frequency: '1,448',
    updatedAt: '2025-11-14',
  },
  {
    name: '时尚潮流人群',
    desc: '都市潮流文化引领关联流行服饰品牌穿搭好物...',
    heat: 2,
    coverage: '6,022 万',
    r3Rate: '1.29%',
    penetration: '1.38%',
    frequency: '429',
    updatedAt: '2025-09-10',
  },
  {
    name: '自驾游爱好者',
    desc: '热爱中长途自驾，注重出行自由且可自驾车辆搭...',
    heat: 1,
    coverage: '4,759 万',
    r3Rate: '0.64%',
    penetration: '-',
    frequency: '3,988',
    updatedAt: '2025-09-05',
  },
  {
    name: '西式快餐兴趣人群',
    desc: '西式快餐兴趣人群',
    heat: 1,
    coverage: '18,253 万',
    r3Rate: '-',
    penetration: '0.74%',
    frequency: '174',
    updatedAt: '2026-03-21',
  },
  {
    name: '耳机核心人群',
    desc: '中高端耳机、专业运动耳机、游戏耳机以及高端...',
    heat: 1,
    coverage: '3,031 万',
    r3Rate: '0.88%',
    penetration: '0.89%',
    frequency: '814',
    updatedAt: '2025-08-12',
  },
  {
    name: '游戏核玩家',
    desc: '对高互动性、信息投资类游戏（如MOBA、射击等...',
    heat: 2,
    coverage: '2,215 万',
    r3Rate: '0.73%',
    penetration: '0.86%',
    frequency: '634',
    updatedAt: '2025-07-31',
  },
  {
    name: '城市精英车主',
    desc: '对高端品牌汽车感兴趣及奢华生活方式相关需...',
    heat: 1,
    coverage: '1,717 万',
    r3Rate: '0.56%',
    penetration: '0.71%',
    frequency: '2,426',
    updatedAt: '2025-09-22',
  },
  {
    name: '马拉松参与人群',
    desc: '参与各类马拉松比赛，对马拉松运动具有高需情...',
    heat: 2,
    coverage: '1,364 万',
    r3Rate: '0.95%',
    penetration: '1.15%',
    frequency: '1,477',
    updatedAt: '2025-07-31',
  },
  {
    name: '孕期品质人群',
    desc: '关注母婴健康及孕期生活品质，对孕期面部补充...',
    heat: 1,
    coverage: '3,051 万',
    r3Rate: '-',
    penetration: '0.83%',
    frequency: '1,028',
    updatedAt: '2025-07-31',
  },
  {
    name: '网球核心人群',
    desc: '经常观网球、定期观看赛事，关注球星及动态、并经...',
    heat: 1,
    coverage: '2,640 万',
    r3Rate: '0.80%',
    penetration: '1.10%',
    frequency: '1,519',
    updatedAt: '2025-07-31',
  },
  {
    name: '网球泛兴趣人群',
    desc: '对网球有一定关注，偶尔观看比赛或参与网球运...',
    heat: 1,
    coverage: '4,424 万',
    r3Rate: '0.93%',
    penetration: '1.12%',
    frequency: '1,464',
    updatedAt: '2025-07-31',
  },
  {
    name: '美妆功效成分党',
    desc: '化妆品行业重点人群，对于化妆品成分和功效知...',
    heat: 2,
    coverage: '10,321 万',
    r3Rate: '1.01%',
    penetration: '1.16%',
    frequency: '1,483',
    updatedAt: '2025-07-31',
  },
  {
    name: '轻奢品牌爱好者',
    desc: '对轻奢品牌有较高关注度和消费意愿的人群',
    heat: 2,
    coverage: '8,926 万',
    r3Rate: '1.12%',
    penetration: '0.95%',
    frequency: '2,187',
    updatedAt: '2025-10-15',
  },
  {
    name: '户外露营人群',
    desc: '热爱户外露营活动，对露营装备有持续采购需求',
    heat: 1,
    coverage: '5,483 万',
    r3Rate: '0.76%',
    penetration: '0.88%',
    frequency: '956',
    updatedAt: '2025-12-08',
  },
  {
    name: '咖啡文化人群',
    desc: '对精品咖啡有浓厚兴趣，关注咖啡品牌与冲泡方...',
    heat: 2,
    coverage: '12,740 万',
    r3Rate: '1.23%',
    penetration: '1.45%',
    frequency: '3,215',
    updatedAt: '2026-01-20',
  },
  {
    name: '智能家居尝鲜者',
    desc: '对智能家居新品有强烈尝鲜意愿，关注 IoT 生态',
    heat: 3,
    coverage: '9,157 万',
    r3Rate: '1.48%',
    penetration: '1.67%',
    frequency: '4,832',
    updatedAt: '2026-02-14',
  },
];

function CrowdCardGrid({ cards }: { cards: CrowdCard[] }) {
  return <CrowdPickCardGrid cards={cards} />;
}

const RZeroCrowdPage = () => {
  const [activeNav, setActiveNav] = useState('人群策略');
  const [activeMenu, setActiveMenu] = useState('r-zero-crowd');
  const [activeTab, setActiveTab] = useState('industry');
  const [activeCrowdCategory, setActiveCrowdCategory] = useState('全部行业');
  const [crowdListPage, setCrowdListPage] = useState(1);

  const crowdCards =
    activeTab === 'industry' ? INDUSTRY_CARDS : CROSS_INDUSTRY_CARDS;

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
      accountName="东风奕派 - 汽车"
      accountId="25610"
      headerRight={
        <>
          <Button light icon="code" />
          <Button light icon="user-pack" />
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
          优选符合行业特性的人群，可在合约投放端选择为定向。
          <Link href="https://ruyi.qq.com/">如何选为定向</Link>
        </div>
        <Card className="px-6 pb-6 rounded-xl" elevation={0}>
          <div className="pt-4">
            <Tabs.Default
              items={[
                { value: 'industry', label: '行业热门' },
                { value: 'cross-industry', label: '跨行推荐' },
              ]}
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              gap={28}
              itemClassName="text-base font-normal pb-5"
              activeItemStyle={{
                fontWeight: 600,
                color: 'var(--odn-color-black-12)',
              }}
              indicatorStyle={{ display: 'none' }}
            />
          </div>
          <CrowdCardGrid cards={crowdCards} />
        </Card>
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
                />
                <div className="flex items-center">
                  <Button light icon="menu" />
                  <Button light icon="card-distribute" />
                </div>
              </div>
            }
          />
          <div className="px-6 pb-6 space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {CROWD_CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  light
                  size="small"
                  className={
                    activeCrowdCategory === cat
                      ? 'bg-blue-1 rounded-md'
                      : undefined
                  }
                  style={
                    activeCrowdCategory === cat
                      ? {
                          '--odn-button-normal-color-light':
                            'var(--odn-color-primary)',
                          fontWeight: 600,
                        }
                      : undefined
                  }
                  onClick={() => {
                    setActiveCrowdCategory(cat);
                    setCrowdListPage(1);
                  }}
                >
                  {cat}
                </Button>
              ))}
            </div>
            <CrowdCardGrid cards={CROWD_LIST_ITEMS} />
            <div className="flex justify-end pt-2">
              <Pagination
                showTotal
                showSizeChanger
                showQuickJumper
                value={crowdListPage}
                totalSize={123}
                pageSize={20}
                onChange={(_, page) => setCrowdListPage(page)}
              />
            </div>
          </div>
        </Card>
      </div>
    </RuyiLayout>
  );
};

export default RZeroCrowdPage;
