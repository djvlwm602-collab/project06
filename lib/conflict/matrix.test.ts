import { describe, it, expect } from 'vitest';
import { CONFLICT_MATRIX, getConflictLevel } from './matrix';
import { PERSONA_IDS } from '@/lib/personas/types';

describe('CONFLICT_MATRIX', () => {
  it('강한 충돌 5쌍은 strong (spec §3.1)', () => {
    expect(getConflictLevel('toss-po', 'woowa-cbo')).toBe('strong');
    expect(getConflictLevel('toss-po', 'kakao-dc')).toBe('strong');
    expect(getConflictLevel('daangn-pd', 'line-pm')).toBe('strong');
    expect(getConflictLevel('naver-pd', 'woowa-cbo')).toBe('strong');
    expect(getConflictLevel('line-pm', 'woowa-cbo')).toBe('strong');
  });

  it('대칭 행렬 (a→b === b→a)', () => {
    for (const a of PERSONA_IDS) {
      for (const b of PERSONA_IDS) {
        expect(getConflictLevel(a, b)).toBe(getConflictLevel(b, a));
      }
    }
  });

  it('자기 자신과는 none (대각선)', () => {
    for (const id of PERSONA_IDS) {
      expect(getConflictLevel(id, id)).toBe('none');
    }
  });

  it('중간 충돌 샘플: 1↔2 medium, 3↔4 none', () => {
    expect(getConflictLevel('toss-po', 'daangn-pd')).toBe('medium');
    expect(getConflictLevel('kakao-dc', 'naver-pd')).toBe('none');
  });
});
