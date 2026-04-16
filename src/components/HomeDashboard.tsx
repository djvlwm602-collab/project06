/**
 * Role: 홈 대시보드 — 조직별 리드타임·성과품질·미대응 현황 시각화
 * Key Features: 섹션별 동질 지표끼리 묶어 차트-KPI 1:1 대응 구조
 * Dependencies: PageLayout, recharts, Footer
 * Notes:
 *   - 리드타임: 단위 분리(시간/건수) → 좌우 이중 차트
 *   - 성과품질: % 계열만 차트, 이종단위(총배정수·통화시간)는 KPI 전용
 *   - 미대응: 동일 단위 → 가로 막대차트로 비중 표현
 */
import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { PageLayout, TreeNode } from './layout';
import { FilterBox } from './layout/filter-box';
import { DateRangeChip } from './ui/date-range-chip';
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Footer } from './Footer';

// ── 리드 타임 ──────────────────────────────────────────────
// 시간별 건수 분포 — X축: 시간(h→일 환산), Y축: 건수
// KPI 값과 일치: 1일이내(0일)=50건, 2일(1일)=30건, 3일(2일)=20건, 4일이상(3일)=10건
const leadTimeByHour = [
  // 0일 구간 (0~24h) — 세밀하게
  { hour: 0,  value: 50 },
  { hour: 2,  value: 49 },
  { hour: 4,  value: 48 },
  { hour: 6,  value: 47 },
  { hour: 8,  value: 46 },
  { hour: 10, value: 44 },
  { hour: 12, value: 42 },
  { hour: 14, value: 40 },
  { hour: 16, value: 38 },
  { hour: 18, value: 36 },
  { hour: 20, value: 34 },
  { hour: 22, value: 32 },
  { hour: 24, value: 30 },
  // 1일 구간 (24~48h)
  { hour: 30, value: 28 },
  { hour: 36, value: 26 },
  { hour: 42, value: 22 },
  { hour: 48, value: 20 },
  // 2일 구간 (48~72h)
  { hour: 54, value: 18 },
  { hour: 60, value: 15 },
  { hour: 66, value: 12 },
  { hour: 72, value: 10 },
  // 3일 구간 (72~96h)
  { hour: 78, value: 8 },
  { hour: 84, value: 7 },
  { hour: 90, value: 6 },
  { hour: 96, value: 5 },
];

// 시간 → 툴팁용 포맷: "10:00" or "1일 10:00"
const formatHourTooltip = (h: number) => {
  const days = Math.floor(h / 24);
  const hours = h % 24;
  const timeStr = `${String(hours).padStart(2, '0')}:00`;
  return days > 0 ? `${days}일 ${timeStr}` : timeStr;
};

// 평균 반응 시간 23시간 → X축 세로 기준선 (일 환산)
const avgResponseDay = 23 / 24; // ≈ 0.96일

// 리드타임 KPI 항목
const leadTimeKpis = [
  { label: '1일 이내', value: 50 },
  { label: '2일',      value: 30 },
  { label: '3일',      value: 20 },
  { label: '4일 이상', value: 10 },
];

// ── 성과/품질 ───────────────────────────────────────────────
// 퍼널 데이터: 시도 → 성공 → 유효 전환 구조
const funnelSteps = [
  { label: '평균 통화 시도율', rate: 82, change: '+2.1%', isPositive: true  },
  { label: '평균 통화 성공율', rate: 45, change: '-0.5%', isPositive: false },
  { label: '평균 유효 통화율', rate: 28, change: '+1.2%', isPositive: true  },
];

// 이종 단위 지표 — 참고 KPI
const otherPerformanceKpis = [
  { label: '총 배정 수',     value: '2,000건', change: '+150',  isPositive: true  },
  { label: '평균 통화 시간', value: '30분',    change: '+0:45', isPositive: true  },
];

// ── 미 대응 상황 ────────────────────────────────────────────
const unresponsiveKpis = [
  { label: '~1일',    value: 10, change: '-2', isPositive: true  },
  { label: '2~4일',   value: 15, change: '+3', isPositive: false },
  { label: '5~7일',   value: 12, change: '-1', isPositive: true  },
  { label: '8~10일',  value:  8, change: '+5', isPositive: false },
  { label: '10일~',   value:  5, change: '-4', isPositive: true  },
];

