/**
 * Role: 승인/거절 액션 버튼 쌍 — 관리자/설계사 승인 목록 행에서 사용하는 인라인 버튼
 * Key Features: 승인(중립 톤), 거절(danger 톤) 2개 버튼, 클릭 핸들러 주입
 * Dependencies: 공용 디자인 토큰
 */
import React from 'react';

interface ApprovalActionsProps {
  onApprove?: () => void;
  onReject?: () => void;
  approveLabel?: string;
  rejectLabel?: string;
}

export function ApprovalActions({
  onApprove,
  onReject,
  approveLabel = '승인',
  rejectLabel = '거절',
}: ApprovalActionsProps) {
  return (
    <div className="flex items-center justify-center gap-1">
      {/* 승인 — 중립 버튼 (bg-bg / hover bg-border) */}
      <button
        type="button"
        className="px-3 py-1 text-xs font-medium rounded-sm bg-bg text-text-secondary hover:bg-border transition-colors"
        onClick={onApprove}
      >
        {approveLabel}
      </button>
      {/* 거절 — danger 서브틀 톤 */}
      <button
        type="button"
        className="px-3 py-1 text-xs font-medium rounded-sm bg-danger-subtle text-danger hover:bg-danger/10 transition-colors"
        onClick={onReject}
      >
        {rejectLabel}
      </button>
    </div>
  );
}
