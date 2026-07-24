
# 🛠️ CONFIGURATION MANUELLE DE JAVA

## 📍 Java installé à :
C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot

## 🔧 Configuration du PATH (Windows) :

### Option 1 : Via l'interface Windows
1. Appuyer sur **Windows + R**
2. Taper : **sysdm.cpl**
3. Cliquer sur **Variables d'environnement**
4. Dans **Variables système**, trouver **Path**
5. Cliquer sur **Modifier**
6. Cliquer sur **Nouveau**
7. Ajouter : **C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot\bin**
8. Cliquer sur **OK** sur toutes les fenêtres
9. **Redémarrer le terminal**

### Option 2 : Via PowerShell (en tant qu'administrateur)
```powershell
$javaPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot\bin"
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
$newPath = $currentPath + ";" + $javaPath
[Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
```

### Option 3 : Exécuter le script automatique
```powershell
# En tant qu'administrateur
.\configure-java-path.ps1
```

## ✅ Vérification après configuration :
```bash
java -version
```

## 🎯 Prochaines étapes :
1. ✅ Java configuré
2. 🤖 Installer Android Studio
3. 🚀 Générer les builds
