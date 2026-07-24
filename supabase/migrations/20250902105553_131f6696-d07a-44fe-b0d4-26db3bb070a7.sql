-- Créer une fonction pour créer des sessions de test avec des privilèges administrateur
CREATE OR REPLACE FUNCTION public.create_test_attendance_session(
  p_class_id BIGINT,
  p_teacher_id UUID,
  p_subject TEXT DEFAULT 'Mathématiques'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_session_id UUID;
  v_now TIMESTAMP := NOW();
BEGIN
  -- Créer la session
  INSERT INTO public.attendance_sessions (
    id, class_id, teacher_id, subject, session_date, start_time, end_time
  )
  VALUES (
    gen_random_uuid(),
    p_class_id,
    p_teacher_id,
    p_subject,
    v_now::DATE,
    v_now::TIME,
    (v_now + INTERVAL '1 hour')::TIME
  )
  RETURNING id INTO v_session_id;

  -- Créer les fiches de présence pour tous les étudiants de la classe
  INSERT INTO public.attendance_records (
    id, session_id, student_id, status
  )
  SELECT
    gen_random_uuid(),
    v_session_id,
    se.student_id,
    'absent'
  FROM public.student_enrollments se
  WHERE se.class_id = p_class_id;

  RETURN v_session_id;
END;
$$;

-- Exécuter la fonction pour créer une session de test
SELECT public.create_test_attendance_session(
  1, -- class_id
  '1bdc3e2c-4e47-4beb-b6dc-f9c58c6057d7'::UUID -- teacher_id trouvé précédemment
) as session_id;