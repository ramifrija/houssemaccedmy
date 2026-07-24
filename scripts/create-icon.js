#!/usr/bin/env node

/**
 * Script de création de l'icône 1024x1024px
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

// Configuration des tailles d'icônes
const ICON_SIZES = {
  ios: [
    { size: 1024, name: 'AppStore', filename: 'icon-1024.png' },
    { size: 180, name: 'iPhone-3x', filename: 'icon-180.png' },
    { size: 120, name: 'iPhone-2x', filename: 'icon-120.png' },
    { size: 167, name: 'iPad-Pro', filename: 'icon-167.png' },
    { size: 152, name: 'iPad-2x', filename: 'icon-152.png' },
    { size: 76, name: 'iPad-1x', filename: 'icon-76.png' }
  ],
  android: [
    { size: 512, name: 'GooglePlay', filename: 'icon-512.png' },
    { size: 192, name: 'mdpi', filename: 'icon-192.png' },
    { size: 144, name: 'hdpi', filename: 'icon-144.png' },
    { size: 96, name: 'xhdpi', filename: 'icon-96.png' },
    { size: 72, name: 'xxhdpi', filename: 'icon-72.png' },
    { size: 48, name: 'xxxhdpi', filename: 'icon-48.png' },
    { size: 36, name: 'ldpi', filename: 'icon-36.png' }
  ]
};

// Créer l'icône 1024x1024px programmatiquement
async function createMainIcon() {
  log('🎨 Création de l\'icône principale 1024x1024px...', 'info');
  
  try {
    // Créer l'icône avec Sharp
    const iconBuffer = await sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 4,
        background: { r: 37, g: 99, b: 235, alpha: 1 } // #2563eb
      }
    })
    .png()
    .toBuffer();

    // Ajouter le logo "H" au centre
    const logoBuffer = await sharp({
      create: {
        width: 400,
        height: 400,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent
      }
    })
    .png()
    .toBuffer();

    // Combiner l'icône avec le logo
    const finalIcon = await sharp(iconBuffer)
      .composite([
        {
          input: await createLogoBuffer(),
          left: 312, // (1024 - 400) / 2
          top: 312   // (1024 - 400) / 2
        }
      ])
      .png()
      .toFile('assets/store-assets/generated/icon-1024.png');

    log('✅ Icône principale créée: icon-1024.png', 'success');
    return true;
  } catch (error) {
    log(`❌ Erreur création icône: ${error.message}`, 'error');
    return false;
  }
}

// Créer le logo "H" en buffer
async function createLogoBuffer() {
  const logo = await sharp({
    create: {
      width: 400,
      height: 400,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent
    }
  })
  .composite([
    // Fond blanc arrondi
    {
      input: Buffer.from(`
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" rx="80" fill="#ffffff"/>
        </svg>
      `),
      left: 0,
      top: 0
    },
    // Logo "H"
    {
      input: Buffer.from(`
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(200, 200)">
            <!-- Barre gauche -->
            <rect x="-80" y="-120" width="40" height="240" rx="20" fill="#2563eb"/>
            <!-- Barre droite -->
            <rect x="40" y="-120" width="40" height="240" rx="20" fill="#2563eb"/>
            <!-- Barre horizontale -->
            <rect x="-80" y="-20" width="160" height="40" rx="20" fill="#2563eb"/>
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

// Générer toutes les tailles d'icônes
async function generateAllIcons() {
  log('🔄 Génération de toutes les tailles d\'icônes...', 'info');
  
  const sourceIcon = 'assets/store-assets/generated/icon-1024.png';
  
  if (!fs.existsSync(sourceIcon)) {
    log('❌ Icône source manquante. Création en cours...', 'warning');
    const created = await createMainIcon();
    if (!created) return false;
  }

  for (const platform of Object.keys(ICON_SIZES)) {
    log(`📱 Génération des icônes ${platform}...`, 'info');
    
    for (const icon of ICON_SIZES[platform]) {
      const outputPath = `assets/store-assets/icons/${platform}/${icon.filename}`;
      
      try {
        await sharp(sourceIcon)
          .resize(icon.size, icon.size, {
            fit: 'cover',
            position: 'center'
          })
          .png()
          .toFile(outputPath);
        
        log(`✅ ${icon.filename} (${icon.size}x${icon.size}px)`, 'success');
      } catch (error) {
        log(`❌ Erreur ${icon.filename}: ${error.message}`, 'error');
      }
    }
  }
  
  log('🎉 Génération des icônes terminée !', 'success');
  return true;
}

// Fonction principale
async function main() {
  log('🚀 Création complète des icônes Houssem Academy...', 'info');
  
  try {
    // Créer les dossiers nécessaires
    const dirs = [
      'assets/store-assets/generated',
      'assets/store-assets/icons/ios',
      'assets/store-assets/icons/android'
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        log(`📁 Dossier créé: ${dir}`, 'success');
      }
    });

    // Créer l'icône principale
    await createMainIcon();
    
    // Générer toutes les tailles
    await generateAllIcons();
    
    log('✅ Création des icônes terminée avec succès !', 'success');
    
    console.log('\n📋 Icônes créées :');
    console.log('• icon-1024.png (App Store)');
    console.log('• 6 tailles iOS (iPhone + iPad)');
    console.log('• 7 tailles Android (toutes densités)');
    console.log('\n🎯 Prochaine étape : Créer les splash screens');
    
  } catch (error) {
    log(`❌ Erreur lors de la création: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Exécution
main();































