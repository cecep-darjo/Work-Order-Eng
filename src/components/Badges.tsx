import type { WOStatus, Priority } from '@/types';
import { STATUS_COLORS, PRIORITY_COLORS, STATUS_DOT_COLORS, PRIORITY_DOT_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function StatusBadge({ status, size = 'sm' }: { status: WOStatus; size?: 'sm' | 'xs' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap',
        STATUS_COLORS[status],
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT_COLORS[status])} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap',
        PRIORITY_COLORS[priority]
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full bg-white/70', PRIORITY_DOT_COLORS[priority])} />
      {priority}
    </span>
  );
}
