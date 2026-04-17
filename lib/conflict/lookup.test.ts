import { describe, it, expect } from 'vitest';
import { activeConflictThemes } from './lookup';

describe('activeConflictThemes', () => {
  it('6명 전원 선택 시 5개 테마 모두 활성', () => {
    const themes = activeConflictThemes([
      'toss-po', 'daangn-pd', 'kakao-dc', 'naver-pd', 'line-pm', 'woowa-cbo',
    ]);
    expect(themes).toHaveLength(5);
  });

  it('토스 + 우아한만 선택 시 1개 테마 (숫자 vs 감성)', () => {
    const themes = activeConflictThemes(['toss-po', 'woowa-cbo']);
    expect(themes).toHaveLength(1);
    expect(themes[0].theme).toBe('숫자 vs 감성');
  });

  it('1명만 선택 시 0개', () => {
    expect(activeConflictThemes(['toss-po'])).toEqual([]);
  });

  it('강한 충돌 없는 조합(카카오 + 네이버)은 0개', () => {
    expect(activeConflictThemes(['kakao-dc', 'naver-pd'])).toEqual([]);
  });

  it('중복 페르소나가 섞여도 중복 테마를 만들지 않는다', () => {
    const themes = activeConflictThemes(['toss-po', 'toss-po', 'woowa-cbo']);
    expect(themes).toHaveLength(1);
  });
});
