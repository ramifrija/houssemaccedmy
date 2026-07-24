#!/usr/bin/env node

/**
 * Script de génération automatique COMPLÈTE
 * iOS + Android - Houssem Academy
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Fonctions utilitaires
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  console.log(`${icons[type]} [${timestamp}] ${message}`);
}

// Générer TOUS les builds automatiquement
async function buildAllAutomatic() {
  log('🚀 GÉNÉRATION AUTOMATIQUE COMPLÈTE - iOS + Android', 'info');
  
  try {
    // 1. Build web de production
    log('🌐 Build de production web...', 'info');
    execSync('npm run build:prod', { stdio: 'inherit' });
    log('✅ Build web terminé', 'success');
    
    // 2. Synchroniser Capacitor
    log('🔄 Synchronisation Capacitor...', 'info');
    execSync('npx cap sync', { stdio: 'inherit' });
    log('✅ Capacitor synchronisé', 'success');
    
    // 3. Générer le build iOS
    log('📱 Génération du build iOS...', 'info');
    execSync('node scripts/build-ios-auto.js', { stdio: 'inherit' });
    log('✅ Build iOS généré', 'success');
    
    // 4. Générer le build Android
    log('🤖 Génération du build Android...', 'info');
    execSync('node scripts/build-android-auto.js', { stdio: 'inherit' });
    log('✅ Build Android généré', 'success');
    
    // 5. Créer le rapport final
    createFinalReport();
    
    log('🎉 TOUS LES BUILDS GÉNÉRÉS AVEC SUCCÈS !', 'success');
    
    return true;
    
  } catch (error) {
    log(`❌ Erreur lors de la génération: ${error.message}`, 'error');
    return false;
  }
}

// Créer le rapport final
function createFinalReport() {
  const report = {
    project: 'Houssem Academy',
    version: '1.0.0',
    buildDate: new Date().toISOString(),
    status: 'READY_FOR_PUBLICATION',
    builds: {
      ios: {
        ipa: 'ios/build/App.ipa',
        status: 'ready',
        store: 'App Store Connect'
      },
      android: {
        apk: 'android/app/build/outputs/apk/release/app-release.apk',
        bundle: 'android/app/build/outputs/bundle/release/app-release.aab',
        status: 'ready',
        store: 'Google Play Console'
      }
    },
    nextSteps: [
      '1. Télécharger App.ipa vers App Store Connect',
      '2. Télécharger app-release.aab vers Google Play Console',
      '3. Remplir les métadonnées dans les stores',
      '4. Soumettre pour review',
      '5. Publier sur les stores'
    ],
    storeConfig: {
      appStore: {
        bundleId: 'com.houssemacademy.app',
        appName: 'Houssem Academy',
        version: '1.0.0',
        build: '1'
      },
      googlePlay: {
        packageName: 'com.houssemacademy.app',
        appName: 'Houssem Academy',
        versionName: '1.0.0',
        versionCode: '1'
      }
    }
  };
  
  fs.writeFileSync('PUBLICATION-READY.json', JSON.stringify(report, null, 2));
  log('📊 Rapport final créé: PUBLICATION-READY.json', 'success');
}

// Fonction principale
async function main() {
  console.log('🎊 HOUSSEM ACADEMY - GÉNÉRATION AUTOMATIQUE COMPLÈTE 🎊');
  console.log('📱 iOS + 🤖 Android - PRÊT POUR PUBLICATION');
  console.log('=' .repeat(60));
  
  try {
    const success = await buildAllAutomatic();
    
    if (success) {
      console.log('\n🎉 FÉLICITATIONS ! VOTRE APPLICATION EST PRÊTE !');
      console.log('\n📋 Builds générés :');
      console.log('• iOS IPA : ios/build/App.ipa');
      console.log('• Android APK : android/app/build/outputs/apk/release/app-release.apk');
      console.log('• Android Bundle : android/app/build/outputs/bundle/release/app-release.aab');
      
      console.log('\n🎯 PROCHAINES ÉTAPES :');
      console.log('1. 📱 App Store Connect : Télécharger App.ipa');
      console.log('2. 🤖 Google Play Console : Télécharger app-release.aab');
      console.log('3. 📖 Suivre le guide de publication');
      console.log('4. 🚀 Publier sur les stores !');
      
      console.log('\n📖 Guide de publication : PUBLICATION-GUIDE.md');
      console.log('📊 Rapport complet : PUBLICATION-READY.json');
      
    } else {
      log('❌ Échec de la génération automatique', 'error');
    }
    
  } catch (error) {
    log(`❌ Erreur critique: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Exécution
main();
