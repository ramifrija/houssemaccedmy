-- Fix remaining functions that don't have search_path set properly

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT role FROM public.user_roles 
  WHERE user_id = user_uuid AND status = 'approved'
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.is_user_approved(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND status = 'approved'
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_approval_status(user_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT CASE 
    WHEN EXISTS (SELECT 1 FROM public.profiles WHERE user_id = user_uuid AND role_id IS NOT NULL) 
    THEN 'approved'
    ELSE 'pending'
  END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role_id()
RETURNS smallint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    user_role_id_val smallint;
BEGIN
    SELECT role_id INTO user_role_id_val FROM public.profiles WHERE user_id = auth.uid();
    RETURN user_role_id_val;
END;
$function$;

CREATE OR REPLACE FUNCTION public.audit_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;