/**
 * Role: STEP 5 충돌 카드 — 테마 + 두 페르소나 입장 + "당신은 어느 쪽?" 입력칸 (⭐ USP 핵심)
 * Key Features: 입력은 store에 저장 (DB 없음, 새로고침 시 휘발), 선택적 응답
 * Dependencies: @/lib/personas, @/lib/conflict/themes, @/lib/store
 */
'use client';

import { PERSONAS } from '@/lib/personas/definitions';
import type { ConflictTheme } from '@/lib/conflict/themes';
import { useAppStore, pairKeyOf } from '@/lib/store';
import { Card, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function ConflictCard({ theme }: { theme: ConflictTheme }) {
  const [a, b] = theme.pair;
  const key = pairKeyOf(a, b);
  const value = useAppStore((s) => s.userStances[key] ?? '');
  const setUserStance = useAppStore((s) => s.setUserStance);

  return (
    <Card data-testid={`conflict-${key}`}>
      <CardTitle>{theme.theme}</CardTitle>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{theme.framing}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[var(--radius-md)] border p-3">
          <p className="text-xs font-medium">{PERSONAS[a].label}</p>
          <p className="mt-1 text-sm">{theme.stances[a]}</p>
        </div>
        <div className="rounded-[var(--radius-md)] border p-3">
          <p className="text-xs font-medium">{PERSONAS[b].label}</p>
          <p className="mt-1 text-sm">{theme.stances[b]}</p>
        </div>
      </div>

      <div className="mt-5">
        <Label htmlFor={`stance-${key}`}>당신은 어느 쪽?</Label>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          면접·포트폴리오 리뷰에서 받을 질문이에요. 답하지 않아도 괜찮아요.
        </p>
        <Textarea
          id={`stance-${key}`}
          className="mt-2"
          placeholder="이 디자인에선 ___ 쪽으로 기울었어요. 이유는 ___"
          value={value}
          onChange={(e) => setUserStance(key, e.target.value)}
        />
      </div>
    </Card>
  );
}
