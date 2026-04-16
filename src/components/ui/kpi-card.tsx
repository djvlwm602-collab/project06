/**
 * Role: KPI 수치 카드 — 대시보드, 배정 완료 DB 등에서 공통 사용
 * Key Features: 제목, 수치, 트렌드(양/음) 표시
 */
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  trend?: string;
  isPositive?: boolean;
  className?: string;
}

export function KpiCard({ title, value, trend, isPositive, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-lg p-4 flex flex-col',
        className,
      )}
    >
      <span className="text-[13px] font-medium text-text-secondary mb-2">{title}</span>
      <div className="flex items-end justify-between">
        <span className="text-[22px] font-semibold text-text-primary">{value}</span>
        {trend && (
          <div
            className={cn(
              'flex items-center text-[12px] font-medium px-1.5 py-0.5 rounded-sm',
              isPositive
                ? 'text-success bg-success-subtle'
                : 'text-danger bg-danger-subtle',
            )}
          >
            {isPositive ? (
              <ArrowUpRight size={13} className="mr-0.5" />
            ) : (
              <ArrowDownRight size={13} className="mr-0.5" />
            )}
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
