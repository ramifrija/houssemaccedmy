#!/usr/bin/env node

/**
 * Script de génération automatique du build iOS
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

// Configuration du projet iOS
async function configureiOSProject() {
  log('📱 Configuration du projet iOS...', 'info');
  
  const iosProjectPath = 'ios/App/App.xcodeproj/project.pbxproj';
  
  if (fs.existsSync(iosProjectPath)) {
    // Lire le fichier de projet
    let projectContent = fs.readFileSync(iosProjectPath, 'utf8');
    
    // Modifier les paramètres de version
    projectContent = projectContent.replace(
      /MARKETING_VERSION = [^;]+;/g,
      'MARKETING_VERSION = 1.0.0;'
    );
    
    projectContent = projectContent.replace(
      /CURRENT_PROJECT_VERSION = [^;]+;/g,
      'CURRENT_PROJECT_VERSION = 1;'
    );
    
    projectContent = projectContent.replace(
      /IPHONEOS_DEPLOYMENT_TARGET = [^;]+;/g,
      'IPHONEOS_DEPLOYMENT_TARGET = 13.0;'
    );
    
    // Sauvegarder le fichier modifié
    fs.writeFileSync(iosProjectPath, projectContent);
    log('Configuration iOS mise à jour', 'success');
  }
}

// Générer le build iOS automatiquement
async function buildiOSAutomatic() {
  log('🚀 Génération automatique du build iOS...', 'info');
  
  try {
    // 1. Build web de production
    if (!execCommand('npm run build:prod', 'Build de production web')) {
      return false;
    }
    
    // 2. Synchroniser Capacitor
    if (!execCommand('npx cap sync', 'Synchronisation Capacitor')) {
      return false;
    }
    
    // 3. Configurer le projet iOS
    await configureiOSProject();
    
    // 4. Générer l'archive iOS
    log('📦 Génération de l\'archive iOS...', 'info');
    
    // Aller dans le dossier iOS
    process.chdir('ios');
    
    try {
      // Nettoyer le projet
      execCommand('xcodebuild clean -workspace App.xcworkspace -scheme App', 'Nettoyage du projet iOS');
      
      // Générer l'archive
      execCommand('xcodebuild archive -workspace App.xcworkspace -scheme App -archivePath App.xcarchive -configuration Release', 'Génération de l\'archive iOS');
      
      // Créer l'IPA
      execCommand('xcodebuild -exportArchive -archivePath App.xcarchive -exportPath ./build -exportOptionsPlist ../scripts/ExportOptions.plist', 'Export de l\'IPA');
      
      log('✅ Build iOS généré avec succès !', 'success');
      log('📁 Fichier IPA : ios/build/App.ipa', 'success');
      
    } finally {
      // Retourner au dossier racine
      process.chdir('..');
    }
    
    return true;
    
  } catch (error) {
    log(`❌ Erreur lors de la génération iOS: ${error.message}`, 'error');
    return false;
  }
}

// Créer le fichier de configuration d'export
function createExportOptions() {
  const exportOptions = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
    <key>signingStyle</key>
    <string>automatic</string>
</dict>
</plist>`;

  fs.writeFileSync('scripts/ExportOptions.plist', exportOptions);
  log('Fichier ExportOptions.plist créé', 'success');
}

// Fonction principale
async function main() {
  log('🚀 GÉNÉRATION AUTOMATIQUE DU BUILD iOS - Houssem Academy', 'info');
  
  try {
    // Créer le fichier de configuration d'export
    createExportOptions();
    
    // Générer le build iOS
    const success = await buildiOSAutomatic();
    
    if (success) {
      log('🎉 BUILD iOS GÉNÉRÉ AVEC SUCCÈS !', 'success');
      
      console.log('\n📋 Build iOS prêt :');
      console.log('• Fichier IPA : ios/build/App.ipa');
      console.log('• Prêt pour App Store Connect');
      console.log('• Configuration automatique terminée');
      
      console.log('\n🎯 Prochaines étapes :');
      console.log('1. Aller sur App Store Connect');
      console.log('2. Télécharger le fichier App.ipa');
      console.log('3. Suivre le guide de publication');
      
    } else {
      log('❌ Échec de la génération du build iOS', 'error');
    }
    
  } catch (error) {
    log(`❌ Erreur lors de la génération: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Exécution
main();
