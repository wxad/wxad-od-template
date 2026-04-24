'use client';

import {
  AutoComplete,
  Button,
  HoverFill,
  Icon,
} from 'one-design-next';
import React, { useId, useState } from 'react';

// ─── 类型（对齐 dmp-web AIAutoComplete + AICreateAudience 结果区）────────────────

export type AISearchHistoryOption = { value: string; label: string };

export interface AISearchBarProps {
  value: string;
  onChange: (v: string) => void;
  /** 历史词下拉，传入 `AutoComplete` 的 `options` */
  historyOptions?: AISearchHistoryOption[];
  placeholder?: string;
  className?: string;
}

export type AISearchResultItem = {
  id: string;
  reason: string;
  tags: string[];
};

export interface AISearchResultPanelProps {
  searchText: string;
  onClose: () => void;
  /** 默认使用内置 mock，业务侧可替换为接口数据 */
  results?: AISearchResultItem[];
}

// ─── 默认数据（与 workshop 新建人群一致，便于文档预览）────────────────────────

export const DEFAULT_AI_SEARCH_HISTORY: AISearchHistoryOption[] = [
  { value: '1', label: '食杂零售' },
  { value: '2', label: '高端美妆护肤消费人群' },
  { value: '3', label: '母婴用品高意向人群' },
];

export const DEFAULT_AI_SEARCH_RESULTS: AISearchResultItem[] = [
  {
    id: '1',
    reason:
      '锁定25-49岁主力消费人群，该年龄段承担家庭日常采购职责，是食杂零售的核心购买决策者。',
    tags: ['年龄-40-49'],
  },
  {
    id: '2',
    reason:
      '筛选中等消费水平用户，契合食杂零售日常高频、刚需、性价比导向的消费特征，提升转化效率。',
    tags: ['消费水平-中'],
  },
  {
    id: '3',
    reason:
      '覆盖电商场景下关注食品饮料与生鲜的核心人群，补充线上购买食杂商品的潜在用户，扩大定向范围。',
    tags: ['电商-核心人群-食品饮料', '电商-核心人群-生鲜'],
  },
  {
    id: '4',
    reason:
      '锁定常去超市便利和农贸市场的用户，此类场所是食杂零售的主要线下消费场景，强化场景化触达效果。',
    tags: ['预测场所到访-购物-超市便利', '预测场所到访-购物-农贸市场'],
  },
  {
    id: '5',
    reason:
      '围绕食杂零售核心业态与商品类别选取，精准匹配用户对食杂店、超市、便利店及生鲜、食品杂货等的需求，提升关键词定向相关性。',
    tags: [
      '超市',
      '便利店',
      '生鲜',
      '零售',
      '食杂店',
      '日用品',
      '食杂',
      '食杂超市',
      '粮油食杂',
      '食品杂货店',
    ],
  },
];

// ─── 左侧 AI 图标（与 create-audience 原稿一致；clipPath 用 useId 避免多实例冲突）──

