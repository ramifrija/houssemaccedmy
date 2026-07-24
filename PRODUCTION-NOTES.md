# Notes de production — Houssem Academy

**Dernière mise à jour :** 17 juin 2026  
**Commit déployé :** UX/bugs fix (navigation, auth, données réelles)

---

## Création utilisateurs par l'admin

- Page **Utilisateurs** → formulaire « Ajouter un élève / professeur ».
- API serveur : `/api/create-user` (déployée automatiquement sur Vercel).

### Une seule config Vercel requise

1. [Supabase Dashboard](https://supabase.com/dashboard/project/ksbgydgkufejxrjmrysw/settings/api) → **service_role** (secret) → copier
2. [Vercel Dashboard](https://vercel.com) → projet Houssem Academy → **Settings** → **Environment Variables**
3. Ajouter : `SUPABASE_SERVICE_ROLE_KEY` = (coller la clé service_role)
4. Cocher **Production**, **Preview**, **Development** → **Save**
5. **Deployments** → dernier déploiement → **Redeploy**

Optionnel (Edge Function Supabase) : `supabase functions deploy create-user`


Exécuter dans **SQL Editor** le fichier :
`supabase/migrations/20250617120000_fix_signup_approval_flow.sql`

Cela corrige le trigger `handle_new_user` pour que les nouveaux comptes restent en attente (`role_id = NULL`) jusqu'à validation admin.


## État d'avancement global — ~90% web livré

| Phase | Statut | Détail |
|-------|--------|--------|
| Migration Supabase | ✅ Fait | Ancien `ziaqrvgnxzwhrpqcsepj` → nouveau `ksbgydgkufejxrjmrysw` |
| Restauration données | ✅ Fait | Users, profils, cours restaurés |
| Site web live | ✅ Fait | https://houssemacademy.com |
| Vercel + GitHub sync | ✅ Fait | Push `main` → auto-deploy Vercel |
| Sécurité & nettoyage code | ✅ Fait | Headers HTTP, keystore externalisé, docs sensibles retirés |
| OAuth Google | ⏳ À faire | Code UI prêt, config Google Cloud + Supabase manquante |
| Mobile Android | ⏳ À faire | Java 21 + `keystore.properties` + Play Store |

---

## Infrastructure actuelle

| Service | Détail |
|---------|--------|
| **Web** | https://houssemacademy.com (Vercel) |
| **GitHub** | https://github.com/khalilb19/HOUSSEM-ACADEMY |
| **Supabase** | https://ksbgydgkufejxrjmrysw.supabase.co |
| **Mobile** | `com.houssemacademy.mobile` (Android) |

### Données restaurées (vérifié SQL)

- admin : 3 | prof : 1 | student : 1 | parent : 1
- Compte admin principal : `houssemacademie@gmail.com`

---

## Variables d'environnement (Vercel)

- `VITE_SUPABASE_URL` = `https://ksbgydgkufejxrjmrysw.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = clé anon (Supabase → Settings → API)

Ne jamais committer les clés dans le code source.

---

## Authentification Supabase

Dashboard → Authentication → URL Configuration :

- Site URL : `https://houssemacademy.com`
- Redirect URLs : `https://houssemacademy.com/**`, `http://localhost:8080/**`

---

## Build Android (keystore)

1. Copier `android/keystore.properties.example` → `android/keystore.properties`
2. Remplir les mots de passe (fichier gitignoré)
3. Keystore dans `android/app/houssem-academy-key.keystore`
4. Build : `KEYSTORE_PASSWORD=... npm run create:keystore` si besoin

---

## Checklist production

- [x] Migration Supabase vers nouveau projet
- [x] Login admin en production
- [x] Déploiement Vercel à jour
- [x] Nettoyage sécurité code
- [ ] Rotation mots de passe exposés (admin + DB Supabase)
- [ ] Test refresh routes `/calendar`, `/users` après deploy headers
- [ ] OAuth Google
- [ ] Publication Google Play

---

## Prochaine session — par où reprendre

1. **OAuth Google** → `GUIDE-CONFIGURATION-OAUTH-GOOGLE.md`
   - Google Cloud : redirect `https://ksbgydgkufejxrjmrysw.supabase.co/auth/v1/callback`
   - Supabase : activer provider Google

2. **Mobile** → `MOBILE-DEPLOYMENT.md`
   - Installer Java 21
   - Créer `android/keystore.properties`
   - Générer App Bundle signé

3. **Sécurité** → rotater credentials admin si pas encore fait

---

## Commits récents

| Commit | Description |
|--------|-------------|
| `99fd4a3` | Sécurité + nettoyage (headers, keystore, BYPASS supprimé) |
| `9dbefa9` | Migration nouveau Supabase + vercel.json |
