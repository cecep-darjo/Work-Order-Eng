import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { WorkOrder, DailyProgress } from '@/types';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/Badges';
import { formatDate, getCurrentProgress, isUpdatedToday, cn } from '@/lib/utils';
import {
  CalendarDays,
  Plus,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  CalendarX,
  Image as ImageIcon,
} from 'lucide-react';

export function DailyProgressPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [progressWO, setProgressWO] = useState<WorkOrder | null>(null);

  const fetchData = useCallback(async () => {
    const { data } = await supabase
      .from('work_orders')
      .select('*, department:departments(*), equipment:equipment(*), daily_progress(*), pending_logs(*)')
      .in('status', ['IN PROGRESS'])
      .order('created_at', { ascending: false });
    if (data) setWorkOrders(data as WorkOrder[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updatedToday = workOrders.filter(isUpdatedToday);
  const notUpdatedToday = workOrders.filter((w) => !isUpdatedToday(w));

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-5 border-blue-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <CalendarDays className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-800">{workOrders.length}</p>
            <p className="text-sm text-slate-500">WO In Progress</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5 border-emerald-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
            <CalendarCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-emerald-600">{updatedToday.length}</p>
            <p className="text-sm text-slate-500">Updated Today</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5 border-orange-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
            <CalendarX className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-orange-600">{notUpdatedToday.length}</p>
            <p className="text-sm text-slate-500">Belum Update Hari Ini</p>
          </div>
        </Card>
      </div>

      {/* Not updated today - highlight */}
      {notUpdatedToday.length > 0 && (
        <Card className="overflow-hidden border-orange-200">
          <div className="flex items-center gap-2 border-b border-orange-100 bg-orange-50/50 px-5 py-3">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-orange-800">Perlu Update Hari Ini</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {notUpdatedToday.map((wo) => (
              <div key={wo.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{wo.wo_number}</span>
                    <StatusBadge status={wo.status} size="xs" />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{wo.problem_description}</p>
                  <p className="mt-0.5 text-xs text-slate-400">Teknisi: {wo.technician?.name || '-'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Progress: {getCurrentProgress(wo)}%</span>
                  <button
                    onClick={() => { setProgressWO(wo); setShowAddModal(true); }}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    <Plus className="h-3.5 w-3.5" /> Update
                  </button>
                  <button
                    onClick={() => setSelectedWO(wo)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Timeline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* All In Progress WOs */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
          <CalendarDays className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-800">Semua WO In Progress</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {workOrders.map((wo) => {
            const updated = isUpdatedToday(wo);
            const lastProgress = wo.daily_progress?.sort((a, b) => b.progress_date.localeCompare(a.progress_date))[0];
            return (
              <div key={wo.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{wo.wo_number}</span>
                    <StatusBadge status={wo.status} size="xs" />
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        updated ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                      )}
                    >
                      {updated ? 'Updated' : 'Pending'}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{wo.problem_description}</p>
                  {lastProgress && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      Last: {formatDate(lastProgress.progress_date)} - {lastProgress.activity.slice(0, 60)}...
                    </p>
                  )}
                </div>
                <div className="hidden items-center sm:flex">
                  <div className="w-24 text-right">
                    <p className="text-sm font-bold text-slate-700">{getCurrentProgress(wo)}%</p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${getCurrentProgress(wo)}%` }} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => { setProgressWO(wo); setShowAddModal(true); }}
                    disabled={updated}
                    className={cn(
                      'flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                      updated
                        ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    )}
                  >
                    <Plus className="h-3.5 w-3.5" /> {updated ? 'Sudah' : 'Update'}
                  </button>
                  <button
                    onClick={() => setSelectedWO(wo)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Timeline
                  </button>
                </div>
              </div>
            );
          })}
          {workOrders.length === 0 && (
            <div className="py-12 text-center">
              <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">Tidak ada WO In Progress</p>
            </div>
          )}
        </div>
      </Card>

      {/* Timeline Modal */}
      {selectedWO && (
        <TimelineModal wo={selectedWO} onClose={() => setSelectedWO(null)} />
      )}

      {/* Add Progress Modal */}
      {progressWO && showAddModal && (
        <AddProgressModal
          wo={progressWO}
          onClose={() => { setShowAddModal(false); setProgressWO(null); }}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}

// ============================================================
// TIMELINE MODAL
// ============================================================
function TimelineModal({ wo, onClose }: { wo: WorkOrder; onClose: () => void }) {
  const progress = wo.daily_progress || [];
  const sorted = [...progress].sort((a, b) => b.progress_date.localeCompare(a.progress_date));

  return (
    <Modal open={true} onClose={onClose} title={`Timeline Progress - ${wo.wo_number}`} size="lg">
      <div className="mb-4 flex items-center gap-3">
        <StatusBadge status={wo.status} />
        <span className="text-sm text-slate-500">Progress: {getCurrentProgress(wo)}%</span>
      </div>

      {sorted.length > 0 ? (
        <div className="space-y-0">
          {sorted.map((dp, idx) => (
            <div key={dp.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold',
                  dp.is_locked ? 'bg-slate-200 text-slate-500' : 'bg-blue-100 text-blue-700'
                )}>
                  {dp.progress_percent}%
                </div>
                {idx < sorted.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 my-1" />}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-slate-700">{formatDate(dp.progress_date)}</p>
                  {dp.is_locked ? (
                    <span className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                      <Lock className="h-3 w-3" /> Locked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                      <Clock className="h-3 w-3" /> Today
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-slate-600">{dp.activity}</p>
                {dp.photo_url && (
                  <img src={dp.photo_url} alt="progress" className="mt-2 max-w-xs rounded-lg border border-slate-200" />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-slate-400">Belum ada progress</p>
      )}
    </Modal>
  );
}

// ============================================================
// ADD PROGRESS MODAL
// ============================================================
function AddProgressModal({
  wo,
  onClose,
  onSaved,
}: {
  wo: WorkOrder;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [activity, setActivity] = useState('');
  const [progressPercent, setProgressPercent] = useState(getCurrentProgress(wo));
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const alreadyToday = wo.daily_progress?.some((dp) => dp.progress_date === today);

  const handleSave = async () => {
    setError('');
    if (!activity.trim()) {
      setError('Aktivitas wajib diisi');
      return;
    }
    if (progressPercent < 0 || progressPercent > 100) {
      setError('Progress harus antara 0-100%');
      return;
    }

    setSaving(true);
    const { error: insertError } = await supabase.from('daily_progress').insert({
      work_order_id: wo.id,
      progress_date: today,
      activity: activity.trim(),
      progress_percent: progressPercent,
      photo_url: photoUrl || null,
    });

    if (insertError) {
      setError('Gagal menyimpan progress: ' + insertError.message);
      setSaving(false);
      return;
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      work_order_id: wo.id,
      action: 'DAILY_PROGRESS',
      description: `Progress harian: ${progressPercent}% - ${activity.slice(0, 60)}`,
      old_status: wo.status,
      new_status: wo.status,
    });

    await onSaved();
    onClose();
  };

  if (alreadyToday) {
    return (
      <Modal open={true} onClose={onClose} title="Update Progress" size="md">
        <div className="py-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <CheckCircle2 className="h-7 w-7 text-amber-600" />
          </div>
          <p className="mt-3 text-sm text-slate-600">
            WO <span className="font-semibold">{wo.wo_number}</span> sudah diupdate hari ini.
            Maksimal 1 progress per WO per hari.
          </p>
          <button
            onClick={onClose}
            className="mt-4 rounded-lg bg-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-300"
          >
            Tutup
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={true} onClose={onClose} title={`Update Progress - ${wo.wo_number}`} size="md">
      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 px-4 py-3">
          <p className="text-xs text-blue-600">
            <Clock className="mr-1 inline h-3.5 w-3.5" />
            Tanggal: {formatDate(today)} - Entry ini akan dikunci besok.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        <div>
          <label className="text-sm font-semibold text-slate-700">Aktivitas Pekerjaan <span className="text-red-500">*</span></label>
          <textarea
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            rows={4}
            placeholder="Jelaskan aktivitas pekerjaan yang dilakukan hari ini..."
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Progress %</label>
          <div className="mt-2 flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={100}
              value={progressPercent}
              onChange={(e) => setProgressPercent(Number(e.target.value))}
              className="flex-1 accent-blue-600"
            />
            <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-blue-50 text-lg font-bold text-blue-700">
              {progressPercent}%
            </div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">URL Foto (opsional)</label>
          <div className="relative mt-1.5">
            <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Progress'}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
        </div>
      </div>
    </Modal>
  );
}
