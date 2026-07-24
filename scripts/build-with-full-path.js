import { execa } from 'execa';
import fs from 'fs';

const JAVA_PATH = 'C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.16.8-hotspot\\bin\\java.exe';

async function runCommand(command, args, description, cwd = process.cwd()) {
  console.log(`ℹ️ [${new Date().toLocaleTimeString('fr-FR')}] Exécution: ${description}`);
  try {
    await execa(command, args, { cwd, stdio: 'inherit' });
    console.log(`✅ [${new Date().toLocaleTimeString('fr-FR')}] Succès: ${description}`);
    return true;
  } catch (error) {
    console.error(`❌ [${new Date().toLocaleTimeString('fr-FR')}] Erreur: ${description} - ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 GÉNÉRATION DES BUILDS AVEC CHEMIN COMPLET JAVA');
  console.log('================================================');
  
  // Vérifier Java
  console.log('ℹ️ [14:55:00] ☕ Vérification de Java...');
  try {
    const { stdout } = await execa(JAVA_PATH, ['-version'], { stdio: 'pipe' });
    console.log('✅ [14:55:00] ✅ Java détecté :', stdout.split('\n')[0]);
  } catch (error) {
    console.log('❌ [14:55:00] ❌ Java non accessible');
    return;
  }
  
  // Générer le build Android
  console.log('ℹ️ [14:55:01] 🤖 Génération du build Android...');
  
  const androidProjectDir = 'android';
  
  if (!fs.existsSync(androidProjectDir)) {
    console.log('❌ [14:55:01] ❌ Répertoire android non trouvé');
    return;
  }

  try {
    // Nettoyer le projet
    console.log('ℹ️ [14:55:01] 🧹 Nettoyage du projet Android...');
    await runCommand('gradlew.bat', ['clean'], 'Nettoyage du projet Android', androidProjectDir);
    
    // Générer l'APK
    console.log('ℹ️ [14:55:02] 📦 Génération de l\'APK...');
    await runCommand('gradlew.bat', ['assembleRelease'], 'Génération de l\'APK', androidProjectDir);
    
    // Générer l'AAB
    console.log('ℹ️ [14:55:03] 📦 Génération du bundle Android...');
    await runCommand('gradlew.bat', ['bundleRelease'], 'Génération du bundle Android', androidProjectDir);
    
    console.log('✅ [14:55:04] ✅ Builds Android générés avec succès !');
    console.log('📁 APK : android/app/build/outputs/apk/release/app-release.apk');
    console.log('📁 Bundle : android/app/build/outputs/bundle/release/app-release.aab');
    
  } catch (error) {
    console.log('⚠️ [14:55:04] ⚠️ Erreur lors de la génération Android');
    console.log('💡 Essayez d\'installer Android Studio pour une meilleure expérience');
  }
}

main().catch(console.error);
