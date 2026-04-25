'use client';

import clsx from 'clsx';
import {
  convertDateRangeToString,
  convertDateToString,
  DatePicker,
  isDayAfter,
  isDayBefore,
  isSameDay,
} from 'one-design-next';
import React, { useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────

export type RyDateRangeMode =
  | '7'
  | '30'
  | '60'
  | '90'
  | 'week'
  | 'month'
  | 'quarter';

export interface RyDateRangeModeOption {
  label: string;
  value: RyDateRangeMode;
}

export interface RyDateRangePickerProps {
  /** Controlled date range value [start, end] */
  value: [Date, Date];
  /** Called when user selects a new range */
  onChange: (value: [Date, Date]) => void;
  /** Available shortcut modes. Defaults to all 7 */
  modes?: RyDateRangeModeOption[];
  /** Initial active mode. Defaults to first item in modes */
  defaultMode?: RyDateRangeMode;
  /** Label shown on the trigger before the date text. Defaults to '日期范围' */
  triggerLabel?: string;
  /** Width of the trigger element. Defaults to '276px' */
  triggerWidth?: string | number;
  /** className for the outermost trigger div */
  className?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date. Defaults to yesterday */
  maxDate?: Date;
}

// ─── Defaults ─────────────────────────────────────────────────

export const DEFAULT_RY_MODES: RyDateRangeModeOption[] = [
  { label: '7 天', value: '7' },
  { label: '30 天', value: '30' },
  { label: '60 天', value: '60' },
  { label: '90 天', value: '90' },
  { label: '自然周', value: 'week' },
  { label: '自然月', value: 'month' },
  { label: '自然季', value: 'quarter' },
];

// ─── Style pack (CSS variable overrides for popup) ────────────

const stylePack = {
  '--odn-dp-nav-shadow': 'none',
  '--odn-dp-padding-block-end': '8px',
  '--odn-dp-padding-inline': '8px',
  '--odn-dp-nav-padding-inline': '8px',
  '--odn-dp-month-margin-block-start': '0',
  '--odn-dp-shortcuts-width': '72px',
  '--odn-dp-grid-body-padding-block-start': '0',
  '--odn-dp-grid-body-padding-block-end': '8px',
  '--odn-dp-grid-body-padding-inline-start': '8px',
  '--odn-dp-grid-body-padding-inline-end': '8px',
  '--odn-dp-quarter-grid-columns': '1',
  '--odn-dp-month-grid-columns': '3',
  '--odn-dp-month-grid-item-width': '70px',
  '--odn-dp-month-grid-item-height': '32px',
  '--odn-dp-quarter-grid-item-width': '210px',
  '--odn-dp-quarter-grid-item-height': '32px',
  '--odn-dp-grid-popup-min-width': '210px',
};

// ─── Main component ──────────────────────────────────────────

export function RyDateRangePicker({
  value,
  onChange,
  modes = DEFAULT_RY_MODES,
  defaultMode,
  triggerLabel = '日期范围',
  triggerWidth = '276px',
  className,
  minDate,
  maxDate: maxDateProp,
}: RyDateRangePickerProps) {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const yesterday = new Date(Date.now() - DAY_MS);
  const maxDate = maxDateProp ?? yesterday;

  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<RyDateRangeMode>(
    defaultMode ?? modes[0]?.value ?? '7',
  );

  const [manualSelectingStartDate, setManualSelectingStartDate] = useState<
    'start' | 'end'
  >('start');

  const hoverTimer = useRef(0);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // 根据 mode 计算出基准日期
  const modeDays = parseInt(mode);
  let baseDate = new Date(Date.now() - modeDays * DAY_MS);

  let isSelectingStart =
    !hoverDate || (hoverDate && isDayBefore(hoverDate, baseDate));

  if (manualSelectingStartDate === 'end') {
    baseDate = new Date(
      (minDate ?? new Date(0)).getTime() + (modeDays - 1) * DAY_MS,
    );
    isSelectingStart = !!hoverDate && isDayBefore(hoverDate, baseDate);
  }

  useEffect(() => {
    if (visible) {
      setHoverDate(null);
      setSelectingDate(null);
    }
  }, [visible, mode]);

  // 自然周、自然月、自然季的 hover 状态处理
  const [selectingDate, setSelectingDate] = useState<[Date, Date] | null>(null);

  const handleMouseEnter = (
    _: React.MouseEvent<HTMLButtonElement | HTMLDivElement>,
    info?: {
      startDate?: Date;
      endDate?: Date;
      [key: string]: unknown;
    },
  ) => {
    clearTimeout(hoverTimer.current);
    if (
      info?.startDate &&
      info?.endDate &&
      !isSameDay(info.startDate, selectingDate?.[0]) &&
      !isSameDay(info.endDate, selectingDate?.[1])
    ) {
      setSelectingDate([info.startDate, info.endDate]);
    }
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      setSelectingDate(null);
    }, 100);
  };

  let selectingStartDate = null;
  let selectingEndDate = null;
  if (hoverDate) {
    if (isSelectingStart) {
      selectingEndDate = new Date(
        hoverDate.getTime() + (modeDays - 1) * DAY_MS,
      );
    } else {
      selectingStartDate = new Date(
        hoverDate.getTime() - (modeDays - 1) * DAY_MS,
      );
    }
  }

  selectingStartDate = selectingStartDate || hoverDate;
  selectingEndDate = selectingEndDate || hoverDate;

  return (
    <DatePicker
      allowClear={false}
      lang="zhCN"
      picker={
        ['week', 'month', 'quarter'].includes(mode)
          ? (mode as 'week' | 'month' | 'quarter')
          : 'day'
      }
      shortcuts={modes.map((m) => ({
        label: m.label,
        active: mode === m.value,
        onClick: () => setMode(m.value),
      }))}
      visible={visible}
      onVisibleChange={setVisible}
      triggerElement={
        <div
          className={clsx(
            'flex h-[36px] cursor-pointer items-center gap-[12px] whitespace-nowrap rounded-[6px] border border-[var(--odn-color-black-6)] px-[12px] text-[14px] transition-all duration-200 hover:border-[var(--odn-color-black-7)]',
            visible &&
              'border-[var(--odn-color-blue-6)] hover:border-[var(--odn-color-blue-6)]',
            className,
          )}
          style={{
            width:
              typeof triggerWidth === 'number'
                ? `${triggerWidth}px`
                : triggerWidth,
          }}
        >
          <span className="text-[var(--odn-color-black-9)]">
            {triggerLabel}
          </span>
          <div>{convertDateRangeToString(value, 'zhCN', '~')}</div>
        </div>
      }
      popupStyle={stylePack}
      popupRender={(node) => {
        return (
          <div className="select-none">
            {['week', 'month', 'quarter'].includes(mode) ? (
              <div className="relative flex h-[40px] items-center justify-between whitespace-nowrap border-b border-[#f0f0f0] px-[16px] text-[12px] text-[var(--odn-color-black-12)]">
                <div
                  className={clsx(
                    'flex h-full items-center justify-center',
                    mode === 'quarter' ? 'w-[81px]' : 'w-[96px]',
                  )}
                >
                  {convertDateToString(selectingDate?.[0]) || '开始日期'}
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path
                    d="M5.20022 6.5918C5.79222 6.5918 6.44822 6.7518 7.15222 7.1038C7.63222 7.3758 8.14422 7.6638 8.67222 7.9838C9.56822 8.4958 10.3202 8.7678 10.9282 8.7678C11.6642 8.7678 12.4642 8.1438 13.3282 6.9118L14.1762 7.6158C13.1522 9.1198 12.0642 9.8878 10.9282 9.8878C10.1922 9.8878 9.36022 9.6318 8.43222 9.1198C7.90422 8.7998 7.39222 8.4958 6.91222 8.2238C6.27222 7.8878 5.69622 7.7278 5.20022 7.7278C4.36822 7.7278 3.53622 8.3198 2.68822 9.5038L1.82422 8.8158C2.86422 7.3278 3.98422 6.5918 5.20022 6.5918Z"
                    fill="#0D0D0D"
                  />
                </svg>
                <div
                  className={clsx(
                    'flex h-full items-center justify-center',
                    mode === 'quarter' ? 'w-[81px]' : 'w-[96px]',
                  )}
                >
                  {convertDateToString(selectingDate?.[1]) || '结束日期'}
                </div>
              </div>
            ) : (
              <div className="relative flex h-[40px] items-center justify-between whitespace-nowrap border-b border-[#f0f0f0] px-[16px] text-[12px] text-[var(--odn-color-black-12)]">
                <div
                  className={clsx(
                    "relative flex h-full w-[81px] cursor-pointer items-center justify-center after:absolute after:left-0 after:top-1/2 after:h-[30px] after:w-full after:-translate-y-1/2 after:rounded-[6px] after:bg-[var(--odn-color-black-1)] after:opacity-0 after:content-[''] hover:after:opacity-100",
                    isSelectingStart &&
                      'font-semibold text-[var(--odn-color-primary)]',
                  )}
                  onClick={() => {
                    setManualSelectingStartDate('start');
                  }}
                >
                  {selectingStartDate
                    ? convertDateToString(selectingStartDate)
                    : '开始日期'}
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={clsx(
                    'transition-all duration-200',
                    !isSelectingStart && 'rotate-180',
                  )}
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.91637 3.22662C7.81874 3.12899 7.81874 2.9707 7.91637 2.87307L8.26992 2.51951C8.36755 2.42188 8.52585 2.42188 8.62348 2.51951L13.5732 7.46926L13.9268 7.82281C14.0244 7.92044 14.0244 8.07874 13.9268 8.17637L13.5732 8.52992L8.62348 13.4797C8.52584 13.5773 8.36755 13.5773 8.26992 13.4797L7.91637 13.1261C7.81874 13.0285 7.81874 12.8702 7.91637 12.7726L12.1893 8.49959H2.35357C2.2155 8.49959 2.10357 8.38766 2.10357 8.24959V7.74959C2.10357 7.61152 2.2155 7.49959 2.35357 7.49959H12.1893L7.91637 3.22662Z"
                    fill="var(--odn-color-black-11)"
                  />
                </svg>
                <div
                  className={clsx(
                    "relative flex h-full w-[81px] cursor-pointer items-center justify-center after:absolute after:left-0 after:top-1/2 after:h-[30px] after:w-full after:-translate-y-1/2 after:rounded-[6px] after:bg-[var(--odn-color-black-1)] after:opacity-0 after:content-[''] hover:after:opacity-100",
                    !isSelectingStart &&
                      'font-semibold text-[var(--odn-color-primary)]',
                  )}
                  onClick={() => {
                    setManualSelectingStartDate('end');
                  }}
                >
                  {selectingEndDate
                    ? convertDateToString(selectingEndDate)
                    : '结束日期'}
                </div>
                <div
                  className={clsx(
                    'absolute bottom-[-1px] left-[16px] h-[1px] w-[81px] bg-[var(--odn-color-primary)] transition-all duration-200',
                    !isSelectingStart && 'translate-x-[113px]',
                  )}
                />
              </div>
            )}
            {node}
          </div>
        );
      }}
      onDayMouseEnter={handleMouseEnter}
      onDayMouseLeave={handleMouseLeave}
      onMonthMouseEnter={handleMouseEnter}
      onMonthMouseLeave={handleMouseLeave}
      onQuarterMouseEnter={handleMouseEnter}
      onQuarterMouseLeave={handleMouseLeave}
      components={{
        DayButton: ['week', 'month', 'quarter'].includes(mode)
          ? undefined
          : ({ day, modifiers, className: dayClassName, ...props }) => {
              const { today, disabled, outside } = modifiers;
              const dateNumber = day.date.getDate();

              return (
                <button
                  {...props}
                  className={clsx(
                    dayClassName,
                    "relative data-[ruyi-date-picker-day-selecting-start=true]:rounded-l-[8px] data-[ruyi-date-picker-day-selecting-start=true]:data-[ruyi-date-picker-day-hover=true]:bg-[var(--odn-color-blue-2)] data-[ruyi-date-picker-day-selecting-start=true]:data-[ruyi-date-picker-day-hover=false]:bg-[var(--odn-color-blue-1)] data-[ruyi-date-picker-day-selecting-end=true]:rounded-r-[8px] data-[ruyi-date-picker-day-selecting-end=true]:data-[ruyi-date-picker-day-hover=true]:bg-[var(--odn-color-blue-2)] data-[ruyi-date-picker-day-selecting-end=true]:data-[ruyi-date-picker-day-hover=false]:bg-[var(--odn-color-blue-1)] data-[ruyi-date-picker-day-selecting=true]:rounded-none data-[ruyi-date-picker-day-selecting=true]:bg-[var(--odn-color-blue-1)] data-[ruyi-date-picker-day-today=true]:after:absolute data-[ruyi-date-picker-day-today=true]:after:bottom-[5px] data-[ruyi-date-picker-day-today=true]:after:left-1/2 data-[ruyi-date-picker-day-today=true]:after:h-[3px] data-[ruyi-date-picker-day-today=true]:after:w-[3px] data-[ruyi-date-picker-day-today=true]:after:-translate-x-1/2 data-[ruyi-date-picker-day-today=true]:after:rounded-full data-[ruyi-date-picker-day-today=true]:after:bg-[var(--odn-color-black-12)] data-[ruyi-date-picker-day-today=true]:after:content-['']",
                  )}
                  style={{
                    cursor: isSameDay(day.date, hoverDate)
                      ? isSelectingStart
                        ? "url('https://wxa.wxs.qq.com/wxad-design/yijie/ry-cursor-right-32.png') 16 16, auto"
                        : "url('https://wxa.wxs.qq.com/wxad-design/yijie/ry-cursor-left-32.png') 16 16, auto"
                      : undefined,
                  }}
                  data-odn-date-picker-day
                  data-odn-date-picker-day-disabled={disabled}
                  data-odn-date-picker-day-outside={outside}
                  data-ruyi-date-picker-day-today={today}
                  data-ruyi-date-picker-day-hover={isSameDay(
                    day.date,
                    hoverDate,
                  )}
                  data-ruyi-date-picker-day-selecting-start={isSameDay(
                    day.date,
                    selectingStartDate,
                  )}
                  data-ruyi-date-picker-day-selecting-end={isSameDay(
                    day.date,
                    selectingEndDate,
                  )}
                  data-ruyi-date-picker-day-selecting={
                    isDayBefore(day.date, selectingEndDate) &&
                    isDayAfter(day.date, selectingStartDate)
                  }
                  onMouseEnter={(e) => {
                    if (visible) {
                      clearTimeout(hoverTimer.current);
                      if (!isSameDay(day.date, hoverDate)) {
                        setHoverDate(day.date);
                      }
                    }
                  }}
                  onMouseLeave={() => {
                    clearTimeout(hoverTimer.current);
                    hoverTimer.current = window.setTimeout(() => {
                      setHoverDate(null);
                    }, 100);
                  }}
                  onMouseDown={() => {
                    if (selectingStartDate && selectingEndDate) {
                      onChange([selectingStartDate, selectingEndDate]);
                      setVisible(false);
                      setTimeout(() => {
                        setHoverDate(null);
                      }, 150);
                    }
                  }}
                >
                  {dateNumber}
                  <div className="absolute left-0 top-0 h-[34px] w-full" />
                </button>
              );
            },
      }}
      style={stylePack}
      value={null}
      onChange={(date: unknown) => {
        if (['week', 'month', 'quarter'].includes(mode) && date) {
          onChange(date as [Date, Date]);
        }
      }}
      renderQuarter={(quarter) =>
        `第${['一', '二', '三', '四'][quarter - 1]}季度`
      }
      maxDate={maxDate}
      minDate={minDate}
    />
  );
}

// ─── Docs demo (default export for <code src>) ───────────────

function RyDateRangePickerDemo() {
  const [value, setValue] = useState<[Date, Date]>([
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    new Date(Date.now() - 24 * 60 * 60 * 1000),
  ]);

  return <RyDateRangePicker value={value} onChange={setValue} />;
}

export default RyDateRangePickerDemo;
