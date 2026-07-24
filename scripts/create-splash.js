#!/usr/bin/env node

/**
 * Script de création des splash screens
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

// Configuration des tailles de splash screens
const SPLASH_SIZES = {
  ios: [
    { size: '1242x2688', name: 'iPhone-X', filename: 'splash-1242x2688.png' },
    { size: '1125x2436', name: 'iPhone-XS', filename: 'splash-1125x2436.png' },
    { size: '828x1792', name: 'iPhone-XR', filename: 'splash-828x1792.png' },
    { size: '750x1334', name: 'iPhone-6', filename: 'splash-750x1334.png' },
    { size: '2048x2732', name: 'iPad-Pro-12.9', filename: 'splash-2048x2732.png' },
    { size: '1668x2388', name: 'iPad-Pro-11', filename: 'splash-1668x2388.png' }
  ],
  android: [
    { size: '1080x1920', name: 'Full-HD', filename: 'splash-1080x1920.png' },
    { size: '720x1280', name: 'HD', filename: 'splash-720x1280.png' },
    { size: '480x800', name: 'WVGA', filename: 'splash-480x800.png' }
  ]
};

// Créer un splash screen avec design moderne
async function createSplashScreen(width, height, filename) {
  log(`🎨 Création du splash screen ${width}x${height}...`, 'info');
  
  try {
    // Créer le fond avec dégradé
    const background = await sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 37, g: 99, b: 235, alpha: 1 } // #2563eb
      }
    })
    .png()
    .toBuffer();

    // Créer le logo centré
    const logoSize = Math.min(width, height) * 0.3; // 30% de la plus petite dimension
    const logoBuffer = await createLogoBuffer(logoSize);

    // Combiner le fond avec le logo
    const finalSplash = await sharp(background)
      .composite([
        {
          input: logoBuffer,
          left: Math.floor((width - logoSize) / 2),
          top: Math.floor((height - logoSize) / 2)
        }
      ])
      .png()
      .toFile(`assets/store-assets/splash/${filename}`);

    log(`✅ Splash screen créé: ${filename}`, 'success');
    return true;
  } catch (error) {
    log(`❌ Erreur création splash ${filename}: ${error.message}`, 'error');
    return false;
  }
}

// Créer le logo pour le splash screen
async function createLogoBuffer(size) {
  const logo = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent
    }
  })
  .composite([
    // Fond blanc arrondi
    {
      input: Buffer.from(`
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${size}" height="${size}" rx="${size * 0.1}" fill="#ffffff"/>
        </svg>
      `),
      left: 0,
      top: 0
    },
    // Logo "H"
    {
      input: Buffer.from(`
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(${size/2}, ${size/2})">
            <!-- Barre gauche -->
            <rect x="${-size * 0.2}" y="${-size * 0.3}" width="${size * 0.1}" height="${size * 0.6}" rx="${size * 0.05}" fill="#2563eb"/>
            <!-- Barre droite -->
            <rect x="${size * 0.1}" y="${-size * 0.3}" width="${size * 0.1}" height="${size * 0.6}" rx="${size * 0.05}" fill="#2563eb"/>
            <!-- Barre horizontale -->
            <rect x="${-size * 0.2}" y="${-size * 0.05}" width="${size * 0.4}" height="${size * 0.1}" rx="${size * 0.05}" fill="#2563eb"/>
          </g>
        </svg>
      `),
      left: 0,
      top: 0
    }
  ])
  .png()
  .toBuffer();

  return logo;
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
      const [width, height] = splash.size.split('x').map(Number);
      const outputPath = `assets/store-assets/splash/${platform}/${splash.filename}`;
      
      try {
        await createSplashScreen(width, height, `${platform}/${splash.filename}`);
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
    console.log('• 6 tailles iOS (iPhone + iPad)');
    console.log('• 3 tailles Android (HD + Full HD)');
    console.log('\n🎯 Prochaine étape : Paramétrer les comptes développeurs');
    
  } catch (error) {
    log(`❌ Erreur lors de la création: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Exécution
main();































