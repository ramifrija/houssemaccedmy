-- Grades table, class messaging, messaging participant policy fix

CREATE TABLE IF NOT EXISTS public.grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  subject text NOT NULL,
  score numeric(5,2) NOT NULL CHECK (score >= 0),
  max_score numeric(5,2) NOT NULL DEFAULT 20 CHECK (max_score > 0),
  observations text,
  term text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grades_student_id ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_teacher_id ON public.grades(teacher_id);
CREATE INDEX IF NOT EXISTS idx_grades_course_id ON public.grades(course_id);

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students read own grades" ON public.grades;
CREATE POLICY "Students read own grades"
ON public.grades FOR SELECT
USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Teachers read own given grades" ON public.grades;
CREATE POLICY "Teachers read own given grades"
ON public.grades FOR SELECT
USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage all grades" ON public.grades;
CREATE POLICY "Admins manage all grades"
ON public.grades FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Teachers insert grades" ON public.grades;
CREATE POLICY "Teachers insert grades"
ON public.grades FOR INSERT
WITH CHECK (
  teacher_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON ur.id = p.role_id
    WHERE p.user_id = auth.uid() AND ur.role_name = 'prof'
  )
);

DROP POLICY IF EXISTS "Teachers update own grades" ON public.grades;
CREATE POLICY "Teachers update own grades"
ON public.grades FOR UPDATE
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Teachers delete own grades" ON public.grades;
CREATE POLICY "Teachers delete own grades"
ON public.grades FOR DELETE
USING (teacher_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.grades TO authenticated;

-- Allow profs/admins to add conversation participants (fixes group & 1:1 messaging)
DROP POLICY IF EXISTS "Users can add themselves to conversations" ON public.conversation_participants;

CREATE POLICY "Conversation participants insert"
ON public.conversation_participants FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON ur.id = p.role_id
    WHERE p.user_id = auth.uid() AND ur.role_name IN ('admin', 'prof')
  )
);

-- Classes available for broadcast messaging
DROP FUNCTION IF EXISTS public.get_messageable_classes();

CREATE OR REPLACE FUNCTION public.get_messageable_classes()
RETURNS TABLE (
  class_id bigint,
  class_name text,
  student_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  SELECT ur.role_name INTO v_role
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.id = p.role_id
  WHERE p.user_id = auth.uid();

  IF v_role NOT IN ('admin', 'prof') THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.name,
    COUNT(se.student_id)
  FROM public.classes c
  LEFT JOIN public.student_enrollments se ON se.class_id = c.id
  GROUP BY c.id, c.name
  ORDER BY c.name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_messageable_classes() TO authenticated;

-- Broadcast message to all students in a class (one conversation, all participants)
DROP FUNCTION IF EXISTS public.send_message_to_class(integer, text, text);

CREATE OR REPLACE FUNCTION public.send_message_to_class(
  p_class_id bigint,
  p_content text,
  p_title text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
  v_role text;
  v_class_name text;
  v_student record;
BEGIN
  SELECT ur.role_name INTO v_role
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.id = p.role_id
  WHERE p.user_id = auth.uid();

  IF v_role NOT IN ('admin', 'prof') THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  SELECT name INTO v_class_name FROM public.classes WHERE id = p_class_id;
  IF v_class_name IS NULL THEN
    RAISE EXCEPTION 'Class not found';
  END IF;

  INSERT INTO public.conversations (title, is_group, created_by)
  VALUES (COALESCE(p_title, 'Classe ' || v_class_name), true, auth.uid())
  RETURNING id INTO v_conversation_id;

  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (v_conversation_id, auth.uid());

  FOR v_student IN
    SELECT se.student_id
    FROM public.student_enrollments se
    WHERE se.class_id = p_class_id
      AND se.student_id <> auth.uid()
  LOOP
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES (v_conversation_id, v_student.student_id)
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
  END LOOP;

  INSERT INTO public.messages (conversation_id, sender_id, content)
  VALUES (v_conversation_id, auth.uid(), p_content);

  RETURN v_conversation_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_message_to_class(bigint, text, text) TO authenticated;
