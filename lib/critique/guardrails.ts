/**
 * Role: 크리틱 카드 가드레일 — 길이 제한 검증 (spec §4.3)
 * Key Features: 40/50/80자 한도, 질문 3개 고정, 제안 1-2개
 * Dependencies: ./types
 * Notes: system prompt에도 같은 한도를 명시하지만, LLM이 넘기면 클라이언트 측에서도 경고 가능
 */
import type { CritiqueCard } from './types';

export const MAX_LENGTHS = {
  diagnosis: 40,
  question: 50,
  suggestion: 80,
} as const;

export type ValidationResult = {
  valid: boolean;
  errors: Array<'diagnosis' | 'questions' | 'suggestions'>;
};

export function validateCard(card: CritiqueCard): ValidationResult {
  const errors: ValidationResult['errors'] = [];

  if (card.diagnosis.length > MAX_LENGTHS.diagnosis) errors.push('diagnosis');

  if (card.questions.length !== 3) {
    errors.push('questions');
  } else if (card.questions.some((q) => q.length > MAX_LENGTHS.question)) {
    errors.push('questions');
  }

  if (card.suggestions.length < 1 || card.suggestions.length > 2) {
    errors.push('suggestions');
  } else if (card.suggestions.some((s) => s.length > MAX_LENGTHS.suggestion)) {
    errors.push('suggestions');
  }

  return { valid: errors.length === 0, errors };
}
