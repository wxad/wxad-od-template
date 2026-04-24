import React, { useMemo, useState } from 'react';

// @ts-expect-error dumi data import
import rawBenchmark from '../../../../.dumi/data/benchmark.json';

interface SoftDimension {
  score: number;
  max: number;
  [key: string]: unknown;
}

interface HardGateDetail {
  passed: boolean;
  [key: string]: unknown;
}

interface CaseResult {
  dataset: string;
  riskLevel: string;
  hardGate: {
    passed: boolean;
    details: Record<string, HardGateDetail>;
  };
  softScore: {
    total: number;
    max: number;
    breakdown: Record<string, SoftDimension>;
  } | null;
  verdict: 'improved' | 'unchanged' | 'regressed' | 'FAIL';
}

interface DatasetSummary {
  total: number;
  hardGatePass: number;
  avgSoftScore: number;
  verdicts: Record<string, number>;
}

interface RunResult {
  runId: string;
  timestamp: string;
  configVersion: string;
  strategyPack: Record<string, unknown> | null;
  summary: {
    totalCases: number;
    hardGatePassRate: string;
    datasetSummary: Record<string, DatasetSummary>;
  };
  cases: Record<string, CaseResult>;
}

interface TestSet {
  id: string;
  name: string;
  dataset: string;
  riskLevel: string;
  tags: string[];
  prompt: string;
  category: string;
  difficulty: string;
  persona: string;
  personaDescription: string;
  failureHistory?: { runId: string; date: string; verdict: string; reason: string }[];
}

interface BenchmarkData {
  config: {
    version: string;
    softDimensions: Record<string, { label: string; max: number }>;
    riskThresholds: Record<string, { passScore: number; regressTolerance: number }>;
    datasetWeights: Record<string, number>;
  };
  testSets: Record<string, TestSet>;
  latest: RunResult | null;
  history: { runId: string; timestamp: string; summary: RunResult['summary'] }[];
}

const benchmark = rawBenchmark as BenchmarkData;

const DATASET_META: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  gold: { label: '核心场景', color: '#D97706', bg: 'rgba(217,119,6,0.08)', desc: '高价值典型页面，每轮必须稳定通过' },
  regression: { label: '回归验证', color: '#DC2626', bg: 'rgba(220,38,38,0.08)', desc: '曾经出过问题的用例，防止旧问题复发' },
  failure: { label: '高风险场景', color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', desc: '复杂长尾场景，测试系统能力边界' },
  exploration: { label: '探索性', color: '#2563EB', bg: 'rgba(37,99,235,0.08)', desc: '新场景探索，发现潜在改进方向' },
};

const RISK_META: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: '低风险', color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  medium: { label: '中风险', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  high: { label: '高风险', color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
};

const VERDICT_META: Record<string, { label: string; icon: string; color: string }> = {
  improved: { label: '改善', icon: '↑', color: '#10B981' },
  unchanged: { label: '持平', icon: '─', color: '#6B7280' },
  regressed: { label: '退步', icon: '↓', color: '#F59E0B' },
  FAIL: { label: '失败', icon: '✗', color: '#EF4444' },
};

const SOFT_DIM_LABELS: Record<string, string> = {
  'component-identity': '组件使用',
  'business-understanding': '业务理解',
  'design-language': '设计规范',
  'state-coverage': '状态覆盖',
  implementability: '可落地性',
  robustness: '稳定性',
};

const CATEGORY_LABELS: Record<string, string> = {
  dashboard: '仪表盘',
  list: '列表页',
  config: '配置页',
  detail: '详情页',
};

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  easy: { bg: 'rgba(16,185,129,0.08)', text: '#10B981', label: '简单' },
  medium: { bg: 'rgba(245,158,11,0.08)', text: '#F59E0B', label: '中等' },
  hard: { bg: 'rgba(239,68,68,0.08)', text: '#EF4444', label: '困难' },
};

function getScoreColor(score: number): string {
  if (score >= 85) return '#10B981';
  if (score >= 70) return '#F59E0B';
  return '#EF4444';
}

function Badge({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <span className="text-[11px] px-2 py-px rounded whitespace-nowrap" style={{ color, background: bg }}>
      {text}
    </span>
  );
}

