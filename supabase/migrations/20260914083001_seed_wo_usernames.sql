/*
# Update Work Orders Seed Data for Username-based Assignments

Updates existing work order records to use usernames instead of employee IDs
for pic_username and technician_username fields.

Note: This requires running after the migration that renames the columns.
*/

-- Update existing work orders to use usernames instead of employee IDs
-- Mapping the employee names to admin_users usernames (lowercase)
UPDATE work_orders
SET pic_username = 'agus' WHERE pic_username IS NULL AND wo_number = 'WO26/MTC/09/0001';

UPDATE work_orders
SET pic_username = 'agus', technician_username = 'hendra' WHERE wo_number = 'WO26/MTC/09/0001';

UPDATE work_orders
SET pic_username = 'agus', technician_username = 'eko' WHERE wo_number = 'WO26/UTL/09/0002';

UPDATE work_orders
SET pic_username = 'agus', technician_username = 'fajar' WHERE wo_number = 'WO26/HVA/09/0003';

UPDATE work_orders
SET pic_username = 'rudi', technician_username = 'andi' WHERE wo_number = 'WO26/WS/09/0004';

UPDATE work_orders
SET pic_username = 'agus', technician_username = 'galih' WHERE wo_number = 'WO26/OTO/09/0005';
