/**
 * Role: 상단 현황 요약 바 — "라벨 N단위" 항목을 세로 구분선으로 나열
 * Key Features: 항목 배열 주입, 자동 구분선 삽입, 값 강조 (font-semibold)
 * Dependencies: 공용 디자인 토큰
 */
import React from 'react';

export interface SummaryStatsItem {
  label: string;
  value: string | number;
  unit?: string;
}

interface SummaryStatsProps {
  items: SummaryStatsItem[];
}

export function SummaryStats({ items }: SummaryStatsProps) {
  return (
    <div className="flex items-center gap-4 text-[14px]">
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {/* 항목 사이 세로 구분선 — 첫 항목 앞에는 생략 */}
          {i > 0 && <span className="w-px h-3 bg-border-strong" />}
          <span className="text-text-secondary">
            {item.label}{' '}
            <span className="text-text-primary font-semibold">
              {item.value}
              {item.unit ?? ''}
            </span>
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
