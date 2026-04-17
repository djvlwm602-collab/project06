# 디자인 크리틱 파트너 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 포트폴리오 스크린샷을 업로드하면 6인의 "○○ 스타일" 페르소나가 병렬 스트리밍으로 크리틱을 주고, 강한 충돌 쌍에는 "당신은 어느 쪽?" 자기 표현 리허설 카드를 띄우는 Next.js 앱을 구현한다.

**Architecture:** Next.js 15 App Router + React 19 + Tailwind 4 + shadcn/ui. Gemini API 호출은 `/api/critique`(Route Handler)에서 서버 사이드만 수행 (API 키 보호). 도메인 로직(페르소나 데이터, 충돌 매트릭스, system prompt 빌더, 카드 길이 가드레일)은 순수 TS 함수로 분리 → 풀 TDD. API Route는 `@google/genai` 모킹 통합 테스트. UI는 STEP별 최소 행동 테스트. 클라이언트 상태는 Zustand 단일 스토어(파일, 맥락 답변, 선택 페르소나, 크리틱 결과). STEP 5 "어느 쪽?" 입력은 스토어 내 클라이언트 상태로만 저장(DB 없음).

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, `@google/genai` (model: `gemini-2.5-flash`), Zustand, Vitest, @testing-library/react, jsdom.

**SSOT(Single Source of Truth):** `docs/specs/2026-04-16-design-critique-partner-spec.md`. 본 plan은 spec §0–§8을 구현으로 옮긴 것이다. 스펙에서 벗어나는 결정을 새로 하지 말 것.

> **2026-04-17 Migration Note**: 본 plan에 박제된 Anthropic SDK(`@anthropic-ai/sdk`, `claude-sonnet-4-5`, `cache_control: ephemeral`) 관련 코드 블록·env var·헬퍼 파일명(`mock-anthropic.ts`)은 **historical**이다. 윤경님 결정으로 같은 날 Gemini로 전환 — 실제 구현은 main 브랜치(`app/api/critique/route.ts`, `tests/helpers/mock-gemini.ts`, `.env.example`, `docs/DEPLOY.md`) 참조. spec §6.2 표도 같은 결정 반영.

---

## 파일 구조 (구현 완료 시 최종 형태)

```
design-critique-partner/
├── .env.example                        # (유지)
├── .env                                # (유지, 커밋 금지)
├── .gitignore                          # (업데이트: .next/ 추가)
├── README.md                           # (갈아엎기)
├── next.config.ts                      # (신규)
├── package.json                        # (갈아엎기)
├── tsconfig.json                       # (갈아엎기)
├── postcss.config.mjs                  # (신규)
├── components.json                     # (신규, shadcn)
├── vitest.config.ts                    # (신규)
├── next-env.d.ts                       # (Next.js 자동 생성)
├── app/
│   ├── layout.tsx                      # 루트 레이아웃 + metadata
│   ├── globals.css                     # Tailwind 4 import + 중립 토큰
│   ├── page.tsx                        # STEP 1 랜딩
│   ├── context/page.tsx                # STEP 2 맥락 대화
│   ├── personas/page.tsx               # STEP 3 페르소나 선택
│   ├── result/page.tsx                 # STEP 4 + STEP 5 (동일 페이지)
│   └── api/
│       └── critique/route.ts           # Claude 스트리밍 프록시
├── lib/
│   ├── utils.ts                        # cn() 헬퍼
│   ├── personas/
│   │   ├── types.ts                    # Persona, PersonaId 타입
│   │   ├── definitions.ts              # 6인 페르소나 데이터
│   │   └── system-prompt.ts            # system prompt 빌더
│   ├── conflict/
│   │   ├── matrix.ts                   # 6×6 매트릭스 + 레벨
│   │   ├── themes.ts                   # 강한 충돌 5쌍 테마
│   │   └── lookup.ts                   # 선택 인원 → 활성 충돌 카드
│   ├── critique/
│   │   ├── types.ts                    # ContextAnswer, CritiqueCard 타입
│   │   ├── context-questions.ts        # §4.2 4개 질문 데이터
│   │   └── guardrails.ts               # 40/50/80/200 길이 검증
│   └── store.ts                        # Zustand 앱 스토어
├── components/
│   ├── ui/                             # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   └── label.tsx
│   └── app/
│       ├── Disclaimer.tsx              # §2.2 디스클레이머
│       ├── DropZone.tsx                # STEP 1 업로드 영역
│       ├── ContextForm.tsx             # STEP 2 4개 질문 폼
│       ├── PersonaPicker.tsx           # STEP 3 6개 체크 + 충돌 수
│       ├── CritiqueCard.tsx            # STEP 4 페르소나 카드
│       └── ConflictCard.tsx            # STEP 5 충돌 카드 (⭐ "어느 쪽?" 입력)
├── tests/
│   ├── setup.ts                        # @testing-library/jest-dom 로드
│   ├── helpers/
│   │   └── mock-anthropic.ts           # SDK 모킹 헬퍼
│   └── api/
│       └── critique.test.ts            # API Route 통합 테스트 (모킹)
└── docs/
    ├── legacy/                         # 참고 자료 (신규)
    │   ├── design-system.html          # (이동)
    │   └── design-tokens.md            # (이동)
    ├── specs/2026-04-16-design-critique-partner-spec.md
    └── plans/2026-04-17-design-critique-partner-plan.md  # 본 문서
```

각 `lib/*` 모듈과 컴포넌트는 같은 디렉터리에 `*.test.ts(x)` 동거(co-locate)한다.

---

# Phase A — 프로젝트 기반

현재 폴더의 CRM 잔재를 제거하고 Next.js + Tailwind 4 + shadcn + Vitest 기반을 구축한다.

---

### Task A1: legacy 자료 이동 (참고 보관)

**Files:**
- Create: `docs/legacy/` (디렉터리)
- Move: `design-system.html` → `docs/legacy/design-system.html`
- Move: `docs/design-tokens.md` → `docs/legacy/design-tokens.md`

- [ ] **Step 1: legacy 디렉터리 생성 + 이동**

```bash
mkdir -p docs/legacy
git mv design-system.html docs/legacy/design-system.html
git mv docs/design-tokens.md docs/legacy/design-tokens.md
```

- [ ] **Step 2: 이동 확인**

```bash
ls docs/legacy/
```
Expected: `design-system.html  design-tokens.md`

- [ ] **Step 3: 커밋**

```bash
git add -A
git commit -m "Move design-system.html + design-tokens.md to docs/legacy — keep as reference, replaced by pool 2 neutral tokens"
```

---

### Task A2: CRM 잔재 삭제 (src/, vite 설정, 옛 index.html, metadata.json)

**Files:**
- Delete: `src/` (전체)
- Delete: `vite.config.ts`
- Delete: `index.html`
- Delete: `metadata.json`
- Delete: `package-lock.json` (Next.js 의존성 재생성 전제)

- [ ] **Step 1: 파일 삭제**

```bash
rm -rf src
rm vite.config.ts index.html metadata.json package-lock.json
```

- [ ] **Step 2: 삭제 확인**

```bash
ls
```
Expected: 루트에 `src/`·`vite.config.ts`·`index.html`·`metadata.json`·`package-lock.json` 없음. `docs/`·`.env`·`.env.example`·`.gitignore`·`package.json`·`tsconfig.json`·`README.md`만 남음.

- [ ] **Step 3: 커밋**

```bash
git add -A
git commit -m "Remove CRM kanban remnants — src/, vite config, old index.html, stale metadata.json"
```

---

### Task A3: `.gitignore` 업데이트 (`.next/` 추가)

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: `.next/` 추가**

파일 최종 내용:

```
node_modules/
.next/
build/
dist/
coverage/
.DS_Store
*.log
.env*
!.env.example
```

- [ ] **Step 2: 커밋**

```bash
git add .gitignore
git commit -m "Ignore .next/ build output — Next.js migration prep"
```

---

### Task A4: `package.json` 갈아엎기 (Next.js + Tailwind 4 + Vitest)

**Files:**
- Rewrite: `package.json`

- [ ] **Step 1: 새 `package.json` 작성**

파일 전체 내용:

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
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.546.0",
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^3.5.0",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.14",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^22.14.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "tailwindcss": "^4.1.14",
    "typescript": "~5.8.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: 의존성 설치**

```bash
npm install
```
Expected: `package-lock.json` 재생성. 설치 오류 없음.

- [ ] **Step 3: 커밋**

```bash
git add package.json package-lock.json
git commit -m "Rewrite package.json for Next.js 15 + Tailwind 4 + Vitest — drop vite/express"
```

---

### Task A5: `tsconfig.json` 갈아엎기 (Next.js 표준)

**Files:**
- Rewrite: `tsconfig.json`

- [ ] **Step 1: 새 `tsconfig.json` 작성**

파일 전체 내용:

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
    "paths": { "@/*": ["./*"] },
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 2: 타입체크 확인 (에러만 안 나면 OK — 아직 파일 없음)**

```bash
npm run typecheck
```
Expected: 오류 없음 (아직 소스 파일 없음).

- [ ] **Step 3: 커밋**

```bash
git add tsconfig.json
git commit -m "Replace tsconfig with Next.js App Router + path alias @/* + vitest globals"
```

---

### Task A6: `next.config.ts` + `postcss.config.mjs` 생성

**Files:**
- Create: `next.config.ts`
- Create: `postcss.config.mjs`

- [ ] **Step 1: `next.config.ts` 작성**

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

- [ ] **Step 2: `postcss.config.mjs` 작성**

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

- [ ] **Step 3: 커밋**

```bash
git add next.config.ts postcss.config.mjs
git commit -m "Add next.config.ts + postcss config for Tailwind 4"
```

---

### Task A7: `app/globals.css` — Tailwind 4 + 풀이 2 중립 토큰

풀이 2 원칙: 회사 브랜드 컬러/폰트 차용 금지. 중립 회색 스케일 + 거의 검정 액센트만 사용한다.

**Files:**
- Create: `app/globals.css`

- [ ] **Step 1: `globals.css` 작성**

```css
@import "tailwindcss";

@theme {
  /* 폰트 — system-ui 스택 (브랜드 폰트 차용 금지) */
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Apple SD Gothic Neo", "Pretendard", "Segoe UI", Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* 색 — 무채색 스케일만. 브랜드 컬러 없음 */
  --color-bg: #fafafa;
  --color-surface: #ffffff;
  --color-surface-raised: #ffffff;
  --color-border: #e5e5e5;
  --color-border-strong: #d4d4d4;

  --color-text-primary: #111111;
  --color-text-secondary: #525252;
  --color-text-muted: #a3a3a3;

  --color-accent: #171717;          /* 강조 = 거의 검정 (브랜드 컬러 아님) */
  --color-accent-hover: #000000;
  --color-accent-foreground: #ffffff;

  --color-subtle: #f5f5f5;           /* 옅은 배경 (선택 상태·카드 바닥) */

  --color-danger: #b91c1c;           /* 에러 전용. 과용 금지 */

  /* 레이아웃 */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
}

@layer base {
  html, body {
    background: var(--color-bg);
    color: var(--color-text-primary);
    font-family: var(--font-sans);
  }
  body {
    min-height: 100dvh;
  }
  * {
    border-color: var(--color-border);
  }
}
```

- [ ] **Step 2: 커밋**

```bash
git add app/globals.css
git commit -m "Add globals.css — Tailwind 4 + neutral-only tokens (pool 2: no brand colors/fonts)"
```

---

### Task A8: `lib/utils.ts` — `cn()` 헬퍼

**Files:**
- Create: `lib/utils.ts`

- [ ] **Step 1: `cn()` 작성**

