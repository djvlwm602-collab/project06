import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chunkStreamOf } from '@/tests/helpers/mock-gemini';

// vi.mock은 파일 최상단으로 호이스팅되므로, mock factory가 참조하는 변수도 vi.hoisted로 감싸야 한다.
// vitest.config의 globals:true 덕분에 hoisted 콜백 안에서도 전역 vi가 사용 가능하다.
const hoisted = vi.hoisted(() => {
  const generateContentStream = vi.fn();
  const models = { generateContentStream };
  const ctor = vi.fn().mockImplementation(() => ({ models }));
  return { ctor, models };
});
vi.mock('@google/genai', () => ({ GoogleGenAI: hoisted.ctor }));

import { POST } from '@/app/api/critique/route';

describe('POST /api/critique', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key';
    hoisted.ctor.mockClear();
    hoisted.models.generateContentStream.mockReset();
    hoisted.models.generateContentStream.mockReturnValue(chunkStreamOf(['{"diagnosis":', '"hi"}']));
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

  it('Gemini generateContentStream이 토스 PO용 systemInstruction으로 호출된다', async () => {
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
    expect(hoisted.models.generateContentStream).toHaveBeenCalledOnce();
    const arg = hoisted.models.generateContentStream.mock.calls[0][0];
    expect(arg.config.systemInstruction).toContain('토스 스타일 PO');
    expect(arg.contents[0].parts).toEqual(
      expect.arrayContaining([expect.objectContaining({ inlineData: expect.objectContaining({ mimeType: 'image/png' }) })])
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

  it('GEMINI_API_KEY 누락 시 500', async () => {
    delete process.env.GEMINI_API_KEY;
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
