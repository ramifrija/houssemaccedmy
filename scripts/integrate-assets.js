#!/usr/bin/env node

/**
 * Script d'intégration des assets dans les projets Capacitor
 * Houssem Academy - Mobile App
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

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

// Copier les icônes iOS
async function copyIconsiOS() {
  log('📱 Copie des icônes iOS...', 'info');
  
  const sourceDir = 'assets/store-assets/icons/ios';
  const targetDir = 'ios/App/App/Assets.xcassets/AppIcon.appiconset';
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    log(`Dossier créé: ${targetDir}`, 'success');
  }
  
  const icons = [
    { source: 'icon-1024.png', target: 'icon-1024.png' },
    { source: 'icon-180.png', target: 'icon-180.png' },
    { source: 'icon-120.png', target: 'icon-120.png' },
    { source: 'icon-167.png', target: 'icon-167.png' },
    { source: 'icon-152.png', target: 'icon-152.png' },
    { source: 'icon-76.png', target: 'icon-76.png' }
  ];
  
  for (const icon of icons) {
    const sourcePath = path.join(sourceDir, icon.source);
    const targetPath = path.join(targetDir, icon.target);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      log(`Copié: ${icon.source}`, 'success');
    } else {
      log(`Manquant: ${icon.source}`, 'warning');
    }
  }
  
  // Créer le fichier Contents.json pour iOS
  const contentsJson = {
    "images": [
      {
        "filename": "icon-1024.png",
        "idiom": "universal",
        "platform": "ios",
        "size": "1024x1024"
      },
      {
        "filename": "icon-180.png",
        "idiom": "iphone",
        "scale": "3x",
        "size": "60x60"
      },
      {
        "filename": "icon-120.png",
        "idiom": "iphone",
        "scale": "2x",
        "size": "60x60"
      },
      {
        "filename": "icon-167.png",
        "idiom": "ipad",
        "scale": "2x",
        "size": "83.5x83.5"
      },
      {
        "filename": "icon-152.png",
        "idiom": "ipad",
        "scale": "2x",
        "size": "76x76"
      },
      {
        "filename": "icon-76.png",
        "idiom": "ipad",
        "scale": "1x",
        "size": "76x76"
      }
    ],
    "info": {
      "author": "xcode",
      "version": 1
    }
  };
  
  fs.writeFileSync(
    path.join(targetDir, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2)
  );
  
  log('Contents.json créé pour iOS', 'success');
}

// Copier les icônes Android
async function copyIconsAndroid() {
  log('🤖 Copie des icônes Android...', 'info');
  
  const sourceDir = 'assets/store-assets/icons/android';
  const targetDirs = {
    'icon-192.png': 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png',
    'icon-144.png': 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png',
    'icon-96.png': 'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png',
    'icon-72.png': 'android/app/src/main/res/mipmap-hdpi/ic_launcher.png',
    'icon-48.png': 'android/app/src/main/res/mipmap-mdpi/ic_launcher.png',
    'icon-36.png': 'android/app/src/main/res/mipmap-ldpi/ic_launcher.png'
  };
  
  for (const [sourceFile, targetPath] of Object.entries(targetDirs)) {
    const sourcePath = path.join(sourceDir, sourceFile);
    const fullTargetPath = targetPath;
    
    // Créer le dossier de destination
    const targetDir = path.dirname(fullTargetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, fullTargetPath);
      log(`Copié: ${sourceFile} → ${targetPath}`, 'success');
    } else {
      log(`Manquant: ${sourceFile}`, 'warning');
    }
  }
}

// Copier les splash screens iOS
async function copySplashiOS() {
  log('📱 Copie des splash screens iOS...', 'info');
  
  const sourceDir = 'assets/store-assets/splash/ios';
  const targetDir = 'ios/App/App/Assets.xcassets/SplashScreen.imageset';
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    log(`Dossier créé: ${targetDir}`, 'success');
  }
  
  const splashs = [
    { source: 'splash-750x1334.png', target: 'splash-750x1334.png' },
    { source: 'splash-1125x2436.png', target: 'splash-1125x2436.png' },
    { source: 'splash-1242x2688.png', target: 'splash-1242x2688.png' },
    { source: 'splash-1668x2388.png', target: 'splash-1668x2388.png' },
    { source: 'splash-2048x2732.png', target: 'splash-2048x2732.png' }
  ];
  
  for (const splash of splashs) {
    const sourcePath = path.join(sourceDir, splash.source);
    const targetPath = path.join(targetDir, splash.target);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      log(`Copié: ${splash.source}`, 'success');
    } else {
      log(`Manquant: ${splash.source}`, 'warning');
    }
  }
  
  // Créer le fichier Contents.json pour les splash screens
  const contentsJson = {
    "images": [
      {
        "filename": "splash-750x1334.png",
        "idiom": "iphone",
        "scale": "2x",
        "size": "375x667"
      },
      {
        "filename": "splash-1125x2436.png",
        "idiom": "iphone",
        "scale": "3x",
        "size": "375x812"
      },
      {
        "filename": "splash-1242x2688.png",
        "idiom": "iphone",
        "scale": "3x",
        "size": "414x896"
      },
      {
        "filename": "splash-1668x2388.png",
        "idiom": "ipad",
        "scale": "2x",
        "size": "834x1194"
      },
      {
        "filename": "splash-2048x2732.png",
        "idiom": "ipad",
        "scale": "2x",
        "size": "1024x1366"
      }
    ],
    "info": {
      "author": "xcode",
      "version": 1
    }
  };
  
  fs.writeFileSync(
    path.join(targetDir, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2)
  );
  
  log('Contents.json créé pour les splash screens iOS', 'success');
}

// Copier les splash screens Android
async function copySplashAndroid() {
  log('🤖 Copie des splash screens Android...', 'info');
  
  const sourceDir = 'assets/store-assets/splash/android';
  const targetDirs = {
    'splash-480x800.png': 'android/app/src/main/res/drawable-hdpi/splash.png',
    'splash-720x1280.png': 'android/app/src/main/res/drawable-xhdpi/splash.png',
    'splash-1080x1920.png': 'android/app/src/main/res/drawable-xxhdpi/splash.png'
  };
  
  for (const [sourceFile, targetPath] of Object.entries(targetDirs)) {
    const sourcePath = path.join(sourceDir, sourceFile);
    const fullTargetPath = targetPath;
    
    // Créer le dossier de destination
    const targetDir = path.dirname(fullTargetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, fullTargetPath);
      log(`Copié: ${sourceFile} → ${targetPath}`, 'success');
    } else {
      log(`Manquant: ${sourceFile}`, 'warning');
    }
  }
}

// Synchroniser Capacitor
async function syncCapacitor() {
  log('🔄 Synchronisation Capacitor...', 'info');
  
  if (execCommand('npx cap sync', 'Synchronisation Capacitor')) {
    log('Capacitor synchronisé avec succès', 'success');
  } else {
    log('Erreur lors de la synchronisation Capacitor', 'error');
  }
}

// Fonction principale
async function main() {
  log('🚀 Intégration des assets dans les projets Capacitor...', 'info');
  
  try {
    // Vérifier que les projets existent
    if (!fs.existsSync('ios') || !fs.existsSync('android')) {
      log('❌ Projets iOS/Android non trouvés. Exécutez d\'abord: npm run deploy:mobile', 'error');
      return;
    }
    
    // Copier les icônes
    await copyIconsiOS();
    await copyIconsAndroid();
    
    // Copier les splash screens
    await copySplashiOS();
    await copySplashAndroid();
    
    // Synchroniser Capacitor
    await syncCapacitor();
    
    log('✅ Intégration des assets terminée avec succès !', 'success');
    
    console.log('\n📋 Assets intégrés :');
    console.log('• Icônes iOS (6 tailles)');
    console.log('• Icônes Android (6 densités)');
    console.log('• Splash screens iOS (5 tailles)');
    console.log('• Splash screens Android (3 densités)');
    console.log('\n🎯 Prochaine étape : Générer les builds de production');
    
  } catch (error) {
    log(`❌ Erreur lors de l'intégration: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Exécution
main();































