'use client';

import { Button, Card, RuyiLayout, Select, type RuyiMenuItem } from 'one-design-next';
import React, { useState } from 'react';

const NAV_ITEMS = ['首页', '洞察诊断', '人群策略', '策略应用', '全域度量'];

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

const MENU_ITEMS: RuyiMenuItem[] = [
  { key: 'campaign', label: '广告计划', icon: 'list' },
  { key: 'create', label: '新建投放', icon: 'plus' },
];

const STEPS = ['投放目标与预算', '定向人群与出价', '预览与确认'];

export default () => {
  const [step, setStep] = useState(0);
  const [activeNav, setActiveNav] = useState('策略应用');

  return (
    <RuyiLayout
      navItems={NAV_ITEMS}
      activeNav={activeNav}
      onNavChange={(nav) => {
        setActiveNav(nav);
        navigateNav(nav);
      }}
      menuItems={MENU_ITEMS}
      defaultMenuKey="create"
      title="投放管理"
    >
      <div className="flex gap-2 mb-6">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className="flex-1 px-4 py-3 rounded-[8px] text-center cursor-pointer"
            style={{
              background: i === step ? 'var(--odn-color-primary)' : 'var(--odn-color-bg-container)',
              color: i === step ? '#fff' : 'var(--odn-color-text-secondary)',
              fontWeight: i === step ? 600 : 400,
            }}
            onClick={() => setStep(i)}
          >
            步骤 {i + 1}：{s}
          </div>
        ))}
      </div>

      <Card className="min-h-[300px] mb-6">
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-2 font-medium">投放目标</div>
              <Select
                options={[
                  { label: '品牌曝光', value: 'brand' },
                  { label: '效果转化', value: 'conversion' },
                ]}
                className="w-[300px]"
              />
            </div>
            <div>
              <div className="mb-2 font-medium">日预算</div>
              <Select
                options={[
                  { label: '¥5,000', value: '5000' },
                  { label: '¥10,000', value: '10000' },
                  { label: '¥50,000', value: '50000' },
                ]}
                className="w-[300px]"
              />
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-2 font-medium">定向人群</div>
              <Select
                options={[
                  { label: '全量投放', value: 'all' },
                  { label: '自定义人群包', value: 'custom' },
                ]}
                className="w-[300px]"
              />
            </div>
            <div>
              <div className="mb-2 font-medium">出价策略</div>
              <Select
                options={[
                  { label: '自动出价', value: 'auto' },
                  { label: '手动出价', value: 'manual' },
                ]}
                className="w-[300px]"
              />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="text-[var(--odn-color-text-secondary)] text-center p-10">
            方案预览区域（确认投放目标、预算、定向、出价等信息）
          </div>
        )}
      </Card>

      <div className="flex justify-end gap-3">
        {step > 0 && <Button onClick={() => setStep(step - 1)}>上一步</Button>}
        {step < 2 ? (
          <Button variant="primary" onClick={() => setStep(step + 1)}>下一步</Button>
        ) : (
          <Button variant="primary">确认提交</Button>
        )}
      </div>
    </RuyiLayout>
  );
};
