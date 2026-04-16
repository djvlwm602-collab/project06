import { describe, it, expect } from 'vitest';
import { CONTEXT_QUESTIONS } from './context-questions';

describe('CONTEXT_QUESTIONS', () => {
  it('4개 질문 (spec §4.2: 객 2 + 자 2)', () => {
    expect(CONTEXT_QUESTIONS).toHaveLength(4);
  });

  it('순서: workKind → coreProblem → role → proudDecision', () => {
    expect(CONTEXT_QUESTIONS.map((q) => q.id)).toEqual([
      'workKind', 'coreProblem', 'role', 'proudDecision',
    ]);
  });

  it('객관식 질문은 options를 가진다', () => {
    const workKind = CONTEXT_QUESTIONS[0];
    expect(workKind.kind).toBe('choice');
    if (workKind.kind === 'choice') {
      expect(workKind.options.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('coreProblem은 required, proudDecision은 옵션', () => {
    const core = CONTEXT_QUESTIONS[1];
    const proud = CONTEXT_QUESTIONS[3];
    if (core.kind === 'text') expect(core.required).toBe(true);
    if (proud.kind === 'text') expect(proud.required).toBe(false);
  });
});
