import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Database,
  Settings,
  Briefcase,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '../lib/utils';

// CSS 변수로 주입된 브랜드 어트리뷰트를 읽는다
function getBrandAttr(attr: string, fallback: string): string {
  return document.documentElement.getAttribute(attr) ?? fallback;
}

interface SidebarProps {
  className?: string;
  activePage: string;
  onPageChange: (page: string) => void;
}

export function Sidebar({ className, activePage, onPageChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border h-screen transition-all duration-300 ease-in-out shrink-0",
        "bg-white",
        isCollapsed ? "w-16 min-w-[64px] max-w-[64px]" : "w-[220px] min-w-[220px] max-w-[220px]",
        className
      )}
    >
      <div className={cn("h-14 px-4 flex items-center shrink-0", isCollapsed ? "justify-center px-2" : "justify-between")}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 shrink-0 bg-primary rounded-sm flex items-center justify-center text-white font-semibold text-[13px]">
              {getBrandAttr('data-brand-initial', 'B')}
            </div>
            <div className="overflow-hidden whitespace-nowrap">
              <h2 className="font-semibold text-text-primary text-[13px]">
                {getBrandAttr('data-brand-name', '보닥 플래너')}
              </h2>
              <p className="text-[12px] text-text-secondary">
                {getBrandAttr('data-brand-partner', 'for 흥국화재')}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="shrink-0 p-1 rounded-sm text-text-secondary hover:text-text-primary hover:bg-[#E8EAED] transition-colors"
          title={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
        <nav className="space-y-2 px-3">
          <NavItem 
            icon={<LayoutDashboard size={18} />} 
            label="홈 대시보드" 
            active={activePage === '홈 대시보드'} 
            isCollapsed={isCollapsed} 
            onClick={() => onPageChange('홈 대시보드')}
          />
          
          <NavGroup
            icon={<Users size={18} />} label="배정 고객 관리" isCollapsed={isCollapsed} defaultExpanded
            active={['상담 진행 고객', '계약 예정 고객', '상담 종료 고객'].includes(activePage)}
            onCollapsedClick={() => onPageChange('상담 진행 고객')}
          >
            <SubNavItem label="상담 진행 고객" isCollapsed={isCollapsed} active={activePage === '상담 진행 고객'} onClick={() => onPageChange('상담 진행 고객')} />
            <SubNavItem label="계약 예정 고객" isCollapsed={isCollapsed} active={activePage === '계약 예정 고객'} onClick={() => onPageChange('계약 예정 고객')} />
            <SubNavItem label="상담 종료 고객" isCollapsed={isCollapsed} active={activePage === '상담 종료 고객'} onClick={() => onPageChange('상담 종료 고객')} />
          </NavGroup>

          <NavGroup
            icon={<Database size={18} />} label="DB 배정 관리" isCollapsed={isCollapsed}
            active={['배정 완료 DB', '미배정 DB', 'DB 분배 현황'].includes(activePage)}
            onCollapsedClick={() => onPageChange('배정 완료 DB')}
          >
            <SubNavItem label="배정 완료 DB" isCollapsed={isCollapsed} active={activePage === '배정 완료 DB'} onClick={() => onPageChange('배정 완료 DB')} />
            <SubNavItem label="미배정 DB" isCollapsed={isCollapsed} active={activePage === '미배정 DB'} onClick={() => onPageChange('미배정 DB')} />
            <SubNavItem label="DB 분배 현황" isCollapsed={isCollapsed} active={activePage === 'DB 분배 현황'} onClick={() => onPageChange('DB 분배 현황')} />
          </NavGroup>

          <NavGroup
            icon={<Settings size={18} />} label="배정 설정 관리" isCollapsed={isCollapsed}
            active={['재배정 타입 설정', '자동 회수 설정', '자동 배정 설정'].includes(activePage)}
            onCollapsedClick={() => onPageChange('재배정 타입 설정')}
          >
            <SubNavItem label="재배정 타입 설정" isCollapsed={isCollapsed} active={activePage === '재배정 타입 설정'} onClick={() => onPageChange('재배정 타입 설정')} />
            <SubNavItem label="자동 회수 설정" isCollapsed={isCollapsed} active={activePage === '자동 회수 설정'} onClick={() => onPageChange('자동 회수 설정')} />
            <SubNavItem label="자동 배정 설정" isCollapsed={isCollapsed} active={activePage === '자동 배정 설정'} onClick={() => onPageChange('자동 배정 설정')} />
          </NavGroup>

          <NavGroup
            icon={<Briefcase size={18} />} label="직원/설계사 관리" isCollapsed={isCollapsed}
            active={['운영/관리자', '설계사'].includes(activePage)}
            onCollapsedClick={() => onPageChange('운영/관리자')}
          >
            <SubNavItem label="운영/관리자" isCollapsed={isCollapsed} active={activePage === '운영/관리자'} onClick={() => onPageChange('운영/관리자')} />
            <SubNavItem label="설계사" isCollapsed={isCollapsed} active={activePage === '설계사'} onClick={() => onPageChange('설계사')} />
          </NavGroup>

          <NavGroup
            icon={<Network size={18} />} label="조직 및 관리 체계" isCollapsed={isCollapsed}
            active={['직책·권한 설정', '조직 구조 설정'].includes(activePage)}
            onCollapsedClick={() => onPageChange('직책·권한 설정')}
          >
            <SubNavItem label="직책·권한 설정" isCollapsed={isCollapsed} active={activePage === '직책·권한 설정'} onClick={() => onPageChange('직책·권한 설정')} />
            <SubNavItem label="조직 구조 설정" isCollapsed={isCollapsed} active={activePage === '조직 구조 설정'} onClick={() => onPageChange('조직 구조 설정')} />
          </NavGroup>
        </nav>
      </div>

    </aside>
  );
}

