import type { WOStatus, Priority, Role, PendingReason, SparePartStatus, JobType } from '@/types';

export const WO_STATUSES: WOStatus[] = [
  'OPEN',
  'ASSIGNED',
  'IN PROGRESS',
  'PENDING',
  'COMPLETED',
  'CLOSED',
];

export const PRIORITIES: Priority[] = ['Critical', 'High', 'Medium', 'Low'];

export const ROLES: Role[] = ['Admin', 'Manager', 'Supervisor', 'Technician'];

export const PENDING_REASONS: PendingReason[] = [
  'Spare Part',
  'Material',
  'Vendor',
  'Shutdown',
  'Pekerjaan bagian lain',
  'Other',
];

export const SPARE_PART_STATUSES: SparePartStatus[] = ['READY', 'NOT READY'];

export const JOB_TYPES: JobType[] = [
  'Corrective',
  'Preventive',
  'Predictive',
  'Modification',
  'Inspection',
];

export const STATUS_FLOW: Record<WOStatus, WOStatus[]> = {
  'OPEN': ['ASSIGNED'],
  'ASSIGNED': ['IN PROGRESS', 'PENDING'],
  'IN PROGRESS': ['COMPLETED', 'PENDING'],
  'PENDING': ['IN PROGRESS', 'ASSIGNED'],
  'COMPLETED': ['CLOSED'],
  'CLOSED': [],
};

export const STATUS_COLORS: Record<WOStatus, string> = {
  'OPEN': 'bg-slate-100 text-slate-700 border-slate-300',
  'ASSIGNED': 'bg-blue-100 text-blue-700 border-blue-300',
  'IN PROGRESS': 'bg-amber-100 text-amber-700 border-amber-300',
  'PENDING': 'bg-red-100 text-red-700 border-red-300',
  'COMPLETED': 'bg-emerald-100 text-emerald-700 border-emerald-300',
  'CLOSED': 'bg-gray-200 text-gray-600 border-gray-400',
};

export const STATUS_DOT_COLORS: Record<WOStatus, string> = {
  'OPEN': 'bg-slate-400',
  'ASSIGNED': 'bg-blue-500',
  'IN PROGRESS': 'bg-amber-500',
  'PENDING': 'bg-red-500',
  'COMPLETED': 'bg-emerald-500',
  'CLOSED': 'bg-gray-500',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  'Critical': 'bg-red-500 text-white',
  'High': 'bg-orange-500 text-white',
  'Medium': 'bg-yellow-400 text-yellow-900',
  'Low': 'bg-green-500 text-white',
};

export const PRIORITY_DOT_COLORS: Record<Priority, string> = {
  'Critical': 'bg-red-500',
  'High': 'bg-orange-500',
  'Medium': 'bg-yellow-400',
  'Low': 'bg-green-500',
};

export const ROLE_COLORS: Record<Role, string> = {
  'Admin': 'bg-indigo-100 text-indigo-700',
  'Manager': 'bg-cyan-100 text-cyan-700',
  'Supervisor': 'bg-teal-100 text-teal-700',
  'Technician': 'bg-blue-100 text-blue-700',
};
