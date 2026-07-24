
# 🛠️ INSTALLATION MANUELLE REQUISE

## ☕ Java JDK 17+

### Option 1 : Téléchargement direct
1. Aller sur : https://www.oracle.com/java/technologies/downloads/
2. Télécharger : JDK 17 Windows x64
3. Installer : java-17-windows-x64.exe
4. Redémarrer le terminal

### Option 2 : Avec Chocolatey
```bash
# Installer Chocolatey (si pas déjà installé)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Installer Java
choco install openjdk17 -y
```

### Option 3 : Avec Scoop
```bash
# Installer Scoop (si pas déjà installé)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Installer Java
scoop install openjdk17
```

## 🤖 Android Studio

1. Aller sur : https://developer.android.com/studio
2. Télécharger : Android Studio
3. Installer : android-studio-*.exe
4. Configurer : SDK Manager
5. Installer : Android SDK Platform-Tools

## 🔧 Variables d'environnement

Ajouter dans les variables système Windows :
- ANDROID_HOME = C:\Users\[USER]\AppData\Local\Android\Sdk
- JAVA_HOME = C:\Program Files\Java\jdk-17

Ajouter au PATH :
- %ANDROID_HOME%\platform-tools
- %ANDROID_HOME%\tools
- %JAVA_HOME%\bin

## 🧪 Test d'installation

```bash
java -version
adb version
```

## 🚀 Génération des builds

Une fois installé :
```bash
npm run build:real
```
