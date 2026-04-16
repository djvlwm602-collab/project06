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
