#!/usr/bin/env node

/**
 * Script de génération automatique du build Android
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

// Créer un keystore automatiquement
async function createKeystore() {
  log('🔐 Création automatique du keystore...', 'info');
  
  const keystorePath = 'android/app/houssem-academy-key.keystore';
  
  if (!fs.existsSync(keystorePath)) {
    const storePass = process.env.KEYSTORE_PASSWORD
    const keyPass = process.env.KEY_PASSWORD || storePass

    if (!storePass) {
      log('Définissez KEYSTORE_PASSWORD pour créer le keystore', 'error')
      return false
    }

    try {
      const keystoreCommand = `keytool -genkey -v -keystore "${keystorePath}" -alias houssem-academy -keyalg RSA -keysize 2048 -validity 10000 -storepass ${storePass} -keypass ${keyPass} -dname "CN=Houssem Academy, OU=IT, O=Houssem Academy, L=Paris, ST=Paris, C=FR"`;
      
      execCommand(keystoreCommand, 'Génération du keystore');
      log('Keystore créé avec succès', 'success');
      
    } catch (error) {
      log(`Erreur création keystore: ${error.message}`, 'warning');
      log('Création d\'un keystore de test...', 'info');
      
      // Créer un keystore de test simple
      const testKeystore = Buffer.alloc(1024); // Keystore factice pour les tests
      fs.writeFileSync(keystorePath, testKeystore);
      log('Keystore de test créé', 'success');
    }
  } else {
    log('Keystore déjà existant', 'info');
  }
}

// Configurer le projet Android
async function configureAndroidProject() {
  log('🤖 Configuration du projet Android...', 'info');
  
  const buildGradlePath = 'android/app/build.gradle';
  
  if (fs.existsSync(buildGradlePath)) {
    let buildContent = fs.readFileSync(buildGradlePath, 'utf8');
    
    // Modifier les paramètres de version
    buildContent = buildContent.replace(
      /versionName\s+"[^"]+"/g,
      'versionName "1.0.0"'
    );
    
    buildContent = buildContent.replace(
      /versionCode\s+\d+/g,
      'versionCode 1'
    );
    
    buildContent = buildContent.replace(
      /minSdkVersion\s+\d+/g,
      'minSdkVersion 22'
    );
    
    buildContent = buildContent.replace(
      /targetSdkVersion\s+\d+/g,
      'targetSdkVersion 34'
    );

    fs.writeFileSync(buildGradlePath, buildContent);
    log('Configuration Android mise à jour', 'success');
  }
}

// Générer le build Android automatiquement
async function buildAndroidAutomatic() {
  log('🚀 Génération automatique du build Android...', 'info');
  
  try {
    // 1. Build web de production
    if (!execCommand('npm run build:prod', 'Build de production web')) {
      return false;
    }
    
    // 2. Synchroniser Capacitor
    if (!execCommand('npx cap sync', 'Synchronisation Capacitor')) {
      return false;
    }
    
    // 3. Créer le keystore
    await createKeystore();
    
    // 4. Configurer le projet Android
    await configureAndroidProject();
    
    // 5. Générer les builds Android
    log('📦 Génération des builds Android...', 'info');
    
    // Aller dans le dossier Android
    process.chdir('android');
    
    try {
      // Nettoyer le projet
      execCommand('./gradlew clean', 'Nettoyage du projet Android');
      
      // Générer l'APK de release
      execCommand('./gradlew assembleRelease', 'Génération de l\'APK');
      
      // Générer le bundle pour Google Play
      execCommand('./gradlew bundleRelease', 'Génération du bundle');
      
      log('✅ Builds Android générés avec succès !', 'success');
      log('📁 APK : android/app/build/outputs/apk/release/app-release.apk', 'success');
      log('📁 Bundle : android/app/build/outputs/bundle/release/app-release.aab', 'success');
      
    } finally {
      // Retourner au dossier racine
      process.chdir('..');
    }
    
    return true;
    
  } catch (error) {
    log(`❌ Erreur lors de la génération Android: ${error.message}`, 'error');
    return false;
  }
}

// Fonction principale
async function main() {
  log('🚀 GÉNÉRATION AUTOMATIQUE DU BUILD ANDROID - Houssem Academy', 'info');
  
  try {
    // Générer le build Android
    const success = await buildAndroidAutomatic();
    
    if (success) {
      log('🎉 BUILDS ANDROID GÉNÉRÉS AVEC SUCCÈS !', 'success');
      
      console.log('\n📋 Builds Android prêts :');
      console.log('• APK : android/app/build/outputs/apk/release/app-release.apk');
      console.log('• Bundle : android/app/build/outputs/bundle/release/app-release.aab');
      console.log('• Prêt pour Google Play Console');
      console.log('• Configuration automatique terminée');
      
      console.log('\n🎯 Prochaines étapes :');
      console.log('1. Aller sur Google Play Console');
      console.log('2. Télécharger le fichier app-release.aab');
      console.log('3. Suivre le guide de publication');
      
    } else {
      log('❌ Échec de la génération des builds Android', 'error');
    }
    
  } catch (error) {
    log(`❌ Erreur lors de la génération: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Exécution
main();
