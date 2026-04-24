'use client';

import { NotificationPopoverTrigger } from './_internal/notification-popover-trigger';
import React from 'react';

/**
 * 与 Popover「受控」文档示例同源实现，避免维护两套消息面板。
 * 设计稿级 Mock 顶栏与配置面板已移除；结构说明见 ../notification-popover.md。
 */
const NotificationPopoverDemo = () => (
  <div className="py-2">
    <NotificationPopoverTrigger />
  </div>
);

export default NotificationPopoverDemo;
