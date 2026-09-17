export type WOStatus = 'OPEN' | 'ASSIGNED' | 'IN PROGRESS' | 'PENDING' | 'COMPLETED' | 'CLOSED';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type Role = 'Admin' | 'Manager' | 'Supervisor' | 'Technician';

export type PendingReason =
  | 'Spare Part'
  | 'Material'
  | 'Vendor'
  | 'Shutdown'
  | 'Pekerjaan bagian lain'
  | 'Other';

export type SparePartStatus = 'READY' | 'NOT READY';

export type JobType = 'Corrective' | 'Preventive' | 'Predictive' | 'Modification' | 'Inspection';

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  name: string;
  role: Role;
  department_id: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  department?: Department | null;
}

export interface Equipment {
  id: string;
  tag_code: string;
  name: string;
  area: string;
  department_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  department?: Department | null;
}

export interface WorkOrder {
  id: string;
  wo_number: string;
  wo_date: string;
  priority: Priority;
  job_type: JobType;
  area: string;
  equipment_id: string | null;
  problem_description: string;
  department_id: string | null;
  pic_id: string | null;
  technician_id: string | null;
  status: WOStatus;
  action_taken: string | null;
  result: string | null;
  completion_photo_url: string | null;
  completed_at: string | null;
  closed_at: string | null;
  assigned_at: string | null;
  in_progress_at: string | null;
  pending_at: string | null;
  pending_resolved_at: string | null;
  created_at: string;
  updated_at: string;
  department?: Department | null;
  pic?: Employee | null;
  technician?: Employee | null;
  equipment?: Equipment | null;
  daily_progress?: DailyProgress[];
  pending_logs?: PendingLog[];
  activity_logs?: ActivityLog[];
}

export interface DailyProgress {
  id: string;
  work_order_id: string;
  progress_date: string;
  activity: string;
  progress_percent: number;
  photo_url: string | null;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface PendingLog {
  id: string;
  work_order_id: string;
  reason: PendingReason;
  reason_detail: string | null;
  spare_part_status: SparePartStatus;
  pending_started_at: string;
  pending_resolved_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  work_order_id: string;
  action: string;
  description: string | null;
  performed_by: string | null;
  old_status: string | null;
  new_status: string | null;
  created_at: string;
}

export interface WorkOrderInput {
  priority: Priority;
  job_type: JobType;
  area: string;
  equipment_id: string | null;
  problem_description: string;
  department_id: string | null;
  pic_id: string | null;
  technician_id: string | null;
}
