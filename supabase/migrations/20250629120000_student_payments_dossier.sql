-- Student monthly subscription payments (admin-managed)

CREATE TABLE IF NOT EXISTS public.student_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  month smallint NOT NULL CHECK (month BETWEEN 1 AND 12),
  year smallint NOT NULL CHECK (year BETWEEN 2020 AND 2100),
  amount_due numeric(10, 2) NOT NULL DEFAULT 0,
  amount_paid numeric(10, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'partial', 'unpaid')),
  paid_at timestamptz,
  payment_method text,
  notes text,
  recorded_by uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_student_payments_student ON public.student_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_payments_period ON public.student_payments(year DESC, month DESC);

ALTER TABLE public.student_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage student payments" ON public.student_payments;
CREATE POLICY "Admins manage student payments"
ON public.student_payments FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Students read own payments" ON public.student_payments;
CREATE POLICY "Students read own payments"
ON public.student_payments FOR SELECT
TO authenticated
USING (student_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_payments TO authenticated;

CREATE OR REPLACE FUNCTION public.student_payment_status(p_amount_due numeric, p_amount_paid numeric)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_amount_paid >= p_amount_due AND p_amount_due > 0 THEN 'paid'
    WHEN p_amount_paid > 0 THEN 'partial'
    ELSE 'unpaid'
  END;
$$;
