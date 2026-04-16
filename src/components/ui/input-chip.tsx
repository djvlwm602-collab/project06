/**
 * Role: 인라인 입력 칩 — 칩 안에서 바로 텍스트 입력, 자동완성 드롭다운 지원
 * Key Features: 클릭 시 입력모드 전환, 입력값 기반 드롭다운 자동완성, 칩 형태 유지
 * Dependencies: cn, lucide-react
 */
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InputChipProps {
  /** 칩에 표시될 필터 이름 (placeholder로도 사용) */
  label: string;
  /** 현재 입력값 */
  value: string;
  /** 입력값 변경 콜백 */
  onChange: (value: string) => void;
  /** 자동완성 후보 목록 — 입력값으로 필터링되어 드롭다운 표시 */
  suggestions?: string[];
  className?: string;
}

export function InputChip({
  label,
  value,
  onChange,
  suggestions = [],
  className,
}: InputChipProps) {
  const [focused, setFocused] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 외부 클릭 시 포커스 해제
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // 포커스 시 드롭다운 위치 계산
  const handleFocus = () => {
    setFocused(true);
    if (wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      setPopupPos({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 200) });
    }
  };

  // 입력값 기반 자동완성 필터링
  const filtered = value.trim()
    ? suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()))
    : [];

  const showDropdown = focused && filtered.length > 0;

  const handleSelect = (name: string) => {
    onChange(name);
    setFocused(false);
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      {/* 칩 형태 입력 */}
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-sm border transition-colors',
          focused
            ? 'border-primary bg-primary-subtle'
            : 'border-border bg-surface hover:border-border-strong',
          // 값만 있고 포커스 아닐 때는 FilterChip의 선택 상태와 동일하게 — 기본 배경/테두리에 라벨은 회색, 값만 파란색
        )}
      >
        <span className={cn(
          'pl-4 text-[14px] font-medium shrink-0 select-none',
          focused ? 'text-primary' : 'text-text-secondary',
        )}>
          {label}
        </span>

        {/* 구분자 — 값이 있거나 포커스일 때 */}
        {(value || focused) && (
          <span className={cn('text-[14px]', focused ? 'text-primary/30' : 'text-primary/50')}>·</span>
        )}

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={handleFocus}
          placeholder={focused ? '이름 입력' : ''}
          className={cn(
            'bg-transparent outline-none text-[14px] font-medium py-2 min-w-[60px]',
            focused || value ? 'w-[100px] text-primary placeholder:text-primary/40' : 'w-0',
            !value && !focused && 'pr-3',
          )}
        />

        {/* 클리어 버튼 */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'pr-2 transition-colors',
              focused
                ? 'text-primary/50 hover:text-primary'
                : 'text-text-disabled hover:text-text-secondary',
            )}
          >
            <X size={13} />
          </button>
        )}

        {/* 값 없고 포커스 아닐 때 우측 패딩 */}
        {!value && !focused && <span className="pr-1" />}
      </div>

      {/* 자동완성 드롭다운 */}
      {showDropdown && (
        <div
          className="fixed bg-surface border border-border rounded-lg shadow-lg z-[9999] max-h-[200px] overflow-y-auto py-1"
          style={{ top: popupPos.top, left: popupPos.left, width: popupPos.width }}
        >
          {filtered.map(name => (
            <button
              key={name}
              type="button"
              onClick={() => handleSelect(name)}
              className="w-full text-left px-3 py-2 text-[13px] text-text-primary hover:bg-bg transition-colors"
            >
              {/* 매칭 부분 하이라이트 */}
              {highlightMatch(name, value)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** 검색어 매칭 부분을 파란색으로 하이라이트 */
function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-primary font-semibold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}
