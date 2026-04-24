'use client';

import { Icon, Tabs } from 'one-design-next';
import React from 'react';

export interface ReviewStatusTag {
  /** 状态文案 */
  label: string;
  /** 文字色 */
  color: string;
  /** 背景色 */
  bgColor: string;
}

export interface ReviewInfoItem {
  /** 信息项名称（如"投放日期"） */
  label?: string;
  /** 信息项值 */
  value: string;
  /** 是否以独立项形式渲染（不带 label 前缀） */
  raw?: boolean;
}

export interface ReviewTabItem {
  label: string;
  value: string;
}

export interface ReviewMasterDetailLayoutProps {
  /** 左侧插槽（通常为 ReportList） */
  left: React.ReactNode;
  /** 右侧区域标题（如"营销复盘报告"） */
  title: React.ReactNode;
  /** 标题右侧操作按钮组（复制/下载/删除等） */
  titleActions?: React.ReactNode;
  /** 标题是否可编辑（显示铅笔图标） */
  titleEditable?: boolean;
  /** 点击编辑图标的回调 */
  onTitleEdit?: () => void;
  /** 状态 Tag */
  statusTag?: ReviewStatusTag;
  /** 任务信息条（投放日期/转化时长等） */
  infoItems?: ReviewInfoItem[];
  /** Tab 配置。不传则不渲染 Tabs，children 直接作为右侧内容 */
  tabs?: ReviewTabItem[];
  /** 当前激活 Tab 值 */
  activeTab?: string;
  /** Tab 切换回调 */
  onTabChange?: (value: string) => void;
  /** 右侧内容区（根据 activeTab 决定渲染什么） */
  children: React.ReactNode;
  /** 右侧容器 className（覆盖默认） */
  contentClassName?: string;
}

/**
 * 复盘页主从布局（L1 页面壳）
 *
 * 在"已结束任务的多切面事后审查"场景下复用。
 * 出现页面：营销复盘 / 转化复盘 / 招商复盘。
 *
 * 左侧方案列表（自由 slot，通常传 ReportList 区块），
 * 右侧标题 + 任务信息条 + 可选 Tabs + 内容。
 *
 * 不负责顶栏/菜单/导航——外层的 RuyiLayout 由使用方提供。
 */
export const ReviewMasterDetailLayout: React.FC<ReviewMasterDetailLayoutProps> =
  ({
    left,
    title,
    titleActions,
    titleEditable = true,
    onTitleEdit,
    statusTag,
    infoItems,
    tabs,
    activeTab,
    onTabChange,
    children,
    contentClassName,
  }) => {
    return (
      <div className="flex gap-4 min-h-[calc(100vh-120px)]">
        {/* 左侧方案列表 */}
        {left}

        {/* 右侧内容区 */}
        <div
          className={
            contentClassName ??
            'flex-1 overflow-hidden rounded-2xl bg-white py-3 px-6'
          }
        >
          {/* 标题栏 */}
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-[#0d0d0d]">
                {title}
              </span>
              {titleEditable && (
                <Icon
                  name="pencil"
                  size={14}
                  className="cursor-pointer text-[rgba(51,55,61,0.36)]"
                  onClick={onTitleEdit}
                />
              )}
            </div>
            {titleActions && (
              <div className="flex items-center gap-2">{titleActions}</div>
            )}
          </div>

          {/* 任务信息条 */}
          {(statusTag || (infoItems && infoItems.length > 0)) && (
            <div className="flex items-center gap-3 pb-4 text-sm text-[rgba(51,55,61,0.58)]">
              {statusTag && (
                <span
                  className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: statusTag.bgColor,
                    color: statusTag.color,
                  }}
                >
                  {statusTag.label}
                </span>
              )}
              {infoItems?.map((item, idx) => (
                <React.Fragment key={idx}>
                  {(idx > 0 || statusTag) && (
                    <span className="h-3 border-r border-[#e9ebef]" />
                  )}
                  <span>
                    {item.raw || !item.label
                      ? item.value
                      : `${item.label}：${item.value}`}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Tab 切换 */}
          {tabs && tabs.length > 0 && (
            <Tabs.Tag
              value={activeTab!}
              onChange={(v: string) => onTabChange?.(v)}
              gap={8}
              items={tabs}
            />
          )}

          {/* 内容 */}
          {children}
        </div>
      </div>
    );
  };

// ─── Demo（用于 dumi <code src> 预览） ────────────────────────────────

const DEMO_LEFT = (
  <div className="flex h-full flex-col w-[324px] bg-white rounded-2xl p-4">
    <div className="mb-3 text-sm font-semibold text-[#0d0d0d]">方案列表</div>
    {[
      { id: 1, title: '2026Q1 营销复盘', active: true },
      { id: 2, title: '春节档综艺复盘' },
      { id: 3, title: '暑期IP效果分析' },
    ].map((item) => (
      <div
        key={item.id}
        className="cursor-pointer rounded-lg px-3 py-2.5 transition-colors"
        style={{ backgroundColor: item.active ? '#f5f8ff' : undefined }}
      >
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#07C160]" />
          <span className="flex-1 truncate text-sm font-medium text-[#0d0d0d]">
            {item.title}
          </span>
        </div>
      </div>
    ))}
  </div>
);

const ReviewMasterDetailLayoutDemo = () => {
  const [activeTab, setActiveTab] = React.useState('overview');
  return (
    <ReviewMasterDetailLayout
      left={DEMO_LEFT}
      title="2026Q1 营销复盘报告"
      statusTag={{ label: '已完成', color: '#07C160', bgColor: '#e8f8ef' }}
      infoItems={[
        { label: '投放日期', value: '2025-10-01 ~ 2026-03-31' },
        { label: '转化时长', value: '30天' },
      ]}
      tabs={[
        { label: '概览', value: 'overview' },
        { label: '资产广度', value: 'R' },
        { label: '资产深度', value: 'A' },
        { label: '资产偏好度', value: 'C' },
        { label: '资产持久度', value: 'E' },
        { label: '配置信息', value: 'config' },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="py-8 text-center text-sm text-[rgba(51,55,61,0.58)]">
        {activeTab} 面板内容（由使用方根据 activeTab 渲染）
      </div>
    </ReviewMasterDetailLayout>
  );
};

export default ReviewMasterDetailLayoutDemo;
