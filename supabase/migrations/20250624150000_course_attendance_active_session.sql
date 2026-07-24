-- Link attendance to calendar course sessions + upsert marks + ensure RPC

ALTER TABLE public.attendance_sessions
ADD COLUMN IF NOT EXISTS course_session_id uuid REFERENCES public.course_sessions(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_sessions_course_session
ON public.attendance_sessions(course_session_id)
WHERE course_session_id IS NOT NULL;

ALTER TABLE public.attendance_records
DROP CONSTRAINT IF EXISTS attendance_records_session_student_unique;

ALTER TABLE public.attendance_records
ADD CONSTRAINT attendance_records_session_student_unique UNIQUE (session_id, student_id);

CREATE OR REPLACE FUNCTION public.ensure_attendance_for_course_session(p_course_session_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_existing uuid;
  v_cs record;
  v_session_id uuid;
  v_user_role text;
BEGIN
  SELECT ur.role_name INTO v_user_role
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.user_id = auth.uid();

  IF v_user_role NOT IN ('prof', 'admin') THEN
    RAISE EXCEPTION 'Permission denied: Only teachers and admins can manage attendance';
  END IF;

  SELECT id INTO v_existing
  FROM public.attendance_sessions
  WHERE course_session_id = p_course_session_id;

  IF v_existing IS NOT NULL THEN
    INSERT INTO public.attendance_records (session_id, student_id, status)
    SELECT v_existing, se.student_id, 'absent'
    FROM public.student_enrollments se
    JOIN public.attendance_sessions ats ON ats.id = v_existing
    WHERE se.class_id = ats.class_id
    ON CONFLICT (session_id, student_id) DO NOTHING;

    RETURN v_existing;
  END IF;

  SELECT
    cs.session_date,
    cs.start_time,
    cs.end_time,
    cs.notes,
    c.name AS course_name,
    c.class_id,
    c.teacher_id
  INTO v_cs
  FROM public.course_sessions cs
  JOIN public.courses c ON c.id = cs.course_id
  WHERE cs.id = p_course_session_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Course session not found';
  END IF;

  IF v_user_role = 'prof' AND v_cs.teacher_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Permission denied: not your course session';
  END IF;

  INSERT INTO public.attendance_sessions (
    class_id,
    teacher_id,
    subject,
    session_date,
    start_time,
    end_time,
    notes,
    course_session_id
  ) VALUES (
    v_cs.class_id,
    v_cs.teacher_id,
    v_cs.course_name,
    v_cs.session_date,
    v_cs.start_time,
    v_cs.end_time,
    v_cs.notes,
    p_course_session_id
  ) RETURNING id INTO v_session_id;

  INSERT INTO public.attendance_records (session_id, student_id, status)
  SELECT v_session_id, se.student_id, 'absent'
  FROM public.student_enrollments se
  WHERE se.class_id = v_cs.class_id
  ON CONFLICT (session_id, student_id) DO NOTHING;

  RETURN v_session_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_attendance(
  p_session_id uuid,
  p_student_id uuid,
  p_status text,
  p_arrival_time time DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS boolean
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
    RAISE EXCEPTION 'Permission denied: Only teachers and admins can mark attendance';
  END IF;

  INSERT INTO public.attendance_records (
    session_id,
    student_id,
    status,
    arrival_time,
    notes,
    marked_by,
    marked_at
  ) VALUES (
    p_session_id,
    p_student_id,
    p_status,
    p_arrival_time,
    p_notes,
    auth.uid(),
    NOW()
  )
  ON CONFLICT (session_id, student_id) DO UPDATE SET
    status = EXCLUDED.status,
    arrival_time = EXCLUDED.arrival_time,
    notes = EXCLUDED.notes,
    marked_by = EXCLUDED.marked_by,
    marked_at = EXCLUDED.marked_at;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_attendance_for_course_session(uuid) TO authenticated;
