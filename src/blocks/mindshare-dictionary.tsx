'use client';

import React from 'react';

// ─── 数据类型 ────────────────────────────────────────────────

interface KeywordItem {
  keyword: string;
  index: number;
}

interface WordCloudItem {
  text: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  x: number;
  y: number;
}

// ─── Mock 数据 ────────────────────────────────────────────────

const KEYWORD_DATA: KeywordItem[] = [
  { keyword: '科颜氏敏感肌可以用吗', index: 95 },
  { keyword: '科颜氏高保湿面霜敏感肌能用吗', index: 82 },
  { keyword: '达尔肤杏仁酸敏感肌能用吗', index: 42 },
  { keyword: '达尔肤抛光水敏感肌', index: 41 },
  { keyword: '科颜氏白泥膜敏感肌可以用吗', index: 38 },
  { keyword: '科颜氏白泥膜敏感肌可以用吗', index: 38 },
];

const MAX_INDEX = 95;
const BAR_MAX_WIDTH = 120;

const WORD_CLOUD_DATA: WordCloudItem[] = [
  // tier 1 — 核心词（40px semibold #296bef）
  { text: '人工智能', tier: 1, x: 38.8, y: 41.0 },

  // tier 2 — 大词（32px semibold #6997f4）
  { text: '金融证券', tier: 2, x: 21.0, y: 41.0 },
  { text: '云计算大数据', tier: 2, x: 36.3, y: 26.1 },
  { text: '成人英语', tier: 2, x: 54.9, y: 59.0 },

  // tier 3 — 中等词（24px regular #33d2cb）
  { text: '运动跟踪器', tier: 3, x: 17.8, y: 29.1 },
  { text: '少儿英语', tier: 3, x: 41.8, y: 14.2 },
  { text: '短视频', tier: 3, x: 64.8, y: 29.1 },
  { text: '境外游', tier: 3, x: 42.9, y: 59.0 },
  { text: '智能家居', tier: 3, x: 62.6, y: 41.0 },

  // tier 4 — 次要词（16px regular #fcb04c）
  { text: '火锅', tier: 4, x: 57.1, y: 17.2 },
  { text: '鲜花速递', tier: 4, x: 30.9, y: 17.2 },
  { text: '摄影写真', tier: 4, x: 63.7, y: 20.1 },
  { text: '金融', tier: 4, x: 39.1, y: 5.2 },
  { text: '葡萄酒', tier: 4, x: 34.2, y: 58.6 },
  { text: '休闲食品', tier: 4, x: 37.4, y: 70.9 },
  { text: '出国留学', tier: 4, x: 52.7, y: 73.9 },

  // tier 5 — 小标签（14px regular #8b8dfb）
  { text: '展会服务', tier: 5, x: 75.7, y: 32.8 },
  { text: '羽毛球', tier: 5, x: 32.2, y: 9.0 },
  { text: '广告商', tier: 5, x: 56.0, y: 9.0 },
  { text: '活动庆典', tier: 5, x: 22.1, y: 20.9 },
  { text: '财务财税', tier: 5, x: 61.5, y: 51.9 },
  { text: '极限运动', tier: 5, x: 63.7, y: 11.9 },
  { text: '公务员', tier: 5, x: 27.3, y: 56.0 },
  { text: '大数据', tier: 5, x: 45.6, y: 6.0 },
  { text: '策划服务', tier: 5, x: 73.5, y: 53.7 },

  // tier 6 — 散布词（12px regular black-8）
  { text: '海淘', tier: 6, x: 6.8, y: 0 },
  { text: '经济酒店', tier: 6, x: 12.3, y: 0 },
  { text: '美容护肤', tier: 6, x: 21.0, y: 0 },
  { text: '农资绿植', tier: 6, x: 32.2, y: 0 },
  { text: '生活电器', tier: 6, x: 40.6, y: 0 },
  { text: '望远镜', tier: 6, x: 48.8, y: 0 },
  { text: '普通住房', tier: 6, x: 54.5, y: 1.5 },
  { text: '奢侈品', tier: 6, x: 69.4, y: 0.4 },
  { text: '保健品', tier: 6, x: 80.9, y: 0.4 },

  { text: '别墅豪宅', tier: 6, x: 62.8, y: 4.5 },
  { text: '女装', tier: 6, x: 89.3, y: 4.1 },

  { text: '江浙菜', tier: 6, x: 75.1, y: 7.8 },
  { text: '便利店', tier: 6, x: 26.5, y: 8.2 },
  { text: '保姆', tier: 6, x: 21.0, y: 8.2 },

  { text: '麦克风', tier: 6, x: 13.1, y: 9.3 },
  { text: '帐篷', tier: 6, x: 81.7, y: 9.0 },
  { text: '医生', tier: 6, x: 7.8, y: 9.7 },

  { text: '篮球', tier: 6, x: 93.3, y: 11.6 },
  { text: '购物', tier: 6, x: 87.4, y: 11.2 },

  { text: '高中端酒店', tier: 6, x: 19.4, y: 14.9 },
  { text: '帐篷', tier: 6, x: 72.7, y: 16.4 },

  { text: '二手物品', tier: 6, x: 9.0, y: 17.5 },
  { text: '教师节', tier: 6, x: 77.7, y: 17.5 },

  { text: '打车拼车', tier: 6, x: 91.9, y: 21.6 },
  { text: '手写板', tier: 6, x: 86.2, y: 21.3 },

  { text: '跑步', tier: 6, x: 76.1, y: 25.4 },
  { text: '健身器械', tier: 6, x: 81.0, y: 26.9 },
  { text: '司法考试', tier: 6, x: 8.2, y: 26.9 },

  { text: '节能环保', tier: 6, x: 88.1, y: 30.2 },

  { text: '求职招聘', tier: 6, x: 8.5, y: 36.2 },

  { text: '移动互联网服务', tier: 6, x: 84.3, y: 38.4 },

  { text: '月嫂', tier: 6, x: 17.2, y: 41.4 },

  { text: '笔记本', tier: 6, x: 2.9, y: 44.0 },
  { text: '跑腿代办', tier: 6, x: 9.4, y: 45.9 },
  { text: '网站建设', tier: 6, x: 76.8, y: 45.1 },

  { text: '房产交易', tier: 6, x: 84.8, y: 47.4 },

  { text: '男装', tier: 6, x: 16.7, y: 49.3 },

  { text: '美颜相机', tier: 6, x: 91.9, y: 51.5 },

  { text: '建筑材料', tier: 6, x: 8.2, y: 55.2 },
  { text: '保洁', tier: 6, x: 23.2, y: 56.7 },
  { text: '耳机', tier: 6, x: 19.0, y: 56.7 },
  { text: '台式机', tier: 6, x: 82.4, y: 57.5 },
  { text: '照相机', tier: 6, x: 47.1, y: 71.6 },

  { text: '登山者', tier: 6, x: 89.5, y: 61.2 },

  { text: '畜牧生产', tier: 6, x: 13.4, y: 64.2 },
  { text: '教学设备', tier: 6, x: 6.0, y: 65.3 },
  { text: '路由器', tier: 6, x: 74.5, y: 65.3 },
  { text: '心理健康', tier: 6, x: 21.6, y: 65.3 },
  { text: '房屋搬迁', tier: 6, x: 29.0, y: 66.4 },

  { text: '服务器', tier: 6, x: 83.6, y: 67.5 },
  { text: '游泳', tier: 6, x: 80.1, y: 67.5 },

  { text: '办公用品', tier: 6, x: 82.1, y: 74.6 },
  { text: '商用房', tier: 6, x: 69.4, y: 74.6 },
  { text: '环保设备', tier: 6, x: 29.6, y: 74.6 },
  { text: '婚恋交友', tier: 6, x: 11.1, y: 75.0 },
  { text: '移民中介', tier: 6, x: 20.4, y: 73.9 },

  { text: '办公软件', tier: 6, x: 1.9, y: 76.1 },
  { text: '地图导航', tier: 6, x: 62.8, y: 76.1 },
  { text: '瑜伽', tier: 6, x: 76.1, y: 76.1 },

  { text: '视频', tier: 6, x: 11.9, y: 81.7 },
  { text: '徒步', tier: 6, x: 37.2, y: 81.0 },
  { text: '宠物医院', tier: 6, x: 42.3, y: 79.5 },
  { text: '聊天交友', tier: 6, x: 54.4, y: 82.8 },
  { text: '招商加盟', tier: 6, x: 63.9, y: 82.8 },
  { text: '网络代理', tier: 6, x: 18.0, y: 82.8 },
  { text: '珠宝首饰', tier: 6, x: 26.9, y: 82.5 },

  { text: '普拉提', tier: 6, x: 83.3, y: 84.7 },
  { text: '雅思托福', tier: 6, x: 2.7, y: 85.4 },
  { text: '平板电脑', tier: 6, x: 72.7, y: 84.7 },

  { text: '拍卖服务', tier: 6, x: 37.2, y: 88.8 },
  { text: '法律服务', tier: 6, x: 46.3, y: 89.9 },
  { text: '农业生产', tier: 6, x: 16.1, y: 90.3 },

  { text: '包装印刷', tier: 6, x: 23.5, y: 91.8 },
  { text: '移动硬盘', tier: 6, x: 77.6, y: 92.2 },
  { text: '航空服务', tier: 6, x: 67.8, y: 92.5 },
];

