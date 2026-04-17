/**
 * Role: 크리틱 도메인 타입
 * Key Features: ContextAnswer, CritiqueCard, ContextQuestion
 */

export type WorkKind =
  | 'launched' | 'concept' | 'side' | 'student' | 'redesign' | 'other';

export type RoleKind = 'pd-solo' | 'pd-with-pm' | 'part-of-team' | 'other';

export type ContextAnswer = {
  workKind: WorkKind;
  coreProblem: string;
  role: RoleKind;
  proudDecision: string;
};

export type CritiqueCard = {
  personaId: string;
  diagnosis: string;
  questions: string[];
  suggestions: string[];
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
