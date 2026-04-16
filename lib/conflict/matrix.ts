/**
 * Role: 6×6 페르소나 충돌 매트릭스 (spec §3.1)
 * Key Features: 대칭 행렬, 레벨 lookup 함수
 * Dependencies: @/lib/personas/types
 * Notes: strong 5쌍 (§3.2)은 STEP 5 카드 후보. symmetric 유지가 불변식
 */
import type { PersonaId } from '@/lib/personas/types';

export type ConflictLevel = 'strong' | 'medium' | 'none';

// strong 5쌍 (§3.1/§3.2)
const STRONG: Array<[PersonaId, PersonaId]> = [
  ['toss-po', 'kakao-dc'],
  ['toss-po', 'woowa-cbo'],
  ['daangn-pd', 'line-pm'],
  ['naver-pd', 'woowa-cbo'],
  ['line-pm', 'woowa-cbo'],
];

// medium (§3.1 🟡)
const MEDIUM: Array<[PersonaId, PersonaId]> = [
  ['toss-po', 'daangn-pd'],
  ['toss-po', 'naver-pd'],
  ['daangn-pd', 'kakao-dc'],
  ['daangn-pd', 'naver-pd'],
  ['kakao-dc', 'line-pm'],
  ['kakao-dc', 'woowa-cbo'],
];

function keyOf(a: PersonaId, b: PersonaId): string {
  return [a, b].sort().join('|');
}

const LEVEL_BY_KEY = new Map<string, ConflictLevel>();
for (const [a, b] of STRONG) LEVEL_BY_KEY.set(keyOf(a, b), 'strong');
for (const [a, b] of MEDIUM) LEVEL_BY_KEY.set(keyOf(a, b), 'medium');

export function getConflictLevel(a: PersonaId, b: PersonaId): ConflictLevel {
  if (a === b) return 'none';
  return LEVEL_BY_KEY.get(keyOf(a, b)) ?? 'none';
}

// 디버깅·검증 편의용 (테스트에서 직접 키를 돌 때 사용 가능)
export const CONFLICT_MATRIX = { STRONG, MEDIUM };