const TIER_STYLES: Record<
  number,
  { fontSize: string; fontWeight: string; color: string; lineHeight: string }
> = {
  1: { fontSize: '40px', fontWeight: '600', color: '#296bef', lineHeight: '48px' },
  2: { fontSize: '32px', fontWeight: '600', color: '#6997f4', lineHeight: '40px' },
  3: { fontSize: '24px', fontWeight: '400', color: '#33d2cb', lineHeight: '32px' },
  4: { fontSize: '16px', fontWeight: '400', color: '#fcb04c', lineHeight: '24px' },
  5: { fontSize: '14px', fontWeight: '400', color: '#8b8dfb', lineHeight: '22px' },
  6: { fontSize: '12px', fontWeight: '400', color: 'var(--odn-color-black-8)', lineHeight: '20px' },
};

// ─── 热门词列表 ────────────────────────────────────────────────

function HotKeywordList() {
  return (
    <div className="flex h-[354px] w-[391px] shrink-0 flex-col overflow-hidden border-r border-black-5">
      <div className="px-6 py-5">
        <span className="text-[length:var(--odn-font-size-text-md)] font-semibold text-black-12">
          热门词
        </span>
      </div>

      <div className="flex items-center gap-4 px-6 py-[9px] text-[length:var(--odn-font-size-text-md)] text-black-10">
        <span className="w-[160px] shrink-0 truncate">关键词</span>
        <span className="flex-1">搜索指数</span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto">
        {KEYWORD_DATA.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 hover:bg-solid-black-2 transition-colors duration-150"
          >
            <span className="w-[160px] shrink-0 truncate text-[length:var(--odn-font-size-text-md)] text-black-12">
              {item.keyword}
            </span>
            <div className="flex flex-1 items-center gap-2 py-[10px]">
              <div
                className="h-3 shrink-0 rounded-[2px] bg-blue-5"
                style={{ width: `${(item.index / MAX_INDEX) * BAR_MAX_WIDTH}px` }}
              />
              <span className="font-[OD-number] text-[length:var(--odn-font-size-comment)] text-black-10">
                {item.index}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 词云图 ────────────────────────────────────────────────

function WordCloud() {
  return (
    <div className="relative h-[354px] flex-1 overflow-hidden">
      <div className="px-6 py-5">
        <span className="text-[length:var(--odn-font-size-text-md)] font-semibold text-black-12">
          词云图
        </span>
      </div>

      <div
        className="absolute left-1/2 h-[268px] w-[732px] -translate-x-1/2 -translate-y-1/2 bg-white"
        style={{ top: 'calc(50% + 19px)' }}
      >
        {WORD_CLOUD_DATA.map((item, i) => {
          const style = TIER_STYLES[item.tier];
          return (
            <span
              key={i}
              className="absolute whitespace-nowrap"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                fontSize: style.fontSize,
                fontWeight: style.fontWeight,
                color: style.color,
                lineHeight: style.lineHeight,
              }}
            >
              {item.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── 主组件 ────────────────────────────────────────────────

const MindShareDictionary = () => {
  return (
    <div className="flex flex-col overflow-hidden rounded-[12px] bg-white">
      <div className="flex h-16 items-center px-6">
        <span className="text-[length:var(--odn-font-size-headline-5)] font-semibold text-black-12">
          心智词典
        </span>
      </div>

      <div className="px-6 pb-6">
        <div className="flex overflow-hidden rounded-[8px] border border-black-6">
          <HotKeywordList />
          <WordCloud />
        </div>
      </div>
    </div>
  );
};

export default MindShareDictionary;
