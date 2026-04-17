/**
 * Role: Gemini API 스트리밍 프록시 — 페르소나 1명 크리틱 생성
 * Key Features: 서버 사이드 전용 (API 키 보호), 이미지+맥락+페르소나 system prompt 조립, 스트리밍 패스스루, 503/429 재시도
 * Dependencies: @google/genai, @/lib/personas, @/lib/critique
 * Notes: 클라이언트는 페르소나별로 이 엔드포인트를 병렬 호출(6 동시) — Gemini 일시 과부하(503 UNAVAILABLE) 시 일부가 항상 실패하므로 retry 필수
 */
import { GoogleGenAI } from '@google/genai';
import type { GenerateContentParameters, GenerateContentResponse } from '@google/genai';
import { PERSONA_IDS, type PersonaId } from '@/lib/personas/types';
import { buildSystemPrompt } from '@/lib/personas/system-prompt';
import type { ContextAnswer } from '@/lib/critique/types';

type ImageInput = { mediaType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'; base64: string };

type Body = {
  personaId?: string;
  contextAnswers?: ContextAnswer;
  images?: ImageInput[];
};

function isPersonaId(x: unknown): x is PersonaId {
  return typeof x === 'string' && (PERSONA_IDS as readonly string[]).includes(x);
}

// Gemini 일시 과부하(503) 또는 레이트 리밋(429)에 한해 exponential backoff + jitter로 재시도
// 6 페르소나 동시 호출 + 같은 모델·동일 시점이라 jitter 없으면 재시도도 동시에 떨어진다
async function streamWithRetry(
  ai: GoogleGenAI,
  params: GenerateContentParameters,
  maxAttempts = 3,
): Promise<AsyncGenerator<GenerateContentResponse>> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await ai.models.generateContentStream(params);
    } catch (err: unknown) {
      lastErr = err;
      const status = (err as { status?: number })?.status;
      const retryable = status === 503 || status === 429;
      if (!retryable || attempt === maxAttempts) throw err;
      const base = Math.min(1500 * 2 ** (attempt - 1), 6000);
      const jitter = Math.random() * 800;
      await new Promise((r) => setTimeout(r, base + jitter));
    }
  }
  throw lastErr;
}

// 사용자 메시지: 이미지 inlineData 파트들 + 맥락 텍스트 1개
function buildUserParts(contextAnswers: ContextAnswer, images: ImageInput[]) {
  const contextText = [
    `[작업 종류] ${contextAnswers.workKind}`,
    `[핵심 문제] ${contextAnswers.coreProblem}`,
    `[역할] ${contextAnswers.role}`,
    contextAnswers.proudDecision
      ? `[자랑하고 싶은 결정] ${contextAnswers.proudDecision}`
      : '[자랑하고 싶은 결정] (응답 없음)',
    '',
    '위 맥락과 아래 화면을 보고, 당신의 페르소나로 크리틱 카드 JSON을 출력하라.',
  ].join('\n');

  return [
    ...images.map((img) => ({ inlineData: { mimeType: img.mediaType, data: img.base64 } })),
    { text: contextText },
  ];
}

export async function POST(req: Request): Promise<Response> {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response('invalid json', { status: 400 });
  }

  if (!isPersonaId(body.personaId)) return new Response('invalid personaId', { status: 400 });
  if (!body.contextAnswers || typeof body.contextAnswers.coreProblem !== 'string')
    return new Response('missing contextAnswers', { status: 400 });
  if (!Array.isArray(body.images) || body.images.length === 0)
    return new Response('missing images', { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return new Response('server misconfigured', { status: 500 });

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = buildSystemPrompt(body.personaId);
  const parts = buildUserParts(body.contextAnswers, body.images);

  // generateContentStream은 AsyncGenerator<GenerateContentResponse>를 반환
  let stream: AsyncGenerator<GenerateContentResponse>;
  try {
    stream = await streamWithRetry(ai, {
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction,
        maxOutputTokens: 800,
        responseMimeType: 'application/json',
      },
    });
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status ?? 500;
    const message = err instanceof Error ? err.message : 'unknown';
    return new Response(`gemini error: ${message.slice(0, 200)}`, { status });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.text;
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
