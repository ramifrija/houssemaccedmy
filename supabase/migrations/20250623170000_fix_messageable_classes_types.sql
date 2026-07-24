-- Fix bigint type mismatch on get_messageable_classes (classes.id is bigint)
DROP FUNCTION IF EXISTS public.send_message_to_class(integer, text, text);
DROP FUNCTION IF EXISTS public.send_message_to_class(bigint, text, text);
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

GRANT EXECUTE ON FUNCTION public.get_messageable_classes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_message_to_class(bigint, text, text) TO authenticated;
