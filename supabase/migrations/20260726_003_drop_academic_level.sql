-- Drop the foreign key and column from classes table
ALTER TABLE public.classes DROP COLUMN IF EXISTS academic_level_id CASCADE;

-- Drop the academic_levels table entirely
DROP TABLE IF EXISTS public.academic_levels CASCADE;
