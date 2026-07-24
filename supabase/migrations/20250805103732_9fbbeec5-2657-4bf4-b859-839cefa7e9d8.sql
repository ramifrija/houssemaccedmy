-- CRITICAL SECURITY FIXES

-- 1. Enable RLS on missing tables
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;

-- 2. Create comprehensive RLS policies for teacher_classes
CREATE POLICY "Admins can manage all teacher-class assignments" 
ON public.teacher_classes 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Teachers can view their own class assignments" 
ON public.teacher_classes 
FOR SELECT 
USING (auth.uid() = teacher_id);

-- 3. Create comprehensive RLS policies for student_enrollments
CREATE POLICY "Admins can manage all student enrollments" 
ON public.student_enrollments 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Students can view their own enrollments" 
ON public.student_enrollments 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view enrollments for their classes" 
ON public.student_enrollments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.teacher_classes tc 
    WHERE tc.teacher_id = auth.uid() 
    AND tc.class_id = student_enrollments.class_id
  )
);

CREATE POLICY "Parents can view their children's enrollments" 
ON public.student_enrollments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.parent_id = auth.uid() 
    AND p.user_id = student_enrollments.student_id
  )
);

-- 4. Fix database functions security - add SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = 'admin' AND status = 'approved'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.user_id = auth.uid() AND ur.role_name = 'admin'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_prof()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS ( 
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role_id = 2 
  );
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

-- 5. Add user approval status tracking function
CREATE OR REPLACE FUNCTION public.get_user_approval_status(user_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT COALESCE(
    (SELECT 'approved' FROM public.profiles WHERE user_id = user_uuid AND role_id IS NOT NULL),
    'pending'
  );
$function$;

-- 6. Create base data - user roles with proper security
INSERT INTO public.user_roles (id, role_name) VALUES 
  (1, 'admin'),
  (2, 'teacher'), 
  (3, 'student'),
  (4, 'parent')
ON CONFLICT (role_name) DO NOTHING;

-- 7. Update profiles table policies to use approval status
DROP POLICY IF EXISTS "Allow authenticated users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());