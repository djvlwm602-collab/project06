/**
 * Role: 조직 구조 설정 페이지 — 드래그 앤 드롭 트리 + 조직 정보 편집
 * Key Features: 조직 트리 시각화, 드래그 정렬, 조직 추가/수정/삭제
 * Dependencies: 공용 UI 컴포넌트(Button, PageHeader)
 */
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Footer } from './Footer';

interface OrgNode {
  id: string;
  name: string;
  isUsed: boolean;
  createdAt: string;
  updatedAt: string;
  children?: OrgNode[];
}

const initialData: OrgNode = {
  id: 'root',
  name: '흥국화재',
  isUsed: true,
  createdAt: '2026.01.01',
  updatedAt: '-',
  children: [
    {
      id: '1',
      name: '문정 사업단',
      isUsed: true,
      createdAt: '2026.01.01',
      updatedAt: '-',
      children: [
        {
          id: '1-1',
          name: 'A 지점',
          isUsed: true,
          createdAt: '2026.01.01',
          updatedAt: '-',
          children: [
            { id: '1-1-1', name: 'A 팀', isUsed: true, createdAt: '2026.01.12', updatedAt: '-' },
            { id: '1-1-2', name: 'B 팀', isUsed: true, createdAt: '2026.01.12', updatedAt: '-' },
            { id: '1-1-3', name: 'C 팀', isUsed: true, createdAt: '2026.01.12', updatedAt: '-' },
            { id: '1-1-4', name: '조직명 입력해 주세요.', isUsed: true, createdAt: '2026.01.12', updatedAt: '-' },
          ]
        },
        {
          id: '1-2',
          name: 'B 지점',
          isUsed: true,
          createdAt: '2026.01.01',
          updatedAt: '-',
          children: [
            { id: '1-2-1', name: '1 팀', isUsed: true, createdAt: '2026.01.12', updatedAt: '-' },
            { id: '1-2-2', name: '2 팀', isUsed: true, createdAt: '2026.01.12', updatedAt: '-' },
          ]
        }
      ]
    },
    {
      id: '2',
      name: '강남 사업단',
      isUsed: true,
      createdAt: '2026.01.01',
      updatedAt: '-',
      children: [
        { id: '2-1', name: 'A 팀', isUsed: true, createdAt: '2026.01.12', updatedAt: '-' },
        { id: '2-2', name: 'B 팀', isUsed: true, createdAt: '2026.01.12', updatedAt: '-' },
      ]
    },
    {
      id: '3',
      name: '서초 지점',
      isUsed: true,
      createdAt: '2026.01.01',
      updatedAt: '-',
      children: [
        { id: '3-1', name: 'A 팀', isUsed: true, createdAt: '2026.01.12', updatedAt: '-' },
        { id: '3-2', name: 'B 팀', isUsed: true, createdAt: '2026.01.12', updatedAt: '-' },
      ]
    },
    { id: '4', name: '선릉 1팀', isUsed: true, createdAt: '2026.01.01', updatedAt: '-' },
    { id: '5', name: '선릉 2팀', isUsed: false, createdAt: '2026.01.01', updatedAt: '-' },
  ]
};

