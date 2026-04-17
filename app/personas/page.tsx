/**
 * Role: STEP 3 페르소나 선택 화면
 * Key Features: PersonaPicker + Disclaimer + 다음 버튼(선택 최소 1명)
 */
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { PersonaPicker } from '@/components/app/PersonaPicker';
import { Disclaimer } from '@/components/app/Disclaimer';
import { Button } from '@/components/ui/button';

export default function PersonasPage() {
  const router = useRouter();
  const contextAnswers = useAppStore((s) => s.contextAnswers);
  const selected = useAppStore((s) => s.selectedPersonas);

  useEffect(() => {
    if (!contextAnswers) router.replace('/context');
  }, [contextAnswers, router]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-xl font-semibold">누가 봐주면 좋을까요</h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        디폴트는 6명 전원이에요. 빼고 싶은 사람은 체크를 풀면 돼요.
      </p>

      <section className="mt-8">
        <PersonaPicker />
      </section>

      <section className="mt-6">
        <Disclaimer />
      </section>

      <section className="mt-10 flex gap-3">
        <Link href="/result">
          <Button size="lg" disabled={selected.length === 0}>
            크리틱 받기
          </Button>
        </Link>
      </section>
    </main>
  );
}