// 미대응 건수 추세 (주차별)
const unresponsiveHistory = [
  { date: '01.01', value: 38 },
  { date: '01.08', value: 42 },
  { date: '01.15', value: 50 },
  { date: '01.22', value: 46 },
  { date: '01.29', value: 50 },
];

// ── 조직 트리 ───────────────────────────────────────────────
const dashboardTreeNodes: TreeNode[] = [
  {
    id: 'munjeong', label: '문정 사업단',
    children: [
      { id: 'branch-a', label: 'A 지점', children: [
        { id: 'team-a1', label: 'A 팀' },
        { id: 'team-a2', label: 'B 팀' },
        { id: 'team-a3', label: 'C 팀' },
      ]},
      { id: 'branch-b', label: 'B 지점', children: [
        { id: 'team-b1', label: '1 팀' },
        { id: 'team-b2', label: '2 팀' },
      ]},
    ],
  },
  { id: 'gangnam', label: '강남 사업단', children: [
    { id: 'gangnam-a', label: 'A 팀' },
    { id: 'gangnam-b', label: 'B 팀' },
  ]},
  { id: 'seocho', label: '서초 지점', children: [
    { id: 'seocho-a', label: 'A 팀' },
    { id: 'seocho-b', label: 'B 팀' },
  ]},
  { id: 'seolleung-1', label: '선릉 1팀' },
  { id: 'seolleung-2', label: '선릉 2팀' },
];

