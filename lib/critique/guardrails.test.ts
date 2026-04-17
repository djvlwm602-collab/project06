import { describe, it, expect } from 'vitest';
import { validateCard, MAX_LENGTHS } from './guardrails';
import type { CritiqueCard } from './types';

const ok: CritiqueCard = {
  personaId: 'toss-po',
  diagnosis: '7개 약관이 다 같은 무게라 시선이 멈플 곳이 없어.',
  questions: [
    '이 화면에서 시선이 가장 먼저 가는 곳이 어디야?',
    '필수와 선택을 시각적으로 어떻게 구분했어?',
    '"전체 동의"와 "발급 신청" 버튼의 위계 차이가 보여?',
  ],
  suggestions: ['필수 3개를 한 그룹으로, 선택 4개는 보조 영역으로 분리'],
};

describe('validateCard', () => {
  it('정상 카드는 valid', () => {
    expect(validateCard(ok).valid).toBe(true);
  });

  it('diagnosis 40자 초과 시 invalid', () => {
    const bad = { ...ok, diagnosis: 'x'.repeat(41) };
    expect(validateCard(bad).valid).toBe(false);
    expect(validateCard(bad).errors).toContain('diagnosis');
  });

  it('question 50자 초과 시 invalid', () => {
    const bad = { ...ok, questions: ['a'.repeat(51), ok.questions[1], ok.questions[2]] };
    expect(validateCard(bad).valid).toBe(false);
    expect(validateCard(bad).errors).toContain('questions');
  });

  it('질문 3개가 아니면 invalid', () => {
    const bad = { ...ok, questions: [ok.questions[0], ok.questions[1]] };
    expect(validateCard(bad).valid).toBe(false);
  });

  it('suggestion 80자 초과 시 invalid', () => {
    const bad = { ...ok, suggestions: ['s'.repeat(81)] };
    expect(validateCard(bad).valid).toBe(false);
  });

  it('제안 0개는 invalid, 1개 또는 2개는 valid', () => {
    expect(validateCard({ ...ok, suggestions: [] }).valid).toBe(false);
    expect(validateCard({ ...ok, suggestions: ['짧은 제안'] }).valid).toBe(true);
    expect(validateCard({ ...ok, suggestions: ['첫 제안', '둘째 제안'] }).valid).toBe(true);
    expect(validateCard({ ...ok, suggestions: ['a', 'b', 'c'] }).valid).toBe(false);
  });

  it('MAX_LENGTHS 상수 검증', () => {
    expect(MAX_LENGTHS.diagnosis).toBe(40);
    expect(MAX_LENGTHS.question).toBe(50);
    expect(MAX_LENGTHS.suggestion).toBe(80);
  });
});
