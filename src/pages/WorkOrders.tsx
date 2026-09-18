import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { WorkOrder, Department, Employee, Equipment, WOStatus, Role } from '@/types';
import { Card } from '@/components/Card';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import { Modal } from '@/components/Modal';
import { WO_STATUSES, PRIORITIES, STATUS_FLOW, JOB_TYPES } from '@/lib/constants';
import { formatDate, formatDateTime, getWOAge, getPendingAge, getCurrentProgress, cn, getAgeColor, getAdminUsersByRole, type AdminUser } from '@/lib/utils';
import {
  Search,
  Filter,
  X,
  Eye,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader,
  Wrench,
  Lock,
  CircleDot,
  UserCheck,
} from 'lucide-react';

interface WorkOrdersProps {
  currentRole: Role;
}

export function WorkOrders({ currentRole }: WorkOrdersProps) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<WOStatus | 'ALL'>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = useCallback(async () => {
    const [woRes, deptRes, empRes, eqRes] = await Promise.all([
      supabase
        .from('work_orders')
        .select('*, department:departments(*), equipment:equipment(*), daily_progress(*), pending_logs(*), activity_logs(*)')
        .order('created_at', { ascending: false }),
      supabase.from('departments').select('*').order('name'),
      supabase.from('employees').select('*, department:departments(*)').eq('is_active', true).order('name'),
      supabase.from('equipment').select('*').order('name'),
    ]);
    if (woRes.data) setWorkOrders(woRes.data as WorkOrder[]);
    if (deptRes.data) setDepartments(deptRes.data as Department[]);
    if (empRes.data) setEmployees(empRes.data as Employee[]);
    if (eqRes.data) setEquipment(eqRes.data as Equipment[]);
    
    // Load admin users from localStorage for PIC and Technician selection
    const picUsers = getAdminUsersByRole(['Manager', 'Supervisor']);
    const techUsers = getAdminUsersByRole(['Technician']);
    setAdminUsers([...picUsers, ...techUsers]);
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = workOrders.filter((wo) => {
    if (statusFilter !== 'ALL' && wo.status !== statusFilter) return false;
    if (deptFilter !== 'ALL' && wo.department_id !== deptFilter) return false;
    if (priorityFilter !== 'ALL' && wo.priority !== priorityFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        wo.wo_number.toLowerCase().includes(s) ||
        wo.problem_description.toLowerCase().includes(s) ||
        wo.area.toLowerCase().includes(s) ||
        wo.job_type.toLowerCase().includes(s) ||
        wo.equipment?.name?.toLowerCase().includes(s) ||
        wo.equipment?.tag_code?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const hasFilters = statusFilter !== 'ALL' || deptFilter !== 'ALL' || priorityFilter !== 'ALL';

  const clearFilters = () => {
    setStatusFilter('ALL');
    setDeptFilter('ALL');
    setPriorityFilter('ALL');
    setSearch('');
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari WO number, deskripsi, area, equipment..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
            hasFilters
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          )}
        >
          <Filter className="h-4 w-4" />
          Filter
          {hasFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
              {[statusFilter, deptFilter, priorityFilter].filter((f) => f !== 'ALL').length}
            </span>
          )}
        </button>
      </div>

      {/* Filter dropdown */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as WOStatus | 'ALL')}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="ALL">Semua Status</option>
                {WO_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Department</label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="ALL">Semua Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="ALL">Semua Priority</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          {hasFilters && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                <X className="h-3 w-3" /> Reset Filter
              </button>
            </div>
          )}
        </Card>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Menampilkan <span className="font-semibold text-slate-700">{filtered.length}</span> dari{' '}
          <span className="font-semibold text-slate-700">{workOrders.length}</span> Work Order
        </p>
      </div>

      {/* Table - Desktop */}
      <Card className="hidden overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">WO Number</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Equipment</th>
                <th className="px-4 py-3">PIC / Tech</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((wo) => (
                <tr
                  key={wo.id}
                  onClick={() => setSelectedWO(wo)}
                  className="cursor-pointer transition-colors hover:bg-slate-50/70"
                >
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800">{wo.wo_number}</span>
                    <p className="text-xs text-slate-400">{wo.job_type}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(wo.wo_date)}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={wo.priority} /></td>
                  <td className="px-4 py-3 text-slate-600">{wo.department?.name || '-'}</td>
                  <td className="px-4 py-3">
                    {wo.equipment ? (
                      <div>
                        <p className="text-slate-700">{wo.equipment.tag_code}</p>
                        <p className="text-xs text-slate-400">{wo.equipment.name}</p>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-700">{wo.pic_username || '-'}</p>
                    <p className="text-xs text-slate-400">{wo.technician_username || '-'}</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={wo.status} /></td>
                  <td className="px-4 py-3">
                    <span className={cn('font-semibold', getAgeColor(getWOAge(wo)))}>{getWOAge(wo)}d</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <FileText className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">Tidak ada Work Order ditemukan</p>
            </div>
          )}
        </div>
      </Card>

      {/* Cards - Mobile */}
      <div className="space-y-3 lg:hidden">
        {filtered.map((wo) => (
          <Card
            key={wo.id}
            className="p-4 cursor-pointer active:bg-slate-50"
          >
            <button onClick={() => setSelectedWO(wo)} className="w-full text-left">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{wo.wo_number}</span>
                    <PriorityBadge priority={wo.priority} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 truncate">{wo.problem_description}</p>
                </div>
                <StatusBadge status={wo.status} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                <div className="flex gap-3">
                  <span className="text-slate-500">{wo.department?.name}</span>
                  <span className={cn('font-semibold', getAgeColor(getWOAge(wo)))}>{getWOAge(wo)}d</span>
                </div>
                {wo.technician && <span className="text-slate-400">{wo.technician.name}</span>}
              </div>
            </button>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="py-16 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">Tidak ada Work Order ditemukan</p>
          </Card>
        )}
      </div>

      {/* Detail Modal */}
      {selectedWO && (
        <WODetailModal
          wo={selectedWO}
          departments={departments}
          employees={employees}
          equipment={equipment}
          adminUsers={adminUsers}
          onClose={() => setSelectedWO(null)}
          onUpdate={fetchData}
          currentRole={currentRole}
        />
      )}
    </div>
  );
}

// ============================================================
// WO DETAIL MODAL
// ============================================================
interface WODetailModalProps {
  wo: WorkOrder;
  departments: Department[];
  employees: Employee[];
  equipment: Equipment[];
  adminUsers: AdminUser[];
  onClose: () => void;
  onUpdate: () => Promise<void>;
  currentRole: Role;
}

function WODetailModal({ wo, departments, employees, equipment, adminUsers, onClose, onUpdate, currentRole }: WODetailModalProps) {
  const [tab, setTab] = useState<'info' | 'progress' | 'pending' | 'activity'>('info');
  const [updating, setUpdating] = useState(false);
  const [editAssign, setEditAssign] = useState(false);
  const [assignPic, setAssignPic] = useState(wo.pic_username || '');
  const [assignTech, setAssignTech] = useState(wo.technician_username || '');
  const [assignDept, setAssignDept] = useState(wo.department_id || '');

  const canEdit = currentRole === 'Admin' || currentRole === 'Manager' || currentRole === 'Supervisor';
  const age = getWOAge(wo);
  const pendingAge = getPendingAge(wo);
  const progress = getCurrentProgress(wo);
  const allowedNext = STATUS_FLOW[wo.status] || [];

  const updateStatus = async (newStatus: WOStatus) => {
    setUpdating(true);
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'COMPLETED') {
      // Will be set by completion form
    }
    await supabase.from('work_orders').update(updates).eq('id', wo.id);
    await onUpdate();
    onClose();
  };

  const saveAssignment = async () => {
    setUpdating(true);
    const updates: Record<string, unknown> = {
      pic_username: assignPic || null,
      technician_username: assignTech || null,
      department_id: assignDept || null,
    };
    if (wo.status === 'OPEN' && assignTech) {
      updates.status = 'ASSIGNED';
    }
    await supabase.from('work_orders').update(updates).eq('id', wo.id);
    setEditAssign(false);
    await onUpdate();
    setUpdating(false);
  };

  const supervisors = adminUsers.filter((u) => u.role === 'Supervisor' || u.role === 'Manager');
  const technicians = adminUsers.filter((u) => u.role === 'Technician');

  return (
    <Modal open={true} onClose={onClose} title={`Detail ${wo.wo_number}`} size="xl">
      {/* Status bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <StatusBadge status={wo.status} />
        <PriorityBadge priority={wo.priority} />
        <span className="text-xs text-slate-500">{wo.job_type}</span>
        <span className={cn('ml-auto flex items-center gap-1 text-sm font-semibold', getAgeColor(age))}>
          <Clock className="h-4 w-4" /> {age} hari
        </span>
        {pendingAge > 0 && (
          <span className="flex items-center gap-1 text-sm font-semibold text-red-500">
            <AlertTriangle className="h-4 w-4" /> Pending: {pendingAge}d
          </span>
        )}
      </div>

      {/* Progress bar */}
      {wo.status === 'IN PROGRESS' && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-slate-600">Progress</span>
            <span className="font-bold text-slate-800">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-slate-100">
        {([
          { key: 'info', label: 'Info' },
          { key: 'progress', label: 'Progress' },
          { key: 'pending', label: 'Pending' },
          { key: 'activity', label: 'Activity' },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              tab === t.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="max-h-[50vh] overflow-y-auto">
        {tab === 'info' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <InfoField label="Tanggal WO" value={formatDate(wo.wo_date)} />
              <InfoField label="Area" value={wo.area} />
              <InfoField label="Jenis Pekerjaan" value={wo.job_type} />
              <InfoField label="Department" value={wo.department?.name || '-'} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Equipment</label>
              {wo.equipment ? (
                <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-sm font-medium text-slate-700">{wo.equipment.tag_code} - {wo.equipment.name}</p>
                  <p className="text-xs text-slate-400">{wo.equipment.area}</p>
                </div>
              ) : <p className="mt-1 text-sm text-slate-400">-</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Uraian Masalah</label>
              <p className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {wo.problem_description}
              </p>
            </div>

            {/* Assignment */}
            {editAssign ? (
              <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                <p className="text-sm font-semibold text-blue-700">Edit Assignment</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Department</label>
                    <select value={assignDept} onChange={(e) => setAssignDept(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100">
                      <option value="">Pilih Department</option>
                      {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">PIC / Supervisor</label>
                    <select value={assignPic} onChange={(e) => setAssignPic(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100">
                      <option value="">Pilih PIC</option>
                      {supervisors.map((u) => <option key={u.id} value={u.username}>{u.username} ({u.role})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Teknisi</label>
                    <select value={assignTech} onChange={(e) => setAssignTech(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100">
                      <option value="">Pilih Teknisi</option>
                      {technicians.map((u) => <option key={u.id} value={u.username}>{u.username}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveAssignment} disabled={updating}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    {updating ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button onClick={() => setEditAssign(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <InfoField label="PIC" value={wo.pic_username || '-'} />
                <InfoField label="Teknisi" value={wo.technician_username || '-'} />
              </div>
            )}

            {/* Completion info */}
            {wo.status === 'COMPLETED' && (
              <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-700">Pekerjaan Selesai</p>
                </div>
                <InfoField label="Action Taken" value={wo.action_taken || '-'} />
                <InfoField label="Result" value={wo.result || '-'} />
                <InfoField label="Completed At" value={formatDateTime(wo.completed_at)} />
              </div>
            )}
          </div>
        )}

        {tab === 'progress' && (
          <div>
            {wo.daily_progress && wo.daily_progress.length > 0 ? (
              <div className="space-y-3">
                {[...wo.daily_progress]
                  .sort((a, b) => b.progress_date.localeCompare(a.progress_date))
                  .map((dp, idx) => (
                    <div key={dp.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                          dp.is_locked ? 'bg-slate-200 text-slate-500' : 'bg-blue-100 text-blue-700'
                        )}>
                          {dp.progress_percent}%
                        </div>
                        {idx < wo.daily_progress!.length - 1 && <div className="w-0.5 flex-1 bg-slate-200" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-700">{formatDate(dp.progress_date)}</p>
                          {dp.is_locked && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                              <Lock className="inline h-3 w-3" /> Locked
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{dp.activity}</p>
                        {dp.photo_url && <img src={dp.photo_url} alt="progress" className="mt-2 rounded-lg" />}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">Belum ada progress</p>
            )}
          </div>
        )}

        {tab === 'pending' && (
          <div>
            {wo.pending_logs && wo.pending_logs.length > 0 ? (
              <div className="space-y-3">
                {wo.pending_logs.map((pl) => (
                  <div key={pl.id} className={cn(
                    'rounded-xl border p-4',
                    pl.is_active ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'
                  )}>
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                        {pl.reason}
                      </span>
                      {pl.reason === 'Spare Part' && (
                        <span className={cn(
                          'rounded-lg px-2.5 py-1 text-xs font-semibold',
                          pl.spare_part_status === 'READY' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                        )}>
                          Spare Part: {pl.spare_part_status}
                        </span>
                      )}
                    </div>
                    {pl.reason_detail && <p className="mt-2 text-sm text-slate-600">{pl.reason_detail}</p>}
                    <div className="mt-2 flex gap-4 text-xs text-slate-400">
                      <span>Mulai: {formatDateTime(pl.pending_started_at)}</span>
                      {pl.pending_resolved_at && <span>Selesai: {formatDateTime(pl.pending_resolved_at)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">Tidak ada pending log</p>
            )}
          </div>
        )}

        {tab === 'activity' && (
          <div>
            {wo.activity_logs && wo.activity_logs.length > 0 ? (
              <div className="space-y-2">
                {wo.activity_logs
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((log) => (
                    <div key={log.id} className="flex gap-3 rounded-lg border border-slate-100 px-3 py-2">
                      <div className="mt-0.5">
                        {log.new_status === 'OPEN' && <CircleDot className="h-4 w-4 text-slate-400" />}
                        {log.new_status === 'ASSIGNED' && <UserCheck className="h-4 w-4 text-blue-500" />}
                        {log.new_status === 'IN PROGRESS' && <Loader className="h-4 w-4 text-amber-500" />}
                        {log.new_status === 'PENDING' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        {log.new_status === 'COMPLETED' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        {log.new_status === 'CLOSED' && <CheckCircle2 className="h-4 w-4 text-gray-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">{log.description}</p>
                        <p className="text-xs text-slate-400">{formatDateTime(log.created_at)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">Belum ada aktivitas</p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          {wo.status === 'OPEN' && !editAssign && (
            <button onClick={() => setEditAssign(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <Wrench className="h-4 w-4" /> Assign PIC & Teknisi
            </button>
          )}
          {wo.status !== 'OPEN' && !editAssign && (
            <button onClick={() => setEditAssign(true)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Edit Assignment
            </button>
          )}
          {allowedNext.map((next) => (
            <button
              key={next}
              onClick={() => updateStatus(next)}
              disabled={updating}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50',
                next === 'PENDING' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                next === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                next === 'CLOSED' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' :
                'bg-blue-100 text-blue-700 hover:bg-blue-200'
              )}
            >
              {next === 'PENDING' && <AlertTriangle className="h-4 w-4" />}
              {next === 'COMPLETED' && <CheckCircle2 className="h-4 w-4" />}
              {next === 'IN PROGRESS' && <Loader className="h-4 w-4" />}
              {next === 'ASSIGNED' && <UserCheck className="h-4 w-4" />}
              {next === 'CLOSED' && <CheckCircle2 className="h-4 w-4" />}
              Pindah ke {next}
              <ArrowRight className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500">{label}</label>
      <p className="mt-0.5 text-sm text-slate-700">{value}</p>
    </div>
  );
}


