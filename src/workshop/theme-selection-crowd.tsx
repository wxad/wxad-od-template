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

// 第一页：20 条（对齐截图）
const CARDS_PAGE_1: CrowdCard[] = [
  {
    name: '车展-智能科技族',
    desc: '关注前沿科技动态、追求智能出行生活方式的年轻群体',
    heat: 1,
    coverage: '7,231 万',
    r3Rate: '3.56%',
    penetration: '9.38%',
    frequency: '374',
    updatedAt: '2026-04-17',
  },
  {
    name: '车展-家庭乐享派',
    desc: '围绕亲子出行需求做购车决策的家庭消费人群',
    heat: 1,
    coverage: '9,601 万',
    r3Rate: '3.67%',
    penetration: '10.23%',
    frequency: '374',
    updatedAt: '2026-04-18',
  },
  {
    name: '车展-文娱社交族',
    desc: '热爱潮流时尚追求热点，喜欢悠闲体验的车展泛关注人群',
    heat: 1,
    coverage: '13,743 万',
    r3Rate: '3.92%',
    penetration: '11.47%',
    frequency: '374',
    updatedAt: '2026-03-24',
  },
  {
    name: '都市新锐型女性',
    desc: '关注职业规划、技能提升与情感探索的都市女性，偏好...',
    heat: 1,
    coverage: '7,147 万',
    r3Rate: '4.74%',
    penetration: '23.07%',
    frequency: '1,762',
    updatedAt: '2026-02-09',
  },
  {
    name: '高阶成熟型女性',
    desc: '关注商业财经、行业深度内容与高端生活方式的成熟女...',
    heat: 1,
    coverage: '2,519 万',
    r3Rate: '6.79%',
    penetration: '27.49%',
    frequency: '1,720',
    updatedAt: '2026-02-09',
  },
  {
    name: '雅致生活型女性',
    desc: '关注养生健康、传统文化、慢生活内容的女性，青睐高...',
    heat: 1,
    coverage: '3,723 万',
    r3Rate: '4.86%',
    penetration: '19.44%',
    frequency: '1,721',
    updatedAt: '2026-02-09',
  },
  {
    name: '悦己生活党',
    desc: '在圣诞期间享受圣诞氛围感且有较高的生活品质的年轻...',
    heat: 1,
    coverage: '3,795 万',
    r3Rate: '4.84%',
    penetration: '14.77%',
    frequency: '547',
    updatedAt: '2025-11-20',
  },
  {
    name: '浪漫奢享家',
    desc: '在圣诞期间有送礼需求的高消费人群',
    heat: 1,
    coverage: '4,835 万',
    r3Rate: '5.31%',
    penetration: '26.47%',
    frequency: '891',
    updatedAt: '2025-11-20',
  },
  {
    name: '团圆家宴人群',
    desc: '在节日期间（如春节/元宵节/中秋节等），喜欢家庭聚...',
    heat: 1,
    coverage: '4,417 万',
    r3Rate: '4.26%',
    penetration: '12.02%',
    frequency: '541',
    updatedAt: '2025-11-20',
  },
  {
    name: '年俗非遗爱好者',
    desc: '对中国传统文化、过年习俗、非遗感兴趣的人群。如喜...',
    heat: 1,
    coverage: '4,874 万',
    r3Rate: '4.29%',
    penetration: '12.85%',
    frequency: '1,349',
    updatedAt: '2025-11-20',
  },
  {
    name: '节日休闲娱乐族',
    desc: '在节假日喜欢休闲放松类的活动，如看节日晚会、玩桌...',
    heat: 1,
    coverage: '17,746 万',
    r3Rate: '2.96%',
    penetration: '7.26%',
    frequency: '902',
    updatedAt: '2025-11-20',
  },
  {
    name: '阖家甄选族',
    desc: '在圣诞期间有购买礼物需求、有国际美妆品牌、国际玩...',
    heat: 1,
    coverage: '4,904 万',
    r3Rate: '5.36%',
    penetration: '18.15%',
    frequency: '497',
    updatedAt: '2025-11-20',
  },
  {
    name: '乐享玩聚派',
    desc: '在圣诞期间有购买礼物需求且偏好具有品价比的一二线...',
    heat: 1,
    coverage: '5,080 万',
    r3Rate: '4.80%',
    penetration: '20.15%',
    frequency: '781',
    updatedAt: '2025-11-20',
  },
  {
    name: '车展泛兴趣人群',
    desc: '持续关注车展动态与汽车市场信息，并具有潜在购车意...',
    heat: 1,
    coverage: '6,457 万',
    r3Rate: '3.55%',
    penetration: '6.72%',
    frequency: '523',
    updatedAt: '2025-11-17',
  },
  {
    name: '车展-商乘全能尊享族',
    desc: '关注高端成熟商务出行人群，多追求舒适豪华，对汽车...',
    heat: 1,
    coverage: '1,998 万',
    r3Rate: '3.98%',
    penetration: '9.90%',
    frequency: '521',
    updatedAt: '2025-11-04',
  },
  {
    name: '车展-年终高潜购车族',
    desc: '潜在理性购车人群，追求最佳购车方案和时机',
    heat: 1,
    coverage: '4,213 万',
    r3Rate: '2.54%',
    penetration: '8.14%',
    frequency: '517',
    updatedAt: '2025-11-04',
  },
  {
    name: '车展-广府文化享乐族',
    desc: '粤港本地文化偏好者，本地化的兴趣人群',
    heat: 1,
    coverage: '1,996 万',
    r3Rate: '3.33%',
    penetration: '10.44%',
    frequency: '506',
    updatedAt: '2026-01-09',
  },
  {
    name: '冰雪游爱好者',
    desc: '喜欢在冬季探寻冰雪景观的旅行者',
    heat: 1,
    coverage: '2,787 万',
    r3Rate: '4.28%',
    penetration: '16.61%',
    frequency: '606',
    updatedAt: '2025-10-31',
  },
  {
    name: '冬日滋补人群',
    desc: '注重提升气色与体质调理，对便捷即食的高品质滋补品...',
    heat: 1,
    coverage: '4,079 万',
    r3Rate: '4.10%',
    penetration: '18.32%',
    frequency: '512',
    updatedAt: '2025-10-28',
  },
  {
    name: '健康养生人群',
    desc: '关注日常健康管理与疾病预防，注重健康养生的人群。...',
    heat: 1,
    coverage: '3,101 万',
    r3Rate: '5.18%',
    penetration: '6.86%',
    frequency: '512',
    updatedAt: '2025-10-28',
  },
];

