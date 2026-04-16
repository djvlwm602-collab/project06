import React, { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Footer } from './Footer';

interface RolePermissionFormProps {
  onBack: () => void;
}

export function RolePermissionForm({ onBack }: RolePermissionFormProps) {
  const [roleName, setRoleName] = useState('최고관리자');
  const [permissionType, setPermissionType] = useState<'admin' | 'planner'>('admin');
  const [isUsed, setIsUsed] = useState(true);

  // Menu permissions state
  const [menuPermissions, setMenuPermissions] = useState({
    customerManagement: {
      main: true,
      sub: {
        ongoing: true,
        expected: false,
        ended: true,
      }
    },
    dbManagement: {
      main: true,
      sub: {
        assigned: true,
        unassigned: false,
        distribution: false,
      }
    },
    settingManagement: {
      main: true,
      sub: {
        reassign: true,
        autoRecall: false,
      }
    },
    staffManagement: {
      main: true,
      sub: {
        admin: true,
        planner: false,
      }
    },
    orgManagement: {
      main: true,
      sub: {
        role: true,
        structure: false,
      }
    },
    envSetting: {
      main: true,
      sub: {
        myGa: true,
      }
    }
  });

  const toggleMenuPermission = (category: keyof typeof menuPermissions, type: 'main' | keyof typeof menuPermissions[keyof typeof menuPermissions]['sub']) => {
    setMenuPermissions(prev => {
      const categoryData = prev[category];
      if (type === 'main') {
        // Toggle main and all sub
        const newMainState = !categoryData.main;
        const newSub = { ...categoryData.sub };
        Object.keys(newSub).forEach(key => {
          newSub[key as keyof typeof newSub] = newMainState;
        });
        return {
          ...prev,
          [category]: {
            main: newMainState,
            sub: newSub
          }
        };
      } else {
        // Toggle sub
        const newSub = {
          ...categoryData.sub,
          [type]: !categoryData.sub[type as keyof typeof categoryData.sub]
        };
        // Update main if any sub is checked
        const newMainState = Object.values(newSub).some(val => val);
        return {
          ...prev,
          [category]: {
            main: newMainState,
            sub: newSub
          }
        };
      }
    });
  };

  const Checkbox = ({ checked, onChange, label }: { checked: boolean, onChange: () => void, label: string }) => (
    <div 
      className="flex items-center gap-2 cursor-pointer select-none"
      onClick={onChange}
    >
      {checked ? (
        <CheckSquare size={18} className="text-black" />
      ) : (
        <Square size={18} className="text-gray-400" />
      )}
      <span className="text-sm text-gray-900">{label}</span>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-bg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
        <div className="flex items-end gap-4">
          <h1 className="text-[19px] font-semibold text-gray-900 tracking-tight">직책·권한 설정</h1>
          <span className="text-sm text-gray-500 mb-0.5">조직을 담당하는 직책 및 메뉴 권한을 부여합니다.</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col pb-5">
        <div className="px-[30px] pt-8">
        <div className="w-full flex flex-col gap-10">
          
          {/* 직책/직급명 */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-black"></span>
              직책/직급명
            </h2>
            <div className="border border-gray-300 p-6 bg-gray-50/30">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  className="w-64 px-3 py-1.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-gray-900 bg-white"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                />
                <Button variant="primary" size="sm">중복체크</Button>
              </div>
            </div>
          </div>

          {/* 업무 권한 */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-black"></span>
              업무 권한
            </h2>
            <div className="border border-gray-300 p-6 bg-gray-50/30 flex items-center gap-10">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="permissionType" 
                  className="w-4 h-4 text-black focus:ring-black border-gray-300"
                  checked={permissionType === 'admin'}
                  onChange={() => setPermissionType('admin')}
                />
                <span className="text-sm text-gray-900">운영/관리자</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="permissionType" 
                  className="w-4 h-4 text-black focus:ring-black border-gray-300"
                  checked={permissionType === 'planner'}
                  onChange={() => setPermissionType('planner')}
                />
                <span className="text-sm text-gray-900">설계사</span>
              </label>
            </div>
          </div>

          {/* 메뉴 권한 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-black"></span>
                메뉴 권한
              </h2>
              <span className="text-xs text-gray-500">체크되지 않은 메뉴는, 해당 직책/직급자에게 보이지 않습니다.</span>
            </div>
            
            <div className="border border-gray-300">
              {/* 홈 대시보드 */}
              <div className="flex border-b border-gray-200">
                <div className="w-[200px] bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-900 border-r border-gray-200 flex items-center">
                  홈 대시보드
                </div>
                <div className="flex-1 px-6 py-4 bg-white"></div>
              </div>

              {permissionType === 'admin' ? (
                <>
                  {/* 배정 고객 관리 */}
                  <div className="flex border-b border-gray-200">
                    <div className="w-[200px] bg-gray-50 px-6 py-4 border-r border-gray-200 flex items-center">
                      <Checkbox 
                        checked={menuPermissions.customerManagement.main} 
                        onChange={() => toggleMenuPermission('customerManagement', 'main')} 
                        label="배정 고객 관리" 
                      />
                    </div>
                    <div className="flex-1 px-6 py-4 bg-white flex items-center gap-12">
                      <Checkbox 
                        checked={menuPermissions.customerManagement.sub.ongoing} 
                        onChange={() => toggleMenuPermission('customerManagement', 'ongoing')} 
                        label="상담 진행 고객" 
                      />
                      <Checkbox 
                        checked={menuPermissions.customerManagement.sub.expected} 
                        onChange={() => toggleMenuPermission('customerManagement', 'expected')} 
                        label="계약 예정 고객" 
                      />
                      <Checkbox 
                        checked={menuPermissions.customerManagement.sub.ended} 
                        onChange={() => toggleMenuPermission('customerManagement', 'ended')} 
                        label="상담 종료 고객" 
                      />
                    </div>
                  </div>

                  {/* DB 배정 관리 */}
                  <div className="flex border-b border-gray-200">
                    <div className="w-[200px] bg-gray-50 px-6 py-4 border-r border-gray-200 flex items-center">
                      <Checkbox 
                        checked={menuPermissions.dbManagement.main} 
                        onChange={() => toggleMenuPermission('dbManagement', 'main')} 
                        label="DB 배정 관리" 
                      />
                    </div>
                    <div className="flex-1 px-6 py-4 bg-white flex items-center gap-12">
                      <Checkbox 
                        checked={menuPermissions.dbManagement.sub.assigned} 
                        onChange={() => toggleMenuPermission('dbManagement', 'assigned')} 
                        label="배정 완료 DB" 
                      />
                      <Checkbox 
                        checked={menuPermissions.dbManagement.sub.unassigned} 
                        onChange={() => toggleMenuPermission('dbManagement', 'unassigned')} 
                        label="미배정 DB" 
                      />
                      <Checkbox 
                        checked={menuPermissions.dbManagement.sub.distribution} 
                        onChange={() => toggleMenuPermission('dbManagement', 'distribution')} 
                        label="DB 분배 현황" 
                      />
                    </div>
                  </div>

                  {/* 배정 설정 관리 */}
                  <div className="flex border-b border-gray-200">
                    <div className="w-[200px] bg-gray-50 px-6 py-4 border-r border-gray-200 flex items-center">
                      <Checkbox 
                        checked={menuPermissions.settingManagement.main} 
                        onChange={() => toggleMenuPermission('settingManagement', 'main')} 
                        label="배정 설정 관리" 
                      />
                    </div>
                    <div className="flex-1 px-6 py-4 bg-white flex items-center gap-12">
                      <Checkbox 
                        checked={menuPermissions.settingManagement.sub.reassign} 
                        onChange={() => toggleMenuPermission('settingManagement', 'reassign')} 
                        label="재배정 타입 설정" 
                      />
                      <Checkbox 
                        checked={menuPermissions.settingManagement.sub.autoRecall} 
                        onChange={() => toggleMenuPermission('settingManagement', 'autoRecall')} 
                        label="자동 회수 설정" 
                      />
                    </div>
                  </div>

                  {/* 직원/설계사 관리 */}
                  <div className="flex border-b border-gray-200">
                    <div className="w-[200px] bg-gray-50 px-6 py-4 border-r border-gray-200 flex items-center">
                      <Checkbox 
                        checked={menuPermissions.staffManagement.main} 
                        onChange={() => toggleMenuPermission('staffManagement', 'main')} 
                        label="직원/설계사 관리" 
                      />
                    </div>
                    <div className="flex-1 px-6 py-4 bg-white flex items-center gap-12">
                      <Checkbox 
                        checked={menuPermissions.staffManagement.sub.admin} 
                        onChange={() => toggleMenuPermission('staffManagement', 'admin')} 
                        label="운영/관리자" 
                      />
                      <Checkbox 
                        checked={menuPermissions.staffManagement.sub.planner} 
                        onChange={() => toggleMenuPermission('staffManagement', 'planner')} 
                        label="설계사" 
                      />
                    </div>
                  </div>

                  {/* 조직 및 관리 체계 */}
                  <div className="flex border-b border-gray-200">
                    <div className="w-[200px] bg-gray-50 px-6 py-4 border-r border-gray-200 flex items-center">
                      <Checkbox 
                        checked={menuPermissions.orgManagement.main} 
                        onChange={() => toggleMenuPermission('orgManagement', 'main')} 
                        label="조직 및 관리 체계" 
                      />
                    </div>
                    <div className="flex-1 px-6 py-4 bg-white flex items-center gap-12">
                      <Checkbox 
                        checked={menuPermissions.orgManagement.sub.role} 
                        onChange={() => toggleMenuPermission('orgManagement', 'role')} 
                        label="직책·권한 설정" 
                      />
                      <Checkbox 
                        checked={menuPermissions.orgManagement.sub.structure} 
                        onChange={() => toggleMenuPermission('orgManagement', 'structure')} 
                        label="조직 구조 설정" 
                      />
                    </div>
                  </div>

                  {/* 환경 설정 */}
                  <div className="flex">
                    <div className="w-[200px] bg-gray-50 px-6 py-4 border-r border-gray-200 flex items-center">
                      <Checkbox 
                        checked={menuPermissions.envSetting.main} 
                        onChange={() => toggleMenuPermission('envSetting', 'main')} 
                        label="환경 설정" 
                      />
                    </div>
                    <div className="flex-1 px-6 py-4 bg-white flex items-center gap-12">
                      <Checkbox 
                        checked={menuPermissions.envSetting.sub.myGa} 
                        onChange={() => toggleMenuPermission('envSetting', 'myGa')} 
                        label="마이 GA 사용 설정" 
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* 설계사 권한일 때 메뉴 */
                <div className="flex">
                  <div className="w-[200px] bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-900 border-r border-gray-200 flex items-center">
                    배정 고객 관리
                  </div>
                  <div className="flex-1 px-6 py-4 bg-white flex items-center gap-12">
                    <span className="text-sm text-gray-900">상담 진행 고객</span>
                    <span className="text-sm text-gray-900">계약 예정 고객</span>
                    <span className="text-sm text-gray-900">상담 종료 고객</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 사용여부 */}
          <div className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-black"></span>
              사용여부
            </h2>
            <div className="border border-gray-300 p-6 bg-gray-50/30 flex items-center gap-10">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="isUsed" 
                  className="w-4 h-4 text-black focus:ring-black border-gray-300"
                  checked={isUsed === true}
                  onChange={() => setIsUsed(true)}
                />
                <span className="text-sm text-gray-900">사용함</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="isUsed" 
                  className="w-4 h-4 text-black focus:ring-black border-gray-300"
                  checked={isUsed === false}
                  onChange={() => setIsUsed(false)}
                />
                <span className="text-sm text-gray-900">사용안함</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between pt-6 border-t border-border mt-4 mb-8">
            <Button variant="danger" size="lg">삭제</Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="lg" onClick={onBack}>취소</Button>
              <Button variant="primary" size="lg">확인</Button>
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
