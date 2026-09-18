/*
# WO Management – Functions, Triggers, and Sequences

1. WO number auto-generation (WO-YYYYMM-XXXX format)
2. Status change timestamp trigger
3. Activity log trigger on status change
4. Daily progress past-day lock trigger
*/

-- Sequence for WO numbers
CREATE SEQUENCE IF NOT EXISTS wo_number_seq;

CREATE OR REPLACE FUNCTION generate_wo_number(dept_id uuid DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  seq_val bigint;
  dept_code text;
  wo_num text;
  year_part text;
  month_part text;
BEGIN
  -- 1. Get sequence value
  seq_val := nextval('wo_number_seq');

  -- 2. Get department code (bbb) - default to 'ENG' if not found or empty
  IF dept_id IS NOT NULL THEN
    SELECT COALESCE(code, 'ENG') INTO dept_code FROM departments WHERE id = dept_id;
  ELSE
    dept_code := 'ENG';
  END IF;

  -- Trim and limit length of department code to 3 characters in uppercase
  dept_code := upper(substring(coalesce(dept_code, 'ENG') from 1 for 3));

  -- 3. Get individual parts for date (aa and cc)
  year_part := to_char(now(), 'YY'); -- aa (2-digit tahun)
  month_part := to_char(now(), 'MM'); -- cc (2-digit bulan)

  -- 4. Concatenate into WOaa/bbb/cc/dddd format
  wo_num := 'WO' || year_part || '/' || dept_code || '/' || month_part || '/' || lpad(seq_val::text, 4, '0');

  RETURN wo_num;
END;
$$;

-- We don't rely only on column DEFAULT since the function needs department_id context on INSERT.
-- Therefore, we will also create a BEFORE INSERT trigger on work_orders to ensure correct generation.
CREATE OR REPLACE FUNCTION trg_set_wo_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.wo_number IS NULL OR NEW.wo_number = '' OR NEW.wo_number LIKE 'WO-%' THEN
    NEW.wo_number := generate_wo_number(NEW.department_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pre_insert_wo_number ON work_orders;
CREATE TRIGGER trg_pre_insert_wo_number
  BEFORE INSERT ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION trg_set_wo_number();

-- Status timestamp trigger
CREATE OR REPLACE FUNCTION update_wo_status_timestamps()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status <> OLD.status THEN
    IF NEW.status = 'ASSIGNED' AND OLD.status = 'OPEN' THEN
      NEW.assigned_at := now();
    ELSIF NEW.status = 'IN PROGRESS' THEN
      NEW.in_progress_at := COALESCE(NEW.in_progress_at, now());
    ELSIF NEW.status = 'PENDING' THEN
      NEW.pending_at := now();
    ELSIF NEW.status = 'COMPLETED' THEN
      NEW.completed_at := now();
    ELSIF NEW.status = 'CLOSED' THEN
      NEW.closed_at := now();
    END IF;
    IF OLD.status = 'PENDING' AND NEW.status <> 'PENDING' THEN
      NEW.pending_resolved_at := now();
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_wo_status_timestamps ON work_orders;
CREATE TRIGGER trg_wo_status_timestamps
  BEFORE UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION update_wo_status_timestamps();

-- Activity log trigger
CREATE OR REPLACE FUNCTION log_wo_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO activity_logs (work_order_id, action, description, old_status, new_status)
    VALUES (NEW.id, 'STATUS_CHANGE', 'Status berubah dari ' || COALESCE(OLD.status, 'NULL') || ' ke ' || NEW.status, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_wo_activity ON work_orders;
CREATE TRIGGER trg_log_wo_activity
  AFTER UPDATE ON work_orders
  FOR EACH ROW
  WHEN (NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION log_wo_activity();

-- Lock past-day progress
CREATE OR REPLACE FUNCTION lock_past_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.progress_date < CURRENT_DATE THEN
    NEW.is_locked := true;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lock_past_progress ON daily_progress;
CREATE TRIGGER trg_lock_past_progress
  BEFORE INSERT OR UPDATE ON daily_progress
  FOR EACH ROW EXECUTE FUNCTION lock_past_progress();

-- Function to lock all old progress entries
CREATE OR REPLACE FUNCTION lock_old_progress_entries()
RETURNS void
LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE daily_progress SET is_locked = true, updated_at = now()
  WHERE progress_date < CURRENT_DATE AND is_locked = false;
$$;