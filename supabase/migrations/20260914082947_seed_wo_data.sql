/*
# WO Management – Seed Data

Seeds departments, employees, equipment, sample work orders,
pending logs, activity logs, and daily progress entries.
Also sets the WO sequence counter.
*/

-- Departments
INSERT INTO departments (code, name, description) VALUES
  ('MTC1', 'Maintenance 1', 'Tim Maintenance 1'),
  ('MTC2', 'Maintenance 2', 'Tim Maintenance 2'),
  ('WS', 'Workshop', 'Bengkel Workshop'),
  ('UTL', 'Utility', 'Tim Utility'),
  ('HVAC', 'HVAC', 'Tim HVAC'),
  ('OTM', 'Otomasi', 'Tim Otomasi')
ON CONFLICT (code) DO NOTHING;

-- Employees
INSERT INTO employees (name, role, department_id, email) VALUES
  ('Budi Santoso', 'Admin', NULL, 'budi@interbat.co.id'),
  ('Siti Rahayu', 'Manager', NULL, 'siti@interbat.co.id'),
  ('Agus Wijaya', 'Supervisor', (SELECT id FROM departments WHERE code='MTC1'), 'agus@interbat.co.id'),
  ('Dedi Kurniawan', 'Supervisor', (SELECT id FROM departments WHERE code='MTC2'), 'dedi@interbat.co.id'),
  ('Rudi Hartono', 'Supervisor', (SELECT id FROM departments WHERE code='WS'), 'rudi@interbat.co.id'),
  ('Hendra Gunawan', 'Technician', (SELECT id FROM departments WHERE code='MTC1'), 'hendra@interbat.co.id'),
  ('Joko Susilo', 'Technician', (SELECT id FROM departments WHERE code='MTC2'), 'joko@interbat.co.id'),
  ('Andi Pratama', 'Technician', (SELECT id FROM departments WHERE code='WS'), 'andi@interbat.co.id'),
  ('Eko Saputra', 'Technician', (SELECT id FROM departments WHERE code='UTL'), 'eko@interbat.co.id'),
  ('Fajar Nugroho', 'Technician', (SELECT id FROM departments WHERE code='HVAC'), 'fajar@interbat.co.id'),
  ('Galih Rizki', 'Technician', (SELECT id FROM departments WHERE code='OTM'), 'galih@interbat.co.id')
ON CONFLICT DO NOTHING;

-- Equipment
INSERT INTO equipment (tag_code, name, area, department_id) VALUES
  ('PMP-001', 'Pompa Sentrifugal 1', 'Area Produksi A', (SELECT id FROM departments WHERE code='MTC1')),
  ('PMP-002', 'Pompa Sentrifugal 2', 'Area Produksi B', (SELECT id FROM departments WHERE code='MTC1')),
  ('BLR-001', 'Boiler Unit 1', 'Utilitas', (SELECT id FROM departments WHERE code='UTL')),
  ('CHL-001', 'Chiller Unit 1', 'HVAC Room', (SELECT id FROM departments WHERE code='HVAC')),
  ('CNV-001', 'Conveyor Line 1', 'Area Packaging', (SELECT id FROM departments WHERE code='OTM')),
  ('MTR-001', 'Motor Listrik 50kW', 'Area Produksi A', (SELECT id FROM departments WHERE code='MTC2')),
  ('LTH-001', 'Lathe Machine', 'Workshop', (SELECT id FROM departments WHERE code='WS')),
  ('ACU-001', 'AC Unit Rooftop', 'Office Building', (SELECT id FROM departments WHERE code='HVAC')),
  ('PLT-001', 'Plate Heat Exchanger', 'Area Produksi B', (SELECT id FROM departments WHERE code='UTL')),
  ('CMP-001', 'Air Compressor 100kW', 'Compressor Room', (SELECT id FROM departments WHERE code='MTC2'))
ON CONFLICT DO NOTHING;

