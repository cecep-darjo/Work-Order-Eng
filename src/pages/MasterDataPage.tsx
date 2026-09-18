import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Department, Employee, Equipment, Role } from '@/types';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { ROLES, ROLE_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  Database,
  Users,
  Boxes,
  Building2,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';

interface MasterDataPageProps {
  employees: Employee[];
  refreshEmployees: () => Promise<void>;
}

type Tab = 'departments' | 'employees' | 'equipment';

export function MasterDataPage({ employees, refreshEmployees }: MasterDataPageProps) {
  const [tab, setTab] = useState<Tab>('departments');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const fetchData = useCallback(async () => {
    const [deptRes, eqRes] = await Promise.all([
      supabase.from('departments').select('*').order('name'),
      supabase.from('equipment').select('*, department:departments(*)').order('name'),
    ]);
    if (deptRes.data) setDepartments(deptRes.data as Department[]);
    if (eqRes.data) setEquipment(eqRes.data as Equipment[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setEditItem(null);
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setShowModal(true);
  };

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      alert(`Gagal menghapus data: ${error.message}`);
      return;
    }
    await fetchData();
    if (table === 'employees') await refreshEmployees();
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
      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {([
          { key: 'departments', label: 'Departments', icon: Building2, count: departments.length },
          { key: 'employees', label: 'Employees', icon: Users, count: employees.length },
          { key: 'equipment', label: 'Equipment', icon: Boxes, count: equipment.length },
        ] as const).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                tab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              <span className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                tab === t.key ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
              )}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {tab === 'departments' && 'Daftar department yang menerima distribusi WO'}
          {tab === 'employees' && 'Daftar karyawan dengan role dan department'}
          {tab === 'equipment' && 'Daftar equipment terdaftar'}
        </p>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Tambah
        </button>
      </div>

      {/* Departments Table */}
      {tab === 'departments' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((d) => (
                  <tr key={d.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-semibold text-slate-800">{d.code}</td>
                    <td className="px-4 py-3 text-slate-700">{d.name}</td>
                    <td className="px-4 py-3 text-slate-500">{d.description || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        d.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      )}>
                        {d.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit({ ...d, _table: 'departments' })}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete('departments', d.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Employees Table */}
      {tab === 'employees' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((e) => (
                  <tr key={e.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-bold text-white">
                          {e.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-800">{e.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-md px-2 py-0.5 text-xs font-semibold', ROLE_COLORS[e.role])}>
                        {e.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{e.department?.name || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{e.email || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        e.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      )}>
                        {e.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit({ ...e, _table: 'employees' })}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete('employees', e.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Equipment Table */}
      {tab === 'equipment' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Tag Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipment.map((eq) => (
                  <tr key={eq.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-semibold text-slate-800">{eq.tag_code}</td>
                    <td className="px-4 py-3 text-slate-700">{eq.name}</td>
                    <td className="px-4 py-3 text-slate-600">{eq.area}</td>
                    <td className="px-4 py-3 text-slate-500">{eq.department?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        eq.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      )}>
                        {eq.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit({ ...eq, _table: 'equipment' })}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete('equipment', eq.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit/Add Modal */}
      {showModal && (
        <EditModal
          item={editItem}
          table={tab}
          departments={departments}
          onClose={() => setShowModal(false)}
          onSaved={async () => {
            await fetchData();
            await refreshEmployees();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function EditModal({
  item,
  table,
  departments,
  onClose,
  onSaved,
}: {
  item: any;
  table: Tab;
  departments: Department[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const isEdit = !!item;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [deptForm, setDeptForm] = useState({
    code: item?.code || '',
    name: item?.name || '',
    description: item?.description || '',
    is_active: item?.is_active ?? true,
  });
  const [empForm, setEmpForm] = useState({
    name: item?.name || '',
    role: (item?.role || 'Technician') as Role,
    department_id: item?.department_id || '',
    email: item?.email || '',
    phone: item?.phone || '',
    is_active: item?.is_active ?? true,
  });
  const [eqForm, setEqForm] = useState({
    tag_code: item?.tag_code || '',
    name: item?.name || '',
    area: item?.area || '',
    department_id: item?.department_id || '',
    is_active: item?.is_active ?? true,
  });

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      if (table === 'departments') {
        if (!deptForm.code.trim() || !deptForm.name.trim()) {
          setError('Code dan Name wajib diisi');
          setSaving(false);
          return;
        }
        const payload = {
          code: deptForm.code,
          name: deptForm.name,
          description: deptForm.description || null,
          is_active: deptForm.is_active,
        };
        const { error: saveError } = isEdit
          ? await supabase.from('departments').update(payload).eq('id', item.id)
          : await supabase.from('departments').insert(payload);
        if (saveError) throw saveError;
      } else if (table === 'employees') {
        if (!empForm.name.trim()) {
          setError('Name wajib diisi');
          setSaving(false);
          return;
        }
        const payload = {
          name: empForm.name,
          role: empForm.role,
          department_id: empForm.department_id || null,
          email: empForm.email || null,
          phone: empForm.phone || null,
          is_active: empForm.is_active,
        };
        const { error: saveError } = isEdit
          ? await supabase.from('employees').update(payload).eq('id', item.id)
          : await supabase.from('employees').insert(payload);
        if (saveError) throw saveError;
      } else if (table === 'equipment') {
        if (!eqForm.tag_code.trim() || !eqForm.name.trim() || !eqForm.area.trim()) {
          setError('Tag Code, Name, dan Area wajib diisi');
          setSaving(false);
          return;
        }
        const payload = {
          tag_code: eqForm.tag_code,
          name: eqForm.name,
          area: eqForm.area,
          department_id: eqForm.department_id || null,
          is_active: eqForm.is_active,
        };
        const { error: saveError } = isEdit
          ? await supabase.from('equipment').update(payload).eq('id', item.id)
          : await supabase.from('equipment').insert(payload);
        if (saveError) throw saveError;
      }
      await onSaved();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan');
    }
    setSaving(false);
  };

  const title = isEdit ? `Edit ${table === 'departments' ? 'Department' : table === 'employees' ? 'Employee' : 'Equipment'}` : `Tambah ${table === 'departments' ? 'Department' : table === 'employees' ? 'Employee' : 'Equipment'}`;

  return (
    <Modal open={true} onClose={onClose} title={title} size="md">
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {table === 'departments' && (
          <>
            <FormField label="Code" required>
              <input type="text" value={deptForm.code} disabled={isEdit}
                onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50" />
            </FormField>
            <FormField label="Name" required>
              <input type="text" value={deptForm.name}
                onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </FormField>
            <FormField label="Description">
              <input type="text" value={deptForm.description}
                onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </FormField>
            <ToggleField label="Active" checked={deptForm.is_active}
              onChange={(v) => setDeptForm({ ...deptForm, is_active: v })} />
          </>
        )}

        {table === 'employees' && (
          <>
            <FormField label="Name" required>
              <input type="text" value={empForm.name}
                onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Role">
                <div className="relative">
                  <select value={empForm.role}
                    onChange={(e) => setEmpForm({ ...empForm, role: e.target.value as Role })}
                    className="w-full appearance-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100">
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </FormField>
              <FormField label="Department">
                <div className="relative">
                  <select value={empForm.department_id}
                    onChange={(e) => setEmpForm({ ...empForm, department_id: e.target.value })}
                    className="w-full appearance-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100">
                    <option value="">Tanpa Department</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Email">
                <input type="email" value={empForm.email}
                  onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </FormField>
              <FormField label="Phone">
                <input type="text" value={empForm.phone}
                  onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </FormField>
            </div>
            <ToggleField label="Active" checked={empForm.is_active}
              onChange={(v) => setEmpForm({ ...empForm, is_active: v })} />
          </>
        )}

        {table === 'equipment' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Tag Code" required>
                <input type="text" value={eqForm.tag_code}
                  onChange={(e) => setEqForm({ ...eqForm, tag_code: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </FormField>
              <FormField label="Area" required>
                <input type="text" value={eqForm.area}
                  onChange={(e) => setEqForm({ ...eqForm, area: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </FormField>
            </div>
            <FormField label="Name" required>
              <input type="text" value={eqForm.name}
                onChange={(e) => setEqForm({ ...eqForm, name: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </FormField>
            <FormField label="Department">
              <div className="relative">
                <select value={eqForm.department_id}
                  onChange={(e) => setEqForm({ ...eqForm, department_id: e.target.value })}
                  className="w-full appearance-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100">
                  <option value="">Tanpa Department</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </FormField>
            <ToggleField label="Active" checked={eqForm.is_active}
              onChange={(v) => setEqForm({ ...eqForm, is_active: v })} />
          </>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button onClick={onClose}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <X className="h-4 w-4" /> Batal
          </button>
        </div>
      </div>
    </Modal>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-blue-600' : 'bg-slate-300'
        )}
      >
        <span className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )} />
      </button>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </div>
  );
}
