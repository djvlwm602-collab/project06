import { describe, it, expect, vi, beforeEach } from 'vitest';
import { textStreamOf } from '@/tests/helpers/mock-anthropic';

// vi.mock은 파일 최상단으로 호이스팅되므로, mock factory가 참조하는 변수도 vi.hoisted로 감싸야 한다.
// vitest.config의 globals:true 덕분에 hoisted 콜백 안에서도 전역 vi가 사용 가능하다.
const hoisted = vi.hoisted(() => {
  const messages = { stream: vi.fn() };
  const ctor = vi.fn().mockImplementation(() => ({ messages }));
  return { ctor, messages };
});
vi.mock('@anthropic-ai/sdk', () => ({ default: hoisted.ctor }));

import { POST } from '@/app/api/critique/route';

describe('POST /api/critique', () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    hoisted.ctor.mockClear();
    hoisted.messages.stream.mockReset();
    hoisted.messages.stream.mockReturnValue(textStreamOf(['{"diagnosis":', '"hi"}']));
  });

  it('유효한 요청에 대해 스트림 응답을 반환한다', async () => {
    const req = new Request('http://localhost/api/critique', {
      method: 'POST',
      body: JSON.stringify({
        personaId: 'toss-po',
        contextAnswers: {
          workKind: 'launched',
          coreProblem: '카드 약관 동의를 덜 까다롭게',
          role: 'pd-solo',
          proudDecision: '',
        },
        images: [{ mediaType: 'image/png', base64: 'AAAA' }],
      }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe('{"diagnosis":"hi"}');
  });

  it('Anthropic messages.stream이 토스 PO용 system prompt로 호출된다', async () => {
    const req = new Request('http://localhost/api/critique', {
      method: 'POST',
      body: JSON.stringify({
        personaId: 'toss-po',
        contextAnswers: { workKind: 'launched', coreProblem: 'x', role: 'pd-solo', proudDecision: '' },
        images: [{ mediaType: 'image/png', base64: 'AAAA' }],
      }),
      headers: { 'content-type': 'application/json' },
    });
    await POST(req);
    expect(hoisted.messages.stream).toHaveBeenCalledOnce();
    const arg = hoisted.messages.stream.mock.calls[0][0];
    expect(arg.system).toContain('토스 스타일 PO');
    expect(arg.messages[0].content).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'image' })])
    );
  });

  it('personaId 누락 시 400', async () => {
    const req = new Request('http://localhost/api/critique', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('ANTHROPIC_API_KEY 누락 시 500', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const req = new Request('http://localhost/api/critique', {
      method: 'POST',
      body: JSON.stringify({
        personaId: 'toss-po',
        contextAnswers: { workKind: 'launched', coreProblem: 'x', role: 'pd-solo', proudDecision: '' },
        images: [{ mediaType: 'image/png', base64: 'AAAA' }],
      }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
