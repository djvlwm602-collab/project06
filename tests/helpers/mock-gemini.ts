/**
 * Role: @google/genai 테스트용 가짜 client 팩토리
 * Key Features: generateContentStream가 AsyncGenerator를 반환하는 형태를 모사. vi.hoisted와 함께 사용
 * Notes: 실제 Gemini 호출 없이 route handler 검증
 */
import { vi } from 'vitest';

// 외부에서 vi.hoisted() 안에서 호출해 ctor를 얻는다
export function createGeminiMock() {
  const generateContentStream = vi.fn();
  const models = { generateContentStream };
  const ctor = vi.fn().mockImplementation(() => ({ models }));
  return { ctor, models };
}

// 청크 텍스트 배열을 SDK가 반환하는 Promise<AsyncGenerator<{text}>> 형태로 감싼다
export function chunkStreamOf(chunks: string[]) {
  async function* gen() {
    for (const c of chunks) yield { text: c };
  }
  return Promise.resolve(gen());
}
