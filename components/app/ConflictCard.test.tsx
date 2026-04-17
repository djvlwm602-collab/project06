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
