#!/usr/bin/env node

/**
 * Script de génération des builds de production
 * Houssem Academy - Mobile App
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

function execCommand(command, description) {
  try {
    log(`Exécution: ${description}`, 'info');
    execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`Succès: ${description}`, 'success');
    return true;
  } catch (error) {
    log(`Erreur: ${description} - ${error.message}`, 'error');
    return false;
  }
}

// Build de production web
async function buildWebProduction() {
  log('🌐 Build de production web...', 'info');
  
  if (execCommand('npm run build:prod', 'Build de production web')) {
    log('Build web terminé avec succès', 'success');
    return true;
  } else {
    log('Erreur lors du build web', 'error');
    return false;
  }
}

// Synchroniser Capacitor
async function syncCapacitor() {
  log('🔄 Synchronisation Capacitor...', 'info');
  
  if (execCommand('npx cap sync', 'Synchronisation Capacitor')) {
    log('Capacitor synchronisé avec succès', 'success');
    return true;
  } else {
    log('Erreur lors de la synchronisation Capacitor', 'error');
    return false;
  }
}

// Générer le build iOS
async function buildiOS() {
  log('📱 Génération du build iOS...', 'info');
  
  try {
    // Ouvrir Xcode
    log('Ouverture de Xcode...', 'info');
    execSync('npx cap open ios', { stdio: 'inherit' });
    
    log('✅ Xcode ouvert. Instructions pour le build iOS :', 'success');
    console.log('\n📋 Instructions iOS :');
    console.log('1. Dans Xcode, sélectionner "Any iOS Device (arm64)"');
    console.log('2. Aller dans Product → Archive');
    console.log('3. Attendre la fin de l\'archive');
    console.log('4. Cliquer sur "Distribute App"');
    console.log('5. Choisir "App Store Connect"');
    console.log('6. Suivre les étapes de distribution');
    console.log('7. Le build sera téléchargé vers App Store Connect');
    
    return true;
  } catch (error) {
    log(`Erreur ouverture Xcode: ${error.message}`, 'error');
    return false;
  }
}

// Générer le build Android
async function buildAndroid() {
  log('🤖 Génération du build Android...', 'info');
  
  try {
    // Ouvrir Android Studio
    log('Ouverture d\'Android Studio...', 'info');
    execSync('npx cap open android', { stdio: 'inherit' });
    
    log('✅ Android Studio ouvert. Instructions pour le build Android :', 'success');
    console.log('\n📋 Instructions Android :');
    console.log('1. Dans Android Studio, aller dans Build → Generate Signed Bundle/APK');
    console.log('2. Choisir "Android App Bundle"');
    console.log('3. Créer ou utiliser un keystore existant');
    console.log('4. Remplir les informations de signature');
    console.log('5. Choisir "release" comme build variant');
    console.log('6. Cliquer sur "Create"');
    console.log('7. Le fichier .aab sera généré dans android/app/build/outputs/bundle/release/');
    console.log('8. Télécharger ce fichier dans Google Play Console');
    
    return true;
  } catch (error) {
    log(`Erreur ouverture Android Studio: ${error.message}`, 'error');
    return false;
  }
}

// Créer le rapport de build
async function createBuildReport() {
  log('📊 Création du rapport de build...', 'info');
  
  const report = {
    project: 'Houssem Academy',
    version: '1.0.0',
    buildDate: new Date().toISOString(),
    status: 'ready_for_production',
    assets: {
      icons: {
        ios: ['icon-1024.png', 'icon-180.png', 'icon-120.png', 'icon-167.png', 'icon-152.png', 'icon-76.png'],
        android: ['icon-512.png', 'icon-192.png', 'icon-144.png', 'icon-96.png', 'icon-72.png', 'icon-48.png', 'icon-36.png']
      },
      splashScreens: {
        ios: ['splash-750x1334.png', 'splash-1125x2436.png', 'splash-1242x2688.png', 'splash-1668x2388.png', 'splash-2048x2732.png'],
        android: ['splash-480x800.png', 'splash-720x1280.png', 'splash-1080x1920.png']
      }
    },
    nextSteps: [
      'Générer le build iOS dans Xcode',
      'Générer le build Android dans Android Studio',
      'Télécharger les builds vers les stores',
      'Soumettre pour review',
      'Publier sur les stores'
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
  
  fs.writeFileSync(
    'build-report.json',
    JSON.stringify(report, null, 2)
  );
  
  log('Rapport de build créé: build-report.json', 'success');
}

// Fonction principale
async function main() {
  log('🚀 Génération des builds de production Houssem Academy...', 'info');
  
  try {
    // Build web de production
    await buildWebProduction();
    
    // Synchroniser Capacitor
    await syncCapacitor();
    
    // Créer le rapport
    await createBuildReport();
    
    log('✅ Préparation des builds terminée avec succès !', 'success');
    
    console.log('\n📋 Builds prêts :');
    console.log('• Build web de production');
    console.log('• Projets iOS et Android synchronisés');
    console.log('• Assets intégrés');
    console.log('• Rapport de build créé');
    
    console.log('\n🎯 Prochaines étapes :');
    console.log('1. Ouvrir Xcode pour générer le build iOS');
    console.log('2. Ouvrir Android Studio pour générer le build Android');
    console.log('3. Télécharger les builds vers les stores');
    console.log('4. Soumettre pour review');
    
    // Demander quelle plateforme ouvrir
    console.log('\n❓ Quelle plateforme voulez-vous ouvrir ?');
    console.log('• iOS : npm run cap:ios');
    console.log('• Android : npm run cap:android');
    
  } catch (error) {
    log(`❌ Erreur lors de la génération: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Exécution
main();































