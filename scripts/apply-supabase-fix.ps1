# Applique la migration fix_admin_create_teacher via Supabase CLI
# Prérequis: npx supabase login (une seule fois)

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host "==> Liaison projet ksbgydgkufejxrjmrysw..."
npx supabase link --project-ref ksbgydgkufejxrjmrysw --yes

Write-Host "==> Application migration..."
npx supabase db query --linked -f "supabase/migrations/20250618140000_fix_admin_create_teacher.sql"

Write-Host "==> Vérification user_roles..."
npx supabase db query --linked "SELECT id, role_name FROM public.user_roles ORDER BY id;"

Write-Host "==> Déploiement edge function create-user..."
npx supabase functions deploy create-user --project-ref ksbgydgkufejxrjmrysw

Write-Host "OK - migration appliquée et edge function déployée."
