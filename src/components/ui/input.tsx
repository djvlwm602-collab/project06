/**
 * Role: 텍스트 입력 필드 — 필터 검색, 폼 입력 공통
 * Key Features: 레이블 옵션, prefix 아이콘 슬롯
 */
import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  prefixIcon?: React.ReactNode;
  wrapperClassName?: string;
  className?: string;
}

export function Input({
  label,
  prefixIcon,
  className,
  wrapperClassName,
  ...props
}: InputProps) {
  return (
    <div className={cn('flex items-center gap-3', wrapperClassName)}>
      {label && (
        <span className="text-[14px] font-semibold text-text-primary shrink-0">
          {label}
        </span>
      )}
      <div className="relative">
        {prefixIcon && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
            {prefixIcon}
          </span>
        )}
        <input
          {...props}
          className={cn(
            'border border-border rounded-sm text-[14px] text-text-primary bg-surface',
            'px-3 py-1.5 focus:outline-none focus:border-text-primary transition-colors',
            'placeholder:text-text-secondary',
            prefixIcon && 'pl-8',
            className,
          )}
        />
      </div>
    </div>
  );
}
