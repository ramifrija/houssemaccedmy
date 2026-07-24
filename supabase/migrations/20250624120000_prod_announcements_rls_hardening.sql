-- Production: announcements table + RLS hardening on classes/enrollments

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  audience text NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'student', 'prof', 'parent', 'admin')),
  author_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_audience ON public.announcements(audience);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Announcements readable by audience" ON public.announcements;
CREATE POLICY "Announcements readable by audience"
ON public.announcements FOR SELECT
TO authenticated
USING (
  audience = 'all'
  OR public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON ur.id = p.role_id
    WHERE p.user_id = auth.uid()
      AND (
        (announcements.audience = 'student' AND ur.role_name = 'student')
        OR (announcements.audience = 'prof' AND ur.role_name = 'prof')
        OR (announcements.audience = 'parent' AND ur.role_name = 'parent')
        OR (announcements.audience = 'admin' AND ur.role_name = 'admin')
      )
  )
);

DROP POLICY IF EXISTS "Admins manage announcements" ON public.announcements;
CREATE POLICY "Admins manage announcements"
ON public.announcements FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;

-- Classes: restrict writes to admins
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Classes readable by authenticated" ON public.classes;
CREATE POLICY "Classes readable by authenticated"
ON public.classes FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins manage classes" ON public.classes;
CREATE POLICY "Admins manage classes"
ON public.classes FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins update classes" ON public.classes;
CREATE POLICY "Admins update classes"
ON public.classes FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins delete classes" ON public.classes;
CREATE POLICY "Admins delete classes"
ON public.classes FOR DELETE
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins insert enrollments" ON public.student_enrollments;
CREATE POLICY "Admins insert enrollments"
ON public.student_enrollments FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins update enrollments" ON public.student_enrollments;
CREATE POLICY "Admins update enrollments"
ON public.student_enrollments FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins delete enrollments" ON public.student_enrollments;
CREATE POLICY "Admins delete enrollments"
ON public.student_enrollments FOR DELETE
TO authenticated
USING (public.is_admin());
