# 🛠️ Guide d'Installation des Outils - Houssem Academy

## 📱 Pour le Build iOS

### **Option 1 : Xcode (Recommandé)**
1. **Télécharger** : https://developer.apple.com/xcode/
2. **Installer** depuis le Mac App Store
3. **Ouvrir** le projet : `npm run cap:ios`
4. **Générer** : Product → Archive → Distribute App

### **Option 2 : Ligne de commande (macOS uniquement)**
```bash
# Installer les outils de ligne de commande
xcode-select --install

# Générer le build
cd ios
xcodebuild archive -workspace App.xcworkspace -scheme App
```

---

## 🤖 Pour le Build Android

### **Option 1 : Android Studio (Recommandé)**
1. **Installer Java JDK 17** : https://www.oracle.com/java/technologies/downloads/
2. **Télécharger Android Studio** : https://developer.android.com/studio
3. **Configurer** les variables d'environnement
4. **Ouvrir** le projet : `npm run cap:android`
5. **Générer** : Build → Generate Signed Bundle/APK

### **Option 2 : Ligne de commande**
```bash
# Configurer JAVA_HOME et ANDROID_HOME
export JAVA_HOME=/path/to/java
export ANDROID_HOME=/path/to/android/sdk

# Générer les builds
cd android
./gradlew assembleRelease  # Pour APK
./gradlew bundleRelease    # Pour AAB
```

---

## 🎯 Alternative : Utiliser les Builds de Démonstration

Si vous ne pouvez pas installer les outils de développement :

1. **Utiliser** les fichiers de démonstration créés
2. **Tester** le processus de publication
3. **Installer** les outils plus tard pour les vrais builds

---

## 📞 Support

Pour toute question sur l'installation :
- 📧 **Support** : support@houssemacademy.com
- 📱 **Mobile** : +33 1 23 45 67 89
- 🌐 **Website** : https://houssemacademy.com
