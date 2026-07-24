-- Fix search_path for security definer functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.user_id = auth.uid() AND ur.role_name = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_prof()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS ( 
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role_id = 2 
  );
END;
$$;

-- Add RLS policy for authenticated users to view attendance sessions
CREATE POLICY "Authenticated users can view attendance sessions" 
ON public.attendance_sessions 
FOR SELECT 
TO authenticated
USING (true);