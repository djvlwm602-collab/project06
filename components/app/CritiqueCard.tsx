/**
 * Role: STEP 4 페르소나별 크리틱 카드 (스트리밍 텍스트 렌더)
 * Key Features: LLM이 뱉는 JSON을 점진 파싱 — 완성 전엔 raw 프리뷰, 완성 후 구조화 렌더
 * Dependencies: @/lib/personas, @/lib/critique/types
 * Notes: JSON 파싱 실패 시 raw 텍스트 폴백 (디자인 원칙: 실패해도 침묵보단 대화)
 */
'use client';

import type { PersonaId } from '@/lib/personas/types';
import { PERSONAS } from '@/lib/personas/definitions';
import type { CritiqueCard as CardData } from '@/lib/critique/types';
import { Card, CardBody, CardTitle } from '@/components/ui/card';

type Props = {
  personaId: PersonaId;
  text: string;
  done: boolean;
  error?: string;
};

function tryParse(text: string): CardData | null {
  try {
    const obj = JSON.parse(text.trim());
    if (
      obj &&
      typeof obj.diagnosis === 'string' &&
      Array.isArray(obj.questions) &&
      Array.isArray(obj.suggestions)
    ) {
      return { personaId: '', ...obj };
    }
  } catch {}
  return null;
}

export function CritiqueCardView({ personaId, text, done, error }: Props) {
  const persona = PERSONAS[personaId];
  const parsed = done ? tryParse(text) : null;

  return (
    <Card>
      <CardTitle>{persona.label}</CardTitle>
      {error ? (
        <CardBody>
          <p className="text-[var(--color-danger)]">크리틱을 불러오지 못했어요: {error}</p>
        </CardBody>
      ) : parsed ? (
        <CardBody className="space-y-3">
          <p>
            <span className="mr-1">🩺</span>
            <span className="font-medium text-[var(--color-text-primary)]">{parsed.diagnosis}</span>
          </p>
          <div>
            <p className="font-medium text-[var(--color-text-primary)]">❓ 질문</p>
            <ol className="mt-1 list-decimal space-y-1 pl-5">
              {parsed.questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
          </div>
          <div>
            <p className="font-medium text-[var(--color-text-primary)]">💡 제안</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {parsed.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </CardBody>
      ) : (
        <CardBody>
          <pre className="whitespace-pre-wrap font-sans text-sm">{text || '...'}</pre>
          {!done && <p className="mt-2 text-xs text-[var(--color-text-muted)]">쓰는 중…</p>}
        </CardBody>
      )}
    </Card>
  );
}
