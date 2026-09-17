import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { WorkOrder, Department, WOStatus, Priority } from '@/types';
import { Card } from '@/components/Card';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import { WO_STATUSES, PRIORITIES } from '@/lib/constants';
import { formatDate, getWOAge, getPendingAge, getCurrentProgress, downloadCSV, cn, getAgeColor } from '@/lib/utils';
import { Download, FileBarChart, Filter, ChevronDown } from 'lucide-react';

export function ReportPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<WOStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');

  const fetchData = useCallback(async () => {
    const [woRes, deptRes] = await Promise.all([
      supabase
        .from('work_orders')
        .select('*, department:departments(*), pic:employees!pic_id(*), technician:employees!technician_id(*), equipment:equipment(*), daily_progress(*), pending_logs(*)')
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

  const filtered = workOrders.filter((wo) => {
    if (statusFilter !== 'ALL' && wo.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && wo.priority !== priorityFilter) return false;
    if (deptFilter !== 'ALL' && wo.department_id !== deptFilter) return false;
    if (dateFrom && wo.wo_date < dateFrom) return false;
    if (dateTo && wo.wo_date > dateTo) return false;
    return true;
  });

  const handleExport = () => {
    const headers = [
      'WO Number', 'Tanggal', 'Priority', 'Jenis Pekerjaan', 'Area',
      'Equipment', 'Department', 'PIC', 'Teknisi', 'Status',
      'Progress %', 'Total Age (hari)', 'Pending Age (hari)',
      'Action Taken', 'Result', 'Completed At',
    ];
    const rows = filtered.map((wo) => [
      wo.wo_number,
      wo.wo_date,
      wo.priority,
      wo.job_type,
      wo.area,
      wo.equipment ? `${wo.equipment.tag_code} - ${wo.equipment.name}` : '',
      wo.department?.name || '',
      wo.pic?.name || '',
      wo.technician?.name || '',
      wo.status,
      getCurrentProgress(wo),
      getWOAge(wo),
      getPendingAge(wo),
      wo.action_taken || '',
      wo.result || '',
      wo.completed_at ? formatDate(wo.completed_at) : '',
    ]);
    downloadCSV(`laporan_wo_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  // Summary stats
  const summary = {
    total: filtered.length,
    completed: filtered.filter((w) => w.status === 'COMPLETED' || w.status === 'CLOSED').length,
    pending: filtered.filter((w) => w.status === 'PENDING').length,
    inProgress: filtered.filter((w) => w.status === 'IN PROGRESS').length,
    avgAge: filtered.length > 0
      ? Math.round(filtered.reduce((sum, w) => sum + getWOAge(w), 0) / filtered.length)
      : 0,
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filter Card */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-800">Filter Laporan</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="text-xs font-semibold text-slate-600">Dari Tanggal</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Sampai Tanggal</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as WOStatus | 'ALL')}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">Semua</option>
              {WO_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority | 'ALL')}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">Semua</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">Semua</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <SummaryStat label="Total WO" value={summary.total} color="blue" />
        <SummaryStat label="In Progress" value={summary.inProgress} color="amber" />
        <SummaryStat label="Pending" value={summary.pending} color="red" />
        <SummaryStat label="Completed" value={summary.completed} color="emerald" />
        <SummaryStat label="Avg Age" value={`${summary.avgAge}d`} color="slate" />
      </div>

      {/* Report Table */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800">Laporan Work Order</h3>
          </div>
          <span className="text-sm text-slate-500">{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">WO Number</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3 text-right">Total Age</th>
                <th className="px-4 py-3 text-right">Pending Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((wo) => (
                <tr key={wo.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-semibold text-slate-800">{wo.wo_number}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(wo.wo_date)}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={wo.priority} /></td>
                  <td className="px-4 py-3 text-slate-600">{wo.department?.name || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={wo.status} size="xs" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${getCurrentProgress(wo)}%` }} />
                      </div>
                      <span className="text-xs text-slate-600">{getCurrentProgress(wo)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn('font-bold', getAgeColor(getWOAge(wo)))}>{getWOAge(wo)}d</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {getPendingAge(wo) > 0 ? (
                      <span className="font-bold text-red-500">{getPendingAge(wo)}d</span>
                    ) : <span className="text-slate-300">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <FileBarChart className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">Tidak ada data untuk filter ini</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function SummaryStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-700',
    amber: 'text-amber-700',
    red: 'text-red-700',
    emerald: 'text-emerald-700',
    slate: 'text-slate-700',
  };
  return (
    <Card className="p-4 text-center">
      <p className={cn('text-2xl font-bold', colorMap[color])}>{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </Card>
  );
}
