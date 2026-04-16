# 디자인 크리틱 파트너

> 완성작 들고 와요. 6명이 봐줍니다.

포트폴리오 스크린샷을 올리면 6인의 "○○ 스타일" 페르소나(토스 PO / 당근 PD / 카카오 센터장 / 네이버 PD / 라인 PM / 우아한 CBO)가 면접·리뷰에서 받을 만한 질문과 피드백을 준다. 강한 충돌 쌍에는 "당신은 어느 쪽?" 입력칸이 떠서 자기 표현의 리허설이 된다.

**디스클레이머**: 각 회사의 공개된 디자인 철학과 블로그/컨퍼런스 발언을 기반으로 재구성한 가상의 페르소나입니다. 실제 해당 회사 또는 직원의 의견을 대변하지 않습니다.

## 개발

```bash
# 1. 의존성 설치
npm install

# 2. .env 셋업 — ANTHROPIC_API_KEY 채우기
cp .env.example .env

# 3. dev 서버
npm run dev
# → http://localhost:3000
```

## 스크립트

| 명령 | 역할 |
|---|---|
| `npm run dev` | 개발 서버 (Next.js, 포트 3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 |
| `npm run typecheck` | TypeScript 체크 |
| `npm test` | Vitest 전체 실행 |
| `npm run test:watch` | Vitest 워치 모드 |

## 기술 스택

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui (중립 색상만 — 회사 브랜드 컬러 차용 금지)
- `@anthropic-ai/sdk` (서버 사이드만, `/api/critique`)
- Zustand (클라이언트 상태)
- Vitest + @testing-library/react (테스트)

## 배포

Vercel 권장. 환경변수 `ANTHROPIC_API_KEY`만 설정하면 됨.

## 문서

- Spec: `docs/specs/2026-04-16-design-critique-partner-spec.md` (단일 진실)
- Plan: `docs/plans/2026-04-17-design-critique-partner-plan.md`
- Legacy: `docs/legacy/` (이전 디자인 토큰·스타일 가이드 참고용)
