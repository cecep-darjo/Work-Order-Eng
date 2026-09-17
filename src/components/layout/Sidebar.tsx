import {
  LayoutDashboard,
  ClipboardList,
  FilePlus2,
  UserCheck,
  CalendarDays,
  AlertTriangle,
  Clock,
  FileBarChart,
  Database,
  Settings,
  Settings2,
  X,
} from 'lucide-react';
import type { PageKey } from '@/App';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
  open: boolean;
  onClose: () => void;
  currentRole?: string;
}

const NAV_ITEMS: { key: PageKey; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'work-orders', label: 'Work Order', icon: ClipboardList },
  { key: 'new-wo', label: 'New WO', icon: FilePlus2 },
  { key: 'my-work', label: 'My Work', icon: UserCheck },
  { key: 'daily-progress', label: 'Daily Progress', icon: CalendarDays },
  { key: 'pending', label: 'Pending', icon: AlertTriangle },
  { key: 'aging', label: 'Aging', icon: Clock },
  { key: 'report', label: 'Report', icon: FileBarChart },
  { key: 'master-data', label: 'Master Data', icon: Database },
  { key: 'settings', label: 'Pengaturan', icon: Settings, adminOnly: true },
];

export function Sidebar({ currentPage, onNavigate, open, onClose, currentRole }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo / Brand */}
        <div className="flex items-center justify-between gap-3 px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20">
              <Settings2 className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white leading-tight">PT. Interbat</p>
              <p className="text-[11px] text-slate-400 leading-tight">WO Management System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            // Tampilkan menu settings hanya untuk admin
            if (item.adminOnly && currentRole !== 'Admin') {
              return null;
            }

            const Icon = item.icon;
            const active = currentPage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform',
                    active ? '' : 'group-hover:scale-110'
                  )}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 px-5 py-4">
          <p className="text-[11px] text-slate-500">Engineering Department</p>
          <p className="text-[11px] text-slate-600">v1.0 &middot; 2026</p>
        </div>
      </aside>
    </>
  );
}
