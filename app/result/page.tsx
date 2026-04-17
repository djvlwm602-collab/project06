/**
 * Role: STEP 4(크리틱 카드 그리드) + STEP 5(충돌 카드) — 같은 페이지 (spec §4.6)
 * Key Features: 스트리밍 훅 가동, 선택 페르소나 기준 충돌 카드 자동 노출
 * Dependencies: @/lib/useCritiqueStreams, @/lib/conflict/lookup
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useCritiqueStreams } from '@/lib/useCritiqueStreams';
import { CritiqueCardView } from '@/components/app/CritiqueCard';
import { ConflictCard } from '@/components/app/ConflictCard';
import { activeConflictThemes } from '@/lib/conflict/lookup';
import type { PersonaId } from '@/lib/personas/types';

export default function ResultPage() {
  const router = useRouter();
  const selected = useAppStore((s) => s.selectedPersonas);
  const images = useAppStore((s) => s.images);
  const contextAnswers = useAppStore((s) => s.contextAnswers);
  const critiques = useAppStore((s) => s.critiques);

  useEffect(() => {
    if (images.length === 0) router.replace('/');
    else if (!contextAnswers) router.replace('/context');
    else if (selected.length === 0) router.replace('/personas');
  }, [images.length, contextAnswers, selected.length, router]);

  useCritiqueStreams();

  const themes = activeConflictThemes(selected);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-xl font-semibold">6명의 크리틱</h1>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {selected.map((id) => {
          const c = critiques[id] ?? { text: '', done: false };
          return (
            <CritiqueCardView
              key={id}
              personaId={id as PersonaId}
              text={c.text}
              done={c.done}
              error={c.error}
            />
          );
        })}
      </section>

      {themes.length > 0 && (
        <section className="mt-14">
          <h2 className="text-lg font-semibold">부딪히는 지점 — 당신의 차례</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            강한 충돌이 생기는 쌍이에요. 면접·리뷰에서 받을 질문을 미리 답해보세요.
          </p>
          <div className="mt-6 space-y-4">
            {themes.map((t) => (
              <ConflictCard key={`${t.pair[0]}|${t.pair[1]}`} theme={t} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
