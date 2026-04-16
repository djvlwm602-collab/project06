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
