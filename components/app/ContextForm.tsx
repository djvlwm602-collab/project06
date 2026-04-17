/**
 * Role: STEP 2 4개 맥락 질문 폼 (spec §4.2)
 * Key Features: 객관식 2 + 자유 2, coreProblem 필수
 * Dependencies: @/lib/critique/context-questions, @/lib/store
 */
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CONTEXT_QUESTIONS } from '@/lib/critique/context-questions';
import type { ContextAnswer, RoleKind, WorkKind } from '@/lib/critique/types';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function ContextForm() {
  const router = useRouter();
  const existing = useAppStore((s) => s.contextAnswers);
  const setContextAnswers = useAppStore((s) => s.setContextAnswers);

  const [workKind, setWorkKind] = React.useState<WorkKind>(existing?.workKind ?? 'launched');
  const [coreProblem, setCoreProblem] = React.useState(existing?.coreProblem ?? '');
  const [role, setRole] = React.useState<RoleKind>(existing?.role ?? 'pd-solo');
  const [proudDecision, setProudDecision] = React.useState(existing?.proudDecision ?? '');

  const canSubmit = coreProblem.trim().length > 0;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const next: ContextAnswer = { workKind, coreProblem: coreProblem.trim(), role, proudDecision: proudDecision.trim() };
    setContextAnswers(next);
    router.push('/personas');
  };

  const workKindQ = CONTEXT_QUESTIONS[0];
  const coreProblemQ = CONTEXT_QUESTIONS[1];
  const roleQ = CONTEXT_QUESTIONS[2];
  const proudQ = CONTEXT_QUESTIONS[3];

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {workKindQ.kind === 'choice' && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-[var(--color-text-primary)]">{workKindQ.prompt}</legend>
          <div className="flex flex-wrap gap-2">
            {workKindQ.options.map((opt) => (
              <label key={opt.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="workKind"
                  value={opt.value}
                  checked={workKind === opt.value}
                  onChange={(e) => setWorkKind(e.currentTarget.value as WorkKind)}
                  className="peer sr-only"
                />
                <span className="inline-block rounded-full border px-3 py-1 text-sm peer-checked:border-[var(--color-accent)] peer-checked:bg-[var(--color-accent)] peer-checked:text-[var(--color-accent-foreground)]">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {coreProblemQ.kind === 'text' && (
        <div className="space-y-2">
          <Label htmlFor="coreProblem">{coreProblemQ.prompt}</Label>
          <Input
            id="coreProblem"
            maxLength={coreProblemQ.maxLength}
            value={coreProblem}
            onChange={(e) => setCoreProblem(e.target.value)}
            placeholder="예) 카드 약관 동의 과정을 덜 까다롭게"
            required
          />
        </div>
      )}

      {roleQ.kind === 'choice' && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-[var(--color-text-primary)]">{roleQ.prompt}</legend>
          <div className="flex flex-wrap gap-2">
            {roleQ.options.map((opt) => (
              <label key={opt.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value={opt.value}
                  checked={role === opt.value}
                  onChange={(e) => setRole(e.currentTarget.value as RoleKind)}
                  className="peer sr-only"
                />
                <span className="inline-block rounded-full border px-3 py-1 text-sm peer-checked:border-[var(--color-accent)] peer-checked:bg-[var(--color-accent)] peer-checked:text-[var(--color-accent-foreground)]">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {proudQ.kind === 'text' && (
        <div className="space-y-2">
          <Label htmlFor="proudDecision">{proudQ.prompt}</Label>
          <Textarea
            id="proudDecision"
            maxLength={proudQ.maxLength}
            value={proudDecision}
            onChange={(e) => setProudDecision(e.target.value)}
            placeholder="(없으면 비워도 OK)"
          />
        </div>
      )}

      <Button type="submit" size="lg" disabled={!canSubmit}>
        6명에게 보여주기
      </Button>
    </form>
  );
}
