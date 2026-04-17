# 디자인 크리틱 파트너 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **단일 출처 (Spec)**: `docs/specs/2026-04-16-design-critique-partner-spec.md`. plan과 spec이 충돌하면 spec이 정답.

**Goal:** 디자이너가 포트폴리오 완성작 스크린샷을 올리면 6명의 회사 스타일 페르소나가 디자인 크리틱과 충돌 관점, 그리고 자기 표현 리허설 입력칸을 제공하는 stateless Next.js 웹 앱 MVP를 만든다.

**Architecture:** Next.js 15 App Router. 클라이언트는 5단계 라우팅(`/` → `/context` → `/personas` → `/critique`)으로 진행하고 Zustand 스토어가 단계 간 상태를 들고 있는다. `/api/critique` Route Handler가 서버 사이드에서 `@anthropic-ai/sdk`로 Claude vision 모델을 페르소나별로 호출하고 텍스트 청크를 ReadableStream으로 클라이언트에 흘려보낸다. DB·계정 없음 (stateless). 테스트는 Vitest + React Testing Library로 데이터·로직·API 검증에 집중하고 UI 폴리시는 수동 스모크.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · Tailwind 4 · shadcn/ui · Zustand · Vitest + RTL · `@anthropic-ai/sdk` (claude-sonnet-4-6, prompt caching on system) · Vercel 배포

**고정 결정 (spec 외 본 plan에서 추가 박제)**:
1. 이미지 전달: 클라이언트에서 base64 인코딩 → `/api/critique` 요청 body에 인라인
2. 클라이언트 상태: Zustand + `persist` 미들웨어 (sessionStorage)
3. 라우팅: 멀티 페이지 (`/`, `/context`, `/personas`, `/critique`)
4. 스트리밍: 서버에서 Anthropic 이벤트 → 텍스트 델타만 추출해 ReadableStream으로 패스, 클라는 chunk append
5. 테스트: Vitest + RTL (e2e는 MVP 범위 밖, STEP별 수동 스모크)
6. Claude 모델: `claude-sonnet-4-6` (6 페르소나 병렬 호출 비용·품질 밸런스). 시스템 프롬프트는 `cache_control: ephemeral`로 캐싱

**파일 구조 (목표)**:

```
울트라플랜/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # STEP 1 랜딩
│   ├── globals.css                   # Tailwind 4 @theme + 디자인 토큰
│   ├── context/page.tsx              # STEP 2
│   ├── personas/page.tsx             # STEP 3
│   ├── critique/page.tsx             # STEP 4 + STEP 5
│   └── api/critique/route.ts         # 서버 사이드 Claude 호출
├── components/
│   ├── ui/                           # shadcn — Button, Card, Checkbox, Textarea, Input
│   ├── ImageDropzone.tsx
│   ├── ContextForm.tsx
│   ├── PersonaCheckbox.tsx
│   ├── ConflictPreview.tsx
│   ├── PersonaCard.tsx
│   ├── ConflictCard.tsx
│   └── Disclaimer.tsx
├── lib/
│   ├── personas.ts                   # Persona 타입 + 6인 데이터
│   ├── personas.test.ts
│   ├── prompts.ts                    # system prompt 빌더
│   ├── prompts.test.ts
│   ├── conflicts.ts                  # 6×6 매트릭스 + 룩업
│   ├── conflicts.test.ts
│   ├── store.ts                      # Zustand
│   ├── store.test.ts
│   ├── claude.ts                     # Anthropic SDK 래퍼 (서버용)
│   ├── streaming.ts                  # 클라이언트 fetch + reader 훅
│   └── utils.ts                      # cn 등
├── tests/setup.ts                    # RTL/jest-dom 셋업
├── docs/
│   ├── specs/2026-04-16-design-critique-partner-spec.md
│   ├── plans/2026-04-17-design-critique-partner-plan.md
│   └── legacy/                       # design-system.html + design-tokens.md
├── public/
├── .env.example                      # ANTHROPIC_API_KEY=...
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── vitest.config.ts
├── components.json                   # shadcn
├── package.json
└── README.md
```

**커밋 규칙 (CLAUDE.md 따름)**: `[what] — [why]` 형식. 영어 동사로 시작, em-dash 뒤에 동기. `Co-Authored-By` 필수.

---

# Phase 0 — Foundation & Cleanup

CRM 잔재 제거 → Next.js 기반 마련 → 테스트·디자인 시스템 가동.

## Task 0.1: 잔재 자료를 `docs/legacy/`로 이동

**Files:**
- Create: `docs/legacy/.gitkeep`
- Move: `design-system.html` → `docs/legacy/design-system.html`
- Move: `docs/design-tokens.md` → `docs/legacy/design-tokens.md`

- [ ] **Step 1: `docs/legacy/` 폴더 만들고 두 파일 이동**

```bash
mkdir -p docs/legacy
git mv design-system.html docs/legacy/design-system.html
git mv docs/design-tokens.md docs/legacy/design-tokens.md
touch docs/legacy/.gitkeep
```

- [ ] **Step 2: 이동 결과 확인**

```bash
ls docs/legacy
```
Expected: `.gitkeep  design-system.html  design-tokens.md`

- [ ] **Step 3: Commit**

```bash
git add docs/legacy design-system.html docs/design-tokens.md
git commit -m "$(cat <<'EOF'
Move legacy assets to docs/legacy — preserve CRM-era design tokens for reference without polluting active workspace

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 0.2: CRM Kanban 코드 폐기

**Files:**
- Delete: `src/` (전체)
- Delete: `dist/`
- Delete: `index.html`, `vite.config.ts`

- [ ] **Step 1: 폐기 대상 일괄 삭제**

```bash
rm -rf src dist
rm -f index.html vite.config.ts
```

- [ ] **Step 2: `dist/`가 `.gitignore`에 있는지 확인 (없으면 추가)**

```bash
grep -q '^dist' .gitignore || echo "dist" >> .gitignore
```

- [ ] **Step 3: 폴더 상태 검증**

```bash
ls
```
Expected: 더 이상 `src`, `dist`, `index.html`, `vite.config.ts` 없음. `package.json`, `package-lock.json`, `tsconfig.json`, `docs`, `node_modules`, `.env*`, `.gitignore`, `metadata.json`, `README.md`만 남음.

- [ ] **Step 4: Commit**

```bash
git add -A
git status   # 삭제 목록만 보이는지 확인
git commit -m "$(cat <<'EOF'
Discard CRM kanban codebase — clean slate before Next.js migration; spec §6.1 confirms src/ is unsalvageable

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 0.3: `package.json` 갈아엎고 Next.js + 신규 의존성 설치

**Files:**
- Modify: `package.json` (전체 교체)
- Generate: `package-lock.json` (자동)

- [ ] **Step 1: `package.json`을 새 내용으로 교체**

```json
{
  "name": "design-critique-partner",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.546.0",
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^3.5.0",
    "zod": "^3.23.8",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.14",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^22.14.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.0.4",
    "autoprefixer": "^10.4.21",
    "jsdom": "^25.0.1",
    "tailwindcss": "^4.1.14",
    "typescript": "~5.8.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: 락파일 갱신 + 설치**

```bash
rm -f package-lock.json
npm install
```
Expected: 정상 설치 완료, 경고는 OK, 에러 없음.

- [ ] **Step 3: Next.js 바이너리 동작 확인**

```bash
npx next --version
```
Expected: `15.x.x`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "$(cat <<'EOF'
Replace deps with Next.js stack — drop vite/express/recharts/date-fns/motion/dotenv/tsx; add next, zustand, zod, vitest, RTL

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 0.4: Next.js App Router 스켈레톤 + tsconfig

**Files:**
- Create: `next.config.ts`
- Create: `tsconfig.json` (Next.js 형식으로 교체)
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `next-env.d.ts` (자동 생성)

- [ ] **Step 1: `next.config.ts` 생성**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

- [ ] **Step 2: `tsconfig.json` Next.js 형식으로 교체**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "docs/legacy"]
}
```

- [ ] **Step 3: `app/layout.tsx` 생성**

```tsx
/**
 * Role: Next.js App Router 루트 레이아웃 — 한국어 lang, body 폰트 baseline
 * Key Features: 글로벌 메타데이터, globals.css 임포트
 * Dependencies: app/globals.css
 */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "디자인 크리틱 파트너",
  description:
    "포트폴리오 완성작을 들고 온 디자이너에게 6명의 회사 스타일 페르소나가 면접·리뷰 질문과 피드백을 주는 웹 앱.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-bg text-text-primary antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: `app/page.tsx` 임시 페이지 생성 (Phase 3에서 교체)**

```tsx
/**
 * Role: STEP 1 랜딩 페이지 (Phase 3에서 본격 구현)
 * Key Features: 임시 — Next.js 동작 확인용
 * Dependencies: 없음
 */
export default function HomePage() {
  return <main className="p-8">디자인 크리틱 파트너 — 셋업 OK</main>;
}
```

- [ ] **Step 5: `app/globals.css` 임시 (Tailwind는 Task 0.5에서)**

```css
:root {
  color-scheme: light;
}
```

- [ ] **Step 6: 개발 서버 켜고 200 확인**

```bash
npm run dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
kill %1
```
Expected: `200`

- [ ] **Step 7: Commit**

```bash
git add next.config.ts tsconfig.json app
git commit -m "$(cat <<'EOF'
Add Next.js App Router skeleton — root layout, placeholder home page, ko lang baseline

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 0.5: Tailwind 4 + 자체 디자인 토큰 (회사 컬러 차용 금지)

> spec §4.4 원칙 4: "회사 이름은 빌리되 로고·색·폰트는 차용하지 않는다." → Toss 컬러(#3182F6) 그대로 못 씀. 중립 톤으로 새로 짠다. 이 토큰은 시각 디테일을 건드리는 후속 task에서도 동일하게 쓰인다.

**Files:**
- Create: `postcss.config.mjs`
- Modify: `app/globals.css`

- [ ] **Step 1: `postcss.config.mjs` 생성**

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- [ ] **Step 2: `app/globals.css`에 Tailwind 4 + 디자인 토큰 정의**

```css
@import "tailwindcss";

@theme {
  /* 색상 — 회사 차용 금지. 중립 잉크 + 절제된 액센트 */
  --color-bg: #fafaf9;            /* 페이지 배경 */
  --color-surface: #ffffff;       /* 카드 표면 */
  --color-border: #e7e5e4;
  --color-border-strong: #d6d3d1;

  --color-text-primary: #1c1917;
  --color-text-secondary: #57534e;
  --color-text-muted: #a8a29e;

  --color-accent: #4338ca;        /* indigo-700 — 액션 */
  --color-accent-hover: #3730a3;
  --color-accent-subtle: #eef2ff;

  --color-warm: #c2410c;          /* orange-700 — 충돌 카드 강조 */
  --color-warm-subtle: #fff7ed;

  --color-success: #15803d;
  --color-danger: #b91c1c;

  /* 타이포 */
  --font-sans: "Pretendard Variable", Pretendard, -apple-system,
    BlinkMacSystemFont, system-ui, sans-serif;

  /* 라운드 */
  --radius-card: 0.75rem;
}

html, body {
  font-family: var(--font-sans);
}
```

- [ ] **Step 3: 토큰이 적용되는지 확인 — `app/page.tsx`에 토큰 클래스 잠깐 사용**

```tsx
export default function HomePage() {
  return (
    <main className="p-8 bg-surface border border-border rounded-card text-text-primary">
      <h1 className="text-2xl font-semibold">디자인 크리틱 파트너 — 셋업 OK</h1>
      <p className="mt-2 text-text-secondary">디자인 토큰 동작 확인용</p>
    </main>
  );
}
```

- [ ] **Step 4: 개발 서버에서 시각 확인 (수동)**

```bash
npm run dev
```
Expected: `http://localhost:3000/`에 위 카드가 흰 배경, 보더, 회색 보조 텍스트로 보임. 확인 후 ctrl+c.

- [ ] **Step 5: Commit**

```bash
git add postcss.config.mjs app/globals.css app/page.tsx
git commit -m "$(cat <<'EOF'
Add Tailwind 4 + neutral design tokens — own palette per spec §4.4 (no Toss/Kakao color borrowing)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 0.6: shadcn/ui init + 핵심 5개 컴포넌트 추가

**Files:**
- Create: `components.json` (shadcn 자동)
- Create: `components/ui/button.tsx`, `card.tsx`, `checkbox.tsx`, `textarea.tsx`, `input.tsx`
- Create: `lib/utils.ts` (cn 헬퍼 — shadcn이 자동 생성)

- [ ] **Step 1: shadcn 초기화 (Tailwind 4, neutral baseline)**

```bash
npx shadcn@latest init -y --base-color neutral
```
Expected: `components.json` 생성, `lib/utils.ts` 생성, `components/ui/` 폴더 준비.

- [ ] **Step 2: 컴포넌트 5개 일괄 추가**

```bash
npx shadcn@latest add -y button card checkbox textarea input
```
Expected: `components/ui/`에 5개 파일 생성.

- [ ] **Step 3: 빌드 확인**

```bash
npm run typecheck
```
Expected: 에러 없음.

- [ ] **Step 4: Commit**

```bash
git add components components.json lib/utils.ts
git commit -m "$(cat <<'EOF'
Add shadcn/ui base components — Button, Card, Checkbox, Textarea, Input for upcoming forms

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 0.7: Vitest + RTL 셋업 + 스모크 테스트

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `tests/smoke.test.ts`

- [ ] **Step 1: `vitest.config.ts` 생성**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
});
```

- [ ] **Step 2: `tests/setup.ts` 생성 — jest-dom matcher 등록**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: 스모크 테스트 작성 (실패 → 통과 사이클 검증용)**

```ts
// tests/smoke.test.ts
import { describe, it, expect } from "vitest";

