-- Créer une politique RLS pour permettre le SELECT aux utilisateurs avec le rôle service_role
-- Cela est essentiel pour les outils d'administration ou les utilisateurs super-admin qui ont besoin d'accéder à toutes les données
CREATE POLICY "Enable read-only access for service role"
ON "public"."attendance_records"
FOR SELECT
TO service_role
USING (true);