```ts
/**
 * Role: Tailwind 클래스 병합 헬퍼 (shadcn 표준 패턴)
 * Key Features: clsx로 조건부 결합 + tailwind-merge로 충돌 해소
 * Dependencies: clsx, tailwind-merge
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// shadcn/ui 표준 — 클래스 조건 결합과 Tailwind 충돌 해소를 한 번에
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: 커밋**

```bash
git add lib/utils.ts
git commit -m "Add cn() helper — shadcn standard clsx + tailwind-merge"
```

---

### Task A9: `app/layout.tsx` + `app/page.tsx` — 스켈레톤 + dev 서버 가동 확인

**Files:**
- Create: `app/layout.tsx`
- Create: `app/page.tsx`

- [ ] **Step 1: 루트 레이아웃 작성**

```tsx
/**
 * Role: Next.js 루트 레이아웃 — metadata + globals.css 로드
 * Key Features: 앱 전체 <html>/<body> 골격, 한국어 lang
 */
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '디자인 크리틱 파트너',
  description: '완성작 들고 와요. 6명이 봐줍니다.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: 임시 랜딩 작성 (스켈레톤 — STEP 1 정식 구현은 Task C4)**

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl">Design Critique Partner — scaffold OK</h1>
    </main>
  );
}
```

- [ ] **Step 3: dev 서버 가동 확인**

```bash
npm run dev
```
Expected: `http://localhost:3000` 접속 시 스캐폴드 문구 표시. Ctrl+C로 종료.

- [ ] **Step 4: 타입체크 통과 확인**

```bash
npm run typecheck
```
Expected: 오류 없음.

- [ ] **Step 5: 커밋**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "Bootstrap Next.js app shell — root layout + placeholder landing"
```

---

### Task A10: Vitest 셋업 (`vitest.config.ts`, `tests/setup.ts`)

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`

- [ ] **Step 1: `vitest.config.ts` 작성**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

- [ ] **Step 2: `tests/setup.ts` 작성**

```ts
// jest-dom 매처(toBeInTheDocument 등) 전역 등록
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: 빈 스위트 실행**

```bash
npm test
```
Expected: `No test files found` 경고만, 종료 코드 0 또는 1 (문제 아님). 설정 에러 없음.

- [ ] **Step 4: 커밋**

```bash
git add vitest.config.ts tests/setup.ts
git commit -m "Wire up Vitest with jsdom + testing-library/jest-dom setup"
```

---

### Task A11: shadcn/ui 셋업 (`components.json` + 기초 컴포넌트)

Task C2에서 실제 UI 조립 시 재활용. 여기서는 설정 파일과 primitive 6종만 추가.

**Files:**
- Create: `components.json`
- Create: `components/ui/button.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/checkbox.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/textarea.tsx`
- Create: `components/ui/label.tsx`

- [ ] **Step 1: `components.json` 작성**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 2: `components/ui/button.tsx` — 최소 variant**

```tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-[var(--radius-md)] text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)]',
        outline: 'border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-subtle)]',
        ghost: 'hover:bg-[var(--color-subtle)] text-[var(--color-text-primary)]',
      },
      size: {
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';
```

- [ ] **Step 3: `components/ui/card.tsx`**

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border bg-[var(--color-surface)] p-5 shadow-sm',
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-semibold', className)} {...props} />;
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]', className)} {...props} />;
}
```

- [ ] **Step 4: `components/ui/checkbox.tsx`**

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={cn(
      'h-4 w-4 rounded border-[var(--color-border-strong)] accent-[var(--color-accent)]',
      className
    )}
    {...props}
  />
));
Checkbox.displayName = 'Checkbox';
```

- [ ] **Step 5: `components/ui/input.tsx` + `textarea.tsx` + `label.tsx`**

`components/ui/input.tsx`:

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-[var(--radius-md)] border bg-[var(--color-surface)] px-3 text-sm placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
```

`components/ui/textarea.tsx`:

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-[80px] w-full rounded-[var(--radius-md)] border bg-[var(--color-surface)] px-3 py-2 text-sm placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';
```

`components/ui/label.tsx`:

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('text-sm font-medium text-[var(--color-text-primary)]', className)}
      {...props}
    />
  )
);
Label.displayName = 'Label';
```

- [ ] **Step 6: 타입체크**

```bash
npm run typecheck
```
Expected: 오류 없음.

- [ ] **Step 7: 커밋**

```bash
git add components.json components/ui
git commit -m "Add shadcn config + 6 UI primitives (button/card/checkbox/input/textarea/label) — neutral tokens"
```

---

### Task A12: `README.md` 갈아엎기

**Files:**
- Rewrite: `README.md`

- [ ] **Step 1: 새 README 작성**

```markdown
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
```

- [ ] **Step 2: 커밋**

```bash
git add README.md
git commit -m "Rewrite README — replace Gemini template with design-critique-partner overview + scripts"
```

---

### Task A13: `.env.example` 보강 (APP_URL 주석 정리)

현 파일은 OK이지만 `APP_URL` 불필요. Next.js는 `VERCEL_URL` 등 내장 값을 사용. 정리.

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: 새 내용**

```
# ANTHROPIC_API_KEY: Claude API 호출에 필요합니다 (서버 사이드 전용).
# 절대 클라이언트 번들에 노출 금지. NEXT_PUBLIC_* 접두사 사용 금지.
# Anthropic Console(https://console.anthropic.com)에서 발급받은 키를 입력하세요.
ANTHROPIC_API_KEY="YOUR_ANTHROPIC_API_KEY"
```

- [ ] **Step 2: 커밋**

```bash
git add .env.example
git commit -m "Trim .env.example — drop APP_URL, add server-side-only warning for API key"
```

---

**Phase A 검증 체크포인트**

```bash
npm run typecheck && npm test && npm run build
```
Expected: typecheck OK, test 통과 (스위트 비어 있음 OK), build 성공. 로컬 dev 서버에서 `/`가 스캐폴드 문구 노출.

---

# Phase B — 도메인 로직 + API Route

## TDD 원칙

이 페이즈는 **풀 TDD**: 모든 순수 함수·데이터 검증은 테스트 먼저, 구현 그다음. 작성 순서 = 실패하는 테스트 → 실행으로 실패 확인 → 최소 구현 → 통과 확인 → 커밋.

API Route는 **모킹 통합 테스트**: `@anthropic-ai/sdk`를 모킹하고 Route handler를 직접 호출해 검증.

---

### Task B1: `lib/personas/types.ts` — Persona 타입 정의

순수 타입 파일. 테스트 없음 (런타임 동작 없음). B2 이후 구현의 기준.

**Files:**
- Create: `lib/personas/types.ts`

- [ ] **Step 1: 타입 작성**

```ts
/**
 * Role: Persona 도메인 타입 정의
 * Key Features: 6인 ID 리터럴 유니언, Persona 객체 스키마
 * Dependencies: 없음
 * Notes: spec §2.1 / §2.3 참조. 페르소나 추가/삭제 시 PersonaId 먼저 수정
 */

export type PersonaId =
  | 'toss-po'
  | 'daangn-pd'
  | 'kakao-dc'
  | 'naver-pd'
  | 'line-pm'
  | 'woowa-cbo';

export const PERSONA_IDS: readonly PersonaId[] = [
  'toss-po',
  'daangn-pd',
  'kakao-dc',
  'naver-pd',
  'line-pm',
  'woowa-cbo',
] as const;

export type Persona = {
  id: PersonaId;
  label: string;            // "토스 스타일 PO"
  firstLens: string;        // 핵심 렌즈 (spec §2.1)
  questionDomain: string;   // 디자이너에게 던지는 질문 영역
  nonNegotiables: string[]; // 절대 양보 안 하는 것
  tradeoffs: string[];      // 양보 가능한 것
  representativeQuestion: string; // 대표 질문 (spec §2.1)
};
```

- [ ] **Step 2: 타입체크**

```bash
npm run typecheck
```
Expected: 오류 없음.

- [ ] **Step 3: 커밋**

```bash
git add lib/personas/types.ts
git commit -m "Add Persona type — 6 IDs + schema per spec §2.1/§2.3"
```

---

### Task B2: `lib/personas/definitions.ts` — 6인 데이터 (TDD)

**Files:**
- Create: `lib/personas/definitions.test.ts`
- Create: `lib/personas/definitions.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// lib/personas/definitions.test.ts
import { describe, it, expect } from 'vitest';
import { PERSONAS } from './definitions';
import { PERSONA_IDS } from './types';

describe('PERSONAS', () => {
  it('6명 전원 정의됨', () => {
    expect(Object.keys(PERSONAS)).toHaveLength(6);
  });

  it('PERSONA_IDS 순서대로 모든 id 존재', () => {
    for (const id of PERSONA_IDS) {
      expect(PERSONAS[id]).toBeDefined();
      expect(PERSONAS[id].id).toBe(id);
    }
  });

  it('각 페르소나는 "○○ 스타일" 접미사 붙은 label을 가진다 (spec 풀이 2)', () => {
    for (const id of PERSONA_IDS) {
      expect(PERSONAS[id].label).toMatch(/스타일/);
    }
  });

  it('각 페르소나는 nonNegotiables와 tradeoffs를 최소 1개 이상 가진다', () => {
    for (const id of PERSONA_IDS) {
      expect(PERSONAS[id].nonNegotiables.length).toBeGreaterThan(0);
      expect(PERSONAS[id].tradeoffs.length).toBeGreaterThan(0);
    }
  });

  it('토스 PO 대표 질문은 시선 흐름 관련', () => {
    expect(PERSONAS['toss-po'].representativeQuestion).toContain('시선');
  });

  it('당근 PD 대표 질문은 읽힘/접근성 관련', () => {
    expect(PERSONAS['daangn-pd'].representativeQuestion).toMatch(/읽|엄마/);
  });
});
```

- [ ] **Step 2: 실행해서 FAIL 확인**

```bash
npx vitest run lib/personas/definitions.test.ts
```
Expected: FAIL — `Cannot find module './definitions'`.

- [ ] **Step 3: 최소 구현 작성**

```ts
// lib/personas/definitions.ts
/**
 * Role: 6인 페르소나 데이터 (spec §2.1)
 * Key Features: PERSONAS 객체 = PersonaId → Persona 매핑
 * Dependencies: ./types
 * Notes: 회사 실명 × 직군 (풀이 2: "○○ 스타일" 접미사 필수)
 */
import type { Persona, PersonaId } from './types';

export const PERSONAS: Record<PersonaId, Persona> = {
  'toss-po': {
    id: 'toss-po',
    label: '토스 스타일 PO',
    firstLens: '숫자 · 한 액션',
    questionDomain: '시각적 위계 · 시선 흐름 · 단일 액션 강조',
    nonNegotiables: ['한 화면 한 주요 액션', '시각적 위계가 명확한 CTA'],
    tradeoffs: ['정보 밀도', '브랜드 감성 여백'],
    representativeQuestion: '이 화면에서 사용자 시선이 가장 먼저 가는 곳이 어디야?',
  },
  'daangn-pd': {
    id: 'daangn-pd',
    label: '당근 스타일 시니어 PD',
    firstLens: '생활 맥락 · 로컬',
    questionDomain: '글자 크기 · 친숙한 메타포 · 비전문가 접근성',
    nonNegotiables: ['비전문가도 이해할 단어', '작은 글씨가 읽힘'],
    tradeoffs: ['글로벌 보편성', '세련된 마이크로카피'],
    representativeQuestion: '우리 엄마 핸드폰에서 이 글자가 읽힐까?',
  },
  'kakao-dc': {
    id: 'kakao-dc',
    label: '카카오 스타일 디자인 센터장',
    firstLens: '시스템 · 장기 일관성',
    questionDomain: '컴포넌트 재사용성 · 토큰 일관성 · 패턴 확장성',
    nonNegotiables: ['토큰 밖으로 탈주하는 값 없음', '컴포넌트가 다른 화면에서도 동일'],
    tradeoffs: ['단기 전환율', '화면 개별 최적화'],
    representativeQuestion: '이 컴포넌트가 다른 화면에서도 같은 모양으로 등장해?',
  },
  'naver-pd': {
    id: 'naver-pd',
    label: '네이버 스타일 시니어 PD',
    firstLens: '정보 위계 · 밀도',
    questionDomain: '타이포 위계 · 그룹핑 · 정보 밀도 · 마이크로카피',
    nonNegotiables: ['읽기 순서가 명확', '중요 정보 위계 유지'],
    tradeoffs: ['감성 여백', '단일 액션 강조'],
    representativeQuestion: '버튼 위 가장 마지막으로 읽히는 텍스트가 뭐야?',
  },
  'line-pm': {
    id: 'line-pm',
    label: '라인 스타일 글로벌 PM',
    firstLens: '보편성 · 로컬라이제이션',
    questionDomain: '다국어 길이 변동 · 문화 중립 아이콘 · RTL 호환',
    nonNegotiables: ['다국어 길이 1.5배에도 안 깨짐', '문화 중립 아이콘'],
    tradeoffs: ['로컬 맥락 뉘앙스', '한국적 감성 표현'],
    representativeQuestion: '이 텍스트가 일본어로 1.5배 길어져도 깨지지 않아?',
  },
  'woowa-cbo': {
    id: 'woowa-cbo',
    label: '우아한 스타일 CBO',
    firstLens: '감성 · 브랜드 톤',
    questionDomain: '마이크로 인터랙션 · 컬러 톤 · "기분 좋은 순간"',
    nonNegotiables: ['브랜드 톤이 사라지지 않음', '기분 좋은 순간 하나'],
    tradeoffs: ['정보 밀도', '문화 중립성'],
    representativeQuestion: '이 화면에서 기분 좋은 순간은 어디야?',
  },
};
```

