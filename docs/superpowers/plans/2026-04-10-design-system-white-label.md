# Design System & White-Label Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Toss증권 스타일의 디자인 토큰 시스템을 구축하고, 브랜드 컬러 1~2개 변경만으로 전체 UI가 재브랜딩되는 화이트레이블 아키텍처와 재사용 가능한 컴포넌트 라이브러리를 구현한다.

**Architecture:** CSS Custom Properties(CSS 변수)를 단일 진실의 원천으로 사용하고, Tailwind v4의 `@theme` 지시어로 디자인 토큰을 클래스명에 연결한다. `src/config/brand.ts`에서 브랜드 값을 정의하면 App 진입점에서 CSS 변수로 주입되어 전체 UI에 반영된다. 페이지 컴포넌트는 공용 UI 컴포넌트(`src/components/ui/`)와 레이아웃 컴포넌트(`src/components/layout/`)를 조합해 구성한다.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4 (CSS-first config), Pretendard 폰트, lucide-react, recharts, clsx + tailwind-merge

---

## 파일 구조 설계

### 신규 생성 파일
```
src/
├── config/
│   └── brand.ts              # 화이트레이블 브랜드 설정 (색상, 이름, 로고)
├── styles/
│   └── tokens.css            # CSS Custom Properties 정의 (기본 토큰)
├── components/
│   ├── ui/
│   │   ├── button.tsx        # Button — variant(primary/secondary/ghost/danger)
│   │   ├── badge.tsx         # Badge — status/tag 표시
│   │   ├── input.tsx         # Input — 레이블 포함 래퍼
│   │   ├── select-field.tsx  # Select — 커스텀 화살표 포함
│   │   ├── kpi-card.tsx      # KpiCard — 수치+트렌드 카드
│   │   ├── data-table.tsx    # DataTable — thead/tbody 일관 스타일
│   │   └── pagination.tsx    # Pagination — 페이지 버튼 그룹
│   └── layout/
│       ├── page-header.tsx   # PageHeader — 제목+부제목 헤더 행
│       ├── filter-box.tsx    # FilterBox — 테두리 검색 필터 컨테이너
│       ├── sidebar-tree.tsx  # SidebarTree — 조직 트리 (공용)
│       └── page-layout.tsx   # PageLayout — 사이드트리 + 우측 콘텐츠 래퍼
```

### 수정 파일
```
src/index.css                 # @theme 토큰 + tokens.css import 추가
src/App.tsx                   # useBrand 훅으로 CSS 변수 주입
src/components/Sidebar.tsx    # 토큰 클래스로 교체
src/components/TopBar.tsx     # 토큰 클래스로 교체
src/components/Board.tsx      # 공용 컴포넌트 적용
src/components/ContractExpected.tsx
src/components/ConsultationEnded.tsx
src/components/AssignedDB.tsx
src/components/UnassignedDB.tsx
src/components/AdminManagement.tsx
src/components/PlannerManagement.tsx
src/components/RolePermissionSettings.tsx
src/components/OrgStructureSettings.tsx
src/components/ReassignTypeSettings.tsx
src/components/AutoRetrieveSettings.tsx
src/components/AutoAssignSettings.tsx
src/components/DBDistributionStatus.tsx
src/components/DBDistributionDetail.tsx
src/components/HomeDashboard.tsx
```

---

## Task 1: 디자인 토큰 + 브랜드 설정

**Files:**
- Create: `src/config/brand.ts`
- Create: `src/styles/tokens.css`
- Modify: `src/index.css`
- Modify: `src/App.tsx`

### 배경 지식
Tailwind v4는 `tailwind.config.js` 대신 `@theme` CSS 지시어로 테마를 확장한다.
`@theme` 안에 선언한 CSS 변수는 자동으로 `bg-primary`, `text-primary`, `border-primary` 같은 유틸리티 클래스로 변환된다.
단, `var(--something)` 참조를 `@theme` 안에 쓰면 Tailwind가 정적으로 해석할 수 없으므로, **실제 색상값을 `@theme`에 직접 쓰고**, 런타임 브랜드 교체는 JS로 `:root` 변수를 덮어쓰는 방식을 사용한다.

- [ ] **Step 1: 브랜드 타입 + 기본값 작성**

`src/config/brand.ts`를 생성한다:

```typescript
/**
 * Role: 화이트레이블 브랜드 설정 — 여기만 바꾸면 전체 UI 색상이 교체된다
 * Key Features: primary/secondary 컬러, 브랜드명, 로고
 * Notes: 컬러값은 HEX. applyBrand()가 CSS 변수로 주입한다.
 */

export interface Brand {
  /** 서비스 이름 (사이드바 상단 표시) */
  name: string;
  /** 보험사/제휴사 이름 (부제목) */
  partnerName: string;
  /** 로고 이니셜 (1자) */
  logoInitial: string;
  /** 포인트 컬러 1 — 버튼, 링크, 활성 항목 */
  primary: string;
  /** 포인트 컬러 1 Hover 상태 */
  primaryHover: string;
  /** 포인트 컬러 2 — 보조 강조, 뱃지 배경 */
  secondary: string;
  /** 서브 컬러 1 — 긍정 트렌드, 성공 상태 */
  success: string;
  /** 서브 컬러 2 — 부정 트렌드, 위험 상태 */
  danger: string;
}

/** 기본 브랜드: 보닥 플래너 (흥국화재) */
export const defaultBrand: Brand = {
  name: '보닥 플래너',
  partnerName: 'for 흥국화재',
  logoInitial: 'B',
  primary: '#3182F6',
  primaryHover: '#1B64DA',
  secondary: '#0ED1A0',
  success: '#00B493',
  danger: '#FF5B5B',
};

/**
 * 브랜드 설정을 CSS Custom Properties로 :root에 주입한다.
 * App.tsx 최상단에서 한 번 호출하면 전체 앱에 반영된다.
 */
export function applyBrand(brand: Brand = defaultBrand): void {
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', brand.primary);
  root.style.setProperty('--brand-primary-hover', brand.primaryHover);
  root.style.setProperty('--brand-secondary', brand.secondary);
  root.style.setProperty('--brand-success', brand.success);
  root.style.setProperty('--brand-danger', brand.danger);
  root.setAttribute('data-brand-name', brand.name);
  root.setAttribute('data-brand-partner', brand.partnerName);
  root.setAttribute('data-brand-initial', brand.logoInitial);
}
```

- [ ] **Step 2: CSS 토큰 파일 작성**

`src/styles/tokens.css`를 생성한다:

