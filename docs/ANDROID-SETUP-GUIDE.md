# 🤖 Guide d'Installation Android - Houssem Academy

## 📋 Prérequis

### **1. Installer Java JDK**
1. **Télécharger** : https://www.oracle.com/java/technologies/downloads/
2. **Choisir** : Java 17 LTS (recommandé)
3. **Installer** avec les options par défaut
4. **Configurer** JAVA_HOME :
   - Ouvrir "Variables d'environnement"
   - Ajouter JAVA_HOME : `C:\Program Files\Java\jdk-17`
   - Ajouter au PATH : `%JAVA_HOME%\bin`

### **2. Installer Android Studio**
1. **Télécharger** : https://developer.android.com/studio
2. **Installer** avec les options par défaut
3. **Configurer** le SDK Android :
   - Ouvrir Android Studio
   - SDK Manager → Installer Android SDK
   - Choisir API Level 34 (Android 14)

### **3. Configurer les Variables d'Environnement**
```bash
# Ajouter à votre PATH :
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Java\jdk-17

# Ajouter au PATH :
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
%JAVA_HOME%\bin
```

---

## 🚀 Génération du Build Android

### **Option 1 : Avec Android Studio (Recommandé)**
```bash
# 1. Ouvrir le projet
npm run cap:android

# 2. Dans Android Studio :
# - Build → Generate Signed Bundle/APK
# - Choisir "Android App Bundle"
# - Créer un keystore
# - Générer le fichier .aab
```

### **Option 2 : Avec la ligne de commande**
```bash
# 1. Aller dans le dossier android
cd android

# 2. Générer le build de release
.\gradlew assembleRelease

# 3. Le fichier APK sera dans :
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 📱 Configuration du Projet Android

### **Informations de l'App**
- **Package Name** : `com.houssemacademy.app`
- **App Name** : `Houssem Academy`
- **Version Name** : `1.0.0`
- **Version Code** : `1`
- **Min SDK** : `22` (Android 5.1)
- **Target SDK** : `34` (Android 14)

### **Permissions Android**
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

---

## 🔐 Signature de l'App

### **Créer un Keystore**
```bash
# Générer un keystore pour la signature
keytool -genkey -v -keystore houssem-academy-key.keystore -alias houssem-academy -keyalg RSA -keysize 2048 -validity 10000
```

### **Configuration du Keystore**
1. **Nom** : `houssem-academy-key.keystore`
2. **Alias** : `houssem-academy`
3. **Mot de passe** : (à définir et à conserver)
4. **Validité** : 10 ans minimum

---

## 📦 Génération du Bundle

### **Android App Bundle (.aab)**
```bash
# Générer le bundle pour Google Play
.\gradlew bundleRelease
```

### **APK (.apk)**
```bash
# Générer l'APK pour distribution directe
.\gradlew assembleRelease
```

---

## 🏪 Publication Google Play

### **Étape 1 : Google Play Console**
1. **Aller sur** : https://play.google.com/console
2. **Créer** une nouvelle application
3. **Remplir** les métadonnées

### **Étape 2 : Upload du Bundle**
1. **Aller** dans "Production" → "Créer une nouvelle version"
2. **Télécharger** le fichier .aab
3. **Remplir** les notes de version
4. **Soumettre** pour review

### **Étape 3 : Métadonnées**
```json
{
  "nom": "Houssem Academy",
  "description_courte": "Application moderne de gestion académique",
  "description_complete": "Houssem Academy révolutionne la gestion académique...",
  "catégorie": "Education",
  "classification": "Everyone",
  "icône": "512x512px",
  "captures_écran": "1080x1920px (phone), 1920x1200px (tablet)"
}
```

---

## 🚨 Dépannage

### **Erreur JAVA_HOME**
```bash
# Vérifier l'installation Java
java -version

# Configurer JAVA_HOME
set JAVA_HOME=C:\Program Files\Java\jdk-17
```

### **Erreur Android SDK**
```bash
# Vérifier l'installation Android SDK
adb version

# Configurer ANDROID_HOME
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
```

### **Erreur Gradle**
```bash
# Nettoyer le projet
.\gradlew clean

# Reconstruire
.\gradlew build
```

---

## 📞 Support

Pour toute question sur l'installation Android :
- 📧 **Support** : support@houssemacademy.com
- 📱 **Mobile** : +33 1 23 45 67 89
- 🌐 **Website** : https://houssemacademy.com

---

**🎯 Une fois Android Studio installé, vous pourrez générer le build Android !**
