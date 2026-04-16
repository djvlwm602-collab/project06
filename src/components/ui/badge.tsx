/**
 * Role: 상태/태그 표시 뱃지 — 고객 태그, 승인 상태, 활동 상태 등
 * Key Features: default/primary/success/danger/warning variant
 */
import React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'primary' | 'success' | 'danger' | 'warning';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-bg text-text-secondary border border-border',
  primary:  'bg-primary-subtle text-primary',
  success:  'bg-success-subtle text-success',
  danger:   'bg-danger-subtle text-danger',
  // TODO: warning 토큰 미정의 — 임시로 Tailwind 색상 사용
  warning:  'bg-amber-50 text-amber-700',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
