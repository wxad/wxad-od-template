'use client';

import { Icon, ScrollArea, Tabs } from 'one-design-next';
import React, { useState } from 'react';

interface CrowdRule {
  title: string;
  details: { label: string; value: string }[];
}

interface CrowdDetail {
  name: string;
  status: 'online' | 'computing' | 'offline' | 'expired';
  crowdId: string;
  createdAt: string;
  scale: number;
  tags: string[];
  description: string;
  rules: CrowdRule[];
}

const STATUS_MAP: Record<
  string,
  { label: string; bg: string; border: string; text: string }
> = {
  online: {
    label: '在线',
    bg: '#f3fcf7',
    border: '#cdf3df',
    text: '#07c160',
  },
  computing: {
    label: '计算中',
    bg: 'var(--odn-color-blue-1)',
    border: 'var(--odn-color-blue-3)',
    text: 'var(--odn-color-blue-6)',
  },
  offline: {
    label: '离线',
    bg: 'var(--odn-color-black-2)',
    border: 'var(--odn-color-black-5)',
    text: 'var(--odn-color-black-9)',
  },
  expired: {
    label: '已过期',
    bg: 'var(--odn-color-red-1)',
    border: 'var(--odn-color-red-3)',
    text: 'var(--odn-color-red-6)',
  },
};

const MOCK_DATA: CrowdDetail = {
  name: '科技尝鲜者',
  status: 'online',
  crowdId: '2561025610',
  createdAt: '2025-11-11 10:56:23',
  scale: 295317468,
  tags: [
    '来源：一方人群',
    '类型：行为人群-自有行为数据',
    '支持竞价投放',
    '自建',
    '占用配额',
  ],
  description:
    '人群描述：人群主要集中在中青年白领阶层，由于高强度的工作压力和快节奏的城市生活，他们开始高度关注自身健康和生活质量。他们不仅追求"不生病"，更追求"亚健康"的改善，表现为对轻食、瑜伽、普拉提、冥想、定期体检、保健品、助眠产品以及各种减压方式的浓厚兴趣。他们相信"预防大于治疗"，并愿意为高品质的健康服务和产品付费。',
  rules: [
    {
      title: '标签：用户属性/设备信息/换机人群',
      details: [
        { label: '时间范围', value: '2025-10-16 ~ 2025-11-15' },
        { label: '换机前', value: 'OPPO RENO9' },
        { label: '换机后', value: '苹果 IPHONE 15系列' },
      ],
    },
    {
      title: '人群夹：{人群来源}',
      details: [
        { label: '提取条件 Key', value: '提取条件 Value' },
        { label: '提取条件 Key', value: '提取条件 Value' },
        { label: '提取条件 Key', value: '提取条件 Value' },
      ],
    },
    {
      title: '人群夹：{人群来源}',
      details: [
        { label: '人群包属性 Key', value: '人群包属性 Value' },
        { label: '人群包属性 Key', value: '人群包属性 Value' },
        { label: '人群包属性 Key', value: '人群包属性 Value' },
      ],
    },
    {
      title: 'AI 智选',
      details: [
        { label: 'SPU 类目', value: '厨房电器 > 智能烹饪厨具' },
        { label: 'SPU 名称', value: 'AeroCook 智能全能料理锅' },
        { label: '类型', value: '智能硬件/厨房电器' },
        {
          label: '受众描述',
          value:
            '"精致懒人经济客"。他们是追求生活品质的都市年轻人，热爱美食但厨艺不精或没有充足时间。他们愿意投资能提升幸福感、简化流程的智能设备，避免外卖的重油重盐，享受"一键烹饪"的便捷和"在家做饭"的健康与仪式感。',
        },
      ],
    },
    {
      title: '人群来源：广告行为',
      details: [
        { label: '提取范围', value: '指定账户' },
        { label: '提取维度', value: '不限' },
        { label: '行为类型', value: '转化「ADQ 投放平台」下单-204' },
        { label: '行为频次', value: '不限' },
        { label: '时间范围', value: '2025-10-03 — 2025-10-30' },
      ],
    },
  ],
};

function RuleBlock({ rule }: { rule: CrowdRule }) {
  return (
    <div className="rounded-lg bg-[var(--odn-color-black-1)] px-3 py-2 flex flex-col gap-1.5">
      <div className="text-sm text-black-12 leading-[22px] truncate">
        {rule.title}
      </div>
      {rule.details.map((d, i) => (
        <div
          key={i}
          className="text-sm text-black-9 leading-[22px] truncate"
        >
          {d.label}：{d.value}
        </div>
      ))}
    </div>
  );
}

const CrowdDetailPanel = () => {
  const [tab, setTab] = useState('rules');
  const data = MOCK_DATA;
  const status = STATUS_MAP[data.status];

  return (
    <div className="w-[812px] h-[900px] bg-white rounded-[12px] shadow-[0px_3px_6px_0px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-5 border-b border-black-4">
        <button className="flex items-center justify-center w-6 h-6 cursor-pointer">
          <Icon name="close" size={14} />
        </button>
        <div className="w-px h-4 bg-black-5" />
        <span className="text-base font-semibold text-black-12">
          人群详情
        </span>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 bg-[var(--odn-color-black-1)]">
        <div className="p-4 flex flex-col gap-4">
          {/* Info card */}
          <div className="bg-white rounded-[12px] p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-semibold text-black-12">
                  {data.name}
                </span>
                <span
                  className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: status.bg,
                    borderWidth: 1,
                    borderColor: status.border,
                    color: status.text,
                  }}
                >
                  {status.label}
                </span>
                <span className="text-sm text-[#626366]">
                  人群 ID：{data.crowdId}
                </span>
                <span className="text-sm text-[#626366]">
                  创建时间：{data.createdAt}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-none">
                <span className="text-sm text-black-9">人群规模</span>
                <span className="text-lg font-semibold text-brand-6 tabular-nums">
                  {data.scale.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                {data.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium text-[#626365] bg-[#f6f7f8] border border-black-5"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-[13px] leading-[22px] text-black-9">
                {data.description}
              </p>
            </div>
          </div>

          {/* Rules section */}
          <div className="bg-white rounded-[12px] flex-1 flex flex-col overflow-hidden">
            <div className="flex items-end gap-6 px-6 border-b border-black-3">
              <button
                className={`pt-3.5 pb-0 text-base cursor-pointer bg-transparent px-0 ${
                  tab === 'rules'
                    ? 'font-semibold text-[#313233] border-b-[3px] border-brand-6'
                    : 'text-[#626366] border-b-[3px] border-transparent'
                }`}
                onClick={() => setTab('rules')}
              >
                人群规则
              </button>
              <button
                className={`pt-3.5 pb-0 text-base cursor-pointer bg-transparent px-0 ${
                  tab === 'auth'
                    ? 'font-semibold text-[#313233] border-b-[3px] border-brand-6'
                    : 'text-[#626366] border-b-[3px] border-transparent'
                }`}
                onClick={() => setTab('auth')}
              >
                授权记录
              </button>
            </div>

            {tab === 'rules' && (
              <div className="p-3 flex flex-col gap-2">
                {data.rules.map((rule, i) => (
                  <RuleBlock key={i} rule={rule} />
                ))}
              </div>
            )}

            {tab === 'auth' && (
              <div className="flex items-center justify-center h-60 text-sm text-black-9">
                暂无授权记录
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default CrowdDetailPanel;