function NavItem({ icon, label, active, isCollapsed, onClick }: { icon: React.ReactNode; label: string; active?: boolean; isCollapsed?: boolean; onClick?: () => void }) {
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick?.(); }}
      title={isCollapsed ? label : undefined}
      className={cn(
        "flex items-center gap-3 py-2.5 rounded-md text-sm transition-colors",
        active
          ? "bg-primary/10 text-primary font-semibold"
          : "font-medium text-text-secondary hover:bg-primary/5 hover:text-primary",
        isCollapsed ? "justify-center px-0" : "px-3"
      )}
    >
      <div className="shrink-0">{icon}</div>
      {!isCollapsed && <span className="truncate">{label}</span>}
    </a>
  );
}

function NavGroup({ icon, label, children, isCollapsed, defaultExpanded = false, active, onCollapsedClick }: { icon: React.ReactNode; label: string; children: React.ReactNode; isCollapsed?: boolean; defaultExpanded?: boolean; active?: boolean; onCollapsedClick?: () => void }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="flex flex-col">
      <button
        onClick={() => {
          if (isCollapsed) {
            onCollapsedClick?.();
          } else {
            setIsExpanded(!isExpanded);
          }
        }}
        title={isCollapsed ? label : undefined}
        className={cn(
          "flex items-center py-2.5 rounded-md text-sm transition-colors",
          isCollapsed && active
            ? "bg-primary/10 text-primary font-semibold"
            : "font-medium text-text-secondary hover:bg-primary/5 hover:text-primary",
          isCollapsed ? "justify-center px-0" : "px-3 justify-between"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="shrink-0">{icon}</div>
          {!isCollapsed && <span className="truncate">{label}</span>}
        </div>
        {!isCollapsed && (
          <div className="shrink-0 text-text-secondary">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        )}
      </button>
      {!isCollapsed && isExpanded && (
        <div className="flex flex-col mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}

function SubNavItem({ label, isCollapsed, active, onClick }: { label: string; isCollapsed?: boolean; active?: boolean; onClick?: () => void }) {
  if (isCollapsed) return null;
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick?.(); }}
      className={cn(
        "flex items-center pl-10 pr-3 py-2 rounded-md text-sm transition-colors",
        active
          ? "bg-primary/10 text-primary font-semibold"
          : "text-text-secondary hover:bg-primary/5 hover:text-primary"
      )}
    >
      <span className="truncate">{label}</span>
    </a>
  );
}
