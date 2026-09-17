/*
# WO Management – Create Tables

Creates all tables for the Engineering Work Order Management System.
Single-tenant internal app: RLS enabled, anon+authenticated full CRUD.
*/

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'Technician',
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  email text,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Equipment
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_code text NOT NULL,
  name text NOT NULL,
  area text NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- Work Orders
CREATE TABLE IF NOT EXISTS work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_number text UNIQUE NOT NULL,
  wo_date date NOT NULL DEFAULT CURRENT_DATE,
  priority text NOT NULL DEFAULT 'Medium',
  job_type text NOT NULL,
  area text NOT NULL,
  equipment_id uuid REFERENCES equipment(id) ON DELETE SET NULL,
  problem_description text NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  pic_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  technician_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'OPEN',
  action_taken text,
  result text,
  completion_photo_url text,
  completed_at timestamptz,
  closed_at timestamptz,
  assigned_at timestamptz,
  in_progress_at timestamptz,
  pending_at timestamptz,
  pending_resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_department ON work_orders(department_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_wo_number ON work_orders(wo_number);

-- Daily Progress
CREATE TABLE IF NOT EXISTS daily_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  progress_date date NOT NULL DEFAULT CURRENT_DATE,
  activity text NOT NULL,
  progress_percent int NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  photo_url text,
  is_locked boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_progress_wo_date ON daily_progress(work_order_id, progress_date);
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;

-- Pending Logs
CREATE TABLE IF NOT EXISTS pending_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  reason text NOT NULL,
  reason_detail text,
  spare_part_status text DEFAULT 'NOT READY',
  pending_started_at timestamptz NOT NULL DEFAULT now(),
  pending_resolved_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE pending_logs ENABLE ROW LEVEL SECURITY;

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  action text NOT NULL,
  description text,
  performed_by text,
  old_status text,
  new_status text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;