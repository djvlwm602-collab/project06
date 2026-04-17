import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from './system-prompt';

describe('buildSystemPrompt', () => {
  it('토스 PO prompt는 페르소나 레이블·첫 렌즈 포함', () => {
    const p = buildSystemPrompt('toss-po');
    expect(p).toContain('토스 스타일 PO');
    expect(p).toContain('숫자 · 한 액션');
  });

  it('모든 페르소나 prompt에 디자인 원칙 7개 번호가 포함', () => {
    const p = buildSystemPrompt('woowa-cbo');
    for (const n of ['1.', '2.', '3.', '4.', '5.', '6.', '7.']) {
      expect(p).toContain(n);
    }
  });

  it('톤 가이드 핵심 문구 포함 (spec §4.5)', () => {
    const p = buildSystemPrompt('daangn-pd');
    expect(p).toMatch(/디자이너 언어/);
    expect(p).toMatch(/완성된 작업|포트폴리오/);
    expect(p).toMatch(/평가하지 않는다|동료/);
  });

  it('출력 포맷 가드 (40/50/80자) 포함', () => {
    const p = buildSystemPrompt('toss-po');
    expect(p).toContain('40');
    expect(p).toContain('50');
    expect(p).toContain('80');
  });

  it('JSON 스키마 지시 (diagnosis/questions/suggestions 3개 필드) 포함', () => {
    const p = buildSystemPrompt('kakao-dc');
    expect(p).toMatch(/diagnosis/);
    expect(p).toMatch(/questions/);
    expect(p).toMatch(/suggestions/);
  });

  it('페르소나별로 유니크한 대표 질문을 포함', () => {
    const toss = buildSystemPrompt('toss-po');
    const daangn = buildSystemPrompt('daangn-pd');
    expect(toss).toContain('시선');
    expect(daangn).toMatch(/엄마|읽힐/);
    expect(toss).not.toContain('엄마 핸드폰');
  });
});
