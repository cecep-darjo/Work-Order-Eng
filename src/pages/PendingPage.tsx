import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { WorkOrder, PendingReason, SparePartStatus } from '@/types';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import { PENDING_REASONS, SPARE_PART_STATUSES } from '@/lib/constants';
import { formatDate, formatDateTime, getPendingAge, cn } from '@/lib/utils';
import {
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle2,
  Package,
  ChevronDown,
  X,
  Wrench,
} from 'lucide-react';

export function PendingPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalWO, setModalWO] = useState<WorkOrder | null>(null);
  const [resolveWO, setResolveWO] = useState<WorkOrder | null>(null);

  const fetchData = useCallback(async () => {
    const { data } = await supabase
      .from('work_orders')
      .select('*, department:departments(*), equipment:equipment(*), pending_logs(*)')
      .eq('status', 'PENDING')
      .order('pending_at', { ascending: false });
    if (data) setWorkOrders(data as WorkOrder[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getActivePending = (wo: WorkOrder) => {
    if (!wo.pending_logs || wo.pending_logs.length === 0) return null;
    return wo.pending_logs.find((p) => p.is_active) || wo.pending_logs[wo.pending_logs.length - 1];
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
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-5 border-red-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-red-600">{workOrders.length}</p>
            <p className="text-sm text-slate-500">WO Pending</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5 border-orange-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
            <Package className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-orange-600">
              {workOrders.filter((w) => {
                const p = getActivePending(w);
                return p?.reason === 'Spare Part' && p?.spare_part_status === 'NOT READY';
              }).length}
            </p>
            <p className="text-sm text-slate-500">Spare Part Not Ready</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5 border-emerald-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-emerald-600">
              {workOrders.filter((w) => {
                const p = getActivePending(w);
                return p?.reason === 'Spare Part' && p?.spare_part_status === 'READY';
              }).length}
            </p>
            <p className="text-sm text-slate-500">Spare Part Ready</p>
          </div>
        </Card>
      </div>

      {/* Pending WO List */}
      <div className="space-y-3">
        {workOrders.length === 0 ? (
          <Card className="py-12 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-300" />
            <p className="mt-3 text-sm text-slate-500">Tidak ada WO Pending</p>
          </Card>
        ) : (
          workOrders.map((wo) => {
            const pending = getActivePending(wo);
            const age = getPendingAge(wo);
            return (
              <Card key={wo.id} className="overflow-hidden border-red-200">
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">{wo.wo_number}</span>
                      <PriorityBadge priority={wo.priority} />
                      <StatusBadge status={wo.status} size="xs" />
                      <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                        <Clock className="h-3.5 w-3.5" /> Pending: {age} hari
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-slate-600">{wo.problem_description}</p>
                    {pending && (
                      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                            {pending.reason}
                          </span>
                          {pending.reason === 'Spare Part' && (
                            <span className={cn(
                              'rounded-lg px-2.5 py-1 text-xs font-semibold',
                              pending.spare_part_status === 'READY' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                            )}>
                              Spare Part: {pending.spare_part_status}
                            </span>
                          )}
                        </div>
                        {pending.reason_detail && (
                          <p className="mt-2 text-sm text-slate-600">{pending.reason_detail}</p>
                        )}
                        <p className="mt-1.5 text-xs text-slate-400">
                          Mulai pending: {formatDateTime(pending.pending_started_at)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 sm:w-40">
                    {pending?.reason === 'Spare Part' && (
                      <button
                        onClick={() => {
                          setModalWO(wo);
                          setShowAddModal(true);
                        }}
                        className={cn(
                          'flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                          pending.spare_part_status === 'READY'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        )}
                      >
                        <Package className="h-3.5 w-3.5" />
                        {pending.spare_part_status === 'READY' ? 'Spare Part Ready' : 'Tandai Ready'}
                      </button>
                    )}
                    <button
                      onClick={() => setResolveWO(wo)}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      <Wrench className="h-3.5 w-3.5" /> Resume Pekerjaan
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Toggle Spare Part Status Modal */}
      {modalWO && showAddModal && (
        <SparePartModal
          wo={modalWO}
          onClose={() => { setShowAddModal(false); setModalWO(null); }}
          onSaved={fetchData}
        />
      )}

      {/* Resolve Pending Modal */}
      {resolveWO && (
        <ResolveModal
          wo={resolveWO}
          onClose={() => setResolveWO(null)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}

function SparePartModal({
  wo,
  onClose,
  onSaved,
}: {
  wo: WorkOrder;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const pending = wo.pending_logs?.find((p) => p.is_active) || wo.pending_logs?.[wo.pending_logs.length - 1];
  const [status, setStatus] = useState<SparePartStatus>(pending?.spare_part_status || 'NOT READY');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    if (pending) {
      await supabase
        .from('pending_logs')
        .update({ spare_part_status: status, updated_at: new Date().toISOString() })
        .eq('id', pending.id);
    }
    await onSaved();
    onClose();
  };

  return (
    <Modal open={true} onClose={onClose} title="Update Spare Part Status" size="sm">
      <div className="space-y-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-700">{wo.wo_number}</p>
          <p className="text-xs text-slate-500 mt-0.5">{pending?.reason_detail}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700">Spare Part Status</label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {SPARE_PART_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  'rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all',
                  status === s
                    ? s === 'READY'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                <Package className="mx-auto h-5 w-5 mb-1" />
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ResolveModal({
  wo,
  onClose,
  onSaved,
}: {
  wo: WorkOrder;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  const handleResolve = async () => {
    setSaving(true);
    // Deactivate pending log
    const pending = wo.pending_logs?.find((p) => p.is_active);
    if (pending) {
      await supabase
        .from('pending_logs')
        .update({
          is_active: false,
          pending_resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', pending.id);
    }
    // Set WO back to IN PROGRESS
    await supabase
      .from('work_orders')
      .update({
        status: 'IN PROGRESS',
        pending_resolved_at: new Date().toISOString(),
      })
      .eq('id', wo.id);

    await onSaved();
    onClose();
  };

  return (
    <Modal open={true} onClose={onClose} title="Resume Pekerjaan" size="sm">
      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 p-4 text-center">
          <Wrench className="mx-auto h-8 w-8 text-blue-600" />
          <p className="mt-2 text-sm text-slate-700">
            Lanjutkan pekerjaan untuk <span className="font-semibold">{wo.wo_number}</span>?
            Status akan diubah menjadi <span className="font-semibold text-amber-600">IN PROGRESS</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleResolve}
            disabled={saving}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Memproses...' : 'Ya, Resume'}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
        </div>
      </div>
    </Modal>
  );
}
