/**
 * Role: 설계사 목록 페이지 — 설계사 조회, 승인/거절, 상세 이동
 * Key Features: 조직 트리 사이드바, 필터 검색, 일괄 승인, 페이지네이션
 * Dependencies: AdminDetail, 공용 UI 컴포넌트(Badge, Button, DataTable, Pagination 등)
 */
import React, { useState } from 'react';
import { AdminDetail, AdminUser } from './AdminDetail';
import { Footer } from './Footer';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DataTable,
  DataTableHead,
  DataTableHeadCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from './ui/data-table';
import { Pagination } from './ui/pagination';
import { ApprovalActions } from './ui/approval-actions';
import { SummaryStats } from './ui/summary-stats';
import { FilterBox, PageLayout } from './layout';
import { FilterChip } from './ui/filter-chip';
import { SelectField } from './ui/select-field';

const mockData: AdminUser[] = [
  { id: '10', no: 10, name: '이민혁', userId: 'kris', phone: '010-1111-1111', affiliation: '본사 > 사업단 1 > 지점 1 > 팀 1', position: '설계사', joinDate: '2026.01.01', approvalStatus: 'approved', approvalDate: '2026.02.01', activityStatus: '정상' },
  { id: '9', no: 9, name: '이민혁', userId: 'kris', phone: '010-1111-1111', affiliation: '본사 > 사업단 1 > 지점 1 > 팀 1', position: '설계사', joinDate: '2026.01.01', approvalStatus: 'pending', activityStatus: '대기' },
  { id: '8', no: 8, name: '이민혁', userId: 'kris', phone: '010-1111-1111', affiliation: '본사 > 사업단 1 > 지점 1', position: '설계사', joinDate: '2026.01.01', approvalStatus: 'pending', activityStatus: '대기' },
  { id: '7', no: 7, name: '이민혁', userId: 'kris', phone: '010-1111-1111', affiliation: '본사 > 사업단 1 > 지점 1 > 팀 1', position: '설계사', joinDate: '2026.01.01', approvalStatus: 'approved', approvalDate: '2026.02.01', activityStatus: '해촉' },
  { id: '6', no: 6, name: '이민혁', userId: 'kris', phone: '010-1111-1111', affiliation: '본사 > 사업단 1 > 지점 1 > 팀 1', position: '설계사', joinDate: '2026.01.01', approvalStatus: 'approved', approvalDate: '2026.02.01', activityStatus: '일시제한' },
  { id: '5', no: 5, name: '이민혁', userId: 'kris', phone: '010-1111-1111', affiliation: '본사 > 사업단 1 > 지점 1 > 팀 1', position: '설계사', joinDate: '2026.01.01', approvalStatus: 'pending', activityStatus: '대기' },
  { id: '4', no: 4, name: '이민혁', userId: 'kris', phone: '010-1111-1111', affiliation: '본사 > 사업단 1 > 지점 1 > 팀 1', position: '설계사', joinDate: '2026.01.01', approvalStatus: 'pending', activityStatus: '대기' },
  { id: '3', no: 3, name: '이민혁', userId: 'kris', phone: '010-1111-1111', affiliation: '본사 > 사업단 1 > 지점 1 > 팀 1', position: '설계사', joinDate: '2026.01.01', approvalStatus: 'pending', activityStatus: '대기' },
  { id: '2', no: 2, name: '이민혁', userId: 'kris', phone: '010-1111-1111', affiliation: '본사 > 사업단 1 > 지점 1 > 팀 1', position: '설계사', joinDate: '2026.01.01', approvalStatus: 'pending', activityStatus: '대기' },
  { id: '1', no: 1, name: '이민혁', userId: 'kris', phone: '010-1111-1111', affiliation: '본사 > 사업단 1 > 지점 1 > 팀 1', position: '설계사', joinDate: '2026.01.01', approvalStatus: 'pending', activityStatus: '대기' },
];