- [ ] **Step 4: 실행해서 PASS 확인**

```bash
npx vitest run lib/personas/definitions.test.ts
```
Expected: PASS (6 tests).

- [ ] **Step 5: 커밋**

```bash
git add lib/personas/definitions.ts lib/personas/definitions.test.ts
git commit -m "Add 6 personas data — spec §2.1 table encoded + tests guard '○○ 스타일' suffix"
```

---

### Task B3: `lib/conflict/matrix.ts` — 6×6 매트릭스 (TDD)

**Files:**
- Create: `lib/conflict/matrix.test.ts`
- Create: `lib/conflict/matrix.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// lib/conflict/matrix.test.ts
import { describe, it, expect } from 'vitest';
import { CONFLICT_MATRIX, getConflictLevel } from './matrix';
import { PERSONA_IDS } from '@/lib/personas/types';

describe('CONFLICT_MATRIX', () => {
  it('강한 충돌 5쌍은 strong (spec §3.1)', () => {
    expect(getConflictLevel('toss-po', 'woowa-cbo')).toBe('strong');   // 1↔6
    expect(getConflictLevel('toss-po', 'kakao-dc')).toBe('strong');    // 1↔3
    expect(getConflictLevel('daangn-pd', 'line-pm')).toBe('strong');   // 2↔5
    expect(getConflictLevel('naver-pd', 'woowa-cbo')).toBe('strong');  // 4↔6
    expect(getConflictLevel('line-pm', 'woowa-cbo')).toBe('strong');   // 5↔6
  });

  it('대칭 행렬 (a→b === b→a)', () => {
    for (const a of PERSONA_IDS) {
      for (const b of PERSONA_IDS) {
        expect(getConflictLevel(a, b)).toBe(getConflictLevel(b, a));
      }
    }
  });

  it('자기 자신과는 none (대각선)', () => {
    for (const id of PERSONA_IDS) {
      expect(getConflictLevel(id, id)).toBe('none');
    }
  });

  it('중간 충돌 샘플: 1↔2 medium, 3↔4 none', () => {
    expect(getConflictLevel('toss-po', 'daangn-pd')).toBe('medium');
    expect(getConflictLevel('kakao-dc', 'naver-pd')).toBe('none');
  });
});
```

- [ ] **Step 2: FAIL 확인**

```bash
npx vitest run lib/conflict/matrix.test.ts
```
Expected: FAIL — `Cannot find module './matrix'`.

- [ ] **Step 3: 구현**

```ts
// lib/conflict/matrix.ts
/**
 * Role: 6×6 페르소나 충돌 매트릭스 (spec §3.1)
 * Key Features: 대칭 행렬, 레벨 lookup 함수
 * Dependencies: @/lib/personas/types
 * Notes: strong 5쌍 (§3.2)은 STEP 5 카드 후보. symmetric 유지가 불변식
 */
import type { PersonaId } from '@/lib/personas/types';

export type ConflictLevel = 'strong' | 'medium' | 'none';

// strong 5쌍 (§3.1/§3.2)
const STRONG: Array<[PersonaId, PersonaId]> = [
  ['toss-po', 'kakao-dc'],
  ['toss-po', 'woowa-cbo'],
  ['daangn-pd', 'line-pm'],
  ['naver-pd', 'woowa-cbo'],
  ['line-pm', 'woowa-cbo'],
];

// medium (§3.1 🟡)
const MEDIUM: Array<[PersonaId, PersonaId]> = [
  ['toss-po', 'daangn-pd'],
  ['toss-po', 'naver-pd'],
  ['daangn-pd', 'kakao-dc'],
  ['daangn-pd', 'naver-pd'],
  ['kakao-dc', 'line-pm'],
  ['kakao-dc', 'woowa-cbo'],
];

function keyOf(a: PersonaId, b: PersonaId): string {
  return [a, b].sort().join('|');
}

const LEVEL_BY_KEY = new Map<string, ConflictLevel>();
for (const [a, b] of STRONG) LEVEL_BY_KEY.set(keyOf(a, b), 'strong');
for (const [a, b] of MEDIUM) LEVEL_BY_KEY.set(keyOf(a, b), 'medium');

export function getConflictLevel(a: PersonaId, b: PersonaId): ConflictLevel {
  if (a === b) return 'none';
  return LEVEL_BY_KEY.get(keyOf(a, b)) ?? 'none';
}

// 디버깅·검증 편의용 (테스트에서 직접 키를 돌 때 사용 가능)
export const CONFLICT_MATRIX = { STRONG, MEDIUM };
```

- [ ] **Step 4: PASS 확인**

```bash
npx vitest run lib/conflict/matrix.test.ts
```
Expected: PASS (4 tests).

- [ ] **Step 5: 커밋**

```bash
git add lib/conflict
git commit -m "Add 6×6 conflict matrix + getConflictLevel — strong/medium pairs per spec §3.1"
```

---

### Task B4: `lib/conflict/themes.ts` — 강한 충돌 5쌍 테마 (TDD)

**Files:**
- Create: `lib/conflict/themes.test.ts`
- Create: `lib/conflict/themes.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// lib/conflict/themes.test.ts
import { describe, it, expect } from 'vitest';
import { CONFLICT_THEMES, getThemeForPair } from './themes';

describe('CONFLICT_THEMES', () => {
  it('강한 충돌 5쌍 모두 테마가 있다', () => {
    expect(CONFLICT_THEMES).toHaveLength(5);
  });

  it('토스↔우아한 = 숫자 vs 감성', () => {
    const t = getThemeForPair('toss-po', 'woowa-cbo');
    expect(t?.theme).toBe('숫자 vs 감성');
    expect(t?.framing).toContain('전환율');
  });

  it('순서 무관 lookup (a,b === b,a)', () => {
    expect(getThemeForPair('toss-po', 'woowa-cbo')).toEqual(
      getThemeForPair('woowa-cbo', 'toss-po'),
    );
  });

  it('강한 충돌이 아닌 쌍은 undefined', () => {
    expect(getThemeForPair('kakao-dc', 'naver-pd')).toBeUndefined();
  });
});
```

- [ ] **Step 2: FAIL 확인**

```bash
npx vitest run lib/conflict/themes.test.ts
```
Expected: FAIL.

- [ ] **Step 3: 구현**

```ts
// lib/conflict/themes.ts
/**
 * Role: 강한 충돌 5쌍의 테마 + 프로덕트 프레이밍 (spec §3.2)
 * Key Features: STEP 5 충돌 카드 텍스트의 원천
 * Dependencies: @/lib/personas/types
 */
import type { PersonaId } from '@/lib/personas/types';

export type ConflictTheme = {
  pair: [PersonaId, PersonaId];
  theme: string;      // "숫자 vs 감성"
  framing: string;    // "전환율 vs 기분 좋음, 어느 쪽?"
  stances: Record<PersonaId, string>; // 페르소나별 한 줄 입장 (STEP 5 카드용)
};

// 한 줄 입장 카피 — 페르소나별로 이 테마에서 뭘 말할지 (§4.3 톤 가이드)
// 가이드: 디자이너 언어(시선/위계/그룹/컴포넌트/색 톤 등)로 번역
export const CONFLICT_THEMES: ConflictTheme[] = [
  {
    pair: ['toss-po', 'woowa-cbo'],
    theme: '숫자 vs 감성',
    framing: '전환율 vs 기분 좋음, 어느 쪽?',
    stances: {
      'toss-po': '한 액션만 남겨. 시선이 분산되면 숫자가 안 나와.',
      'woowa-cbo': '여백과 리듬이 있어야 손이 가. 감정이 먼저 와.',
    } as Record<PersonaId, string>,
  },
  {
    pair: ['toss-po', 'kakao-dc'],
    theme: '지금 증명 vs 3년 후 시스템',
    framing: '이번 분기 지표 vs 3년짜리 일관성',
    stances: {
      'toss-po': '이번 분기에 증명되어야 다음이 있어.',
      'kakao-dc': '이 패턴이 3년 뒤에도 같은 모양이어야 해.',
    } as Record<PersonaId, string>,
  },
  {
    pair: ['daangn-pd', 'line-pm'],
    theme: '로컬 맥락 vs 글로벌 보편성',
    framing: '동네 맥락 vs 해외에서도 통할까',
    stances: {
      'daangn-pd': '동네 사람 말로 써야 해. 번역체는 거리감을 만들어.',
      'line-pm': '일본·대만에서도 길이랑 아이콘이 깨지지 않아야 해.',
    } as Record<PersonaId, string>,
  },
  {
    pair: ['naver-pd', 'woowa-cbo'],
    theme: '정보 밀도 vs 감성 여백',
    framing: '많이 보여줄까 vs 숨통 줄까',
    stances: {
      'naver-pd': '필요한 건 한 화면에 다 보여야 해. 스크롤이 벽이야.',
      'woowa-cbo': '여백이 있어야 중요한 게 중요해 보여.',
    } as Record<PersonaId, string>,
  },
  {
    pair: ['line-pm', 'woowa-cbo'],
    theme: '문화 중립 vs 한국적 감성',
    framing: '어느 나라 사용자도 OK vs 한국인만 아는 그 느낌',
    stances: {
      'line-pm': '이 아이콘·카피가 다른 문화에서 오해 없이 읽혀야 해.',
      'woowa-cbo': '한국 사용자만 알아채는 작은 디테일이 브랜드가 돼.',
    } as Record<PersonaId, string>,
  },
];

function keyOf(a: PersonaId, b: PersonaId): string {
  return [a, b].sort().join('|');
}

const BY_KEY = new Map<string, ConflictTheme>();
for (const t of CONFLICT_THEMES) BY_KEY.set(keyOf(t.pair[0], t.pair[1]), t);

export function getThemeForPair(a: PersonaId, b: PersonaId): ConflictTheme | undefined {
  return BY_KEY.get(keyOf(a, b));
}
```

- [ ] **Step 4: PASS 확인**

```bash
npx vitest run lib/conflict/themes.test.ts
```
Expected: PASS (4 tests).

- [ ] **Step 5: 커밋**

```bash
git add lib/conflict/themes.ts lib/conflict/themes.test.ts
git commit -m "Add 5 conflict themes + stances for strong pairs — spec §3.2, designer-language phrasing"
```

---

### Task B5: `lib/conflict/lookup.ts` — 선택 인원에서 활성 충돌 카드 계산 (TDD)

**Files:**
- Create: `lib/conflict/lookup.test.ts`
- Create: `lib/conflict/lookup.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// lib/conflict/lookup.test.ts
import { describe, it, expect } from 'vitest';
import { activeConflictThemes } from './lookup';

describe('activeConflictThemes', () => {
  it('6명 전원 선택 시 5개 테마 모두 활성', () => {
    const themes = activeConflictThemes([
      'toss-po', 'daangn-pd', 'kakao-dc', 'naver-pd', 'line-pm', 'woowa-cbo',
    ]);
    expect(themes).toHaveLength(5);
  });

  it('토스 + 우아한만 선택 시 1개 테마 (숫자 vs 감성)', () => {
    const themes = activeConflictThemes(['toss-po', 'woowa-cbo']);
    expect(themes).toHaveLength(1);
    expect(themes[0].theme).toBe('숫자 vs 감성');
  });

  it('1명만 선택 시 0개', () => {
    expect(activeConflictThemes(['toss-po'])).toEqual([]);
  });

  it('강한 충돌 없는 조합(카카오 + 네이버)은 0개', () => {
    expect(activeConflictThemes(['kakao-dc', 'naver-pd'])).toEqual([]);
  });

  it('중복 페르소나가 섞여도 중복 테마를 만들지 않는다', () => {
    const themes = activeConflictThemes(['toss-po', 'toss-po', 'woowa-cbo']);
    expect(themes).toHaveLength(1);
  });
});
```

