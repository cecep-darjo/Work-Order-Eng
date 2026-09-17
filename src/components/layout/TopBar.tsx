import { Menu, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Employee, Role } from '@/types';
import { ROLES, ROLE_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface TopBarProps {
  role: Role;
  onRoleChange: (role: Role) => void;
  employees: Employee[];
  currentEmployee: Employee | null;
  onEmployeeChange: (emp: Employee) => void;
  onMenuClick: () => void;
  pageTitle: string;
}

export function TopBar({
  role,
  onRoleChange,
  employees,
  currentEmployee,
  onEmployeeChange,
  onMenuClick,
  pageTitle,
}: TopBarProps) {
  const [roleOpen, setRoleOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const employeesByRole = employees.filter((e) => e.role === role);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 sm:text-xl">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role selector */}
        <div ref={roleRef} className="relative">
          <button
            onClick={() => setRoleOpen(!roleOpen)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all',
              ROLE_COLORS[role],
              'hover:opacity-90'
            )}
          >
            <span className="hidden sm:inline">Role:</span>
            {role}
            <ChevronDown className="h-4 w-4" />
          </button>
          {roleOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-slate-200 bg-white py-1 shadow-xl z-40">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    onRoleChange(r);
                    setRoleOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-slate-50',
                    r === role ? 'font-semibold text-slate-800' : 'text-slate-600'
                  )}
                >
                  {r}
                  {r === role && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User selector */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white py-1.5 pl-1.5 pr-2 sm:pr-3 hover:bg-slate-50"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-bold text-white">
              {currentEmployee?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-700 leading-tight">
                {currentEmployee?.name || 'Unknown'}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">
                {currentEmployee?.department?.name || 'Engineering'}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
          {userOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-xl z-40 max-h-72 overflow-y-auto">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {role}
              </p>
              {employeesByRole.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => {
                    onEmployeeChange(emp);
                    setUserOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-slate-50',
                    emp.id === currentEmployee?.id ? 'font-semibold text-slate-800' : 'text-slate-600'
                  )}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                    {emp.name.charAt(0)}
                  </div>
                  <span className="truncate">{emp.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
