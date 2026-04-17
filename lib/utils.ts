/**
 * Role: Tailwind 클래스 병합 헬퍼 (shadcn 표준 패턴)
 * Key Features: clsx로 조건부 결합 + tailwind-merge로 충돌 해소
 * Dependencies: clsx, tailwind-merge
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// shadcn/ui 표준 — 클래스 조건 결합과 Tailwind 충돌 해소를 한 번에
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
