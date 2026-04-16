/**
 * Role: 페이지 상단 헤더 행 — 제목, 부제목, 우측 액션 영역 표준화
 * Key Features: title, subtitle, actions(우측 슬롯)
 */
import React from 'react';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'px-6 py-5 border-b border-border bg-bg',
        'flex items-center justify-between shrink-0',
        className,
      )}
    >
      <div className="flex items-end gap-4">
        <h1 className="text-[19px] font-semibold text-text-primary tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <span className="text-[14px] text-text-secondary mb-0.5">{subtitle}</span>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
