# 🔐 GUIDE : CONFIGURATION OAUTH GOOGLE POUR HOUSSEM ACADEMY

**Date :** 15 Janvier 2025

---

## ✅ **CODE AJOUTÉ**

Le code pour OAuth Google a été ajouté dans :
- ✅ `src/components/auth/AuthProvider.tsx` - Fonction `signInWithGoogle()`
- ✅ `src/components/auth/AuthPage.tsx` - Boutons "Se connecter avec Google"

---

## 📋 **ÉTAPE 1 : CRÉER UN PROJET GOOGLE CLOUD**

### **1.1 Aller sur Google Cloud Console**

1. **Aller sur :** https://console.cloud.google.com/
2. **Se connecter** avec votre compte Google
3. **Créer un nouveau projet** (ou utiliser un existant)
   - Cliquer sur le sélecteur de projet en haut
   - Cliquer sur **"Nouveau projet"**
   - Nom : `Houssem Academy` (ou autre)
   - Cliquer sur **"Créer"**

### **1.2 Activer l'API Google+**

1. Dans le menu, aller sur **"APIs & Services"** → **"Library"**
2. Chercher **"Google+ API"** ou **"Identity Toolkit API"**
3. Cliquer sur **"Enable"** (Activer)

---

## 📋 **ÉTAPE 2 : CRÉER LES CREDENTIALS OAUTH**

### **2.1 Créer les identifiants OAuth 2.0**

1. **Aller sur :** "APIs & Services" → **"Credentials"**
2. Cliquer sur **"+ CREATE CREDENTIALS"** en haut
3. Sélectionner **"OAuth client ID"**

### **2.2 Configurer le consent screen**

Si c'est la première fois, Google va demander de configurer le consent screen :

1. **User Type :** Choisir **"External"** (externe)
2. Cliquer sur **"CREATE"**
3. **Informations de l'application :**
   - **App name :** `Houssem Academy`
   - **User support email :** `houssemacademie@gmail.com`
   - **Developer contact information :** `houssemacademie@gmail.com`
4. Cliquer sur **"SAVE AND CONTINUE"**
5. **Scopes :** Laisser par défaut, cliquer sur **"SAVE AND CONTINUE"**
6. **Test users :** Laisser vide pour l'instant, cliquer sur **"SAVE AND CONTINUE"**
7. Cliquer sur **"BACK TO DASHBOARD"**

### **2.3 Créer l'OAuth Client ID**

1. **Application type :** Sélectionner **"Web application"**
2. **Name :** `Houssem Academy Web`
3. **Authorized JavaScript origins :**
   - Ajouter : `https://houssemacademy.com`
   - Ajouter : `http://localhost:5173` (pour développement local)
   - Ajouter : `https://ksbgydgkufejxrjmrysw.supabase.co` (URL Supabase)
4. **Authorized redirect URIs :**
   - Ajouter : `https://ksbgydgkufejxrjmrysw.supabase.co/auth/v1/callback`
   - ⚠️ **IMPORTANT :** Cette URL est spécifique à votre projet Supabase
5. Cliquer sur **"CREATE"**
6. **Copier le Client ID et le Client Secret** (vous en aurez besoin)

---

## 📋 **ÉTAPE 3 : CONFIGURER DANS SUPABASE**

### **3.1 Aller dans Supabase Dashboard**

1. **Aller sur :** https://supabase.com/dashboard/project/ksbgydgkufejxrjmrysw
2. **Menu de gauche** → **Authentication** → **Providers**

### **3.2 Activer Google Provider**

1. **Trouver "Google"** dans la liste des providers
2. **Toggle** pour activer Google
3. **Remplir les champs :**
   - **Client ID (for OAuth) :** Coller le **Client ID** de Google Cloud
   - **Client Secret (for OAuth) :** Coller le **Client Secret** de Google Cloud
4. Cliquer sur **"Save"**

### **3.3 Vérifier les URLs de redirection**

Supabase devrait automatiquement configurer l'URL de redirection :
- `https://ksbgydgkufejxrjmrysw.supabase.co/auth/v1/callback`

**Vérifier** que cette URL est bien dans les "Authorized redirect URIs" de Google Cloud Console.

