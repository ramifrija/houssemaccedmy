-- Fix search_path for all remaining functions to resolve security warnings
CREATE OR REPLACE FUNCTION public.get_attendance_with_names(_session_id uuid)
RETURNS TABLE(id uuid, student_id uuid, full_name text, status text, arrival_time time without time zone, notes text, marked_by uuid, marked_at timestamp with time zone, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ar.id,
    ar.student_id,
    COALESCE(p.first_name || ' ' || p.last_name, 'Nom non renseigné') AS full_name,
    ar.status,
    ar.arrival_time,
    ar.notes,
    ar.marked_by,
    ar.marked_at,
    ar.created_at
  FROM
    public.attendance_records ar
  LEFT JOIN
    public.profiles p ON ar.student_id = p.user_id
  WHERE
    ar.session_id = _session_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_student()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.user_id = auth.uid() AND ur.role_name = 'student'
  );
END;
$$;