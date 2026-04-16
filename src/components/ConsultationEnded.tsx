/**
 * Role: 상담 종료 고객 목록 페이지
 * Key Features: 담당설계사/고객명/사유 필터, 테이블 목록, 페이지네이션
 * Dependencies: PageLayout, PageHeader, FilterBox, FilterRow, SelectField, Input, DataTable, Pagination, Footer
 */
import React, { useState } from 'react';
import { Footer } from './Footer';
import { FilterBox } from './layout/filter-box';
import { PageLayout } from './layout/page-layout';
import { FilterChip } from './ui/filter-chip';
import { InputChip } from './ui/input-chip';
import { SelectField } from './ui/select-field';
import {
  DataTable, DataTableHead, DataTableHeadCell,
  DataTableBody, DataTableRow, DataTableCell,
} from './ui/data-table';
import { Pagination } from './ui/pagination';

interface Customer {
  no: number;
  name: string;
  gender: string;
  birthDate: string;
  age: number;
  phone: string;
  location: string;
  reason: string;
  endedDate: string;
}

const mockData: Customer[] = Array.from({ length: 10 }).map((_, i) => ({
  no: 10 - i,
  name: '이*혁',
  gender: '남성',
  birthDate: '1981.11.27',
  age: 40,
  phone: '0507-1111-1111',
  location: '서울특별시',
  reason: i % 2 === 0 ? '상담 거절' : '계약 완료',
  endedDate: '2026.01.01 00:00',
}));

export function ConsultationEnded() {
  const [selectedAgent, setSelectedAgent] = useState('홍길동');
  const [customerName, setCustomerName] = useState('');
  const [selectedReason, setSelectedReason] = useState('전체');

  return (
    <div className="flex-1 flex flex-col h-full bg-bg overflow-hidden">
      {/* 사이드바 + 본문 레이아웃 */}
      <PageLayout showSidebar activeTreeId="team-a2">
        <div className="flex-1 flex flex-col overflow-hidden bg-bg">
          {/* 필터 영역 */}
          <FilterBox
            onSearch={() => {}}
            onReset={() => {
              setCustomerName('');
              setSelectedAgent('전체');
              setSelectedReason('전체');
            }}
          >
            <FilterChip
              label="담당설계사"
              options={[
                { value: '전체', label: '전체' },
                { value: '홍길동', label: '홍길동' },
                { value: '김철수', label: '김철수' },
              ]}
              value={selectedAgent}
              onChange={setSelectedAgent}
              searchable
            />
            <InputChip
              label="고객명"
              value={customerName}
              onChange={setCustomerName}
              suggestions={['이민혁', '이수정', '김철수', '박지연', '홍길동', '최영희', '정민수']}
            />
            <FilterChip
              label="사유"
              options={[
                { value: '전체', label: '전체' },
                { value: '상담 거절', label: '상담 거절' },
                { value: '계약 완료', label: '계약 완료' },
              ]}
              value={selectedReason}
              onChange={setSelectedReason}
            />
          </FilterBox>

          {/* 테이블 영역 */}
          <div className="flex flex-col flex-1 min-h-0 px-6 pb-6">
            {/* 목록 수 / 페이지 크기 선택 */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-[14px] font-medium text-text-primary">
                총 <span className="font-semibold">10</span>개
              </div>
              <SelectField width="w-24">
                <option value="10">10개</option>
                <option value="20">20개</option>
                <option value="50">50개</option>
              </SelectField>
            </div>

            <div className="flex-1 overflow-auto">
              <DataTable>
                <DataTableHead>
                  <tr>
                    <DataTableHeadCell className="w-16">No.</DataTableHeadCell>
                    <DataTableHeadCell className="w-24">이름</DataTableHeadCell>
                    <DataTableHeadCell className="w-20">성별</DataTableHeadCell>
                    <DataTableHeadCell className="w-40">생년월일</DataTableHeadCell>
                    <DataTableHeadCell className="w-40">연락처</DataTableHeadCell>
                    <DataTableHeadCell className="min-w-[120px]">지역</DataTableHeadCell>
                    <DataTableHeadCell className="w-32">사유</DataTableHeadCell>
                    <DataTableHeadCell className="w-48">상담 종료 상태 전환일</DataTableHeadCell>
                  </tr>
                </DataTableHead>
                <DataTableBody>
                  {mockData.map((row) => (
                    <DataTableRow key={row.no}>
                      <DataTableCell>{row.no}</DataTableCell>
                      {/* 이름은 링크 스타일 유지 */}
                      <DataTableCell className="text-primary hover:underline cursor-pointer">
                        {row.name}
                      </DataTableCell>
                      <DataTableCell>{row.gender}</DataTableCell>
                      <DataTableCell>{row.birthDate} ({row.age}세)</DataTableCell>
                      <DataTableCell>{row.phone}</DataTableCell>
                      <DataTableCell>{row.location}</DataTableCell>
                      <DataTableCell>{row.reason}</DataTableCell>
                      <DataTableCell>{row.endedDate}</DataTableCell>
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </DataTable>
            </div>

            <Pagination />
          </div>
        </div>
        <Footer />
      </PageLayout>
    </div>
  );
}
