/**
 * Role: 조직 트리 사이드바 — 배정 고객 관리, DB 배정 관리 페이지 공통
 * Key Features: 재귀적 트리 아이템, 활성 항목 하이라이트
 */
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

interface SidebarTreeProps {
  title?: string;
  nodes: TreeNode[];
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function SidebarTree({
  title = '문정 사업단',
  nodes,
  activeId,
  onSelect,
  className,
}: SidebarTreeProps) {
  return (
    <div
      className={cn(
        'w-[180px] min-w-[180px] max-w-[180px] bg-bg flex flex-col shrink-0 overflow-y-auto',
        className,
      )}
    >
      <div className="px-4 pt-8 pb-3">
        <h2 className="text-[13px] font-semibold text-text-primary">{title}</h2>
      </div>
      <div className="p-2">
        {nodes.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            activeId={activeId}
            onSelect={onSelect}
            defaultExpanded
          />
        ))}
      </div>
    </div>
  );
}

interface TreeItemProps {
  node: TreeNode;
  activeId?: string;
  onSelect?: (id: string) => void;
  defaultExpanded?: boolean;
  depth?: number;
}

function TreeItem({
  node,
  activeId,
  onSelect,
  defaultExpanded = false,
  depth = 0,
}: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isActive = activeId === node.id;

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          'flex items-center gap-1.5 py-1.5 px-2 cursor-pointer rounded-sm text-[13px] transition-colors',
          isActive
            ? 'bg-[#F0F1F3] text-[#4B5563] font-medium'
            : 'text-text-primary hover:bg-bg',
          depth > 0 && 'pl-6',
        )}
        onClick={() => {
          if (hasChildren) setIsExpanded((v) => !v);
          onSelect?.(node.id);
        }}
      >
        <div className="w-4 h-4 flex items-center justify-center shrink-0">
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={14} className="text-text-secondary" />
            ) : (
              <ChevronRight size={14} className="text-text-secondary" />
            )
          ) : null}
        </div>
        <span className="truncate">{node.label}</span>
      </div>
      {hasChildren && isExpanded && (
        <div className="flex flex-col mt-0.5">
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              activeId={activeId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** 기본 조직 트리 데이터 (목 데이터 — API 연결 전까지 사용) */
export const defaultTreeNodes: TreeNode[] = [
  {
    id: 'branch-a',
    label: 'A 지점',
    children: [
      { id: 'team-a1', label: 'A 팀' },
      { id: 'team-a2', label: 'B 팀' },
      { id: 'team-a3', label: 'C 팀' },
    ],
  },
  {
    id: 'branch-b',
    label: 'B 지점',
    children: [
      { id: 'team-b1', label: '1 팀' },
      { id: 'team-b2', label: '2 팀' },
    ],
  },
];
