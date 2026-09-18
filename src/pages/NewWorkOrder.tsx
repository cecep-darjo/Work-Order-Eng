import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Department, Employee, Equipment, Priority, JobType, WorkOrderInput } from '@/types';
import type { PageKey } from '@/App';
import { Card } from '@/components/Card';
import { PRIORITIES, JOB_TYPES } from '@/lib/constants';
import { cn, getAdminUsersByRole, type AdminUser } from '@/lib/utils';
import {
  FilePlus2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

interface NewWorkOrderProps {
  navigate: (page: PageKey) => void;
  currentEmployee: Employee | null;
}

export function NewWorkOrder({ navigate, currentEmployee }: NewWorkOrderProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdWONumber, setCreatedWONumber] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState<WorkOrderInput>({
    priority: 'Medium',
    job_type: 'Corrective',
    area: '',
    equipment_id: null,
    problem_description: '',
    department_id: null,
    pic_username: null,
    technician_username: null,
  });

  const fetchData = useCallback(async () => {
    const [deptRes, empRes, eqRes] = await Promise.all([
      supabase.from('departments').select('*').eq('is_active', true).order('name'),
      supabase.from('employees').select('*, department:departments(*)').eq('is_active', true).order('name'),
      supabase.from('equipment').select('*').eq('is_active', true).order('name'),
    ]);
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

  const filteredEquipment = form.department_id
    ? equipment.filter((e) => e.department_id === form.department_id)
    : equipment;

  const supervisors = adminUsers.filter((u) => u.role === 'Supervisor' || u.role === 'Manager');
  const technicians = adminUsers.filter((u) => u.role === 'Technician');

  const handleSubmit = async () => {
    setError('');
    if (!form.problem_description.trim()) {
      setError('Uraian masalah wajib diisi');
      return;
    }
    if (!form.area.trim()) {
      setError('Area wajib diisi');
      return;
    }
    if (!form.department_id) {
      setError('Department wajib dipilih');
      return;
    }

    setSaving(true);
    const { data, error: insertError } = await supabase
      .from('work_orders')
      .insert({
        priority: form.priority,
        job_type: form.job_type,
        area: form.area,
        equipment_id: form.equipment_id,
        problem_description: form.problem_description,
        department_id: form.department_id,
        pic_username: form.pic_username,
        technician_username: form.technician_username,
        status: form.technician_username ? 'ASSIGNED' : 'OPEN',
        assigned_at: form.technician_username ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (insertError) {
      setError('Gagal membuat Work Order: ' + insertError.message);
      setSaving(false);
      return;
    }

    if (data) {
      // Log creation
      await supabase.from('activity_logs').insert({
        work_order_id: data.id,
        action: 'CREATED',
        description: 'Work Order dibuat oleh ' + (currentEmployee?.name || 'Engineering'),
        old_status: null,
        new_status: form.technician_username ? 'ASSIGNED' : 'OPEN',
      });

      if (form.technician_username) {
        await supabase.from('activity_logs').insert({
          work_order_id: data.id,
          action: 'STATUS_CHANGE',
          description: 'Status berubah dari OPEN ke ASSIGNED',
          old_status: 'OPEN',
          new_status: 'ASSIGNED',
        });
      }

      setCreatedWONumber(data.wo_number);
      setSuccess(true);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-800">Work Order Berhasil Dibuat</h3>
          <p className="mt-1 text-sm text-slate-500">
            Nomor WO: <span className="font-semibold text-blue-600">{createdWONumber}</span>
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={() => navigate('work-orders')}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Lihat Work Order
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setForm({
                  priority: 'Medium',
                  job_type: 'Corrective',
                  area: '',
                  equipment_id: null,
                  problem_description: '',
                  department_id: null,
                  pic_username: null,
                  technician_username: null,
                });
              }}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Buat WO Lagi
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <FilePlus2 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Buat Work Order Baru</h2>
          <p className="text-sm text-slate-500">Nomor WO akan dibuat otomatis</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Card className="p-6 space-y-5">
        {/* Priority & Job Type */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">Priority <span className="text-red-500">*</span></label>
            <div className="mt-2 flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => setForm({ ...form, priority: p as Priority })}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-all',
                    form.priority === p
                      ? p === 'Critical' ? 'border-red-500 bg-red-500 text-white'
                        : p === 'High' ? 'border-orange-500 bg-orange-500 text-white'
                        : p === 'Medium' ? 'border-yellow-400 bg-yellow-400 text-yellow-900'
                        : 'border-green-500 bg-green-500 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Jenis Pekerjaan <span className="text-red-500">*</span></label>
            <div className="relative mt-2">
              <select
                value={form.job_type}
                onChange={(e) => setForm({ ...form, job_type: e.target.value as JobType })}
                className="w-full appearance-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {JOB_TYPES.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Department */}
        <div>
          <label className="text-sm font-semibold text-slate-700">Department Tujuan <span className="text-red-500">*</span></label>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {departments.map((d) => (
              <button
                key={d.id}
                onClick={() => setForm({ ...form, department_id: d.id, equipment_id: null })}
                className={cn(
                  'rounded-lg border px-2 py-2 text-center text-xs font-medium transition-all',
                  form.department_id === d.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                {d.code}
                <p className="mt-0.5 text-[10px] font-normal text-slate-400">{d.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Area */}
        <div>
          <label className="text-sm font-semibold text-slate-700">Area <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
            placeholder="contoh: Area Produksi A, Utilitas, HVAC Room..."
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Equipment */}
        <div>
          <label className="text-sm font-semibold text-slate-700">Equipment</label>
          <p className="text-xs text-slate-400">Pilih equipment terkait (opsional)</p>
          <div className="relative mt-1.5">
            <select
              value={form.equipment_id || ''}
              onChange={(e) => setForm({ ...form, equipment_id: e.target.value || null })}
              className="w-full appearance-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Tanpa Equipment</option>
              {filteredEquipment.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.tag_code} - {eq.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Problem Description */}
        <div>
          <label className="text-sm font-semibold text-slate-700">Uraian Masalah <span className="text-red-500">*</span></label>
          <textarea
            value={form.problem_description}
            onChange={(e) => setForm({ ...form, problem_description: e.target.value })}
            rows={4}
            placeholder="Jelaskan masalah atau pekerjaan yang perlu dilakukan..."
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
          />
        </div>

        {/* PIC & Technician */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">PIC / Supervisor</label>
            <p className="text-xs text-slate-400">Opsional, bisa di-assign nanti</p>
            <div className="relative mt-1.5">
              <select
                value={form.pic_username || ''}
                onChange={(e) => setForm({ ...form, pic_username: e.target.value || null })}
                className="w-full appearance-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Pilih PIC</option>
                {supervisors.map((u) => (
                  <option key={u.id} value={u.username}>{u.username} ({u.role})</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Teknisi</label>
            <p className="text-xs text-slate-400">Opsional, bisa di-assign nanti</p>
            <div className="relative mt-1.5">
              <select
                value={form.technician_username || ''}
                onChange={(e) => setForm({ ...form, technician_username: e.target.value || null })}
                className="w-full appearance-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Pilih Teknisi</option>
                {technicians.map((u) => (
                  <option key={u.id} value={u.username}>{u.username}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Menyimpan...' : 'Simpan Work Order'}
          </button>
          <button
            onClick={() => navigate('work-orders')}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <X className="h-4 w-4" /> Batal
          </button>
        </div>
      </Card>
    </div>
  );
}
