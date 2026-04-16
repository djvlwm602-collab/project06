import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DropZone } from './DropZone';
import { useAppStore } from '@/lib/store';

// jsdom에 URL.createObjectURL, File.arrayBuffer 없음 — polyfill
beforeEach(() => {
  (globalThis.URL as any).createObjectURL = () => 'blob:mock';
  // File.prototype.arrayBuffer polyfill
  Object.defineProperty(File.prototype, 'arrayBuffer', {
    async value(this: File) {
      const content = 'mock-buffer';
      const buf = new ArrayBuffer(content.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < content.length; i++) view[i] = content.charCodeAt(i);
      return buf;
    },
    configurable: true,
  });
  useAppStore.getState().reset();
});

describe('DropZone', () => {
  it('파일 선택 시 store.images에 추가된다', async () => {
    render(<DropZone />);
    const file = new File(['hello'], 'a.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, file);
    // handleFiles는 async인데, 상태 업데이트가 지연될 수 있음
    await waitFor(() => {
      expect(useAppStore.getState().images.length).toBe(1);
    });
    expect(screen.getByText(/업로드됨: 1장/)).toBeInTheDocument();
  });
});
