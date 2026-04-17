/**
 * Role: Gemini API 스트리밍 프록시 — 페르소나 1명 크리틱 생성
 * Key Features: 서버 사이드 전용 (API 키 보호), 이미지+맥락+페르소나 system prompt 조립, 스트리밍 패스스루
 * Dependencies: @google/genai, @/lib/personas, @/lib/critique
 * Notes: 클라이언트는 페르소나별로 이 엔드포인트를 병렬 호출한다 (§4.6 STEP 4)
 */
import { GoogleGenAI } from '@google/genai';
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
  const stream = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts }],
    config: {
      systemInstruction,
      maxOutputTokens: 800,
      responseMimeType: 'application/json',
    },
  });

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
