/**
 * Role: 칸반 보드 페이지 — 상담 진행 고객 관리
 * Key Features: 칸반 열 드래그앤드롭, KPI 카드, 컴팩트 칩 필터
 * Dependencies: BoardColumn, KpiCard, PageLayout, FilterBox, FilterChip, DateRangeChip
 */
import React, { useState } from 'react';
import { BoardData } from '../types';
import { BoardColumn } from './BoardColumn';
import { cn } from '../lib/utils';
import { Footer } from './Footer';
import { FilterBox } from './layout/filter-box';
import { FilterChip } from './ui/filter-chip';
import { InputChip } from './ui/input-chip';
import { DateRangeChip } from './ui/date-range-chip';
import { PageLayout } from './layout/page-layout';

interface BoardProps {
  data: BoardData;
  onMoveTask: (taskId: string, targetColumnId: string) => void;
  onCreateTask: (columnId?: string) => void;
}

export function Board({ data, onMoveTask, onCreateTask }: BoardProps) {
  const [selectedAgent, setSelectedAgent] = useState('전체');
  const [customerName, setCustomerName] = useState('');
  const [startDate, setStartDate] = useState('2024-03-10');
  const [endDate, setEndDate] = useState('2024-04-09');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const regions = ['전체', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전남', '전북', '경북', '경남', '제주'];
  const agents = ['전체', '홍길동', '김철수', '이민혁', '박지연'];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onMoveTask(taskId, columnId);
    }
  };

  // 칸반 그룹 분류
  const waitingColumns = data.columnOrder.filter(id => data.columns[id].group === '상담 대기');
  const inProgressColumns = data.columnOrder.filter(id => data.columns[id].group === '상담 중');

  const handleReset = () => {
    setSelectedAgent('전체');
    setCustomerName('');
    setSelectedRegions([]);
    setStartDate('2024-03-10');
    setEndDate('2024-04-09');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg overflow-hidden">
      <PageLayout showSidebar activeTreeId="team-a2">
        <div className="flex-1 overflow-y-auto bg-bg">
          <div className="flex flex-col min-h-full pb-5">
            <div className="flex-1 flex flex-col bg-bg">
              {/* 컴팩트 칩 필터 바 */}
              <FilterBox onSearch={() => {}} onReset={handleReset}>
                <FilterChip
                  label="담당설계사"
                  options={agents.map(a => ({ value: a, label: a }))}
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
                <DateRangeChip
                  startDate={startDate}
                  endDate={endDate}
                  onApply={(s, e) => { setStartDate(s); setEndDate(e); }}
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

              {/* 칸반 열 영역 */}
              <div className="flex-1 overflow-x-auto px-6 pb-6 bg-bg">
                <div className="flex gap-2 items-stretch h-full min-w-full">
                  {/* 상담 대기 그룹 */}
                  <div className="flex flex-col" style={{ flex: waitingColumns.length }}>
                    <h3 className="text-sm font-semibold text-text-secondary mb-3 shrink-0">
                      상담 대기
                    </h3>
                    <div className="flex gap-2 flex-1">
                      {waitingColumns.map(columnId => {
                        const column = data.columns[columnId];
                        const tasks = column.taskIds.map(taskId => data.tasks[taskId]);
                        return (
                          <BoardColumn
                            key={column.id}
                            column={column}
                            tasks={tasks}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                            onCreateTask={onCreateTask}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* 상담 중 그룹 */}
                  <div className="flex flex-col" style={{ flex: inProgressColumns.length }}>
                    <h3 className="text-sm font-semibold text-text-secondary mb-3 shrink-0">
                      상담 중
                    </h3>
                    <div className="flex gap-2 flex-1">
                      {inProgressColumns.map(columnId => {
                        const column = data.columns[columnId];
                        const tasks = column.taskIds.map(taskId => data.tasks[taskId]);
                        return (
                          <BoardColumn
                            key={column.id}
                            column={column}
                            tasks={tasks}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                            onCreateTask={onCreateTask}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          <div className="flex-1 min-h-[50px]" />
          <Footer />
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