-- Sample work orders (explicit wo_number to control seed data)
INSERT INTO work_orders (wo_number, wo_date, priority, job_type, area, equipment_id, problem_description, department_id, pic_id, technician_id, status, assigned_at, in_progress_at)
SELECT 'WO26/MTC/09/0001', '2026-09-10', 'High', 'Corrective', 'Area Produksi A',
  (SELECT id FROM equipment WHERE tag_code='PMP-001'),
  'Pompa sentrifugal 1 mengalami kebocoran pada seal shaft, perlu penggantian seal.',
  (SELECT id FROM departments WHERE code='MTC1'),
  (SELECT id FROM employees WHERE name='Agus Wijaya'),
  (SELECT id FROM employees WHERE name='Hendra Gunawan'),
  'IN PROGRESS', '2026-09-10 08:00:00+07', '2026-09-10 09:00:00+07'
WHERE NOT EXISTS (SELECT 1 FROM work_orders WHERE wo_number = 'WO26/MTC/09/0001');

INSERT INTO work_orders (wo_number, wo_date, priority, job_type, area, equipment_id, problem_description, department_id, pic_id, technician_id, status, assigned_at)
SELECT 'WO26/UTL/09/0002', '2026-09-12', 'Critical', 'Corrective', 'Utilitas',
  (SELECT id FROM equipment WHERE tag_code='BLR-001'),
  'Boiler unit 1 tidak mencapai tekanan operasi, terdapat kebocoran pada pipa uap.',
  (SELECT id FROM departments WHERE code='UTL'),
  (SELECT id FROM employees WHERE name='Agus Wijaya'),
  (SELECT id FROM employees WHERE name='Eko Saputra'),
  'ASSIGNED', '2026-09-12 10:00:00+07'
WHERE NOT EXISTS (SELECT 1 FROM work_orders WHERE wo_number = 'WO26/UTL/09/0002');

INSERT INTO work_orders (wo_number, wo_date, priority, job_type, area, equipment_id, problem_description, department_id, pic_id, technician_id, status, assigned_at, pending_at)
SELECT 'WO26/HVA/09/0003', '2026-09-08', 'Medium', 'Preventive', 'HVAC Room',
  (SELECT id FROM equipment WHERE tag_code='CHL-001'),
  'Jadwal preventive maintenance chiller unit 1, pembersihan kondensor dan filter.',
  (SELECT id FROM departments WHERE code='HVAC'),
  (SELECT id FROM employees WHERE name='Agus Wijaya'),
  (SELECT id FROM employees WHERE name='Fajar Nugroho'),
  'PENDING', '2026-09-08 07:00:00+07', '2026-09-09 10:00:00+07'
WHERE NOT EXISTS (SELECT 1 FROM work_orders WHERE wo_number = 'WO26/HVA/09/0003');

INSERT INTO work_orders (wo_number, wo_date, priority, job_type, area, equipment_id, problem_description, department_id, pic_id, technician_id, status, assigned_at, in_progress_at, completed_at, action_taken, result)
SELECT 'WO26/WS/09/0004', '2026-09-05', 'Low', 'Preventive', 'Workshop',
  (SELECT id FROM equipment WHERE tag_code='LTH-001'),
  'Calibration dan lubrication lathe machine sesuai jadwal PM.',
  (SELECT id FROM departments WHERE code='WS'),
  (SELECT id FROM employees WHERE name='Rudi Hartono'),
  (SELECT id FROM employees WHERE name='Andi Pratama'),
  'COMPLETED', '2026-09-05 08:00:00+07', '2026-09-05 09:00:00+07', '2026-09-07 14:00:00+07',
  'Melakukan kalibrasi ulang dan pelumasan semua bearing serta pemeriksaan alignment.',
  'Lathe machine beroperasi normal, kalibrasi sesuai spec.'
WHERE NOT EXISTS (SELECT 1 FROM work_orders WHERE wo_number = 'WO26/WS/09/0004');

