import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Footer } from './Footer';

interface DBDistributionDetailProps {
  period: string;
  status: string;
  onBack: () => void;
}

export function DBDistributionDetail({ period, status, onBack }: DBDistributionDetailProps) {
  const [activeTab, setActiveTab] = useState<'설계사 별 수량' | '권역별 수량'>('설계사 별 수량');

  // Dummy data for the tree
  const treeData = [
    {
      name: '흥국화재',
      count: '1,100건',
      isOpen: true,
      children: [
        {
          name: '본사 사업단',
          count: '500건',
          isOpen: true,
          children: [
            {
              name: 'A 지점',
              count: '300건',
              isOpen: true,
              children: [
                { name: 'A 팀', count: '100건', isSelected: true },
                { name: 'B 팀', count: '100건' },
                { name: 'C 팀', count: '100건' },
              ]
            },
            {
              name: 'B 지점',
              count: '200건',
              isOpen: true,
              children: [
                { name: '1 팀', count: '100건' },
                { name: '2 팀', count: '100건' },
              ]
            }
          ]
        },
        {
          name: '강남 사업단',
          count: '200건',
          isOpen: true,
          children: [
            { name: 'A 팀', count: '100건' },
            { name: 'B 팀', count: '100건' },
          ]
        },
        {
          name: '서초 지점',
          count: '200건',
          isOpen: true,
          children: [
            { name: 'A 팀', count: '100건' },
            { name: 'B 팀', count: '100건' },
          ]
        },
        { name: '선릉 1팀', count: '100건' },
        { name: '선릉 2팀', count: '100건' },
      ]
    }
  ];

  // Dummy data for the table
  const tableData = Array(10).fill(null).map((_, i) => ({
    no: 10 - i,
    name: '이민혁',
    id: 'kris',
    phone: '010-1111-1111',
    department: '본사 > 사업단 1 > 지점 1 > 팀 1',
    actualSupply: '10건'
  }));

  // Dummy data for region table
  const regionData = [
    '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', 
    '경기', '충북', '충남', '전북', '전남', '경북', '경남', '강원', '제주'
  ].map(region => ({
    region,
    totalSupply: '10건',
    actualSupply: '10건',
    unassigned: '10건'
  }));

  const renderTree = (nodes: any[], level = 0) => {
    return nodes.map((node, index) => {
      const hasChildren = node.children && node.children.length > 0;
      return (
      <div key={index} className="w-full min-w-max">
        <div 
          className={cn(
            "flex items-center py-2 px-4 cursor-pointer transition-colors group",
            node.isSelected ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-900"
          )}
        >
          <div 
            className="flex items-center flex-1"
            style={{ paddingLeft: `${level === 0 ? 0 : level * 16}px` }}
          >
            <span className={cn("text-sm font-medium", level === 0 && "font-semibold")}>
              {node.name}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={cn("text-sm", node.isSelected ? "text-blue-600" : "text-gray-600")}>
              {node.count}
            </span>
            <div className="flex items-center justify-end w-8">
              {hasChildren && (
                <button 
                  className={cn("p-1 rounded-sm hover:bg-gray-200/50", node.isSelected && "hover:bg-blue-100")}
                >
                  {node.isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}
            </div>
          </div>
        </div>
        {hasChildren && node.isOpen && (
          <div className="flex flex-col">
            {renderTree(node.children, level + 1)}
          </div>
        )}
      </div>
    )});
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col pb-5">
        <div className="px-8 pt-8">
        <div className="max-w-7xl mx-auto flex flex-col">
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {period} ({status})
          </h2>

          {/* Tabs */}
          <div className="flex border-b border-gray-300 mb-6">
            <button 
              className={cn(
                "px-12 py-3 text-sm font-semibold border-b-2 transition-colors",
                activeTab === '설계사 별 수량' ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-900"
              )}
              onClick={() => setActiveTab('설계사 별 수량')}
            >
              설계사 별 수량
            </button>
            <button 
              className={cn(
                "px-12 py-3 text-sm font-semibold border-b-2 transition-colors",
                activeTab === '권역별 수량' ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-900"
              )}
              onClick={() => setActiveTab('권역별 수량')}
            >
              권역별 수량
            </button>
          </div>

          <div className="flex gap-6 items-start">
            {/* Left Panel - Tree */}
            <div className="w-[300px] border border-gray-300 bg-white shrink-0 py-2 overflow-x-auto">
              {renderTree(treeData)}
            </div>

            {/* Right Panel - Content */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Summary Box */}
              <div className="bg-gray-50 border border-gray-200 py-6 px-8 flex justify-center gap-16 mb-6 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                  <span className="text-base font-semibold text-gray-900">총 공급 수량 : 1,100건</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                  <span className="text-base font-semibold text-gray-900">총 배정 수량 : 1,100건</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                  <span className="text-base font-semibold text-gray-900">미배정 수량 : 20건</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 shrink-0">
                <div className="w-1 h-1 bg-black rounded-full"></div>
                <h3 className="text-base font-semibold text-gray-900">
                  {activeTab === '설계사 별 수량' ? '설계사별 배정 수량' : '권역별 배정 수량'}
                </h3>
              </div>

              {/* Table */}
              <div className="border border-gray-300 bg-white">
                {activeTab === '설계사 별 수량' ? (
                  <table className="w-full text-sm text-center">
                    <thead className="bg-gray-50 border-b border-gray-300 sticky top-0">
                      <tr>
                        <th className="py-3 font-semibold text-gray-900 w-16">No.</th>
                        <th className="py-3 font-semibold text-gray-900 w-24">이름</th>
                        <th className="py-3 font-semibold text-gray-900 w-24">아이디</th>
                        <th className="py-3 font-semibold text-gray-900 w-36">휴대폰번호</th>
                        <th className="py-3 font-semibold text-gray-900">소속</th>
                        <th className="py-3 font-semibold text-gray-900 w-32">실 배정 수량</th>
                      </tr>
                    </thead>
                    {/* 행 구분선 제거, 홀수 행 옅은 회색 줄무늬, hover로 강조 — 다른 테이블과 통일 */}
                    <tbody className="[&>tr:nth-child(odd)]:bg-[#FAFBFC]">
                      {tableData.map((row, index) => (
                        <tr key={index} className="hover:!bg-[#F3F4F6] transition-colors">
                          <td className="py-3 text-gray-700">{row.no}</td>
                          <td className="py-3 text-gray-700">{row.name}</td>
                          <td className="py-3 text-gray-700">{row.id}</td>
                          <td className="py-3 text-gray-700">{row.phone}</td>
                          <td className="py-3 text-gray-700">{row.department}</td>
                          <td className="py-3 text-gray-700">{row.actualSupply}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-sm text-center">
                    <thead className="bg-gray-50 border-b border-gray-300 sticky top-0">
                      <tr>
                        <th className="py-3 font-semibold text-gray-900 w-32">권역</th>
                        <th className="py-3 font-semibold text-gray-900">총 공급 수량</th>
                        <th className="py-3 font-semibold text-gray-900">실 배정 수량</th>
                        <th className="py-3 font-semibold text-gray-900">미배정 수량</th>
                      </tr>
                    </thead>
                    {/* 행 구분선 제거, 홀수 행 옅은 회색 줄무늬, hover로 강조 — 다른 테이블과 통일 */}
                    <tbody className="[&>tr:nth-child(odd)]:bg-[#FAFBFC]">
                      {regionData.map((row, index) => (
                        <tr key={index} className="hover:!bg-[#F3F4F6] transition-colors">
                          <td className="py-3 text-gray-700">{row.region}</td>
                          <td className="py-3 text-gray-700">{row.totalSupply}</td>
                          <td className="py-3 text-gray-700">{row.actualSupply}</td>
                          <td className="py-3 text-gray-700">{row.unassigned}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end pt-6 mt-6 shrink-0">
            <Button variant="ghost" size="lg" onClick={onBack}>목록</Button>
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