function AISearchBarLeftGlyph() {
  const clipId = `aisb-clip-${useId().replace(/:/g, '')}`;
  return (
    <div className="flex w-6 items-center pl-0.5" aria-hidden>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <g clipPath={`url(#${clipId})`}>
          <path
            d="M7.5 0.900391C7.83137 0.900391 8.09961 1.16863 8.09961 1.5C8.09961 1.83137 7.83137 2.09961 7.5 2.09961C4.51766 2.09961 2.09961 4.51768 2.09961 7.5C2.09962 10.4823 4.51767 12.9004 7.5 12.9004C10.4823 12.9004 12.9004 10.4823 12.9004 7.5C12.9004 7.16863 13.1686 6.90039 13.5 6.90039C13.8314 6.90039 14.0996 7.16863 14.0996 7.5C14.0996 9.10666 13.5245 10.5782 12.5703 11.7227L14.9238 14.0762C15.1581 14.3105 15.1581 14.6895 14.9238 14.9238C14.6895 15.1581 14.3105 15.1581 14.0762 14.9238L11.7227 12.5703C10.5782 13.5245 9.10666 14.0996 7.5 14.0996C3.85493 14.0996 0.900397 11.1451 0.900391 7.5C0.900391 3.85494 3.85492 0.900391 7.5 0.900391ZM11.5 0.400391C11.7511 0.400391 11.9754 0.556521 12.0625 0.791992L12.2471 1.29004C12.5076 1.99407 12.5855 2.1675 12.709 2.29102C12.8325 2.41455 13.006 2.49243 13.71 2.75293L14.208 2.9375C14.4435 3.02463 14.5996 3.24894 14.5996 3.5C14.5996 3.75106 14.4435 3.97537 14.208 4.0625L13.71 4.24707C13.006 4.50756 12.8325 4.58546 12.709 4.70898C12.5855 4.8325 12.5076 5.00595 12.2471 5.70996L12.0625 6.20801C11.9754 6.44347 11.7511 6.59961 11.5 6.59961C11.2489 6.59961 11.0246 6.44347 10.9375 6.20801L10.7529 5.70996C10.4924 5.00595 10.4145 4.8325 10.291 4.70898C10.1675 4.58546 9.99398 4.50756 9.29004 4.24707L8.79199 4.0625C8.55653 3.97537 8.40039 3.75106 8.40039 3.5C8.40039 3.24894 8.55654 3.02463 8.79199 2.9375L9.29004 2.75293C9.99402 2.49243 10.1675 2.41455 10.291 2.29102C10.4145 2.1675 10.4924 1.99407 10.7529 1.29004L10.9375 0.791992L10.9766 0.707031C11.0814 0.519599 11.2805 0.400391 11.5 0.400391Z"
            fill="#262629"
            fillOpacity="0.72"
          />
        </g>
        <defs>
          <clipPath id={clipId}>
            <rect width="16" height="16" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

/** 对齐 dmp-web `AIAutoComplete`：TadAutoComplete + inputProps.leftElement / rightElement */
export function AISearchBar({
  value,
  onChange,
  historyOptions = DEFAULT_AI_SEARCH_HISTORY,
  placeholder = '描述目标人群特征，为你推荐标签',
  className = 'w-full',
}: AISearchBarProps) {
  return (
    <AutoComplete
      value={value}
      options={historyOptions}
      onSearch={(v) => onChange(String(v ?? ''))}
      placeholder={placeholder}
      className={className}
      style={
        {
          '--odn-control-height': '50px',
          '--odn-input-padding-block-medium': '8px',
          '--odn-input-padding-inline-medium': '17px',
          '--odn-input-border-radius-medium': '12px',
        } as React.CSSProperties
      }
      dropdownStyle={{ borderRadius: 12 }}
      inputProps={{
        leftElement: <AISearchBarLeftGlyph />,
        rightElement: (
          <Button
            intent="primary"
            size="small"
            disabled={value.trim() === ''}
            className="relative -right-2"
          >
            搜索
          </Button>
        ),
      }}
    />
  );
}

/** 对齐 dmp-web AICreateAudience：搜索头 + 推荐理由与标签 + 底部反馈栏 */
export function AISearchResultPanel({
  searchText,
  onClose,
  results = DEFAULT_AI_SEARCH_RESULTS,
}: AISearchResultPanelProps) {
  const totalTags = results.reduce((acc, item) => acc + item.tags.length, 0);

  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl bg-[#f5faff] p-2">
      <div className="flex h-[38px] items-center justify-between pl-3 pr-1">
        <div className="flex flex-1 items-center gap-3 overflow-hidden">
          <span
            className="shrink-0 text-sm font-semibold leading-6"
            style={{
              background:
                'radial-gradient(65.37% 100.41% at 0% 0%, #6b8cf8 0%, #79b5ff 30%, #46a0e6 65%, #7a9aeb 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            搜索
          </span>
          <span className="flex-1 truncate text-sm leading-[22px] text-[rgba(51,55,61,0.58)]">
            &quot;{searchText}&quot;
          </span>
        </div>
        <Button light size="small" icon="cancel" onClick={onClose} />
      </div>

      <div className="flex flex-col gap-1">
        {results.map((item) => (
          <HoverFill key={item.id} className="w-full" bgClassName="rounded-xl">
            <div className="group flex gap-2 px-3 pb-3 pt-2">
              <div className="flex flex-1 flex-col gap-2">
                <div className="text-sm leading-[22px] text-[#005988]">
                  <span className="font-semibold">推荐理由：</span>
                  {item.reason}
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <div
                      key={tag}
                      className="group/tagItem flex h-8 items-center whitespace-nowrap rounded-full bg-[#3F5B800D] px-4 py-1 text-xs text-[#0d0d0d]"
                    >
                      <div className="flex items-center px-2">
                        <div className="w-fit text-xs text-[#0D0D0D]">{tag}</div>
                      </div>
                      <Icon
                        name="plus-circle"
                        size={14}
                        className="hidden cursor-pointer rounded-full p-[5px] text-[#0d0d0d] opacity-40 hover:bg-[#44444422] hover:opacity-80 group-hover/tagItem:block"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex w-[30px] items-center">
                <Button
                  size="small"
                  icon="plus"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>
            </div>
          </HoverFill>
        ))}
      </div>

      <div className="flex items-center justify-between p-3 pt-0">
        <div className="flex items-center gap-2">
          <div className="text-xs text-[rgba(49,55,63,0.58)]">
            推荐标签对你有帮助吗？
          </div>
          <Button light size="small" className="rotate-180 text-[#84898e]">
            <Icon name="thumb-down" />
          </Button>
          <Button light size="small" className="text-[#84898e]">
            <Icon name="thumb-down" />
          </Button>
        </div>
        <div className="flex flex-1 items-center gap-6">
          <span className="flex-1 truncate text-right text-sm font-semibold leading-[22px] text-[#135580]">
            共 {totalTags} 个标签
          </span>
          <Button icon="plus">添加全部</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Dumi 区块预览：顶栏 + 可选结果面板（与 workshop PanelTags 顶区一致）──────────

function OnlySearchBarDemo() {
  const [v, setV] = useState('');
  return <AISearchBar value={v} onChange={setV} />;
}

function AiBriefInputBlockDemo() {
  const [value, setValue] = useState('食杂零售');
  const [showPanel, setShowPanel] = useState(true);

  return (
    <div className="flex flex-col gap-8 bg-[#f6f7f8] p-6">
      <div className="mx-auto w-full max-w-[960px] space-y-2">
        <h3 className="text-sm font-semibold text-[#0d0d0d]">
          完整组合（新建人群「从标签列表中选择」顶区）
        </h3>
        <p className="text-xs text-[#626365]">
          <code>AISearchBar</code> + 有内容时展示 <code>AISearchResultPanel</code>
          （关闭后仅保留搜索条）。
        </p>
        <div className="rounded-xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-[14px]">
            <AISearchBar value={value} onChange={setValue} />
            {showPanel && value.trim() !== '' && (
              <AISearchResultPanel
                searchText={value}
                onClose={() => setShowPanel(false)}
              />
            )}
            {!showPanel && (
              <button
                type="button"
                className="self-start text-xs text-blue-6 hover:underline"
                onClick={() => setShowPanel(true)}
              >
                重新显示结果面板
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[960px] space-y-2">
        <h3 className="text-sm font-semibold text-[#0d0d0d]">仅搜索条（无结果区）</h3>
        <div className="rounded-xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <OnlySearchBarDemo />
        </div>
      </div>
    </div>
  );
}

export default AiBriefInputBlockDemo;
