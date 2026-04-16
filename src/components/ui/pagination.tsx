/**
 * Role: 페이지네이션 — 목록 페이지 하단 공통
 * Key Features: 현재 페이지 하이라이트, 앞/뒤/처음/끝 이동
 */
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage = 1,
  totalPages = 10,
  onPageChange,
  className,
}: PaginationProps) {
  const pages = Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1);

  return (
    <div className={cn('flex items-center justify-center gap-1 mt-6', className)}>
      <button
        onClick={() => onPageChange?.(1)}
        className="p-1 text-text-secondary hover:text-text-primary transition-colors"
        aria-label="처음 페이지"
      >
        <ChevronsLeft size={16} />
      </button>
      <button
        onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
        className="p-1 text-text-secondary hover:text-text-primary transition-colors mr-1"
        aria-label="이전 페이지"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((num) => (
        <button
          key={num}
          onClick={() => onPageChange?.(num)}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-sm text-[14px] transition-colors',
            num === currentPage
              ? 'bg-primary text-white font-semibold'
              : 'text-text-secondary hover:text-text-primary font-medium',
          )}
        >
          {num}
        </button>
      ))}

      <button
        onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
        className="p-1 text-text-secondary hover:text-text-primary transition-colors ml-1"
        aria-label="다음 페이지"
      >
        <ChevronRight size={16} />
      </button>
      <button
        onClick={() => onPageChange?.(totalPages)}
        className="p-1 text-text-secondary hover:text-text-primary transition-colors"
        aria-label="마지막 페이지"
      >
        <ChevronsRight size={16} />
      </button>
    </div>
  );
}
