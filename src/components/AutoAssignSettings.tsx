/**
 * Role: 자동 배정 설정 페이지 — 설계사 자동 배정 사용 여부 설정
 * Key Features: 사용/미사용 라디오 선택, 저장
 * Dependencies: 공용 UI 컴포넌트(Button, PageHeader)
 */
import React, { useState } from 'react';
import { Button } from './ui/button';

import { Footer } from './Footer';

export function AutoAssignSettings() {
  const [isUsed, setIsUsed] = useState(false);

  const handleSave = () => {
    // 저장 로직 — 추후 API 연동 예정
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col pb-5">
        <div className="px-[30px] pt-8">
        <div className="w-full flex flex-col">

          <div className="border border-gray-200 rounded-lg bg-white p-10">
            <div className="mb-10">
              <p className="text-sm font-semibold text-gray-900">
                사용함을 선택하시면, 보닥에서 제공하는 DB를 설계사에게 까지 자동 배정해 드립니다.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                (변경된 설정 값은 익일 00:00시 부터 적용)
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="autoAssign"
                    className="w-4 h-4 text-black focus:ring-black border-gray-300"
                    checked={!isUsed}
                    onChange={() => setIsUsed(false)}
                  />
                  <span className="text-sm font-semibold text-gray-900 w-20">사용안함</span>
                </label>
                <span className="text-sm text-gray-700">
                  ( 해당 조직의 "DB 배정 관리 &gt; 미배정 DB" 메뉴로 이관되며, 직접 설계사에게 배정하셔야 해요. )
                </span>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="autoAssign"
                    className="w-4 h-4 text-black focus:ring-black border-gray-300"
                    checked={isUsed}
                    onChange={() => setIsUsed(true)}
                  />
                  <span className="text-sm font-semibold text-gray-900 w-20">사용함</span>
                </label>
                <span className="text-sm text-gray-700">
                  ( 해당 조직의 소속 된 설계사에게 1/N으로 자동 배정 되며, 퇴사한 설계사가 있다면 해촉 처리해 주세요. )
                </span>
              </div>
            </div>
          </div>

          {/* 하단 액션 */}
          <div className="flex justify-end pt-6 mt-auto">
            <Button variant="secondary" size="lg" className="px-12" onClick={handleSave}>
              확인
            </Button>
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
