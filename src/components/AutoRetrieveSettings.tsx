/**
 * Role: 자동 회수 설정 페이지 — 미상담 DB 자동 회수 시간 설정
 * Key Features: 사용 여부 토글, 회수 시간 입력
 * Dependencies: 공용 UI 컴포넌트(Button, PageHeader)
 */
import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

import { Footer } from './Footer';

export function AutoRetrieveSettings() {
  const [isUsed, setIsUsed] = useState(true);
  const [hours, setHours] = useState('30');

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
                설계사에게 배정한 DB를 설정한 시간 내 상담을 시작하지 않으면 자동으로 DB를 미배정으로 회수할 수 있어요.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                (변경된 설정 값은 익일 00:00시 부터 적용)
              </p>
            </div>

            <div className="flex items-center gap-12">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="autoRetrieve"
                  className="w-4 h-4 text-black focus:ring-black border-gray-300"
                  checked={!isUsed}
                  onChange={() => setIsUsed(false)}
                />
                <span className="text-sm font-semibold text-gray-900">사용안함</span>
              </label>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="autoRetrieve"
                    className="w-4 h-4 text-black focus:ring-black border-gray-300"
                    checked={isUsed}
                    onChange={() => setIsUsed(true)}
                  />
                  <span className="text-sm font-semibold text-gray-900">사용함</span>
                </label>

                <div className="flex items-center text-sm text-gray-700 ml-2">
                  (
                  <input
                    type="text"
                    className={cn(
                      "w-16 px-3 py-1.5 mx-2 border rounded-sm text-center focus:outline-none focus:border-gray-900",
                      isUsed ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50 text-gray-400"
                    )}
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    disabled={!isUsed}
                  />
                  시간 이내, 상담 미 시도시 미배정으로 회수됩니다. )
                </div>
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
