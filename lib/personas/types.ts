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
