import { execa } from 'execa';
import fs from 'fs';
import path from 'path';

async function runCommand(command, args, description) {
  console.log(`ℹ️ [${new Date().toLocaleTimeString('fr-FR')}] Exécution: ${description}`);
  try {
    const { stdout, stderr } = await execa(command, args, { stdio: 'pipe' });
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log(`✅ [${new Date().toLocaleTimeString('fr-FR')}] Succès: ${description}`);
    return true;
  } catch (error) {
    console.error(`❌ [${new Date().toLocaleTimeString('fr-FR')}] Erreur: ${description} - ${error.message}`);
    return false;
  }
}

async function findJavaInstallation() {
  console.log('ℹ️ [14:50:00] 🔍 Recherche de l\'installation Java...');
  
  const possiblePaths = [
    'C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.16.8-hotspot',
    'C:\\Program Files\\Java\\jdk-17',
    'C:\\Program Files\\Java\\jdk-17.0.16.8',
    'C:\\Program Files\\OpenJDK\\jdk-17',
  ];
  
  for (const javaPath of possiblePaths) {
    if (fs.existsSync(javaPath)) {
      console.log(`✅ [14:50:00] ✅ Java trouvé : ${javaPath}`);
      return javaPath;
    }
  }
  
  console.log('❌ [14:50:00] ❌ Java non trouvé dans les emplacements standards');
  return null;
}

async function testJavaPath(javaPath) {
  const javaExe = path.join(javaPath, 'bin', 'java.exe');
  console.log(`ℹ️ [14:50:01] 🧪 Test de Java : ${javaExe}`);
  
  try {
    const { stdout } = await execa(javaExe, ['-version'], { stdio: 'pipe' });
    console.log('✅ [14:50:01] ✅ Java fonctionne !');
    console.log(`   Version : ${stdout.split('\n')[0]}`);
    return true;
  } catch (error) {
    console.log('❌ [14:50:01] ❌ Java ne fonctionne pas');
    return false;
  }
}

async function createPathScript(javaPath) {
  const scriptContent = `
# Configuration automatique du PATH pour Java
# Exécuter ce script en tant qu'administrateur

$javaPath = "${javaPath}\\bin"
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")

if ($currentPath -notlike "*$javaPath*") {
    $newPath = $currentPath + ";" + $javaPath
    [Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
    Write-Host "✅ Java ajouté au PATH système"
} else {
    Write-Host "✅ Java déjà dans le PATH"
}

# Redémarrer le terminal pour appliquer les changements
Write-Host "🔄 Redémarrez le terminal pour appliquer les changements"
`;

  fs.writeFileSync('configure-java-path.ps1', scriptContent);
  console.log('✅ [14:50:02] Script de configuration créé : configure-java-path.ps1');
}

async function createManualInstructions(javaPath) {
  const instructions = `
# 🛠️ CONFIGURATION MANUELLE DE JAVA

## 📍 Java installé à :
${javaPath}

## 🔧 Configuration du PATH (Windows) :

### Option 1 : Via l'interface Windows
1. Appuyer sur **Windows + R**
2. Taper : **sysdm.cpl**
3. Cliquer sur **Variables d'environnement**
4. Dans **Variables système**, trouver **Path**
5. Cliquer sur **Modifier**
6. Cliquer sur **Nouveau**
7. Ajouter : **${javaPath}\\bin**
8. Cliquer sur **OK** sur toutes les fenêtres
9. **Redémarrer le terminal**

### Option 2 : Via PowerShell (en tant qu'administrateur)
\`\`\`powershell
$javaPath = "${javaPath}\\bin"
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
$newPath = $currentPath + ";" + $javaPath
[Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
\`\`\`

### Option 3 : Exécuter le script automatique
\`\`\`powershell
# En tant qu'administrateur
.\\configure-java-path.ps1
\`\`\`

## ✅ Vérification après configuration :
\`\`\`bash
java -version
\`\`\`

## 🎯 Prochaines étapes :
1. ✅ Java configuré
2. 🤖 Installer Android Studio
3. 🚀 Générer les builds
`;

  fs.writeFileSync('CONFIGURATION-JAVA.md', instructions);
  console.log('✅ [14:50:03] Instructions créées : CONFIGURATION-JAVA.md');
}

async function main() {
  console.log('☕ CONFIGURATION DE JAVA - HOUSSEM ACADEMY');
  console.log('==========================================');
  
  // Trouver Java
  const javaPath = await findJavaInstallation();
  
  if (!javaPath) {
    console.log('❌ [14:50:00] ❌ Java non trouvé');
    console.log('📋 INSTALLATION REQUISE :');
    console.log('1. Télécharger Java JDK 17');
    console.log('2. Installer Java');
    console.log('3. Relancer ce script');
    return;
  }
  
  // Tester Java
  const javaWorks = await testJavaPath(javaPath);
  
  if (!javaWorks) {
    console.log('❌ [14:50:01] ❌ Java ne fonctionne pas');
    return;
  }
  
  // Créer les scripts d'aide
  await createPathScript(javaPath);
  await createManualInstructions(javaPath);
  
  console.log('\n🎉 JAVA DÉTECTÉ ET FONCTIONNEL !');
  console.log('================================');
  console.log(`📍 Emplacement : ${javaPath}`);
  console.log('✅ Version : JDK 17');
  console.log('✅ Installation : OK');
  
  console.log('\n🔧 CONFIGURATION DU PATH REQUISE :');
  console.log('==================================');
  console.log('1. 📄 Instructions : CONFIGURATION-JAVA.md');
  console.log('2. 🔧 Script automatique : configure-java-path.ps1');
  console.log('3. 🔄 Redémarrer le terminal après configuration');
  
  console.log('\n🎯 PROCHAINES ÉTAPES :');
  console.log('=====================');
  console.log('1. 🔧 Configurer le PATH (voir CONFIGURATION-JAVA.md)');
  console.log('2. 🔄 Redémarrer le terminal');
  console.log('3. ✅ Vérifier : java -version');
  console.log('4. 🤖 Installer Android Studio');
  console.log('5. 🚀 Générer les builds : npm run build:real');
}

main().catch(console.error);































