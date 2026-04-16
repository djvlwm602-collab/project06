import { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Board } from './components/Board';
import { ContractExpected } from './components/ContractExpected';
import { ConsultationEnded } from './components/ConsultationEnded';
import { AssignedDB } from './components/AssignedDB';
import { UnassignedDB } from './components/UnassignedDB';
import { AdminManagement } from './components/AdminManagement';
import { PlannerManagement } from './components/PlannerManagement';
import { RolePermissionSettings } from './components/RolePermissionSettings';
import { OrgStructureSettings } from './components/OrgStructureSettings';
import { ReassignTypeSettings } from './components/ReassignTypeSettings';
import { AutoRetrieveSettings } from './components/AutoRetrieveSettings';
import { AutoAssignSettings } from './components/AutoAssignSettings';
import { DBDistributionStatus } from './components/DBDistributionStatus';
import { DBDistributionDetail } from './components/DBDistributionDetail';
import { HomeDashboard } from './components/HomeDashboard';
import { BoardData, Task } from './types';
import { applyBrand, defaultBrand } from './config/brand';

// 앱 최상단에서 한 번 호출 — 브랜드 CSS 변수를 :root에 주입한다
applyBrand(defaultBrand);

// 페이지별 타이틀/부제목 매핑
const PAGE_META: Record<string, { title: string; subtitle?: string }> = {
  '홈 대시보드':      { title: '홈 대시보드',       subtitle: '조직별 주요 현황을 확인할 수 있습니다.' },
  '상담 진행 고객':   { title: '상담 진행 고객',   subtitle: '배정 된 고객의 상담을 관리할 수 있습니다.' },
  '계약 예정 고객':   { title: '계약 예정 고객',   subtitle: '계약 진행을 약속한 고객을 관리할 수 있습니다.' },
  '상담 종료 고객':   { title: '상담 종료 고객',   subtitle: '상담 거절로 종료된 고객을 관리할 수 있습니다.' },
  '배정 완료 DB':     { title: '배정 완료 DB',     subtitle: '배정된 DB를 다른 설계사에게 재배정 할 수 있습니다.' },
  '미배정 DB':        { title: '미배정 DB',        subtitle: '배정이 되지 않은 DB를 설계사에게 재배정 할 수 있습니다.' },
  'DB 분배 현황':     { title: 'DB 분배 현황',     subtitle: '각 지점별 설계사 또는 권역별 배정된 DB 수량을 확인할 수 있습니다.' },
  'DB 분배 현황 상세':{ title: 'DB 분배 현황',     subtitle: '각 지점별 설계사 또는 권역별 배정된 DB 수량을 확인할 수 있습니다.' },
  '운영/관리자':      { title: '운영/관리자',      subtitle: '서비스를 이용하는 직원을 관리할 수 있습니다.' },
  '설계사':           { title: '설계사',           subtitle: '보험 상담업무를 진행하는 설계사를 관리할 수 있습니다.' },
  '직책·권한 설정':   { title: '직책·권한 설정',   subtitle: '조직을 담당하는 직책 및 메뉴 권한을 부여합니다.' },
  '조직 구조 설정':   { title: '조직 구조 설정',   subtitle: '조직의 구성원 소속과 관리 범위의 기준으로 사용합니다.' },
  '재배정 타입 설정': { title: '재배정 타입 설정', subtitle: '다른 설계사에게 고객 재배정 시, 사유를 설정할 수 있습니다.' },
  '자동 회수 설정':   { title: '자동 회수 설정',   subtitle: '배정 후, 상담 미 시도시 DB를 자동으로 회수할 수 있습니다.' },
  '자동 배정 설정':   { title: '자동 배정 설정',   subtitle: '설계사에게 자동 배정 여부를 설정할 수 있습니다.' },
};

const initialData: BoardData = {
  tasks: {
    'task-1': {
      id: 'task-1',
      key: 'CUST-1',
      name: '이*혁',
      age: 34,
      gender: '남',
      location: '서울특별시',
      phone: '0507-1234-1234',
      assignedDate: '2026.01.21 00:00',
      firstCallDate: '-',
      recentCallDate: '-',
      tag: '종합진단',
      callCount: 0,
    },
    'task-2': {
      id: 'task-2',
      key: 'CUST-2',
      name: '이*혁',
      age: 34,
      gender: '남',
      location: '서울특별시',
      phone: '0507-1234-1234',
      assignedDate: '2026.01.21 00:00',
      firstCallDate: '-',
      recentCallDate: '-',
      tag: '보험료점검',
      callCount: 0,
    },
    'task-3': {
      id: 'task-3',
      key: 'CUST-3',
      name: '이*혁',
      age: 34,
      gender: '남',
      location: '서울특별시',
      phone: '0507-1234-1234',
      assignedDate: '2026.01.21 00:00',
      firstCallDate: '2026.01.21 00:00',
      recentCallDate: '2026.01.21 00:00',
      tag: '종합진단',
      callCount: 1,
    },
    'task-4': {
      id: 'task-4',
      key: 'CUST-4',
      name: '이*혁',
      age: 34,
      gender: '남',
      location: '서울특별시',
      phone: '0507-1234-1234',
      assignedDate: '2026.01.21 00:00',
      firstCallDate: '2026.01.21 00:00',
      recentCallDate: '2026.01.21 00:00',
      tag: '종합진단',
      callCount: 3,
    },
    'task-5': {
      id: 'task-5',
      key: 'CUST-5',
      name: '이*혁',
      age: 34,
      gender: '남',
      location: '서울특별시',
      phone: '0507-1234-1234',
      assignedDate: '2026.01.21 00:00',
      firstCallDate: '2026.01.21 00:00',
      recentCallDate: '2026.01.21 00:00',
      tag: '보장확대',
      callCount: 2,
    },
    'task-6': {
      id: 'task-6',
      key: 'CUST-6',
      name: '이*혁',
      age: 34,
      gender: '남',
      location: '서울특별시',
      phone: '0507-1234-1234',
      assignedDate: '2026.01.21 00:00',
      firstCallDate: 'YYYY.MM.DD에 삭제 예정',
      recentCallDate: '2026.01.21 00:00',
      tag: '보장확대',
      callCount: 3,
      isCancelled: true,
    },
  },
  columns: {
    'before-call': {
      id: 'before-call',
      title: '통화 전',
      taskIds: ['task-1', 'task-2'],
      group: '상담 대기',
    },
    'missed-call': {
      id: 'missed-call',
      title: '부재중',
      taskIds: ['task-3'],
      group: '상담 중',
    },
    'success-call': {
      id: 'success-call',
      title: '통화성공',
      taskIds: ['task-4', 'task-6'],
      group: '상담 중',
    },
    'valid-call': {
      id: 'valid-call',
      title: '유효통화',
      taskIds: ['task-5'],
      group: '상담 중',
    },
  },
  columnOrder: ['before-call', 'missed-call', 'success-call', 'valid-call'],
};

