/**
 * Role: 재사용 가능한 버튼 — 검색/저장/삭제 등 모든 버튼의 기반
 * Key Features: primary, secondary, ghost, danger variant; size sm/md/lg
 */
import React from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover active:bg-primary-hover',
  secondary:
    'bg-gray-500 text-white hover:bg-gray-600 active:bg-gray-700',
  ghost:
    'bg-transparent text-text-secondary border border-border hover:bg-bg active:bg-border',
  danger:
    'bg-danger text-white hover:bg-danger/85 active:bg-danger/75',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-1.5 text-[13px]',
  md: 'px-8 py-1.5 text-[14px]',
  lg: 'px-10 py-2.5 text-[14px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-sm transition-colors',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </button>
  );
}
