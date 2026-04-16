/**
 * Role: 직책·권한 설정 페이지 — 직책/직급 목록 조회, 등록 폼 이동
 * Key Features: 필터 검색, 테이블 목록, 등록 버튼
 * Dependencies: RolePermissionForm, 공용 UI 컴포넌트
 */
import React, { useState } from 'react';
import { RolePermissionForm } from './RolePermissionForm';
import { Footer } from './Footer';
import { Button } from './ui/button';
import { SelectField } from './ui/select-field';
import {
  DataTable,
  DataTableHead,
  DataTableHeadCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from './ui/data-table';
import { Pagination } from './ui/pagination';
import { FilterBox } from './layout';
import { FilterChip } from './ui/filter-chip';

interface RoleData {
  id: string;
  no: number;
  roleName: string;
  permission: string;
  isUsed: string;
  regDate: string;
  modDate: string;
}

const mockData: RoleData[] = [
  { id: '10', no: 10, roleName: '최고 관리자', permission: '운영/관리자', isUsed: '사용함', regDate: '2026.01.01', modDate: '-' },
  { id: '9', no: 9, roleName: '사업단장', permission: '운영/관리자', isUsed: '사용함', regDate: '2026.01.01', modDate: '-' },
  { id: '8', no: 8, roleName: '지점장', permission: '운영/관리자', isUsed: '사용함', regDate: '2026.01.01', modDate: '-' },
  { id: '7', no: 7, roleName: '팀장', permission: '운영/관리자', isUsed: '사용함', regDate: '2026.01.01', modDate: '-' },
  { id: '6', no: 6, roleName: '플래너', permission: '설계사', isUsed: '사용함', regDate: '2026.01.01', modDate: '-' },
  { id: '5', no: 5, roleName: '직책명', permission: '운영/관리자', isUsed: '사용함', regDate: '2026.01.01', modDate: '-' },
  { id: '4', no: 4, roleName: '직책명', permission: '운영/관리자', isUsed: '사용함', regDate: '2026.01.01', modDate: '-' },
  { id: '3', no: 3, roleName: '직책명', permission: '운영/관리자', isUsed: '사용함', regDate: '2026.01.01', modDate: '-' },
  { id: '2', no: 2, roleName: '직책명', permission: '운영/관리자', isUsed: '사용함', regDate: '2026.01.01', modDate: '2026.01.02' },
  { id: '1', no: 1, roleName: '직책명', permission: '운영/관리자', isUsed: '사용함', regDate: '2026.01.01', modDate: '-' },
];

export function RolePermissionSettings() {
  const [selectedRole, setSelectedRole] = useState('전체');
  const [selectedPermission, setSelectedPermission] = useState('전체');
  const [selectedIsUsed, setSelectedIsUsed] = useState('전체');
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return <RolePermissionForm onBack={() => setShowForm(false)} />;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-bg overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col pb-5">
        <div className="px-[30px] pt-8">
        <div className="w-full flex flex-col">
          {/* 검색 필터 */}
          <div className="mb-8">
            <FilterBox
              noWrapper
              onSearch={() => {}}
              onReset={() => {
                setSelectedRole('전체');
                setSelectedPermission('전체');
                setSelectedIsUsed('전체');
              }}
            >
              <FilterChip
                label="직책/직급명"
                options={[
                  { value: '전체', label: '전체' },
                  { value: '최고 관리자', label: '최고 관리자' },
                  { value: '사업단장', label: '사업단장' },
                  { value: '지점장', label: '지점장' },
                  { value: '팀장', label: '팀장' },
                  { value: '플래너', label: '플래너' },
                ]}
                value={selectedRole}
                onChange={setSelectedRole}
              />
              <FilterChip
                label="업무 권한"
                options={[
                  { value: '전체', label: '전체' },
                  { value: '운영/관리자', label: '운영/관리자' },
                  { value: '설계사', label: '설계사' },
                ]}
                value={selectedPermission}
                onChange={setSelectedPermission}
              />
              <FilterChip
                label="사용 여부"
                options={[
                  { value: '전체', label: '전체' },
                  { value: '사용함', label: '사용함' },
                  { value: '사용안함', label: '사용안함' },
                ]}
                value={selectedIsUsed}
                onChange={setSelectedIsUsed}
              />
            </FilterBox>
          </div>

          {/* 테이블 영역 */}
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-900">
                총 <span className="font-semibold">10</span>개
              </div>
              <SelectField width="w-24">
                <option value="10">10개</option>
                <option value="20">20개</option>
                <option value="50">50개</option>
              </SelectField>
            </div>

            <DataTable strongTopBorder>
              <DataTableHead>
                <tr>
                  <DataTableHeadCell className="w-20">No.</DataTableHeadCell>
                  <DataTableHeadCell>직책/직급</DataTableHeadCell>
                  <DataTableHeadCell>업무 권한</DataTableHeadCell>
                  <DataTableHeadCell>사용 여부</DataTableHeadCell>
                  <DataTableHeadCell className="w-32">등록일</DataTableHeadCell>
                  <DataTableHeadCell className="w-32">수정일</DataTableHeadCell>
                </tr>
              </DataTableHead>
              <DataTableBody>
                {mockData.map((row) => (
                  <DataTableRow key={row.id}>
                    <DataTableCell>{row.no}</DataTableCell>
                    <DataTableCell className="text-primary hover:underline cursor-pointer">
                      {row.roleName}
                    </DataTableCell>
                    <DataTableCell>{row.permission}</DataTableCell>
                    <DataTableCell>{row.isUsed}</DataTableCell>
                    <DataTableCell>{row.regDate}</DataTableCell>
                    <DataTableCell>{row.modDate}</DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>

            <Pagination className="mb-8" />

            {/* 하단 액션 */}
            <div className="flex justify-end pt-6 mt-auto">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowForm(true)}
              >
                등록
              </Button>
            </div>
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