---

## 📋 **ÉTAPE 4 : VÉRIFIER LE SYSTÈME DE VALIDATION**

### **Important : Les utilisateurs OAuth doivent être approuvés !**

✅ **Le système fonctionne automatiquement :**

1. L'utilisateur clique sur "Se connecter avec Google"
2. Google authentifie l'utilisateur
3. Supabase crée le compte dans `auth.users`
4. Le trigger `handle_new_user()` crée automatiquement un profil avec `role_id = null` (en attente)
5. L'utilisateur voit la page `PendingApproval` (attente de validation)
6. L'admin doit approuver le compte dans `/users`

**✅ Tout est déjà en place !** Le système de validation fonctionne aussi pour OAuth.

---

## 🧪 **ÉTAPE 5 : TESTER**

### **5.1 Tester en local (optionnel)**

1. Démarrer l'application : `npm run dev`
2. Aller sur `http://localhost:5173`
3. Cliquer sur "Se connecter avec Google"
4. Vérifier que ça redirige vers Google
5. Après authentification, vous devriez voir la page "En attente"

### **5.2 Tester en production**

1. Aller sur `https://houssemacademy.com`
2. Cliquer sur "Se connecter avec Google"
3. S'authentifier avec Google
4. Vérifier que vous voyez la page d'attente
5. Connecter-vous en tant qu'admin
6. Aller dans `/users` pour approuver le compte OAuth

---

## ⚠️ **PROBLÈMES COURANTS ET SOLUTIONS**

### **Problème 1 : "redirect_uri_mismatch"**

**Solution :** Vérifier que l'URL de redirection dans Google Cloud Console correspond exactement à :
```
https://ksbgydgkufejxrjmrysw.supabase.co/auth/v1/callback
```

### **Problème 2 : "OAuth provider not enabled"**

**Solution :** Vérifier que Google est bien activé dans Supabase Dashboard → Authentication → Providers

### **Problème 3 : L'utilisateur OAuth n'apparaît pas dans la liste d'approbation**

**Solution :** Vérifier que le trigger `handle_new_user()` crée bien un profil avec `role_id = null`. Si le profil n'existe pas, le créer manuellement dans Supabase.

### **Problème 4 : Les informations (nom, prénom) ne sont pas récupérées**

**Solution :** Google fournit ces informations dans `user_metadata`. Le trigger `handle_new_user()` devrait les extraire automatiquement. Si ce n'est pas le cas, elles peuvent être mises à jour manuellement par l'admin.

---

## 📝 **INFORMATIONS IMPORTANTES**

### **URLs à configurer dans Google Cloud Console :**

**Authorized JavaScript origins :**
- `https://houssemacademy.com`
- `https://ksbgydgkufejxrjmrysw.supabase.co`
- `http://localhost:5173` (pour développement)

**Authorized redirect URIs :**
- `https://ksbgydgkufejxrjmrysw.supabase.co/auth/v1/callback`

### **Sécurité :**

✅ Les utilisateurs OAuth doivent **TOUJOURS** être approuvés par l'admin
✅ Le système de validation reste en place
✅ Seuls les comptes avec `role_id != null` peuvent accéder à l'application

---

## ✅ **CHECKLIST FINALE**

- [ ] Projet créé dans Google Cloud Console
- [ ] Google+ API activée
- [ ] Consent screen configuré
- [ ] OAuth Client ID créé
- [ ] URLs configurées (JavaScript origins + redirect URIs)
- [ ] Google provider activé dans Supabase
- [ ] Client ID et Client Secret ajoutés dans Supabase
- [ ] Test effectué avec succès

---

## 🎉 **C'EST TOUT !**

Une fois la configuration terminée, les utilisateurs pourront :
- ✅ Se connecter avec Google en 2-3 clics
- ✅ Être automatiquement en attente de validation
- ✅ Être approuvés par l'admin comme les autres utilisateurs

**Le code est déjà en place, il ne reste plus qu'à configurer Google Cloud et Supabase !** 🚀

---

**Besoin d'aide ?** Si vous rencontrez un problème, dites-moi à quelle étape vous êtes bloqué !