function HardGateBadge({ passed }: { passed: boolean }) {
  return (
    <span
      className="text-[11px] font-semibold tracking-[0.5px] px-2 py-0.5 rounded"
      style={{
        color: passed ? '#10B981' : '#EF4444',
        background: passed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
      }}
    >
      {passed ? '通过' : '未通过'}
    </span>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const meta = VERDICT_META[verdict] || VERDICT_META.unchanged;
  return (
    <span
      className="text-[11px] font-semibold px-2 py-0.5 rounded"
      style={{
        color: meta.color,
        background: `${meta.color}14`,
      }}
    >
      {meta.icon} {meta.label}
    </span>
  );
}

function ScoreBar({ score, max, label, color }: { score: number; max: number; label: string; color?: string }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  const barColor = color || getScoreColor(pct);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-[rgba(0,0,0,0.5)] w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[rgba(0,0,0,0.04)] rounded-[3px] overflow-hidden">
        <div
          className="h-full rounded-[3px] transition-[width] duration-300"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      <span className="text-[11px] font-semibold w-10 text-right" style={{ color: barColor }}>
        {score}/{max}
      </span>
    </div>
  );
}

function RadarChart({ data, size = 240 }: { data: { label: string; value: number; max: number }[]; size?: number }) {
  if (data.length < 3) return null;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 36;
  const levels = 4;
  const angleStep = (2 * Math.PI) / data.length;

  const getPoint = (index: number, r: number) => ({
    x: cx + r * Math.sin(index * angleStep),
    y: cy - r * Math.cos(index * angleStep),
  });

  const gridLines = Array.from({ length: levels }, (_, i) => {
    const r = (radius * (i + 1)) / levels;
    return data.map((_, j) => getPoint(j, r)).map((p) => `${p.x},${p.y}`).join(' ');
  });

  const dataPoints = data.map((d, i) => {
    const ratio = d.max > 0 ? d.value / d.max : 0;
    return getPoint(i, radius * Math.min(1, ratio));
  });
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridLines.map((points, i) => (
        <polygon key={i} points={points} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
      ))}
      {data.map((_, i) => {
        const p = getPoint(i, radius);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />;
      })}
      <polygon points={dataPath} fill="rgba(59,130,246,0.15)" stroke="#3B82F6" strokeWidth="1.5" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3B82F6" />
      ))}
      {data.map((d, i) => {
        const p = getPoint(i, radius + 18);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            style={{ fontSize: 10, fill: 'rgba(0,0,0,0.5)' }}>
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

function CaseCardV2({ id, result, testSet }: { id: string; result: CaseResult; testSet?: TestSet }) {
  const diff = testSet?.difficulty || 'medium';
  const diffStyle = DIFFICULTY_COLORS[diff] || DIFFICULTY_COLORS.medium;
  const riskMeta = RISK_META[result.riskLevel] || RISK_META.medium;

  return (
    <div
      className="px-5 py-4 bg-white rounded-[10px] border"
      style={{
        borderColor: result.hardGate.passed ? 'rgba(0,0,0,0.08)' : 'rgba(239,68,68,0.2)',
        opacity: result.verdict === 'FAIL' ? 0.85 : 1,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[15px] font-semibold text-[rgba(0,0,0,0.85)]">
            {testSet?.name || id}
          </span>
          {testSet?.category && <Badge text={CATEGORY_LABELS[testSet.category] || testSet.category} color="rgba(0,0,0,0.5)" bg="rgba(0,0,0,0.04)" />}
          <Badge text={diffStyle.label} color={diffStyle.text} bg={diffStyle.bg} />
          <Badge text={riskMeta.label} color={riskMeta.color} bg={riskMeta.bg} />
          {testSet?.persona && (
            <Badge text={testSet.persona}
              color={testSet.persona === 'P50' ? '#8B5CF6' : '#3B82F6'}
              bg={testSet.persona === 'P50' ? 'rgba(139,92,246,0.08)' : 'rgba(59,130,246,0.08)'} />
          )}
        </div>
        <div className="flex items-center gap-2">
          <HardGateBadge passed={result.hardGate.passed} />
          <VerdictBadge verdict={result.verdict} />
        </div>
      </div>

      {!result.hardGate.passed && (
        <div
          className="px-3 py-2 mb-3 rounded-md bg-[rgba(239,68,68,0.04)] border border-[rgba(239,68,68,0.1)]"
        >
          <div className="text-xs font-semibold text-[#EF4444] mb-1">基础合规未通过</div>
          {Object.entries(result.hardGate.details)
            .filter(([, d]) => !d.passed)
            .map(([key, d]) => (
              <div key={key} className="text-[11px] text-[rgba(0,0,0,0.5)] leading-[1.6]">
                ✗ {key}: {JSON.stringify(d).slice(0, 80)}
              </div>
            ))}
        </div>
      )}

      {result.softScore && (
        <div className="flex flex-col gap-1.5" style={{ opacity: result.hardGate.passed ? 1 : 0.4 }}>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-xs text-[rgba(0,0,0,0.4)]">质量评分</span>
            <span className="text-lg font-bold" style={{ color: getScoreColor((result.softScore.total / result.softScore.max) * 100) }}>
              {result.softScore.total}
            </span>
            <span className="text-xs text-[rgba(0,0,0,0.25)]">/ {result.softScore.max}</span>
          </div>
          {Object.entries(result.softScore.breakdown).map(([key, dim]) => (
            <ScoreBar key={key} score={dim.score} max={dim.max}
              label={SOFT_DIM_LABELS[key] || benchmark.config?.softDimensions?.[key]?.label || key} />
          ))}
        </div>
      )}
    </div>
  );
}

function DatasetSection({ dataset, cases, testSets }: {
  dataset: string;
  cases: [string, CaseResult][];
  testSets: Record<string, TestSet>;
}) {
  const meta = DATASET_META[dataset] || DATASET_META.exploration;
  const passCount = cases.filter(([, c]) => c.hardGate.passed).length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Badge text={meta.label} color={meta.color} bg={meta.bg} />
        <span className="text-[13px] text-[rgba(0,0,0,0.5)]">{meta.desc}</span>
        <span className="text-xs text-[rgba(0,0,0,0.35)] ml-auto">
          合规 {passCount}/{cases.length}
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {cases.map(([id, result]) => (
          <CaseCardV2 key={id} id={id} result={result} testSet={testSets[id]} />
        ))}
      </div>
    </div>
  );
}

export default () => {
  const latest = benchmark.latest;
  const testSets = benchmark.testSets || {};
  const config = benchmark.config;
  const [activeDataset, setActiveDataset] = useState<string | null>(null);

  const radarData = useMemo(() => {
    if (!latest?.cases) return [];
    const softCases = Object.values(latest.cases).filter((c) => c.softScore?.breakdown) as CaseResult[];
    if (softCases.length === 0) return [];

    const dimKeys = Object.keys(softCases[0].softScore!.breakdown);
    return dimKeys.map((key) => {
      let totalScore = 0;
      let totalMax = 0;
      for (const c of softCases) {
        const dim = c.softScore?.breakdown[key];
        if (dim) { totalScore += dim.score; totalMax += dim.max; }
      }
      return {
        label: SOFT_DIM_LABELS[key] || config?.softDimensions?.[key]?.label || key,
        value: totalScore,
        max: totalMax,
      };
    });
  }, [latest, config]);

  const groupedCases = useMemo(() => {
    if (!latest?.cases) return {};
    const groups: Record<string, [string, CaseResult][]> = {};
    for (const [id, c] of Object.entries(latest.cases)) {
      const ds = c.dataset || 'exploration';
      if (!groups[ds]) groups[ds] = [];
      groups[ds].push([id, c]);
    }
    return groups;
  }, [latest]);

  if (!latest) {
    return (
      <div className="p-10 text-center text-[rgba(0,0,0,0.3)]">
        暂无评测数据。运行 <code>npm run benchmark</code> 生成第一轮评测。
      </div>
    );
  }

  const summary = latest.summary;
  const dsSummary = summary.datasetSummary || {};
  const visibleDatasets = activeDataset
    ? [activeDataset]
    : ['gold', 'regression', 'failure', 'exploration'].filter((ds) => groupedCases[ds]?.length);

  const verdictCounts = { improved: 0, unchanged: 0, regressed: 0, FAIL: 0 };
  for (const c of Object.values(latest.cases)) {
    verdictCounts[c.verdict] = (verdictCounts[c.verdict] || 0) + 1;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between px-7 py-6 bg-white rounded-xl border border-[rgba(0,0,0,0.08)]">
        <div>
          <h1 className="text-[22px] font-bold text-[rgba(0,0,0,0.88)] m-0">
            交付测量总览
          </h1>
          <p className="text-[13px] text-[rgba(0,0,0,0.4)] mt-1 mb-0">
            追踪每轮迭代的质量变化，确保系统稳定交付
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge text={`第 ${latest.runId} 轮`} color="rgba(0,0,0,0.4)" bg="rgba(0,0,0,0.03)" />
        </div>
      </div>

      {/* Hard Gate Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-[10px] border border-[rgba(0,0,0,0.08)] text-center">
          <div className="text-[28px] font-bold" style={{ color: summary.hardGatePassRate === `${summary.totalCases}/${summary.totalCases}` ? '#10B981' : '#F59E0B' }}>
            {summary.hardGatePassRate}
          </div>
          <div className="text-xs text-[rgba(0,0,0,0.45)] mt-1">基础合规</div>
        </div>
        <div className="p-5 bg-white rounded-[10px] border border-[rgba(0,0,0,0.08)] text-center">
          <div className="text-[28px] font-bold text-[#10B981]">{verdictCounts.improved}</div>
          <div className="text-xs text-[rgba(0,0,0,0.45)] mt-1">改善</div>
        </div>
        <div className="p-5 bg-white rounded-[10px] border border-[rgba(0,0,0,0.08)] text-center">
          <div className="text-[28px] font-bold text-[#6B7280]">{verdictCounts.unchanged}</div>
          <div className="text-xs text-[rgba(0,0,0,0.45)] mt-1">持平</div>
        </div>
        <div className="p-5 bg-white rounded-[10px] border border-[rgba(0,0,0,0.08)] text-center">
          <div className="text-[28px] font-bold text-[#EF4444]">{verdictCounts.regressed + verdictCounts.FAIL}</div>
          <div className="text-xs text-[rgba(0,0,0,0.45)] mt-1">退步 / 失败</div>
        </div>
      </div>

      {/* Dataset Summary + Radar */}
      <div className="grid grid-cols-2 gap-4">
        <div className="px-6 py-5 bg-white rounded-[10px] border border-[rgba(0,0,0,0.08)]">
          <h3 className="text-sm font-semibold text-[rgba(0,0,0,0.75)] mt-0 mx-0 mb-4">
            分类概览
          </h3>
          <div className="flex flex-col gap-2.5">
            {['gold', 'regression', 'failure', 'exploration'].map((ds) => {
              const meta = DATASET_META[ds];
              const s = dsSummary[ds];
              if (!s || s.total === 0) return null;
              const isActive = activeDataset === ds;
              return (
                <div key={ds}
                  onClick={() => setActiveDataset(isActive ? null : ds)}
                  className="px-3.5 py-2.5 rounded-lg cursor-pointer border transition-all duration-200"
                  style={{
                    background: isActive ? meta.bg : 'rgba(0,0,0,0.015)',
                    borderColor: isActive ? `${meta.color}30` : 'transparent',
                  }}>
                  <div className="flex items-center justify-between">
                    <Badge text={meta.label} color={meta.color} bg={meta.bg} />
                    <span className="text-xs text-[rgba(0,0,0,0.45)]">
                      合规 {s.hardGatePass}/{s.total} · 平均 {s.avgSoftScore} 分
                    </span>
                  </div>
                  <div className="flex gap-2 mt-1.5">
                    {Object.entries(s.verdicts).filter(([, v]) => v > 0).map(([k, v]) => {
                      const vm = VERDICT_META[k];
                      return (
                        <span key={k} className="text-[11px]" style={{ color: vm?.color || '#999' }}>
                          {vm?.icon} {v}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="px-6 py-5 bg-white rounded-[10px] border border-[rgba(0,0,0,0.08)]">
          <h3 className="text-sm font-semibold text-[rgba(0,0,0,0.75)] mt-0 mx-0 mb-4">
            质量维度分布
          </h3>
          <div className="flex justify-center">
            <RadarChart data={radarData} size={260} />
          </div>
        </div>
      </div>

      {/* Risk Level Summary */}
      <div className="px-6 py-4 bg-white rounded-[10px] border border-[rgba(0,0,0,0.08)] flex gap-4">
        {(['low', 'medium', 'high'] as const).map((risk) => {
          const meta = RISK_META[risk];
          const riskCases = Object.values(latest.cases).filter((c) => c.riskLevel === risk);
          if (riskCases.length === 0) return null;
          const passed = riskCases.filter((c) => c.hardGate.passed).length;
          const threshold = config?.riskThresholds?.[risk];
          return (
            <div key={risk} className="flex-1 px-3.5 py-2.5 rounded-lg" style={{ background: meta.bg }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Badge text={meta.label} color={meta.color} bg="transparent" />
                <span className="text-[11px] text-[rgba(0,0,0,0.35)]">
                  及格线 {threshold?.passScore || '?'} 分 · 允许波动 ±{threshold?.regressTolerance || '?'}
                </span>
              </div>
              <div className="text-lg font-bold" style={{ color: meta.color }}>{passed}/{riskCases.length}</div>
            </div>
          );
        })}
      </div>

      {/* Case List by Dataset */}
      <div className="flex flex-col gap-6">
        {visibleDatasets.map((ds) => {
          const cases = groupedCases[ds];
          if (!cases || cases.length === 0) return null;
          return <DatasetSection key={ds} dataset={ds} cases={cases} testSets={testSets} />;
        })}
      </div>

      {/* Legend */}
      <div className="px-5 py-3.5 bg-[rgba(0,0,0,0.02)] rounded-lg flex gap-5 flex-wrap">
        {Object.entries(VERDICT_META).map(([key, meta]) => (
          <div key={key} className="flex items-center gap-1">
            <span className="font-semibold text-xs" style={{ color: meta.color }}>{meta.icon}</span>
            <span className="text-[11px] text-[rgba(0,0,0,0.45)]">{meta.label}</span>
          </div>
        ))}
        <div className="w-px bg-[rgba(0,0,0,0.08)]" />
        {Object.entries(DATASET_META).map(([key, meta]) => (
          <div key={key} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
            <span className="text-[11px] text-[rgba(0,0,0,0.45)]">{meta.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
