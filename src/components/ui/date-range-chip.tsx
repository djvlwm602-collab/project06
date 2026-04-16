/**
 * Role: 기간 선택 칩 — 프리셋 사이드바 + 듀얼 캘린더 팝업
 * Key Features: 프리셋 빠른 선택, 달력 날짜 범위 선택, 칩 형태 트리거
 * Dependencies: cn, lucide-react, date-fns
 */
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  format,
  startOfMonth, endOfMonth,
  startOfWeek, endOfWeek,
  addMonths, subMonths,
  addDays, subDays,
  isSameMonth, isSameDay, isWithinInterval,
  eachDayOfInterval,
  startOfDay,
} from 'date-fns';
import { ko } from 'date-fns/locale';

interface DateRangeChipProps {
  startDate: string;   // yyyy-MM-dd
  endDate: string;     // yyyy-MM-dd
  onApply: (start: string, end: string) => void;
  className?: string;
}

const PRESETS = [
  { label: '지난 7일', days: 7 },
  { label: '지난 30일', days: 30 },
  { label: '지난 60일', days: 60 },
  { label: '지난 90일', days: 90 },
  { label: '이번 주', key: 'thisWeek' },
  { label: '이번 달', key: 'thisMonth' },
  { label: '이번 분기', key: 'thisQuarter' },
] as const;

function getPresetRange(preset: typeof PRESETS[number]): [Date, Date] {
  const today = startOfDay(new Date());
  if ('days' in preset) {
    return [subDays(today, preset.days), today];
  }
  if (preset.key === 'thisWeek') {
    return [startOfWeek(today, { weekStartsOn: 0 }), today];
  }
  if (preset.key === 'thisMonth') {
    return [startOfMonth(today), today];
  }
  // thisQuarter
  const qMonth = Math.floor(today.getMonth() / 3) * 3;
  return [new Date(today.getFullYear(), qMonth, 1), today];
}

