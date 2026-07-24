-- Fix signup approval: pending users get role_id NULL until admin approves

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS requested_role text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  admin_role_id integer;
  requested text;
BEGIN
  SELECT id INTO admin_role_id FROM public.user_roles WHERE role_name = 'admin' LIMIT 1;
  requested := COALESCE(NEW.raw_user_meta_data->>'role', 'student');

  IF NEW.email = 'houssemacademie@gmail.com' THEN
    INSERT INTO public.profiles (user_id, first_name, last_name, email, requested_role, role_id)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.email,
      'admin',
      admin_role_id
    );
  ELSE
    INSERT INTO public.profiles (user_id, first_name, last_name, email, requested_role, role_id)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.email,
      requested,
      NULL
    );
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_approval_status(user_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT CASE
    WHEN EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON ur.id = p.role_id
      WHERE p.user_id = user_uuid AND ur.role_name = 'admin'
    ) THEN 'approved'
    WHEN EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = user_uuid AND role_id IS NOT NULL
    ) THEN 'approved'
    WHEN EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = user_uuid AND role_id IS NULL
    ) THEN 'pending'
    ELSE 'rejected'
  END;
$function$;
