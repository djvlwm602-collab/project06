/**
 * Role: 커스텀 화살표가 있는 select 래퍼 — 필터, 폼 셀렉트 공통
 * Key Features: 레이블 옵션, 너비 조절, 화살표 자동 포함
 */
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SelectFieldProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label?: string;
  width?: string;
  wrapperClassName?: string;
  className?: string;
  children: React.ReactNode;
}

export function SelectField({
  label,
  width = 'w-48',
  wrapperClassName,
  children,
  className,
  ...props
}: SelectFieldProps) {
  return (
    <div className={cn('flex items-center gap-3', wrapperClassName)}>
      {label && (
        <span className="text-[14px] font-semibold text-text-primary shrink-0">
          {label}
        </span>
      )}
      <div className={cn('relative', width)}>
        <select
          {...props}
          className={cn(
            'w-full appearance-none border border-border rounded-sm',
            'text-[14px] text-text-primary bg-surface',
            'pl-3 pr-8 py-1.5 focus:outline-none focus:border-text-primary',
            'cursor-pointer transition-colors',
            className,
          )}
        >
          {children}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
        />
      </div>
    </div>
  );
}
