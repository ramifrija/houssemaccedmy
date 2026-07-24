# 🛠️ GUIDE D'INSTALLATION DES OUTILS - HOUSSEM ACADEMY

## 🎯 **OBJECTIF**
Installer tous les outils nécessaires pour générer les **vrais builds** iOS et Android.

---

## 📋 **OUTILS REQUIS**

### **🤖 Pour Android (Windows/Mac/Linux)**
1. **Java JDK 17+** ✅ OBLIGATOIRE
2. **Android Studio** ✅ RECOMMANDÉ
3. **Android SDK** ✅ OBLIGATOIRE

### **🍎 Pour iOS (macOS uniquement)**
1. **Xcode** ✅ OBLIGATOIRE
2. **iOS Simulator** ✅ INCLUS avec Xcode

---

## 🔧 **INSTALLATION ÉTAPE PAR ÉTAPE**

### **ÉTAPE 1 : Java JDK**

#### **Windows :**
```bash
# Option 1 : Télécharger depuis Oracle
1. Aller sur : https://www.oracle.com/java/technologies/downloads/
2. Télécharger : JDK 17 ou plus récent
3. Installer : java-17-windows-x64.exe
4. Vérifier : java -version

# Option 2 : Avec Chocolatey (si installé)
choco install openjdk17

# Option 3 : Avec Scoop (si installé)
scoop install openjdk17
```

#### **macOS :**
```bash
# Option 1 : Avec Homebrew
brew install openjdk@17

# Option 2 : Télécharger depuis Oracle
1. Aller sur : https://www.oracle.com/java/technologies/downloads/
2. Télécharger : JDK 17 macOS
3. Installer : .dmg file
```

#### **Linux (Ubuntu/Debian) :**
```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

#### **Vérification :**
```bash
java -version
javac -version
echo $JAVA_HOME  # Linux/Mac
echo %JAVA_HOME% # Windows
```

---

### **ÉTAPE 2 : Android Studio**

#### **Téléchargement :**
```bash
1. Aller sur : https://developer.android.com/studio
2. Télécharger : Android Studio
3. Installer : Suivre l'assistant d'installation
4. Configurer : SDK Manager
```

#### **Configuration SDK :**
```bash
1. Ouvrir Android Studio
2. Aller dans : File > Settings > Appearance & Behavior > System Settings > Android SDK
3. Installer : Android SDK Platform-Tools
4. Installer : Android SDK Build-Tools
5. Installer : Android API 34 (ou plus récent)
```

#### **Variables d'environnement (Windows) :**
```bash
# Ajouter dans les variables système :
ANDROID_HOME = C:\Users\[USER]\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Java\jdk-17

# Ajouter au PATH :
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%JAVA_HOME%\bin
```

#### **Variables d'environnement (macOS/Linux) :**
```bash
# Ajouter dans ~/.bashrc ou ~/.zshrc :
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
export ANDROID_HOME=$HOME/Android/Sdk          # Linux
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk  # Linux
export JAVA_HOME=$(/usr/libexec/java_home -v 17) # macOS

export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$JAVA_HOME/bin
```

---

### **ÉTAPE 3 : Xcode (macOS uniquement)**

#### **Installation :**
```bash
1. Aller sur : App Store
2. Rechercher : Xcode
3. Installer : Xcode (gratuit, ~15GB)
4. Accepter : License agreement
5. Installer : Command Line Tools
```

#### **Vérification :**
```bash
xcodebuild -version
xcrun simctl list
```

---

## 🧪 **TEST DE L'INSTALLATION**

### **Test Java :**
```bash
java -version
# Doit afficher : openjdk version "17.x.x"
```

### **Test Android :**
```bash
adb version
# Doit afficher : Android Debug Bridge version
```

### **Test iOS (macOS) :**
```bash
xcodebuild -version
# Doit afficher : Xcode 15.x
```

---

## 🚀 **GÉNÉRATION DES BUILDS**

### **Une fois les outils installés :**
```bash
# Générer tous les builds
npm run build:real

# Ou étape par étape :
npm run build:prod     # Build web
npx cap sync           # Sync Capacitor
npm run build:real     # Builds mobiles
```

---

## 📁 **FICHIERS GÉNÉRÉS**

### **Android :**
- `android/app/build/outputs/apk/release/app-release.apk`
- `android/app/build/outputs/bundle/release/app-release.aab`

### **iOS :**
- `ios/App/build/App.ipa`

---

## 🎯 **PROCHAINES ÉTAPES**

1. **Installer** les outils requis
2. **Générer** les builds
3. **Télécharger** vers les stores
4. **Publier** pour les utilisateurs

---

## ❓ **PROBLÈMES COURANTS**

### **Java non trouvé :**
```bash
# Vérifier JAVA_HOME
echo $JAVA_HOME  # Linux/Mac
echo %JAVA_HOME% # Windows

# Réinstaller Java si nécessaire
```

### **Android SDK non trouvé :**
```bash
# Vérifier ANDROID_HOME
echo $ANDROID_HOME

# Réinstaller Android Studio
```

### **Xcode non trouvé (macOS) :**
```bash
# Réinstaller depuis App Store
# Accepter la license
sudo xcodebuild -license accept
```

---

## 💡 **CONSEILS**

1. **Installer** Android Studio en premier (plus facile)
2. **Configurer** les variables d'environnement
3. **Tester** chaque outil individuellement
4. **Redémarrer** le terminal après installation
5. **Utiliser** un Mac pour iOS (obligatoire)

---

## 🎊 **RÉSULTAT ATTENDU**

Une fois tous les outils installés :
- ✅ Builds Android générés
- ✅ Builds iOS générés (sur Mac)
- ✅ Applications prêtes pour les stores
- ✅ Utilisateurs peuvent télécharger l'app !

---

**🎯 Objectif : Des applications fonctionnelles que les utilisateurs peuvent télécharger et utiliser !**
