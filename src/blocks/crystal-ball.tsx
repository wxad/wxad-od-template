'use client';

import { Button, Icon, Tooltip } from 'one-design-next';
import React from 'react';
import CrystalBallInsightVisual from './crystal-ball/crystal-ball-visual';

// ─── 洞察结论数据（区块文档：心智人群洞察）────────────────────────

interface InsightRow {
  category: string;
  tags: string[];
}

interface ActionLink {
  label: string;
  href?: string;
}

const INSIGHT_DATA: InsightRow[] = [
  {
    category: '高占比人群',
    tags: [
      '人群基础属性: 年龄-18-24、性别-女',
      '行业机会人群: 美妆行业意向人群、现制茶咖兴趣人群',
      '品牌共鸣人群: 兰蔻/LANCOME、茶百道',
      '音乐流派偏好: 流行音乐爱好者、纯音乐欣赏者',
    ],
  },
  {
    category: '高频活跃于',
    tags: [
      '内容偏好-长视频: 电视剧、综艺',
      '达人偏好-公众号: 社会、生活',
      '达人偏好-视频号: 生活、美食',
      '兴趣场域-媒体位: 微信朋友圈、微信公众号',
      '明星粉丝偏好: 周杰伦、林俊杰',
      '新闻资讯偏好: 健康、社会',
    ],
  },
];

const INSIGHT_ACTIONS: ActionLink[] = [
  { label: '人群内容偏好报告' },
  { label: '人群达人偏好报告' },
];

function InsightCard({ rows, actions }: { rows: InsightRow[]; actions: ActionLink[] }) {
  return (
    <div className="flex overflow-hidden rounded-[8px] bg-black-1">
      <div className="flex w-16 shrink-0 flex-col items-center justify-center border-r border-white bg-gradient-to-b from-[#e5eeff] to-[#f7f9fc] px-[18px]">
        <span className="text-center text-sm font-semibold leading-snug text-blue-6">
          洞察结论
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-6 py-4">
        {rows.map((row) => (
          <div key={row.category} className="flex items-start gap-2">
            <div className="flex shrink-0 items-center gap-2 py-[3px]">
              <span className="size-1 rounded-full bg-black-12" />
              <span className="text-sm text-black-12">{row.category}</span>
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-1">
              {row.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-black-6 px-2 py-[3px] text-sm text-black-12"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="flex w-[82px] shrink-0 items-center gap-2 py-[3px]">
            <span className="size-1 rounded-full bg-black-12" />
            <span className="text-sm text-black-12">前往创建</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-blue-6">
            {actions.map((a) => (
              <button key={a.label} type="button" className="hover:underline">
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const CrystalBallDemo = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="px-4 py-6">
        <div className="mb-4 space-y-1 text-center">
          <h3 className="text-base font-semibold text-black-12">水晶球 · 人群洞察</h3>
          <p className="mx-auto max-w-lg text-sm text-black-9">
            多层光圈扇区展示人群维度，支持 hover 查看 Popover、点击标签下钻至气泡力导向布局查看占比与排名；以下为心智人群洞察结论示例。
          </p>
        </div>

        <CrystalBallInsightVisual />
      </div>

      <div className="overflow-hidden rounded-[12px] bg-white">
        <div className="flex h-16 items-center justify-between px-6 py-3.5 pr-3">
          <span className="text-base font-semibold text-black-12">心智人群洞察</span>
          <div className="flex items-center">
            <Button light size="medium">
              统计说明
            </Button>
            <Tooltip content="仅代表全量心智人群中广告覆盖部分抽样统计，而非整体市场表现，仅供参考">
              <button
                type="button"
                className="flex items-center gap-0.5 rounded-[6px] bg-black-1 px-3 py-[7px] text-sm text-black-10 hover:bg-black-2"
              >
                <Icon name="plus" size={16} />
                添加人群
              </button>
            </Tooltip>
          </div>
        </div>
        <div className="px-6 pb-6">
          <InsightCard rows={INSIGHT_DATA} actions={INSIGHT_ACTIONS} />
        </div>
      </div>
    </div>
  );
};

export default CrystalBallDemo;
