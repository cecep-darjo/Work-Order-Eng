/*
# WO Management – RLS Policies

Adds full CRUD policies for all tables (anon + authenticated).
Single-tenant internal app: all data is shared.
*/

-- Departments
DROP POLICY IF EXISTS "anon_select_departments" ON departments;
CREATE POLICY "anon_select_departments" ON departments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_departments" ON departments;
CREATE POLICY "anon_insert_departments" ON departments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_departments" ON departments;
CREATE POLICY "anon_update_departments" ON departments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_departments" ON departments;
CREATE POLICY "anon_delete_departments" ON departments FOR DELETE TO anon, authenticated USING (true);

-- Employees
DROP POLICY IF EXISTS "anon_select_employees" ON employees;
CREATE POLICY "anon_select_employees" ON employees FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_employees" ON employees;
CREATE POLICY "anon_insert_employees" ON employees FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_employees" ON employees;
CREATE POLICY "anon_update_employees" ON employees FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_employees" ON employees;
CREATE POLICY "anon_delete_employees" ON employees FOR DELETE TO anon, authenticated USING (true);

-- Equipment
DROP POLICY IF EXISTS "anon_select_equipment" ON equipment;
CREATE POLICY "anon_select_equipment" ON equipment FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_equipment" ON equipment;
CREATE POLICY "anon_insert_equipment" ON equipment FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_equipment" ON equipment;
CREATE POLICY "anon_update_equipment" ON equipment FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_equipment" ON equipment;
CREATE POLICY "anon_delete_equipment" ON equipment FOR DELETE TO anon, authenticated USING (true);

-- Work Orders
DROP POLICY IF EXISTS "anon_select_work_orders" ON work_orders;
CREATE POLICY "anon_select_work_orders" ON work_orders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_work_orders" ON work_orders;
CREATE POLICY "anon_insert_work_orders" ON work_orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_work_orders" ON work_orders;
CREATE POLICY "anon_update_work_orders" ON work_orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_work_orders" ON work_orders;
CREATE POLICY "anon_delete_work_orders" ON work_orders FOR DELETE TO anon, authenticated USING (true);

-- Daily Progress
DROP POLICY IF EXISTS "anon_select_daily_progress" ON daily_progress;
CREATE POLICY "anon_select_daily_progress" ON daily_progress FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_daily_progress" ON daily_progress;
CREATE POLICY "anon_insert_daily_progress" ON daily_progress FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_daily_progress" ON daily_progress;
CREATE POLICY "anon_update_daily_progress" ON daily_progress FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_daily_progress" ON daily_progress;
CREATE POLICY "anon_delete_daily_progress" ON daily_progress FOR DELETE TO anon, authenticated USING (true);

-- Pending Logs
DROP POLICY IF EXISTS "anon_select_pending_logs" ON pending_logs;
CREATE POLICY "anon_select_pending_logs" ON pending_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_pending_logs" ON pending_logs;
CREATE POLICY "anon_insert_pending_logs" ON pending_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_pending_logs" ON pending_logs;
CREATE POLICY "anon_update_pending_logs" ON pending_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_pending_logs" ON pending_logs;
CREATE POLICY "anon_delete_pending_logs" ON pending_logs FOR DELETE TO anon, authenticated USING (true);

-- Activity Logs
DROP POLICY IF EXISTS "anon_select_activity_logs" ON activity_logs;
CREATE POLICY "anon_select_activity_logs" ON activity_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_activity_logs" ON activity_logs;
CREATE POLICY "anon_insert_activity_logs" ON activity_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_activity_logs" ON activity_logs;
CREATE POLICY "anon_update_activity_logs" ON activity_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_activity_logs" ON activity_logs;
CREATE POLICY "anon_delete_activity_logs" ON activity_logs FOR DELETE TO anon, authenticated USING (true);