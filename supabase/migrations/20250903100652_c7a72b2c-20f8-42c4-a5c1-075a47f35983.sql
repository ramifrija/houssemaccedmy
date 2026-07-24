-- Supprimer l'ancienne fonction et créer la nouvelle avec filtrage par session_id
DROP FUNCTION IF EXISTS public.get_attendance_with_names();
DROP FUNCTION IF EXISTS public.get_attendance_with_names(uuid);

CREATE OR REPLACE FUNCTION public.get_attendance_with_names(_session_id uuid)
RETURNS TABLE(
  id uuid, 
  student_id uuid, 
  full_name text, 
  status text, 
  arrival_time time without time zone, 
  notes text, 
  marked_by uuid, 
  marked_at timestamp with time zone, 
  created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $function$
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
$function$;