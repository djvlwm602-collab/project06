/**
 * Role: 선택된 페르소나 배열 → STEP 5에 표시할 강한 충돌 테마 목록
 * Key Features: 매트릭스 룩업 (§4.1 옵션 A: 자동 트리거)
 * Dependencies: ./themes
 * Notes: 클라이언트·서버 양쪽에서 쓰이는 순수 함수
 */
import type { PersonaId } from '@/lib/personas/types';
import { CONFLICT_THEMES, type ConflictTheme } from './themes';

export function activeConflictThemes(selected: PersonaId[]): ConflictTheme[] {
  const set = new Set(selected);
  return CONFLICT_THEMES.filter(
    (t) => set.has(t.pair[0]) && set.has(t.pair[1]),
  );
}
