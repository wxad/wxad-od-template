'use client';

import clsx from 'clsx';
import { Button, Icon, Input, Pagination, Select } from 'one-design-next';
import React, { useState } from 'react';

type ReportStatus = 'success' | 'computing' | 'failed' | 'expired';

type ReportItem = {
  id: string;
  title: string;
  reportId: string;
  time: string;
  timeLabel?: string;
  status: ReportStatus;
};

const STATUS_COLORS: Record<ReportStatus, string> = {
  success: 'bg-green-6',
  computing: 'bg-blue-6',
  failed: 'bg-red-6',
  expired: 'bg-black-7',
};

const MOCK_REPORTS: ReportItem[] = [
  { id: '1', title: '策划四213123', reportId: '261930', time: '2023-08-23 16:30:00', status: 'failed' },
  { id: '2', title: '雅诗兰黛双 11 营销计划测算', reportId: '261930', time: '2023-08-23 16:30:00', status: 'success' },
  { id: '3', title: '雅诗兰黛的测试324234', reportId: '261930', time: '2023-08-23 16:30:00', status: 'failed' },
  { id: '4', title: '荣耀 数字 100机型 R3深层触动', reportId: '261930', time: '2023-08-23 16:30:00', status: 'success' },
  { id: '5', title: '卡姿兰－R3拉新', reportId: '261930', time: '2023-08-23 16:30:00', status: 'success' },
  { id: '6', title: '策划四213123', reportId: '261930', time: '2023-08-23 16:30:00', status: 'success' },
  { id: '7', title: '雅诗兰黛双 11 营销计划测算', reportId: '261930', time: '2023-08-23 16:30:00', status: 'success' },
  { id: '8', title: '雅诗兰黛的测试324234', reportId: '261930', time: '2023-08-23 16:30:00', status: 'success' },
  { id: '9', title: '触达分析-20230823 16:09:39', reportId: '261930', time: '2023-08-23 16:30:00', timeLabel: '创建时间', status: 'success' },
];

const TOTAL = 400;

const ReportList = () => {
  const [selected, setSelected] = useState('2');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  return (
    // 外层浅灰底 DemoShell，与页面头部 / 人群列表预览保持一致
    <div className="bg-[#f2f4f9] p-6">
      <div className="w-[320px] flex flex-col bg-white rounded-xl border border-black-4 overflow-hidden">
        {/* 顶部主操作按钮：全宽主色按钮 */}
        <div className="p-4">
          <Button intent="primary" icon="plus" className="w-full">
            新建转化复盘报告
          </Button>
        </div>

        {/* 搜索筛选栏 */}
        <div className="flex items-center gap-2 px-4 py-1.5 border-y border-black-4">
          <Input
            light
            leftElement={<Icon name="search" size={14} />}
            className="flex-1"
            placeholder="搜索"
          />
          <Button light icon="filter">
            筛选
          </Button>
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {MOCK_REPORTS.map((report) => {
            const isActive = selected === report.id;
            return (
              <div
                key={report.id}
                className={clsx(
                  'flex items-start gap-1 pl-3 pr-4 py-[11px] rounded-md cursor-pointer',
                  isActive ? 'bg-blue-1' : 'hover:bg-black-1',
                )}
                onClick={() => setSelected(report.id)}
              >
                <div className="pt-2 flex-none">
                  <div
                    className={clsx(
                      'size-1.5 rounded-full',
                      STATUS_COLORS[report.status],
                    )}
                  />
                </div>
                <div className="min-w-0 flex flex-col gap-2 justify-center">
                  <div
                    className={clsx(
                      'text-sm leading-[22px]',
                      isActive ? 'text-blue-6 font-semibold' : 'text-black-12',
                    )}
                  >
                    {report.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs leading-5 text-black-9 whitespace-nowrap">
                    <span className="inline-flex gap-1">
                      <span>ID:</span>
                      <span className="tabular-nums">{report.reportId}</span>
                    </span>
                    <span className="inline-flex gap-1">
                      <span>{report.timeLabel ?? '计算时间'}:</span>
                      <span className="tabular-nums">{report.time}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 分页区：两行结构
            上行：共 400 条记录，每页 [10▼] 条
            下行：首页 / 上一页 / 页码 / 下一页 / 尾页 */}
        <div className="flex flex-col items-center gap-2 border-t border-black-4 px-[9px] py-3">
          <div className="flex items-center gap-2 text-sm text-black-12">
            <span>
              共 <span className="tabular-nums">{TOTAL}</span> 条记录，每页
            </span>
            <Select
              size="small"
              value={pageSize}
              options={[
                { value: 10, label: '10' },
                { value: 20, label: '20' },
                { value: 50, label: '50' },
              ]}
              onChange={(val) => {
                setPageSize(val as number);
                setPage(1);
              }}
              popupMatchSelectWidth={false}
              style={{ width: 68 }}
            />
            <span>条</span>
          </div>
          <Pagination
            value={page}
            totalSize={TOTAL}
            pageSize={pageSize}
            showFirstLast
            showPrevNext
            onChange={(_, p) => setPage(p)}
            style={{ '--odn-font-size': '12px' } as React.CSSProperties}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportList;
