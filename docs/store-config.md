# Configuration des Stores - Houssem Academy

## 📱 Configuration iOS (App Store)

### Informations de l'application
- **Nom** : Houssem Academy
- **Bundle ID** : com.houssemacademy.app
- **Version** : 1.0.0
- **Catégorie** : Education
- **Âge minimum** : 4+

### Description courte (30 caractères max)
Gestion académique moderne

### Description complète
Houssem Academy est une application moderne de gestion académique qui permet aux établissements scolaires de gérer efficacement leurs activités éducatives. L'application offre des fonctionnalités complètes pour la gestion des présences, des cours, des communications et des rapports.

**Fonctionnalités principales :**
- 📊 Tableau de bord interactif avec statistiques en temps réel
- ✅ Gestion des présences avec codes QR
- 📅 Calendrier des cours et événements
- 💬 Système de messagerie intégré
- 📈 Rapports et analyses détaillés
- 🔐 Authentification sécurisée
- 📱 Interface responsive optimisée mobile

### Mots-clés
education, school, management, attendance, calendar, messaging, reports

### Captures d'écran requises
- Tableau de bord principal
- Gestion des présences
- Calendrier des cours
- Interface de messagerie
- Rapports et statistiques

---

## 🤖 Configuration Android (Google Play)

### Informations de l'application
- **Nom** : Houssem Academy
- **Package Name** : com.houssemacademy.app
- **Version** : 1.0.0
- **Catégorie** : Education
- **Classification** : Everyone

### Description courte (80 caractères max)
Application moderne de gestion académique pour établissements scolaires

### Description complète
Houssem Academy révolutionne la gestion académique avec une interface moderne et intuitive. Développée pour les établissements scolaires, cette application offre tous les outils nécessaires pour une gestion efficace et transparente.

**Fonctionnalités clés :**
- 📊 Dashboard interactif avec métriques temps réel
- ✅ Marquage des présences par QR code
- 📅 Planification et suivi des cours
- 💬 Communication intégrée
- 📈 Analytics et rapports détaillés
- 🔐 Sécurité renforcée
- 📱 Design responsive

### Mots-clés
gestion scolaire, éducation, présences, calendrier, messagerie, rapports, académique

### Permissions Android
- INTERNET : Connexion réseau
- CAMERA : Scan des QR codes
- NOTIFICATIONS : Alertes et communications
- STORAGE : Sauvegarde des données

---

## 🎨 Assets requis

### Icônes
- **iOS** : 1024x1024px (App Store)
- **Android** : 512x512px (Google Play)
- **Adaptive** : 192x192px, 144x144px, 96x96px, 72x72px, 48x48px, 36x36px

### Splash Screen
- **iOS** : 1242x2688px (iPhone X)
- **Android** : 1080x1920px (Full HD)

### Captures d'écran
- **iPhone** : 6.7", 6.5", 5.5"
- **iPad** : 12.9", 11"
- **Android** : Phone, Tablet

---

## 🔧 Configuration technique

### Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios
npx cap add android
```

### Build
```bash
npm run build
npx cap sync
npx cap open ios
npx cap open android
```

### Variables d'environnement
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_CAPACITOR_APP_ID
- VITE_CAPACITOR_APP_NAME































