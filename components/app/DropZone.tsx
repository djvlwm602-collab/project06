/**
 * Role: 스크린샷 드래그앤드롭 업로드 (STEP 1) — 다중 업로드 허용 (§4.6)
 * Key Features: drop/click-to-select, base64 인코딩, object URL 미리보기
 * Dependencies: @/lib/store
 */
'use client';

import * as React from 'react';
import { useAppStore, type UploadedImage } from '@/lib/store';

const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

async function fileToUploaded(file: File): Promise<UploadedImage> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  const base64 = btoa(bin);
  return {
    mediaType: file.type as UploadedImage['mediaType'],
    base64,
    previewUrl: URL.createObjectURL(file),
  };
}

export function DropZone() {
  const images = useAppStore((s) => s.images);
  const setImages = useAppStore((s) => s.setImages);
  const [isDragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList).filter((f) => ACCEPT.includes(f.type));
    const uploaded = await Promise.all(files.map(fileToUploaded));
    setImages([...images, ...uploaded]);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="스크린샷 업로드 영역"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void handleFiles(e.dataTransfer.files);
      }}
      className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed p-8 text-center transition-colors ${
        isDragging ? 'border-[var(--color-accent)] bg-[var(--color-subtle)]' : 'border-[var(--color-border-strong)]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(',')}
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <p className="text-sm text-[var(--color-text-secondary)]">
        스크린샷을 여기에 드래그하거나 클릭해서 선택하세요 (여러 장 가능)
      </p>
      {images.length > 0 && (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          업로드됨: {images.length}장
        </p>
      )}
    </div>
  );
}
