import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { WorkOrder } from '@/types';
import { Card } from '@/components/Card';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import { formatDate, getWOAge, getPendingAge, cn, getAgeColor } from '@/lib/utils';
import { Clock, AlertTriangle, TrendingUp } from 'lucide-react';

export function AgingPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { data } = await supabase
      .from('work_orders')
      .select('*, department:departments(*), pic:employees!pic_id(*), technician:employees!technician_id(*), equipment:equipment(*), pending_logs(*)')
      .neq('status', 'CLOSED')
      .order('wo_date', { ascending: true });
    if (data) setWorkOrders(data as WorkOrder[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeWOs = workOrders.filter((w) => w.status !== 'CLOSED');
  const sortedByAge = [...activeWOs].sort((a, b) => getWOAge(b) - getWOAge(a));

  const ageBuckets = {
    fresh: activeWOs.filter((w) => getWOAge(w) <= 3),
    week: activeWOs.filter((w) => getWOAge(w) > 3 && getWOAge(w) <= 7),
    twoWeeks: activeWOs.filter((w) => getWOAge(w) > 7 && getWOAge(w) <= 14),
    old: activeWOs.filter((w) => getWOAge(w) > 14),
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
      {/* Age Distribution */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AgeBucketCard label="1-3 Hari" count={ageBuckets.fresh.length} color="emerald" icon={Clock} />
        <AgeBucketCard label="4-7 Hari" count={ageBuckets.week.length} color="yellow" icon={Clock} />
        <AgeBucketCard label="8-14 Hari" count={ageBuckets.twoWeeks.length} color="orange" icon={AlertTriangle} />
        <AgeBucketCard label=">14 Hari" count={ageBuckets.old.length} color="red" icon={AlertTriangle} />
      </div>

      {/* Pending Aging Summary */}
      <Card>
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-800">Pending Aging Summary</h3>
        </div>
        <div className="p-5">
          {activeWOs.filter((w) => w.status === 'PENDING').length > 0 ? (
            <div className="space-y-2">
              {activeWOs
                .filter((w) => w.status === 'PENDING')
                .sort((a, b) => getPendingAge(b) - getPendingAge(a))
                .map((wo) => {
                  const age = getPendingAge(wo);
                  const pending = wo.pending_logs?.find((p) => p.is_active);
                  return (
                    <div key={wo.id} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-700">{wo.wo_number}</p>
                        <p className="truncate text-xs text-slate-400">{pending?.reason}: {pending?.reason_detail?.slice(0, 50)}</p>
                      </div>
                      <span className={cn('text-sm font-bold', getAgeColor(age))}>{age}d</span>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">Tidak ada WO Pending</p>
          )}
        </div>
      </Card>

      {/* Detailed Aging Table */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <Clock className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-800">Aging Detail per Work Order</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">WO Number</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 text-right">Total Age</th>
                <th className="px-4 py-3 text-right">Pending Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedByAge.map((wo) => {
                const age = getWOAge(wo);
                const pAge = getPendingAge(wo);
                return (
                  <tr key={wo.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-semibold text-slate-800">{wo.wo_number}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(wo.wo_date)}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={wo.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={wo.status} size="xs" /></td>
                    <td className="px-4 py-3 text-slate-600">{wo.department?.name || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn('font-bold', getAgeColor(age))}>{age}d</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {pAge > 0 ? (
                        <span className="font-bold text-red-500">{pAge}d</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sortedByAge.length === 0 && (
            <div className="py-12 text-center">
              <Clock className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">Tidak ada WO aktif</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function AgeBucketCard({
  label,
  count,
  color,
  icon: Icon,
}: {
  label: string;
  count: number;
  color: string;
  icon: typeof Clock;
}) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  };
  const c = colorMap[color];
  return (
    <Card className={cn('flex items-center gap-3 p-4', c.border)}>
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', c.bg)}>
        <Icon className={cn('h-5 w-5', c.text)} />
      </div>
      <div>
        <p className={cn('text-2xl font-bold', c.text)}>{count}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </Card>
  );
}
