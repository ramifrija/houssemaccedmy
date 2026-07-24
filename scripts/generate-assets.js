#!/usr/bin/env node

/**
 * Script de génération des assets pour les stores
 * Houssem Academy - Mobile App
 */

import fs from 'fs';
import path from 'path';

// Configuration des assets
const ASSETS_CONFIG = {
  icons: {
    ios: [
      { size: 1024, name: 'AppStore' },
      { size: 180, name: 'iPhone-3x' },
      { size: 120, name: 'iPhone-2x' },
      { size: 167, name: 'iPad-Pro' },
      { size: 152, name: 'iPad-2x' },
      { size: 76, name: 'iPad-1x' }
    ],
    android: [
      { size: 512, name: 'GooglePlay' },
      { size: 192, name: 'mdpi' },
      { size: 144, name: 'hdpi' },
      { size: 96, name: 'xhdpi' },
      { size: 72, name: 'xxhdpi' },
      { size: 48, name: 'xxxhdpi' },
      { size: 36, name: 'ldpi' }
    ]
  },
  splash: {
    ios: [
      { size: '1242x2688', name: 'iPhone-X' },
      { size: '1125x2436', name: 'iPhone-XS' },
      { size: '828x1792', name: 'iPhone-XR' },
      { size: '750x1334', name: 'iPhone-6' },
      { size: '2048x2732', name: 'iPad-Pro-12.9' },
      { size: '1668x2388', name: 'iPad-Pro-11' }
    ],
    android: [
      { size: '1080x1920', name: 'Full-HD' },
      { size: '720x1280', name: 'HD' },
      { size: '480x800', name: 'WVGA' }
    ]
  }
};

// Création des dossiers
function createDirectories() {
  const dirs = [
    'assets/store-assets/icons/ios',
    'assets/store-assets/icons/android',
    'assets/store-assets/splash/ios',
    'assets/store-assets/splash/android',
    'assets/store-assets/screenshots/ios',
    'assets/store-assets/screenshots/android'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Dossier créé: ${dir}`);
    }
  });
}

// Génération des fichiers de configuration
function generateConfigFiles() {
  // Configuration Capacitor
  const capacitorConfig = {
    appId: 'com.houssemacademy.app',
    appName: 'Houssem Academy',
    webDir: 'dist',
    server: {
      androidScheme: 'https'
    },
    plugins: {
      SplashScreen: {
        launchShowDuration: 3000,
        launchAutoHide: true,
        backgroundColor: '#ffffff',
        androidSplashResourceName: 'splash',
        androidScaleType: 'CENTER_CROP',
        showSpinner: false,
        androidSpinnerStyle: 'large',
        iosSpinnerStyle: 'small',
        spinnerColor: '#999999',
        splashFullScreen: true,
        splashImmersive: true
      }
    }
  };

  fs.writeFileSync(
    'capacitor.config.json',
    JSON.stringify(capacitorConfig, null, 2)
  );
  console.log('✅ Configuration Capacitor générée');

  // Configuration des assets
  const assetsConfig = {
    project: 'Houssem Academy',
    version: '1.0.0',
    generated: new Date().toISOString(),
    assets: ASSETS_CONFIG
  };

  fs.writeFileSync(
    'assets/store-assets/config.json',
    JSON.stringify(assetsConfig, null, 2)
  );
  console.log('✅ Configuration des assets générée');
}

// Génération des fichiers de template
function generateTemplates() {
  // Template pour les icônes
  const iconTemplate = `# Icônes Houssem Academy

## Instructions
1. Créer une icône de base 1024x1024px
2. Utiliser le logo Houssem Academy
3. Fond blanc ou transparent
4. Pas de texte sur l'icône
5. Design simple et reconnaissable

## Couleurs
- Primaire: #2563eb (bleu)
- Secondaire: #f59e0b (jaune)
- Fond: #ffffff (blanc)

## Génération automatique
Utiliser un outil comme App Icon Generator pour créer toutes les tailles.
`;

  fs.writeFileSync('assets/store-assets/ICON-TEMPLATE.md', iconTemplate);
  console.log('✅ Template icônes généré');

  // Template pour les captures d'écran
  const screenshotTemplate = `# Captures d'Écran Houssem Academy

## Pages à capturer

### 1. Dashboard Principal
- Vue d'ensemble avec statistiques
- Graphiques de présences
- Cartes d'information

### 2. Gestion des Présences
- Interface de marquage
- Liste des étudiants
- Codes QR

### 3. Calendrier des Cours
- Planning hebdomadaire
- Événements et cours
- Navigation temporelle

### 4. Système de Messagerie
- Chat et conversations
- Notifications
- Interface de communication

### 5. Rapports et Statistiques
- Graphiques et analyses
- Export de données
- Métriques détaillées

## Instructions
1. Utiliser des données de démonstration
2. Masquer les informations sensibles
3. Capturer en mode portrait et paysage
4. Optimiser pour chaque taille d'écran
`;

  fs.writeFileSync('assets/store-assets/SCREENSHOT-TEMPLATE.md', screenshotTemplate);
  console.log('✅ Template captures d\'écran généré');
}

// Génération du rapport de statut
function generateStatusReport() {
  const status = {
    project: 'Houssem Academy',
    version: '1.0.0',
    status: 'En cours de préparation',
    progress: {
      code: '100%',
      build: '100%',
      mobile: '100%',
      assets: '0%',
      stores: '0%'
    },
    nextSteps: [
      'Créer les icônes (1024x1024px)',
      'Générer les splash screens',
      'Capturer les écrans de démonstration',
      'Configurer les comptes développeurs',
      'Soumettre aux stores'
    ],
    estimatedTime: '2-3 semaines',
    lastUpdated: new Date().toISOString()
  };

  fs.writeFileSync(
    'assets/store-assets/STATUS.json',
    JSON.stringify(status, null, 2)
  );
  console.log('✅ Rapport de statut généré');
}

// Fonction principale
function main() {
  console.log('🚀 Génération des assets pour Houssem Academy...\n');

  try {
    createDirectories();
    generateConfigFiles();
    generateTemplates();
    generateStatusReport();

    console.log('\n✅ Génération terminée avec succès !');
    console.log('\n📋 Prochaines étapes :');
    console.log('1. Créer l\'icône de base 1024x1024px');
    console.log('2. Générer toutes les tailles d\'icônes');
    console.log('3. Créer les splash screens');
    console.log('4. Capturer les écrans de démonstration');
    console.log('5. Configurer les comptes développeurs');

  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error.message);
    process.exit(1);
  }
}

// Exécution
main();

export {
  createDirectories,
  generateConfigFiles,
  generateTemplates,
  generateStatusReport
};