```css
/* ============================================================
   디자인 토큰 — 브랜드 독립적인 시맨틱 색상 정의
   브랜드 컬러는 applyBrand()가 :root에 주입한다.
   ============================================================ */

:root {
  /* ── 브랜드 컬러 기본값 (JS 미실행 환경 폴백) ── */
  --brand-primary: #3182F6;
  --brand-primary-hover: #1B64DA;
  --brand-secondary: #0ED1A0;
  --brand-success: #00B493;
  --brand-danger: #FF5B5B;

  /* ── 중립 팔레트 (브랜드 무관) ── */
  --color-bg: #F9FAFB;
  --color-surface: #FFFFFF;
  --color-border: #E8EBED;
  --color-border-strong: #CDD1D5;

  /* ── 텍스트 ── */
  --color-text-primary: #191F28;
  --color-text-secondary: #6B7684;
  --color-text-disabled: #AEB5BC;

  /* ── 상태 배경 (연한 틴트) ── */
  --color-primary-subtle: #EBF3FF;
  --color-success-subtle: #E8FAF5;
  --color-danger-subtle: #FFF0F0;

  /* ── 타이포그래피 ── */
  --font-size-xs: 11px;
  --font-size-sm: 13px;
  --font-size-base: 14px;
  --font-size-md: 16px;
  --font-size-lg: 19px;
  --font-size-xl: 22px;

  /* ── 간격 ── */
  --spacing-page-x: 24px;   /* 페이지 좌우 패딩 */
  --spacing-page-y: 20px;   /* 페이지 상하 패딩 */
  --spacing-section: 24px;  /* 섹션 간 간격 */

  /* ── 라운드 ── */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

- [ ] **Step 3: index.css에 토큰 + @theme 확장 추가**

`src/index.css`를 다음으로 교체한다:

```css
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css");
@import "tailwindcss";
@import "./styles/tokens.css";

@theme {
  /* 폰트 */
  --font-sans: "Pretendard", ui-sans-serif, system-ui, sans-serif;

  /* 브랜드 컬러 → Tailwind 유틸리티로 노출
     bg-primary, text-primary, border-primary 등으로 사용 */
  --color-primary: #3182F6;
  --color-primary-hover: #1B64DA;
  --color-secondary: #0ED1A0;
  --color-success: #00B493;
  --color-danger: #FF5B5B;

  /* 시맨틱 색상 */
  --color-bg: #F9FAFB;
  --color-surface: #FFFFFF;
  --color-border: #E8EBED;
  --color-border-strong: #CDD1D5;
  --color-text-primary: #191F28;
  --color-text-secondary: #6B7684;

  /* 틴트 */
  --color-primary-subtle: #EBF3FF;
  --color-success-subtle: #E8FAF5;
  --color-danger-subtle: #FFF0F0;
}

/* 기본 리셋 */
* {
  box-sizing: border-box;
}

body {
  color: var(--color-text-primary);
  background-color: var(--color-bg);
  font-family: "Pretendard", ui-sans-serif, system-ui, sans-serif;
  font-size: var(--font-size-base);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 4: App.tsx에서 applyBrand 호출**

`src/App.tsx` 상단의 import 블록 바로 아래, `App()` 함수 외부에 브랜드 적용 코드를 추가한다 (기존 로직 변경 없음):

```typescript
// 기존 import 아래에 추가
import { applyBrand, defaultBrand } from './config/brand';

// 앱 최초 진입 시 브랜드 CSS 변수 주입 (모듈 실행 시점)
applyBrand(defaultBrand);
```

- [ ] **Step 5: 빌드 확인**

```bash
cd /Users/yklee/Desktop/윤경\ 백업\ -\ 602/회사꺼/003
npm run lint
```

오류 없이 완료되어야 한다.

- [ ] **Step 6: 커밋**

```bash
git add src/config/brand.ts src/styles/tokens.css src/index.css src/App.tsx
git commit -m "feat: 디자인 토큰 시스템 + 화이트레이블 브랜드 설정 추가"
```

---

## Task 2: Button + Badge 공용 컴포넌트

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/badge.tsx`

### 배경 지식
`variant` prop으로 시각적 변형을 제어하고, `cn()` 으로 추가 className을 병합한다.
모든 컴포넌트는 `className?: string` prop을 받아 외부에서 확장 가능하다.

- [ ] **Step 1: Button 컴포넌트 작성**

`src/components/ui/button.tsx`를 생성한다:

```typescript
/**
 * Role: 재사용 가능한 버튼 — 검색/저장/삭제 등 모든 버튼의 기반
 * Key Features: primary, secondary, ghost, danger variant; size sm/md/lg
 */
import React from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover active:bg-primary-hover',
  secondary:
    'bg-text-primary text-white hover:bg-text-primary/85 active:bg-text-primary/75',
  ghost:
    'bg-transparent text-text-secondary border border-border hover:bg-bg active:bg-border',
  danger:
    'bg-danger text-white hover:bg-danger/85 active:bg-danger/75',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-1.5 text-[13px]',
  md: 'px-8 py-1.5 text-[14px]',
  lg: 'px-10 py-2.5 text-[14px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-sm transition-colors',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Badge 컴포넌트 작성**

`src/components/ui/badge.tsx`를 생성한다:

```typescript
/**
 * Role: 상태/태그 표시 뱃지 — 고객 태그, 승인 상태, 활동 상태 등
 * Key Features: default/primary/success/danger/warning variant
 */
import React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'primary' | 'success' | 'danger' | 'warning';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-bg text-text-secondary border border-border',
  primary:  'bg-primary-subtle text-primary',
  success:  'bg-success-subtle text-success',
  danger:   'bg-danger-subtle text-danger',
  warning:  'bg-amber-50 text-amber-700',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 3: TypeScript 확인**

```bash
npm run lint
```

오류 없이 완료되어야 한다.

- [ ] **Step 4: 커밋**

```bash
git add src/components/ui/button.tsx src/components/ui/badge.tsx
git commit -m "feat: Button, Badge 공용 컴포넌트 추가"
```

---

## Task 3: Input + SelectField 공용 컴포넌트

**Files:**
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/select-field.tsx`

- [ ] **Step 1: Input 컴포넌트 작성**

`src/components/ui/input.tsx`를 생성한다:

```typescript
/**
 * Role: 텍스트 입력 필드 — 필터 검색, 폼 입력 공통
 * Key Features: 레이블 옵션, prefix 아이콘 슬롯
 */
import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  prefixIcon?: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
}

export function Input({
  label,
  prefixIcon,
  className,
  wrapperClassName,
  ...props
}: InputProps) {
  return (
    <div className={cn('flex items-center gap-3', wrapperClassName)}>
      {label && (
        <span className="text-[14px] font-bold text-text-primary shrink-0">
          {label}
        </span>
      )}
      <div className="relative">
        {prefixIcon && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
            {prefixIcon}
          </span>
        )}
        <input
          {...props}
          className={cn(
            'border border-border rounded-sm text-[14px] text-text-primary bg-surface',
            'px-3 py-1.5 focus:outline-none focus:border-text-primary transition-colors',
            'placeholder:text-text-secondary',
            prefixIcon && 'pl-8',
            className,
          )}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: SelectField 컴포넌트 작성**

`src/components/ui/select-field.tsx`를 생성한다:

```typescript
/**
 * Role: 커스텀 화살표가 있는 select 래퍼 — 필터, 폼 셀렉트 공통
 * Key Features: 레이블 옵션, 너비 조절, 화살표 자동 포함
 */
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  width?: string;
  wrapperClassName?: string;
  children: React.ReactNode;
}

