# 📋 GUIDE : RÉCUPÉRER LES COMPTES PROFESSEURS DEPUIS SUPABASE

## 🎯 OBJECTIF

Récupérer la liste complète des comptes professeurs que vous avez créés dans Supabase.

---

## 🔍 MÉTHODE 1 : Via Supabase Dashboard (Le plus simple)

### **Étapes :**

1. **Aller sur le Dashboard Supabase**
   - URL : https://supabase.com/dashboard/project/ziaqrvgnxzwhrpqcsepj
   - Se connecter avec vos identifiants

2. **Naviguer vers SQL Editor**
   - Menu de gauche → **SQL Editor**
   - Cliquer sur **New Query**

3. **Copier-coller cette requête :**

```sql
-- Récupérer tous les professeurs
SELECT 
  u.email,
  CONCAT(p.first_name, ' ', p.last_name) as nom_complet,
  ur.role_name as role,
  u.created_at as date_creation,
  p.status as statut
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
LEFT JOIN public.user_roles ur ON ur.id = p.role_id
WHERE ur.role_name IN ('teacher', 'prof')
ORDER BY u.created_at DESC;
```

4. **Exécuter la requête**
   - Cliquer sur **Run** ou appuyer sur `Ctrl+Enter`
   - Les résultats s'afficheront dans un tableau

5. **Exporter les résultats**
   - Cliquer sur le bouton **Export** (icône de téléchargement)
   - Choisir le format (CSV, JSON, etc.)

---

## 🔍 MÉTHODE 2 : Via Authentication → Users

### **Étapes :**

1. **Aller sur Authentication**
   - Menu de gauche → **Authentication** → **Users**

2. **Voir tous les utilisateurs**
   - La liste de tous les utilisateurs s'affiche
   - Vous pouvez filtrer par email ou date

3. **Pour chaque utilisateur :**
   - Cliquer sur l'email pour voir les détails
   - Vérifier le rôle dans la section **User Metadata** ou **App Metadata**

---

## 🔍 MÉTHODE 3 : Requête SQL Complète (Avec mots de passe)

> ⚠️ **ATTENTION :** Les mots de passe sont cryptés dans Supabase et ne peuvent pas être récupérés en clair. Vous devrez les réinitialiser.

### **Pour récupérer les emails et réinitialiser les mots de passe :**

```sql
-- Récupérer les emails des professeurs
SELECT 
  u.email,
  CONCAT(p.first_name, ' ', p.last_name) as nom_complet,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
LEFT JOIN public.user_roles ur ON ur.id = p.role_id
WHERE ur.role_name IN ('teacher', 'prof')
ORDER BY u.created_at DESC;
```

**Note :** Pour réinitialiser un mot de passe, utilisez l'interface Supabase Auth ou envoyez un email de réinitialisation.

---

## 📊 SCRIPT SQL COMPLET

Le fichier `recuperer-comptes-professeurs.sql` contient plusieurs requêtes utiles :

1. **Requête complète** avec toutes les informations
2. **Requête simplifiée** avec email et nom
3. **Compteur** du nombre de professeurs

**Pour l'utiliser :**
1. Ouvrir le fichier `recuperer-comptes-professeurs.sql`
2. Copier la requête souhaitée
3. Coller dans le SQL Editor de Supabase
4. Exécuter

---

## 📝 CRÉER UN TABLEAU DES COMPTES

Une fois que vous avez récupéré les emails, vous pouvez créer un tableau comme celui-ci :

| # | Email | Nom Complet | Rôle | Date Création | Statut |
|---|-------|-------------|------|---------------|--------|
| 1 | prof1@example.com | Prénom Nom | Teacher | 2025-01-XX | ✅ Actif |
| 2 | prof2@example.com | Prénom Nom | Teacher | 2025-01-XX | ✅ Actif |
| ... | ... | ... | ... | ... | ... |

---

## ⚠️ IMPORTANT - MOTS DE PASSE

**Les mots de passe ne peuvent PAS être récupérés** car ils sont cryptés dans Supabase.

### **Options pour les mots de passe :**

1. **Si vous connaissez les mots de passe :**
   - Les documenter manuellement dans un fichier sécurisé

2. **Si vous ne connaissez pas les mots de passe :**
   - Utiliser la fonction "Reset Password" de Supabase
   - Envoyer un email de réinitialisation à chaque professeur
   - Ou créer de nouveaux mots de passe via l'interface admin

3. **Pour réinitialiser un mot de passe :**
   - Aller dans **Authentication** → **Users**
   - Cliquer sur l'utilisateur
   - Cliquer sur **Send Password Reset Email**

---

## 🎯 RÉSULTAT ATTENDU

Après avoir exécuté la requête, vous devriez obtenir un tableau avec :

- **Email** de chaque professeur
- **Nom complet** (prénom + nom)
- **Rôle** (teacher ou prof)
- **Date de création**
- **Statut** (pending, approved, rejected)

---

## 📞 BESOIN D'AIDE ?

Si vous avez des difficultés :

1. Vérifier que vous êtes connecté au bon projet Supabase
2. Vérifier que les tables `profiles` et `user_roles` existent
3. Vérifier que les professeurs ont bien le rôle `teacher` ou `prof`

---

**Une fois les informations récupérées, vous pourrez créer le tableau complet des comptes !**





