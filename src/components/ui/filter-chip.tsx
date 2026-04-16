/**
 * Role: 컴팩트 필터 칩 — 클릭 시 드롭다운 표시, 검색 기능 지원
 * Key Features: 단일/다중 선택, 드롭다운 내 검색, 칩 형태 UI
 * Dependencies: cn, lucide-react
 */
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FilterChipOption {
  value: string;
  label: string;
}

interface FilterChipProps {
  /** 칩에 표시될 필터 이름 */
  label: string;
  /** 선택 가능한 옵션 목록 */
  options: FilterChipOption[];
  /** 현재 선택된 값 (단일) */
  value?: string;
  /** 현재 선택된 값 (다중) */
  values?: string[];
  /** 단일 선택 콜백 */
  onChange?: (value: string) => void;
  /** 다중 선택 콜백 */
  onChangeMulti?: (values: string[]) => void;
  /** 드롭다운 내 검색 입력 활성화 */
  searchable?: boolean;
  /** 다중 선택 모드 */
  multiple?: boolean;
  /** 드롭다운 그리드 열 수 (기본 1) */
  columns?: number;
  className?: string;
}

export function FilterChip({
  label,
  options,
  value,
  values = [],
  onChange,
  onChangeMulti,
  searchable = false,
  multiple = false,
  columns = 1,
  className,
}: FilterChipProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [popupPos, setPopupPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // 드롭다운 열릴 때 검색 입력에 포커스
  useEffect(() => {
    if (open && searchable) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open, searchable]);

  // 현재 선택 표시 텍스트
  const nonAllValues = values.filter(v => v !== '전체');
  const displayText = multiple
    ? values.includes('전체')
      ? '전체'
      : nonAllValues.length === 0
        ? '선택 없음'
        : nonAllValues.join(', ')
    : options.find(o => o.value === value)?.label ?? '전체';

  const isDefault = multiple
    ? values.includes('전체') || values.length === 0
    : !value || value === '전체';

  // 검색 필터링
  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  // "전체" 제외한 실제 옵션 목록
  const nonAllOptions = options.filter(o => o.value !== '전체');
  const allSelected = nonAllOptions.length > 0 && nonAllOptions.every(o => values.includes(o.value));

  const handleSelect = (optValue: string) => {
    if (multiple) {
      if (optValue === '전체') {
        // 전체 토글 — 체크 시 모두 선택, 해제 시 모두 해제
        const isCurrentlyAll = values.includes('전체');
        onChangeMulti?.(isCurrentlyAll ? [] : ['전체', ...nonAllOptions.map(o => o.value)]);
      } else {
        const next = values.includes(optValue)
          ? values.filter(v => v !== optValue && v !== '전체')
          : [...values.filter(v => v !== '전체'), optValue];
        // 개별 선택으로 전부 채워지면 전체도 자동 체크
        const allChecked = nonAllOptions.every(o => next.includes(o.value));
        onChangeMulti?.(allChecked ? ['전체', ...next] : next);
      }
    } else {
      onChange?.(optValue);
      setOpen(false);
      setSearch('');
    }
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* 칩 버튼 */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPopupPos({ top: rect.bottom + 6, left: rect.left });
          }
          setOpen(!open);
        }}
        className={cn(
          'inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-[14px] font-medium border transition-colors whitespace-nowrap',
          open
            ? 'bg-primary-subtle border-primary text-primary'
            : 'bg-surface border-border text-text-secondary hover:border-border-strong',
        )}
      >
        <span>{label}</span>
        <span className={cn(open ? 'text-primary/50' : isDefault ? 'text-text-disabled' : 'text-primary/50')}>·</span>
        <span className={cn('max-w-[120px] truncate', open ? 'text-primary' : 'text-primary')}>{displayText}</span>
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {/* 드롭다운 */}
      {open && (
        <div
          className={cn(
            'fixed bg-surface border border-border rounded-lg shadow-lg z-[9999] max-h-[320px] flex flex-col overflow-hidden',
            columns > 1 ? 'min-w-[280px]' : 'min-w-[180px]',
          )}
          style={{ top: popupPos.top, left: popupPos.left }}
        >
          {/* 검색 입력 */}
          {searchable && (
            <div className="p-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-disabled" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="검색"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-[13px] border border-border rounded-sm bg-bg focus:outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-secondary"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 옵션 목록 */}
          <div className={cn(
            'overflow-y-auto py-1',
            columns > 1 && 'px-1',
          )}>
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-[13px] text-text-disabled text-center">결과 없음</div>
            ) : columns > 1 ? (
              /* 다중 열 그리드 레이아웃 — 전체도 동일 그리드에 포함 */
              <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {filtered.map(opt => {
                  const isSelected = multiple
                    ? values.includes(opt.value)
                    : value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        'text-left px-3 py-2 text-[13px] flex items-center gap-2 hover:bg-bg transition-colors',
                        isSelected && !multiple && 'bg-primary-subtle text-primary font-medium',
                      )}
                    >
                      {multiple && (
                        /* 라인 스타일 체크박스 — 선택 시에도 면 채움 없이 테두리·체크마크만 primary 색 */
                        <span className={cn(
                          'w-4 h-4 rounded-sm border flex items-center justify-center text-[10px] shrink-0',
                          isSelected
                            ? 'border-primary text-primary'
                            : 'border-border-strong',
                        )}>
                          {isSelected && '✓'}
                        </span>
                      )}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* 단일 열 목록 */
              filtered.map(opt => {
                const isSelected = multiple
                  ? values.includes(opt.value)
                  : value === opt.value;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-[13px] flex items-center gap-2 hover:bg-bg transition-colors',
                      isSelected && !multiple && 'bg-primary-subtle text-primary font-medium',
                    )}
                  >
                    {multiple && (
                      <span className={cn(
                        'w-4 h-4 rounded-sm border flex items-center justify-center text-[10px] shrink-0',
                        isSelected
                          ? 'bg-primary border-primary text-white'
                          : 'border-border-strong',
                      )}>
                        {isSelected && '✓'}
                      </span>
                    )}
                    {opt.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
