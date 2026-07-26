-- Create matieres table
CREATE TABLE IF NOT EXISTS public.matieres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.matieres ENABLE ROW LEVEL SECURITY;

-- Create policies for matieres
-- Everyone (authenticated) can read matieres
CREATE POLICY "Matieres are viewable by all authenticated users"
ON public.matieres FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert matieres
CREATE POLICY "Admins can insert matieres"
ON public.matieres FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Only admins can update matieres
CREATE POLICY "Admins can update matieres"
ON public.matieres FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Only admins can delete matieres
CREATE POLICY "Admins can delete matieres"
ON public.matieres FOR DELETE
TO authenticated
USING (public.is_admin());