- [ ] **Step 2: FAIL 확인**

```bash
npx vitest run lib/conflict/lookup.test.ts
```
Expected: FAIL.

- [ ] **Step 3: 구현**

```ts
// lib/conflict/lookup.ts
/**
 * Role: 선택된 페르소나 배열 → STEP 5에 표시할 강한 충돌 테마 목록
 * Key Features: 매트릭스 룩업 (§4.1 옵션 A: 자동 트리거)
 * Dependencies: ./themes
 * Notes: 클라이언트·서버 양쪽에서 쓰이는 순수 함수
 */
import type { PersonaId } from '@/lib/personas/types';
import { CONFLICT_THEMES, type ConflictTheme } from './themes';

export function activeConflictThemes(selected: PersonaId[]): ConflictTheme[] {
  const set = new Set(selected);
  return CONFLICT_THEMES.filter(
    (t) => set.has(t.pair[0]) && set.has(t.pair[1]),
  );
}
```

- [ ] **Step 4: PASS 확인**

```bash
npx vitest run lib/conflict/lookup.test.ts
```
Expected: PASS (5 tests).

- [ ] **Step 5: 커밋**

```bash
git add lib/conflict/lookup.ts lib/conflict/lookup.test.ts
git commit -m "Add activeConflictThemes — derive STEP 5 conflict cards from selection (matrix lookup, §4.1)"
```

---

### Task B6: `lib/critique/types.ts` + `context-questions.ts` — 맥락 질문 데이터

**Files:**
- Create: `lib/critique/types.ts`
- Create: `lib/critique/context-questions.ts`
- Create: `lib/critique/context-questions.test.ts`

- [ ] **Step 1: 타입 작성**

```ts
// lib/critique/types.ts
/**
 * Role: 크리틱 도메인 타입
 * Key Features: ContextAnswer, CritiqueCard, ContextQuestion
 */

export type WorkKind =
  | 'launched' | 'concept' | 'side' | 'student' | 'redesign' | 'other';

export type RoleKind = 'pd-solo' | 'pd-with-pm' | 'part-of-team' | 'other';

export type ContextAnswer = {
  workKind: WorkKind;
  coreProblem: string;    // 한 문장 — spec §4.2 ② (50자 권장)
  role: RoleKind;
  proudDecision: string;  // 자랑하고 싶은 결정 — 옵션 (비워도 OK)
};

export type CritiqueCard = {
  personaId: string;
  diagnosis: string;      // 한 줄 진단 (≤40자)
  questions: string[];    // 3개 (각 ≤50자)
  suggestions: string[];  // 1-2개 (각 ≤80자)
};

export type ContextQuestion =
  | {
      id: 'workKind';
      prompt: string;
      kind: 'choice';
      options: Array<{ value: WorkKind; label: string }>;
    }
  | {
      id: 'coreProblem';
      prompt: string;
      kind: 'text';
      maxLength: number;
      required: true;
    }
  | {
      id: 'role';
      prompt: string;
      kind: 'choice';
      options: Array<{ value: RoleKind; label: string }>;
    }
  | {
      id: 'proudDecision';
      prompt: string;
      kind: 'text';
      maxLength: number;
      required: false;
    };
```

- [ ] **Step 2: 실패하는 테스트 작성**

```ts
// lib/critique/context-questions.test.ts
import { describe, it, expect } from 'vitest';
import { CONTEXT_QUESTIONS } from './context-questions';

describe('CONTEXT_QUESTIONS', () => {
  it('4개 질문 (spec §4.2: 객 2 + 자 2)', () => {
    expect(CONTEXT_QUESTIONS).toHaveLength(4);
  });

  it('순서: workKind → coreProblem → role → proudDecision', () => {
    expect(CONTEXT_QUESTIONS.map((q) => q.id)).toEqual([
      'workKind', 'coreProblem', 'role', 'proudDecision',
    ]);
  });

  it('객관식 질문은 options를 가진다', () => {
    const workKind = CONTEXT_QUESTIONS[0];
    expect(workKind.kind).toBe('choice');
    if (workKind.kind === 'choice') {
      expect(workKind.options.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('coreProblem은 required, proudDecision은 옵션', () => {
    const core = CONTEXT_QUESTIONS[1];
    const proud = CONTEXT_QUESTIONS[3];
    if (core.kind === 'text') expect(core.required).toBe(true);
    if (proud.kind === 'text') expect(proud.required).toBe(false);
  });
});
```

- [ ] **Step 3: FAIL 확인**

```bash
npx vitest run lib/critique/context-questions.test.ts
```
Expected: FAIL.

- [ ] **Step 4: 구현**

```ts
// lib/critique/context-questions.ts
/**
 * Role: STEP 2 맥락 대화 4개 질문 데이터 (spec §4.2)
 * Key Features: 객관식 2 + 자유 2, 포트폴리오 톤
 */
import type { ContextQuestion } from './types';

export const CONTEXT_QUESTIONS: ContextQuestion[] = [
  {
    id: 'workKind',
    prompt: '이 작업의 종류는?',
    kind: 'choice',
    options: [
      { value: 'launched', label: '실무 출시작' },
      { value: 'concept', label: '실무 컨셉' },
      { value: 'side', label: '사이드 프로젝트' },
      { value: 'student', label: '학생 작품' },
      { value: 'redesign', label: '리디자인' },
      { value: 'other', label: '기타' },
    ],
  },
  {
    id: 'coreProblem',
    prompt: '이 작업이 해결하려던 핵심 문제는? (한 문장)',
    kind: 'text',
    maxLength: 50,
    required: true,
  },
  {
    id: 'role',
    prompt: '본인의 역할은?',
    kind: 'choice',
    options: [
      { value: 'pd-solo', label: 'PD 단독' },
      { value: 'pd-with-pm', label: 'PD + PM' },
      { value: 'part-of-team', label: '디자인팀 일부' },
      { value: 'other', label: '기타' },
    ],
  },
  {
    id: 'proudDecision',
    prompt: '이 작업에서 가장 자랑하고 싶은 결정은? (없으면 비워도 OK)',
    kind: 'text',
    maxLength: 200,
    required: false,
  },
];
```

- [ ] **Step 5: PASS 확인**

```bash
npx vitest run lib/critique/context-questions.test.ts
```
Expected: PASS (4 tests).

- [ ] **Step 6: 커밋**

```bash
git add lib/critique
git commit -m "Add context questions data + types — 4 questions per spec §4.2 (portfolio tone)"
```

---

### Task B7: `lib/critique/guardrails.ts` — 카드 길이 검증 (TDD)

**Files:**
- Create: `lib/critique/guardrails.test.ts`
- Create: `lib/critique/guardrails.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// lib/critique/guardrails.test.ts
import { describe, it, expect } from 'vitest';
import { validateCard, MAX_LENGTHS } from './guardrails';
import type { CritiqueCard } from './types';

const ok: CritiqueCard = {
  personaId: 'toss-po',
  diagnosis: '7개 약관이 다 같은 무게라 시선이 멈출 곳이 없어.',
  questions: [
    '이 화면에서 시선이 가장 먼저 가는 곳이 어디야?',
    '필수와 선택을 시각적으로 어떻게 구분했어?',
    '"전체 동의"와 "발급 신청" 버튼의 위계 차이가 보여?',
  ],
  suggestions: ['필수 3개를 한 그룹으로, 선택 4개는 보조 영역으로 분리'],
};

describe('validateCard', () => {
  it('정상 카드는 valid', () => {
    expect(validateCard(ok).valid).toBe(true);
  });

  it('diagnosis 40자 초과 시 invalid', () => {
    const bad = { ...ok, diagnosis: 'x'.repeat(41) };
    expect(validateCard(bad).valid).toBe(false);
    expect(validateCard(bad).errors).toContain('diagnosis');
  });

  it('question 50자 초과 시 invalid', () => {
    const bad = { ...ok, questions: ['a'.repeat(51), ok.questions[1], ok.questions[2]] };
    expect(validateCard(bad).valid).toBe(false);
    expect(validateCard(bad).errors).toContain('questions');
  });

  it('질문 3개가 아니면 invalid', () => {
    const bad = { ...ok, questions: [ok.questions[0], ok.questions[1]] };
    expect(validateCard(bad).valid).toBe(false);
  });

  it('suggestion 80자 초과 시 invalid', () => {
    const bad = { ...ok, suggestions: ['s'.repeat(81)] };
    expect(validateCard(bad).valid).toBe(false);
  });

  it('제안 0개는 invalid, 1개 또는 2개는 valid', () => {
    expect(validateCard({ ...ok, suggestions: [] }).valid).toBe(false);
    expect(validateCard({ ...ok, suggestions: ['짧은 제안'] }).valid).toBe(true);
    expect(validateCard({ ...ok, suggestions: ['첫 제안', '둘째 제안'] }).valid).toBe(true);
    expect(validateCard({ ...ok, suggestions: ['a', 'b', 'c'] }).valid).toBe(false);
  });

  it('MAX_LENGTHS 상수 검증', () => {
    expect(MAX_LENGTHS.diagnosis).toBe(40);
    expect(MAX_LENGTHS.question).toBe(50);
    expect(MAX_LENGTHS.suggestion).toBe(80);
  });
});
```

- [ ] **Step 2: FAIL 확인**

```bash
npx vitest run lib/critique/guardrails.test.ts
```
Expected: FAIL.

- [ ] **Step 3: 구현**

```ts
// lib/critique/guardrails.ts
/**
 * Role: 크리틱 카드 가드레일 — 길이 제한 검증 (spec §4.3)
 * Key Features: 40/50/80자 한도, 질문 3개 고정, 제안 1-2개
 * Dependencies: ./types
 * Notes: system prompt에도 같은 한도를 명시하지만, LLM이 넘기면 클라이언트 측에서도 경고 가능
 */
import type { CritiqueCard } from './types';

export const MAX_LENGTHS = {
  diagnosis: 40,
  question: 50,
  suggestion: 80,
} as const;

export type ValidationResult = {
  valid: boolean;
  errors: Array<'diagnosis' | 'questions' | 'suggestions'>;
};

export function validateCard(card: CritiqueCard): ValidationResult {
  const errors: ValidationResult['errors'] = [];

  if (card.diagnosis.length > MAX_LENGTHS.diagnosis) errors.push('diagnosis');

  if (card.questions.length !== 3) {
    errors.push('questions');
  } else if (card.questions.some((q) => q.length > MAX_LENGTHS.question)) {
    errors.push('questions');
  }

  if (card.suggestions.length < 1 || card.suggestions.length > 2) {
    errors.push('suggestions');
  } else if (card.suggestions.some((s) => s.length > MAX_LENGTHS.suggestion)) {
    errors.push('suggestions');
  }

  return { valid: errors.length === 0, errors };
}
```

- [ ] **Step 4: PASS 확인**

```bash
npx vitest run lib/critique/guardrails.test.ts
```
Expected: PASS (7 tests).

- [ ] **Step 5: 커밋**

```bash
git add lib/critique/guardrails.ts lib/critique/guardrails.test.ts
git commit -m "Add card length guardrails — 40/50/80 limits, 3 questions, 1-2 suggestions per spec §4.3"
```

---

### Task B8: `lib/personas/system-prompt.ts` — system prompt 빌더 (TDD)

spec §4.4 7원칙 + §4.5 톤 가이드 + §4.3 길이 가드를 한 system prompt로 합성한다. 페르소나별 파트(첫 렌즈·양보 안 하는 것·질문 영역·대표 질문)도 넣는다.