export function SelectField({
  label,
  width = 'w-48',
  wrapperClassName,
  children,
  className,
  ...props
}: SelectFieldProps) {
  return (
    <div className={cn('flex items-center gap-3', wrapperClassName)}>
      {label && (
        <span className="text-[14px] font-bold text-text-primary shrink-0">
          {label}
        </span>
      )}
      <div className={cn('relative', width)}>
        <select
          {...props}
          className={cn(
            'w-full appearance-none border border-border rounded-sm',
            'text-[14px] text-text-primary bg-surface',
            'pl-3 pr-8 py-1.5 focus:outline-none focus:border-text-primary',
            'cursor-pointer transition-colors',
            className,
          )}
        >
          {children}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: TypeScript 확인**

```bash
npm run lint
```

- [ ] **Step 4: 커밋**

```bash
git add src/components/ui/input.tsx src/components/ui/select-field.tsx
git commit -m "feat: Input, SelectField 공용 컴포넌트 추가"
```

---

## Task 4: KpiCard + DataTable + Pagination 컴포넌트

**Files:**
- Create: `src/components/ui/kpi-card.tsx`
- Create: `src/components/ui/data-table.tsx`
- Create: `src/components/ui/pagination.tsx`

- [ ] **Step 1: KpiCard 컴포넌트 작성**

`src/components/ui/kpi-card.tsx`를 생성한다:

```typescript
/**
 * Role: KPI 수치 카드 — 대시보드, 배정 완료 DB 등에서 공통 사용
 * Key Features: 제목, 수치, 트렌드(양/음) 표시
 */
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  trend?: string;
  isPositive?: boolean;
  className?: string;
}

export function KpiCard({ title, value, trend, isPositive, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-lg p-4 flex flex-col',
        className,
      )}
    >
      <span className="text-[13px] font-medium text-text-secondary mb-2">{title}</span>
      <div className="flex items-end justify-between">
        <span className="text-[22px] font-bold text-text-primary">{value}</span>
        {trend && (
          <div
            className={cn(
              'flex items-center text-[12px] font-medium px-1.5 py-0.5 rounded-md',
              isPositive
                ? 'text-success bg-success-subtle'
                : 'text-danger bg-danger-subtle',
            )}
          >
            {isPositive ? (
              <ArrowUpRight size={13} className="mr-0.5" />
            ) : (
              <ArrowDownRight size={13} className="mr-0.5" />
            )}
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: DataTable 컴포넌트 작성**

`src/components/ui/data-table.tsx`를 생성한다:

```typescript
/**
 * Role: 테이블 래퍼 — thead/tbody 스타일 일관화, 상단 border 스타일 옵션
 * Key Features: topBorder prop으로 굵은 상단선 / 일반 상단선 전환
 */
import React from 'react';
import { cn } from '../../lib/utils';

interface DataTableProps {
  children: React.ReactNode;
  /** true면 thead 위에 border-t-2 border-text-primary (어드민 테이블 스타일) */
  strongTopBorder?: boolean;
  className?: string;
}

export function DataTable({ children, strongTopBorder = false, className }: DataTableProps) {
  return (
    <div
      className={cn(
        strongTopBorder
          ? 'border-t-2 border-text-primary'
          : 'border-t border-border-strong',
        className,
      )}
    >
      <table className="w-full text-[14px] text-center">{children}</table>
    </div>
  );
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-bg sticky top-0 z-10 border-b border-border-strong">
      {children}
    </thead>
  );
}

export function DataTableHeadCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={cn('py-3.5 px-3 font-bold text-text-primary text-[13px]', className)}>
      {children}
    </th>
  );
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function DataTableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn('hover:bg-bg/60 transition-colors', className)}>{children}</tr>
  );
}

export function DataTableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn('py-3.5 px-3 text-text-primary', className)}>{children}</td>
  );
}
```

- [ ] **Step 3: Pagination 컴포넌트 작성**

`src/components/ui/pagination.tsx`를 생성한다:

```typescript
/**
 * Role: 페이지네이션 — 목록 페이지 하단 공통
 * Key Features: 현재 페이지 하이라이트, 앞/뒤/처음/끝 이동
 */
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage = 1,
  totalPages = 10,
  onPageChange,
  className,
}: PaginationProps) {
  const pages = Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1);

  return (
    <div className={cn('flex items-center justify-center gap-1 mt-6', className)}>
      <button
        onClick={() => onPageChange?.(1)}
        className="p-1 text-text-secondary hover:text-text-primary transition-colors"
        aria-label="처음 페이지"
      >
        <ChevronsLeft size={16} />
      </button>
      <button
        onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
        className="p-1 text-text-secondary hover:text-text-primary transition-colors mr-1"
        aria-label="이전 페이지"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((num) => (
        <button
          key={num}
          onClick={() => onPageChange?.(num)}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-sm text-[14px] transition-colors',
            num === currentPage
              ? 'bg-primary text-white font-bold'
              : 'text-text-secondary hover:text-text-primary font-medium',
          )}
        >
          {num}
        </button>
      ))}

      <button
        onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
        className="p-1 text-text-secondary hover:text-text-primary transition-colors ml-1"
        aria-label="다음 페이지"
      >
        <ChevronRight size={16} />
      </button>
      <button
        onClick={() => onPageChange?.(totalPages)}
        className="p-1 text-text-secondary hover:text-text-primary transition-colors"
        aria-label="마지막 페이지"
      >
        <ChevronsRight size={16} />
      </button>
    </div>
  );
}
```

- [ ] **Step 4: TypeScript 확인**

```bash
npm run lint
```

- [ ] **Step 5: 커밋**

```bash
git add src/components/ui/kpi-card.tsx src/components/ui/data-table.tsx src/components/ui/pagination.tsx
git commit -m "feat: KpiCard, DataTable, Pagination 공용 컴포넌트 추가"
```

---

## Task 5: 레이아웃 컴포넌트 (PageHeader, FilterBox, SidebarTree, PageLayout)

**Files:**
- Create: `src/components/layout/page-header.tsx`
- Create: `src/components/layout/filter-box.tsx`
- Create: `src/components/layout/sidebar-tree.tsx`
- Create: `src/components/layout/page-layout.tsx`

### 배경 지식
현재 모든 페이지가 동일한 `SidebarTree`(조직 트리)와 `PageHeader`를 인라인으로 복붙하고 있다.
공용 컴포넌트로 추출하면 추후 실제 API 데이터 연결 시 한 곳만 수정하면 된다.

- [ ] **Step 1: PageHeader 컴포넌트 작성**

`src/components/layout/page-header.tsx`를 생성한다:

```typescript
/**
 * Role: 페이지 상단 헤더 행 — 제목, 부제목, 우측 액션 영역 표준화
 * Key Features: title, subtitle, actions(우측 슬롯)
 */
