import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { WorkOrder, Employee, Role, WOStatus } from '@/types';
import { Card } from '@/components/Card';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import { WO_STATUSES } from '@/lib/constants';
import { formatDate, getWOAge, getCurrentProgress, isUpdatedToday, cn, getAgeColor } from '@/lib/utils';
import { ClipboardList, Eye, User, Loader, CalendarCheck, CalendarX } from 'lucide-react';

interface MyWorkProps {
  currentEmployee: Employee | null;
  currentRole: Role;
  loggedInUsername: string;
}

export function MyWork({ currentEmployee, currentRole, loggedInUsername }: MyWorkProps) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'assigned' | 'pic' | 'all'>('assigned');

  const fetchData = useCallback(async () => {
    const { data } = await supabase
      .from('work_orders')
      .select('*, department:departments(*), equipment:equipment(*), daily_progress(*), pending_logs(*)')
      .order('created_at', { ascending: false });
    if (data) setWorkOrders(data as WorkOrder[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isTechnician = currentRole === 'Technician';
  const myWOs = workOrders.filter((wo) => {
    if (isTechnician) {
      return wo.technician_username === loggedInUsername;
    }
    if (tab === 'assigned') return wo.technician_username === loggedInUsername || wo.pic_username === loggedInUsername;
    if (tab === 'pic') return wo.pic_username === loggedInUsername;
    return wo.technician_username === loggedInUsername || wo.pic_username === loggedInUsername;
  });

  const myActive = myWOs.filter((w) => w.status !== 'CLOSED' && w.status !== 'COMPLETED');
  const myCompleted = myWOs.filter((w) => w.status === 'COMPLETED' || w.status === 'CLOSED');

  const inProgress = myWOs.filter((w) => w.status === 'IN PROGRESS');
  const updatedToday = inProgress.filter(isUpdatedToday);
  const notUpdatedToday = inProgress.filter((w) => !isUpdatedToday(w));

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* User info */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-lg font-bold text-white">
          {currentEmployee?.name?.charAt(0) || 'U'}
        </div>
        <div>
          <h2 className="font-bold text-slate-800">{currentEmployee?.name}</h2>
          <p className="text-sm text-slate-500">
            {currentEmployee?.role} {currentEmployee?.department?.name ? `· ${currentEmployee.department.name}` : ''}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Total WO Saya" value={myWOs.length} icon={ClipboardList} color="blue" />
        <SummaryCard label="Aktif" value={myActive.length} icon={Loader} color="amber" />
        <SummaryCard label="Updated Today" value={updatedToday.length} icon={CalendarCheck} color="emerald" />
        <SummaryCard label="Belum Update" value={notUpdatedToday.length} icon={CalendarX} color="orange" />
      </div>

      {/* Tabs */}
      {!isTechnician && (
        <div className="flex gap-1 border-b border-slate-200">
          {([
            { key: 'assigned', label: 'Sebagai Teknisi' },
            { key: 'pic', label: 'Sebagai PIC' },
            { key: 'all', label: 'Semua' },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Active WOs */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Pekerjaan Aktif</h3>
        <div className="space-y-3">
          {myActive.length === 0 ? (
            <Card className="py-12 text-center">
              <User className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">Tidak ada pekerjaan aktif</p>
            </Card>
          ) : (
            myActive.map((wo) => (
              <Card key={wo.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">{wo.wo_number}</span>
                      <PriorityBadge priority={wo.priority} />
                      <StatusBadge status={wo.status} />
                    </div>
                    <p className="mt-1.5 text-sm text-slate-600">{wo.problem_description}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                      <span>{formatDate(wo.wo_date)}</span>
                      <span>{wo.department?.name}</span>
                      <span className={cn('font-semibold', getAgeColor(getWOAge(wo)))}>{getWOAge(wo)} hari</span>
                    </div>
                  </div>
                </div>
                {wo.status === 'IN PROGRESS' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Progress: {getCurrentProgress(wo)}%</span>
                      <span className={isUpdatedToday(wo) ? 'text-emerald-600 font-medium' : 'text-orange-600 font-medium'}>
                        {isUpdatedToday(wo) ? 'Sudah update hari ini' : 'Belum update hari ini'}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                        style={{ width: `${getCurrentProgress(wo)}%` }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Completed WOs */}
      {myCompleted.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Pekerjaan Selesai</h3>
          <div className="space-y-2">
            {myCompleted.map((wo) => (
              <Card key={wo.id} className="flex items-center gap-3 p-3 opacity-75">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">{wo.wo_number}</span>
                    <StatusBadge status={wo.status} size="xs" />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-400">{wo.problem_description}</p>
                </div>
                <span className="text-xs text-slate-400">{formatDate(wo.completed_at || wo.wo_date)}</span>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: typeof ClipboardList;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', colorMap[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </Card>
  );
}
