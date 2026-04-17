/**
 * Role: @anthropic-ai/sdk 테스트용 가짜 client 팩토리
 * Key Features: toTextStream async iterable을 반환. vi.hoisted와 함께 사용
 * Notes: 실제 Anthropic 호출 없이 route handler 검증
 */
import { vi } from 'vitest';

// 외부에서 vi.hoisted() 안에서 호출해 ctor를 얻는다
export function createAnthropicMock() {
  const messages = { stream: vi.fn() };
  const ctor = vi.fn().mockImplementation(() => ({ messages }));
  return { ctor, messages };
}

// 청크 배열을 async iterable 스트림 객체로 감싼다
export function textStreamOf(chunks: string[]) {
  return {
    async *toTextStream() {
      for (const c of chunks) yield c;
    },
  };
}