**Files:**
- Create: `lib/personas/system-prompt.test.ts`
- Create: `lib/personas/system-prompt.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// lib/personas/system-prompt.test.ts
import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from './system-prompt';

describe('buildSystemPrompt', () => {
  it('토스 PO prompt는 페르소나 레이블·첫 렌즈 포함', () => {
    const p = buildSystemPrompt('toss-po');
    expect(p).toContain('토스 스타일 PO');
    expect(p).toContain('숫자 · 한 액션');
  });

  it('모든 페르소나 prompt에 디자인 원칙 7개 번호가 포함', () => {
    const p = buildSystemPrompt('woowa-cbo');
    for (const n of ['1.', '2.', '3.', '4.', '5.', '6.', '7.']) {
      expect(p).toContain(n);
    }
  });

  it('톤 가이드 핵심 문구 포함 (spec §4.5)', () => {
    const p = buildSystemPrompt('daangn-pd');
    expect(p).toMatch(/디자이너 언어/);
    expect(p).toMatch(/완성된 작업|포트폴리오/);
    expect(p).toMatch(/평가하지 않는다|동료/);
  });

  it('출력 포맷 가드 (40/50/80자) 포함', () => {
    const p = buildSystemPrompt('toss-po');
    expect(p).toContain('40');
    expect(p).toContain('50');
    expect(p).toContain('80');
  });

  it('JSON 스키마 지시 (diagnosis/questions/suggestions 3개 필드) 포함', () => {
    const p = buildSystemPrompt('kakao-dc');
    expect(p).toMatch(/diagnosis/);
    expect(p).toMatch(/questions/);
    expect(p).toMatch(/suggestions/);
  });

  it('페르소나별로 유니크한 대표 질문을 포함', () => {
    const toss = buildSystemPrompt('toss-po');
    const daangn = buildSystemPrompt('daangn-pd');
    expect(toss).toContain('시선');
    expect(daangn).toMatch(/엄마|읽힐/);
    expect(toss).not.toContain('엄마 핸드폰');
  });
});
```

- [ ] **Step 2: FAIL 확인**

```bash
npx vitest run lib/personas/system-prompt.test.ts
```
Expected: FAIL.

- [ ] **Step 3: 구현**

```ts
// lib/personas/system-prompt.ts
/**
 * Role: Claude API에 보낼 system prompt 생성 (페르소나별)
 * Key Features: 공통(디자인 7원칙 + 톤 가이드 + 출력 가드) + 페르소나별(렌즈·질문 영역·대표 질문)
 * Dependencies: ./definitions, ./types
 * Notes: 자구 한 글자도 무게 있음 — spec §4.4/§4.5 원문 유지
 */
import type { PersonaId } from './types';
import { PERSONAS } from './definitions';
import { MAX_LENGTHS } from '@/lib/critique/guardrails';

const DESIGN_PRINCIPLES = `
[디자인 원칙 7개 — 반드시 내면화할 것]
1. 크리틱은 판결이 아니라 대화다.
2. 답이 아니라 질문에 무게중심을 둔다. (제안은 허용하되 강한 자리는 질문)
3. 여백을 두려워하지 않는다. 침묵도 피드백이다.
4. 회사 이름은 빌리되 로고·색·폰트는 차용하지 않는다. (페르소나는 관점이지 브랜드가 아니다)
5. 디자이너에게는 디자이너 언어로 말한다. (PO·센터장 머릿속 언어가 아니라 디자인 결정의 언어로 변환)
6. 평가가 아니라 동료의 피드백이다. 완성작이 다음 작업으로 이어지도록 본다.
7. 자기 표현의 리허설이다. 디자이너가 자기 작업을 더 잘 이야기하게 돕는다.
`.trim();

const TONE_GUIDE = `
[톤 가이드]
디자이너가 완성된 작업을 포트폴리오로 들고 와서 보여줄 때, 시니어 동료/포트폴리오 리뷰어 입장에서 봅니다. 회의실 동료가 아니라 첫 만남의 리뷰어.
- 평가하지 않는다. 동료처럼 본다.
- 자기 머릿속 비즈니스 언어(전환율, MAU, 법적 필수 등)로 묻지 않는다. 디자이너가 답할 수 있는 디자인 결정의 언어(시각적 위계, 그룹핑, 시선 흐름, 컴포넌트 일관성 등)로 변환해서 묻는다.
- 질문 → 제안 순서. 답은 강요하지 않는다.
- 자기 영역을 벗어나는 주제는 다른 페르소나에게 양보한다.
`.trim();

const OUTPUT_GUARD = `
[출력 포맷 — 엄수]
반드시 아래 JSON 객체 하나만 출력하라. 추가 설명·마크다운·머리말 금지.

{
  "diagnosis": string,   // 한 줄 진단. ${MAX_LENGTHS.diagnosis}자 이내
  "questions": string[], // 정확히 3개. 각 ${MAX_LENGTHS.question}자 이내
  "suggestions": string[] // 1개 또는 2개. 각 ${MAX_LENGTHS.suggestion}자 이내
}

카드 전체 합계는 약 200자 이내(모바일 한 스크린에 2장 보이게).
`.trim();

export function buildSystemPrompt(id: PersonaId): string {
  const p = PERSONAS[id];

  const personaBlock = `
[당신의 페르소나]
- 레이블: ${p.label}
- 핵심 렌즈: ${p.firstLens}
- 질문 영역: ${p.questionDomain}
- 절대 양보 안 하는 것: ${p.nonNegotiables.join(' / ')}
- 양보 가능한 것: ${p.tradeoffs.join(' / ')}
- 대표 질문 스타일: "${p.representativeQuestion}"
`.trim();

  return [
    `당신은 "${p.label}"입니다. 가상의 페르소나로, 실제 회사·직원의 의견을 대변하지 않습니다.`,
    personaBlock,
    DESIGN_PRINCIPLES,
    TONE_GUIDE,
    OUTPUT_GUARD,
  ].join('\n\n');
}
```

- [ ] **Step 4: PASS 확인**

```bash
npx vitest run lib/personas/system-prompt.test.ts
```
Expected: PASS (6 tests).

- [ ] **Step 5: 커밋**

```bash
git add lib/personas/system-prompt.ts lib/personas/system-prompt.test.ts
git commit -m "Add system prompt builder — 7 principles + tone guide + length guard + per-persona block"
```

---

### Task B9: API Route `app/api/critique/route.ts` + 통합 테스트 (모킹)

클라이언트는 페르소나별 1회씩 병렬로 `/api/critique`를 호출. 각 요청은 `{ personaId, contextAnswers, images }`를 보내고, 응답은 Claude의 스트리밍 텍스트 청크를 그대로 흘려보낸다.

**Files:**
- Create: `tests/helpers/mock-anthropic.ts`
- Create: `tests/api/critique.test.ts`
- Create: `app/api/critique/route.ts`

- [ ] **Step 1: SDK 모킹 헬퍼 작성**

```ts
// tests/helpers/mock-anthropic.ts
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
```

- [ ] **Step 2: 실패하는 통합 테스트 작성**

```ts
// tests/api/critique.test.ts
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
```

- [ ] **Step 3: FAIL 확인**

```bash
npx vitest run tests/api/critique.test.ts
```
Expected: FAIL — route.ts 미존재.

- [ ] **Step 4: Route handler 구현**

```ts
// app/api/critique/route.ts
/**
 * Role: Claude API 스트리밍 프록시 — 페르소나 1명 크리틱 생성
 * Key Features: 서버 사이드 전용 (API 키 보호), 이미지+맥락+페르소나 system prompt 조립, 스트리밍 패스스루
 * Dependencies: @anthropic-ai/sdk, @/lib/personas, @/lib/critique
 * Notes: 클라이언트는 페르소나별로 이 엔드포인트를 병렬 호출한다 (§4.6 STEP 4)
 */
import Anthropic from '@anthropic-ai/sdk';
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

function buildUserContent(contextAnswers: ContextAnswer, images: ImageInput[]) {
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
    ...images.map((img) => ({
      type: 'image' as const,
      source: { type: 'base64' as const, media_type: img.mediaType, data: img.base64 },
    })),
    { type: 'text' as const, text: contextText },
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response('server misconfigured', { status: 500 });

  const client = new Anthropic({ apiKey });

  const system = buildSystemPrompt(body.personaId);
  const userContent = buildUserContent(body.contextAnswers, body.images);

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-5',
    max_tokens: 800,
    system,
    messages: [{ role: 'user', content: userContent }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of (stream as any).toTextStream()) {
          controller.enqueue(encoder.encode(chunk));
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
```

- [ ] **Step 5: PASS 확인**

```bash
npx vitest run tests/api/critique.test.ts
```
Expected: PASS (4 tests). 필요 시 모킹 시그니처 조정.

- [ ] **Step 6: 커밋**

```bash
git add tests/helpers tests/api app/api/critique/route.ts
git commit -m "Add /api/critique streaming route — server-side Anthropic call, per-persona system prompt, mocked integration tests"
```

---

**Phase B 검증 체크포인트**

```bash
npm test && npm run typecheck
```
Expected: 도메인 모든 테스트 통과 (≈26개) + API Route 통합 테스트 통과 (4개) + typecheck 통과.

---

# Phase C — UI 5 STEP

## UI 테스트 원칙

- **최소 행동 테스트만**: 핵심 상호작용 1-2개/컴포넌트.
- `PersonaPicker`·`ConflictCard`·`DropZone`만 테스트 대상. 순수 프리젠테이션 컴포넌트는 테스트 없음.
- ⭐ **STEP 5 `ConflictCard`의 "어느 쪽?" 입력칸은 반드시 테스트** — USP 핵심이라 회귀 방지가 중요.

---

### Task C1: `lib/store.ts` — Zustand 앱 상태

**Files:**
- Create: `lib/store.ts`

- [ ] **Step 1: 스토어 작성**

```ts
/**
 * Role: 5단계 플로우 동안 유지되는 클라이언트 상태
 * Key Features: 업로드 이미지(base64), 맥락 답변, 선택 페르소나, 크리틱 결과, STEP 5 유저 입장 입력
 * Dependencies: zustand
 * Notes: DB 없음(MVP) — 새로고침 시 날아감. localStorage 저장 안 함(이미지 용량 문제).
 */
'use client';

import { create } from 'zustand';
import type { PersonaId } from '@/lib/personas/types';
import type { ContextAnswer, CritiqueCard } from '@/lib/critique/types';

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
```

- [ ] **Step 2: 타입체크**

```bash
npm run typecheck
```
Expected: 오류 없음.

- [ ] **Step 3: 커밋**

```bash
git add lib/store.ts
git commit -m "Add Zustand app store — images, context, selection, streaming critiques, user stances"
```

---

### Task C2: `components/app/Disclaimer.tsx`

**Files:**
- Create: `components/app/Disclaimer.tsx`

- [ ] **Step 1: 작성**

```tsx
/**
 * Role: 풀이 2 디스클레이머 (spec §2.2)
 * Key Features: 랜딩과 페르소나 선택 화면에 반복 노출
 */
export function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={`text-xs text-[var(--color-text-muted)] ${className ?? ''}`}>
      각 회사의 공개된 디자인 철학과 블로그/컨퍼런스 발언을 기반으로 재구성한 가상의 페르소나입니다.
      실제 해당 회사 또는 직원의 의견을 대변하지 않습니다.
    </p>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add components/app/Disclaimer.tsx
git commit -m "Add Disclaimer component — pool 2 required notice"
```

---

### Task C3: `components/app/DropZone.tsx` + 최소 행동 테스트

**Files:**
- Create: `components/app/DropZone.tsx`
- Create: `components/app/DropZone.test.tsx`

- [ ] **Step 1: 컴포넌트 작성**

