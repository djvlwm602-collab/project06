/**
 * Role: 선택 페르소나별로 /api/critique 병렬 호출 + 스트리밍 청크를 store에 적재
 * Key Features: AbortController 관리, 실패 시 error 마킹, React StrictMode dev 이중 mount 안전
 * Dependencies: @/lib/store
 * Notes: dev StrictMode가 mount→cleanup→mount를 하므로, fetch 시작을 setTimeout으로 미뤄 1차 cleanup이 시작 자체를 취소하게 만든다 (동일 호출 12번 방지). AbortError는 사용자 의도가 아니라 라이프사이클 정리이므로 카드 에러로 표시하지 않는다.
 */
'use client';

import { useEffect, useRef } from 'react';
import type { PersonaId } from '@/lib/personas/types';
import { useAppStore } from '@/lib/store';

async function runOne(
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

function isAbortError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'AbortError') return true;
  if (err instanceof Error && (err.name === 'AbortError' || /aborted|abort/i.test(err.message)))
    return true;
  return false;
}

export function useCritiqueStreams() {
  const selected = useAppStore((s) => s.selectedPersonas);
  const images = useAppStore((s) => s.images);
  const contextAnswers = useAppStore((s) => s.contextAnswers);
  const appendChunk = useAppStore((s) => s.appendCritiqueChunk);
  const markDone = useAppStore((s) => s.markCritiqueDone);
  const markError = useAppStore((s) => s.markCritiqueError);

  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    if (!contextAnswers || images.length === 0 || selected.length === 0) return;

    const controller = new AbortController();
    let kicked = false;

    // StrictMode dev: mount→cleanup→mount이 동기 인접 발생.
    // setTimeout으로 한 틱 미뤄두면 1차 cleanup이 timer를 cancel해서 fetch 자체가 시작 안 됨.
    const timer = setTimeout(() => {
      startedRef.current = true;
      kicked = true;

      for (const id of selected) {
        const body = {
          personaId: id,
          contextAnswers,
          images: images.map((i) => ({ mediaType: i.mediaType, base64: i.base64 })),
        };
        runOne(body, controller.signal, (chunk) => appendChunk(id, chunk))
          .then(() => markDone(id))
          .catch((err) => {
            if (isAbortError(err)) return; // 라이프사이클 정리: 사용자 에러 아님
            markError(id, err instanceof Error ? err.message : String(err));
          });
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      if (kicked) controller.abort();
    };
  }, [selected, images, contextAnswers, appendChunk, markDone, markError]);
}

export type { PersonaId };
