#!/usr/bin/env node

/**
 * Script de création des splash screens (version simplifiée)
 * Houssem Academy - Mobile App
 */

import sharp from 'sharp';
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

// Configuration des tailles de splash screens (version simplifiée)
const SPLASH_SIZES = {
  ios: [
    { width: 750, height: 1334, name: 'iPhone-6', filename: 'splash-750x1334.png' },
    { width: 1125, height: 2436, name: 'iPhone-X', filename: 'splash-1125x2436.png' },
    { width: 1242, height: 2688, name: 'iPhone-X-Max', filename: 'splash-1242x2688.png' },
    { width: 1668, height: 2388, name: 'iPad-Pro-11', filename: 'splash-1668x2388.png' },
    { width: 2048, height: 2732, name: 'iPad-Pro-12.9', filename: 'splash-2048x2732.png' }
  ],
  android: [
    { width: 480, height: 800, name: 'WVGA', filename: 'splash-480x800.png' },
    { width: 720, height: 1280, name: 'HD', filename: 'splash-720x1280.png' },
    { width: 1080, height: 1920, name: 'Full-HD', filename: 'splash-1080x1920.png' }
  ]
};

// Créer un splash screen simple
async function createSplashScreen(width, height, filename) {
  log(`🎨 Création du splash screen ${width}x${height}...`, 'info');
  
  try {
    // Créer le splash screen avec Sharp
    const splash = await sharp({
      create: {
        width: width,
        height: height,
        channels: 3,
        background: { r: 37, g: 99, b: 235 } // #2563eb
      }
    })
    .png()
    .toFile(filename);

    log(`✅ Splash screen créé: ${filename}`, 'success');
    return true;
  } catch (error) {
    log(`❌ Erreur création splash ${filename}: ${error.message}`, 'error');
    return false;
  }
}

// Générer tous les splash screens
async function generateAllSplashScreens() {
  log('🔄 Génération de tous les splash screens...', 'info');
  
  // Créer les dossiers
  const dirs = [
    'assets/store-assets/splash/ios',
    'assets/store-assets/splash/android'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`📁 Dossier créé: ${dir}`, 'success');
    }
  });

  for (const platform of Object.keys(SPLASH_SIZES)) {
    log(`📱 Génération des splash screens ${platform}...`, 'info');
    
    for (const splash of SPLASH_SIZES[platform]) {
      const outputPath = `assets/store-assets/splash/${platform}/${splash.filename}`;
      
      try {
        await createSplashScreen(splash.width, splash.height, outputPath);
      } catch (error) {
        log(`❌ Erreur ${splash.filename}: ${error.message}`, 'error');
      }
    }
  }
  
  log('🎉 Génération des splash screens terminée !', 'success');
  return true;
}

// Fonction principale
async function main() {
  log('🚀 Création complète des splash screens Houssem Academy...', 'info');
  
  try {
    await generateAllSplashScreens();
    
    log('✅ Création des splash screens terminée avec succès !', 'success');
    
    console.log('\n📋 Splash screens créés :');
    console.log('• 5 tailles iOS (iPhone + iPad)');
    console.log('• 3 tailles Android (HD + Full HD)');
    console.log('\n🎯 Prochaine étape : Paramétrer les comptes développeurs');
    
  } catch (error) {
    log(`❌ Erreur lors de la création: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Exécution
main();































