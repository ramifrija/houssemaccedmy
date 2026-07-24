-- Fix foreign key relationship between profiles and user_roles
-- This relationship was accidentally removed in the last migration

-- First, let's restore the foreign key constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_role 
FOREIGN KEY (role_id) REFERENCES public.user_roles(id);

-- Also ensure we have an admin user properly set up
-- Check if admin role exists, if not create it
INSERT INTO public.user_roles (id, role_name) 
VALUES (3, 'admin') 
ON CONFLICT (id) DO NOTHING;

-- Create a procedure to ensure the admin user gets the admin role
CREATE OR REPLACE FUNCTION public.ensure_admin_role_for_specific_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $function$
BEGIN
  -- Update the specific admin user to have admin role
  UPDATE public.profiles 
  SET role_id = (SELECT id FROM public.user_roles WHERE role_name = 'admin')
  WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email = 'houssemacademie@gmail.com'
  );
END;
$function$;

-- Execute the function to fix the admin user
SELECT public.ensure_admin_role_for_specific_user();

-- Update the handle_new_user function to be smarter about admin users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $function$
BEGIN
  -- Check if this is the admin email
  IF NEW.email = 'houssemacademie@gmail.com' THEN
    -- Give admin role immediately
    INSERT INTO public.profiles (user_id, first_name, last_name, role_id)
    VALUES (NEW.id, NULL, NULL, (SELECT id FROM public.user_roles WHERE role_name = 'admin'));
  ELSE
    -- Give student role for other users (they need approval)
    INSERT INTO public.profiles (user_id, first_name, last_name, role_id)
    VALUES (NEW.id, NULL, NULL, (SELECT id FROM public.user_roles WHERE role_name = 'student'));
  END IF;
  RETURN NEW;
END;
$function$;