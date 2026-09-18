-- Update generate_wo_number function to use the new format WOaa/bbb/cc/dddd
-- aa = 2-digit year (tahun: e.g. 26)
-- bbb = department/bagian code (e.g. ENG, UTL, etc., fallback to ENG)
-- cc = 2-digit month (bulan: e.g. 09)
-- dddd = 4-digit sequential order code (nomor urut: e.g. 0001)

CREATE OR REPLACE FUNCTION generate_wo_number_with_dept(dept_id uuid)
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

  -- Trim and limit length of department code to 4 characters in uppercase
  dept_code := upper(substring(coalesce(dept_code, 'ENGN') from 1 for 4));

  -- 3. Get individual parts for date (aa and cc)
  year_part := to_char(now(), 'YY'); -- aa (2 digit tahun)
  month_part := to_char(now(), 'MM'); -- cc (2 digit bulan)

  -- 4. Concatenate into WOaa/bbb/cc/dddd format
  wo_num := 'WO' || year_part || '/' || dept_code || '/' || month_part || '/' || lpad(seq_val::text, 4, '0');

  RETURN wo_num;
END;
$$;