import React from 'react';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'px-6 py-5 border-b border-border bg-surface',
        'flex items-center justify-between shrink-0',
        className,
      )}
    >
      <div className="flex items-end gap-4">
        <h1 className="text-[19px] font-bold text-text-primary tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <span className="text-[14px] text-text-secondary mb-0.5">{subtitle}</span>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
```

- [ ] **Step 2: FilterBox 컴포넌트 작성**

`src/components/layout/filter-box.tsx`를 생성한다:

```typescript
/**
 * Role: 검색/필터 영역 컨테이너 — 테두리 박스 + 내부 레이아웃
 * Key Features: rows prop으로 1행/다행 필터 지원
 */
import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { RotateCw } from 'lucide-react';

interface FilterBoxProps {
  children: React.ReactNode;
  onSearch?: () => void;
  onReset?: () => void;
  /** px-6 py-6 래퍼 없이 바로 사용하려면 true */
  noWrapper?: boolean;
  className?: string;
}

export function FilterBox({
  children,
  onSearch,
  onReset,
  noWrapper = false,
  className,
}: FilterBoxProps) {
  const inner = (
    <div
      className={cn(
        'border border-border bg-surface p-5 flex flex-col gap-4',
        className,
      )}
    >
      {children}
      {(onSearch || onReset) && (
        <div className="flex justify-end items-center gap-2">
          {onSearch && (
            <Button variant="primary" size="md" onClick={onSearch}>
              검색
            </Button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="p-1.5 text-text-secondary border border-border hover:bg-bg rounded-sm transition-colors flex items-center justify-center"
              aria-label="초기화"
            >
              <RotateCw size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (noWrapper) return inner;

  return <div className="px-6 py-6">{inner}</div>;
}

/** FilterBox 내부 1개 행 — 가로 flex 정렬 */
export function FilterRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-8 flex-wrap', className)}>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: SidebarTree 컴포넌트 작성**

`src/components/layout/sidebar-tree.tsx`를 생성한다:

```typescript
/**
 * Role: 조직 트리 사이드바 — 배정 고객 관리, DB 배정 관리 페이지 공통
 * Key Features: 재귀적 트리 아이템, 활성 항목 하이라이트
 */
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

interface SidebarTreeProps {
  title?: string;
  nodes: TreeNode[];
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function SidebarTree({
  title = '문정 사업단',
  nodes,
  activeId,
  onSelect,
  className,
}: SidebarTreeProps) {
  return (
    <div
      className={cn(
        'w-[180px] border-r border-border bg-bg/50 flex flex-col shrink-0 overflow-y-auto',
        className,
      )}
    >
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-[13px] font-semibold text-text-primary">{title}</h2>
      </div>
      <div className="p-2">
        {nodes.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            activeId={activeId}
            onSelect={onSelect}
            defaultExpanded
          />
        ))}
      </div>
    </div>
  );
}

interface TreeItemProps {
  node: TreeNode;
  activeId?: string;
  onSelect?: (id: string) => void;
  defaultExpanded?: boolean;
  depth?: number;
}

function TreeItem({
  node,
  activeId,
  onSelect,
  defaultExpanded = false,
  depth = 0,
}: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isActive = activeId === node.id;

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          'flex items-center gap-1.5 py-1.5 px-2 cursor-pointer rounded-sm text-[13px] transition-colors',
          isActive
            ? 'bg-primary-subtle text-primary font-medium'
            : 'text-text-primary hover:bg-bg',
          depth > 0 && 'pl-6',
        )}
        onClick={() => {
          if (hasChildren) setIsExpanded((v) => !v);
          onSelect?.(node.id);
        }}
      >
        <div className="w-4 h-4 flex items-center justify-center shrink-0">
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={14} className="text-text-secondary" />
            ) : (
              <ChevronRight size={14} className="text-text-secondary" />
            )
          ) : null}
        </div>
        <span className="truncate">{node.label}</span>
      </div>
      {hasChildren && isExpanded && (
        <div className="flex flex-col mt-0.5">
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              activeId={activeId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** 기본 조직 트리 데이터 (목 데이터 — API 연결 전까지 사용) */
export const defaultTreeNodes: TreeNode[] = [
  {
    id: 'branch-a',
    label: 'A 지점',
    children: [
      { id: 'team-a1', label: 'A 팀' },
      { id: 'team-a2', label: 'B 팀' },
      { id: 'team-a3', label: 'C 팀' },
    ],
  },
  {
    id: 'branch-b',
    label: 'B 지점',
    children: [
      { id: 'team-b1', label: '1 팀' },
      { id: 'team-b2', label: '2 팀' },
    ],
  },
];
```

- [ ] **Step 4: PageLayout 컴포넌트 작성**

`src/components/layout/page-layout.tsx`를 생성한다:

```typescript
/**
 * Role: 사이드바 트리 + 우측 콘텐츠 영역 래퍼 — 트리가 있는 모든 페이지 공통
 * Key Features: 사이드바 유무 선택, overflow 처리
 */
import React from 'react';
import { cn } from '../../lib/utils';
import { SidebarTree, TreeNode, defaultTreeNodes } from './sidebar-tree';

interface PageLayoutProps {
  children: React.ReactNode;
  /** false면 사이드바 없는 레이아웃 */
  showSidebar?: boolean;
  treeNodes?: TreeNode[];
  activeTreeId?: string;
  onTreeSelect?: (id: string) => void;
  sidebarTitle?: string;
  className?: string;
}

export function PageLayout({
  children,
  showSidebar = true,
  treeNodes = defaultTreeNodes,
  activeTreeId,
  onTreeSelect,
  sidebarTitle,
  className,
}: PageLayoutProps) {
  return (
    <div className={cn('flex flex-1 overflow-hidden', className)}>
      {showSidebar && (
        <SidebarTree
          title={sidebarTitle}
          nodes={treeNodes}
          activeId={activeTreeId}
          onSelect={onTreeSelect}
        />
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">{children}</div>
    </div>
  );
}
```

- [ ] **Step 5: TypeScript 확인**

```bash
npm run lint
```

- [ ] **Step 6: 커밋**

```bash
git add src/components/layout/
git commit -m "feat: PageHeader, FilterBox, SidebarTree, PageLayout 레이아웃 컴포넌트 추가"
```

---

## Task 6: Sidebar + TopBar 토큰 적용

**Files:**
- Modify: `src/components/Sidebar.tsx`
- Modify: `src/components/TopBar.tsx`

- [ ] **Step 1: Sidebar 브랜드 토큰 적용**

`src/components/Sidebar.tsx`에서 브랜드명/이니셜을 `data-brand-*` 어트리뷰트에서 읽도록 수정하고, 색상을 토큰 클래스로 교체한다.

`Sidebar` 함수 내 로고/브랜드명 JSX를 다음으로 교체한다 (나머지 로직 유지):

```typescript
// Sidebar.tsx 상단 import 아래에 추가
function getBrandAttr(attr: string, fallback: string): string {
  return document.documentElement.getAttribute(attr) ?? fallback;
}

// 로고 div 교체 (기존 'B', '보닥 플래너', 'for 흥국화재' 하드코딩 부분)
<div className="w-8 h-8 shrink-0 bg-primary rounded flex items-center justify-center text-white font-bold text-[13px]">
  {getBrandAttr('data-brand-initial', 'B')}
</div>
{!isCollapsed && (
  <div className="overflow-hidden whitespace-nowrap">
    <h2 className="font-semibold text-text-primary text-[13px]">
      {getBrandAttr('data-brand-name', '보닥 플래너')}
    </h2>
    <p className="text-[12px] text-text-secondary">
      {getBrandAttr('data-brand-partner', 'for 흥국화재')}
    </p>
  </div>
)}
```

활성 NavItem 색상을 토큰으로 교체한다:
```typescript
// NavItem의 active 클래스 교체
active
  ? "bg-primary-subtle text-primary"
  : "text-text-secondary hover:bg-bg hover:text-text-primary"

// SubNavItem의 active 클래스 교체
active
  ? "bg-primary-subtle text-primary font-medium"
  : "text-text-secondary hover:bg-bg hover:text-text-primary"
```

사이드바 배경/테두리 클래스 교체:
```typescript
// aside className
"flex flex-col bg-surface border-r border-border h-screen transition-all duration-300 ease-in-out shrink-0"
```

- [ ] **Step 2: TopBar 브랜드 토큰 적용**

`src/components/TopBar.tsx`를 다음으로 교체한다:

```typescript
/**
 * Role: 상단 글로벌 바 — 세션 타이머, 사용자 아바타
 */
import React from 'react';

interface TopBarProps {
  onCreateTask: () => void;
}

export function TopBar({ onCreateTask }: TopBarProps) {
  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-end px-6 sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-text-secondary text-[13px]">10:00</span>
          <button className="bg-bg hover:bg-border text-text-secondary text-[12px] px-2 py-1 rounded-sm transition-colors font-medium border border-border">
            연장
          </button>
        </div>
        <button className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[12px] hover:bg-primary-hover transition-colors">
          김
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: 빌드 확인**

```bash
npm run lint
```

- [ ] **Step 4: 커밋**

```bash
git add src/components/Sidebar.tsx src/components/TopBar.tsx
git commit -m "feat: Sidebar, TopBar 디자인 토큰 + 브랜드 연동 적용"
```

---

## Task 7: 고객 관리 페이지 리팩터링 (Board, ContractExpected, ConsultationEnded)

**Files:**
- Modify: `src/components/Board.tsx`
- Modify: `src/components/ContractExpected.tsx`
- Modify: `src/components/ConsultationEnded.tsx`

### 패턴
각 페이지에서 반복되는 인라인 패턴을 공용 컴포넌트로 교체한다.
Board.tsx는 칸반 레이아웃이므로 테이블은 없고, 나머지 둘은 DataTable + Pagination을 사용한다.

- [ ] **Step 1: Board.tsx 공용 컴포넌트 적용**

`src/components/Board.tsx`에서:
1. 인라인 `KpiCard` 함수 삭제 → `import { KpiCard } from './ui/kpi-card'`
2. 인라인 `TreeItem` 함수 삭제 → PageLayout + SidebarTree 사용
3. 헤더 → `PageHeader` 컴포넌트 사용
4. 필터 박스 → `FilterBox` + `FilterRow` 사용
5. 검색 버튼 → `Button` 컴포넌트 사용

Board.tsx 상단 import를 다음으로 교체:
```typescript
import React, { useState } from 'react';
import { BoardData } from '../types';
import { BoardColumn } from './BoardColumn';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { Footer } from './Footer';
import { KpiCard } from './ui/kpi-card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { SelectField } from './ui/select-field';
import { PageHeader } from './layout/page-header';
import { FilterBox, FilterRow } from './layout/filter-box';
import { PageLayout, defaultTreeNodes } from './layout';
```

> **주의:** `PageLayout`에서 `defaultTreeNodes` export가 필요하므로, `src/components/layout/index.ts`를 생성해 모든 레이아웃 컴포넌트를 re-export한다:
> ```typescript
> // src/components/layout/index.ts
> export { PageHeader } from './page-header';
> export { FilterBox, FilterRow } from './filter-box';
> export { SidebarTree, defaultTreeNodes } from './sidebar-tree';
> export type { TreeNode } from './sidebar-tree';
> export { PageLayout } from './page-layout';
> ```

Board 반환 JSX를 다음 구조로 교체한다 (칸반 열 렌더링 로직은 그대로 유지):
```tsx
return (
  <div className="flex-1 flex flex-col h-full bg-surface overflow-hidden">
    <PageHeader title="상담 진행 고객" subtitle="배정 된 고객의 상담을 관리할 수 있습니다." />
    <PageLayout showSidebar activeTreeId="team-a2">
      <div className="flex-1 overflow-y-auto bg-bg/30">
        <div className="flex flex-col min-h-full">
          {/* KPI 카드 */}
          <div className="px-6 py-4 shrink-0">
            <div className="grid grid-cols-5 gap-4">
              <KpiCard title="평균 리드 시간" value="30:24" trend="+2.4%" isPositive={false} />
              <KpiCard title="평균 통화 시도율" value="82%" trend="+5.1%" isPositive={true} />
              <KpiCard title="평균 통화 성공율" value="45%" trend="-1.2%" isPositive={false} />
              <KpiCard title="평균 유효 통화율" value="28%" trend="+3.4%" isPositive={true} />
              <KpiCard title="평균 통화 시간" value="12분" trend="+0.5%" isPositive={true} />
            </div>
          </div>

          {/* 필터 */}
          <FilterBox onSearch={() => {}} onReset={() => {
            setSelectedRegions(['전체']);
            setDateRangeType('1개월');
          }}>
            <FilterRow>
              <SelectField label="담당설계사" width="w-48">
                <option>전체</option>
              </SelectField>
              <Input label="고객명" className="w-48" />
            </FilterRow>
            <FilterRow>
              <span className="text-[14px] font-bold text-text-primary">기간</span>
              <div className="flex items-center gap-1">
                {['1개월', '3개월', '6개월'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setDateRangeType(type)}
                    className={cn(
                      'px-3 py-1.5 text-[13px] rounded-sm border transition-colors',
                      dateRangeType === type
                        ? 'bg-text-primary text-white border-text-primary'
                        : 'bg-surface text-text-secondary border-border hover:bg-bg',
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <input type="date" className="w-32 px-3 py-1.5 border border-border rounded-sm text-[13px] focus:outline-none focus:border-text-primary" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <span className="text-text-secondary">~</span>
              <input type="date" className="w-32 px-3 py-1.5 border border-border rounded-sm text-[13px] focus:outline-none focus:border-text-primary" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </FilterRow>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {regions.map((region) => (
                <label key={region} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-primary" checked={selectedRegions.includes(region)} onChange={() => toggleRegion(region)} />
                  <span className="text-[13px] text-text-primary">{region}</span>
                </label>
              ))}
            </div>
          </FilterBox>

          {/* 칸반 보드 — 기존 열 렌더링 코드 유지 */}
          <div className="flex-1 overflow-x-auto px-6 pb-6 bg-surface">
            {/* ... 기존 그대로 ... */}
          </div>
        </div>
        <Footer />
      </div>
    </PageLayout>
  </div>
);
```

- [ ] **Step 2: ContractExpected.tsx 공용 컴포넌트 적용**

`src/components/ContractExpected.tsx`의 인라인 TreeItem 삭제, 공용 컴포넌트 적용:

```typescript
// import 교체
import React, { useState } from 'react';
import { ChevronLeft, ChevronsLeft, ChevronsRight, ChevronRight } from 'lucide-react';
import { Footer } from './Footer';
import { PageHeader } from './layout/page-header';
import { FilterBox, FilterRow } from './layout/filter-box';
import { PageLayout } from './layout/page-layout';
import { SelectField } from './ui/select-field';
import { Input } from './ui/input';
import {
  DataTable, DataTableHead, DataTableHeadCell,
  DataTableBody, DataTableRow, DataTableCell,
} from './ui/data-table';
import { Pagination } from './ui/pagination';
```

JSX 구조:
```tsx
return (
  <div className="flex-1 flex flex-col h-full bg-surface overflow-hidden">
    <PageHeader title="계약 예정 고객" subtitle="계약 진행을 약속한 고객을 관리할 수 있습니다." />
    <PageLayout showSidebar activeTreeId="team-a2">
      <div className="flex-1 flex flex-col overflow-hidden bg-surface">
        <FilterBox onSearch={() => {}} onReset={() => { setCustomerName(''); setSelectedAgent('전체'); }}>
          <FilterRow>
            <SelectField label="담당설계사" width="w-48" value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
              <option value="전체">전체</option>
              <option value="홍길동">홍길동</option>
              <option value="김철수">김철수</option>
            </SelectField>
            <Input label="고객명" className="w-48" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </FilterRow>
        </FilterBox>

        <div className="flex flex-col flex-1 min-h-0 px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] text-text-primary">총 <strong>10</strong>개</p>
            <SelectField width="w-24">
              <option value="10">10개</option>
              <option value="20">20개</option>
              <option value="50">50개</option>
            </SelectField>
          </div>
          <div className="flex-1 overflow-auto">
            <DataTable>
              <DataTableHead>
                <tr>
                  <DataTableHeadCell className="w-16">No.</DataTableHeadCell>
                  <DataTableHeadCell className="w-24">이름</DataTableHeadCell>
                  <DataTableHeadCell className="w-20">성별</DataTableHeadCell>
                  <DataTableHeadCell className="w-40">생년월일</DataTableHeadCell>
                  <DataTableHeadCell className="w-40">연락처</DataTableHeadCell>
                  <DataTableHeadCell>지역</DataTableHeadCell>
                  <DataTableHeadCell className="w-48">계약 예정 상태 전환일</DataTableHeadCell>
                </tr>
              </DataTableHead>
              <DataTableBody>
                {mockData.map((row) => (
                  <DataTableRow key={row.no}>
                    <DataTableCell>{row.no}</DataTableCell>
                    <DataTableCell className="text-primary cursor-pointer hover:underline">{row.name}</DataTableCell>
                    <DataTableCell>{row.gender}</DataTableCell>
                    <DataTableCell>{row.birthDate} ({row.age}세)</DataTableCell>
                    <DataTableCell>{row.phone}</DataTableCell>
                    <DataTableCell>{row.location}</DataTableCell>
                    <DataTableCell>{row.expectedDate}</DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          </div>
          <Pagination />
          <Footer />
        </div>
      </div>
    </PageLayout>
  </div>
);
```

- [ ] **Step 3: ConsultationEnded.tsx 동일 패턴 적용**

ContractExpected와 동일한 방식으로 공용 컴포넌트를 적용한다. 사유(reason) 필터 SelectField를 추가한다:

```typescript
// import 교체 (ContractExpected와 동일)

// JSX — FilterBox 내 FilterRow에 사유 필터 추가
<FilterRow>
  <SelectField label="담당설계사" width="w-48" value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
    <option value="전체">전체</option>
    <option value="홍길동">홍길동</option>
  </SelectField>
  <Input label="고객명" className="w-48" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
  <SelectField label="사유" width="w-48" value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)}>
    <option value="전체">전체</option>
    <option value="상담 거절">상담 거절</option>
    <option value="계약 완료">계약 완료</option>
  </SelectField>
</FilterRow>

// DataTable — 사유 열 추가
<DataTableHeadCell className="w-32">사유</DataTableHeadCell>
// ...
<DataTableCell>{row.reason}</DataTableCell>
```

- [ ] **Step 4: TypeScript 확인**

```bash
npm run lint
```

- [ ] **Step 5: 커밋**

```bash
git add src/components/Board.tsx src/components/ContractExpected.tsx src/components/ConsultationEnded.tsx src/components/layout/index.ts
git commit -m "feat: 고객 관리 페이지 공용 컴포넌트 적용"
```

---

## Task 8: DB 배정 관리 페이지 리팩터링 (AssignedDB, UnassignedDB)

**Files:**
- Modify: `src/components/AssignedDB.tsx`
- Modify: `src/components/UnassignedDB.tsx`

- [ ] **Step 1: AssignedDB.tsx 공용 컴포넌트 적용**

import 교체:
```typescript
import React, { useState } from 'react';
import { Footer } from './Footer';
import { PageHeader } from './layout/page-header';
import { FilterBox, FilterRow } from './layout/filter-box';
import { PageLayout } from './layout/page-layout';
import { SelectField } from './ui/select-field';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { KpiCard } from './ui/kpi-card';
import {
  DataTable, DataTableHead, DataTableHeadCell,
  DataTableBody, DataTableRow, DataTableCell,
} from './ui/data-table';
import { Pagination } from './ui/pagination';
```

인라인 KpiCard 함수 삭제, 인라인 TreeItem 함수 삭제.

JSX 구조:
```tsx
return (
  <div className="flex-1 flex flex-col h-full bg-surface overflow-hidden">
    <PageHeader title="배정 완료 DB" subtitle="배정된 DB를 다른 설계사에게 재배정 할 수 있습니다." />
    <PageLayout showSidebar activeTreeId="team-a2">
      <div className="flex-1 flex flex-col overflow-y-auto bg-surface">
        {/* 필터 */}
        <FilterBox onSearch={() => {}} onReset={() => { setCustomerName(''); setSelectedAgent('홍길동'); setNoValidCall(false); setNoCallAttempt(false); setSelectedRegions(['전체']); }}>
          <FilterRow>
            <SelectField label="담당설계사" width="w-48" value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
              <option value="홍길동">홍길동</option>
              <option value="김철수">김철수</option>
            </SelectField>
            <Input label="고객명" className="w-48" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <label className="flex items-center gap-2 cursor-pointer ml-4">
              <input type="checkbox" className="w-4 h-4 accent-primary" checked={noValidCall} onChange={(e) => setNoValidCall(e.target.checked)} />
              <span className="text-[13px] font-medium text-text-primary">유효통화 없음</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-primary" checked={noCallAttempt} onChange={(e) => setNoCallAttempt(e.target.checked)} />
              <span className="text-[13px] font-medium text-text-primary">통화 미시도</span>
            </label>
          </FilterRow>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {regions.map((region) => (
              <label key={region} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary" checked={selectedRegions.includes(region)} onChange={() => toggleRegion(region)} />
                <span className="text-[13px] text-text-primary">{region}</span>
              </label>
            ))}
          </div>
        </FilterBox>

        {/* KPI */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-5 gap-4">
            <KpiCard title="총 배정 DB" value="33건" trend="+12%" isPositive={true} />
            <KpiCard title="통화 시도" value="30건" trend="+5%" isPositive={true} />
            <KpiCard title="통화 미시도" value="3건" trend="-2%" isPositive={true} />
            <KpiCard title="평균 성공율" value="25.8%" trend="+1.4%" isPositive={true} />
            <KpiCard title="평균 유효통화율" value="40.5%" trend="-0.5%" isPositive={false} />
          </div>
        </div>

        {/* 테이블 */}
        <div className="flex flex-col px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] text-text-primary">총 <strong>10</strong>개</p>
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm">선택 재배정</Button>
              <SelectField width="w-24">
                <option value="10">10개</option>
                <option value="20">20개</option>
              </SelectField>
            </div>
          </div>
          <DataTable strongTopBorder>
            <DataTableHead>
              <tr>
                <DataTableHeadCell className="w-12">
                  <input type="checkbox" className="w-4 h-4 accent-primary" checked={selectAll} onChange={handleSelectAll} />
                </DataTableHeadCell>
                <DataTableHeadCell className="w-12">No.</DataTableHeadCell>
                <DataTableHeadCell>이름</DataTableHeadCell>
                <DataTableHeadCell>성별</DataTableHeadCell>
                <DataTableHeadCell>생년월일</DataTableHeadCell>
                <DataTableHeadCell>연락처</DataTableHeadCell>
                <DataTableHeadCell>지역</DataTableHeadCell>
                <DataTableHeadCell>배정시간</DataTableHeadCell>
                <DataTableHeadCell>최초통화</DataTableHeadCell>
                <DataTableHeadCell>최근통화</DataTableHeadCell>
                <DataTableHeadCell>통화시도</DataTableHeadCell>
                <DataTableHeadCell>통화성공</DataTableHeadCell>
                <DataTableHeadCell>유효통화</DataTableHeadCell>
                <DataTableHeadCell>담당 설계사</DataTableHeadCell>
                <DataTableHeadCell>배정이력</DataTableHeadCell>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {mockData.map((row) => (
                <DataTableRow key={row.id}>
                  <DataTableCell>
                    <input type="checkbox" className="w-4 h-4 accent-primary" checked={selectedRows.includes(row.id)} onChange={() => toggleRow(row.id)} />
                  </DataTableCell>
                  <DataTableCell>{row.no}</DataTableCell>
                  <DataTableCell className="text-primary cursor-pointer hover:underline">{row.name}</DataTableCell>
                  <DataTableCell>{row.gender}</DataTableCell>
                  <DataTableCell>{row.birthDate}<br /><span className="text-[12px] text-text-secondary">({row.age}세)</span></DataTableCell>
                  <DataTableCell>{row.phone}</DataTableCell>
                  <DataTableCell>{row.location}</DataTableCell>
                  <DataTableCell>{row.assignedDate.replace(' ', '\n')}</DataTableCell>
                  <DataTableCell>{row.firstCallDate !== '-' ? row.firstCallDate.replace(' ', '\n') : '-'}</DataTableCell>
                  <DataTableCell>{row.recentCallDate !== '-' ? row.recentCallDate.replace(' ', '\n') : '-'}</DataTableCell>
                  <DataTableCell>{row.callAttempts}</DataTableCell>
                  <DataTableCell>{row.callSuccess}</DataTableCell>
                  <DataTableCell>{row.validCall}</DataTableCell>
                  <DataTableCell>{row.agentName}</DataTableCell>
                  <DataTableCell className="text-primary cursor-pointer hover:underline">확인</DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
          <Pagination />
          <Footer />
        </div>
      </div>
    </PageLayout>
  </div>
);
```

- [ ] **Step 2: UnassignedDB.tsx 동일 패턴 적용**

AssignedDB와 동일한 방식으로 공용 컴포넌트를 적용한다. KPI 없음, 고객명 필터만 있음.

- [ ] **Step 3: TypeScript 확인**

```bash
npm run lint
```

- [ ] **Step 4: 커밋**

```bash
git add src/components/AssignedDB.tsx src/components/UnassignedDB.tsx
git commit -m "feat: DB 배정 관리 페이지 공용 컴포넌트 적용"
```

---

## Task 9: 직원/설계사 관리 + 설정 페이지 리팩터링

**Files:**
- Modify: `src/components/AdminManagement.tsx`
- Modify: `src/components/PlannerManagement.tsx`
- Modify: `src/components/RolePermissionSettings.tsx`
- Modify: `src/components/OrgStructureSettings.tsx`
- Modify: `src/components/ReassignTypeSettings.tsx`
- Modify: `src/components/AutoRetrieveSettings.tsx`
- Modify: `src/components/AutoAssignSettings.tsx`

### 패턴
설정 페이지는 사이드바 트리 없음(`showSidebar={false}`).
저장/추가 버튼은 `Button variant="secondary"` (검정 계열) 적용.
검색 필터 있는 페이지는 FilterBox 사용, 없는 페이지는 PageHeader만 사용.

- [ ] **Step 1: AdminManagement.tsx 공용 컴포넌트 적용**

```typescript
// 변경 패턴 — AdminManagement (직원관리)
// 1. 인라인 TreeItem 유지 → 사이드바 트리 있음 (조직 기준 필터링이 아닌 소속 표시)
// 2. PageHeader 적용
// 3. FilterBox 적용 (검색 조건 행)
// 4. DataTable + strongTopBorder 적용
// 5. 승인 상태 → Badge 컴포넌트 적용
// 6. 저장/승인 버튼 → Button variant="secondary" 적용

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { PageHeader } from './layout/page-header';
import { FilterBox, FilterRow } from './layout/filter-box';
import { PageLayout } from './layout/page-layout';
import { SelectField } from './ui/select-field';
import { Input } from './ui/input';
import { DataTable, DataTableHead, DataTableHeadCell, DataTableBody, DataTableRow, DataTableCell } from './ui/data-table';
import { Pagination } from './ui/pagination';

// 승인 상태 Badge 매핑
function ApprovalBadge({ status }: { status: 'approved' | 'pending' | 'rejected' }) {
  const map = {
    approved: { variant: 'success' as const, label: '승인' },
    pending:  { variant: 'warning' as const, label: '대기' },
    rejected: { variant: 'danger' as const, label: '거절' },
  };
  return <Badge variant={map[status].variant}>{map[status].label}</Badge>;
}
```

- [ ] **Step 2: PlannerManagement.tsx 동일 패턴 적용**

AdminManagement와 동일 방식. 설계사 테이블 열 구조만 다름.

- [ ] **Step 3: 설정 페이지 PageHeader 적용 (RolePermissionSettings, OrgStructureSettings, ReassignTypeSettings, AutoRetrieveSettings, AutoAssignSettings)**

각 파일에서:
```typescript
// import 추가
import { PageHeader } from './layout/page-header';
import { Button } from './ui/button';

// PageHeader로 헤더 교체 (이미 Task 0에서 구조 통일 완료)
<PageHeader title="직책·권한 설정" subtitle="조직을 담당하는 직책 및 메뉴 권한을 부여합니다." />

// 저장 버튼 Button 컴포넌트로 교체
<Button variant="secondary" size="lg">저장</Button>

// 추가 버튼
<Button variant="secondary" size="sm">직책 추가</Button>
```

- [ ] **Step 4: TypeScript 확인**

```bash
npm run lint
```

- [ ] **Step 5: 커밋**

```bash
git add src/components/AdminManagement.tsx src/components/PlannerManagement.tsx \
        src/components/RolePermissionSettings.tsx src/components/OrgStructureSettings.tsx \
        src/components/ReassignTypeSettings.tsx src/components/AutoRetrieveSettings.tsx \
        src/components/AutoAssignSettings.tsx
git commit -m "feat: 직원 관리 + 설정 페이지 공용 컴포넌트 적용"
```

---

## Task 10: 최종 확인 + 화이트레이블 테스트

**Files:**
- No new files

### 화이트레이블 교체 검증
`src/config/brand.ts`의 `defaultBrand` 값만 바꿔서 전체 앱 색상이 교체되는지 확인한다.

- [ ] **Step 1: 대체 브랜드로 테스트**

`src/config/brand.ts`에서 임시로 다른 브랜드를 `applyBrand()` 호출 부분에 적용:

```typescript
// App.tsx 상단 — 테스트 후 원복
applyBrand({
  name: '테스트 플래너',
  partnerName: 'for 삼성생명',
  logoInitial: 'S',
  primary: '#0070F3',      // 파란계열 포인트1
  primaryHover: '#005AC1',
  secondary: '#7C3AED',    // 보라계열 포인트2
  success: '#059669',
  danger: '#DC2626',
});
```

브라우저에서 `http://localhost:3000` 접속 후 다음을 확인:
- [ ] 사이드바 로고가 'S'로 표시됨
- [ ] 사이드바 브랜드명이 '테스트 플래너', 'for 삼성생명'으로 표시됨
- [ ] 버튼, 활성 메뉴, 페이지네이션 활성 페이지가 `#0070F3` 색상으로 표시됨
- [ ] 긍정 트렌드가 `#059669` 색상으로 표시됨

- [ ] **Step 2: 원래 브랜드로 원복 + 빌드 검증**

```typescript
// App.tsx — 원복
applyBrand(defaultBrand);
```

```bash
npm run build
```

빌드 오류 없이 완료되어야 한다.

- [ ] **Step 3: 최종 커밋**

```bash
git add -A
git commit -m "feat: 디자인 시스템 + 화이트레이블 아키텍처 구현 완료"
```

---

## 스펙 커버리지 자기 검토

| 요구사항 | 구현 위치 |
|---|---|
| 포인트 컬러 1~2개 변경 → 전체 UI 교체 | Task 1 `brand.ts` `applyBrand()`, Task 6 Sidebar/TopBar |
| 서브 컬러 1~2개 지원 | Task 1 `brand.ts` `success` / `danger` |
| 컴포넌트 확장성 — variant/size prop | Task 2 Button, Task 2 Badge, Task 3 Input/SelectField |
| 재사용 레이아웃 컴포넌트 | Task 5 PageLayout, PageHeader, FilterBox, SidebarTree |
| 토스증권 스타일 디자인 | Task 1 색상 팔레트(#3182F6, #191F28, #F9FAFB), Task 4 KpiCard 라운드 카드 |
| 모든 페이지 일관 적용 | Task 7~9 |
| 화이트레이블 검증 | Task 10 |