export function PlannerManagement() {
  const [searchType, setSearchType] = useState('이름');
  const [searchValue, setSearchValue] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('전체');
  const [selectedApproval, setSelectedApproval] = useState('전체');
  const [selectedActivity, setSelectedActivity] = useState('전체');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const toggleRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(mockData.map(d => d.id));
    }
    setSelectAll(!selectAll);
  };

  if (selectedUser) {
    return <AdminDetail user={selectedUser} onBack={() => setSelectedUser(null)} />;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-bg overflow-hidden">
      <PageLayout showSidebar sidebarTitle="문정 사업단">
        <div className="flex-1 flex flex-col overflow-hidden bg-bg">
          <div className="flex-1 overflow-y-auto">
          <div className="min-h-full flex flex-col pb-5">
          {/* 검색 필터 */}
          <FilterBox
            onSearch={() => {}}
            onReset={() => {
              setSearchValue('');
              setSelectedPosition('전체');
              setSelectedApproval('전체');
              setSelectedActivity('전체');
            }}
          >
            <FilterChip
              label="이름"
              options={[{ value: '전체', label: '전체' }]}
              value="전체"
              onChange={() => {}}
              searchable
            />
            <FilterChip
              label="직책"
              options={[
                { value: '전체', label: '전체' },
                { value: '설계사', label: '설계사' },
              ]}
              value={selectedPosition}
              onChange={setSelectedPosition}
            />
            <FilterChip
              label="승인 상태"
              options={[
                { value: '전체', label: '전체' },
                { value: '승인', label: '승인' },
                { value: '대기', label: '대기' },
              ]}
              value={selectedApproval}
              onChange={setSelectedApproval}
            />
            <FilterChip
              label="활동 상태"
              options={[
                { value: '전체', label: '전체' },
                { value: '정상', label: '정상' },
                { value: '대기', label: '대기' },
                { value: '해촉', label: '해촉' },
                { value: '일시제한', label: '일시제한' },
              ]}
              value={selectedActivity}
              onChange={setSelectedActivity}
            />
          </FilterBox>

          {/* 테이블 영역 */}
          <div className="flex flex-col px-6 pb-6 pt-2">
            <div className="flex items-center justify-between mb-4">
              {/* 현황 요약 — SummaryStats 컴포넌트 사용 */}
              <SummaryStats
                items={[
                  { label: '전체', value: 100, unit: '명' },
                  { label: '승인대기', value: 50, unit: '명' },
                  { label: '정상', value: 10, unit: '명' },
                  { label: '일시제한', value: 10, unit: '명' },
                ]}
              />
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => {}}>
                  선택 일괄 승인
                </Button>
                <SelectField width="w-24">
                  <option value="10">10개</option>
                  <option value="20">20개</option>
                  <option value="50">50개</option>
                </SelectField>
              </div>
            </div>

            <DataTable strongTopBorder>
              <DataTableHead>
                <tr>
                  <DataTableHeadCell className="w-12">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-primary"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </DataTableHeadCell>
                  <DataTableHeadCell className="w-16">No.</DataTableHeadCell>
                  <DataTableHeadCell className="w-24">이름</DataTableHeadCell>
                  <DataTableHeadCell className="w-24">아이디</DataTableHeadCell>
                  <DataTableHeadCell className="w-36">휴대폰번호</DataTableHeadCell>
                  <DataTableHeadCell className="min-w-[200px]">소속</DataTableHeadCell>
                  <DataTableHeadCell className="w-28">직책</DataTableHeadCell>
                  <DataTableHeadCell className="w-32">가입일</DataTableHeadCell>
                  <DataTableHeadCell className="w-36">승인상태</DataTableHeadCell>
                  <DataTableHeadCell className="w-28">활동상태</DataTableHeadCell>
                </tr>
              </DataTableHead>
              <DataTableBody>
                {mockData.map((row) => (
                  <DataTableRow key={row.id}>
                    <DataTableCell className="w-12">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-primary"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleRow(row.id)}
                      />
                    </DataTableCell>
                    <DataTableCell>{row.no}</DataTableCell>
                    <DataTableCell
                      className="text-primary hover:underline cursor-pointer"
                      onClick={() => setSelectedUser(row)}
                    >
                      {row.name}
                    </DataTableCell>
                    <DataTableCell>{row.userId}</DataTableCell>
                    <DataTableCell>{row.phone}</DataTableCell>
                    <DataTableCell className="text-left">{row.affiliation}</DataTableCell>
                    <DataTableCell>{row.position}</DataTableCell>
                    <DataTableCell>{row.joinDate}</DataTableCell>
                    <DataTableCell>
                      {row.approvalStatus === 'approved' ? (
                        <Badge variant="default">{row.approvalDate}</Badge>
                      ) : (
                        <ApprovalActions />
                      )}
                    </DataTableCell>
                    <DataTableCell>{row.activityStatus}</DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>

            <Pagination />
          </div>
          <div className="flex-1 min-h-[50px]" />
          <Footer />
          </div>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
