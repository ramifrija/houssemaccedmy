-- Drop and recreate functions with correct types and search_path

-- Drop existing function that has wrong return type
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- Recreate with correct return type and search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT ur.role_name
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.user_id = user_uuid
  LIMIT 1;
$function$;