const DragHandleIcon = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M2 4.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M2 9.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export function OrgStructureSettings() {
  const [orgData, setOrgData] = useState<OrgNode>(initialData);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('1-1-1');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root', '1', '1-1', '1-2']));

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editIsUsed, setEditIsUsed] = useState(true);

  const handleSave = () => {
    if (!selectedNodeId) return;
    setOrgData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const info = findNodeAndParent(newData, selectedNodeId);
      if (info) {
        info.node.name = editName;
        info.node.isUsed = editIsUsed;
        const today = new Date();
        info.node.updatedAt = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
      }
      return newData;
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!selectedNodeId || selectedNodeId === 'root') return;
    setOrgData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const info = findNodeAndParent(newData, selectedNodeId);
      if (info && info.parent && info.parent.children) {
        info.parent.children = info.parent.children.filter((c: OrgNode) => c.id !== selectedNodeId);
      }
      return newData;
    });
    setSelectedNodeId('root');
    setIsEditing(false);
  };

  const handleAddChild = (parentId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const newNodeId = `node-${Date.now()}`;
    const today = new Date();
    const dateString = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    const newNode: OrgNode = {
      id: newNodeId,
      name: '새 조직',
      isUsed: true,
      createdAt: dateString,
      updatedAt: '-',
      children: []
    };

    setOrgData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const info = findNodeAndParent(newData, parentId);
      if (info) {
        if (!info.node.children) {
          info.node.children = [];
        }
        info.node.children.push(newNode);
      }
      return newData;
    });

    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.add(parentId);
      return next;
    });

    setSelectedNodeId(newNodeId);
    setEditName('새 조직');
    setEditIsUsed(true);
    setIsEditing(true);
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const findNodeAndParent = (node: OrgNode, id: string, parent: OrgNode | null = null): { node: OrgNode, parent: OrgNode | null } | null => {
    if (node.id === id) return { node, parent };
    if (node.children) {
      for (const child of node.children) {
        const result = findNodeAndParent(child, id, node);
        if (result) return result;
      }
    }
    return null;
  };

  const isDescendant = (node: OrgNode, potentialDescendantId: string): boolean => {
    if (node.id === potentialDescendantId) return true;
    if (node.children) {
      return node.children.some(child => isDescendant(child, potentialDescendantId));
    }
    return false;
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    setOrgData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const sourceInfo = findNodeAndParent(newData, draggedId);
      const targetInfo = findNodeAndParent(newData, targetId);

      if (!sourceInfo || !targetInfo) return prevData;
      if (sourceInfo.node.id === 'root') return prevData;
      if (isDescendant(sourceInfo.node, targetId)) return prevData;

      // 기존 부모에서 제거
      if (sourceInfo.parent && sourceInfo.parent.children) {
        sourceInfo.parent.children = sourceInfo.parent.children.filter((c: OrgNode) => c.id !== draggedId);
      }

      // 대상 위치 앞에 삽입
      if (targetInfo.parent && targetInfo.parent.children) {
        const targetIndex = targetInfo.parent.children.findIndex((c: OrgNode) => c.id === targetId);
        targetInfo.parent.children.splice(targetIndex, 0, sourceInfo.node);
      } else if (targetInfo.node.id === 'root') {
        if (!targetInfo.node.children) targetInfo.node.children = [];
        targetInfo.node.children.push(sourceInfo.node);
      }

      return newData;
    });

    setDraggedId(null);
    setDragOverId(null);
  };

  const selectedNodeInfo = findNodeAndParent(orgData, selectedNodeId);
  const selectedNode = selectedNodeInfo ? selectedNodeInfo.node : null;

  const renderTree = (node: OrgNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const isDragging = draggedId === node.id;
    const isDragOver = dragOverId === node.id;

    return (
      <div key={node.id} className="flex flex-col">
        <div
          draggable={depth > 0}
          onDragStart={(e) => {
            e.stopPropagation();
            setDraggedId(node.id);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOverId(node.id);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDrop(node.id);
          }}
          onDragEnd={() => {
            setDraggedId(null);
            setDragOverId(null);
          }}
          className={cn(
            "flex items-center py-2 px-4 cursor-pointer transition-colors group relative",
            isSelected ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-900",
            isDragging && "opacity-40",
            isDragOver && "bg-blue-100/50 ring-1 ring-inset ring-blue-400"
          )}
          onClick={() => {
            setSelectedNodeId(node.id);
            setIsEditing(false);
          }}
        >
          <div
            className="flex items-center flex-1"
            style={{ paddingLeft: `${depth === 0 ? 0 : (depth - 1) * 24}px` }}
          >
            {depth > 0 && (
              <div className="flex items-center mr-2 cursor-grab active:cursor-grabbing">
                <DragHandleIcon className={cn("text-gray-400", isSelected && "text-blue-400")} />
              </div>
            )}
            <span className={cn("text-sm font-medium", depth === 0 && "font-semibold")}>
              {node.name}
            </span>
          </div>

          {depth > 0 && (
            <div className="w-24 text-center">
              <span className={cn("text-sm", isSelected ? "text-blue-600" : "text-gray-600")}>
                {node.isUsed ? '사용함' : '사용안함'}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 w-16 justify-end">
            {/* 트리 액션 아이콘 — 본문 텍스트보다 한 단계 옅은 색상으로 강조도 낮춤 */}
            <button
              className={cn(
                "p-1 rounded-sm hover:bg-gray-200/50",
                isSelected ? "text-blue-400 hover:bg-blue-100" : "text-gray-400 hover:text-gray-600"
              )}
              onClick={(e) => handleAddChild(node.id, e)}
            >
              <Plus size={16} />
            </button>
            {hasChildren ? (
              <button
                className={cn(
                  "p-1 rounded-sm hover:bg-gray-200/50",
                  isSelected ? "text-blue-400 hover:bg-blue-100" : "text-gray-400 hover:text-gray-600"
                )}
                onClick={(e) => toggleExpand(node.id, e)}
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            ) : (
              <div className="w-6" />
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="flex flex-col">
            {node.children!.map(child => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col pb-5">
        <div className="px-[30px] pt-8">
        <div className="w-full flex gap-10">

          {/* 좌측: 조직 구조 */}
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              조직 구조
            </h2>
            <div className="border border-gray-200 rounded-lg py-2 min-h-[500px] bg-white">
              {renderTree(orgData)}
            </div>
          </div>

          {/* 우측: 조직 정보 */}
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              조직 정보
            </h2>

            {selectedNode ? (
              <div className="flex flex-col">
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <div className="flex border-b border-gray-100">
                    <div className="w-[160px] bg-gray-50/50 px-6 py-4 text-sm font-semibold text-gray-900 border-r border-gray-100 flex items-center justify-center">
                      조직명
                    </div>
                    <div className="flex-1 px-6 py-4 text-sm text-gray-700 bg-white flex items-center">
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-64 px-3 py-1.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-gray-900 bg-white"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      ) : (
                        selectedNode.name
                      )}
                    </div>
                  </div>
                  <div className="flex border-b border-gray-100">
                    <div className="w-[160px] bg-gray-50/50 px-6 py-4 text-sm font-semibold text-gray-900 border-r border-gray-100 flex items-center justify-center">
                      사용 여부
                    </div>
                    <div className="flex-1 px-6 py-4 text-sm text-gray-700 bg-white flex items-center">
                      {isEditing ? (
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="orgIsUsed"
                              className="w-4 h-4 text-black focus:ring-black border-gray-300"
                              checked={editIsUsed === true}
                              onChange={() => setEditIsUsed(true)}
                            />
                            <span className="text-sm text-gray-900">사용함</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="orgIsUsed"
                              className="w-4 h-4 text-black focus:ring-black border-gray-300"
                              checked={editIsUsed === false}
                              onChange={() => setEditIsUsed(false)}
                            />
                            <span className="text-sm text-gray-900">사용안함</span>
                          </label>
                        </div>
                      ) : (
                        selectedNode.isUsed ? '사용함' : '사용안함'
                      )}
                    </div>
                  </div>
                  <div className="flex border-b border-gray-100">
                    <div className="w-[160px] bg-gray-50/50 px-6 py-4 text-sm font-semibold text-gray-900 border-r border-gray-100 flex items-center justify-center">
                      생성일
                    </div>
                    <div className="flex-1 px-6 py-4 text-sm text-gray-700 bg-white flex items-center">
                      {selectedNode.createdAt}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-[160px] bg-gray-50/50 px-6 py-4 text-sm font-semibold text-gray-900 border-r border-gray-100 flex items-center justify-center">
                      수정일
                    </div>
                    <div className="flex-1 px-6 py-4 text-sm text-gray-700 bg-white flex items-center">
                      {selectedNode.updatedAt}
                    </div>
                  </div>
                </div>

                <div className={cn("flex mt-6", isEditing ? "justify-between" : "justify-end")}>
                  {isEditing ? (
                    <>
                      <Button variant="danger" size="lg" onClick={handleDelete}>
                        삭제
                      </Button>
                      <Button variant="secondary" size="lg" onClick={handleSave}>
                        확인
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => {
                        setEditName(selectedNode.name);
                        setEditIsUsed(selectedNode.isUsed);
                        setIsEditing(true);
                      }}
                    >
                      수정
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 flex items-center justify-center h-[240px] text-sm text-gray-500 bg-gray-50">
                조직을 선택해주세요.
              </div>
            )}
          </div>

        </div>
        </div>
        <div className="flex-1 min-h-[50px]" />
        <Footer />
        </div>
      </div>
    </div>
  );
}
