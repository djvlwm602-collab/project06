/**
 * Role: 테이블 래퍼 — thead/tbody 스타일 일관화
 * Key Features: 면 기반 줄무늬(짝수행 bg-bg), 행 구분선 없음, 헤더 하단선 유지
 */
import React from 'react';
import { cn } from '../../lib/utils';

interface DataTableProps {
  children: React.ReactNode;
  strongTopBorder?: boolean;
  className?: string;
}

export function DataTable({ children, className }: DataTableProps) {
  return (
    <div className={cn('border border-gray-200 rounded-lg overflow-hidden bg-white', className)}>
      <table className="w-full text-[14px] text-center">{children}</table>
    </div>
  );
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
  return (
    /* 헤더 하단선만 유지 — 헤더/데이터 구분 */
    <thead className="sticky top-0 z-10 [&>tr>th]:border-b [&>tr>th]:border-gray-100">
      {children}
    </thead>
  );
}

export function DataTableHeadCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={cn('py-3.5 px-3 font-semibold text-text-secondary text-[13px] bg-white', className)}>
      {children}
    </th>
  );
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  /* 행 구분선 제거 — 홀수행 옅은 회색(#FAFBFC) 줄무늬로 구분 */
  return <tbody className="bg-white [&>tr:nth-child(odd)]:bg-[#FAFBFC]">{children}</tbody>;
}

export function DataTableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn('hover:!bg-[#F3F4F6] transition-colors', className)}>{children}</tr>
  );
}

export function DataTableCell({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <td className={cn('py-3.5 px-3 font-medium text-text-secondary', className)} onClick={onClick}>{children}</td>
  );
}