// URL ?page= 쿼리로 초기 페이지 결정 — Figma 캡처 시 페이지별 URL 접근용
// 유효하지 않은 값이거나 파라미터가 없으면 기본값 '상담 진행 고객' 사용
const getInitialPage = () => {
  const p = new URLSearchParams(window.location.search).get('page');
  return p && PAGE_META[p] ? p : '상담 진행 고객';
};

export default function App() {
  const [data, setData] = useState<BoardData>(initialData);
  const [activePage, setActivePage] = useState<string>(getInitialPage);
  const [distributionDetailParams, setDistributionDetailParams] = useState<{period: string, status: string} | null>(null);
  const dashboardActions = null;

  const handlePageChange = (page: string) => {
    setActivePage(page);
    if (page !== 'DB 분배 현황 상세') {
      setDistributionDetailParams(null);
    }
  };

  const handleNavigateToDistributionDetail = (period: string, status: string) => {
    setDistributionDetailParams({ period, status });
    setActivePage('DB 분배 현황 상세');
  };

  const handleMoveTask = (taskId: string, targetColumnId: string) => {
    setData((prev) => {
      const task = prev.tasks[taskId];
      
      // Find current column
      let sourceColumnId = '';
      for (const colId of prev.columnOrder) {
        if (prev.columns[colId].taskIds.includes(taskId)) {
          sourceColumnId = colId;
          break;
        }
      }

      if (!sourceColumnId || sourceColumnId === targetColumnId) return prev;

      const sourceColumn = prev.columns[sourceColumnId];
      const targetColumn = prev.columns[targetColumnId];

      // Remove from source
      const newSourceTaskIds = sourceColumn.taskIds.filter((id) => id !== taskId);
      
      // Add to target
      const newTargetTaskIds = [...targetColumn.taskIds, taskId];

      return {
        ...prev,
        columns: {
          ...prev.columns,
          [sourceColumnId]: {
            ...sourceColumn,
            taskIds: newSourceTaskIds,
          },
          [targetColumnId]: {
            ...targetColumn,
            taskIds: newTargetTaskIds,
          },
        },
      };
    });
  };

  return (
    <div className="h-screen overflow-x-auto overflow-y-hidden bg-white text-gray-900 font-sans">
      <div className="flex h-full min-w-[1280px]">
      <Sidebar activePage={activePage === 'DB 분배 현황 상세' ? 'DB 분배 현황' : activePage} onPageChange={handlePageChange} />
      <div className="flex-1 flex flex-col min-w-[640px] overflow-hidden bg-[#F3F3F5]">
        <TopBar
          onCreateTask={() => {}}
          title={PAGE_META[activePage]?.title}
          subtitle={PAGE_META[activePage]?.subtitle}
          actions={dashboardActions}
        />
        {activePage === '홈 대시보드' ? (
          <HomeDashboard />
        ) : activePage === '상담 진행 고객' ? (
          <Board 
            data={data} 
            onMoveTask={handleMoveTask} 
            onCreateTask={() => {}}
          />
        ) : activePage === '계약 예정 고객' ? (
          <ContractExpected />
        ) : activePage === '상담 종료 고객' ? (
          <ConsultationEnded />
        ) : activePage === '배정 완료 DB' ? (
          <AssignedDB />
        ) : activePage === '미배정 DB' ? (
          <UnassignedDB />
        ) : activePage === '운영/관리자' ? (
          <AdminManagement />
        ) : activePage === '설계사' ? (
          <PlannerManagement />
        ) : activePage === '직책·권한 설정' ? (
          <RolePermissionSettings />
        ) : activePage === '조직 구조 설정' ? (
          <OrgStructureSettings />
        ) : activePage === '재배정 타입 설정' ? (
          <ReassignTypeSettings />
        ) : activePage === '자동 회수 설정' ? (
          <AutoRetrieveSettings />
        ) : activePage === '자동 배정 설정' ? (
          <AutoAssignSettings />
        ) : activePage === 'DB 분배 현황' ? (
          <DBDistributionStatus onNavigateToDetail={handleNavigateToDistributionDetail} />
        ) : activePage === 'DB 분배 현황 상세' && distributionDetailParams ? (
          <DBDistributionDetail 
            period={distributionDetailParams.period} 
            status={distributionDetailParams.status}
            onBack={() => handlePageChange('DB 분배 현황')}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{activePage}</h3>
              <p>준비 중인 페이지입니다.</p>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
