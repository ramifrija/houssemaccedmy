import { execa } from 'execa';
import fs from 'fs';
import path from 'path';

async function findAndroidSDK() {
  console.log('ℹ️ [15:00:00] 🔍 Recherche d\'Android SDK...');
  
  const possiblePaths = [
    'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Android\\Sdk',
    'C:\\Users\\' + process.env.USERNAME + '\\Android\\Sdk',
    'C:\\Android\\Sdk',
    'C:\\Program Files\\Android\\Sdk',
    'C:\\Program Files (x86)\\Android\\Sdk'
  ];
  
  for (const sdkPath of possiblePaths) {
    if (fs.existsSync(sdkPath)) {
      console.log(`✅ [15:00:00] ✅ Android SDK trouvé : ${sdkPath}`);
      return sdkPath;
    }
  }
  
  console.log('❌ [15:00:00] ❌ Android SDK non trouvé');
  return null;
}

async function testAndroidTools(sdkPath) {
  const adbPath = path.join(sdkPath, 'platform-tools', 'adb.exe');
  console.log(`ℹ️ [15:00:01] 🧪 Test d\'ADB : ${adbPath}`);
  
  try {
    const { stdout } = await execa(adbPath, ['version'], { stdio: 'pipe' });
    console.log('✅ [15:00:01] ✅ ADB fonctionne !');
    console.log(`   Version : ${stdout.split('\n')[0]}`);
    return true;
  } catch (error) {
    console.log('❌ [15:00:01] ❌ ADB ne fonctionne pas');
    return false;
  }
}

async function createAndroidPathScript(sdkPath) {
  const scriptContent = `
# Configuration automatique du PATH pour Android
# Exécuter ce script en tant qu'administrateur

$androidHome = "${sdkPath}"
$platformTools = "${sdkPath}\\platform-tools"
$tools = "${sdkPath}\\tools"

# Variables d'environnement
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, "Machine")

# PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
$newPath = $currentPath + ";" + $platformTools + ";" + $tools
[Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")

Write-Host "✅ Android SDK configuré"
Write-Host "✅ ANDROID_HOME = $androidHome"
Write-Host "✅ PATH mis à jour"
Write-Host "🔄 Redémarrez le terminal pour appliquer les changements"
`;

  fs.writeFileSync('configure-android-path.ps1', scriptContent);
  console.log('✅ [15:00:02] Script de configuration créé : configure-android-path.ps1');
}

async function createManualInstructions(sdkPath) {
  const instructions = `
# 🛠️ CONFIGURATION MANUELLE D'ANDROID SDK

## 📍 Android SDK installé à :
${sdkPath}

## 🔧 Configuration des variables d'environnement (Windows) :

### Option 1 : Via l'interface Windows
1. Appuyer sur **Windows + R**
2. Taper : **sysdm.cpl**
3. Cliquer sur **Variables d'environnement**
4. Dans **Variables système**, cliquer sur **Nouveau**
5. Nom : **ANDROID_HOME**
6. Valeur : **${sdkPath}**
7. Cliquer sur **OK**
8. Dans **Variables système**, trouver **Path**
9. Cliquer sur **Modifier** puis **Nouveau**
10. Ajouter : **${sdkPath}\\platform-tools**
11. Ajouter : **${sdkPath}\\tools**
12. Cliquer sur **OK** sur toutes les fenêtres
13. **Redémarrer le terminal**

### Option 2 : Exécuter le script automatique
\`\`\`powershell
# En tant qu'administrateur
.\\configure-android-path.ps1
\`\`\`

## ✅ Vérification après configuration :
\`\`\`bash
adb version
\`\`\`

## 🎯 Prochaines étapes :
1. ✅ Android SDK configuré
2. 🚀 Générer les builds : npm run build:real
`;

  fs.writeFileSync('CONFIGURATION-ANDROID.md', instructions);
  console.log('✅ [15:00:03] Instructions créées : CONFIGURATION-ANDROID.md');
}

async function main() {
  console.log('🤖 CONFIGURATION D\'ANDROID SDK - HOUSSEM ACADEMY');
  console.log('===============================================');
  
  // Trouver Android SDK
  const sdkPath = await findAndroidSDK();
  
  if (!sdkPath) {
    console.log('❌ [15:00:00] ❌ Android SDK non trouvé');
    console.log('📋 VÉRIFICATION REQUISE :');
    console.log('1. Démarrer Android Studio');
    console.log('2. Aller dans : File > Settings > Appearance & Behavior > System Settings > Android SDK');
    console.log('3. Vérifier l\'emplacement du SDK');
    console.log('4. Relancer ce script');
    return;
  }
  
  // Tester les outils Android
  const androidWorks = await testAndroidTools(sdkPath);
  
  if (!androidWorks) {
    console.log('❌ [15:00:01] ❌ Outils Android ne fonctionnent pas');
    console.log('📋 VÉRIFICATION REQUISE :');
    console.log('1. Ouvrir Android Studio');
    console.log('2. Installer Android SDK Platform-Tools');
    console.log('3. Relancer ce script');
    return;
  }
  
  // Créer les scripts d'aide
  await createAndroidPathScript(sdkPath);
  await createManualInstructions(sdkPath);
  
  console.log('\n🎉 ANDROID SDK DÉTECTÉ ET FONCTIONNEL !');
  console.log('=====================================');
  console.log(`📍 Emplacement : ${sdkPath}`);
  console.log('✅ ADB : Fonctionnel');
  console.log('✅ Installation : OK');
  
  console.log('\n🔧 CONFIGURATION DU PATH REQUISE :');
  console.log('==================================');
  console.log('1. 📄 Instructions : CONFIGURATION-ANDROID.md');
  console.log('2. 🔧 Script automatique : configure-android-path.ps1');
  console.log('3. 🔄 Redémarrer le terminal après configuration');
  
  console.log('\n🎯 PROCHAINES ÉTAPES :');
  console.log('=====================');
  console.log('1. 🔧 Configurer le PATH (voir CONFIGURATION-ANDROID.md)');
  console.log('2. 🔄 Redémarrer le terminal');
  console.log('3. ✅ Vérifier : adb version');
  console.log('4. 🚀 Générer les builds : npm run build:real');
}

main().catch(console.error);






























