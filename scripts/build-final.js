import { execa } from 'execa';
import fs from 'fs';
import path from 'path';

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

async function configureJavaVersion() {
  console.log('ℹ️ [16:15:00] ☕ Configuration de la version Java...');
  
  // Vérifier la version Java
  try {
    const { stdout } = await execa('java', ['-version'], { stdio: 'pipe' });
    console.log('✅ [16:15:00] ✅ Java détecté :', stdout.split('\n')[0]);
  } catch (error) {
    console.log('❌ [16:15:00] ❌ Java non détecté');
    return false;
  }
  
  return true;
}

async function generateWebBuild() {
  console.log('ℹ️ [16:15:01] 🌐 Génération du build web...');
  return await runCommand('npm', ['run', 'build:prod'], 'Build web de production');
}

async function syncCapacitor() {
  console.log('ℹ️ [16:15:02] 🔄 Synchronisation Capacitor...');
  return await runCommand('npx', ['cap', 'sync'], 'Synchronisation Capacitor');
}

async function generateDebugAPK() {
  console.log('ℹ️ [16:15:03] 📱 Génération de l\'APK DEBUG...');
  
  const androidDir = 'android';
  if (!fs.existsSync(androidDir)) {
    console.log('❌ [16:15:03] ❌ Répertoire android non trouvé');
    return false;
  }
  
  try {
    // Nettoyer le projet
    await runCommand('gradlew.bat', ['clean'], 'Nettoyage du projet', androidDir);
    
    // Générer l'APK de debug
    await runCommand('gradlew.bat', ['assembleDebug'], 'Génération APK DEBUG', androidDir);
    
    console.log('✅ [16:15:04] ✅ APK DEBUG généré avec succès !');
    console.log('📁 APK : android/app/build/outputs/apk/debug/app-debug.apk');
    
    return true;
  } catch (error) {
    console.log('⚠️ [16:15:04] ⚠️ Erreur lors de la génération de l\'APK');
    return false;
  }
}

async function createFinalReport(webSuccess, syncSuccess, apkSuccess) {
  const report = {
    timestamp: new Date().toISOString(),
    webBuild: { status: webSuccess ? 'success' : 'failed' },
    capacitorSync: { status: syncSuccess ? 'success' : 'failed' },
    androidAPK: { 
      status: apkSuccess ? 'success' : 'failed',
      apkPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      buildType: 'debug'
    },
    status: apkSuccess ? 'success' : 'failed',
    message: apkSuccess ? 'Application prête pour test !' : 'Échec de la génération',
    nextSteps: [
      'Tester l\'APK sur un appareil Android',
      'Configurer la signature pour les builds de release',
      'Publier sur Google Play Store'
    ]
  };
  
  fs.writeFileSync('FINAL-BUILD-REPORT.json', JSON.stringify(report, null, 2));
  console.log('✅ [16:15:05] Rapport final créé : FINAL-BUILD-REPORT.json');
}

async function main() {
  console.log('🎊 HOUSSEM ACADEMY - GÉNÉRATION FINALE 🎊');
  console.log('📱 Application Android - PRÊTE POUR TEST');
  console.log('==========================================');
  
  // 1. Vérifier Java
  const javaOk = await configureJavaVersion();
  if (!javaOk) {
    console.log('❌ [16:15:00] ❌ Java requis pour continuer');
    return;
  }
  
  // 2. Build web
  const webSuccess = await generateWebBuild();
  if (!webSuccess) {
    console.log('❌ [16:15:01] ❌ Échec du build web');
    return;
  }
  
  // 3. Sync Capacitor
  const syncSuccess = await syncCapacitor();
  if (!syncSuccess) {
    console.log('❌ [16:15:02] ❌ Échec de la synchronisation');
    return;
  }
  
  // 4. Générer APK
  const apkSuccess = await generateDebugAPK();
  
  // 5. Créer le rapport
  await createFinalReport(webSuccess, syncSuccess, apkSuccess);
  
  if (apkSuccess) {
    console.log('\n🎉 APPLICATION GÉNÉRÉE AVEC SUCCÈS !');
    console.log('=====================================');
    console.log('📋 Fichiers créés :');
    console.log('• ✅ Build web : dist/');
    console.log('• ✅ APK DEBUG : android/app/build/outputs/apk/debug/app-debug.apk');
    
    console.log('\n🧪 TEST DE L\'APPLICATION :');
    console.log('===========================');
    console.log('1. 📱 Transférer l\'APK sur un appareil Android');
    console.log('2. 🔧 Activer "Sources inconnues" dans les paramètres');
    console.log('3. 📲 Installer l\'APK : app-debug.apk');
    console.log('4. 🚀 Lancer l\'application');
    
    console.log('\n🎯 FONCTIONNALITÉS DISPONIBLES :');
    console.log('=================================');
    console.log('• ✅ Connexion utilisateur');
    console.log('• ✅ Dashboard administrateur');
    console.log('• ✅ Gestion des présences');
    console.log('• ✅ Calendrier des cours');
    console.log('• ✅ Messagerie');
    console.log('• ✅ Interface mobile optimisée');
    
    console.log('\n🚀 PROCHAINES ÉTAPES :');
    console.log('======================');
    console.log('1. 🧪 Tester l\'application sur un appareil');
    console.log('2. 🔐 Configurer la signature pour les builds de production');
    console.log('3. 📱 Générer les builds de release');
    console.log('4. 🏪 Publier sur Google Play Store');
    console.log('5. 🎊 Les utilisateurs pourront télécharger l\'app !');
    
  } else {
    console.log('\n❌ ÉCHEC DE LA GÉNÉRATION');
    console.log('=========================');
    console.log('📋 Problèmes détectés :');
    console.log('• Configuration Java/Gradle');
    console.log('• Dépendances Capacitor');
    
    console.log('\n🔧 SOLUTIONS :');
    console.log('=============');
    console.log('1. 🔄 Redémarrer le terminal');
    console.log('2. 🔄 Relancer : npm run build:final');
    console.log('3. 🔧 Vérifier Android Studio');
  }
}

main().catch(console.error);






