describe("vitest smoke", () => {
  it("기본 산술이 동작한다", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: 테스트 실행 확인**

```bash
npm test
```
Expected: `1 passed`

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts tests
git commit -m "$(cat <<'EOF'
Set up Vitest + RTL with jsdom — TDD harness for personas, prompts, conflict matrix, store

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 0.8: README · metadata · .env.example 갈아엎기

**Files:**
- Modify: `README.md` (Gemini 템플릿 잔재 → 디자인 크리틱 파트너)
- Modify: `metadata.json` (`"New CRM"` 잔재 → 본 프로젝트)
- Modify: `.env.example` (Anthropic 키만 명시)

- [ ] **Step 1: `README.md` 새로 쓰기**

```markdown
# 디자인 크리틱 파트너

포트폴리오 완성작을 들고 온 디자이너에게, 6명의 회사 스타일 페르소나가 면접·리뷰에서 받을 만한 질문과 피드백을 주는 웹 앱. 자기 어필이 어려운 한국 프로덕트 디자이너를 위한 자기 표현의 리허설.

## 개발 환경

```bash
npm install
cp .env.example .env.local   # ANTHROPIC_API_KEY 채우기
npm run dev                  # http://localhost:3000
```

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm test` | Vitest 단위 테스트 |
| `npm run typecheck` | 타입 체크 |

## 문서

- Spec: `docs/specs/2026-04-16-design-critique-partner-spec.md`
- Plan: `docs/plans/2026-04-17-design-critique-partner-plan.md`
- 레거시 참고 자료 (CRM 시절): `docs/legacy/`

## 디스클레이머

각 페르소나는 회사의 공개된 디자인 철학·블로그·컨퍼런스 발언을 기반으로 재구성한 가상의 인물입니다. 실제 해당 회사 또는 직원의 의견을 대변하지 않습니다.
```

- [ ] **Step 2: `metadata.json` 새로 쓰기**

```json
{
  "name": "design-critique-partner",
  "description": "6명의 회사 스타일 페르소나가 디자인 크리틱과 충돌 관점, 자기 표현 리허설을 주는 웹 앱",
  "version": "0.1.0"
}
```

- [ ] **Step 3: `.env.example` 정리 (Anthropic 키만)**

```bash
# .env.example
# Claude API 키. 서버 사이드(Next.js Route Handler)에서만 사용.
# 절대 NEXT_PUBLIC_ 접두사 붙이지 말 것 — 클라이언트 번들에 노출됨.
ANTHROPIC_API_KEY=
```

- [ ] **Step 4: `.env`가 `.gitignore`로 보호되는지 재확인**

```bash
grep -E '^\.env' .gitignore
```
Expected: `.env*` 또는 `.env` + `!.env.example` 패턴 존재.

- [ ] **Step 5: Commit**

```bash
git add README.md metadata.json .env.example
git commit -m "$(cat <<'EOF'
Rewrite README/metadata/.env.example — replace Gemini and CRM template residue with project identity

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 0.9: Zustand 클라이언트 스토어 + 테스트

> 5단계 사이에 들고 다닐 상태: 업로드된 이미지(base64 배열), 맥락 4질문 답, 선택된 페르소나 ID 배열, STEP 5 리허설 입력 맵. sessionStorage로 새로고침 보호.

**Files:**
- Create: `lib/store.ts`
- Create: `lib/store.test.ts`

- [ ] **Step 1: 실패 테스트 먼저 — `lib/store.test.ts`**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { useFlowStore } from "./store";

describe("useFlowStore", () => {
  beforeEach(() => {
    useFlowStore.getState().reset();
  });

  it("초기 상태는 빈 값", () => {
    const s = useFlowStore.getState();
    expect(s.images).toEqual([]);
    expect(s.context).toEqual({ kind: "", problem: "", role: "", proud: "" });
    expect(s.selectedPersonaIds).toEqual([]);
    expect(s.rehearsalAnswers).toEqual({});
  });

  it("setImages로 이미지를 저장한다", () => {
    useFlowStore.getState().setImages([{ name: "a.png", dataUrl: "data:..." }]);
    expect(useFlowStore.getState().images).toHaveLength(1);
  });

  it("setRehearsalAnswer는 키별로 답을 누적한다", () => {
    useFlowStore.getState().setRehearsalAnswer("toss-po-x-woowa-cbo", "전환율");
    useFlowStore.getState().setRehearsalAnswer("toss-po-x-kakao-dc", "지금");
    expect(useFlowStore.getState().rehearsalAnswers).toEqual({
      "toss-po-x-woowa-cbo": "전환율",
      "toss-po-x-kakao-dc": "지금",
    });
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npm test -- lib/store.test.ts
```
Expected: FAIL — `Cannot find module './store'`

- [ ] **Step 3: `lib/store.ts` 구현**

```ts
/**
 * Role: 5단계 플로우 사이의 클라이언트 상태 — 이미지·맥락답·페르소나선택·리허설입력
 * Key Features: Zustand + persist(sessionStorage). 새로고침 보호. DB 없음.
 * Dependencies: zustand
 * Notes: 모든 상태는 클라이언트 한정. 서버로 가는 건 /api/critique 호출 시 명시적으로만.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UploadedImage = { name: string; dataUrl: string };

export type ContextAnswers = {
  kind: string;       // 객관식 — 작업 종류
  problem: string;    // 자유 — 핵심 문제 (50자 이내 권장)
  role: string;       // 객관식 — 본인 역할
  proud: string;      // 자유 옵션 — 자랑하고 싶은 결정
};

type FlowState = {
  images: UploadedImage[];
  context: ContextAnswers;
  selectedPersonaIds: string[];
  rehearsalAnswers: Record<string, string>; // key: `${pA}-x-${pB}` (id 정렬), value: 사용자 답

  setImages: (i: UploadedImage[]) => void;
  setContext: (c: Partial<ContextAnswers>) => void;
  setSelectedPersonaIds: (ids: string[]) => void;
  setRehearsalAnswer: (conflictKey: string, answer: string) => void;
  reset: () => void;
};

const initialState = {
  images: [] as UploadedImage[],
  context: { kind: "", problem: "", role: "", proud: "" } as ContextAnswers,
  selectedPersonaIds: [] as string[],
  rehearsalAnswers: {} as Record<string, string>,
};

export const useFlowStore = create<FlowState>()(
  persist(
    (set) => ({
      ...initialState,
      setImages: (images) => set({ images }),
      setContext: (c) => set((s) => ({ context: { ...s.context, ...c } })),
      setSelectedPersonaIds: (selectedPersonaIds) => set({ selectedPersonaIds }),
      setRehearsalAnswer: (key, answer) =>
        set((s) => ({ rehearsalAnswers: { ...s.rehearsalAnswers, [key]: answer } })),
      reset: () => set({ ...initialState }),
    }),
    {
      name: "design-critique-flow",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test -- lib/store.test.ts
```
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/store.ts lib/store.test.ts
git commit -m "$(cat <<'EOF'
Add Zustand flow store — carry images, context answers, selected personas, rehearsal text across STEP 1-5

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

# Phase 1 — Persona 데이터 레이어

순수 데이터·로직. 이 phase가 끝나면 페르소나 6인, system prompt 빌드, 충돌 룩업이 모두 단위 테스트로 보호된다.

## Task 1.1: `Persona` 타입 + 6인 데이터 + shape 테스트

**Files:**
- Create: `lib/personas.ts`
- Create: `lib/personas.test.ts`

- [ ] **Step 1: 실패 테스트 먼저**

```ts
// lib/personas.test.ts
import { describe, it, expect } from "vitest";
import { PERSONAS, PERSONA_IDS } from "./personas";

describe("PERSONAS", () => {
  it("정확히 6명이다", () => {
    expect(PERSONAS).toHaveLength(6);
  });

  it("ID 6개가 spec §2.1 매핑과 일치한다", () => {
    expect(PERSONA_IDS).toEqual([
      "toss-po", "daangn-spd", "kakao-dc", "naver-spd", "line-pm", "woowa-cbo",
    ]);
  });

  it("모든 페르소나가 필수 필드를 가진다", () => {
    for (const p of PERSONAS) {
      expect(p.id).toBeTruthy();
      expect(p.label).toContain("스타일");           // 풀이 2 규칙: '○○ 스타일'
      expect(p.firstLens).toBeTruthy();
      expect(p.questionDomain).toBeTruthy();
      expect(p.sampleQuestion).toBeTruthy();
      expect(p.nonNegotiables.length).toBeGreaterThan(0);
      expect(p.tradeoffs.length).toBeGreaterThan(0);
    }
  });

  it("ID는 모두 유니크", () => {
    const ids = PERSONAS.map((p) => p.id);
    expect(new Set(ids).size).toBe(6);
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npm test -- lib/personas.test.ts
```
Expected: FAIL — `Cannot find module './personas'`

- [ ] **Step 3: `lib/personas.ts` 구현**

```ts
/**
 * Role: 6명의 페르소나 정의 — 회사 스타일 라벨 + 핵심 렌즈 + 질문 영역 + 비양보/양보 항목
 * Key Features: spec §2.1·§2.2 박제. UI는 label만 노출하고 회사 로고/색/폰트는 차용 금지.
 * Dependencies: 없음 (순수 데이터)
 * Notes: systemPrompt 본문은 별도 lib/prompts.ts의 빌더에서 합성. 여기는 raw 재료만.
 */

export type Persona = {
  id: string;
  label: string;            // "토스 스타일 PO" — 풀이 2
  firstLens: string;        // 핵심 렌즈
  questionDomain: string;   // 디자이너에게 던지는 질문 영역
  sampleQuestion: string;   // 대표 질문
  nonNegotiables: string[]; // 절대 양보 안 하는 것
  tradeoffs: string[];      // 양보 가능한 것
};

export const PERSONAS: Persona[] = [
  {
    id: "toss-po",
    label: "토스 스타일 PO",
    firstLens: "숫자 · 한 액션",
    questionDomain: "시각적 위계 · 시선 흐름 · 단일 액션 강조",
    sampleQuestion: "이 화면에서 사용자 시선이 가장 먼저 가는 곳이 어디야?",
    nonNegotiables: ["가장 중요한 한 액션이 시각적으로 압도적이어야 한다", "시선 흐름이 측정 가능해야 한다"],
    tradeoffs: ["여백의 정서", "장기 일관성"],
  },
  {
    id: "daangn-spd",
    label: "당근 스타일 시니어 PD",
    firstLens: "생활 맥락 · 로컬",
    questionDomain: "글자 크기 · 친숙한 메타포 · 비전문가 접근성",
    sampleQuestion: "우리 엄마 핸드폰에서 이 글자가 읽힐까?",
    nonNegotiables: ["비전문가가 망설임 없이 따라올 수 있어야 한다", "동네 맥락 단어를 쓴다"],
    tradeoffs: ["글로벌 보편성", "세련된 미감"],
  },
  {
    id: "kakao-dc",
    label: "카카오 스타일 디자인 센터장",
    firstLens: "시스템 · 장기 일관성",
    questionDomain: "컴포넌트 재사용성 · 토큰 일관성 · 패턴 확장성",
    sampleQuestion: "이 컴포넌트가 다른 화면에서도 같은 모양으로 등장해?",
    nonNegotiables: ["같은 의미는 같은 컴포넌트로 표현되어야 한다", "토큰 위반은 디자인 부채다"],
    tradeoffs: ["이번 분기 지표", "한 화면의 임팩트"],
  },
  {
    id: "naver-spd",
    label: "네이버 스타일 시니어 PD",
    firstLens: "정보 위계 · 밀도",
    questionDomain: "타이포 위계 · 그룹핑 · 정보 밀도 · 마이크로카피",
    sampleQuestion: "버튼 위 가장 마지막으로 읽히는 텍스트가 뭐야?",
    nonNegotiables: ["사용자가 한 번에 처리할 정보의 묶음이 명확해야 한다", "마이크로카피는 군더더기 없이"],
    tradeoffs: ["감성 여백", "단일 액션 강조"],
  },
  {
    id: "line-pm",
    label: "라인 스타일 글로벌 PM",
    firstLens: "보편성 · 로컬라이제이션",
    questionDomain: "다국어 길이 변동 · 문화 중립 아이콘 · RTL 호환",
    sampleQuestion: "이 텍스트가 일본어로 1.5배 길어져도 깨지지 않아?",
    nonNegotiables: ["언어 길이 변동·RTL에서도 레이아웃이 무너지지 않아야 한다", "문화 의존 메타포는 검증 후"],
    tradeoffs: ["한국 특유의 정서", "동네 맥락 단어"],
  },
  {
    id: "woowa-cbo",
    label: "우아한형제들 스타일 CBO",
    firstLens: "감성 · 브랜드 톤",
    questionDomain: "마이크로 인터랙션 · 컬러 톤 · '기분 좋은 순간'",
    sampleQuestion: "이 화면에서 기분 좋은 순간은 어디야?",
    nonNegotiables: ["사용자가 '아 좋다'라고 느낄 한 순간이 있어야 한다", "브랜드 톤이 기능 사이로 새어 나와야 한다"],
    tradeoffs: ["정보 밀도", "측정 가능한 전환율"],
  },
];

export const PERSONA_IDS = PERSONAS.map((p) => p.id);

export function getPersonaById(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test -- lib/personas.test.ts
```
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/personas.ts lib/personas.test.ts
git commit -m "$(cat <<'EOF'
Add Persona type + 6 personas data — spec §2.1 mapping with label/firstLens/questionDomain/non-negotiables

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 1.2: System prompt 빌더 + 테스트

> spec §4.5(공통 톤) + §4.4(7원칙) + §4.3(가드레일 200자 + 디자이너 언어) + §2.1(페르소나별 영역) 합성. 출력은 Anthropic system 메시지 콘텐츠 블록 배열로 — 첫 블록(공통 톤·7원칙·가드레일)은 `cache_control: ephemeral`로 캐싱, 두 번째 블록(페르소나 고유)도 캐싱.

**Files:**
- Create: `lib/prompts.ts`
- Create: `lib/prompts.test.ts`

- [ ] **Step 1: 실패 테스트 먼저**

```ts
// lib/prompts.test.ts
import { describe, it, expect } from "vitest";
import { buildSystemPrompt, COMMON_TONE_BLOCK, buildUserPrompt } from "./prompts";
import { getPersonaById } from "./personas";

describe("buildSystemPrompt", () => {
  it("두 개의 캐시된 텍스트 블록을 반환한다", () => {
    const tossPo = getPersonaById("toss-po")!;
    const blocks = buildSystemPrompt(tossPo);
    expect(blocks).toHaveLength(2);
    for (const b of blocks) {
      expect(b.type).toBe("text");
      expect(b.cache_control).toEqual({ type: "ephemeral" });
    }
  });

  it("첫 블록은 공통 톤·7원칙·가드레일을 모두 포함", () => {
    const tossPo = getPersonaById("toss-po")!;
    const [common] = buildSystemPrompt(tossPo);
    expect(common.text).toContain("디자이너 언어");
    expect(common.text).toContain("크리틱은 판결이 아니라 대화");
    expect(common.text).toContain("질문에 무게중심");
    expect(common.text).toContain("200자");      // 가드레일 §4.3
    expect(common.text).toContain("한 줄 진단");
  });

  it("두 번째 블록은 해당 페르소나의 라벨·렌즈·영역·대표질문을 포함", () => {
    const woowa = getPersonaById("woowa-cbo")!;
    const [, persona] = buildSystemPrompt(woowa);
    expect(persona.text).toContain("우아한형제들 스타일 CBO");
    expect(persona.text).toContain("감성 · 브랜드 톤");
    expect(persona.text).toContain("기분 좋은 순간");
  });
});

describe("COMMON_TONE_BLOCK", () => {
  it("회사 머릿속 비즈니스 언어 금지를 명시", () => {
    expect(COMMON_TONE_BLOCK).toContain("전환율");
    expect(COMMON_TONE_BLOCK).toContain("MAU");
  });
});

describe("buildUserPrompt", () => {
  it("맥락 4질문을 모두 포함한다", () => {
    const text = buildUserPrompt({
      kind: "실무 출시작",
      problem: "약관 동의 화면 가독성",
      role: "PD 단독",
      proud: "필수/선택 그룹화",
    });
    expect(text).toContain("실무 출시작");
    expect(text).toContain("약관 동의 화면 가독성");
    expect(text).toContain("PD 단독");
    expect(text).toContain("필수/선택 그룹화");
  });

  it("자랑하고 싶은 결정이 비어있어도 깨지지 않는다", () => {
    const text = buildUserPrompt({
      kind: "사이드 프로젝트",
      problem: "x",
      role: "기타",
      proud: "",
    });
    expect(text).toContain("사이드 프로젝트");
    expect(text).not.toContain("자랑하고 싶은 결정: \n");  // 빈 값 누락 처리
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npm test -- lib/prompts.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: `lib/prompts.ts` 구현**

```ts
/**
 * Role: Claude 호출용 system / user 프롬프트 빌더 — spec §4.3·§4.4·§4.5 합성
 * Key Features: 두 개의 캐시 블록(공통 톤+7원칙+가드레일 / 페르소나 고유). 디자이너 언어 강제.
 * Dependencies: lib/personas (Persona 타입)
 * Notes: 출력 가드레일(200자, 한 줄 진단 40자, 질문 50자, 제안 80자)은 system에 박제.
 *        사용자가 자유롭게 답하면 빈 필드는 프롬프트에서 누락한다 (모델 혼란 방지).
 */
import type { Persona } from "./personas";
import type { ContextAnswers } from "./store";

export const COMMON_TONE_BLOCK = `당신은 한국의 시니어 프로덕트 디자인 동료입니다. 디자이너가 완성된 작업을 포트폴리오로 들고 와서 보여줄 때, 면접·포트폴리오 리뷰어의 시선으로 봅니다. 회의실 동료가 아니라 첫 만남의 리뷰어입니다.

# 7가지 원칙
1. 크리틱은 판결이 아니라 대화다.
2. 답이 아니라 질문에 무게중심을 둔다.
3. 여백을 두려워하지 않는다. 침묵도 피드백이다.
4. 회사 이름은 빌리되 로고·색·폰트는 차용하지 않는다.
5. 디자이너에게는 디자이너 언어로 말한다.
6. 평가가 아니라 동료의 피드백이다. 완성작이 다음 작업으로 이어지도록 본다.
7. 자기 표현의 리허설이다. 디자이너가 자기 작업을 더 잘 이야기하게 돕는다.

# 언어 변환 규칙
당신 머릿속의 비즈니스 언어(전환율, MAU, 법적 필수, OKR 등)로 묻지 마십시오. 디자이너가 답할 수 있고 디자인 결정으로 연결되는 언어(시각적 위계, 그룹핑, 시선 흐름, 컴포넌트 일관성, 마이크로카피, 메타포 등)로 변환해서 묻습니다.

# 출력 포맷 (엄격)
다음 마크다운 구조를 그대로 사용하십시오. **카드 전체가 약 200자 이내**여야 합니다.

**🩺 한 줄 진단**: (40자 이내)
**❓ 질문**
1. (50자 이내)
2. (50자 이내)
3. (50자 이내)
**💡 제안**
- (80자 이내)
- (80자 이내, 옵션)

자기 영역(아래 페르소나 정의의 질문 영역)을 벗어나는 주제는 다른 페르소나에게 양보하십시오. 답을 강요하지 마십시오.`;

function buildPersonaBlock(p: Persona): string {
  return `# 당신의 페르소나 — ${p.label}

- 핵심 렌즈: ${p.firstLens}
- 질문 영역: ${p.questionDomain}
- 절대 양보 안 함: ${p.nonNegotiables.join(" / ")}
- 양보 가능: ${p.tradeoffs.join(" / ")}
- 대표 질문 톤 예시: "${p.sampleQuestion}"

이 렌즈로만 보십시오. 다른 페르소나의 영역(예: 글로벌 PM의 다국어 길이, 카카오 센터장의 토큰 일관성)은 건드리지 마십시오.`;
}

export type SystemBlock = {
  type: "text";
  text: string;
  cache_control: { type: "ephemeral" };
};

export function buildSystemPrompt(persona: Persona): SystemBlock[] {
  return [
    { type: "text", text: COMMON_TONE_BLOCK, cache_control: { type: "ephemeral" } },
    { type: "text", text: buildPersonaBlock(persona), cache_control: { type: "ephemeral" } },
  ];
}

export function buildUserPrompt(ctx: ContextAnswers): string {
  const lines: string[] = ["다음은 디자이너가 보내준 맥락입니다.", ""];
  lines.push(`작업 종류: ${ctx.kind}`);
  if (ctx.problem.trim()) lines.push(`핵심 문제: ${ctx.problem.trim()}`);
  lines.push(`본인의 역할: ${ctx.role}`);
  if (ctx.proud.trim()) lines.push(`자랑하고 싶은 결정: ${ctx.proud.trim()}`);
  lines.push(
    "",
    "첨부된 스크린샷을 당신의 페르소나 렌즈로 보고, 출력 포맷에 맞춰 한 장의 카드만 작성하십시오.",
  );
  return lines.join("\n");
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test -- lib/prompts.test.ts
```
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/prompts.ts lib/prompts.test.ts
git commit -m "$(cat <<'EOF'
Add system + user prompt builders — spec §4.3-4.5 baked in, two ephemeral cache blocks per persona

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 1.3: 충돌 매트릭스 + `getStrongConflicts` 룩업 + 테스트

> spec §3.1 6×6 매트릭스 박제, §3.2의 강한 충돌 5쌍을 데이터로 떨어트림. 룩업 함수는 STEP 3 미리보기와 STEP 5 카드 자동 트리거에 둘 다 쓰임.

**Files:**
- Create: `lib/conflicts.ts`
- Create: `lib/conflicts.test.ts`

- [ ] **Step 1: 실패 테스트 먼저**

```ts
// lib/conflicts.test.ts
import { describe, it, expect } from "vitest";
import {
  STRONG_CONFLICTS, getStrongConflicts, conflictKey,
} from "./conflicts";

describe("STRONG_CONFLICTS", () => {
  it("정확히 5쌍이다 (spec §3.2)", () => {
    expect(STRONG_CONFLICTS).toHaveLength(5);
  });

  it("각 쌍은 서로 다른 페르소나 ID, 테마, 두 페르소나 입장 한 줄을 가진다", () => {
    for (const c of STRONG_CONFLICTS) {
      expect(c.a).not.toBe(c.b);
      expect(c.theme).toBeTruthy();
      expect(c.framing).toBeTruthy();
      expect(c.stanceA).toBeTruthy();
      expect(c.stanceB).toBeTruthy();
    }
  });

  it("spec에 명시된 5쌍이 모두 존재", () => {
    const pairs = new Set(STRONG_CONFLICTS.map((c) => conflictKey(c.a, c.b)));
    expect(pairs.has(conflictKey("toss-po", "woowa-cbo"))).toBe(true);
    expect(pairs.has(conflictKey("toss-po", "kakao-dc"))).toBe(true);
    expect(pairs.has(conflictKey("daangn-spd", "line-pm"))).toBe(true);
    expect(pairs.has(conflictKey("naver-spd", "woowa-cbo"))).toBe(true);
    expect(pairs.has(conflictKey("line-pm", "woowa-cbo"))).toBe(true);
  });
});

describe("conflictKey", () => {
  it("입력 순서와 무관하게 같은 키를 만든다", () => {
    expect(conflictKey("toss-po", "woowa-cbo")).toBe(conflictKey("woowa-cbo", "toss-po"));
  });
});

describe("getStrongConflicts", () => {
  it("선택 0~1명이면 빈 배열", () => {
    expect(getStrongConflicts([])).toEqual([]);
    expect(getStrongConflicts(["toss-po"])).toEqual([]);
  });

  it("선택된 페르소나 사이의 강한 충돌만 반환한다", () => {
    const result = getStrongConflicts(["toss-po", "woowa-cbo", "naver-spd"]);
    const keys = result.map((c) => conflictKey(c.a, c.b)).sort();
    expect(keys).toEqual(
      [
        conflictKey("toss-po", "woowa-cbo"),
        conflictKey("naver-spd", "woowa-cbo"),
      ].sort()
    );
  });

  it("6명 전체 선택 시 5쌍 모두", () => {
    const all = ["toss-po", "daangn-spd", "kakao-dc", "naver-spd", "line-pm", "woowa-cbo"];
    expect(getStrongConflicts(all)).toHaveLength(5);
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npm test -- lib/conflicts.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: `lib/conflicts.ts` 구현**

```ts
/**
 * Role: 페르소나 간 강한 충돌 5쌍 데이터 + 선택 인원 기반 룩업
 * Key Features: spec §3.2 박제. 매트릭스 자동 트리거(§4.1)의 데이터 단일 출처.
 * Dependencies: 없음 (페르소나 ID 문자열만 참조)
 * Notes: 중간 충돌(🟡)·약한 충돌(⚪)은 MVP에서 카드화하지 않음 (spec §3.3).
 */

export type StrongConflict = {
  a: string;        // 페르소나 ID
  b: string;        // 페르소나 ID
  theme: string;    // 충돌 테마 (예: "숫자 vs 감성")
  framing: string;  // 프로덕트 프레이밍 한 줄
  stanceA: string;  // a 페르소나의 한 줄 입장
  stanceB: string;  // b 페르소나의 한 줄 입장
};

export const STRONG_CONFLICTS: StrongConflict[] = [
  {
    a: "toss-po", b: "woowa-cbo",
    theme: "숫자 vs 감성",
    framing: "전환율 vs 기분 좋음, 어느 쪽?",
    stanceA: "전환율을 끌어올리는 한 액션이 가장 두드러져야 한다.",
    stanceB: "기능 사이에 '아 좋다' 하는 한 순간이 새어 나와야 한다.",
  },
  {
    a: "toss-po", b: "kakao-dc",
    theme: "지금 증명 vs 3년 후 시스템",
    framing: "이번 분기 지표 vs 3년짜리 일관성",
    stanceA: "지금 이 화면에서 한 액션의 임팩트가 측정 가능해야 한다.",
    stanceB: "이 결정이 다른 화면에서도 같은 모양으로 반복될 수 있어야 한다.",
  },
  {
    a: "daangn-spd", b: "line-pm",
    theme: "로컬 맥락 vs 글로벌 보편성",
    framing: "동네 맥락 vs 해외에서도 통할까",
    stanceA: "동네 맥락 단어와 친숙한 메타포가 신뢰를 만든다.",
    stanceB: "다국어·다문화에서 깨지지 않는 보편 메타포를 골라야 한다.",
  },
  {
    a: "naver-spd", b: "woowa-cbo",
    theme: "정보 밀도 vs 감성 여백",
    framing: "많이 보여줄까 vs 숨통 줄까",
    stanceA: "한 화면에서 사용자가 처리할 정보의 묶음이 충분히 보여야 한다.",
    stanceB: "여백이 곧 호흡이고, 호흡이 곧 브랜드 인상이다.",
  },
  {
    a: "line-pm", b: "woowa-cbo",
    theme: "문화 중립 vs 한국적 감성",
    framing: "어느 나라 사용자도 OK vs 한국인만 아는 그 느낌",
    stanceA: "문화 의존 메타포는 다른 나라에선 노이즈가 된다.",
    stanceB: "한국 사용자의 정서를 잡는 한 디테일은 양보할 수 없다.",
  },
];

export function conflictKey(a: string, b: string): string {
  return [a, b].sort().join("-x-");
}

export function getStrongConflicts(selectedIds: string[]): StrongConflict[] {
  if (selectedIds.length < 2) return [];
  const set = new Set(selectedIds);
  return STRONG_CONFLICTS.filter((c) => set.has(c.a) && set.has(c.b));
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test -- lib/conflicts.test.ts
```
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/conflicts.ts lib/conflicts.test.ts
git commit -m "$(cat <<'EOF'
Add conflict matrix data + lookup — 5 strong conflicts (spec §3.2), used by STEP 3 preview and STEP 5 auto-trigger

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

# Phase 2 — `/api/critique` Route Handler

서버 사이드 Claude 호출. 키 보호, 입력 검증, 텍스트 델타만 추출해 ReadableStream으로 패스. 페르소나 1명당 한 번 호출 (클라가 6번 병렬로 때림).

## Task 2.1: Anthropic SDK 래퍼 + Route 스켈레톤 (Zod 검증 포함)

**Files:**
- Create: `lib/claude.ts`
- Create: `app/api/critique/route.ts`
- Create: `app/api/critique/route.test.ts`

- [ ] **Step 1: 실패 테스트 먼저 — 입력 검증 위주**

```ts
// app/api/critique/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/claude", () => ({
  streamCritique: vi.fn(async function* () {
    yield "테스트 청크";
  }),
}));

import { POST } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/critique", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/critique", () => {
  beforeEach(() => vi.clearAllMocks());

  it("personaId 누락 시 400", async () => {
    const res = await POST(makeRequest({ images: [], context: {} }));
    expect(res.status).toBe(400);
  });

  it("이미지가 1개 미만이면 400", async () => {
    const res = await POST(makeRequest({
      personaId: "toss-po",
      images: [],
      context: { kind: "x", problem: "y", role: "z", proud: "" },
    }));
    expect(res.status).toBe(400);
  });

  it("알 수 없는 personaId면 400", async () => {
    const res = await POST(makeRequest({
      personaId: "unknown",
      images: [{ name: "a.png", dataUrl: "data:image/png;base64,iVBOR" }],
      context: { kind: "x", problem: "y", role: "z", proud: "" },
    }));
    expect(res.status).toBe(400);
  });

  it("정상 요청은 text/plain 스트림을 200으로 반환", async () => {
    const res = await POST(makeRequest({
      personaId: "toss-po",
      images: [{ name: "a.png", dataUrl: "data:image/png;base64,iVBOR" }],
      context: { kind: "실무 출시작", problem: "x", role: "PD 단독", proud: "" },
    }));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/plain");
    const text = await res.text();
    expect(text).toContain("테스트 청크");
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npm test -- app/api/critique/route.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: `lib/claude.ts` 구현 (mock 가능한 async generator 인터페이스)**

```ts
/**
 * Role: Anthropic SDK 래퍼 — 페르소나별 크리틱 텍스트 델타를 async iterable로 흘려준다
 * Key Features: claude-sonnet-4-6 vision, system 프롬프트 캐싱, content_block_delta만 추출
 * Dependencies: @anthropic-ai/sdk, lib/personas, lib/prompts, lib/store(타입)
 * Notes: 서버 한정. ANTHROPIC_API_KEY는 process.env로 자동 주입 (dotenv는 Next.js가 처리).
 */
import Anthropic from "@anthropic-ai/sdk";
import type { Persona } from "./personas";
import type { ContextAnswers } from "./store";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 600;   // 카드 한 장 약 200자 가드레일 + 한국어 토큰 여유

const client = new Anthropic();   // 환경변수에서 키 자동 로드

export type ImagePayload = { name: string; dataUrl: string };

function dataUrlToImageBlock(dataUrl: string) {
  // 형식: data:image/png;base64,iVBOR...
  const match = dataUrl.match(/^data:(image\/(png|jpeg|webp|gif));base64,(.+)$/);
  if (!match) throw new Error("지원하지 않는 이미지 형식입니다. PNG/JPEG/WebP/GIF 만 가능합니다.");
  const [, mediaType, , data] = match;
  return {
    type: "image" as const,
    source: { type: "base64" as const, media_type: mediaType as "image/png", data },
  };
}

export async function* streamCritique(
  persona: Persona,
  images: ImagePayload[],
  context: ContextAnswers,
): AsyncGenerator<string, void, void> {
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: buildSystemPrompt(persona),
    messages: [
      {
        role: "user",
        content: [
          ...images.map((i) => dataUrlToImageBlock(i.dataUrl)),
          { type: "text", text: buildUserPrompt(context) },
        ],
      },
    ],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}
```

- [ ] **Step 4: `app/api/critique/route.ts` 구현 (Zod 검증 + 스트리밍 응답)**

```ts
/**
 * Role: 클라이언트 → Claude 사이의 보호된 게이트웨이 — 키 노출 없이 스트리밍 텍스트 응답
 * Key Features: Zod 검증, 페르소나 ID 화이트리스트, ReadableStream 텍스트 청크 전달
 * Dependencies: zod, lib/claude, lib/personas
 * Notes: 한국어 에러 메시지(CLAUDE.md 원칙). PERSONA_IDS로만 호출 허용.
 */
import { z } from "zod";
import { streamCritique } from "@/lib/claude";
import { getPersonaById, PERSONA_IDS } from "@/lib/personas";

const ImageSchema = z.object({
  name: z.string().min(1),
  dataUrl: z.string().regex(/^data:image\/(png|jpeg|webp|gif);base64,/, "지원하지 않는 이미지 형식입니다."),
});

const ContextSchema = z.object({
  kind: z.string().min(1, "작업 종류를 선택해주세요."),
  problem: z.string(),
  role: z.string().min(1, "역할을 선택해주세요."),
  proud: z.string(),
});

const BodySchema = z.object({
  personaId: z.enum(PERSONA_IDS as [string, ...string[]]),
  images: z.array(ImageSchema).min(1, "이미지를 한 장 이상 올려주세요.").max(8),
  context: ContextSchema,
});

export async function POST(req: Request) {
  let payload: z.infer<typeof BodySchema>;
  try {
    const json = await req.json();
    payload = BodySchema.parse(json);
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues[0]?.message ?? "요청 형식이 올바르지 않습니다." : "요청 형식이 올바르지 않습니다.";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const persona = getPersonaById(payload.personaId);
  if (!persona) {
    return new Response(JSON.stringify({ error: "알 수 없는 페르소나입니다." }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamCritique(persona, payload.images, payload.context)) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "크리틱 생성 중 오류가 발생했습니다.";
        controller.enqueue(encoder.encode(`\n\n[오류] ${message}`));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
```

- [ ] **Step 5: 테스트 통과 확인**

```bash
npm test -- app/api/critique/route.test.ts
```
Expected: 4 passed.

- [ ] **Step 6: 타입 체크**

```bash
npm run typecheck
```
Expected: 에러 없음.

- [ ] **Step 7: Commit**

```bash
git add lib/claude.ts app/api
git commit -m "$(cat <<'EOF'
Add /api/critique route with Zod validation + streaming Claude pass-through — server-side key protection, Korean errors

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2.2: 클라이언트 스트리밍 훅 + 테스트

> 페르소나 1명에 대해 `/api/critique`를 fetch하고 청크를 누적해 React state로 노출. STEP 4 페르소나 카드가 6개 동시에 사용.

**Files:**
- Create: `lib/streaming.ts`
- Create: `lib/streaming.test.ts`

- [ ] **Step 1: 실패 테스트 먼저**

```ts
// lib/streaming.test.ts
import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useStreamingCritique } from "./streaming";

function makeStreamResponse(chunks: string[]) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const c of chunks) controller.enqueue(encoder.encode(c));
      controller.close();
    },
  });
  return new Response(stream, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

describe("useStreamingCritique", () => {
  it("청크가 누적되어 text로 노출되고 done이 true가 된다", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(makeStreamResponse(["안녕", " ", "디자이너"]));
    const { result } = renderHook(() =>
      useStreamingCritique({
        personaId: "toss-po",
        images: [{ name: "a.png", dataUrl: "data:image/png;base64,iVBOR" }],
        context: { kind: "실무 출시작", problem: "x", role: "PD 단독", proud: "" },
      })
    );
    await waitFor(() => expect(result.current.done).toBe(true), { timeout: 1000 });
    expect(result.current.text).toBe("안녕 디자이너");
    expect(result.current.error).toBeNull();
  });

  it("HTTP 400이면 error에 메시지가 들어온다", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "이미지를 한 장 이상 올려주세요." }), {
        status: 400, headers: { "Content-Type": "application/json" },
      })
    );
    const { result } = renderHook(() =>
      useStreamingCritique({
        personaId: "toss-po",
        images: [],
        context: { kind: "", problem: "", role: "", proud: "" },
      })
    );
    await waitFor(() => expect(result.current.error).not.toBeNull(), { timeout: 1000 });
    expect(result.current.error).toContain("이미지를 한 장 이상");
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npm test -- lib/streaming.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: `lib/streaming.ts` 구현**

```ts
/**
 * Role: 클라이언트에서 /api/critique 한 호출의 텍스트 델타를 누적해 React state로 노출
 * Key Features: fetch ReadableStream → TextDecoder → setState. 페르소나당 1 인스턴스.
 * Dependencies: react
 * Notes: 컴포넌트 언마운트 시 AbortController로 요청 취소. 페이지 이탈 시 토큰 낭비 방지.
 */
"use client";

import { useEffect, useState } from "react";
import type { UploadedImage, ContextAnswers } from "./store";

type Args = {
  personaId: string;
  images: UploadedImage[];
  context: ContextAnswers;
};

export function useStreamingCritique({ personaId, images, context }: Args) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/critique", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ personaId, images, context }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          if (!cancelled) {
            setError(body?.error ?? `요청에 실패했습니다 (${res.status}).`);
            setDone(true);
          }
          return;
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done: streamDone, value } = await reader.read();
          if (streamDone) break;
          if (cancelled) return;
          setText((prev) => prev + decoder.decode(value, { stream: true }));
        }
        if (!cancelled) setDone(true);
      } catch (err) {
        if (cancelled) return;
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message ?? "크리틱 생성 중 오류가 발생했습니다.");
        setDone(true);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personaId]);   // 페르소나 단위 1회 호출. images/context 변동은 새 페이지 진입 시만 발생.

  return { text, done, error };
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test -- lib/streaming.test.ts
```
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/streaming.ts lib/streaming.test.ts
git commit -m "$(cat <<'EOF'
Add useStreamingCritique hook — accumulates server text chunks per persona, abortable on unmount

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

# Phase 3 — STEP 1: 랜딩

## Task 3.1: `Disclaimer` 컴포넌트 + 페르소나 라벨 노출

**Files:**
- Create: `components/Disclaimer.tsx`
- Create: `components/Disclaimer.test.tsx`

- [ ] **Step 1: 실패 테스트 먼저**

```tsx
// components/Disclaimer.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Disclaimer } from "./Disclaimer";

describe("Disclaimer", () => {
  it("spec §2.2 디스클레이머 문구를 노출", () => {
    render(<Disclaimer />);
    expect(screen.getByText(/공개된 디자인 철학과 블로그/)).toBeInTheDocument();
    expect(screen.getByText(/실제 해당 회사 또는 직원의 의견을 대변하지 않습니다/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npm test -- components/Disclaimer.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: `components/Disclaimer.tsx` 구현**

```tsx
/**
 * Role: 페르소나가 가상 인물임을 알리는 디스클레이머 — STEP 1, STEP 3 양쪽에서 노출
 * Key Features: spec §2.2 문구 박제. 회사 로고/색/폰트 차용 금지 원칙의 가시 표현.
 * Dependencies: 없음
 */
export function Disclaimer() {
  return (
    <p className="text-sm text-text-muted leading-relaxed">
      각 회사의 공개된 디자인 철학과 블로그/컨퍼런스 발언을 기반으로 재구성한
      가상의 페르소나입니다. 실제 해당 회사 또는 직원의 의견을 대변하지 않습니다.
    </p>
  );
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test -- components/Disclaimer.test.tsx
```
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add components/Disclaimer.tsx components/Disclaimer.test.tsx
git commit -m "$(cat <<'EOF'
Add Disclaimer component — spec §2.2 fictional-persona notice, reusable across STEP 1 and STEP 3

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3.2: `ImageDropzone` 컴포넌트 (다중 업로드 + base64 변환)

**Files:**
- Create: `components/ImageDropzone.tsx`
- Create: `components/ImageDropzone.test.tsx`

- [ ] **Step 1: 실패 테스트 먼저 — `onChange`가 base64 dataUrl을 가진 객체 배열을 받는지**

```tsx
// components/ImageDropzone.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImageDropzone } from "./ImageDropzone";

describe("ImageDropzone", () => {
  it("파일 선택 시 onChange에 base64 dataUrl이 담겨 호출된다", async () => {
    const onChange = vi.fn();
    render(<ImageDropzone onChange={onChange} />);
    const file = new File(["dummy"], "a.png", { type: "image/png" });
    const input = screen.getByLabelText(/스크린샷 선택/);
    await userEvent.upload(input, file);
    expect(onChange).toHaveBeenCalled();
    const arg = onChange.mock.calls[0][0];
    expect(arg).toHaveLength(1);
    expect(arg[0].name).toBe("a.png");
    expect(arg[0].dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it("이미지가 아닌 파일은 거부", async () => {
    const onChange = vi.fn();
    render(<ImageDropzone onChange={onChange} />);
    const file = new File(["x"], "a.txt", { type: "text/plain" });
    const input = screen.getByLabelText(/스크린샷 선택/);
    await userEvent.upload(input, file);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/이미지 파일만/);
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npm test -- components/ImageDropzone.test.tsx
```
Expected: FAIL — module not found.

- [ ] **Step 3: `components/ImageDropzone.tsx` 구현**

```tsx
/**
 * Role: 다중 이미지 드래그앤드롭 + 클릭 업로드 — base64 dataUrl 배열로 부모에 전달
 * Key Features: 이미지 MIME 검증, FileReader → dataUrl, 8장 상한. 미리보기 썸네일.
 * Dependencies: react. 외부 라이브러리 없음 (의도적 — react-dropzone 의존성 회피).
 * Notes: spec §4.6 STEP 1 — 다중 허용은 1차 가안, UX는 구현 후 검토.
 */
"use client";

import { useState } from "react";
import type { UploadedImage } from "@/lib/store";

const MAX_FILES = 8;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("이미지 읽기에 실패했습니다."));
    reader.readAsDataURL(file);
  });
}

export function ImageDropzone({ onChange }: { onChange: (images: UploadedImage[]) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<UploadedImage[]>([]);

  async function handleFiles(fileList: FileList | null) {
    setError(null);
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).slice(0, MAX_FILES);
    const invalid = files.find((f) => !ACCEPTED.includes(f.type));
    if (invalid) {
      setError("이미지 파일만 올릴 수 있어요 (PNG/JPEG/WebP/GIF).");
      return;
    }
    const images = await Promise.all(
      files.map(async (f) => ({ name: f.name, dataUrl: await readAsDataUrl(f) }))
    );
    setPreviews(images);
    onChange(images);
  }

  return (
    <div>
      <label
        htmlFor="screenshot-input"
        className="flex flex-col items-center justify-center gap-2 p-10 border-2 border-dashed border-border rounded-card bg-surface cursor-pointer hover:border-accent transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleFiles(e.dataTransfer.files);
        }}
      >
        <span className="text-text-primary font-medium">스크린샷을 여기로 끌어오거나 클릭해 선택</span>
        <span className="text-sm text-text-muted">PNG / JPEG / WebP / GIF · 최대 8장</span>
      </label>
      <input
        id="screenshot-input"
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        className="sr-only"
        aria-label="스크린샷 선택"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">{error}</p>
      )}
      {previews.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
          {previews.map((p, i) => (
            <li key={i} className="aspect-square overflow-hidden rounded-md border border-border bg-bg">
              <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 테스트용 의존성 — `@testing-library/user-event` 추가 (없으면)**

```bash
npm install -D @testing-library/user-event@^14
```

- [ ] **Step 5: 테스트 통과 확인**

```bash
npm test -- components/ImageDropzone.test.tsx
```
Expected: 2 passed.

- [ ] **Step 6: Commit**

```bash
git add components/ImageDropzone.tsx components/ImageDropzone.test.tsx package.json package-lock.json
git commit -m "$(cat <<'EOF'
Add ImageDropzone — multi-file drag-drop + base64 conversion + thumbnail preview, MIME-validated

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3.3: `app/page.tsx` STEP 1 본 구현 — 헤드라인 + 드롭존 + 6명 라벨 + 다음 단계

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: 페이지 본 구현으로 교체**

```tsx
/**
 * Role: STEP 1 랜딩 — 완성작 들고 와요. 6명이 봐줍니다.
 * Key Features: 헤드라인 / 다중 이미지 드롭존 / 6명 라벨 노출 / 디스클레이머 / 다음 단계
 * Dependencies: components/ImageDropzone, components/Disclaimer, lib/store, lib/personas, next/navigation
 * Notes: 이미지 1장 이상 있어야 다음 단계 활성화.
 */
"use client";

import { useRouter } from "next/navigation";
import { ImageDropzone } from "@/components/ImageDropzone";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { useFlowStore } from "@/lib/store";
import { PERSONAS } from "@/lib/personas";

export default function HomePage() {
  const router = useRouter();
  const images = useFlowStore((s) => s.images);
  const setImages = useFlowStore((s) => s.setImages);
  const canProceed = images.length > 0;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">
          완성작 들고 와요. 6명이 봐줍니다.
        </h1>
        <p className="text-text-secondary">
          포트폴리오 완성작 스크린샷을 올리면, 6명의 회사 스타일 페르소나가
          면접·리뷰에서 받을 만한 질문과 피드백을 줍니다.
        </p>
      </header>

      <ImageDropzone onChange={setImages} />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-text-secondary">오늘의 리뷰어</h2>
        <ul className="flex flex-wrap gap-2">
          {PERSONAS.map((p) => (
            <li key={p.id} className="px-3 py-1 rounded-full text-sm bg-accent-subtle text-accent">
              {p.label}
            </li>
          ))}
        </ul>
      </section>

      <Disclaimer />

      <div className="flex justify-end">
        <Button
          disabled={!canProceed}
          onClick={() => router.push("/context")}
        >
          맥락 적기
        </Button>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 수동 스모크 (개발 서버)**

```bash
npm run dev
```
Browser: `http://localhost:3000/`
체크:
- 헤드라인 + 6명 라벨 + 디스클레이머 보임
- 이미지 1장 올리면 썸네일 노출 + "맥락 적기" 활성화
- 클릭 시 `/context`로 이동(404여도 OK — 다음 task에서 만듦)

- [ ] **Step 3: 타입 체크**

```bash
npm run typecheck
```
Expected: 에러 없음.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "$(cat <<'EOF'
Implement STEP 1 landing page — headline, multi-image dropzone, persona labels, disclaimer, gated next button

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

# Phase 4 — STEP 2: 맥락 대화

## Task 4.1: `ContextForm` 컴포넌트 + 테스트 (4질문 §4.2)

**Files:**
- Create: `components/ContextForm.tsx`
- Create: `components/ContextForm.test.tsx`

- [ ] **Step 1: 실패 테스트 먼저**

```tsx
// components/ContextForm.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContextForm } from "./ContextForm";

describe("ContextForm", () => {
  it("4개 질문 모두 노출", () => {
    render(<ContextForm value={{ kind: "", problem: "", role: "", proud: "" }} onChange={() => {}} />);
    expect(screen.getByLabelText(/이 작업의 종류/)).toBeInTheDocument();
    expect(screen.getByLabelText(/핵심 문제/)).toBeInTheDocument();
    expect(screen.getByLabelText(/본인의 역할/)).toBeInTheDocument();
    expect(screen.getByLabelText(/자랑하고 싶은 결정/)).toBeInTheDocument();
  });

  it("객관식 옵션은 spec §4.2와 일치", () => {
    render(<ContextForm value={{ kind: "", problem: "", role: "", proud: "" }} onChange={() => {}} />);
    const kind = screen.getByLabelText(/이 작업의 종류/) as HTMLSelectElement;
    const opts = Array.from(kind.options).map((o) => o.value);
    expect(opts).toEqual(["", "실무 출시작", "실무 컨셉", "사이드 프로젝트", "학생 작품", "리디자인", "기타"]);
  });

  it("입력 변경 시 onChange가 부분 업데이트로 호출된다", async () => {
    const onChange = vi.fn();
    render(<ContextForm value={{ kind: "", problem: "", role: "", proud: "" }} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText(/핵심 문제/), "약");
    expect(onChange).toHaveBeenLastCalledWith({ problem: "약" });
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npm test -- components/ContextForm.test.tsx
```
Expected: FAIL — module not found.

- [ ] **Step 3: `components/ContextForm.tsx` 구현**

```tsx
/**
 * Role: STEP 2 맥락 대화 4질문 폼 — 객관식 2 + 자유 2 (spec §4.2)
 * Key Features: 제어 컴포넌트. 부분 업데이트(onChange는 변경된 키만)로 부모 store에 반영.
 * Dependencies: components/ui/{input, textarea}, lib/store(타입)
 * Notes: 자랑하고 싶은 결정은 옵션. 종류·역할은 필수(부모에서 검증).
 */
"use client";

import type { ContextAnswers } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const KIND_OPTIONS = ["실무 출시작", "실무 컨셉", "사이드 프로젝트", "학생 작품", "리디자인", "기타"];
const ROLE_OPTIONS = ["PD 단독", "PD + PM", "디자인팀 일부", "기타"];

type Props = {
  value: ContextAnswers;
  onChange: (patch: Partial<ContextAnswers>) => void;
};

export function ContextForm({ value, onChange }: Props) {
  return (
    <form className="space-y-6">
      <Field id="kind" label="이 작업의 종류는?">
        <select
          id="kind"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary"
          value={value.kind}
          onChange={(e) => onChange({ kind: e.target.value })}
        >
          <option value="">선택해주세요</option>
          {KIND_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </Field>

      <Field id="problem" label="이 작업이 해결하려던 핵심 문제는? (한 문장)" hint="50자 이내 권장">
        <Input
          id="problem"
          maxLength={120}
          value={value.problem}
          onChange={(e) => onChange({ problem: e.target.value })}
        />
      </Field>

      <Field id="role" label="본인의 역할은?">
        <select
          id="role"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary"
          value={value.role}
          onChange={(e) => onChange({ role: e.target.value })}
        >
          <option value="">선택해주세요</option>
          {ROLE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </Field>

      <Field id="proud" label="이 작업에서 가장 자랑하고 싶은 결정은? (없으면 비워도 OK)">
        <Textarea
          id="proud"
          rows={3}
          value={value.proud}
          onChange={(e) => onChange({ proud: e.target.value })}
        />
      </Field>
    </form>
  );
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-text-primary">{label}</label>
      {children}
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test -- components/ContextForm.test.tsx
```
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add components/ContextForm.tsx components/ContextForm.test.tsx
git commit -m "$(cat <<'EOF'
Add ContextForm — 4 spec §4.2 questions (2 selects + 2 free text), partial onChange updates

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4.2: `app/context/page.tsx` 구현

**Files:**
- Create: `app/context/page.tsx`

- [ ] **Step 1: 페이지 구현**

```tsx
/**
 * Role: STEP 2 맥락 대화 페이지 — 좌측 스샷 미리보기, 우측 4질문 폼
 * Key Features: kind·role 채워야 다음 단계. 새로고침해도 store가 sessionStorage에 보존.
 * Dependencies: components/ContextForm, lib/store, next/navigation
 * Notes: 모바일은 세로 스택 (Tailwind grid + breakpoint).
 */
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ContextForm } from "@/components/ContextForm";
import { Button } from "@/components/ui/button";
import { useFlowStore } from "@/lib/store";

export default function ContextPage() {
  const router = useRouter();
  const images = useFlowStore((s) => s.images);
  const context = useFlowStore((s) => s.context);
  const setContext = useFlowStore((s) => s.setContext);

  // STEP 1 미통과 진입 보호
  useEffect(() => {
    if (images.length === 0) router.replace("/");
  }, [images.length, router]);

  const canProceed = context.kind.length > 0 && context.role.length > 0;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold mb-8">맥락을 한 번만 알려줘요</h1>

      <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
        <aside className="space-y-3">
          <h2 className="text-sm font-semibold text-text-secondary">올린 스크린샷</h2>
          <ul className="grid grid-cols-2 gap-2">
            {images.map((p, i) => (
              <li key={i} className="aspect-square overflow-hidden rounded-md border border-border bg-bg">
                <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
              </li>
            ))}
          </ul>
        </aside>

        <section>
          <ContextForm value={context} onChange={setContext} />
        </section>
      </div>

      <div className="mt-10 flex justify-between">
        <Button variant="ghost" onClick={() => router.push("/")}>이전</Button>
        <Button disabled={!canProceed} onClick={() => router.push("/personas")}>
          6명에게 보여주기
        </Button>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 수동 스모크**

```bash
npm run dev
```
Flow: `/` → 이미지 업로드 → "맥락 적기" → `/context`에서 4질문 폼 보임. kind+role 선택 시 "6명에게 보여주기" 활성화. 새로고침해도 폼·이미지 보존.

- [ ] **Step 3: 타입 체크**

```bash
npm run typecheck
```
Expected: 에러 없음.

- [ ] **Step 4: Commit**

```bash
git add app/context
git commit -m "$(cat <<'EOF'
Implement STEP 2 context page — split layout with screenshot preview, gated by required kind+role

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

# Phase 5 — STEP 3: 페르소나 선택 + 충돌 미리보기

## Task 5.1: `PersonaCheckbox` + `ConflictPreview` 컴포넌트 + 테스트

**Files:**
- Create: `components/PersonaCheckbox.tsx`
- Create: `components/ConflictPreview.tsx`
- Create: `components/ConflictPreview.test.tsx`

- [ ] **Step 1: 실패 테스트 먼저 — `ConflictPreview`만 (체크박스는 단순 래퍼)**

```tsx
// components/ConflictPreview.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConflictPreview } from "./ConflictPreview";

describe("ConflictPreview", () => {
  it("선택 0~1명이면 안내 메시지", () => {
    render(<ConflictPreview selectedIds={[]} />);
    expect(screen.getByText(/2명 이상 선택/)).toBeInTheDocument();
  });

  it("강한 충돌이 없으면 0쌍 메시지", () => {
    render(<ConflictPreview selectedIds={["toss-po", "naver-spd"]} />);
    expect(screen.getByText(/강한 충돌이 없는/)).toBeInTheDocument();
  });

  it("충돌이 있으면 N쌍과 대화적 톤", () => {
    render(<ConflictPreview selectedIds={["toss-po", "woowa-cbo", "kakao-dc"]} />);
    expect(screen.getByText(/강한 충돌 2쌍/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npm test -- components/ConflictPreview.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: `components/PersonaCheckbox.tsx` 구현**

```tsx
/**
 * Role: 페르소나 1명의 체크박스 카드 — 라벨, 핵심 렌즈, 질문 영역 노출
 * Key Features: 클릭 시 부모 onToggle. 키보드 접근(label htmlFor).
 * Dependencies: components/ui/checkbox, lib/personas(타입)
 */
"use client";

import type { Persona } from "@/lib/personas";
import { Checkbox } from "@/components/ui/checkbox";

type Props = { persona: Persona; checked: boolean; onToggle: (id: string) => void };

export function PersonaCheckbox({ persona, checked, onToggle }: Props) {
  const id = `persona-${persona.id}`;
  return (
    <label
      htmlFor={id}
      className="flex gap-3 p-4 border border-border rounded-card bg-surface cursor-pointer hover:border-accent transition-colors"
    >
      <Checkbox id={id} checked={checked} onCheckedChange={() => onToggle(persona.id)} />
      <div className="flex-1">
        <div className="font-medium text-text-primary">{persona.label}</div>
        <div className="text-sm text-text-secondary mt-0.5">{persona.firstLens}</div>
        <div className="text-xs text-text-muted mt-2">{persona.questionDomain}</div>
      </div>
    </label>
  );
}
```

- [ ] **Step 4: `components/ConflictPreview.tsx` 구현**

```tsx
/**
 * Role: 선택된 페르소나 사이의 강한 충돌 쌍을 대화적 톤으로 미리보기
 * Key Features: spec §4.1 노출 톤. 매트릭스 룩업 결과의 첫 인상.
 * Dependencies: lib/conflicts, lib/personas
 */
import { getStrongConflicts } from "@/lib/conflicts";
import { getPersonaById } from "@/lib/personas";

export function ConflictPreview({ selectedIds }: { selectedIds: string[] }) {
  if (selectedIds.length < 2) {
    return <p className="text-sm text-text-muted">2명 이상 선택하면 충돌 미리보기가 보여요.</p>;
  }

  const conflicts = getStrongConflicts(selectedIds);
  if (conflicts.length === 0) {
    return <p className="text-sm text-text-muted">강한 충돌이 없는 조합이에요. 조용한 리뷰가 될 거예요.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-text-secondary">
        선택한 페르소나 중 <strong className="text-text-primary">강한 충돌 {conflicts.length}쌍</strong>이 있어요. 이번 디자인에서도 그럴까요?
      </p>
      <ul className="text-sm text-text-muted space-y-1">
        {conflicts.map((c) => {
          const a = getPersonaById(c.a)!.label;
          const b = getPersonaById(c.b)!.label;
          return (
            <li key={`${c.a}-${c.b}`}>
              · {a} ↔ {b} — {c.theme}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 5: 테스트 통과 확인**

```bash
npm test -- components/ConflictPreview.test.tsx
```
Expected: 3 passed.

- [ ] **Step 6: Commit**

```bash
git add components/PersonaCheckbox.tsx components/ConflictPreview.tsx components/ConflictPreview.test.tsx
git commit -m "$(cat <<'EOF'
Add PersonaCheckbox + ConflictPreview — STEP 3 selection cards and matrix-driven N-pair preview (spec §4.1 tone)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5.2: `app/personas/page.tsx` 구현 (디폴트 6명 전체 선택)

**Files:**
- Create: `app/personas/page.tsx`

- [ ] **Step 1: 페이지 구현**

```tsx
/**
 * Role: STEP 3 페르소나 선택 페이지 — 6인 카드 + 충돌 미리보기 + 디스클레이머
 * Key Features: 첫 진입 시 6명 전체 선택(spec §4.6). 토글 가능. 1명 이상이면 진행.
 * Dependencies: components/{PersonaCheckbox, ConflictPreview, Disclaimer}, lib/{store, personas}
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PERSONAS, PERSONA_IDS } from "@/lib/personas";
import { PersonaCheckbox } from "@/components/PersonaCheckbox";
import { ConflictPreview } from "@/components/ConflictPreview";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { useFlowStore } from "@/lib/store";

export default function PersonasPage() {
  const router = useRouter();
  const images = useFlowStore((s) => s.images);
  const context = useFlowStore((s) => s.context);
  const selected = useFlowStore((s) => s.selectedPersonaIds);
  const setSelected = useFlowStore((s) => s.setSelectedPersonaIds);

  useEffect(() => {
    if (images.length === 0 || !context.kind || !context.role) {
      router.replace("/");
      return;
    }
    if (selected.length === 0) setSelected(PERSONA_IDS);
  }, [images.length, context.kind, context.role, selected.length, setSelected, router]);

  const toggle = (id: string) =>
    setSelected(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  const canProceed = selected.length > 0;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 space-y-10">
      <header>
        <h1 className="text-2xl font-semibold">누구에게 보여줄까요?</h1>
        <p className="text-text-secondary mt-2">
          처음엔 6명 전체가 봅니다. 빼고 싶은 사람은 체크 해제하세요.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {PERSONAS.map((p) => (
          <li key={p.id}>
            <PersonaCheckbox persona={p} checked={selected.includes(p.id)} onToggle={toggle} />
          </li>
        ))}
      </ul>

      <section className="p-4 rounded-card bg-bg border border-border">
        <ConflictPreview selectedIds={selected} />
      </section>

      <Disclaimer />

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => router.push("/context")}>이전</Button>
        <Button disabled={!canProceed} onClick={() => router.push("/critique")}>
          {selected.length}명에게 보여주기
        </Button>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 수동 스모크**

체크: 첫 진입 시 6명 모두 체크됨. 체크 해제 → 충돌 미리보기 N쌍 숫자 갱신. 0명이면 다음 버튼 비활성.

- [ ] **Step 3: 타입 체크 + 커밋**

```bash
npm run typecheck
git add app/personas
git commit -m "$(cat <<'EOF'
Implement STEP 3 personas page — default-all selection (spec §4.6), live conflict preview, disclaimer

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

# Phase 6 — STEP 4: 크리틱 결과 (병렬 스트리밍)

## Task 6.1: `PersonaCard` 컴포넌트 + 테스트

> 한 페르소나의 스트리밍 결과를 렌더. 모델 출력은 markdown 비슷한 텍스트(헤딩+리스트). MVP는 별도 마크다운 파서 없이 텍스트로 노출 (whitespace-preserving). 추후 폴리시.

**Files:**
- Create: `components/PersonaCard.tsx`
- Create: `components/PersonaCard.test.tsx`

- [ ] **Step 1: 실패 테스트 먼저**

```tsx
// components/PersonaCard.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PersonaCard } from "./PersonaCard";
import { getPersonaById } from "@/lib/personas";

describe("PersonaCard", () => {
  it("로딩 중에는 페르소나 라벨과 스피너만 보인다", () => {
    render(<PersonaCard persona={getPersonaById("toss-po")!} text="" done={false} error={null} />);
    expect(screen.getByText(/토스 스타일 PO/)).toBeInTheDocument();
    expect(screen.getByLabelText(/생각 중/)).toBeInTheDocument();
  });

  it("텍스트가 들어오면 그대로 노출 + 페르소나 라벨", () => {
    render(<PersonaCard persona={getPersonaById("woowa-cbo")!} text="🩺 한 줄 진단: 좋아" done={true} error={null} />);
    expect(screen.getByText(/우아한형제들 스타일 CBO/)).toBeInTheDocument();
    expect(screen.getByText(/좋아/)).toBeInTheDocument();
  });

  it("error가 있으면 에러 메시지 노출", () => {
    render(<PersonaCard persona={getPersonaById("toss-po")!} text="" done={true} error="API 한도 초과" />);
    expect(screen.getByRole("alert")).toHaveTextContent(/API 한도 초과/);
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npm test -- components/PersonaCard.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: `components/PersonaCard.tsx` 구현**

```tsx
/**
 * Role: 페르소나 1명의 크리틱 결과 카드 — 스트리밍 텍스트 + 라벨 + 에러/로딩 상태
 * Key Features: whitespace-pre-wrap으로 모델 마크다운 텍스트를 그대로 노출. 폴리시는 후속.
 * Dependencies: lib/personas(타입), components/ui/card
 */
"use client";

import type { Persona } from "@/lib/personas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  persona: Persona;
  text: string;
  done: boolean;
  error: string | null;
};

export function PersonaCard({ persona, text, done, error }: Props) {
  return (
    <Card className="bg-surface">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{persona.label}</span>
          {!done && !error && (
            <span aria-label="생각 중" className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse" />
          )}
        </CardTitle>
        <p className="text-xs text-text-muted">{persona.firstLens}</p>
      </CardHeader>
      <CardContent>
        {error ? (
          <p role="alert" className="text-sm text-danger">{error}</p>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
            {text || "..."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: 테스트 통과 + 커밋**

```bash
npm test -- components/PersonaCard.test.tsx
npm run typecheck
git add components/PersonaCard.tsx components/PersonaCard.test.tsx
git commit -m "$(cat <<'EOF'
Add PersonaCard — streaming text body + label header + loading/error states, no markdown parser yet

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6.2: `PersonaCardConnected` — store에서 입력 가져와 훅 호출 + 카드 렌더

**Files:**
- Create: `components/PersonaCardConnected.tsx`

- [ ] **Step 1: 구현 (단순 wiring — 단위 테스트 없이 통합 스모크로 검증)**

```tsx
/**
 * Role: 페르소나 1명에 대해 store 입력으로 useStreamingCritique 호출 → PersonaCard 렌더
 * Key Features: STEP 4 페이지가 6번 마운트 → 6번 병렬 호출. AbortController는 훅 내부.
 * Dependencies: lib/{store, streaming, personas}, components/PersonaCard
 */
"use client";

import { getPersonaById } from "@/lib/personas";
import { useFlowStore } from "@/lib/store";
import { useStreamingCritique } from "@/lib/streaming";
import { PersonaCard } from "./PersonaCard";

export function PersonaCardConnected({ personaId }: { personaId: string }) {
  const images = useFlowStore((s) => s.images);
  const context = useFlowStore((s) => s.context);
  const persona = getPersonaById(personaId)!;
  const { text, done, error } = useStreamingCritique({ personaId, images, context });
  return <PersonaCard persona={persona} text={text} done={done} error={error} />;
}
```

- [ ] **Step 2: 타입 체크 + 커밋**

```bash
npm run typecheck
git add components/PersonaCardConnected.tsx
git commit -m "$(cat <<'EOF'
Add PersonaCardConnected — wires store + streaming hook to one PersonaCard, lets STEP 4 fan out 6×

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6.3: `app/critique/page.tsx` STEP 4 부분 (그리드 + 6 카드)

> STEP 5 충돌 카드는 다음 phase에서 같은 페이지에 추가.

**Files:**
- Create: `app/critique/page.tsx`

- [ ] **Step 1: 페이지 구현 (STEP 4까지)**

```tsx
/**
 * Role: STEP 4 + STEP 5 결과 페이지 — 페르소나 카드 그리드, 충돌 카드는 Phase 7에서 아래 추가
 * Key Features: 모바일 세로/데스크톱 2열. 가드: 입력 누락 시 첫 단계로.
 * Dependencies: components/PersonaCardConnected, lib/store
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFlowStore } from "@/lib/store";
import { PersonaCardConnected } from "@/components/PersonaCardConnected";
import { Button } from "@/components/ui/button";

export default function CritiquePage() {
  const router = useRouter();
  const images = useFlowStore((s) => s.images);
  const context = useFlowStore((s) => s.context);
  const selected = useFlowStore((s) => s.selectedPersonaIds);

  useEffect(() => {
    if (images.length === 0 || !context.kind || !context.role || selected.length === 0) {
      router.replace("/");
    }
  }, [images.length, context.kind, context.role, selected.length, router]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 space-y-12">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{selected.length}명의 동료가 봤어요</h1>
          <p className="text-sm text-text-secondary mt-2">평가가 아니라 동료의 피드백입니다.</p>
        </div>
        <Button variant="ghost" onClick={() => router.push("/personas")}>인원 바꾸기</Button>
      </header>

      <section
        aria-label="페르소나 크리틱"
        className="grid gap-4 md:grid-cols-2"
      >
        {selected.map((id) => (
          <PersonaCardConnected key={id} personaId={id} />
        ))}
      </section>

      {/* STEP 5 충돌 카드는 Phase 7 Task 7.2에서 이 아래에 추가 */}
    </main>
  );
}
```

- [ ] **Step 2: 수동 스모크 (실 API 호출)**

```bash
echo "ANTHROPIC_API_KEY=실제_키" > .env.local
npm run dev
```
Flow: 첫 단계부터 끝까지 → 6명의 카드가 동시에 스트리밍되며 각자 한 줄 진단 → 질문 3 → 제안이 들어차는지 확인.

체크:
- 6 카드 동시 스트리밍 (네트워크 탭에 6개의 `/api/critique` POST)
- 각 카드 약 200자 가드레일 안에 들어옴
- 페르소나별 톤 차이 (PO는 시선·시각 위계, CBO는 감성 등)

- [ ] **Step 3: 타입 체크 + 커밋**

```bash
npm run typecheck
git add app/critique/page.tsx
git commit -m "$(cat <<'EOF'
Implement STEP 4 critique grid — N PersonaCardConnected children fire parallel /api/critique streams

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

# Phase 7 — STEP 5: 충돌 뷰 + 자기 표현 리허설 ⭐USP

> spec §4.6 STEP 5 — "당신은 어느 쪽?" 입력칸이 USP 핵심. 매트릭스 룩업으로 자동 트리거.

## Task 7.1: `ConflictCard` 컴포넌트 + 테스트

**Files:**
- Create: `components/ConflictCard.tsx`
- Create: `components/ConflictCard.test.tsx`

- [ ] **Step 1: 실패 테스트 먼저**

```tsx
// components/ConflictCard.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConflictCard } from "./ConflictCard";
import { STRONG_CONFLICTS } from "@/lib/conflicts";

const sample = STRONG_CONFLICTS[0]; // toss-po x woowa-cbo

describe("ConflictCard", () => {
  it("테마, 두 페르소나 입장, '당신은 어느 쪽?' 라벨이 모두 보인다", () => {
    render(<ConflictCard conflict={sample} value="" onChange={() => {}} />);
    expect(screen.getByText(sample.theme)).toBeInTheDocument();
    expect(screen.getByText(sample.stanceA)).toBeInTheDocument();
    expect(screen.getByText(sample.stanceB)).toBeInTheDocument();
    expect(screen.getByLabelText(/당신은 어느 쪽/)).toBeInTheDocument();
  });

  it("입력 변경 시 onChange 호출", async () => {
    const onChange = vi.fn();
    render(<ConflictCard conflict={sample} value="" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText(/당신은 어느 쪽/), "전");
    expect(onChange).toHaveBeenLastCalledWith("전");
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npm test -- components/ConflictCard.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: `components/ConflictCard.tsx` 구현**

```tsx
/**
 * Role: 강한 충돌 1쌍의 카드 — 테마, 두 페르소나 입장, 자기 표현 리허설 입력칸
 * Key Features: spec §4.6 STEP 5 박제. 입력은 부모 store에 보관(클라이언트만, DB 없음).
 * Dependencies: lib/conflicts(타입), lib/personas, components/ui/{card, textarea}
 */
"use client";

import type { StrongConflict } from "@/lib/conflicts";
import { getPersonaById } from "@/lib/personas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  conflict: StrongConflict;
  value: string;
  onChange: (v: string) => void;
};

export function ConflictCard({ conflict, value, onChange }: Props) {
  const a = getPersonaById(conflict.a)!;
  const b = getPersonaById(conflict.b)!;
  const inputId = `rehearsal-${conflict.a}-${conflict.b}`;

  return (
    <Card className="bg-warm-subtle border-warm/30">
      <CardHeader>
        <CardTitle className="text-warm">{conflict.theme}</CardTitle>
        <p className="text-sm text-text-secondary">{conflict.framing}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Stance who={a.label} text={conflict.stanceA} />
          <Stance who={b.label} text={conflict.stanceB} />
        </div>
        <div className="space-y-2">
          <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
            당신은 어느 쪽? (답하지 않아도 됨)
          </label>
          <Textarea
            id={inputId}
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="면접에서 이 질문을 받는다면 어떻게 답할지 미리 적어보세요."
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Stance({ who, text }: { who: string; text: string }) {
  return (
    <div className="p-3 rounded-md border border-border bg-surface">
      <div className="text-xs font-semibold text-text-secondary mb-1">{who}</div>
      <p className="text-sm text-text-primary leading-relaxed">{text}</p>
    </div>
  );
}
```

- [ ] **Step 4: 테스트 통과 + 커밋**

```bash
npm test -- components/ConflictCard.test.tsx
npm run typecheck
git add components/ConflictCard.tsx components/ConflictCard.test.tsx
git commit -m "$(cat <<'EOF'
Add ConflictCard — STEP 5 USP card with theme, two stances, '당신은 어느 쪽?' rehearsal textarea

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7.2: `app/critique/page.tsx`에 STEP 5 충돌 섹션 추가

**Files:**
- Modify: `app/critique/page.tsx`

- [ ] **Step 1: STEP 5 섹션 추가 (페이지 하단)**

```tsx
// app/critique/page.tsx — Phase 7로 갱신된 전체
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFlowStore } from "@/lib/store";
import { PersonaCardConnected } from "@/components/PersonaCardConnected";
import { ConflictCard } from "@/components/ConflictCard";
import { Button } from "@/components/ui/button";
import { getStrongConflicts, conflictKey } from "@/lib/conflicts";

export default function CritiquePage() {
  const router = useRouter();
  const images = useFlowStore((s) => s.images);
  const context = useFlowStore((s) => s.context);
  const selected = useFlowStore((s) => s.selectedPersonaIds);
  const rehearsalAnswers = useFlowStore((s) => s.rehearsalAnswers);
  const setRehearsalAnswer = useFlowStore((s) => s.setRehearsalAnswer);

  useEffect(() => {
    if (images.length === 0 || !context.kind || !context.role || selected.length === 0) {
      router.replace("/");
    }
  }, [images.length, context.kind, context.role, selected.length, router]);

  const conflicts = getStrongConflicts(selected);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 space-y-12">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{selected.length}명의 동료가 봤어요</h1>
          <p className="text-sm text-text-secondary mt-2">평가가 아니라 동료의 피드백입니다.</p>
        </div>
        <Button variant="ghost" onClick={() => router.push("/personas")}>인원 바꾸기</Button>
      </header>

      <section aria-label="페르소나 크리틱" className="grid gap-4 md:grid-cols-2">
        {selected.map((id) => (
          <PersonaCardConnected key={id} personaId={id} />
        ))}
      </section>

      {conflicts.length > 0 && (
        <section aria-labelledby="conflict-heading" className="space-y-4">
          <header className="space-y-1">
            <h2 id="conflict-heading" className="text-xl font-semibold">충돌 관점 — 자기 표현의 리허설</h2>
            <p className="text-sm text-text-secondary">
              두 동료가 서로 다른 우선순위를 봅니다. 면접·리뷰에서 자주 받는 질문이에요. 미리 답해보세요.
            </p>
          </header>
          <div className="grid gap-4">
            {conflicts.map((c) => {
              const key = conflictKey(c.a, c.b);
              return (
                <ConflictCard
                  key={key}
                  conflict={c}
                  value={rehearsalAnswers[key] ?? ""}
                  onChange={(v) => setRehearsalAnswer(key, v)}
                />
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
```

- [ ] **Step 2: 수동 스모크**

체크:
- 6명 모두 선택 시 STEP 4 그리드 + STEP 5 충돌 카드 5개 자동 등장
- 충돌 카드 textarea에 입력 → 새로고침해도 유지(sessionStorage)
- 1~2명만 선택했을 때 STEP 5 섹션이 안 보이거나 0개일 때 깔끔히 비워짐

- [ ] **Step 3: 타입 체크 + 커밋**

```bash
npm run typecheck
git add app/critique/page.tsx
git commit -m "$(cat <<'EOF'
Add STEP 5 conflict section to critique page — auto-trigger from matrix, persisted rehearsal answers

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

# Phase 8 — Polish & 출시 준비

## Task 8.1: a11y + 키보드 네비게이션 패스

**Files:**
- Modify (필요 시): `app/page.tsx`, `app/context/page.tsx`, `app/personas/page.tsx`, `app/critique/page.tsx`, `components/*`

- [ ] **Step 1: 수동 a11y 체크리스트 (브라우저 + 키보드)**

각 페이지에서 확인:
- [ ] 모든 인터랙티브 요소가 Tab으로 도달 가능
- [ ] 포커스 링이 보임 (Tailwind `focus-visible:ring`이 shadcn 기본 포함됨 — 확인만)
- [ ] 이미지에 의미 있는 `alt` (드롭존 미리보기는 파일명, 페르소나 라벨은 텍스트라 OK)
- [ ] 폼 라벨이 모두 `htmlFor` ↔ `id` 연결
- [ ] `role="alert"`이 에러 메시지에 붙어 있음
- [ ] 페이지 단위 `<h1>` 1개

- [ ] **Step 2: 발견된 이슈가 있으면 최소한으로 패치 (없으면 스킵)**

- [ ] **Step 3: 변경 있으면 커밋**

```bash
git status
# 변경 있을 때만:
git add -A
git commit -m "$(cat <<'EOF'
Polish a11y — keyboard focus order, alt texts, labelled inputs across all 5 steps

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8.2: Vercel 배포 노트 + README 업데이트

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README에 배포 섹션 추가**

```markdown
## 배포 (Vercel)

1. Vercel에 GitHub 리포지토리 연결
2. Project Settings → Environment Variables → `ANTHROPIC_API_KEY` 추가 (Production / Preview)
3. Build & Deploy: Next.js 자동 감지, 추가 설정 불필요

서버에서만 키를 사용하므로 (`/app/api/critique/route.ts`) 클라이언트 번들에 노출되지 않습니다. `NEXT_PUBLIC_` 접두사 절대 금지.

## 모델 / 비용 메모

- 기본 모델: `claude-sonnet-4-6` (페르소나 1명당 max_tokens 600)
- 시스템 프롬프트는 `cache_control: ephemeral`로 캐싱 — 같은 페르소나의 후속 호출은 캐시 hit
- 6명 병렬 호출 → 1요청당 약 6 호출. 트래픽 초기엔 Claude API 분당 한도 모니터링.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
Document Vercel deploy + model/cost notes — env var setup, no NEXT_PUBLIC, prompt caching mention

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8.3: 전체 수동 스모크 체크리스트 (출시 전 마지막 점검)

> 자동 e2e가 없으니 사람이 한 번 끝까지 돌리며 확인. 발견된 버그는 별도 task로 추가하거나 즉시 수정.

- [ ] **Step 1: 깨끗한 sessionStorage로 전체 플로우 (데스크톱 Chrome)**
  - [ ] STEP 1 — 다중 이미지 드래그앤드롭, 썸네일 노출
  - [ ] STEP 2 — 4질문 입력, kind/role 둘 다 선택해야 다음 활성
  - [ ] STEP 3 — 6명 디폴트 체크, 토글 시 충돌 미리보기 N쌍 갱신
  - [ ] STEP 4 — 6 카드 동시 스트리밍, 각 약 200자 가드레일
  - [ ] STEP 5 — 충돌 카드 자동 등장, 입력 후 새로고침에도 보존

- [ ] **Step 2: 모바일 뷰포트 (Chrome DevTools iPhone 14 Pro)**
  - [ ] STEP 4 카드가 세로 스택으로 정렬
  - [ ] 폼 입력 시 모바일 키보드와 충돌 없음

- [ ] **Step 3: 엣지 케이스**
  - [ ] 이미지 0장 상태에서 직접 `/context` 진입 → `/`로 리다이렉트
  - [ ] 페르소나 1명만 선택 → STEP 5 섹션 안 나옴
  - [ ] STEP 4 새로고침 → store 보존되어 다시 6번 호출 (의도 — refresh = retry)
  - [ ] 잘못된 이미지 형식(.txt) → 에러 표시, 업로드 거부

- [ ] **Step 4: 발견된 회귀가 있으면 별도 commit으로 수정. 없으면 마지막 커밋 한 줄로 마무리**

```bash
# 변경 없으면 스킵
git status
```

---

# 자체 리뷰 체크 (writing-plans 스킬 self-review)

본 plan을 spec과 대조한 결과:

**Spec 커버리지** — 각 spec 섹션이 어떤 task에서 구현되는가:
- §2.1 페르소나 6인 → Task 1.1
- §2.2 디스클레이머 → Task 3.1, Task 5.2(노출), §4.4 원칙 4 → Task 0.5(컬러 차용 금지)
- §3.1 매트릭스 / §3.2 강한 충돌 5쌍 → Task 1.3
- §4.1 충돌 트리거 정책(매트릭스 룩업) → Task 5.1, 7.2
- §4.2 맥락 4질문 → Task 4.1, 4.2
- §4.3 출력 가드레일 200자 → Task 1.2 (system prompt)
- §4.4 7원칙 → Task 1.2 (system prompt)
- §4.5 톤 가이드 → Task 1.2 (system prompt 공통 블록)
- §4.6 STEP 1~5 유저 플로우 → Phase 3~7
- §5.2 / §6 폴더 정리 → Task 0.1~0.3
- §6.3 Tech Stack(Next.js 마이그레이션, API Routes로 키 보호) → Phase 0 + Phase 2
- 부록 카피 후보 1번 ("완성작 들고 와요. 6명이 봐줍니다.") → Task 3.3

빈 곳: 없음. 시각적 디테일(STEP 3 디폴트 인원, 카드 그리드, 애니메이션)은 spec §4.6에서 의도적으로 "구현 후 검토"로 미룬 항목 — Task 8.3 스모크 체크 후 별도 plan으로 다룸.

**플레이스홀더 스캔**: TBD/TODO/이후 결정 — 모두 명시적 후속 plan이 필요한 부분(spec §4.6의 시각 디테일)에만 한정. 코드 step에는 placeholder 없음.

**타입 일관성**: `Persona`, `ContextAnswers`, `UploadedImage`, `StrongConflict` 모두 단일 파일 정의 → 일관 사용 확인.

---

# Execution Handoff

> 다음 액션 — `superpowers:executing-plans`(현 세션 인라인) 또는 `superpowers:subagent-driven-development`(서브에이전트 + 리뷰 체크포인트). 윤경님이 부르면 그 모드로 들어감.

**플랜 메모**:
- 총 약 30 task, 각 task 평균 4~6 step. TDD 사이클 일관 준수.
- Phase 0의 task 0.3에서 큰 의존성 변경(`npm install`)이 일어나니, 그 후로는 머신 상태 깨지지 않게 한 번에 정리.
- API 키가 필요한 첫 시점은 **Task 6.3 수동 스모크** — 그 전엔 mock 테스트로 진행 가능.
