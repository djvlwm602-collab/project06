/**
 * Role: 배정 완료 DB 관리 페이지 — 배정된 DB 조회 및 재배정 기능
 * Key Features: 조직 트리 사이드바, 필터 검색, KPI 카드, 테이블, 페이지네이션
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
import { KpiCard } from './ui/kpi-card';
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
  assignedDate: string;
  firstCallDate: string;
  recentCallDate: string;
  callAttempts: string;
  callSuccess: string;
  validCall: string;
  agentName: string;
}

const mockData: Customer[] = [
  { id: '10', no: 10, name: '이*혁', gender: '남성', birthDate: '1981.11.27', age: 40, phone: '0507-1111-1111', location: '서울특별시', assignedDate: '2026.01.01 00:00', firstCallDate: '2026.01.01 00:00', recentCallDate: '2026.01.01 00:00', callAttempts: '10회', callSuccess: '10회', validCall: '-', agentName: '김홍도' },
  { id: '9', no: 9, name: '이*혁', gender: '남성', birthDate: '1981.11.27', age: 40, phone: '0507-1111-1111', location: '서울특별시', assignedDate: '2026.01.01 00:00', firstCallDate: '-', recentCallDate: '-', callAttempts: '-', callSuccess: '-', validCall: '-', agentName: '김홍도' },
  { id: '8', no: 8, name: '이*혁', gender: '남성', birthDate: '1981.11.27', age: 40, phone: '0507-1111-1111', location: '서울특별시', assignedDate: '2026.01.01 00:00', firstCallDate: '2026.01.01 00:00', recentCallDate: '2026.01.01 00:00', callAttempts: '10회', callSuccess: '10회', validCall: '10회', agentName: '김홍도' },
  { id: '7', no: 7, name: '이*혁', gender: '남성', birthDate: '1981.11.27', age: 40, phone: '0507-1111-1111', location: '서울특별시', assignedDate: '2026.01.01 00:00', firstCallDate: '-', recentCallDate: '-', callAttempts: '-', callSuccess: '-', validCall: '-', agentName: '김홍도' },
  { id: '6', no: 6, name: '이*혁', gender: '남성', birthDate: '1981.11.27', age: 40, phone: '0507-1111-1111', location: '서울특별시', assignedDate: '2026.01.01 00:00', firstCallDate: '2026.01.01 00:00', recentCallDate: '2026.01.01 00:00', callAttempts: '10회', callSuccess: '10회', validCall: '-', agentName: '김홍도' },
  { id: '5', no: 5, name: '이*혁', gender: '남성', birthDate: '1981.11.27', age: 40, phone: '0507-1111-1111', location: '서울특별시', assignedDate: '2026.01.01 00:00', firstCallDate: '2026.01.01 00:00', recentCallDate: '2026.01.01 00:00', callAttempts: '10회', callSuccess: '10회', validCall: '-', agentName: '김홍도' },
  { id: '4', no: 4, name: '이*혁', gender: '남성', birthDate: '1981.11.27', age: 40, phone: '0507-1111-1111', location: '서울특별시', assignedDate: '2026.01.01 00:00', firstCallDate: '2026.01.01 00:00', recentCallDate: '2026.01.01 00:00', callAttempts: '10회', callSuccess: '10회', validCall: '10회', agentName: '김홍도' },
  { id: '3', no: 3, name: '이*혁', gender: '남성', birthDate: '1981.11.27', age: 40, phone: '0507-1111-1111', location: '서울특별시', assignedDate: '2026.01.01 00:00', firstCallDate: '-', recentCallDate: '-', callAttempts: '-', callSuccess: '-', validCall: '-', agentName: '김홍도' },
  { id: '2', no: 2, name: '이*혁', gender: '남성', birthDate: '1981.11.27', age: 40, phone: '0507-1111-1111', location: '서울특별시', assignedDate: '2026.01.01 00:00', firstCallDate: '2026.01.01 00:00', recentCallDate: '2026.01.01 00:00', callAttempts: '10회', callSuccess: '10회', validCall: '10회', agentName: '김홍도' },
  { id: '1', no: 1, name: '이*혁', gender: '남성', birthDate: '1981.11.27', age: 40, phone: '0507-1111-1111', location: '서울특별시', assignedDate: '2026.01.01 00:00', firstCallDate: '2026.01.01 00:00', recentCallDate: '2026.01.01 00:00', callAttempts: '10회', callSuccess: '10회', validCall: '10회', agentName: '김홍도' },
];

const regions = ['전체', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전남', '전북', '경북', '경남', '제주'];

export function AssignedDB() {
  const [selectedAgent, setSelectedAgent] = useState('홍길동');
  const [customerName, setCustomerName] = useState('');
  const [noValidCall, setNoValidCall] = useState(false);
  const [noCallAttempt, setNoCallAttempt] = useState(false);
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
    setSelectedAgent('홍길동');
    setNoValidCall(false);
    setNoCallAttempt(false);
    setSelectedRegions([]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg overflow-hidden">
      <PageLayout showSidebar>
        {/* 우측 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col overflow-hidden bg-bg">
          <div className="flex-1 overflow-y-auto">
          <div className="min-h-full flex flex-col pb-5">
          {/* KPI 카드 영역 — 임시 숨김 (필요 시 복원) */}
          {/* <div className="px-6 pt-6 pb-4">
            <div className="grid grid-cols-5 gap-4">
              <KpiCard title="총 배정 DB" value="33건" trend="+12%" isPositive={true} />
              <KpiCard title="통화 시도" value="30건" trend="+5%" isPositive={true} />
              <KpiCard title="통화 미시도" value="3건" trend="-2%" isPositive={true} />
              <KpiCard title="평균 성공율" value="25.8%" trend="+1.4%" isPositive={true} />
              <KpiCard title="평균 유효통화율" value="40.5%" trend="-0.5%" isPositive={false} />
            </div>
          </div> */}

          {/* 검색 필터 영역 */}
          <FilterBox onSearch={() => {}} onReset={handleReset}>
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
              label="통화 상태"
              options={[
                { value: '전체', label: '전체' },
                { value: '유효통화 없음', label: '유효통화 없음' },
                { value: '통화 미시도', label: '통화 미시도' },
              ]}
              values={
                [
                  ...(noValidCall ? ['유효통화 없음'] : []),
                  ...(noCallAttempt ? ['통화 미시도'] : []),
                ].length === 0 ? ['전체'] : [
                  ...(noValidCall ? ['유효통화 없음'] : []),
                  ...(noCallAttempt ? ['통화 미시도'] : []),
                ]
              }
              onChangeMulti={(vals) => {
                setNoValidCall(vals.includes('유효통화 없음'));
                setNoCallAttempt(vals.includes('통화 미시도'));
              }}
              multiple
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
                  <DataTableHeadCell className="w-12">No.</DataTableHeadCell>
                  <DataTableHeadCell className="w-20">이름</DataTableHeadCell>
                  <DataTableHeadCell className="w-16">성별</DataTableHeadCell>
                  <DataTableHeadCell className="w-32">생년월일</DataTableHeadCell>
                  <DataTableHeadCell className="w-36">연락처</DataTableHeadCell>
                  <DataTableHeadCell className="w-24">지역</DataTableHeadCell>
                  <DataTableHeadCell className="w-32">배정시간</DataTableHeadCell>
                  <DataTableHeadCell className="w-32">최초통화</DataTableHeadCell>
                  <DataTableHeadCell className="w-32">최근통화</DataTableHeadCell>
                  <DataTableHeadCell className="w-20">통화시도</DataTableHeadCell>
                  <DataTableHeadCell className="w-20">통화성공</DataTableHeadCell>
                  <DataTableHeadCell className="w-20">유효통화</DataTableHeadCell>
                  <DataTableHeadCell className="w-24">담당 설계사</DataTableHeadCell>
                  <DataTableHeadCell className="w-20">배정이력</DataTableHeadCell>
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
                    <DataTableCell>{row.no}</DataTableCell>
                    {/* 고객명 — 클릭 시 상세 이동 예정 */}
                    <DataTableCell className="text-primary hover:underline cursor-pointer">{row.name}</DataTableCell>
                    <DataTableCell>{row.gender}</DataTableCell>
                    <DataTableCell>{row.birthDate} ({row.age}세)</DataTableCell>
                    <DataTableCell>{row.phone}</DataTableCell>
                    <DataTableCell>{row.location}</DataTableCell>
                    <DataTableCell>
                      <div className="flex flex-col items-center">
                        <span>{row.assignedDate.split(' ')[0]}</span>
                        <span>{row.assignedDate.split(' ')[1]}</span>
                      </div>
                    </DataTableCell>
                    <DataTableCell>
                      {row.firstCallDate !== '-' ? (
                        <div className="flex flex-col items-center">
                          <span>{row.firstCallDate.split(' ')[0]}</span>
                          <span>{row.firstCallDate.split(' ')[1]}</span>
                        </div>
                      ) : '-'}
                    </DataTableCell>
                    <DataTableCell>
                      {row.recentCallDate !== '-' ? (
                        <div className="flex flex-col items-center">
                          <span>{row.recentCallDate.split(' ')[0]}</span>
                          <span>{row.recentCallDate.split(' ')[1]}</span>
                        </div>
                      ) : '-'}
                    </DataTableCell>
                    <DataTableCell>{row.callAttempts}</DataTableCell>
                    <DataTableCell>{row.callSuccess}</DataTableCell>
                    <DataTableCell>{row.validCall}</DataTableCell>
                    <DataTableCell>{row.agentName}</DataTableCell>
                    {/* 배정이력 확인 — 클릭 시 이력 모달 예정 */}
                    <DataTableCell className="text-primary hover:underline cursor-pointer">확인</DataTableCell>
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
