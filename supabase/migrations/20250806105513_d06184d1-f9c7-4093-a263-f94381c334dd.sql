-- Fix all remaining security issues

-- 1. Enable RLS on profiles table and add appropriate policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin());

-- Allow admins to update all profiles (for role assignments)
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (is_admin());

-- 2. Enable RLS on profiles_backup_pre_reconstruct table
ALTER TABLE public.profiles_backup_pre_reconstruct ENABLE ROW LEVEL SECURITY;

-- Only admins can access backup table
CREATE POLICY "Only admins can access backup profiles" 
ON public.profiles_backup_pre_reconstruct 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- 3. Fix the function with mutable search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, role_id)
  VALUES (NEW.id, NULL, NULL, (SELECT id FROM public.user_roles WHERE role_name = 'student'));
  RETURN NEW;
END;
$function$;