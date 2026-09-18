/*
# Migrate PIC and Technician to Username Storage

Changes pic_id and technician_id columns from UUID employee references to TEXT username strings.
This aligns with the new authentication model using localStorage admin users instead of employees table.
*/

-- Drop the foreign key constraints
ALTER TABLE work_orders 
DROP CONSTRAINT IF EXISTS work_orders_pic_id_fkey,
DROP CONSTRAINT IF EXISTS work_orders_technician_id_fkey;

-- Rename and change column types from uuid to text
ALTER TABLE work_orders 
RENAME COLUMN pic_id TO pic_username;

ALTER TABLE work_orders 
RENAME COLUMN technician_id TO technician_username;

-- Change the data type to TEXT (values are now usernames, not UUIDs)
ALTER TABLE work_orders 
ALTER COLUMN pic_username TYPE text USING pic_username::text,
ALTER COLUMN technician_username TYPE text USING technician_username::text;

-- Create indexes on the new columns for faster lookups
CREATE INDEX IF NOT EXISTS idx_work_orders_pic_username ON work_orders(pic_username);
CREATE INDEX IF NOT EXISTS idx_work_orders_technician_username ON work_orders(technician_username);

-- Note: The select query in WorkOrders.tsx will need to be updated
-- to not join with employees table for pic and technician lookups
-- since we're now storing usernames directly
