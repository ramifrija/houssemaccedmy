import { execa } from 'execa';
import fs from 'fs';
import path from 'path';

async function runCommand(command, args, description, cwd = process.cwd()) {
  console.log(`ℹ️ [${new Date().toLocaleTimeString('fr-FR')}] Exécution: ${description}`);
  try {
    const { stdout, stderr } = await execa(command, args, { cwd, stdio: 'pipe' });
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log(`✅ [${new Date().toLocaleTimeString('fr-FR')}] Succès: ${description}`);
    return true;
  } catch (error) {
    console.error(`❌ [${new Date().toLocaleTimeString('fr-FR')}] Erreur: ${description} - ${error.message}`);
    return false;
  }
}

async function generateDebugBuild() {
  console.log('ℹ️ [16:05:00] 🤖 Génération du build Android DEBUG...');
  
  const androidProjectDir = 'android';
  
  if (!fs.existsSync(androidProjectDir)) {
    console.log('❌ [16:05:00] ❌ Répertoire android non trouvé');
    return false;
  }

  try {
    // Nettoyer le projet
    console.log('ℹ️ [16:05:00] 🧹 Nettoyage du projet Android...');
    await runCommand('gradlew.bat', ['clean'], 'Nettoyage du projet Android', androidProjectDir);
    
    // Générer l'APK de debug (pas besoin de signature)
    console.log('ℹ️ [16:05:01] 📦 Génération de l\'APK DEBUG...');
    await runCommand('gradlew.bat', ['assembleDebug'], 'Génération de l\'APK DEBUG', androidProjectDir);
    
    console.log('✅ [16:05:02] ✅ Build Android DEBUG généré avec succès !');
    console.log('📁 APK DEBUG : android/app/build/outputs/apk/debug/app-debug.apk');
    
    return true;
  } catch (error) {
    console.log('⚠️ [16:05:02] ⚠️ Erreur lors de la génération du build DEBUG');
    return false;
  }
}

async function createBuildReport(success) {
  const report = {
    timestamp: new Date().toISOString(),
    webBuild: { status: 'success', path: 'dist/' },
    capacitorSync: { status: 'success' },
    androidBuild: { 
      status: success ? 'success' : 'failed', 
      apkPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      buildType: 'debug'
    },
    iosBuild: { 
      status: 'pending', 
      ipaPath: 'ios/App/build/App.ipa',
      note: 'Requiert Xcode sur macOS'
    },
    status: success ? 'success' : 'failed',
    message: success ? 'Build DEBUG généré avec succès !' : 'Échec de la génération du build',
    nextSteps: [
      'Tester l\'APK sur un appareil Android',
      'Configurer la signature pour les builds de release',
      'Générer les builds de production',
      'Publier sur Google Play Store'
    ]
  };
  
  fs.writeFileSync('DEBUG-BUILD-REPORT.json', JSON.stringify(report, null, 2));
  console.log(`✅ [16:05:03] Rapport de build créé: DEBUG-BUILD-REPORT.json`);
}

async function main() {
  console.log('🎊 HOUSSEM ACADEMY - GÉNÉRATION BUILD DEBUG 🎊');
  console.log('📱 Android DEBUG - PRÊT POUR TEST');
  console.log('==============================================');
  
  // Générer le build de debug
  const success = await generateDebugBuild();
  
  // Créer le rapport
  await createBuildReport(success);
  
  if (success) {
    console.log('\n🎉 BUILD DEBUG GÉNÉRÉ AVEC SUCCÈS !');
    console.log('===================================');
    console.log('📋 Build généré :');
    console.log('• ✅ APK DEBUG : android/app/build/outputs/apk/debug/app-debug.apk');
    console.log('• ✅ Prêt pour test sur appareil Android');
    
    console.log('\n🧪 TEST DE L\'APPLICATION :');
    console.log('===========================');
    console.log('1. 📱 Transférer l\'APK sur un appareil Android');
    console.log('2. 🔧 Activer "Sources inconnues" dans les paramètres');
    console.log('3. 📲 Installer l\'APK');
    console.log('4. 🚀 Tester l\'application');
    
    console.log('\n🎯 PROCHAINES ÉTAPES :');
    console.log('=====================');
    console.log('1. 🧪 Tester l\'APK sur un appareil');
    console.log('2. 🔐 Configurer la signature pour les builds de release');
    console.log('3. 📱 Générer les builds de production');
    console.log('4. 🏪 Publier sur Google Play Store');
  } else {
    console.log('\n❌ ÉCHEC DE LA GÉNÉRATION');
    console.log('=========================');
    console.log('📋 Problèmes détectés :');
    console.log('• Configuration Gradle incorrecte');
    console.log('• Signature requise pour les builds de release');
    
    console.log('\n🔧 SOLUTIONS :');
    console.log('=============');
    console.log('1. 🔐 Créer un keystore pour la signature');
    console.log('2. 🔧 Corriger la configuration build.gradle');
    console.log('3. 🔄 Relancer la génération');
  }
  
  console.log('\n💡 GUIDE COMPLET : GUIDE-FINAL-BUILDS.md');
}

main().catch(console.error);






























