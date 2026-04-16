import React from 'react';
import { User, ChevronLeft } from 'lucide-react';
import { Footer } from './Footer';
import { Button } from './ui/button';

export interface AdminUser {
  id: string;
  no: number;
  name: string;
  userId: string;
  phone: string;
  affiliation: string;
  position: string;
  joinDate: string;
  approvalStatus: 'approved' | 'pending';
  approvalDate?: string;
  activityStatus: '정상' | '대기' | '일시제한' | '해촉';
}

interface AdminDetailProps {
  user: AdminUser;
  onBack: () => void;
}

export function AdminDetail({ user, onBack }: AdminDetailProps) {
  return (
    <div className="flex-1 flex flex-col bg-bg h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4 flex items-center gap-4 shrink-0">
        <button 
          onClick={onBack}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex items-end gap-3">
          <h1 className="text-xl font-semibold text-gray-900">운영/관리자</h1>
          <span className="text-sm text-gray-500 mb-0.5">서비스를 이용하는 직원을 관리할 수 있습니다.</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="min-h-full flex flex-col pb-5">
        <div className="px-8 pt-8">
        <div className="max-w-5xl mx-auto">
          
          {/* 기본 정보 */}
          <div className="mb-10">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-black"></span>
              기본 정보
            </h2>
            <div className="flex border-t border-gray-300 border-b border-gray-200">
              <div className="w-[200px] flex items-center justify-center border-r border-gray-200 p-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  <User size={48} className="text-gray-400" />
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex border-b border-gray-200">
                  <div className="w-[160px] bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-900 border-r border-gray-200 flex items-center justify-center">아이디</div>
                  <div className="flex-1 px-6 py-4 text-sm text-gray-700 flex items-center">{user.userId}</div>
                </div>
                <div className="flex border-b border-gray-200">
                  <div className="w-[160px] bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-900 border-r border-gray-200 flex items-center justify-center">이름</div>
                  <div className="flex-1 px-6 py-4 text-sm text-gray-700 flex items-center">{user.name}</div>
                </div>
                <div className="flex border-b border-gray-200">
                  <div className="w-[160px] bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-900 border-r border-gray-200 flex items-center justify-center">휴대폰 번호</div>
                  <div className="flex-1 px-6 py-4 text-sm text-gray-700 flex items-center">{user.phone}</div>
                </div>
                <div className="flex">
                  <div className="w-[160px] bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-900 border-r border-gray-200 flex items-center justify-center">보조 휴대폰 번호</div>
                  <div className="flex-1 px-6 py-4 text-sm text-gray-700 flex items-center">-</div>
                </div>
              </div>
            </div>
          </div>

          {/* 직책 및 소속 */}
          <div className="mb-10">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-black"></span>
              직책 및 소속
            </h2>
            <div className="flex flex-col border-t border-gray-300 border-b border-gray-200">
              <div className="flex border-b border-gray-200">
                <div className="w-[200px] bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-900 border-r border-gray-200 flex items-center justify-center">직책</div>
                <div className="flex-1 px-6 py-4 text-sm text-gray-700 flex items-center">{user.position}</div>
              </div>
              <div className="flex border-b border-gray-200">
                <div className="w-[200px] bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-900 border-r border-gray-200 flex items-center justify-center">업무</div>
                <div className="flex-1 px-6 py-4 text-sm text-gray-700 flex items-center">운영/관리자</div>
              </div>
              <div className="flex">
                <div className="w-[200px] bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-900 border-r border-gray-200 flex items-center justify-center">소속</div>
                <div className="flex-1 px-6 py-4 text-sm text-gray-700 flex items-center">
                  {user.affiliation}
                </div>
              </div>
            </div>
          </div>

          {/* 상태 정보 */}
          <div className="mb-10">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-black"></span>
              상태 정보
            </h2>
            <div className="flex flex-col border-t border-gray-300 border-b border-gray-200">
              <div className="flex border-b border-gray-200">
                <div className="w-[200px] bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-900 border-r border-gray-200 flex items-center justify-center">승인상태</div>
                <div className="flex-1 px-6 py-4 text-sm text-gray-700 flex items-center gap-4">
                  <span>{user.approvalStatus === 'approved' ? '승인' : '대기'}</span>
                  {user.approvalStatus === 'pending' && (
                    <div className="flex items-center gap-1.5">
                      <button className="bg-primary-subtle text-primary border border-primary/20 px-4 py-1 rounded-sm text-xs font-medium hover:bg-primary/10 transition-colors">
                        승인하기
                      </button>
                      <button className="bg-danger-subtle text-danger border border-danger/20 px-4 py-1 rounded-sm text-xs font-medium hover:bg-danger/10 transition-colors">
                        승인거절
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex border-b border-gray-200">
                <div className="w-[200px] bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-900 border-r border-gray-200 flex items-center justify-center">활동상태</div>
                <div className="flex-1 px-6 py-4 text-sm text-gray-700 flex items-center">{user.activityStatus}</div>
              </div>
              <div className="flex border-b border-gray-200">
                <div className="w-[200px] bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-900 border-r border-gray-200 flex items-center justify-center">가입일</div>
                <div className="flex-1 px-6 py-4 text-sm text-gray-700 flex items-center">{user.joinDate}</div>
              </div>
              <div className="flex">
                <div className="w-[200px] bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-900 border-r border-gray-200 flex items-center justify-center">최근 접속일</div>
                <div className="flex-1 px-6 py-4 text-sm text-gray-700 flex items-center">-</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-border">
            <Button variant="primary" size="lg">수정</Button>
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
