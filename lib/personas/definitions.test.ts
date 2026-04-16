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

  it('당근 PD 대표 질문은 읽힘/엄마 관련', () => {
    expect(PERSONAS['daangn-pd'].representativeQuestion).toMatch(/읽|엄마/);
  });
});
