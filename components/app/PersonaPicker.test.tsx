import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PersonaPicker } from './PersonaPicker';
import { useAppStore } from '@/lib/store';

beforeEach(() => useAppStore.getState().reset());

describe('PersonaPicker', () => {
  it('디폴트로 6명 전원 선택, 강한 충돌 5쌍 미리보기', () => {
    render(<PersonaPicker />);
    expect(screen.getByTestId('conflict-preview')).toHaveTextContent('5쌍');
  });

  it('토스 PO 체크 해제 시 충돌 쌍 수가 3쌍으로 줄어든다', async () => {
    render(<PersonaPicker />);
    const tossCheckbox = screen.getByLabelText('토스 스타일 PO');
    await userEvent.click(tossCheckbox);
    expect(screen.getByTestId('conflict-preview')).toHaveTextContent('3쌍');
  });

  it('모두 해제하면 "강한 충돌은 없어요" 문구', async () => {
    const { setSelectedPersonas } = useAppStore.getState();
    setSelectedPersonas([]);
    render(<PersonaPicker />);
    expect(screen.getByTestId('conflict-preview')).toHaveTextContent('없어요');
  });
});
