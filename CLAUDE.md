# HOUSSEM ACADEMY - PROJECT GOVERNANCE

---

## MISSION DU PROJET

Application de gestion scolaire complète (Houssem Academy).

**Stack technique:**
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: Supabase (29 migrations SQL)
- Mobile: Capacitor (iOS + Android)
- Déploiement: Vercel (prod live)

**Rôles utilisateurs:** Admin, Enseignant, Étudiant, Parent

---

## ÉTAT ACTUEL (2026-07-01)

- **Phase 4 Publication: 60% en cours** (score global projet: 85%)
- **Web prod:** OK, responsive pass done
- **Statut:** PAUSED depuis 2026-06-17 PM
- **Prochain point de décision:** Clarifier web-mobile vs Play Store + choix OAuth (web OU APK build + native OAuth)

---

## DOCUMENTATION DE RÉFÉRENCE

Lire avant toute modification substantielle:
- `AUDIT-COMPLET-PROJET.md` — Audit détaillé (stack, fonctionnalités, phases)
- `CHECKLIST-LIVRAISON-FINALE.md` — Checklist de livraison
- `ACCES-DASHBOARD.md` — Accès dashboard
- `FINAL-COMPLETE.md` — État final connu

---

## RÈGLES PROJET

- **Communication:** Français avec l'utilisateur, identifiants/comments en anglais
- **UI text:** Selon spec client (vérifier avant livraison)
- **Pas de push direct sur:** `main`, `master`, `develop` — toujours brancher (`feature/*`, `bugfix/*`)
- **Secrets:** `.env*` déjà dans `.gitignore`. Ne jamais committer `COMPTES-*.md`, `CREDENTIALS-*.md`, `.claude/`, `.mcp.json`
- **Approche:** Propose, don't impose. Présenter l'approche avant d'exécuter le non-trivial.

---

## LIEN VERS LA GOUVERNANCE GLOBALE

Voir `C:\Users\MOHAMEDKHALILBECH\CLAUDE.md` (parent dir) pour:
- Profil utilisateur
- Index des projets
- Règles globales (sécurité, git, agents, coding style)
- Protocol de session

---

## MÉMOIRE AUTO

Namespace mémoire Claude Code pour ce projet:
`C:\Users\MOHAMEDKHALILBECH\.claude\projects\C--Users-MOHAMEDKHALILBECH-HOUSSEM-ACADEMY\memory\`

Mémoire globale (tous projets): `C--Users-MOHAMEDKHALILBECH`

---

**Créé le:** 2026-07-01
**Auteur:** Claude, à la demande utilisateur (cleanup setup)
