CREATE POLICY "notifications: propre DELETE" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
