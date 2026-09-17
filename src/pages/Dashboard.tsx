import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { WorkOrder, Department } from '@/types';
import type { PageKey } from '@/App';
import { Card } from '@/components/Card';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import { WO_STATUSES, PRIORITIES } from '@/lib/constants';
import { formatDate, getWOAge, getPendingAge, isUpdatedToday, cn, getAgeColor } from '@/lib/utils';
import {
  ClipboardList,
  CircleDot,
  UserCheck,
  Loader,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  CalendarCheck,
  CalendarX,
  ArrowRight,
} from 'lucide-react';

interface DashboardProps {
  navigate: (page: PageKey) => void;
}

export function Dashboard({ navigate }: DashboardProps) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [woRes, deptRes] = await Promise.all([
      supabase
        .from('work_orders')
        .select('*, department:departments(*), pic:employees(*), technician:employees(*), equipment:equipment(*), daily_progress(*), pending_logs(*)')
        .order('created_at', { ascending: false }),
      supabase.from('departments').select('*').order('name'),
    ]);
    if (woRes.data) setWorkOrders(woRes.data as WorkOrder[]);
    if (deptRes.data) setDepartments(deptRes.data as Department[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = {
    total: workOrders.length,
    open: workOrders.filter((w) => w.status === 'OPEN').length,
    assigned: workOrders.filter((w) => w.status === 'ASSIGNED').length,
    inProgress: workOrders.filter((w) => w.status === 'IN PROGRESS').length,
    pending: workOrders.filter((w) => w.status === 'PENDING').length,
    completed: workOrders.filter((w) => w.status === 'COMPLETED').length,
    closed: workOrders.filter((w) => w.status === 'CLOSED').length,
  };

  const inProgressWOs = workOrders.filter((w) => w.status === 'IN PROGRESS');
  const updatedToday = inProgressWOs.filter(isUpdatedToday);
  const notUpdatedToday = inProgressWOs.filter((w) => !isUpdatedToday(w));

  const deptStats = departments.map((dept) => ({
    name: dept.name,
    code: dept.code,
    total: workOrders.filter((w) => w.department_id === dept.id).length,
    inProgress: workOrders.filter((w) => w.department_id === dept.id && w.status === 'IN PROGRESS').length,
    pending: workOrders.filter((w) => w.department_id === dept.id && w.status === 'PENDING').length,
    completed: workOrders.filter((w) => w.department_id === dept.id && (w.status === 'COMPLETED' || w.status === 'CLOSED')).length,
  }));

  const priorityStats = PRIORITIES.map((p) => ({
    priority: p,
    count: workOrders.filter((w) => w.priority === p).length,
  }));

  const maxDeptTotal = Math.max(...deptStats.map((d) => d.total), 1);

  const recentWOs = workOrders.slice(0, 5);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total WO" value={stats.total} icon={ClipboardList} color="blue" onClick={() => navigate('work-orders')} />
        <StatCard label="Open" value={stats.open} icon={CircleDot} color="slate" onClick={() => navigate('work-orders')} />
        <StatCard label="Assigned" value={stats.assigned} icon={UserCheck} color="cyan" onClick={() => navigate('work-orders')} />
        <StatCard label="In Progress" value={stats.inProgress} icon={Loader} color="amber" onClick={() => navigate('daily-progress')} />
        <StatCard label="Pending" value={stats.pending} icon={AlertTriangle} color="red" onClick={() => navigate('pending')} />
        <StatCard label="Completed" value={stats.completed + stats.closed} icon={CheckCircle2} color="emerald" onClick={() => navigate('work-orders')} />
      </div>

      {/* Daily Progress Monitoring + Priority Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Daily Progress Monitoring */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-slate-800">Daily Progress Monitoring</h3>
            </div>
            <button
              onClick={() => navigate('daily-progress')}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Lihat semua <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">Updated Today</span>
                </div>
                <p className="mt-2 text-3xl font-bold text-emerald-700">{updatedToday.length}</p>
                <p className="mt-1 text-xs text-emerald-600">WO sudah diupdate hari ini</p>
              </div>
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-center gap-2">
                  <CalendarX className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Belum Update</span>
                </div>
                <p className="mt-2 text-3xl font-bold text-orange-700">{notUpdatedToday.length}</p>
                <p className="mt-1 text-xs text-orange-600">WO belum diupdate hari ini</p>
              </div>
            </div>

            {inProgressWOs.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">WO In Progress</p>
                {inProgressWOs.slice(0, 4).map((wo) => {
                  const updated = isUpdatedToday(wo);
                  const lastProgress = wo.daily_progress?.sort((a, b) => b.progress_date.localeCompare(a.progress_date))[0];
                  return (
                    <button
                      key={wo.id}
                      onClick={() => navigate('daily-progress')}
                      className="flex w-full items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-700">{wo.wo_number}</p>
                        <p className="truncate text-xs text-slate-400">{wo.problem_description}</p>
                      </div>
                      {lastProgress && (
                        <div className="hidden sm:block text-right">
                          <p className="text-xs font-semibold text-slate-600">{lastProgress.progress_percent}%</p>
                        </div>
                      )}
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                          updated ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                        )}
                      >
                        {updated ? 'Updated' : 'Pending'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800">WO per Priority</h3>
          </div>
          <div className="p-5 space-y-3">
            {priorityStats.map((p) => {
              const max = Math.max(...priorityStats.map((x) => x.count), 1);
              const pct = (p.count / max) * 100;
              const barColor = {
                'Critical': 'bg-red-500',
                'High': 'bg-orange-500',
                'Medium': 'bg-yellow-400',
                'Low': 'bg-green-500',
              }[p.priority];
              return (
                <div key={p.priority}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{p.priority}</span>
                    <span className="font-bold text-slate-800">{p.count}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={cn('h-full rounded-full transition-all duration-500', barColor)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* WO per Department + Status Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* WO per Department */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <ClipboardList className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800">WO per Department</h3>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {deptStats.map((d) => (
                <div key={d.code} className="flex items-center gap-3">
                  <div className="w-24 shrink-0">
                    <p className="text-xs font-semibold text-slate-700">{d.name}</p>
                    <p className="text-[10px] text-slate-400">{d.code}</p>
                  </div>
                  <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-slate-100">
                    <div
                      className="flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-2 transition-all duration-500"
                      style={{ width: `${Math.max((d.total / maxDeptTotal) * 100, 8)}%` }}
                    >
                      <span className="text-xs font-bold text-white">{d.total}</span>
                    </div>
                  </div>
                  <div className="hidden gap-2 sm:flex">
                    {d.inProgress > 0 && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">{d.inProgress} IP</span>}
                    {d.pending > 0 && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">{d.pending} PND</span>}
                    {d.completed > 0 && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">{d.completed} CMP</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Status Distribution */}
        <Card>
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800">Status Distribution</h3>
          </div>
          <div className="p-5 space-y-2.5">
            {WO_STATUSES.map((status) => {
              const count = workOrders.filter((w) => w.status === status).length;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              const barColor = {
                'OPEN': 'bg-slate-400',
                'ASSIGNED': 'bg-blue-500',
                'IN PROGRESS': 'bg-amber-500',
                'PENDING': 'bg-red-500',
                'COMPLETED': 'bg-emerald-500',
                'CLOSED': 'bg-gray-500',
              }[status];
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-24 shrink-0 text-xs font-medium text-slate-600">{status}</div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className={cn('h-full rounded-full transition-all duration-500', barColor)} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-xs font-bold text-slate-800">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Aging Summary + Recent WOs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Aging Summary */}
        <Card>
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800">Aging Summary</h3>
          </div>
          <div className="p-5 space-y-3">
            {workOrders
              .filter((w) => w.status !== 'CLOSED')
              .sort((a, b) => getWOAge(b) - getWOAge(a))
              .slice(0, 5)
              .map((wo) => {
                const age = getWOAge(wo);
                const pendingAge = getPendingAge(wo);
                return (
                  <button
                    key={wo.id}
                    onClick={() => navigate('aging')}
                    className="flex w-full items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-700">{wo.wo_number}</p>
                      <p className="truncate text-xs text-slate-400">{wo.area}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn('text-sm font-bold', getAgeColor(age))}>{age}d</p>
                      {pendingAge > 0 && <p className="text-[10px] text-red-500">PND: {pendingAge}d</p>}
                    </div>
                  </button>
                );
              })}
            {workOrders.filter((w) => w.status !== 'CLOSED').length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">Tidak ada WO aktif</p>
            )}
          </div>
        </Card>

        {/* Recent WOs */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-slate-800">Recent Work Orders</h3>
            </div>
            <button
              onClick={() => navigate('work-orders')}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Lihat semua <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentWOs.map((wo) => (
              <button
                key={wo.id}
                onClick={() => navigate('work-orders')}
                className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{wo.wo_number}</span>
                    <PriorityBadge priority={wo.priority} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{wo.problem_description}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-slate-400">{formatDate(wo.wo_date)}</p>
                  <p className="text-[11px] text-slate-400">{wo.department?.name}</p>
                </div>
                <StatusBadge status={wo.status} />
              </button>
            ))}
            {recentWOs.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">Belum ada Work Order</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

const COLOR_MAP = {
  blue: { icon: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', value: 'text-blue-700' },
  slate: { icon: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', value: 'text-slate-700' },
  cyan: { icon: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', value: 'text-cyan-700' },
  amber: { icon: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', value: 'text-amber-700' },
  red: { icon: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', value: 'text-red-700' },
  emerald: { icon: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', value: 'text-emerald-700' },
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  onClick,
}: {
  label: string;
  value: number;
  icon: typeof ClipboardList;
  color: keyof typeof COLOR_MAP;
  onClick?: () => void;
}) {
  const c = COLOR_MAP[color];
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex flex-col gap-2 rounded-xl border bg-white p-4 text-left shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5',
        c.border
      )}
    >
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', c.bg)}>
        <Icon className={cn('h-5 w-5', c.icon)} />
      </div>
      <div>
        <p className={cn('text-2xl font-bold', c.value)}>{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </button>
  );
}
