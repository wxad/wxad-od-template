'use client';

import clsx from 'clsx';
import { Button, Icon, Popover, ScrollArea } from 'one-design-next';
import React, { useState } from 'react';
import './controlled.scss';

export interface MessageItemProps extends React.HTMLAttributes<HTMLDivElement> {
  type: string;
  text: string;
  publishedAt: string;
  link?: string;
  buttonText?: string;
  buttonLink?: string;
  onLinkClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onButtonClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  read?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  type,
  text,
  publishedAt,
  link,
  buttonText,
  buttonLink,
  className,
  onLinkClick,
  onButtonClick,
  onClick,
  read = true,
  ...otherProps
}) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (link) {
      window.open(link, '_blank');
    }
    if (onLinkClick) {
      onLinkClick(e);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!buttonText) {
      handleLinkClick(e);
    }
    if (onClick) {
      onClick(e);
    }
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (buttonLink || link) {
      window.open(buttonLink || link, '_blank');
    }
    if (onButtonClick) {
      onButtonClick(e);
    }
  };

  return (
    <div
      className={clsx(
        'message-item',
        link && 'message-item-clickable',
        buttonText && 'message-item-clickable-with-button',
        className,
      )}
      onClick={handleClick}
      {...otherProps}
    >
      <div
        className={clsx(
          'type-badge',
          read ? 'type-badge-read' : 'type-badge-unread',
        )}
      >
        {type}
        <div
          className={clsx(
            'type-badge-bg',
            read ? 'type-badge-bg-read' : 'type-badge-bg-unread',
          )}
        />
      </div>
      <div className="message-text-container">
        {buttonText && (
          <div
            className="message-button"
            onClick={handleButtonClick}
            role="button"
          >
            <span className="message-button-text">{buttonText}</span>
            <svg
              className="message-button-icon"
              width="18"
              height="18"
              viewBox="0 0 18 18"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.49121 3.69712C9.68623 3.50102 10.0035 3.50071 10.1992 3.69615L15.1504 8.64244C15.2496 8.74155 15.2974 8.87186 15.2959 9.00181C15.2971 9.13144 15.2494 9.26134 15.1504 9.36021L10.1992 14.3065C10.0035 14.5019 9.68622 14.5016 9.49121 14.3055L9.1416 13.954C8.94735 13.7586 8.94794 13.4428 9.14258 13.2479L12.6396 9.74986H3.5C3.22386 9.74986 3 9.526 3 9.24986V8.74986C3.00019 8.47387 3.22397 8.24986 3.5 8.24986H12.6357L9.14258 4.75474C8.94793 4.55986 8.94739 4.24404 9.1416 4.04869L9.49121 3.69712Z"
              />
            </svg>
          </div>
        )}
        <div className="message-text" title={text} onClick={handleLinkClick}>
          {/* 这里分多层做看起来很蠢，实际上也有点蠢。但如果直接变化 width，效果并不足够好 */}
          <div className="message-text-inner">
            <span className="message-text-content">{text}</span>
          </div>
          <div className="message-text-inner-hover">
            <span className="message-text-content">{text}</span>
            {!!link && (
              <svg
                className="message-text-icon"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path d="M13.1387 4.50391C13.2786 4.50392 13.4044 4.56164 13.4951 4.6543C13.5876 4.74501 13.6455 4.871 13.6455 5.01074L13.6426 12.0098C13.6424 12.2861 13.4179 12.5103 13.1416 12.5098L12.6455 12.5078C12.37 12.507 12.1467 12.2833 12.1465 12.0078V7.06152L5.68362 13.5244C5.48836 13.7197 5.17185 13.7197 4.97659 13.5244L4.62307 13.1709C4.42805 12.9756 4.42789 12.659 4.62307 12.4639L11.083 6.00391L6.14163 6.00293C5.86619 6.00276 5.64243 5.77937 5.64163 5.50391L5.63967 5.00879C5.6389 4.73228 5.8632 4.50711 6.13967 4.50684L13.1387 4.50391Z" />
              </svg>
            )}
          </div>
          <div className="message-text-inner-button-hover">
            <span className="message-text-content">{text}</span>
          </div>
        </div>
      </div>
      <div className="message-time">{publishedAt}</div>
    </div>
  );
};

export interface NotificationPopoverTriggerProps {
  /** 初始是否展开（文档 demo 默认 true；顶栏嵌入建议 false） */
  initialVisible?: boolean;
  /**
   * 为 true 时与文档「受控」行为一致：首次需点「收起」后才响应鼠标移出关闭。
   * 为 false 时始终随 onVisibleChange 切换（顶栏常用）。
   */
  stickyUntilCollapsed?: boolean;
}

export const NotificationPopoverTrigger: React.FC<
  NotificationPopoverTriggerProps
