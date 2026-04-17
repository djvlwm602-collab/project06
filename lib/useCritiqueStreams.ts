/**
 * Role: 선택 페르소나별로 /api/critique 병렬 호출 + 스트리밍 청크를 store에 적재
 * Key Features: AbortController 관리, 실패 시 error 마킹
 * Dependencies: @/lib/store
 */
'use client';

import { useEffect, useRef } from 'react';
import type { PersonaId } from '@/lib/personas/types';
import { useAppStore } from '@/lib/store';

async function runOne(
  personaId: PersonaId,
  body: unknown,
  signal: AbortSignal,
  onChunk: (c: string) => void,
): Promise<void> {
  const res = await fetch('/api/critique', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
    signal,
  });
  if (!res.ok || !res.body) {
    const msg = await res.text().catch(() => 'unknown');
    throw new Error(`${res.status} ${msg}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value));
  }
}

export function useCritiqueStreams() {
  const selected = useAppStore((s) => s.selectedPersonas);
  const images = useAppStore((s) => s.images);
  const contextAnswers = useAppStore((s) => s.contextAnswers);
  const appendChunk = useAppStore((s) => s.appendCritiqueChunk);
  const markDone = useAppStore((s) => s.markCritiqueDone);
  const markError = useAppStore((s) => s.markCritiqueError);

  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    if (!contextAnswers || images.length === 0 || selected.length === 0) return;
    started.current = true;

    const controller = new AbortController();

    for (const id of selected) {
      const body = {
        personaId: id,
        contextAnswers,
        images: images.map((i) => ({ mediaType: i.mediaType, base64: i.base64 })),
      };
      runOne(id, body, controller.signal, (chunk) => appendChunk(id, chunk))
        .then(() => markDone(id))
        .catch((err) => markError(id, err instanceof Error ? err.message : String(err)));
    }

    return () => controller.abort();
  }, [selected, images, contextAnswers, appendChunk, markDone, markError]);
}
