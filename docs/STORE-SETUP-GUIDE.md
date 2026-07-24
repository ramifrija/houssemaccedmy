# 🏪 Guide de Configuration des Stores - Houssem Academy

## 📱 Configuration App Store (iOS)

### **Étape 1 : App Store Connect**
1. **Aller sur** : https://appstoreconnect.apple.com
2. **Se connecter** avec votre Apple ID développeur
3. **Cliquer** sur "Mes Apps" → "+" → "Nouvelle App"

### **Étape 2 : Informations de Base**
```json
{
  "nom": "Houssem Academy",
  "langue_principale": "Français",
  "bundle_id": "com.houssemacademy.app",
  "sku": "houssem-academy-001",
  "type": "App",
  "catégorie_principale": "Education",
  "catégorie_secondaire": "Productivity"
}
```

### **Étape 3 : Métadonnées**
```json
{
  "nom": "Houssem Academy",
  "sous_titre": "Gestion académique moderne",
  "description": "Houssem Academy révolutionne la gestion académique avec une interface moderne et intuitive. Développée pour les établissements scolaires, cette application offre tous les outils nécessaires pour une gestion efficace et transparente.\n\nFonctionnalités principales :\n• Dashboard interactif avec métriques temps réel\n• Marquage des présences par QR code\n• Planification et suivi des cours\n• Communication intégrée\n• Analytics et rapports détaillés\n• Sécurité renforcée\n• Design responsive",
  "mots_cles": "education, school, management, attendance, calendar, messaging, reports",
  "url_support": "https://houssemacademy.com/support",
  "url_marketing": "https://houssemacademy.com",
  "url_confidentialite": "https://houssemacademy.com/privacy"
}
```

### **Étape 4 : Captures d'Écran**
**Télécharger les captures d'écran dans :**
- **iPhone 6.7"** : 1290x2796px (3-10 images)
- **iPhone 6.5"** : 1242x2688px (3-10 images)
- **iPhone 5.5"** : 1242x2208px (3-10 images)
- **iPad Pro 12.9"** : 2048x2732px (3-10 images)
- **iPad Pro 11"** : 1668x2388px (3-10 images)

### **Étape 5 : Icône de l'App**
**Télécharger l'icône :**
- **Taille** : 1024x1024px
- **Format** : PNG (sans transparence)
- **Fichier** : `assets/store-assets/icons/ios/icon-1024.png`

---

## 🤖 Configuration Google Play (Android)

### **Étape 1 : Google Play Console**
1. **Aller sur** : https://play.google.com/console
2. **Se connecter** avec votre compte Google
3. **Cliquer** sur "Créer une application"

### **Étape 2 : Informations de Base**
```json
{
  "nom": "Houssem Academy",
  "langue_par_defaut": "Français",
  "type": "Application",
  "gratuit_ou_payant": "Gratuit",
  "declaration_contenu": "Non applicable"
}
```

### **Étape 3 : Métadonnées**
```json
{
  "nom": "Houssem Academy",
  "description_courte": "Application moderne de gestion académique pour établissements scolaires",
  "description_complete": "Houssem Academy révolutionne la gestion académique avec une interface moderne et intuitive. Développée pour les établissements scolaires, cette application offre tous les outils nécessaires pour une gestion efficace et transparente.\n\nFonctionnalités clés :\n• Dashboard interactif avec métriques temps réel\n• Marquage des présences par QR code\n• Planification et suivi des cours\n• Communication intégrée\n• Analytics et rapports détaillés\n• Sécurité renforcée\n• Design responsive",
  "mots_cles": "gestion scolaire, éducation, présences, calendrier, messagerie, rapports, académique",
  "catégorie": "Education",
  "classification": "Everyone",
  "url_support": "https://houssemacademy.com/support",
  "url_confidentialite": "https://houssemacademy.com/privacy"
}
```

### **Étape 4 : Captures d'Écran**
**Télécharger les captures d'écran dans :**
- **Phone** : 1080x1920px (2-8 images)
- **Tablet** : 1920x1200px (2-8 images)

