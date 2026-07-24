-- Fix search_path for security definer functions that don't have it set
CREATE OR REPLACE FUNCTION public.audit_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE NOTICE 'Profile Update Attempt:
    Old Values: % %
    New Values: % %
    Current User: %',
    OLD.first_name, OLD.last_name,
    NEW.first_name, NEW.last_name,
    current_user;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_attendance_session(p_class_id bigint, p_subject text, p_session_date date, p_start_time time without time zone, p_end_time time without time zone, p_notes text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id UUID;
  v_user_role TEXT;
BEGIN
  -- Vérifier que l'utilisateur est professeur ou admin
  SELECT ur.role_name INTO v_user_role
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.user_id = auth.uid();
  
  IF v_user_role NOT IN ('prof', 'admin') THEN
    RAISE EXCEPTION 'Permission denied: Only teachers and admins can create attendance sessions';
  END IF;

  -- Créer la session
  INSERT INTO public.attendance_sessions (
    class_id, teacher_id, subject, session_date, start_time, end_time, notes
  ) VALUES (
    p_class_id, auth.uid(), p_subject, p_session_date, p_start_time, p_end_time, p_notes
  ) RETURNING id INTO v_session_id;

  -- Créer automatiquement les enregistrements pour tous les étudiants de la classe
  INSERT INTO public.attendance_records (session_id, student_id, status)
  SELECT v_session_id, se.student_id, 'absent'
  FROM public.student_enrollments se
  WHERE se.class_id = p_class_id;

  RETURN v_session_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_title text, p_content text, p_type text, p_priority text DEFAULT 'normal'::text, p_related_id uuid DEFAULT NULL::uuid, p_related_table text DEFAULT NULL::text, p_scheduled_for timestamp with time zone DEFAULT NULL::timestamp with time zone)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id, title, content, type, priority, related_id, related_table, scheduled_for
  ) VALUES (
    p_user_id, p_title, p_content, p_type, p_priority, p_related_id, p_related_table, p_scheduled_for
  ) RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;