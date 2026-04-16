import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from 'lucide-react';

interface DBDistributionStatusProps {
  onNavigateToDetail: (period: string, status: string) => void;
}

import { Footer } from './Footer';

export function DBDistributionStatus({ onNavigateToDetail }: DBDistributionStatusProps) {
  const data = [
    { no: 10, period: '2026.01.01~2026.01.31', contractSupply: '1,100건', actualSupply: '1,100건', withdrawal: '1,100건', status: '진행 예정' },
    { no: 9, period: '2026.01.01~2026.01.31', contractSupply: '1,100건', actualSupply: '1,100건', withdrawal: '-', status: '진행중' },
    { no: 8, period: '2026.01.01~2026.01.31', contractSupply: '1,100건', actualSupply: '1,100건', withdrawal: '-', status: '종료' },
    { no: 7, period: '2026.01.01~2026.01.31', contractSupply: '1,100건', actualSupply: '1,100건', withdrawal: '-', status: '종료' },
    { no: 6, period: '2026.01.01~2026.01.31', contractSupply: '1,100건', actualSupply: '1,100건', withdrawal: '50건', status: '종료' },
    { no: 5, period: '2026.01.01~2026.01.31', contractSupply: '1,100건', actualSupply: '1,100건', withdrawal: '-', status: '종료' },
    { no: 4, period: '2026.01.01~2026.01.31', contractSupply: '1,100건', actualSupply: '1,100건', withdrawal: '-', status: '종료' },
    { no: 3, period: '2026.01.01~2026.01.31', contractSupply: '1,100건', actualSupply: '1,100건', withdrawal: '-', status: '종료' },
    { no: 2, period: '2026.01.01~2026.01.31', contractSupply: '1,100건', actualSupply: '1,100건', withdrawal: '-', status: '종료' },
    { no: 1, period: '2026.01.01~2026.01.31', contractSupply: '1,100건', actualSupply: '1,100건', withdrawal: '-', status: '종료' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-bg overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col pb-5">
        <div className="px-[30px] pt-8">
        <div>
          
          {/* Table Header Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-700">총 10개</div>
            <div className="relative">
              <select className="appearance-none border border-gray-300 rounded-sm pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:border-gray-900 bg-white">
                <option>10개</option>
                <option>20개</option>
                <option>50개</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <table className="w-full text-[14px] text-center table-fixed">
              <thead className="sticky top-0 z-10 [&>tr>th]:border-b [&>tr>th]:border-gray-100">
                <tr>
                  <th className="py-3.5 px-3 font-semibold text-text-primary text-[13px] bg-white w-20">No.</th>
                  <th className="py-3.5 px-3 font-semibold text-text-primary text-[13px] bg-white" style={{ width: 'calc((100% - 13rem) * 3 / 9)' }}>기간</th>
                  <th className="py-3.5 px-3 font-semibold text-text-primary text-[13px] bg-white" style={{ width: 'calc((100% - 13rem) * 2 / 9)' }}>계약 공급 수량</th>
                  <th className="py-3.5 px-3 font-semibold text-text-primary text-[13px] bg-white" style={{ width: 'calc((100% - 13rem) * 2 / 9)' }}>실 공급 수량</th>
                  <th className="py-3.5 px-3 font-semibold text-text-primary text-[13px] bg-white" style={{ width: 'calc((100% - 13rem) * 2 / 9)' }}>철회 수량</th>
                  <th className="py-3.5 px-3 font-semibold text-text-primary text-[13px] bg-white w-32">상태</th>
                </tr>
              </thead>
              <tbody className="[&>tr:nth-child(odd)]:bg-[#FAFBFC]">
                {data.map((row, index) => (
                  <tr key={index} className="hover:!bg-[#ECEEF1] transition-colors">
                    <td className="py-3.5 px-3 text-text-primary">{row.no}</td>
                    <td className="py-3.5 px-3">
                      <button
                        className="text-primary hover:underline"
                        onClick={() => onNavigateToDetail(row.period, row.status)}
                      >
                        {row.period}
                      </button>
                    </td>
                    <td className="py-3.5 px-3 text-text-primary">{row.contractSupply}</td>
                    <td className="py-3.5 px-3 text-text-primary">{row.actualSupply}</td>
                    <td className="py-3.5 px-3 text-text-primary">{row.withdrawal}</td>
                    <td className="py-3.5 px-3 text-text-primary">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-8">
            <button className="p-1 text-gray-400 hover:text-gray-900"><ChevronsLeft size={16} /></button>
            <button className="p-1 text-gray-400 hover:text-gray-900"><ChevronLeft size={16} /></button>
            <div className="flex gap-1 mx-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((page) => (
                <button 
                  key={page} 
                  className={`w-8 h-8 flex items-center justify-center text-sm ${page === 1 ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-900"><ChevronRight size={16} /></button>
            <button className="p-1 text-gray-400 hover:text-gray-900"><ChevronsRight size={16} /></button>
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
