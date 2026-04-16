/**
 * Role: Next.js 루트 레이아웃 — metadata + globals.css 로드
 * Key Features: 앱 전체 <html>/<body> 골격, 한국어 lang
 */
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '디자인 크리틱 파트너',
  description: '완성작 들고 와요. 6명이 봐줍니다.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