> = ({
  initialVisible = true,
  stickyUntilCollapsed = true,
}) => {
  const [visible, setVisible] = useState(initialVisible);
  const [tabIndex, setTabIndex] = useState(0);
  const [interactable, setInteractable] = useState(!stickyUntilCollapsed);

  return (
    <Popover
      visible={visible}
      mouseLeaveDelay={0.1}
      onVisibleChange={(next) => {
        if (interactable) {
          setVisible(next);
        }
      }}
      placement="bottomLeft"
      flip={false}
      popup={
        <>
          <div className="tabs-header">
            <div className="tabs-nav">
              <div
                className={clsx(
                  'tab-item',
                  tabIndex === 0 && 'tab-item-active',
                )}
                onClick={() => setTabIndex(0)}
              >
                重要通知 (3)
              </div>
              <div
                className={clsx(
                  'tab-item',
                  tabIndex === 1 && 'tab-item-active',
                )}
                onClick={() => setTabIndex(1)}
              >
                系统消息 (10)
              </div>
            </div>
            <Button
              light
              rightIcon="up"
              size="small"
              style={{
                '--odn-button-normal-color-light': 'var(--odn-color-black-9)',
              }}
              onClick={() => {
                setVisible(false);
                if (stickyUntilCollapsed) {
                  setInteractable(true);
                }
              }}
            >
              收起
            </Button>
          </div>
          <div className="tab-content">
            <div
              className={clsx(
                'tab-panel',
                tabIndex === 0
                  ? 'tab-panel-active'
                  : 'tab-panel-inactive-left',
              )}
            >
              <ScrollArea className="scroll-area">
                <MessageItem
                  read={false}
                  type="系统公告"
                  text="本系统将于今晚 22:00 至次日 02:00 进行例行维护升级，期间服务可能短暂中断，请提前做好准备"
                  publishedAt="14:00"
                />
                <MessageItem
                  read
                  type="账号安全"
                  text="您的账号在 16:30 从新的设备登录，如非本人操作，请立即修改密码"
                  publishedAt="14:00"
                  link="https://ruyi.qq.com/"
                />
                <MessageItem
                  read={false}
                  type="功能更新"
                  text="新增批量操作功能已上线，支持同时处理多个任务，大幅提升工作效率，快来体验吧"
                  publishedAt="14:00"
                  link="https://ruyi.qq.com/"
                />
                <MessageItem
                  read={false}
                  type="数据报告"
                  text="2024 年第一季度数据分析报告已生成，包含详细的趋势分析和业务洞察"
                  publishedAt="14:00"
                  link="https://dmp.woa.com/"
                  buttonText="查看详情"
                  buttonLink="https://ruyi.qq.com/"
                />
                <MessageItem
                  read={false}
                  type="权限通知"
                  text="您已被添加为项目管理权限，可以管理项目成员和查看所有项目数据，详情请查看"
                  publishedAt="14:00"
                  link="https://dmp.woa.com/"
                  buttonText="查看详情"
                  buttonLink="https://ruyi.qq.com/"
                />
              </ScrollArea>
              <div
                className="tab-footer"
                style={{
                  '--odn-button-normal-color-light': 'var(--odn-color-black-9)',
                }}
              >
                <Button light rightIcon="right" size="small">
                  查看全部
                </Button>
                <Button light size="small">
                  一键已读
                </Button>
              </div>
            </div>
            <div
              className={clsx(
                'tab-panel',
                tabIndex === 1
                  ? 'tab-panel-active'
                  : 'tab-panel-inactive-right',
              )}
            >
              <ScrollArea className="scroll-area">
                <MessageItem
                  read={false}
                  type="任务提醒"
                  text="您有 3 个待处理的任务即将到期，请及时查看并完成"
                  publishedAt="13:45"
                />
                <MessageItem
                  read
                  type="协作通知"
                  text='张三 邀请您参与"新产品规划"项目讨论'
                  publishedAt="13:30"
                />
                <MessageItem
                  read
                  type="审批通知"
                  text="您的请假申请已通过审批，请安排好工作交接"
                  publishedAt="13:00"
                />
                <MessageItem
                  read
                  type="评论回复"
                  text='李四 回复了您的评论："感谢反馈，我们会认真考虑您的建议"'
                  publishedAt="12:15"
                />
                <MessageItem
                  read
                  type="工作动态"
                  text="本季度业绩达标率 105%，超出预期目标，感谢团队的辛勤付出"
                  publishedAt="11:30"
                />
                <MessageItem
                  read
                  type="会员福利"
                  text="恭喜您获得本月会员特权，可享受更多专属功能和优先支持"
                  publishedAt="10:00"
                />
                <MessageItem
                  read
                  type="版本更新"
                  text="v2.3.0 版本已发布，新增数据导出和自定义报表功能"
                  publishedAt="09:30"
                />
                <MessageItem
                  read
                  type="培训通知"
                  text="本周五下午 14:00 将举办产品使用培训，欢迎大家参与"
                  publishedAt="昨天"
                />
                <MessageItem
                  read
                  type="到期提醒"
                  text="您的会员权益将于本月末到期，续费可享受 8 折优惠"
                  publishedAt="昨天"
                />
                <MessageItem
                  read
                  type="社区动态"
                  text="产品反馈板块新增热门话题，快来参与讨论吧"
                  publishedAt="2天前"
                />
              </ScrollArea>
              <div
                className="tab-footer"
                style={{
                  '--odn-button-normal-color-light': 'var(--odn-color-black-9)',
                }}
              >
                <Button light rightIcon="right" size="small">
                  查看全部
                </Button>
                <Button light size="small">
                  一键已读
                </Button>
              </div>
            </div>
          </div>
        </>
      }
      popupStyle={{
        padding: 0,
        width: '540px',
        maxWidth: 'initial',
      }}
    >
      <div className="trigger-icon">
        <Icon
          name="bell"
          color={
            visible
              ? 'var(--odn-color-primary)'
              : 'var(--odn-color-black-11)'
          }
        />
        <div
          className={clsx(
            'trigger-icon-bg',
            visible && 'trigger-icon-bg-active',
          )}
        />
        <div className="badge-indicator">
          <div className="badge-number">3</div>
        </div>
      </div>
    </Popover>
  );
};

export default NotificationPopoverTrigger;
