-- Vérification rapide après fix_admin_create_teacher
-- Exécuter dans SQL Editor si besoin de confirmer

SELECT id, role_name FROM public.user_roles ORDER BY id;

SELECT
  is_nullable = 'YES' AS role_id_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'role_id';

SELECT
  CASE
    WHEN pg_get_functiondef(p.oid) LIKE '%created_by_admin%' THEN 'OK - trigger mis à jour'
    ELSE 'MANQUANT - réexécuter la migration fix_admin_create_teacher'
  END AS migration_status
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'handle_new_user';