```tsx
/**
 * Role: 스크린샷 드래그앤드롭 업로드 (STEP 1) — 다중 업로드 허용 (§4.6)
 * Key Features: drop/click-to-select, base64 인코딩, object URL 미리보기
 * Dependencies: @/lib/store
 */
'use client';

import * as React from 'react';
import { useAppStore, type UploadedImage } from '@/lib/store';

const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

async function fileToUploaded(file: File): Promise<UploadedImage> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  const base64 = btoa(bin);
  return {
    mediaType: file.type as UploadedImage['mediaType'],
    base64,
    previewUrl: URL.createObjectURL(file),
  };
}

export function DropZone() {
  const images = useAppStore((s) => s.images);
  const setImages = useAppStore((s) => s.setImages);
  const [isDragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList).filter((f) => ACCEPT.includes(f.type));
    const uploaded = await Promise.all(files.map(fileToUploaded));
    setImages([...images, ...uploaded]);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="스크린샷 업로드 영역"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void handleFiles(e.dataTransfer.files);
      }}
      className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed p-8 text-center transition-colors ${
        isDragging ? 'border-[var(--color-accent)] bg-[var(--color-subtle)]' : 'border-[var(--color-border-strong)]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(',')}
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <p className="text-sm text-[var(--color-text-secondary)]">
        스크린샷을 여기에 드래그하거나 클릭해서 선택하세요 (여러 장 가능)
      </p>
      {images.length > 0 && (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          업로드됨: {images.length}장
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 최소 행동 테스트 작성**

```tsx
// components/app/DropZone.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DropZone } from './DropZone';
import { useAppStore } from '@/lib/store';

// jsdom에 URL.createObjectURL 없음 — polyfill
beforeEach(() => {
  (globalThis.URL as any).createObjectURL = () => 'blob:mock';
  useAppStore.getState().reset();
});

