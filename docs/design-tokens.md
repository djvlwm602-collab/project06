# Design Token Cheatsheet

신규 컴포넌트 작성 시 raw Tailwind 색상 (`text-gray-*`, `text-blue-*`, `bg-rose-*` 등) 대신 아래 **design token**을 사용한다. 기존 파일은 수정 작업 중 이 파일을 같이 열었을 때 함께 정리 (boy scout rule).

토큰 정의 원본: `src/index.css` `@theme` 블록

---

## 색상 매핑 규칙

### 텍스트
| Raw Tailwind | → | Design Token | 실제 색상 |
|---|---|---|---|
| `text-gray-900` | → | `text-text-primary` | `#191F28` |
| `text-gray-800` | → | `text-text-primary` | `#191F28` |
| `text-gray-700` | → | `text-text-secondary` | `#4E5968` |
| `text-gray-600` | → | `text-text-secondary` | `#4E5968` |
| `text-gray-500` | → | `text-text-secondary` (또는 `text-text-disabled`) | — |
| `text-gray-400` | → | `text-text-disabled` | `#AEB5BC` |
| `text-blue-700` (선택 행) | → | `text-primary` | `#3182F6` |
| `text-blue-500` | → | `text-primary` | `#3182F6` |
| `text-blue-400` (옅은 액션 아이콘) | → | `text-primary` + opacity 또는 유지 | — |
| `text-rose-600` / `text-red-*` | → | `text-danger` | `#FF5B5B` |

### 배경
| Raw Tailwind | → | Design Token | 실제 색상 |
|---|---|---|---|
| `bg-white` | → | `bg-surface` | `#FFFFFF` |
| `bg-gray-50` | → | `bg-bg` | `#F5F7FA` |
| `bg-gray-100` | → | `bg-bg` (또는 `bg-border`) | — |
| `bg-blue-50` | → | `bg-primary-subtle` | `#EBF3FF` |
| `bg-blue-100` | → | `bg-primary-subtle` | `#EBF3FF` |
| `bg-rose-50` | → | `bg-danger-subtle` | `#FFF0F0` |
| `bg-green-50` | → | `bg-success-subtle` | `#E8FAF5` |

### 보더
| Raw Tailwind | → | Design Token | 실제 색상 |
|---|---|---|---|
| `border-gray-200` | → | `border-border` | `#E8EBED` |
| `border-gray-300` | → | `border-border-strong` | `#CDD1D5` |
| `border-gray-100` | → | `border-border` | `#E8EBED` |

### 브랜드/시맨틱
| 용도 | Token |
|---|---|
| 주요 액션 / 링크 / 선택 상태 | `bg-primary` / `text-primary` / `border-primary` |
| 주요 액션 hover | `bg-primary-hover` (`#1B64DA`) |
| 보조 (민트) | `bg-secondary` (`#0ED1A0`) |
| 성공/긍정 | `bg-success` / `text-success` / `bg-success-subtle` |
| 위험/거절 | `bg-danger` / `text-danger` / `bg-danger-subtle` |

---

## 유지 대상 (의도적 예외 — 치환 금지)

| 값 | 용도 | 위치 |
|---|---|---|
| `#FAFBFC` | 테이블 홀수 행 줄무늬 | 모든 `DataTableBody` 등 |
| `#F3F4F6` | 테이블/행 hover 강조 (primary-subtle보다 중립) | 테이블 행 hover |
| `#FAFBFC` (이외 회색) | UI 레이아웃 세부 조정 시 한정 사용 |

위 값은 token으로 잘 매핑되지 않는 미세한 시각적 구분용 — 치환 X.

---

## 라운드(radius)

| Token | 값 | 사용처 |
|---|---|---|
| `rounded-sm` / `rounded` | 4px | 버튼·인풋·뱃지·셀렉트 등 소형 UI |
| `rounded-md` | 8px | 칸반 칼럼·태스크 카드·필터박스·통계바·사이드바 메뉴 |
| `rounded-lg` | 12px | KPI 카드·차트 컨테이너 |
| `rounded-xl` | 16px | 모달·대형 다이얼로그 |
| `rounded-full` | 9999px | 아바타·도트 |

---

## 폰트 굵기

현재 프로젝트는 **4단계 스케일**만 사용 (Pretendard):

| Weight | Tailwind | 용도 |
|---|---|---|
| 400 Normal | (default) | 일반 본문 |
| 500 Medium | `font-medium` | 라벨·칩·설명 |
| 600 SemiBold | `font-semibold` | 강조 값·제목·테이블 헤더·KPI |
| 700 Bold | — (사용 안 함) | — |

> `font-bold` (700)은 시각적으로 과해서 프로젝트에서 배제. 강조는 `font-semibold`(600)까지.

---

## 신규 작성 시 원칙

- **raw gray/blue/rose Tailwind 색상 금지** — 반드시 token 사용
- **hex 직접 사용 금지** — 단, 위 "유지 대상" 예외는 허용
- 2회 이상 반복되는 UI 블록은 `src/components/ui/`에 추출
- 추출 시 파일 헤더에 Role/Key Features/Dependencies 주석 필수
