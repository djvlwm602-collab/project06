/**
 * Role: 미배정 DB 관리 페이지 — 배정되지 않은 DB 조회 및 설계사 배정 기능
 * Key Features: 조직 트리 사이드바, 필터 검색, 테이블, 페이지네이션
 * Dependencies: layout/*, ui/*
 */
import React, { useState } from 'react';
import { Footer } from './Footer';
import { FilterBox } from './layout/filter-box';
import { PageLayout } from './layout/page-layout';
import { SelectField } from './ui/select-field';
import { Button } from './ui/button';
import { FilterChip } from './ui/filter-chip';
import { InputChip } from './ui/input-chip';
import {
  DataTable, DataTableHead, DataTableHeadCell,
  DataTableBody, DataTableRow, DataTableCell,
} from './ui/data-table';
import { Pagination } from './ui/pagination';

interface Customer {
  id: string;
  no: number;
  name: string;
  gender: string;
  birthDate: string;
  age: number;
  phone: string;
  location: string;
  requestDate: string;
}

const mockData: Customer[] = Array.from({ length: 10 }).map((_, i) => ({
  id: String(10 - i),
  no: 10 - i,
  name: '이*혁',
  gender: '남성',
  birthDate: '1981.11.27',
  age: 40,
  phone: '0507-1111-1111',
  location: '서울특별시',
  requestDate: '2026.01.01 00:00',
}));

const regions = ['전체', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전남', '전북', '경북', '경남', '제주'];

export function UnassignedDB() {
  const [customerName, setCustomerName] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const toggleRegion = (region: string) => {
    if (region === '전체') {
      setSelectedRegions([]);
    } else {
      setSelectedRegions(prev => {
        const newRegions = prev.includes(region)
          ? prev.filter(r => r !== region)
          : [...prev.filter(r => r !== '전체'), region];
        return newRegions.length === 0 ? ['전체'] : newRegions;
      });
    }
  };

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

  // 필터 초기화
  const handleReset = () => {
    setCustomerName('');
    setSelectedRegions([]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg overflow-hidden">
      <PageLayout showSidebar>
        {/* 우측 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col overflow-hidden bg-bg">
          <div className="flex-1 overflow-y-auto">
          <div className="min-h-full flex flex-col pb-5">
          {/* 검색 필터 영역 */}
          <FilterBox onSearch={() => {}} onReset={handleReset}>
            <InputChip
              label="고객명"
              value={customerName}
              onChange={setCustomerName}
              suggestions={['이민혁', '이수정', '김철수', '박지연', '홍길동', '최영희', '정민수']}
            />
            <FilterChip
              label="지역"
              options={regions.map(r => ({ value: r, label: r }))}
              values={selectedRegions}
              onChangeMulti={setSelectedRegions}
              multiple
              columns={3}
            />
          </FilterBox>

          {/* 테이블 영역 */}
          <div className="flex flex-col px-6 pb-6">
            {/* 테이블 상단 툴바 */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-[14px] font-medium text-text-primary">
                총 <span className="font-semibold">10</span>개
              </div>
              <div className="flex items-center gap-2">
                {/* 정렬 선택 */}
                <SelectField width="w-32">
                  <option value="최신순">최신순</option>
                  <option value="과거순">과거순</option>
                </SelectField>
                <Button variant="secondary" size="sm">선택 재배정</Button>
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
                      className="w-4 h-4 border-border rounded"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </DataTableHeadCell>
                  <DataTableHeadCell className="w-16">No.</DataTableHeadCell>
                  <DataTableHeadCell className="w-24">이름</DataTableHeadCell>
                  <DataTableHeadCell className="w-20">성별</DataTableHeadCell>
                  <DataTableHeadCell className="w-40">생년월일</DataTableHeadCell>
                  <DataTableHeadCell className="w-40">연락처</DataTableHeadCell>
                  <DataTableHeadCell className="min-w-[120px]">지역</DataTableHeadCell>
                  <DataTableHeadCell className="min-w-[100px]">상담요청</DataTableHeadCell>
                  <DataTableHeadCell className="w-24">배정이력</DataTableHeadCell>
                </tr>
              </DataTableHead>
              <DataTableBody>
                {mockData.map((row) => (
                  <DataTableRow key={row.id}>
                    <DataTableCell className="px-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 border-border rounded"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleRow(row.id)}
                      />
                    </DataTableCell>
                    <DataTableCell className="px-4">{row.no}</DataTableCell>
                    {/* 고객명 — 클릭 시 상세 이동 예정 */}
                    <DataTableCell className="px-4 text-primary hover:underline cursor-pointer">{row.name}</DataTableCell>
                    <DataTableCell className="px-4">{row.gender}</DataTableCell>
                    <DataTableCell className="px-4">{row.birthDate} ({row.age}세)</DataTableCell>
                    <DataTableCell className="px-4">{row.phone}</DataTableCell>
                    <DataTableCell className="px-4">{row.location}</DataTableCell>
                    <DataTableCell className="px-4">
                      <div className="inline-flex flex-wrap gap-x-1">
                        <span className="whitespace-nowrap">{row.requestDate.split(' ')[0]}</span>
                        <span className="whitespace-nowrap">{row.requestDate.split(' ')[1]}</span>
                      </div>
                    </DataTableCell>
                    {/* 배정이력 확인 — 클릭 시 이력 모달 예정 */}
                    <DataTableCell className="px-4 text-primary hover:underline cursor-pointer">확인</DataTableCell>
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
