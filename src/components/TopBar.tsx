import React from 'react';

interface TopBarProps {
  onCreateTask: () => void;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function TopBar({ onCreateTask, title, subtitle, actions }: TopBarProps) {
  return (
    <header className="h-14 bg-bg flex items-center justify-between px-6 sticky top-0 z-10 shrink-0">
      {/* 좌측: 페이지 타이틀 */}
      <div className="flex items-baseline gap-3 min-w-0">
        {title && (
          <h1 className="text-[17px] font-semibold text-text-primary tracking-tight shrink-0">{title}</h1>
        )}
        {subtitle && (
          <span className="text-[13px] text-text-secondary truncate">{subtitle}</span>
        )}
      </div>

      {/* 우측 액션 */}
      <div className="flex items-center gap-4 shrink-0">
        {actions && <div className="flex items-center">{actions}</div>}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text-secondary text-sm">10:00</span>
          <button className="bg-bg hover:bg-border text-text-secondary text-xs px-2 py-1 rounded-sm border border-border transition-colors font-medium">
            연장
          </button>
        </div>

        <button className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-xs hover:bg-primary-hover transition-colors">
          김
        </button>
      </div>
    </header>
  );
}
