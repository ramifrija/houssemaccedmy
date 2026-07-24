-- FK pour permettre les jointures PostgREST profiles <-> student_enrollments
ALTER TABLE public.student_enrollments
  DROP CONSTRAINT IF EXISTS student_enrollments_student_id_fkey;

ALTER TABLE public.student_enrollments
  ADD CONSTRAINT student_enrollments_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.get_my_conversations()
RETURNS TABLE (
  conversation_id uuid,
  title text,
  is_group boolean,
  other_user_id uuid,
  other_first_name text,
  other_last_name text,
  other_role text,
  last_message text,
  last_message_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.title,
    c.is_group,
    other_p.user_id,
    other_p.first_name,
    other_p.last_name,
    other_ur.role_name,
    (
      SELECT m.content
      FROM public.messages m
      WHERE m.conversation_id = c.id AND NOT m.is_deleted
      ORDER BY m.sent_at DESC
      LIMIT 1
    ),
    (
      SELECT m.sent_at
      FROM public.messages m
      WHERE m.conversation_id = c.id AND NOT m.is_deleted
      ORDER BY m.sent_at DESC
      LIMIT 1
    ),
    c.updated_at
  FROM public.conversations c
  JOIN public.conversation_participants my_cp
    ON my_cp.conversation_id = c.id AND my_cp.user_id = auth.uid()
  LEFT JOIN public.conversation_participants other_cp
    ON other_cp.conversation_id = c.id
    AND other_cp.user_id <> auth.uid()
    AND NOT c.is_group
  LEFT JOIN public.profiles other_p ON other_p.user_id = other_cp.user_id
  LEFT JOIN public.user_roles other_ur ON other_ur.id = other_p.role_id
  ORDER BY c.updated_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_conversations() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_messageable_contacts()
RETURNS TABLE (
  user_id uuid,
  first_name text,
  last_name text,
  role_name text
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

  IF v_role = 'student' THEN
    RETURN QUERY
    SELECT p.user_id, p.first_name, p.last_name, ur.role_name
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.id = p.role_id
    WHERE ur.role_name IN ('prof', 'admin')
      AND p.user_id <> auth.uid()
    ORDER BY p.last_name, p.first_name;
  ELSIF v_role IN ('prof', 'admin') THEN
    RETURN QUERY
    SELECT p.user_id, p.first_name, p.last_name, ur.role_name
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.id = p.role_id
    WHERE ur.role_name IN ('student', 'prof', 'admin', 'parent')
      AND p.user_id <> auth.uid()
    ORDER BY p.last_name, p.first_name;
  ELSE
    RETURN QUERY
    SELECT p.user_id, p.first_name, p.last_name, ur.role_name
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.id = p.role_id
    WHERE ur.role_name IN ('prof', 'admin')
      AND p.user_id <> auth.uid()
    ORDER BY p.last_name, p.first_name;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_messageable_contacts() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;

  DELETE FROM public.profiles WHERE user_id = p_user_id;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;
