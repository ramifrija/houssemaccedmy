-- Fix: admin cannot create teacher accounts ("Database error creating new user")
-- Root cause: handle_new_user() fails on INSERT (role_id NULL, missing columns, or prof/teacher mapping)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS requested_role text;

ALTER TABLE public.profiles
  ALTER COLUMN role_id DROP NOT NULL;

INSERT INTO public.user_roles (id, role_name)
VALUES
  (1, 'admin'),
  (2, 'prof'),
  (3, 'student'),
  (4, 'parent')
ON CONFLICT (id) DO UPDATE
SET role_name = EXCLUDED.role_name;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  admin_role_id integer;
  teacher_role_id integer;
  student_role_id integer;
  parent_role_id integer;
  requested text;
  target_role_id integer;
  is_admin_created boolean;
BEGIN
  SELECT id INTO admin_role_id FROM public.user_roles WHERE role_name = 'admin' LIMIT 1;
  SELECT id INTO teacher_role_id
  FROM public.user_roles
  WHERE role_name IN ('prof', 'teacher')
  ORDER BY CASE role_name WHEN 'prof' THEN 0 ELSE 1 END
  LIMIT 1;
  SELECT id INTO student_role_id FROM public.user_roles WHERE role_name = 'student' LIMIT 1;
  SELECT id INTO parent_role_id FROM public.user_roles WHERE role_name = 'parent' LIMIT 1;

  requested := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  is_admin_created := COALESCE(NEW.raw_user_meta_data->>'created_by_admin', 'false') = 'true';

  IF NEW.email = 'houssemacademie@gmail.com' THEN
    target_role_id := admin_role_id;
    requested := 'admin';
  ELSIF is_admin_created THEN
    target_role_id := CASE requested
      WHEN 'admin' THEN admin_role_id
      WHEN 'teacher' THEN teacher_role_id
      WHEN 'student' THEN student_role_id
      WHEN 'parent' THEN parent_role_id
      ELSE student_role_id
    END;
  ELSE
    target_role_id := NULL;
  END IF;

  INSERT INTO public.profiles (user_id, first_name, last_name, email, requested_role, role_id)
  VALUES (
    NEW.id,
    NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), ''),
    NEW.email,
    requested,
    target_role_id
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user failed for %: %', NEW.email, SQLERRM;
    RAISE;
END;
$function$;
