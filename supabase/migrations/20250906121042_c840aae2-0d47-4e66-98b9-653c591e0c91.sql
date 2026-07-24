-- Fix search_path for the remaining function that still has mutable search_path
CREATE OR REPLACE FUNCTION public.is_parent()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.user_id = auth.uid() AND ur.role_name = 'parent'
  );
END;
$$;