INSERT INTO work_orders (wo_number, wo_date, priority, job_type, area, equipment_id, problem_description, department_id, pic_id, technician_id, status)
SELECT 'WO26/OTO/09/0005', '2026-09-14', 'Medium', 'Corrective', 'Area Packaging',
  (SELECT id FROM equipment WHERE tag_code='CNV-001'),
  'Conveyor line 1 belt slip, perlu tensioning ulang.',
  (SELECT id FROM departments WHERE code='OTM'),
  (SELECT id FROM employees WHERE name='Agus Wijaya'),
  (SELECT id FROM employees WHERE name='Galih Rizki'),
  'OPEN'
WHERE NOT EXISTS (SELECT 1 FROM work_orders WHERE wo_number = 'WO26/OTO/09/0005');

-- Set sequence so next auto-generated WO is WO26/OTO/09/0006
SELECT setval('wo_number_seq', 5);

-- Pending log for WO-0003
INSERT INTO pending_logs (work_order_id, reason, reason_detail, spare_part_status, pending_started_at)
SELECT wo.id, 'Spare Part', 'Menunggu spare part filter kondensor dan refrigerant R-134a', 'NOT READY', '2026-09-09 10:00:00+07'
FROM work_orders wo WHERE wo.wo_number = 'WO26/HVA/09/0003'
AND NOT EXISTS (SELECT 1 FROM pending_logs pl WHERE pl.work_order_id = wo.id);

-- Activity logs for WO-0001
INSERT INTO activity_logs (work_order_id, action, description, old_status, new_status)
SELECT id, 'CREATED', 'Work Order dibuat', NULL, 'OPEN' FROM work_orders WHERE wo_number = 'WO26/MTC/09/0001'
ON CONFLICT DO NOTHING;

INSERT INTO activity_logs (work_order_id, action, description, old_status, new_status)
SELECT id, 'STATUS_CHANGE', 'Status berubah dari OPEN ke ASSIGNED', 'OPEN', 'ASSIGNED' FROM work_orders WHERE wo_number = 'WO26/MTC/09/0001'
ON CONFLICT DO NOTHING;

INSERT INTO activity_logs (work_order_id, action, description, old_status, new_status)
SELECT id, 'STATUS_CHANGE', 'Status berubah dari ASSIGNED ke IN PROGRESS', 'ASSIGNED', 'IN PROGRESS' FROM work_orders WHERE wo_number = 'WO26/MTC/09/0001'
ON CONFLICT DO NOTHING;

-- Daily progress for WO-0001
INSERT INTO daily_progress (work_order_id, progress_date, activity, progress_percent)
SELECT wo.id, '2026-09-10', 'Pembongkaran pompa, inspeksi seal shaft yang bocor.', 20
FROM work_orders wo WHERE wo.wo_number = 'WO26/MTC/09/0001'
AND NOT EXISTS (SELECT 1 FROM daily_progress dp WHERE dp.work_order_id = wo.id AND dp.progress_date = '2026-09-10');

INSERT INTO daily_progress (work_order_id, progress_date, activity, progress_percent)
SELECT wo.id, '2026-09-11', 'Penggantian seal shaft baru dan reassembly pompa.', 60
FROM work_orders wo WHERE wo.wo_number = 'WO26/MTC/09/0001'
AND NOT EXISTS (SELECT 1 FROM daily_progress dp WHERE dp.work_order_id = wo.id AND dp.progress_date = '2026-09-11');

INSERT INTO daily_progress (work_order_id, progress_date, activity, progress_percent)
SELECT wo.id, '2026-09-12', 'Testing pompa setelah penggantian seal, monitoring kebocoran.', 80
FROM work_orders wo WHERE wo.wo_number = 'WO26/MTC/09/0001'
AND NOT EXISTS (SELECT 1 FROM daily_progress dp WHERE dp.work_order_id = wo.id AND dp.progress_date = '2026-09-12');

-- Lock old progress entries
SELECT lock_old_progress_entries();