describe('DropZone', () => {
  it('파일 선택 시 store.images에 추가된다', async () => {
    render(<DropZone />);
    const file = new File(['hello'], 'a.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, file);
    expect(useAppStore.getState().images.length).toBe(1);
    expect(screen.getByText(/업로드됨: 1장/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: 실행 & PASS**

```bash
npx vitest run components/app/DropZone.test.tsx
```
Expected: PASS (1 test).

- [ ] **Step 4: 커밋**

```bash
git add components/app/DropZone.tsx components/app/DropZone.test.tsx
git commit -m "Add DropZone — multi-file drop/click upload, base64 store, minimal behavior test"
```

---

### Task C4: STEP 1 — `app/page.tsx` 정식 구현

**Files:**
- Rewrite: `app/page.tsx`

- [ ] **Step 1: 랜딩 페이지 작성**

```tsx
/**
 * Role: STEP 1 랜딩 — 헤드라인 + 업로드 + 페르소나 이름 + 디스클레이머 + 진행 버튼
 * Key Features: spec §4.6 STEP 1 박제 (부록 카피 1번, 6인 노출)
 */
'use client';

import Link from 'next/link';
import { DropZone } from '@/components/app/DropZone';
import { Disclaimer } from '@/components/app/Disclaimer';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { PERSONAS } from '@/lib/personas/definitions';
import { PERSONA_IDS } from '@/lib/personas/types';

export default function Home() {
  const imageCount = useAppStore((s) => s.images.length);

  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        완성작 들고 와요.<br />6명이 봐줍니다.
      </h1>
      <p className="mt-4 text-[var(--color-text-secondary)]">
        포트폴리오 스크린샷을 올리면, 6인의 가상 리뷰어가 면접·리뷰에서 받을 만한 질문을 먼저 던져줍니다.
      </p>

      <section className="mt-10">
        <DropZone />
      </section>

      <section className="mt-8">
        <p className="text-sm font-medium">봐줄 6명</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {PERSONA_IDS.map((id) => (
            <li
              key={id}
              className="rounded-full border px-3 py-1 text-xs text-[var(--color-text-secondary)]"
            >
              {PERSONAS[id].label}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <Disclaimer />
      </section>

      <section className="mt-10">
        <Link href="/context" aria-disabled={imageCount === 0}>
          <Button size="lg" disabled={imageCount === 0}>
            다음 — 맥락 대화
          </Button>
        </Link>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: dev에서 눈으로 확인 (업로드 → 버튼 활성화)**

```bash
npm run dev
```
Expected: `http://localhost:3000` — 헤드라인·업로드·6인 이름·디스클레이머·다음 버튼이 보인다. 스크린샷 드롭 시 "업로드됨: N장" 표시, "다음" 버튼 활성화. Ctrl+C 종료.

- [ ] **Step 3: 커밋**

```bash
git add app/page.tsx
git commit -m "Implement STEP 1 landing — headline, DropZone, persona chips, disclaimer, next CTA"
```

---

### Task C5: `components/app/ContextForm.tsx` — STEP 2 4개 질문 폼

**Files:**
- Create: `components/app/ContextForm.tsx`

- [ ] **Step 1: 컴포넌트 작성**

```tsx
/**
 * Role: STEP 2 4개 맥락 질문 폼 (spec §4.2)
 * Key Features: 객관식 2 + 자유 2, coreProblem 필수
 * Dependencies: @/lib/critique/context-questions, @/lib/store
 */
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CONTEXT_QUESTIONS } from '@/lib/critique/context-questions';
import type { ContextAnswer, RoleKind, WorkKind } from '@/lib/critique/types';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function ContextForm() {
  const router = useRouter();
  const existing = useAppStore((s) => s.contextAnswers);
  const setContextAnswers = useAppStore((s) => s.setContextAnswers);

  const [workKind, setWorkKind] = React.useState<WorkKind>(existing?.workKind ?? 'launched');
  const [coreProblem, setCoreProblem] = React.useState(existing?.coreProblem ?? '');
  const [role, setRole] = React.useState<RoleKind>(existing?.role ?? 'pd-solo');
  const [proudDecision, setProudDecision] = React.useState(existing?.proudDecision ?? '');

  const canSubmit = coreProblem.trim().length > 0;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const next: ContextAnswer = { workKind, coreProblem: coreProblem.trim(), role, proudDecision: proudDecision.trim() };
    setContextAnswers(next);
    router.push('/personas');
  };

  const workKindQ = CONTEXT_QUESTIONS[0];
  const coreProblemQ = CONTEXT_QUESTIONS[1];
  const roleQ = CONTEXT_QUESTIONS[2];
  const proudQ = CONTEXT_QUESTIONS[3];

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {workKindQ.kind === 'choice' && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-[var(--color-text-primary)]">{workKindQ.prompt}</legend>
          <div className="flex flex-wrap gap-2">
            {workKindQ.options.map((opt) => (
              <label key={opt.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="workKind"
                  value={opt.value}
                  checked={workKind === opt.value}
                  onChange={() => setWorkKind(opt.value)}
                  className="peer sr-only"
                />
                <span className="inline-block rounded-full border px-3 py-1 text-sm peer-checked:border-[var(--color-accent)] peer-checked:bg-[var(--color-accent)] peer-checked:text-[var(--color-accent-foreground)]">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {coreProblemQ.kind === 'text' && (
        <div className="space-y-2">
          <Label htmlFor="coreProblem">{coreProblemQ.prompt}</Label>
          <Input
            id="coreProblem"
            maxLength={coreProblemQ.maxLength}
            value={coreProblem}
            onChange={(e) => setCoreProblem(e.target.value)}
            placeholder="예) 카드 약관 동의 과정을 덜 까다롭게"
            required
          />
        </div>
      )}

      {roleQ.kind === 'choice' && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-[var(--color-text-primary)]">{roleQ.prompt}</legend>
          <div className="flex flex-wrap gap-2">
            {roleQ.options.map((opt) => (
              <label key={opt.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value={opt.value}
                  checked={role === opt.value}
                  onChange={() => setRole(opt.value)}
                  className="peer sr-only"
                />
                <span className="inline-block rounded-full border px-3 py-1 text-sm peer-checked:border-[var(--color-accent)] peer-checked:bg-[var(--color-accent)] peer-checked:text-[var(--color-accent-foreground)]">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {proudQ.kind === 'text' && (
        <div className="space-y-2">
          <Label htmlFor="proudDecision">{proudQ.prompt}</Label>
          <Textarea
            id="proudDecision"
            maxLength={proudQ.maxLength}
            value={proudDecision}
            onChange={(e) => setProudDecision(e.target.value)}
            placeholder="(없으면 비워도 OK)"
          />
        </div>
      )}

      <Button type="submit" size="lg" disabled={!canSubmit}>
        6명에게 보여주기
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: 타입체크**

```bash
npm run typecheck
```
Expected: 오류 없음.

- [ ] **Step 3: 커밋**

```bash
git add components/app/ContextForm.tsx
git commit -m "Add ContextForm — 4 questions per §4.2 (2 choice + 2 text), required coreProblem"
```

---

### Task C6: STEP 2 — `app/context/page.tsx`

**Files:**
- Create: `app/context/page.tsx`

- [ ] **Step 1: 페이지 작성**

```tsx
/**
 * Role: STEP 2 맥락 대화 화면 — 좌측 스샷 미리보기 + 우측 폼
 * Key Features: 이미지 없으면 STEP 1로 돌려보낸다
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { ContextForm } from '@/components/app/ContextForm';

export default function ContextPage() {
  const router = useRouter();
  const images = useAppStore((s) => s.images);

  useEffect(() => {
    if (images.length === 0) router.replace('/');
  }, [images.length, router]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-xl font-semibold">맥락 한 번 나눠볼까요</h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        면접·포트폴리오 리뷰에서 자주 받는 질문 4개예요. 미리 답해보는 것 자체가 리허설.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <section aria-label="업로드한 스크린샷">
          <div className="grid grid-cols-2 gap-3">
            {images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={img.previewUrl}
                alt={`업로드 ${i + 1}`}
                className="aspect-square w-full rounded-[var(--radius-md)] border object-cover"
              />
            ))}
          </div>
        </section>
        <section aria-label="맥락 질문 폼">
          <ContextForm />
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 빌드/dev 확인**

```bash
npm run dev
```
Expected: STEP 1에서 이미지 업로드 → "다음" 클릭 → `/context` 진입, 좌측 썸네일·우측 폼 노출. 폼 제출 → `/personas`로 이동(아직 페이지 없어 404 OK). 종료.

- [ ] **Step 3: 커밋**

```bash
git add app/context/page.tsx
git commit -m "Implement STEP 2 context page — thumbnails + ContextForm, bounce back if no images"
```

---

### Task C7: `components/app/PersonaPicker.tsx` + 최소 행동 테스트

**Files:**
- Create: `components/app/PersonaPicker.tsx`
- Create: `components/app/PersonaPicker.test.tsx`

- [ ] **Step 1: 컴포넌트 작성**

```tsx
/**
 * Role: STEP 3 페르소나 선택 (6명, 디폴트 전원) — 강한 충돌 쌍 수 실시간 미리보기
 * Key Features: 체크박스 + 충돌 수 뱃지, 매트릭스 룩업(§4.1 옵션 A)
 * Dependencies: @/lib/personas, @/lib/conflict/lookup, @/lib/store
 */
'use client';

import { PERSONA_IDS, type PersonaId } from '@/lib/personas/types';
import { PERSONAS } from '@/lib/personas/definitions';
import { activeConflictThemes } from '@/lib/conflict/lookup';
import { useAppStore } from '@/lib/store';
import { Checkbox } from '@/components/ui/checkbox';

export function PersonaPicker() {
  const selected = useAppStore((s) => s.selectedPersonas);
  const setSelected = useAppStore((s) => s.setSelectedPersonas);
  const strongCount = activeConflictThemes(selected).length;

  const toggle = (id: PersonaId) => {
    if (selected.includes(id)) setSelected(selected.filter((x) => x !== id));
    else setSelected([...selected, id]);
  };

  return (
    <div>
      <ul className="divide-y rounded-[var(--radius-lg)] border bg-[var(--color-surface)]">
        {PERSONA_IDS.map((id) => {
          const p = PERSONAS[id];
          const checked = selected.includes(id);
          return (
            <li key={id} className="flex items-start gap-3 p-4">
              <Checkbox
                id={`persona-${id}`}
                checked={checked}
                onChange={() => toggle(id)}
                aria-label={p.label}
              />
              <label htmlFor={`persona-${id}`} className="flex-1 cursor-pointer">
                <div className="text-sm font-medium">{p.label}</div>
                <div className="text-xs text-[var(--color-text-secondary)]">
                  {p.firstLens} · {p.questionDomain}
                </div>
              </label>
            </li>
          );
        })}
      </ul>

      <p
        className="mt-4 text-sm text-[var(--color-text-secondary)]"
        data-testid="conflict-preview"
      >
        {strongCount > 0
          ? `선택한 페르소나 중 강한 충돌 ${strongCount}쌍이 있어요.`
          : '선택한 페르소나들 사이에 강한 충돌은 없어요.'}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: 최소 행동 테스트 작성**

```tsx
// components/app/PersonaPicker.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PersonaPicker } from './PersonaPicker';
import { useAppStore } from '@/lib/store';

beforeEach(() => useAppStore.getState().reset());

describe('PersonaPicker', () => {
  it('디폴트로 6명 전원 선택, 강한 충돌 5쌍 미리보기', () => {
    render(<PersonaPicker />);
    expect(screen.getByTestId('conflict-preview')).toHaveTextContent('5쌍');
  });

  it('토스 PO 체크 해제 시 충돌 쌍 수가 3쌍으로 줄어든다', async () => {
    render(<PersonaPicker />);
    const tossCheckbox = screen.getByLabelText('토스 스타일 PO');
    await userEvent.click(tossCheckbox);
    expect(screen.getByTestId('conflict-preview')).toHaveTextContent('3쌍');
  });

  it('모두 해제하면 "강한 충돌은 없어요" 문구', async () => {
    const { setSelectedPersonas } = useAppStore.getState();
    setSelectedPersonas([]);
    render(<PersonaPicker />);
    expect(screen.getByTestId('conflict-preview')).toHaveTextContent('없어요');
  });
});
```

- [ ] **Step 3: PASS 확인**

```bash
npx vitest run components/app/PersonaPicker.test.tsx
```
Expected: PASS (3 tests).

- [ ] **Step 4: 커밋**

```bash
git add components/app/PersonaPicker.tsx components/app/PersonaPicker.test.tsx
git commit -m "Add PersonaPicker — checkbox list + live strong-conflict count (matrix lookup)"
```

---

### Task C8: STEP 3 — `app/personas/page.tsx`

**Files:**
- Create: `app/personas/page.tsx`

- [ ] **Step 1: 페이지 작성**

```tsx
/**
 * Role: STEP 3 페르소나 선택 화면
 * Key Features: PersonaPicker + Disclaimer + 다음 버튼(선택 최소 1명)
 */
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { PersonaPicker } from '@/components/app/PersonaPicker';
import { Disclaimer } from '@/components/app/Disclaimer';
import { Button } from '@/components/ui/button';

export default function PersonasPage() {
  const router = useRouter();
  const contextAnswers = useAppStore((s) => s.contextAnswers);
  const selected = useAppStore((s) => s.selectedPersonas);

  useEffect(() => {
    if (!contextAnswers) router.replace('/context');
  }, [contextAnswers, router]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-xl font-semibold">누가 봐주면 좋을까요</h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        디폴트는 6명 전원이에요. 빼고 싶은 사람은 체크를 풀면 돼요.
      </p>

      <section className="mt-8">
        <PersonaPicker />
      </section>

      <section className="mt-6">
        <Disclaimer />
      </section>

      <section className="mt-10 flex gap-3">
        <Link href="/result">
          <Button size="lg" disabled={selected.length === 0}>
            크리틱 받기
          </Button>
        </Link>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add app/personas/page.tsx
git commit -m "Implement STEP 3 personas page — picker + disclaimer + next CTA (min 1 selected)"
```

---

### Task C9: `components/app/CritiqueCard.tsx` — STEP 4 페르소나 카드

**Files:**
- Create: `components/app/CritiqueCard.tsx`

- [ ] **Step 1: 컴포넌트 작성**

```tsx
/**
 * Role: STEP 4 페르소나별 크리틱 카드 (스트리밍 텍스트 렌더)
 * Key Features: LLM이 뱉는 JSON을 점진 파싱 — 완성 전엔 raw 프리뷰, 완성 후 구조화 렌더
 * Dependencies: @/lib/personas, @/lib/critique/types
 * Notes: JSON 파싱 실패 시 raw 텍스트 폴백 (디자인 원칙: 실패해도 침묵보단 대화)
 */
'use client';

import type { PersonaId } from '@/lib/personas/types';
import { PERSONAS } from '@/lib/personas/definitions';
import type { CritiqueCard as CardData } from '@/lib/critique/types';
import { Card, CardBody, CardTitle } from '@/components/ui/card';

type Props = {
  personaId: PersonaId;
  text: string;
  done: boolean;
  error?: string;
};

function tryParse(text: string): CardData | null {
  try {
    const obj = JSON.parse(text.trim());
    if (
      obj &&
      typeof obj.diagnosis === 'string' &&
      Array.isArray(obj.questions) &&
      Array.isArray(obj.suggestions)
    ) {
      return { personaId: '', ...obj };
    }
  } catch {}
  return null;
}

export function CritiqueCardView({ personaId, text, done, error }: Props) {
  const persona = PERSONAS[personaId];
  const parsed = done ? tryParse(text) : null;

  return (
    <Card>
      <CardTitle>{persona.label}</CardTitle>
      {error ? (
        <CardBody>
          <p className="text-[var(--color-danger)]">크리틱을 불러오지 못했어요: {error}</p>
        </CardBody>
      ) : parsed ? (
        <CardBody className="space-y-3">
          <p>
            <span className="mr-1">🩺</span>
            <span className="font-medium text-[var(--color-text-primary)]">{parsed.diagnosis}</span>
          </p>
          <div>
            <p className="font-medium text-[var(--color-text-primary)]">❓ 질문</p>
            <ol className="mt-1 list-decimal space-y-1 pl-5">
              {parsed.questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
          </div>
          <div>
            <p className="font-medium text-[var(--color-text-primary)]">💡 제안</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {parsed.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </CardBody>
      ) : (
        <CardBody>
          <pre className="whitespace-pre-wrap font-sans text-sm">{text || '...'}</pre>
          {!done && <p className="mt-2 text-xs text-[var(--color-text-muted)]">쓰는 중…</p>}
        </CardBody>
      )}
    </Card>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add components/app/CritiqueCard.tsx
git commit -m "Add CritiqueCardView — streaming text with post-stream JSON parse + raw fallback"
```

---

### Task C10: `components/app/ConflictCard.tsx` + **⭐ 최소 행동 테스트 (USP 핵심)**

⭐ **spec §4.6 STEP 5 / 의사결정 #15** — "당신은 어느 쪽?" 입력칸은 USP 핵심. 이 테스트는 절대 누락 금지.

**Files:**
- Create: `components/app/ConflictCard.tsx`
- Create: `components/app/ConflictCard.test.tsx`

- [ ] **Step 1: 컴포넌트 작성**

```tsx
/**
 * Role: STEP 5 충돌 카드 — 테마 + 두 페르소나 입장 + "당신은 어느 쪽?" 입력칸 (⭐ USP 핵심)
 * Key Features: 입력은 store에 저장 (DB 없음, 새로고침 시 휘발), 선택적 응답
 * Dependencies: @/lib/personas, @/lib/conflict/themes, @/lib/store
 */
'use client';

import { PERSONAS } from '@/lib/personas/definitions';
import type { ConflictTheme } from '@/lib/conflict/themes';
import { useAppStore, pairKeyOf } from '@/lib/store';
import { Card, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function ConflictCard({ theme }: { theme: ConflictTheme }) {
  const [a, b] = theme.pair;
  const key = pairKeyOf(a, b);
  const value = useAppStore((s) => s.userStances[key] ?? '');
  const setUserStance = useAppStore((s) => s.setUserStance);

  return (
    <Card data-testid={`conflict-${key}`}>
      <CardTitle>{theme.theme}</CardTitle>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{theme.framing}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[var(--radius-md)] border p-3">
          <p className="text-xs font-medium">{PERSONAS[a].label}</p>
          <p className="mt-1 text-sm">{theme.stances[a]}</p>
        </div>
        <div className="rounded-[var(--radius-md)] border p-3">
          <p className="text-xs font-medium">{PERSONAS[b].label}</p>
          <p className="mt-1 text-sm">{theme.stances[b]}</p>
        </div>
      </div>

      <div className="mt-5">
        <Label htmlFor={`stance-${key}`}>당신은 어느 쪽?</Label>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          면접·포트폴리오 리뷰에서 받을 질문이에요. 답하지 않아도 괜찮아요.
        </p>
        <Textarea
          id={`stance-${key}`}
          className="mt-2"
          placeholder="이 디자인에선 ___ 쪽으로 기울었어요. 이유는 ___"
          value={value}
          onChange={(e) => setUserStance(key, e.target.value)}
        />
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: USP 회귀 방지 테스트 작성**

```tsx
// components/app/ConflictCard.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConflictCard } from './ConflictCard';
import { CONFLICT_THEMES } from '@/lib/conflict/themes';
import { useAppStore, pairKeyOf } from '@/lib/store';

beforeEach(() => useAppStore.getState().reset());

describe('ConflictCard (⭐ USP 핵심)', () => {
  const theme = CONFLICT_THEMES[0]; // 토스 ↔ 우아한

  it('"당신은 어느 쪽?" 라벨과 textarea가 렌더된다', () => {
    render(<ConflictCard theme={theme} />);
    expect(screen.getByLabelText('당신은 어느 쪽?')).toBeInTheDocument();
  });

  it('두 페르소나의 한 줄 입장이 렌더된다', () => {
    render(<ConflictCard theme={theme} />);
    expect(screen.getByText(theme.stances[theme.pair[0]])).toBeInTheDocument();
    expect(screen.getByText(theme.stances[theme.pair[1]])).toBeInTheDocument();
  });

  it('입력값이 store.userStances에 저장된다 (pair key 기반)', async () => {
    render(<ConflictCard theme={theme} />);
    const ta = screen.getByLabelText('당신은 어느 쪽?');
    await userEvent.type(ta, '감성 쪽에 가까움');
    const key = pairKeyOf(theme.pair[0], theme.pair[1]);
    expect(useAppStore.getState().userStances[key]).toBe('감성 쪽에 가까움');
  });
});
```

- [ ] **Step 3: PASS 확인**

```bash
npx vitest run components/app/ConflictCard.test.tsx
```
Expected: PASS (3 tests).

- [ ] **Step 4: 커밋**

```bash
git add components/app/ConflictCard.tsx components/app/ConflictCard.test.tsx
git commit -m "Add ConflictCard with '당신은 어느 쪽?' input (⭐ USP core) — stance stored by pair key + regression test"
```

---

### Task C11: 스트리밍 훅 `lib/useCritiqueStreams.ts` — 선택 페르소나별 병렬 fetch

**Files:**
- Create: `lib/useCritiqueStreams.ts`

- [ ] **Step 1: 훅 작성**

```ts
/**
 * Role: 선택 페르소나별로 /api/critique 병렬 호출 + 스트리밍 청크를 store에 적재
 * Key Features: AbortController 관리, 실패 시 error 마킹
 * Dependencies: @/lib/store
 */
'use client';

import { useEffect, useRef } from 'react';
import type { PersonaId } from '@/lib/personas/types';
import { useAppStore } from '@/lib/store';

async function runOne(
  personaId: PersonaId,
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

export function useCritiqueStreams() {
  const selected = useAppStore((s) => s.selectedPersonas);
  const images = useAppStore((s) => s.images);
  const contextAnswers = useAppStore((s) => s.contextAnswers);
  const appendChunk = useAppStore((s) => s.appendCritiqueChunk);
  const markDone = useAppStore((s) => s.markCritiqueDone);
  const markError = useAppStore((s) => s.markCritiqueError);

  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    if (!contextAnswers || images.length === 0 || selected.length === 0) return;
    started.current = true;

    const controller = new AbortController();

    for (const id of selected) {
      const body = {
        personaId: id,
        contextAnswers,
        images: images.map((i) => ({ mediaType: i.mediaType, base64: i.base64 })),
      };
      runOne(id, body, controller.signal, (chunk) => appendChunk(id, chunk))
        .then(() => markDone(id))
        .catch((err) => markError(id, err instanceof Error ? err.message : String(err)));
    }

    return () => controller.abort();
  }, [selected, images, contextAnswers, appendChunk, markDone, markError]);
}
```

- [ ] **Step 2: 타입체크**

```bash
npm run typecheck
```
Expected: 오류 없음.

- [ ] **Step 3: 커밋**

```bash
git add lib/useCritiqueStreams.ts
git commit -m "Add useCritiqueStreams hook — parallel fetch per selected persona, pipe chunks into store"
```

---

### Task C12: STEP 4 + STEP 5 — `app/result/page.tsx`

**Files:**
- Create: `app/result/page.tsx`

- [ ] **Step 1: 페이지 작성**

```tsx
/**
 * Role: STEP 4(크리틱 카드 그리드) + STEP 5(충돌 카드) — 같은 페이지 (spec §4.6)
 * Key Features: 스트리밍 훅 가동, 선택 페르소나 기준 충돌 카드 자동 노출
 * Dependencies: @/lib/useCritiqueStreams, @/lib/conflict/lookup
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useCritiqueStreams } from '@/lib/useCritiqueStreams';
import { CritiqueCardView } from '@/components/app/CritiqueCard';
import { ConflictCard } from '@/components/app/ConflictCard';
import { activeConflictThemes } from '@/lib/conflict/lookup';
import type { PersonaId } from '@/lib/personas/types';

export default function ResultPage() {
  const router = useRouter();
  const selected = useAppStore((s) => s.selectedPersonas);
  const images = useAppStore((s) => s.images);
  const contextAnswers = useAppStore((s) => s.contextAnswers);
  const critiques = useAppStore((s) => s.critiques);

  useEffect(() => {
    if (images.length === 0) router.replace('/');
    else if (!contextAnswers) router.replace('/context');
    else if (selected.length === 0) router.replace('/personas');
  }, [images.length, contextAnswers, selected.length, router]);

  useCritiqueStreams();

  const themes = activeConflictThemes(selected);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-xl font-semibold">6명의 크리틱</h1>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {selected.map((id) => {
          const c = critiques[id] ?? { text: '', done: false };
          return (
            <CritiqueCardView
              key={id}
              personaId={id as PersonaId}
              text={c.text}
              done={c.done}
              error={c.error}
            />
          );
        })}
      </section>

      {themes.length > 0 && (
        <section className="mt-14">
          <h2 className="text-lg font-semibold">부딪히는 지점 — 당신의 차례</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            강한 충돌이 생기는 쌍이에요. 면접·리뷰에서 받을 질문을 미리 답해보세요.
          </p>
          <div className="mt-6 space-y-4">
            {themes.map((t) => (
              <ConflictCard key={`${t.pair[0]}|${t.pair[1]}`} theme={t} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
```

- [ ] **Step 2: 타입체크**

```bash
npm run typecheck
```
Expected: 오류 없음.

- [ ] **Step 3: 커밋**

```bash
git add app/result/page.tsx
git commit -m "Implement STEP 4 + STEP 5 result page — streaming critique grid + auto conflict cards"
```

---

**Phase C 검증 체크포인트**

```bash
npm test && npm run typecheck && npm run build
```
Expected: 모든 유닛·통합·UI 행동 테스트 통과, typecheck 통과, Next.js 빌드 성공.

---

# Phase D — 마무리

---

### Task D1: 로컬 end-to-end 수동 스모크 테스트

이 단계에서는 실제 `ANTHROPIC_API_KEY`를 `.env`에 넣고 전체 플로우를 눈으로 확인한다.

- [ ] **Step 1: `.env`에 키 설정 (이미 있으면 패스)**

```bash
grep -q ANTHROPIC_API_KEY .env || (echo "ANTHROPIC_API_KEY=\"sk-ant-...\"" >> .env)
```

- [ ] **Step 2: dev 서버 가동**

```bash
npm run dev
```

- [ ] **Step 3: 수동 체크리스트 (브라우저에서)**

`http://localhost:3000` 접속 후 순서대로 확인:

- [ ] STEP 1 랜딩 — 헤드라인 "완성작 들고 와요. 6명이 봐줍니다." 노출, 6인 이름 칩 노출, 디스클레이머 노출
- [ ] 스크린샷 1장 이상 드롭 → "업로드됨: N장" 표시, "다음 — 맥락 대화" 버튼 활성화
- [ ] STEP 2 — 좌측 썸네일, 우측 4개 질문 폼, coreProblem 비우면 제출 불가
- [ ] STEP 3 — 6명 디폴트 체크 + "강한 충돌 5쌍" 문구, 토스 해제 시 숫자 변화
- [ ] STEP 4 — 크리틱 받기 클릭 → 각 카드 텍스트가 스트리밍으로 채워짐, 완성 후 🩺/❓/💡 구조화 렌더
- [ ] STEP 5 ⭐ — 페이지 하단에 충돌 카드 자동 등장, "당신은 어느 쪽?" 입력칸에 타이핑 → 새로고침 하면 날아감(예상)
- [ ] 콘솔 에러 없음, 네트워크 탭에서 `/api/critique`에 `ANTHROPIC_API_KEY`가 노출되지 않음 (헤더/바디에서 검색)

- [ ] **Step 4: 발견 이슈 기록 (있으면 별도 커밋으로 수정)**

각 이슈를 작은 커밋으로: `"Fix STEP X: <증상>"`. 없으면 패스.

- [ ] **Step 5: dev 서버 종료 (Ctrl+C)**

---

### Task D2: Vercel 배포 문서화 (`docs/DEPLOY.md`)

**Files:**
- Create: `docs/DEPLOY.md`

- [ ] **Step 1: 배포 노트 작성**

```markdown
# Vercel 배포 노트

## 사전
- Vercel 프로젝트 연결 (GitHub 저장소: `djvlwm602-collab/project06`)
- Node.js: 기본 (Vercel이 Next.js 자동 감지)

## 환경변수
Vercel 프로젝트 Settings → Environment Variables:

| 이름 | 값 | 노출 |
|---|---|---|
| `ANTHROPIC_API_KEY` | Anthropic Console 발급 키 | Server-only (절대 `NEXT_PUBLIC_*` 쓰지 말 것) |

## 배포
- `main` 브랜치 push → Production 자동 배포
- Preview 배포는 PR 생성 시 자동

## 수동 검증 (배포 후)
- `/api/critique`가 직접 GET 호출 시 "Method Not Allowed"/405 (POST 전용)
- 배포 URL에서 Network 탭으로 키가 클라이언트 번들에 포함 안 된 것 확인
- 실제 스크린샷으로 5 STEP 전 과정 시연 1회

## 롤백
- Vercel 대시보드 → Deployments → 이전 배포 "Promote to Production"
```

- [ ] **Step 2: 커밋**

```bash
git add docs/DEPLOY.md
git commit -m "Add DEPLOY.md — Vercel env var setup + post-deploy verification checklist"
```

---

### Task D3: Spec의 "구현 후 검토" 항목 티켓으로 박제

spec §4.6 "구현 후 검토 항목"은 구현 후 보면서 다듬기로 결정된 6개 항목. 다음 세션을 위해 체크리스트를 한곳에 박제한다.

**Files:**
- Create: `docs/post-build-review.md`

- [ ] **Step 1: 체크리스트 작성**

```markdown
# Post-build Review Checklist

구현 후 눈으로 보면서 결정하기로 한 항목 (spec §4.6).

- [ ] **단일/다중 이미지** — 1차 가안: 다중. 확인: 다중이 정말 필요한가, UX 부담 없는가
- [ ] **STEP 3 디폴트 인원** — 1차 가안: 6명 전체. 확인: 첫 경험 압박 vs 풀세트 효과
- [ ] **카드 그리드 (2열/3열)** — 1차 가안: 데스크톱 2열. 확인: 6장 한 화면 vs 스크롤
- [ ] **카드 등장 애니메이션** — 1차 가안: 스트리밍 도착순. 확인: 동시 등장 vs 순차
- [ ] **충돌 카드 인터랙션** — 1차 가안: 펼쳐진 채로. 확인: 접고 펴기 필요한가
- [ ] **STEP 5 입력칸 → 결과 화면** — 1차 가안: 클라이언트 휘발. 확인: 공유/저장 기능 (V2 후보)

각 항목은 실제 사용 1-2회 후 별도 세션에서 결정. 이 plan에서는 다루지 않는다.
```

- [ ] **Step 2: 커밋**

```bash
git add docs/post-build-review.md
git commit -m "Pin 6 post-build review items from spec §4.6 — revisit after live test"
```

---

### Task D4: 최종 빌드·타입체크·테스트 한 번 더

- [ ] **Step 1: 전체 파이프라인 실행**

```bash
npm run typecheck && npm test && npm run build
```
Expected: 모든 단계 통과.

- [ ] **Step 2: git 상태 깨끗 확인**

```bash
git status
```
Expected: `nothing to commit, working tree clean`.

- [ ] **Step 3: 로그 요약**

```bash
git log --oneline -30
```
Expected: Phase A → B → C → D 순서의 커밋 로그가 읽히는 단위로 정리되어 있음.

---

## 완료 기준 (Definition of Done)

- [ ] spec §2.1 6인 페르소나 데이터 + 테스트
- [ ] spec §3.1/§3.2 매트릭스 + 5쌍 테마 + lookup + 테스트
- [ ] spec §4.2 4개 맥락 질문
- [ ] spec §4.3 40/50/80자 가드레일 + 테스트
- [ ] spec §4.4 7원칙 + §4.5 톤 가이드가 system prompt에 박제 + 테스트
- [ ] `/api/critique` 서버 사이드 스트리밍 + API 키 클라이언트 노출 0 + 모킹 통합 테스트
- [ ] STEP 1~5 UI 전부 연결 (§4.6)
- [ ] ⭐ STEP 5 "당신은 어느 쪽?" 입력칸 + 회귀 방지 테스트
- [ ] 풀이 2 원칙: 회사 로고/색/폰트 사용 0 (중립 토큰만)
- [ ] `docs/legacy/`에 옛 자료 이전 완료
- [ ] README·package.json·tsconfig·index.html(Next.js가 흡수)·metadata.json(삭제) CRM 잔재 0
- [ ] `npm run typecheck && npm test && npm run build` 그린

---

## 자기 점검 (Self-Review)

**spec 커버리지 매핑:**

| spec 섹션 | 구현 위치 |
|---|---|
| §2.1 페르소나 6인 | Task B1·B2 (`lib/personas`) |
| §2.2 디스클레이머 | Task C2·C4·C8 (`components/app/Disclaimer.tsx`) |
| §3.1 6×6 매트릭스 | Task B3 (`lib/conflict/matrix.ts`) |
| §3.2 강한 충돌 5쌍 | Task B4 (`lib/conflict/themes.ts`) |
| §4.1 자동 트리거 | Task B5 (`activeConflictThemes`) + Task C12 result 렌더링 |
| §4.2 맥락 4질문 | Task B6 + Task C5 (`ContextForm`) |
| §4.3 출력 포맷 가드 | Task B7 (`guardrails`) + Task B8 system prompt |
| §4.4 디자인 7원칙 | Task B8 (`DESIGN_PRINCIPLES`) |
| §4.5 톤 가이드 | Task B8 (`TONE_GUIDE`) |
| §4.6 STEP 1~5 플로우 | Task C4, C6, C8, C12 |
| §4.6 STEP 5 "어느 쪽?" ⭐ | Task C10 (`ConflictCard` + 회귀 테스트) |
| §5.2 / §6.1 폴더 정리 | Task A1·A2 |
| §6.3 Next.js 마이그레이션 | Phase A 전체 |
| §6.3 API 키 보호 | Task B9 (`/api/critique` 서버 전용) |
| 풀이 2 (로고/색 금지) | Task A7 (중립 토큰만) + Disclaimer |

**타입 일관성:**
- `PersonaId`: B1 정의 → B2·B3·B4·B5·B8·B9·C* 전역 재사용
- `CritiqueCard`: B6 정의 → B7 검증 → C9 렌더
- `ConflictTheme`: B4 정의 → B5 lookup → C10·C12 소비
- `ContextAnswer`: B6 정의 → B9 API body → C5 폼

placeholder·TBD 없음 확인 완료.

---

## 실행 핸드오프

Plan complete and saved to `docs/plans/2026-04-17-design-critique-partner-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** — Fresh subagent per task + two-stage review (use `superpowers:subagent-driven-development`).

**2. Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints.

실행 시작할 준비 되면 어느 방식으로 갈지 알려주세요.
