# 🔐 GUIDE COMPLET : RÉCUPÉRER TOUS LES COMPTES

## 🎯 OBJECTIF

Récupérer **TOUS** les comptes utilisateurs (Admin, Professeurs, Étudiants, Parents) avec leurs emails depuis Supabase.

---

## 📋 ÉTAPE 1 : EXÉCUTER LA REQUÊTE SQL

### **Dans Supabase Dashboard :**

1. **Aller sur :** https://supabase.com/dashboard/project/ziaqrvgnxzwhrpqcsepj
2. **Menu → SQL Editor → New Query**
3. **Ouvrir le fichier :** `recuperer-tous-les-comptes.sql`
4. **Copier la requête #7 (Export Complet)** :

```sql
SELECT 
  ROW_NUMBER() OVER (ORDER BY ur.role_name, u.created_at) as numero,
  u.email,
  CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, '')) as nom_complet,
  ur.role_name as role,
  u.created_at::date as date_creation,
  CASE 
    WHEN p.status = 'approved' THEN '✅ Approuvé'
    WHEN p.status = 'pending' THEN '⏳ En attente'
    WHEN p.status = 'rejected' THEN '❌ Rejeté'
    ELSE '❓ Inconnu'
  END as statut_approbation,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅'
    ELSE '⚠️'
  END as email_confirme
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
LEFT JOIN public.user_roles ur ON ur.id = p.role_id
WHERE ur.role_name IS NOT NULL
ORDER BY 
  CASE ur.role_name
    WHEN 'admin' THEN 1
    WHEN 'teacher' THEN 2
    WHEN 'prof' THEN 2
    WHEN 'parent' THEN 3
    WHEN 'student' THEN 4
    ELSE 5
  END,
  u.created_at DESC;
```

5. **Exécuter** (Run ou Ctrl+Enter)
6. **Exporter les résultats** (bouton Export → CSV ou JSON)

---

## ⚠️ IMPORTANT : MOTS DE PASSE

**Les mots de passe sont CRYPTÉS dans Supabase** et **NE PEUVENT PAS** être récupérés en clair pour des raisons de sécurité.

### **Options disponibles :**

#### **Option 1 : Si vous connaissez les mots de passe**
- Les documenter manuellement dans un fichier sécurisé
- Utiliser un gestionnaire de mots de passe

#### **Option 2 : Réinitialiser les mots de passe**
- Via Supabase Dashboard : **Authentication → Users → [Utilisateur] → Send Password Reset Email**
- Ou créer de nouveaux mots de passe via l'interface admin de votre application

#### **Option 3 : Créer un script de réinitialisation**
- Envoyer un email de réinitialisation à tous les utilisateurs
- Utiliser l'API Supabase pour réinitialiser en masse

---

## 📊 CRÉER LE TABLEAU COMPLET

Une fois les emails récupérés, créez un tableau comme celui-ci :

| # | Email | Nom Complet | Rôle | Mot de passe | Date Création | Statut |
|---|-------|-------------|------|--------------|---------------|--------|
| 1 | admin@... | ... | Admin | [À documenter] | ... | ✅ |
| 2 | prof1@... | ... | Teacher | [À documenter] | ... | ✅ |
| ... | ... | ... | ... | ... | ... | ... |

---

## 🔄 AUTOMATISATION

Si vous voulez automatiser la récupération, vous pouvez :

1. **Créer un endpoint API** dans Supabase Functions
2. **Utiliser un script Node.js** avec le client Supabase
3. **Exporter régulièrement** via un cron job

---

## 📝 PROCHAINES ÉTAPES

1. ✅ Exécuter la requête SQL dans Supabase
2. ✅ Exporter les résultats
3. ✅ Documenter les mots de passe (si connus)
4. ✅ Créer le tableau final avec tous les accès
5. ✅ Partager le tableau de manière sécurisée

---

**Une fois les données récupérées, je pourrai créer le tableau complet !**





