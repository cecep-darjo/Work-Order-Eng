import type { WorkOrder, WOStatus, Role } from '@/types';

export interface AdminUser {
  id: string;
  username: string;
  email?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export function getAdminUsersFromStorage(): AdminUser[] {
  try {
    const savedUsers = localStorage.getItem('admin_users');
    if (savedUsers) {
      return JSON.parse(savedUsers) as AdminUser[];
    }
  } catch (e) {
    console.error('Failed to parse admin_users from localStorage', e);
  }
  return [];
}

export function getAdminUsersByRole(roles: Role[]): AdminUser[] {
  const users = getAdminUsersFromStorage();
  return users.filter((u) => u.isActive && roles.includes(u.role));
}

export function formatDate(date: string | null): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | null): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: string | null): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function daysBetween(start: string | null, end: string | null = null): number {
  if (!start) return 0;
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  return Math.max(0, Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
}

export function getWOAge(wo: WorkOrder): number {
  return daysBetween(wo.wo_date, wo.closed_at || wo.completed_at);
}

export function getPendingAge(wo: WorkOrder): number {
  if (!wo.pending_at) return 0;
  const end = wo.pending_resolved_at || (wo.status === 'PENDING' ? null : wo.pending_resolved_at);
  return daysBetween(wo.pending_at, end);
}

export function getCurrentProgress(wo: WorkOrder): number {
  if (wo.status === 'COMPLETED' || wo.status === 'CLOSED') return 100;
  if (!wo.daily_progress || wo.daily_progress.length === 0) return 0;
  return Math.max(...wo.daily_progress.map((p) => p.progress_percent));
}

export function isUpdatedToday(wo: WorkOrder): boolean {
  if (!wo.daily_progress || wo.daily_progress.length === 0) return false;
  const today = new Date().toISOString().split('T')[0];
  return wo.daily_progress.some((p) => p.progress_date === today);
}

export function getActivePendingLog(wo: WorkOrder) {
  if (!wo.pending_logs || wo.pending_logs.length === 0) return null;
  return wo.pending_logs.find((p) => p.is_active) || wo.pending_logs[wo.pending_logs.length - 1];
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getAgeColor(age: number): string {
  if (age <= 3) return 'text-emerald-600';
  if (age <= 7) return 'text-yellow-600';
  if (age <= 14) return 'text-orange-600';
  return 'text-red-600';
}

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? '');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function statusFlowIndex(status: WOStatus): number {
  const flow: WOStatus[] = ['OPEN', 'ASSIGNED', 'IN PROGRESS', 'COMPLETED', 'CLOSED'];
  return flow.indexOf(status);
}
