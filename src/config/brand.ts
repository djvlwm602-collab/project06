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
