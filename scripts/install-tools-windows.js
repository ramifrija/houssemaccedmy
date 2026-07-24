import { execa } from 'execa';
import fs from 'fs';
import path from 'path';

async function runCommand(command, args, description) {
  console.log(`ℹ️ [${new Date().toLocaleTimeString('fr-FR')}] Exécution: ${description}`);
  try {
    await execa(command, args, { stdio: 'inherit' });
    console.log(`✅ [${new Date().toLocaleTimeString('fr-FR')}] Succès: ${description}`);
    return true;
  } catch (error) {
    console.error(`❌ [${new Date().toLocaleTimeString('fr-FR')}] Erreur: ${description} - ${error.message}`);
    return false;
  }
}

async function checkJava() {
  console.log('ℹ️ [14:40:00] ☕ Vérification de Java...');
  try {
    const { stdout } = await execa('java', ['-version'], { stdio: 'pipe' });
    console.log('✅ [14:40:00] ✅ Java détecté :', stdout.split('\n')[0]);
    return true;
  } catch (error) {
    console.log('❌ [14:40:00] ❌ Java non détecté');
    return false;
  }
}

async function checkAndroidSDK() {
  console.log('ℹ️ [14:40:01] 🤖 Vérification d\'Android SDK...');
  try {
    const { stdout } = await execa('adb', ['version'], { stdio: 'pipe' });
    console.log('✅ [14:40:01] ✅ Android SDK détecté :', stdout.split('\n')[0]);
    return true;
  } catch (error) {
    console.log('❌ [14:40:01] ❌ Android SDK non détecté');
    return false;
  }
}

async function installJavaWithChocolatey() {
  console.log('ℹ️ [14:40:02] ☕ Installation de Java avec Chocolatey...');
  
  try {
    // Vérifier si Chocolatey est installé
    await execa('choco', ['--version'], { stdio: 'pipe' });
    console.log('✅ [14:40:02] ✅ Chocolatey détecté');
    
    // Installer OpenJDK 17
    await runCommand('choco', ['install', 'openjdk17', '-y'], 'Installation d\'OpenJDK 17');
    
    // Vérifier l'installation
    await checkJava();
    return true;
  } catch (error) {
    console.log('❌ [14:40:02] ❌ Chocolatey non installé ou erreur d\'installation');
    return false;
  }
}

async function installJavaWithScoop() {
  console.log('ℹ️ [14:40:03] ☕ Installation de Java avec Scoop...');
  
  try {
    // Vérifier si Scoop est installé
    await execa('scoop', ['--version'], { stdio: 'pipe' });
    console.log('✅ [14:40:03] ✅ Scoop détecté');
    
    // Installer OpenJDK 17
    await runCommand('scoop', ['install', 'openjdk17'], 'Installation d\'OpenJDK 17');
    
    // Vérifier l'installation
    await checkJava();
    return true;
  } catch (error) {
    console.log('❌ [14:40:03] ❌ Scoop non installé ou erreur d\'installation');
    return false;
  }
}

async function createInstallationGuide() {
  const guide = `
# 🛠️ INSTALLATION MANUELLE REQUISE

## ☕ Java JDK 17+

### Option 1 : Téléchargement direct
1. Aller sur : https://www.oracle.com/java/technologies/downloads/
2. Télécharger : JDK 17 Windows x64
3. Installer : java-17-windows-x64.exe
4. Redémarrer le terminal

### Option 2 : Avec Chocolatey
\`\`\`bash
# Installer Chocolatey (si pas déjà installé)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Installer Java
choco install openjdk17 -y
\`\`\`

### Option 3 : Avec Scoop
\`\`\`bash
# Installer Scoop (si pas déjà installé)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Installer Java
scoop install openjdk17
\`\`\`

## 🤖 Android Studio

1. Aller sur : https://developer.android.com/studio
2. Télécharger : Android Studio
3. Installer : android-studio-*.exe
4. Configurer : SDK Manager
5. Installer : Android SDK Platform-Tools

## 🔧 Variables d'environnement

Ajouter dans les variables système Windows :
- ANDROID_HOME = C:\\Users\\[USER]\\AppData\\Local\\Android\\Sdk
- JAVA_HOME = C:\\Program Files\\Java\\jdk-17

Ajouter au PATH :
- %ANDROID_HOME%\\platform-tools
- %ANDROID_HOME%\\tools
- %JAVA_HOME%\\bin

## 🧪 Test d'installation

\`\`\`bash
java -version
adb version
\`\`\`

## 🚀 Génération des builds

Une fois installé :
\`\`\`bash
npm run build:real
\`\`\`
`;

  fs.writeFileSync('INSTALLATION-MANUEL.md', guide);
  console.log('✅ [14:40:04] Guide d\'installation créé : INSTALLATION-MANUEL.md');
}

async function main() {
  console.log('🛠️ INSTALLATION AUTOMATIQUE DES OUTILS - HOUSSEM ACADEMY');
  console.log('============================================================');
  
  // Vérifier Java
  const javaInstalled = await checkJava();
  
  if (!javaInstalled) {
    console.log('ℹ️ [14:40:01] ☕ Installation de Java nécessaire...');
    
    // Essayer Chocolatey
    let javaSuccess = await installJavaWithChocolatey();
    
    // Si échec, essayer Scoop
    if (!javaSuccess) {
      javaSuccess = await installJavaWithScoop();
    }
    
    if (!javaSuccess) {
      console.log('⚠️ [14:40:04] ⚠️ Installation automatique de Java échouée');
      await createInstallationGuide();
      console.log('\n📋 INSTALLATION MANUELLE REQUISE :');
      console.log('1. ☕ Installer Java JDK 17+');
      console.log('2. 🤖 Installer Android Studio');
      console.log('3. 🔧 Configurer les variables d\'environnement');
      console.log('4. 🔄 Relancer : npm run build:real');
      return;
    }
  }
  
  // Vérifier Android SDK
  const androidInstalled = await checkAndroidSDK();
  
  if (!androidInstalled) {
    console.log('⚠️ [14:40:05] ⚠️ Android SDK non détecté');
    console.log('📋 INSTALLATION REQUISE :');
    console.log('1. 🤖 Installer Android Studio');
    console.log('2. 🔧 Configurer le SDK Manager');
    console.log('3. 🔧 Configurer les variables d\'environnement');
    console.log('4. 🔄 Relancer : npm run build:real');
    await createInstallationGuide();
    return;
  }
  
  console.log('\n🎉 TOUS LES OUTILS SONT INSTALLÉS !');
  console.log('✅ Java JDK détecté');
  console.log('✅ Android SDK détecté');
  console.log('\n🚀 Génération des builds...');
  
  // Générer les builds
  try {
    await execa('npm', ['run', 'build:real'], { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ [14:40:06] ⚠️ Erreur lors de la génération des builds');
  }
}

main().catch(console.error);
