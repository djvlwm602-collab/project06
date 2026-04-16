/**
 * Role: 5단계 플로우 동안 유지되는 클라이언트 상태
 * Key Features: 업로드 이미지(base64), 맥락 답변, 선택 페르소나, 크리틱 결과, STEP 5 유저 입장 입력
 * Dependencies: zustand
 * Notes: DB 없음(MVP) — 새로고침 시 날아감. localStorage 저장 안 함(이미지 용량 문제).
 */
'use client';

import { create } from 'zustand';
import type { PersonaId } from '@/lib/personas/types';
import type { ContextAnswer } from '@/lib/critique/types';

export type UploadedImage = {
  mediaType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif';
  base64: string;
  previewUrl: string; // object URL (UI 미리보기용, revoke 시 안전)
};

type State = {
  images: UploadedImage[];
  contextAnswers: ContextAnswer | null;
  selectedPersonas: PersonaId[];
  critiques: Record<string, { text: string; done: boolean; error?: string }>;
  userStances: Record<string, string>; // STEP 5 "어느 쪽?" 입력 (key = pair key "a|b")
};

type Actions = {
  setImages: (imgs: UploadedImage[]) => void;
  setContextAnswers: (a: ContextAnswer) => void;
  setSelectedPersonas: (ids: PersonaId[]) => void;
  appendCritiqueChunk: (personaId: PersonaId, chunk: string) => void;
  markCritiqueDone: (personaId: PersonaId) => void;
  markCritiqueError: (personaId: PersonaId, message: string) => void;
  setUserStance: (pairKey: string, text: string) => void;
  reset: () => void;
};

const initial: State = {
  images: [],
  contextAnswers: null,
  selectedPersonas: ['toss-po', 'daangn-pd', 'kakao-dc', 'naver-pd', 'line-pm', 'woowa-cbo'], // §4.6 STEP 3 디폴트
  critiques: {},
  userStances: {},
};

export const useAppStore = create<State & Actions>((set) => ({
  ...initial,
  setImages: (images) => set({ images }),
  setContextAnswers: (contextAnswers) => set({ contextAnswers }),
  setSelectedPersonas: (selectedPersonas) => set({ selectedPersonas }),
  appendCritiqueChunk: (personaId, chunk) =>
    set((s) => {
      const prev = s.critiques[personaId] ?? { text: '', done: false };
      return { critiques: { ...s.critiques, [personaId]: { ...prev, text: prev.text + chunk } } };
    }),
  markCritiqueDone: (personaId) =>
    set((s) => {
      const prev = s.critiques[personaId] ?? { text: '', done: false };
      return { critiques: { ...s.critiques, [personaId]: { ...prev, done: true } } };
    }),
  markCritiqueError: (personaId, message) =>
    set((s) => ({
      critiques: { ...s.critiques, [personaId]: { text: s.critiques[personaId]?.text ?? '', done: true, error: message } },
    })),
  setUserStance: (pairKey, text) =>
    set((s) => ({ userStances: { ...s.userStances, [pairKey]: text } })),
  reset: () => set(initial),
}));

// pair key 유틸 — STEP 5 카드 렌더·입력 저장에 공통 사용
export function pairKeyOf(a: PersonaId, b: PersonaId): string {
  return [a, b].sort().join('|');
}