function formatDate(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

function formatDisplay(start: string, end: string) {
  // "03.14 ~ 04.14" 형태
  const s = start.replace(/^\d{4}-/, '').replace(/-/g, '.');
  const e = end.replace(/^\d{4}-/, '').replace(/-/g, '.');
  return `${s} ~ ${e}`;
}

export function DateRangeChip({ startDate, endDate, onApply, className }: DateRangeChipProps) {
  const [open, setOpen] = useState(false);
  const [selecting, setSelecting] = useState<{ start: Date; end: Date | null }>({
    start: new Date(startDate),
    end: new Date(endDate),
  });
  const [leftMonth, setLeftMonth] = useState(() => startOfMonth(new Date(startDate)));
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const rightMonth = addMonths(leftMonth, 1);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // 열릴 때 현재 날짜로 초기화
  useEffect(() => {
    if (open) {
      setSelecting({ start: new Date(startDate), end: new Date(endDate) });
      setLeftMonth(startOfMonth(new Date(startDate)));
      setActivePreset(null);
    }
  }, [open]);

  const handlePreset = (preset: typeof PRESETS[number]) => {
    const [s, e] = getPresetRange(preset);
    setSelecting({ start: s, end: e });
    setLeftMonth(startOfMonth(s));
    setActivePreset(preset.label);
  };

  const handleDayClick = (day: Date) => {
    if (!selecting.end || selecting.start !== selecting.end) {
      // 첫 클릭 또는 범위 완성 후 재선택
      if (!selecting.end) {
        // 두 번째 클릭 — 범위 완성
        const [s, e] = day < selecting.start
          ? [day, selecting.start]
          : [selecting.start, day];
        setSelecting({ start: s, end: e });
      } else {
        // 새 범위 시작
        setSelecting({ start: day, end: null });
      }
    } else {
      setSelecting({ start: day, end: null });
    }
    setActivePreset(null);
  };

  const handleApply = () => {
    if (selecting.start && selecting.end) {
      onApply(formatDate(selecting.start), formatDate(selecting.end));
    }
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* 트리거 칩 */}
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
            ? 'bg-primary-subtle border-primary text-text-secondary'
            : 'bg-surface border-border text-text-secondary hover:border-border-strong',
        )}
      >
        <Calendar size={14} />
        <span>기간</span>
        <span className={cn(open ? 'text-primary/50' : 'text-text-disabled')}>·</span>
        <span className="text-primary">{formatDisplay(startDate, endDate)}</span>
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {/* 팝업 */}
      {open && (
        <div
          className="fixed bg-surface border border-border rounded-lg shadow-xl z-[9999] flex overflow-hidden"
          style={{ top: popupPos.top, left: popupPos.left }}
        >
          {/* 프리셋 사이드바 */}
          <div className="w-[130px] border-r border-border py-2 shrink-0">
            <div className="px-3 py-1.5 text-[12px] font-semibold text-text-secondary">프리셋</div>
            {PRESETS.map(preset => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePreset(preset)}
                className={cn(
                  'w-full text-left px-3 py-2 text-[13px] hover:bg-bg transition-colors',
                  activePreset === preset.label
                    ? 'bg-primary-subtle text-primary font-medium'
                    : 'text-text-primary',
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* 캘린더 영역 */}
          <div className="p-4 flex flex-col gap-3">
            {/* 듀얼 캘린더 헤더 */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setLeftMonth(subMonths(leftMonth, 1))}
                className="p-1 hover:bg-bg rounded transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex gap-12">
                <span className="text-[14px] font-semibold text-text-primary">
                  {format(leftMonth, 'yyyy년 M월', { locale: ko })}
                </span>
                <span className="text-[14px] font-semibold text-text-primary">
                  {format(rightMonth, 'yyyy년 M월', { locale: ko })}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLeftMonth(addMonths(leftMonth, 1))}
                className="p-1 hover:bg-bg rounded transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* 듀얼 캘린더 그리드 */}
            <div className="flex gap-6">
              <MonthGrid
                month={leftMonth}
                selecting={selecting}
                onDayClick={handleDayClick}
              />
              <MonthGrid
                month={rightMonth}
                selecting={selecting}
                onDayClick={handleDayClick}
              />
            </div>

            {/* 하단 버튼 */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-1.5 text-[13px] font-medium rounded-sm border border-border text-text-secondary hover:bg-bg transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-1.5 text-[13px] font-medium rounded-sm bg-primary text-white hover:bg-primary-hover transition-colors"
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** 월별 캘린더 그리드 */
function MonthGrid({
  month,
  selecting,
  onDayClick,
}: {
  month: Date;
  selecting: { start: Date; end: Date | null };
  onDayClick: (day: Date) => void;
}) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {weekDays.map(d => (
          <div key={d} className="w-9 h-7 flex items-center justify-center text-[11px] font-medium text-text-disabled">
            {d}
          </div>
        ))}
      </div>
      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, month);
          const isStart = isSameDay(day, selecting.start);
          const isEnd = selecting.end && isSameDay(day, selecting.end);
          const inRange = selecting.end && isWithinInterval(day, {
            start: selecting.start < selecting.end ? selecting.start : selecting.end,
            end: selecting.start < selecting.end ? selecting.end : selecting.start,
          });
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={i}
              type="button"
              onClick={() => onDayClick(day)}
              disabled={!inMonth}
              className={cn(
                'w-9 h-9 flex items-center justify-center text-[13px] rounded-full transition-colors relative',
                !inMonth && 'invisible',
                inMonth && !isStart && !isEnd && !inRange && 'hover:bg-bg text-text-primary',
                inRange && !isStart && !isEnd && 'bg-primary-subtle text-primary rounded-none',
                (isStart || isEnd) && 'bg-primary text-white font-medium',
                isToday && !isStart && !isEnd && 'ring-1 ring-primary ring-inset',
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
