/**
 * Role: 재배정 타입 설정 페이지 — 커스텀 재배정 타입 CRUD
 * Key Features: 타입 목록 표시, 수정 모드 전환, 타입 추가/삭제
 * Dependencies: 공용 UI 컴포넌트(Button, PageHeader)
 */
import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Footer } from './Footer';

interface ReassignType {
  id: string;
  name: string;
  description: string;
  isUsed: boolean;
}

const initialTypes: ReassignType[] = [
  { id: '1', name: '반환', description: '입력한 설명이 노출됩니다.', isUsed: true },
  { id: '2', name: '무상', description: '입력한 설명이 노출됩니다.', isUsed: true },
  { id: '3', name: '양도', description: '입력한 설명이 노출됩니다.', isUsed: true },
  { id: '4', name: '패널티', description: '입력한 설명이 노출됩니다.', isUsed: false },
];

export function ReassignTypeSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const [types, setTypes] = useState<ReassignType[]>(initialTypes);
  const [editTypes, setEditTypes] = useState<ReassignType[]>([]);

  const handleEditStart = () => {
    setEditTypes(JSON.parse(JSON.stringify(types)));
    setIsEditing(true);
  };

  const handleSave = () => {
    setTypes(editTypes);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleAddType = () => {
    const newType: ReassignType = {
      id: `new-${Date.now()}`,
      name: '',
      description: '',
      isUsed: true,
    };
    setEditTypes([...editTypes, newType]);
  };

  const handleDeleteType = (id: string) => {
    setEditTypes(editTypes.filter(t => t.id !== id));
  };

  const handleTypeChange = (id: string, field: keyof ReassignType, value: string | boolean) => {
    setEditTypes(editTypes.map(t => {
      if (t.id === id) {
        return { ...t, [field]: value };
      }
      return t;
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col pb-5">
        <div className="px-[30px] pt-8">
        <div className="w-full flex flex-col gap-6">

          {/* 예시 타입 — 수정 불가, 참고용 */}
          <div className="border border-dashed border-gray-200 rounded-lg bg-gray-50/50 flex h-[56px] items-center">
            <div className="w-[120px] px-6 text-sm font-medium text-gray-400 flex items-center">
              타입 이름
            </div>
            <div className="flex-1 px-6 text-sm text-gray-400 flex items-center gap-2">
              기본
              <span className="text-[11px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 leading-none">예시</span>
            </div>
          </div>

          {/* 커스텀 타입 목록 — 행 구분선 없음, 면 처리도 없음 (깔끔한 단일 면) */}
          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            {(isEditing ? editTypes : types).map((type) => (
              <div
                key={type.id}
                className="flex items-center h-[64px]"
              >
                <div className="w-[120px] px-6 text-sm font-semibold text-gray-900 flex items-center">
                  타입 이름
                </div>
                <div className="w-[200px] px-4 flex items-center">
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 border border-border rounded-sm text-[14px] text-text-primary bg-surface focus:outline-none focus:border-text-primary"
                      value={type.name}
                      onChange={(e) => handleTypeChange(type.id, 'name', e.target.value)}
                      placeholder="타입 이름"
                    />
                  ) : (
                    <span className="text-sm text-gray-700">{type.name}</span>
                  )}
                </div>

                <div className="w-[80px] px-4 text-sm font-semibold text-gray-900 flex items-center justify-center">
                  설명
                </div>
                <div className="flex-1 px-4 flex items-center">
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 border border-border rounded-sm text-[14px] text-text-primary bg-surface focus:outline-none focus:border-text-primary"
                      value={type.description}
                      onChange={(e) => handleTypeChange(type.id, 'description', e.target.value)}
                      placeholder="입력한 설명이 노출됩니다."
                    />
                  ) : (
                    <span className="text-sm text-gray-700">{type.description}</span>
                  )}
                </div>

                <div className="w-[260px] px-6 flex items-center justify-between">
                  {isEditing ? (
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`isUsed-${type.id}`}
                          className="w-4 h-4 text-black focus:ring-black border-gray-300"
                          checked={type.isUsed === true}
                          onChange={() => handleTypeChange(type.id, 'isUsed', true)}
                        />
                        <span className="text-sm text-gray-900 whitespace-nowrap">노출함</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`isUsed-${type.id}`}
                          className="w-4 h-4 text-black focus:ring-black border-gray-300"
                          checked={type.isUsed === false}
                          onChange={() => handleTypeChange(type.id, 'isUsed', false)}
                        />
                        <span className="text-sm text-gray-900 whitespace-nowrap">노출안함</span>
                      </label>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-700">{type.isUsed ? '노출함' : '노출안함'}</span>
                  )}

                  {isEditing && (
                    <button
                      className="text-text-secondary hover:text-danger transition-colors ml-4"
                      onClick={() => handleDeleteType(type.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 타입 추가 버튼 (수정 모드일 때만 표시) */}
          {isEditing && (
            <div className="flex justify-center mt-2">
              <Button
                variant="ghost"
                size="lg"
                className="px-16"
                onClick={handleAddType}
              >
                + 타입 추가
              </Button>
            </div>
          )}

          {/* 하단 액션 */}
          <div className="flex justify-end pt-6 mt-auto">
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="ghost" size="lg" onClick={handleCancel}>
                  취소
                </Button>
                <Button variant="secondary" size="lg" onClick={handleSave}>
                  확인
                </Button>
              </div>
            ) : (
              <Button variant="secondary" size="lg" onClick={handleEditStart}>
                수정
              </Button>
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