// 第二页：部分占位，演示分页
const CARDS_PAGE_2: CrowdCard[] = [
  {
    name: '春节年货节人群',
    desc: '春节期间年货采购高活跃人群',
    heat: 1,
    coverage: '6,512 万',
    r3Rate: '4.15%',
    penetration: '12.84%',
    frequency: '613',
    updatedAt: '2025-11-20',
  },
  {
    name: '国潮文化人群',
    desc: '对国潮品牌与中式美学有强烈认同感的年轻消费者',
    heat: 1,
    coverage: '8,214 万',
    r3Rate: '4.02%',
    penetration: '13.55%',
    frequency: '487',
    updatedAt: '2025-10-15',
  },
  {
    name: '夏日消暑人群',
    desc: '夏季注重清凉消暑与冷饮消费的人群',
    heat: 1,
    coverage: '9,136 万',
    r3Rate: '3.71%',
    penetration: '11.09%',
    frequency: '428',
    updatedAt: '2025-07-31',
  },
  {
    name: '520表白季人群',
    desc: '520节日前后有送礼与浪漫消费意愿的情侣群体',
    heat: 1,
    coverage: '5,478 万',
    r3Rate: '4.55%',
    penetration: '17.22%',
    frequency: '672',
    updatedAt: '2025-05-18',
  },
  {
    name: '母亲节礼赠人群',
    desc: '母亲节前后有赠礼需求的亲情消费人群',
    heat: 1,
    coverage: '4,902 万',
    r3Rate: '4.33%',
    penetration: '16.47%',
    frequency: '558',
    updatedAt: '2025-05-08',
  },
  {
    name: '开学季家庭人群',
    desc: '关注学龄期子女开学装备与学习用品的家庭消费群体',
    heat: 1,
    coverage: '6,721 万',
    r3Rate: '3.88%',
    penetration: '14.09%',
    frequency: '612',
    updatedAt: '2025-08-25',
  },
  {
    name: '双十一囤货达人',
    desc: '在双十一大促期间具有重度囤货行为的人群',
    heat: 1,
    coverage: '12,455 万',
    r3Rate: '3.54%',
    penetration: '13.21%',
    frequency: '3,812',
    updatedAt: '2025-11-12',
  },
  {
    name: '七夕情人节人群',
    desc: '七夕节期间追求浪漫消费与情感体验的情侣人群',
    heat: 1,
    coverage: '5,137 万',
    r3Rate: '4.67%',
    penetration: '18.63%',
    frequency: '705',
    updatedAt: '2025-08-11',
  },
  {
    name: '中秋团圆礼赠人群',
    desc: '中秋节前后有节礼消费与亲友团圆需求的人群',
    heat: 1,
    coverage: '7,803 万',
    r3Rate: '4.21%',
    penetration: '15.36%',
    frequency: '842',
    updatedAt: '2025-09-24',
  },
  {
    name: '跨年狂欢人群',
    desc: '跨年夜有聚会、旅行与休闲娱乐消费需求的年轻人群',
    heat: 1,
    coverage: '6,209 万',
    r3Rate: '3.92%',
    penetration: '14.72%',
    frequency: '516',
    updatedAt: '2025-12-28',
  },
  {
    name: '妇女节品质人群',
    desc: '38 妇女节期间关注自我悦己型商品的女性高消费群体',
    heat: 1,
    coverage: '5,632 万',
    r3Rate: '5.08%',
    penetration: '20.11%',
    frequency: '748',
    updatedAt: '2025-03-05',
  },
  {
    name: '五一假期出游人群',
    desc: '五一假期有短途与中长线出行意愿的旅游消费人群',
    heat: 1,
    coverage: '8,511 万',
    r3Rate: '4.11%',
    penetration: '16.04%',
    frequency: '927',
    updatedAt: '2025-04-28',
  },
  {
    name: '国庆出游人群',
    desc: '国庆长假期间具有高出行消费意愿的家庭与年轻群体',
    heat: 1,
    coverage: '11,043 万',
    r3Rate: '3.76%',
    penetration: '14.12%',
    frequency: '1,023',
    updatedAt: '2025-09-30',
  },
  {
    name: '年终奖消费人群',
    desc: '年终有较高可支配收入，关注品质升级型消费的人群',
    heat: 1,
    coverage: '4,521 万',
    r3Rate: '5.42%',
    penetration: '22.19%',
    frequency: '689',
    updatedAt: '2025-12-20',
  },
  {
    name: '亲子研学人群',
    desc: '关注亲子教育与研学旅行的中高端家庭消费人群',
    heat: 1,
    coverage: '3,906 万',
    r3Rate: '4.78%',
    penetration: '18.03%',
    frequency: '534',
    updatedAt: '2025-07-12',
  },
  {
    name: '露营野餐人群',
    desc: '周末喜欢户外露营与野餐的都市轻度户外人群',
    heat: 1,
    coverage: '5,273 万',
    r3Rate: '4.01%',
    penetration: '13.55%',
    frequency: '481',
    updatedAt: '2025-09-06',
  },
  {
    name: '温泉度假人群',
    desc: '秋冬季偏好温泉度假与养生旅行的中高端消费者',
    heat: 1,
    coverage: '2,817 万',
    r3Rate: '4.65%',
    penetration: '17.82%',
    frequency: '462',
    updatedAt: '2025-11-02',
  },
  {
    name: '新春礼盒人群',
    desc: '春节前后对礼盒装年货与节庆礼品有强烈消费意愿',
    heat: 1,
    coverage: '7,605 万',
    r3Rate: '4.34%',
    penetration: '15.92%',
    frequency: '892',
    updatedAt: '2026-01-18',
  },
  {
    name: '潮玩手办人群',
    desc: '关注潮流玩具、手办与盲盒的 Z 世代兴趣消费群体',
    heat: 1,
    coverage: '4,482 万',
    r3Rate: '4.93%',
    penetration: '17.45%',
    frequency: '612',
    updatedAt: '2025-08-20',
  },
  {
    name: '演唱会门票人群',
    desc: '对热门艺人演唱会与音乐节门票有强消费意愿的人群',
    heat: 1,
    coverage: '3,721 万',
    r3Rate: '5.05%',
    penetration: '19.77%',
    frequency: '588',
    updatedAt: '2025-09-18',
  },
];

