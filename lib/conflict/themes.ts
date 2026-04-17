/**
 * Role: 강한 충돌 5쌍의 테마 + 프로덕트 프레이밍 (spec §3.2)
 * Key Features: STEP 5 충돌 카드 텍스트의 원천
 * Dependencies: @/lib/personas/types
 */
import type { PersonaId } from '@/lib/personas/types';

export type ConflictTheme = {
  pair: [PersonaId, PersonaId];
  theme: string;
  framing: string;
  stances: Record<PersonaId, string>;
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
