/**
 * Role: STEP 1 랜딩 — 헤드라인 + 업로드 + 페르소나 이름 + 디스클레이머 + 진행 버튼
 * Key Features: spec §4.6 STEP 1 박제 (부록 카피 1번, 6인 노출)
 */
'use client';

import Link from 'next/link';
import { DropZone } from '@/components/app/DropZone';
import { Disclaimer } from '@/components/app/Disclaimer';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { PERSONAS } from '@/lib/personas/definitions';
import { PERSONA_IDS } from '@/lib/personas/types';

export default function Home() {
  const imageCount = useAppStore((s) => s.images.length);

  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        완성작 들고 와요.<br />6명이 봐줍니다.
      </h1>
      <p className="mt-4 text-[var(--color-text-secondary)]">
        포트폴리오 스크린샷을 올리면, 6인의 가상 리뷰어가 면접·리뷰에서 받을 만한 질문을 먼저 던져줍니다.
      </p>

      <section className="mt-10">
        <DropZone />
      </section>

      <section className="mt-8">
        <p className="text-sm font-medium">봐줄 6명</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {PERSONA_IDS.map((id) => (
            <li
              key={id}
              className="rounded-full border px-3 py-1 text-xs text-[var(--color-text-secondary)]"
            >
              {PERSONAS[id].label}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <Disclaimer />
      </section>

      <section className="mt-10">
        <Link href="/context" aria-disabled={imageCount === 0}>
          <Button size="lg" disabled={imageCount === 0}>
            다음 — 맥락 대화
          </Button>
        </Link>
      </section>
    </main>
  );
}