// 第三页：11 条，使总量达到 51
const CARDS_PAGE_3: CrowdCard[] = [
  {
    name: '高考后释放人群',
    desc: '高考结束后的青年释放型消费人群',
    heat: 1,
    coverage: '2,015 万',
    r3Rate: '4.82%',
    penetration: '18.44%',
    frequency: '402',
    updatedAt: '2025-06-12',
  },
  {
    name: '暑期亲子游人群',
    desc: '暑假期间以亲子出游为核心的家庭消费人群',
    heat: 1,
    coverage: '6,320 万',
    r3Rate: '4.05%',
    penetration: '15.81%',
    frequency: '861',
    updatedAt: '2025-07-10',
  },
  {
    name: '校园返校季人群',
    desc: '大学生返校前后对数码与住宿用品有升级需求的人群',
    heat: 1,
    coverage: '3,812 万',
    r3Rate: '4.12%',
    penetration: '14.06%',
    frequency: '524',
    updatedAt: '2025-08-30',
  },
  {
    name: '国庆婚庆人群',
    desc: '国庆假期前后有婚礼筹备与婚品消费需求的人群',
    heat: 1,
    coverage: '1,452 万',
    r3Rate: '5.62%',
    penetration: '22.03%',
    frequency: '731',
    updatedAt: '2025-09-22',
  },
  {
    name: '情人节浪漫人群',
    desc: '2 月 14 日情人节期间有浪漫消费与送礼需求的人群',
    heat: 1,
    coverage: '4,207 万',
    r3Rate: '4.74%',
    penetration: '18.92%',
    frequency: '679',
    updatedAt: '2025-02-10',
  },
  {
    name: '父亲节礼赠人群',
    desc: '父亲节前后有赠礼需求的家庭消费人群',
    heat: 1,
    coverage: '3,891 万',
    r3Rate: '4.22%',
    penetration: '15.17%',
    frequency: '512',
    updatedAt: '2025-06-14',
  },
  {
    name: '重阳节敬老人群',
    desc: '重阳节前后关注老年健康与敬老礼赠的人群',
    heat: 1,
    coverage: '2,316 万',
    r3Rate: '4.51%',
    penetration: '16.38%',
    frequency: '398',
    updatedAt: '2025-10-08',
  },
  {
    name: '毕业季人群',
    desc: '毕业季前后有校园告别、聚餐与纪念品消费需求的人群',
    heat: 1,
    coverage: '1,983 万',
    r3Rate: '4.36%',
    penetration: '16.05%',
    frequency: '345',
    updatedAt: '2025-06-25',
  },
  {
    name: '618 大促人群',
    desc: '618 大促期间具有集中购物与消费决策意愿的人群',
    heat: 1,
    coverage: '10,215 万',
    r3Rate: '3.82%',
    penetration: '14.08%',
    frequency: '2,413',
    updatedAt: '2025-06-18',
  },
  {
    name: '万圣节派对人群',
    desc: '万圣节前后关注派对装饰与服饰消费的年轻群体',
    heat: 1,
    coverage: '2,905 万',
    r3Rate: '4.40%',
    penetration: '17.26%',
    frequency: '498',
    updatedAt: '2025-10-28',
  },
  {
    name: '圣诞温馨家庭人群',
    desc: '圣诞期间喜欢家庭式温馨节庆布置与礼赠的人群',
    heat: 1,
    coverage: '3,411 万',
    r3Rate: '4.81%',
    penetration: '19.08%',
    frequency: '562',
    updatedAt: '2025-12-15',
  },
];

function ThemeCrowdCardGrid({ cards }: { cards: CrowdCard[] }) {
  return <CrowdPickCardGrid cards={cards} />;
}

const ThemeSelectionCrowdPage = () => {
  const [activeNav, setActiveNav] = useState('人群策略');
  const [activeMenu, setActiveMenu] = useState('theme');
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');

  const allCards = useMemo(
    () => [...CARDS_PAGE_1, ...CARDS_PAGE_2, ...CARDS_PAGE_3],
    [],
  );
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
          甄选适合特定主题营销场景的人群，可在合约投放端选择为定向。
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
            <ThemeCrowdCardGrid cards={pageCards} />
            <div className="flex justify-end pt-2">
              <Pagination
                showTotal
                showSizeChanger
                showQuickJumper
                value={page}
                totalSize={filtered.length}
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

export default ThemeSelectionCrowdPage;