// ── 메인 컴포넌트 ────────────────────────────────────────────
export function HomeDashboard() {
  const [activeTreeId, setActiveTreeId] = useState('team-a1');
  const [startDate, setStartDate] = useState('2026-03-14');
  const [endDate, setEndDate] = useState('2026-04-14');

  const handleReset = () => {
    setStartDate('2026-03-14');
    setEndDate('2026-04-14');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg overflow-hidden">
      <PageLayout
        showSidebar
        sidebarTitle="흥국화재"
        treeNodes={dashboardTreeNodes}
        activeTreeId={activeTreeId}
        onTreeSelect={setActiveTreeId}
      >
        <div className="flex-1 flex flex-col overflow-hidden bg-bg">
          <div className="flex-1 overflow-y-auto">
            <div className="min-h-full flex flex-col pb-5">

            <div className="px-8 pt-6 pb-2 space-y-8">

            {/* 기간 검색 필터 */}
            <FilterBox
              noWrapper
              onSearch={() => {}}
              onReset={handleReset}
            >
              <DateRangeChip
                startDate={startDate}
                endDate={endDate}
                onApply={(s, e) => { setStartDate(s); setEndDate(e); }}
              />
            </FilterBox>

              {/* ── 리드 타임 ────────────────────────────── */}
              <SectionCard title="리드 타임">
                {/* KPI 행: 박스형 카드 정렬 */}
                <div className="flex gap-3 p-4">
                  <div className="w-[220px] shrink-0 px-4 py-3 border border-gray-100 rounded-lg bg-white">
                    <div className="text-xs text-gray-400 mb-1">평균 반응 시간</div>
                    <div className="flex items-end gap-1.5">
                      <span className="text-xl font-semibold text-gray-900">23시간</span>
                      <TrendBadge trend="-1.5h" isPositive={true} />
                    </div>
                  </div>
                  {leadTimeKpis.map((item, i) => (
                    <div key={i} className="flex-1 px-4 py-3 border border-gray-100 rounded-lg bg-white">
                      <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                      <span className="text-xl font-semibold text-gray-900">{item.value}건</span>
                    </div>
                  ))}
                </div>

                {/* 일자별 건수 차트 — X축: 일자, Y축: 건수, 평균반응시간까지 면 채우기 */}
                <div className="px-5 py-4">
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={leadTimeByHour} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="avgFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.03} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="hour" type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} padding={{ left: 15, right: 15 }} domain={[0, 96]} ticks={[0, 24, 48, 72, 96]} tickFormatter={(v) => `${v / 24}일`} />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#9ca3af', textAnchor: 'end' }}
                          tickFormatter={(v) => `${v}건`}
                          width={55}
                        />
                        <ReferenceLine x={23} stroke="#3b82f6" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: '평균 23시간', position: 'insideTopRight', fontSize: 11, fill: '#3b82f6', fontWeight: 600, dy: -5 }} />
                        <Tooltip
                          labelFormatter={(h: any) => formatHourTooltip(h)}
                          formatter={(v: any) => [`${v}건`, '']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          strokeWidth={2.5}
                          fill="url(#avgFill)"
                          dot={false}
                          activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </SectionCard>

              {/* ── 성과/품질 ────────────────────────────── */}
              <SectionCard title="성과/품질">
                {/* KPI 행: 박스형 카드 — 퍼널 3개 + 참고 지표 */}
                <div className="flex gap-3 p-4">
                  {funnelSteps.map((step, i) => (
                    <div key={i} className="flex-1 px-4 py-3 border border-gray-100 rounded-lg bg-white">
                      <div className="text-xs text-gray-400 mb-1">{step.label}</div>
                      <div className="flex items-end gap-1.5">
                        <span className="text-xl font-semibold text-gray-900">{step.rate}%</span>
                        <TrendBadge trend={step.change} isPositive={step.isPositive} />
                      </div>
                    </div>
                  ))}
                  {otherPerformanceKpis.map((kpi, i) => (
                    <div key={`other-${i}`} className="flex-1 px-4 py-3 border border-gray-100 rounded-lg bg-white">
                      <div className="text-xs text-gray-400 mb-1">{kpi.label}</div>
                      <div className="flex items-end gap-1.5">
                        <span className="text-xl font-semibold text-gray-900">{kpi.value}</span>
                        <TrendBadge trend={kpi.change} isPositive={kpi.isPositive} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 퍼널형 막대 차트 — X축/Y축 + 그리드 배경 */}
                <div className="px-5 py-4">
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={funnelSteps.map(s => ({ name: s.label.replace('평균 ', ''), value: s.rate }))}
                        margin={{ top: 10, right: 20, left: -20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#9ca3af' }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#9ca3af', textAnchor: 'end' }}
                          tickFormatter={(v) => `${v}%`}
                          width={55}
                          domain={[0, 100]}
                        />
                        <Tooltip
                          formatter={(v: any) => [`${v}%`, '']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                        />
                        <Bar
                          dataKey="value"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                          barSize={48}
                          fillOpacity={0.75}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </SectionCard>

              {/* ── 미 대응 상황 ─────────────────────────── */}
              <SectionCard title="미 대응 상황">
                {/* KPI 행: 박스형 카드 정렬 */}
                <div className="flex gap-3 p-4">
                  {unresponsiveKpis.map((item, i) => (
                    <div key={i} className="flex-1 px-4 py-3 border border-gray-100 rounded-lg bg-white">
                      <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                      <div className="flex items-end gap-1.5">
                        <span className="text-xl font-semibold text-gray-900">{item.value}건</span>
                        <TrendBadge trend={item.change} isPositive={item.isPositive} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 미대응 건수 추세 차트 */}
                <div className="px-5 py-4">
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={unresponsiveHistory} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="unrespFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.03} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} padding={{ left: 15, right: 15 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', textAnchor: 'end' }} tickFormatter={(v) => `${v}건`} width={55} />
                        <Tooltip
                          formatter={(v: any) => [`${v}건`, '미대응 총 건수']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          strokeWidth={2.5}
                          fill="url(#unrespFill)"
                          dot={false}
                          activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </SectionCard>

            </div>
            <div className="flex-1 min-h-[50px]" />
            <Footer />
            </div>

          </div>
        </div>
      </PageLayout>
    </div>
  );
}

// ── 공통 컴포넌트 ────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        {title}
      </h3>
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        {children}
      </div>
    </section>
  );
}

function TrendBadge({ trend, isPositive }: { trend: string; isPositive: boolean }) {
  return (
    <span className={cn(
      'text-xs flex items-center leading-none mb-px shrink-0',
      isPositive ? 'text-emerald-600' : 'text-rose-500',
    )}>
      {isPositive
        ? <ArrowUpRight size={11} className="mr-px" />
        : <ArrowDownRight size={11} className="mr-px" />}
      {trend}
    </span>
  );
}
