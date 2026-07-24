-- get_attendance_with_names was defined in older migrations that were never
-- applied to this project, so attendance reads (teacher active session + admin
-- attendance page) returned nothing. Recreate it, hardened.

CREATE OR REPLACE FUNCTION public.get_attendance_with_names(_session_id uuid)
RETURNS TABLE(
  id uuid,
  student_id uuid,
  full_name text,
  status text,
  arrival_time time without time zone,
  notes text,
  marked_by uuid,
  marked_at timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_role text;
BEGIN
  SELECT ur.role_name INTO v_user_role
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.user_id = auth.uid();

  IF v_user_role NOT IN ('prof', 'admin') THEN
    RAISE EXCEPTION 'Permission denied: Only teachers and admins can read attendance';
  END IF;

  RETURN QUERY
  SELECT
    ar.id,
    ar.student_id,
    COALESCE(NULLIF(TRIM(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')), ''), p.email, 'Élève') AS full_name,
    ar.status,
    ar.arrival_time,
    ar.notes,
    ar.marked_by,
    ar.marked_at,
    ar.created_at
  FROM public.attendance_records ar
  LEFT JOIN public.profiles p ON ar.student_id = p.user_id
  WHERE ar.session_id = _session_id
  ORDER BY full_name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_attendance_with_names(uuid) TO authenticated;
