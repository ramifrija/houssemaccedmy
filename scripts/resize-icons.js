#!/usr/bin/env node

/**
 * Script de redimensionnement automatique des icônes
 * Utilise Sharp pour redimensionner l'icône principale
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SOURCE_ICON = 'assets/store-assets/generated/icon-1024.png';
const ICON_SIZES = {
  "ios": [
    {
      "size": 1024,
      "name": "AppStore",
      "filename": "icon-1024.png"
    },
    {
      "size": 180,
      "name": "iPhone-3x",
      "filename": "icon-180.png"
    },
    {
      "size": 120,
      "name": "iPhone-2x",
      "filename": "icon-120.png"
    },
    {
      "size": 167,
      "name": "iPad-Pro",
      "filename": "icon-167.png"
    },
    {
      "size": 152,
      "name": "iPad-2x",
      "filename": "icon-152.png"
    },
    {
      "size": 76,
      "name": "iPad-1x",
      "filename": "icon-76.png"
    }
  ],
  "android": [
    {
      "size": 512,
      "name": "GooglePlay",
      "filename": "icon-512.png"
    },
    {
      "size": 192,
      "name": "mdpi",
      "filename": "icon-192.png"
    },
    {
      "size": 144,
      "name": "hdpi",
      "filename": "icon-144.png"
    },
    {
      "size": 96,
      "name": "xhdpi",
      "filename": "icon-96.png"
    },
    {
      "size": 72,
      "name": "xxhdpi",
      "filename": "icon-72.png"
    },
    {
      "size": 48,
      "name": "xxxhdpi",
      "filename": "icon-48.png"
    },
    {
      "size": 36,
      "name": "ldpi",
      "filename": "icon-36.png"
    }
  ]
};

async function resizeIcons() {
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error('❌ Icône source manquante:', SOURCE_ICON);
    console.log('📋 Instructions:');
    console.log('1. Créer une icône 1024x1024px');
    console.log('2. La sauvegarder comme:', SOURCE_ICON);
    console.log('3. Relancer ce script');
    return;
  }

  console.log('🚀 Redimensionnement des icônes...');

  for (const platform of Object.keys(ICON_SIZES)) {
    console.log(`\n📱 Génération des icônes ${platform}...`);
    
    for (const icon of ICON_SIZES[platform]) {
      const outputPath = `assets/store-assets/icons/${platform}/${icon.filename}`;
      
      try {
        await sharp(SOURCE_ICON)
          .resize(icon.size, icon.size, {
            fit: 'cover',
            position: 'center'
          })
          .png()
          .toFile(outputPath);
        
        console.log(`✅ ${icon.filename} (${icon.size}x${icon.size}px)`);
      } catch (error) {
        console.error(`❌ Erreur ${icon.filename}:`, error.message);
      }
    }
  }
  
  console.log('\n🎉 Génération terminée !');
}

resizeIcons();
