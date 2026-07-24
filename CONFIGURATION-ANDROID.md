
# 🛠️ CONFIGURATION MANUELLE D'ANDROID SDK

## 📍 Android SDK installé à :
C:\Users\MOHAMEDKHALILBECH\AppData\Local\Android\Sdk

## 🔧 Configuration des variables d'environnement (Windows) :

### Option 1 : Via l'interface Windows
1. Appuyer sur **Windows + R**
2. Taper : **sysdm.cpl**
3. Cliquer sur **Variables d'environnement**
4. Dans **Variables système**, cliquer sur **Nouveau**
5. Nom : **ANDROID_HOME**
6. Valeur : **C:\Users\MOHAMEDKHALILBECH\AppData\Local\Android\Sdk**
7. Cliquer sur **OK**
8. Dans **Variables système**, trouver **Path**
9. Cliquer sur **Modifier** puis **Nouveau**
10. Ajouter : **C:\Users\MOHAMEDKHALILBECH\AppData\Local\Android\Sdk\platform-tools**
11. Ajouter : **C:\Users\MOHAMEDKHALILBECH\AppData\Local\Android\Sdk\tools**
12. Cliquer sur **OK** sur toutes les fenêtres
13. **Redémarrer le terminal**

### Option 2 : Exécuter le script automatique
```powershell
# En tant qu'administrateur
.\configure-android-path.ps1
```

## ✅ Vérification après configuration :
```bash
adb version
```

## 🎯 Prochaines étapes :
1. ✅ Android SDK configuré
2. 🚀 Générer les builds : npm run build:real