### **Étape 5 : Icône de l'App**
**Télécharger l'icône :**
- **Taille** : 512x512px
- **Format** : PNG (sans transparence)
- **Fichier** : `assets/store-assets/icons/android/icon-512.png`

---

## 🔧 Configuration Technique

### **App Store (iOS)**
```bash
# 1. Ouvrir Xcode
npx cap open ios

# 2. Configuration dans Xcode :
# - Bundle Identifier: com.houssemacademy.app
# - Display Name: Houssem Academy
# - Version: 1.0.0
# - Build: 1
# - Deployment Target: iOS 13.0+

# 3. Générer le build de distribution
# Product → Archive → Distribute App → App Store Connect
```

### **Google Play (Android)**
```bash
# 1. Ouvrir Android Studio
npx cap open android

# 2. Configuration dans Android Studio :
# - Package Name: com.houssemacademy.app
# - App Name: Houssem Academy
# - Version Name: 1.0.0
# - Version Code: 1
# - Min SDK: 22
# - Target SDK: 34

# 3. Générer le bundle de distribution
# Build → Generate Signed Bundle/APK → Android App Bundle
```

---

## 📋 Checklist de Configuration

### **App Store (iOS)**
- [ ] **Compte développeur** Apple ($99/an) - ✅ DÉJÀ CRÉÉ
- [ ] **App Store Connect** configuré
- [ ] **Métadonnées** complétées
- [ ] **Captures d'écran** téléchargées
- [ ] **Icône** 1024x1024px téléchargée
- [ ] **Build** généré et téléchargé
- [ ] **Review** soumise

### **Google Play (Android)**
- [ ] **Compte développeur** Google ($25) - ✅ DÉJÀ CRÉÉ
- [ ] **Google Play Console** configuré
- [ ] **Métadonnées** complétées
- [ ] **Captures d'écran** téléchargées
- [ ] **Icône** 512x512px téléchargée
- [ ] **Bundle** généré et téléchargé
- [ ] **Review** soumise

---

## 🚀 Processus de Publication

### **App Store (iOS)**
1. **Build** : Créer un build de production dans Xcode
2. **Upload** : Télécharger via Xcode ou Transporter
3. **Review** : Soumettre pour review Apple
4. **Approbation** : 24-48h de review
5. **Publication** : Mise en ligne automatique

### **Google Play (Android)**
1. **Build** : Créer un AAB (Android App Bundle)
2. **Upload** : Télécharger via Play Console
3. **Review** : Soumettre pour review Google
4. **Approbation** : 1-3 jours de review
5. **Publication** : Mise en ligne automatique

---

## 📊 Métriques de Succès

### **Objectifs de Publication**
- **Temps de review** : < 48h (iOS), < 72h (Android)
- **Taux d'approbation** : 100%
- **Téléchargements** : 1000+ en première semaine
- **Note moyenne** : > 4.5/5
- **Taux de rétention** : > 70% (7 jours)

### **KPIs à Suivre**
- **Téléchargements** quotidiens/mensuels
- **Notes et avis** des utilisateurs
- **Taux de plantage** (< 0.1%)
- **Temps de session** moyen
- **Fonctionnalités** les plus utilisées

---

## 🎯 Prochaines Actions

### **Immédiat (Cette semaine)**
1. **Configurer** App Store Connect
2. **Configurer** Google Play Console
3. **Télécharger** les métadonnées
4. **Télécharger** les icônes et captures d'écran

### **Court terme (2 semaines)**
1. **Générer** les builds de production
2. **Tester** sur appareils réels
3. **Soumettre** pour review
4. **Suivre** les approbations

### **Moyen terme (1 mois)**
1. **Publier** sur les stores
2. **Lancer** la communication
3. **Monitorer** les performances
4. **Collecter** les retours utilisateurs

---

## 📞 Support

Pour toute question sur la configuration :
- 📧 **Support** : support@houssemacademy.com
- 📱 **Mobile** : +33 1 23 45 67 89
- 🌐 **Website** : https://houssemacademy.com

---

**🎉 Votre application est prête pour la publication !**































