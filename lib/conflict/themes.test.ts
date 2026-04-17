import { describe, it, expect } from 'vitest';
import { CONFLICT_THEMES, getThemeForPair } from './themes';

describe('CONFLICT_THEMES', () => {
  it('강한 충돌 5쌍 모두 테마가 있다', () => {
    expect(CONFLICT_THEMES).toHaveLength(5);
  });

  it('토스↔우아한 = 숫자 vs 감성', () => {
    const t = getThemeForPair('toss-po', 'woowa-cbo');
    expect(t?.theme).toBe('숫자 vs 감성');
    expect(t?.framing).toContain('전환율');
  });

  it('순서 무관 lookup (a,b === b,a)', () => {
    expect(getThemeForPair('toss-po', 'woowa-cbo')).toEqual(
      getThemeForPair('woowa-cbo', 'toss-po'),
    );
  });

  it('강한 충돌이 아닌 쌍은 undefined', () => {
    expect(getThemeForPair('kakao-dc', 'naver-pd')).toBeUndefined();
  });
});
