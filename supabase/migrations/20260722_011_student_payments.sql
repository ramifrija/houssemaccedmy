-- ============================================================================
-- FICHIER  : 011 / 14 — TABLE: student_payments  (paiements des élèves)
-- EXÉCUTER : en 11ème dans le SQL Editor de Supabase
-- DÉPENDANCES : fichier 002 (profiles)
-- DESCRIPTION :
--   Gère le suivi financier des élèves (frais de scolarité, autres paiements).
--   Accessible uniquement aux admins (données financières sensibles).
--   Fonctionnalités :
--     • Enregistrement des paiements avec montant, méthode, date
--     • Statuts : pending, completed, failed, refunded
--     • Traçabilité : recorded_by = admin qui a saisi le paiement
-- ============================================================================


-- ============================================================================
-- SECTION A — CRÉATION DE LA TABLE student_payments
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.student_payments (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID          NOT NULL                              -- Élève concerné
                    REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  amount          NUMERIC(10,2) NOT NULL                              -- Montant payé
                    CHECK (amount >= 0),
  payment_date    DATE          NOT NULL,                             -- Date du paiement
  payment_method  TEXT          NOT NULL,                             -- Méthode (cash, virement, chèque...)
  status          TEXT          NOT NULL DEFAULT 'completed'
                    CHECK (status IN ('pending','completed','failed','refunded')),
  reference       TEXT,                                                -- Référence ou numéro de transaction
  notes           TEXT,                                                -- Notes sur le paiement
  recorded_by     UUID                                                -- Admin ayant saisi le paiement
                    REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index pour les rapports et filtres fréquents
CREATE INDEX IF NOT EXISTS idx_payments_student_id   ON public.student_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.student_payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status       ON public.student_payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_recorded_by  ON public.student_payments(recorded_by);


-- ============================================================================
-- SECTION B — ROW LEVEL SECURITY (RLS)
-- • Admin : accès total (seul rôle pouvant gérer les paiements)
-- • Élève : peut consulter SES propres paiements (lecture seule)
-- • Parent: peut consulter les paiements de son enfant
-- • Prof  : aucun accès (données financières privées)
-- ============================================================================

ALTER TABLE public.student_payments ENABLE ROW LEVEL SECURITY;

-- Admin : accès total à tous les paiements
DROP POLICY IF EXISTS "payments: admin ALL" ON public.student_payments;
CREATE POLICY "payments: admin ALL"
  ON public.student_payments FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Élève : peut voir uniquement SES propres paiements
DROP POLICY IF EXISTS "payments: élève SELECT propres" ON public.student_payments;
CREATE POLICY "payments: élève SELECT propres"
  ON public.student_payments FOR SELECT
  USING (student_id = auth.uid());

-- Parent : peut voir les paiements de son enfant
DROP POLICY IF EXISTS "payments: parent SELECT enfant" ON public.student_payments;
CREATE POLICY "payments: parent SELECT enfant"
  ON public.student_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = student_payments.student_id
        AND p.parent_id = auth.uid()
    )
  );
