/**
 * Role: 사이드바 트리 + 우측 콘텐츠 영역 래퍼 — 트리가 있는 모든 페이지 공통
 * Key Features: 사이드바 유무 선택, overflow 처리
 */
import React from 'react';
import { cn } from '../../lib/utils';
import { SidebarTree, TreeNode, defaultTreeNodes } from './sidebar-tree';

interface PageLayoutProps {
  children: React.ReactNode;
  /** false면 사이드바 없는 레이아웃 */
  showSidebar?: boolean;
  treeNodes?: TreeNode[];
  activeTreeId?: string;
  onTreeSelect?: (id: string) => void;
  sidebarTitle?: string;
  className?: string;
}

export function PageLayout({
  children,
  showSidebar = true,
  treeNodes = defaultTreeNodes,
  activeTreeId,
  onTreeSelect,
  sidebarTitle,
  className,
}: PageLayoutProps) {
  return (
    <div className={cn('flex flex-1 overflow-hidden', className)}>
      {showSidebar && (
        <SidebarTree
          title={sidebarTitle}
          nodes={treeNodes}
          activeId={activeTreeId}
          onSelect={onTreeSelect}
        />
      )}
      <div className="flex-1 flex flex-col min-w-[640px] overflow-hidden">{children}</div>
    </div>
  );
}
