/**
 * Role: STEP 2 맥락 대화 화면 — 좌측 스샷 미리보기 + 우측 폼
 * Key Features: 이미지 없으면 STEP 1로 돌려보낸다
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ContextForm } from '@/components/app/ContextForm';

export default function ContextPage() {
  const router = useRouter();
  const images = useAppStore((s) => s.images);

  useEffect(() => {
    if (images.length === 0) router.replace('/');
  }, [images.length, router]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-xl font-semibold">맥락 한 번 나눠볼까요</h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        면접·포트폴리오 리뷰에서 자주 받는 질문 4개예요. 미리 답해보는 것 자체가 리허설.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <section aria-label="업로드한 스크린샷">
          <div className="grid grid-cols-2 gap-3">
            {images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={img.previewUrl}
                alt={`업로드 ${i + 1}`}
                className="aspect-square w-full rounded-[var(--radius-md)] border object-cover"
              />
            ))}
          </div>
        </section>
        <section aria-label="맥락 질문 폼">
          <ContextForm />
        </section>
      </div>
    </main>
  );
}
