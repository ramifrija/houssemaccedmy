#!/usr/bin/env node

/**
 * Script de génération automatique des icônes
 * Houssem Academy - Mobile App
 */

import fs from 'fs';
import path from 'path';

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

function createDirectories() {
  const dirs = [
    'assets/store-assets/icons/ios',
    'assets/store-assets/icons/android',
    'assets/store-assets/generated'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`Dossier créé: ${dir}`, 'success');
    }
  });
}

function generateIconManifest() {
  const manifest = {
    project: 'Houssem Academy',
    version: '1.0.0',
    generated: new Date().toISOString(),
    sourceIcon: 'icon-template.svg',
    instructions: [
      '1. Ouvrir icon-template.svg dans un éditeur (Figma, Illustrator, etc.)',
      '2. Personnaliser les couleurs et le design selon vos préférences',
      '3. Exporter en PNG 1024x1024px comme icon-1024.png',
      '4. Exécuter ce script pour générer toutes les tailles',
      '5. Copier les icônes dans les dossiers iOS et Android'
    ],
    sizes: ICON_SIZES
  };

  fs.writeFileSync(
    'assets/store-assets/icon-manifest.json',
    JSON.stringify(manifest, null, 2)
  );
  
  log('Manifest des icônes généré', 'success');
}

function generateResizeScript() {
  const script = `#!/usr/bin/env node

/**
 * Script de redimensionnement automatique des icônes
 * Utilise Sharp pour redimensionner l'icône principale
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SOURCE_ICON = 'assets/store-assets/generated/icon-1024.png';
const ICON_SIZES = ${JSON.stringify(ICON_SIZES, null, 2)};

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
    console.log(\`\\n📱 Génération des icônes \${platform}...\`);
    
    for (const icon of ICON_SIZES[platform]) {
      const outputPath = \`assets/store-assets/icons/\${platform}/\${icon.filename}\`;
      
      try {
        await sharp(SOURCE_ICON)
          .resize(icon.size, icon.size, {
            fit: 'cover',
            position: 'center'
          })
          .png()
          .toFile(outputPath);
        
        console.log(\`✅ \${icon.filename} (\${icon.size}x\${icon.size}px)\`);
      } catch (error) {
        console.error(\`❌ Erreur \${icon.filename}:\`, error.message);
      }
    }
  }
  
  console.log('\\n🎉 Génération terminée !');
}

resizeIcons();
`;

  fs.writeFileSync('scripts/resize-icons.js', script);
  log('Script de redimensionnement généré', 'success');
}

function generateCapacitorConfig() {
  const config = {
    ios: {
      icon: {
        'AppStore': 'assets/store-assets/icons/ios/icon-1024.png',
        'iPhone-3x': 'assets/store-assets/icons/ios/icon-180.png',
        'iPhone-2x': 'assets/store-assets/icons/ios/icon-120.png',
        'iPad-Pro': 'assets/store-assets/icons/ios/icon-167.png',
        'iPad-2x': 'assets/store-assets/icons/ios/icon-152.png',
        'iPad-1x': 'assets/store-assets/icons/ios/icon-76.png'
      }
    },
    android: {
      icon: {
        'GooglePlay': 'assets/store-assets/icons/android/icon-512.png',
        'mdpi': 'assets/store-assets/icons/android/icon-192.png',
        'hdpi': 'assets/store-assets/icons/android/icon-144.png',
        'xhdpi': 'assets/store-assets/icons/android/icon-96.png',
        'xxhdpi': 'assets/store-assets/icons/android/icon-72.png',
        'xxxhdpi': 'assets/store-assets/icons/android/icon-48.png',
        'ldpi': 'assets/store-assets/icons/android/icon-36.png'
      }
    }
  };

  fs.writeFileSync(
    'assets/store-assets/capacitor-icons.json',
    JSON.stringify(config, null, 2)
  );
  
  log('Configuration Capacitor générée', 'success');
}

function generateInstructions() {
  const instructions = `# 📱 Instructions de Génération des Icônes

## 🎯 Étapes à Suivre

### 1. Créer l'Icône Principale
- Ouvrir \`assets/store-assets/icon-template.svg\` dans Figma/Illustrator
- Personnaliser le design selon vos préférences
- Exporter en PNG 1024x1024px
- Sauvegarder comme \`assets/store-assets/generated/icon-1024.png\`

### 2. Installer Sharp (pour le redimensionnement)
\`\`\`bash
npm install sharp
\`\`\`

### 3. Générer Toutes les Tailles
\`\`\`bash
node scripts/resize-icons.js
\`\`\`

### 4. Vérifier les Icônes
- Vérifier que toutes les icônes sont générées
- Tester la lisibilité sur différents fonds
- Valider la cohérence visuelle

### 5. Intégrer dans les Projets
- Copier les icônes iOS dans \`ios/App/App/Assets.xcassets/AppIcon.appiconset/\`
- Copier les icônes Android dans \`android/app/src/main/res/\`

## 🛠️ Outils Alternatifs

### Générateurs en Ligne
- **App Icon Generator** : https://appicon.co/
- **Icon Kitchen** : https://icon.kitchen/
- **MakeAppIcon** : https://makeappicon.com/

### Logiciels
- **Figma** : Design professionnel (gratuit)
- **Adobe Illustrator** : Vectoriel professionnel
- **Sketch** : Design macOS

## 📋 Checklist

- [ ] Icône 1024x1024px créée
- [ ] Toutes les tailles générées
- [ ] Icônes testées sur différents fonds
- [ ] Icônes intégrées dans les projets
- [ ] Tests sur appareils réels

## 🚨 Points d'Attention

1. **Pas de transparence** sur les icônes
2. **Contraste élevé** pour la lisibilité
3. **Design simple** et reconnaissable
4. **Cohérence** avec l'identité visuelle
`;

  fs.writeFileSync('assets/store-assets/ICON-INSTRUCTIONS.md', instructions);
  log('Instructions détaillées générées', 'success');
}

// Fonction principale
function main() {
  log('🎨 Génération du système d\'icônes pour Houssem Academy...', 'info');
  
  try {
    createDirectories();
    generateIconManifest();
    generateResizeScript();
    generateCapacitorConfig();
    generateInstructions();
    
    log('✅ Système d\'icônes configuré avec succès !', 'success');
    
    console.log('\n📋 Prochaines étapes :');
    console.log('1. Ouvrir assets/store-assets/icon-template.svg dans Figma');
    console.log('2. Personnaliser le design de l\'icône');
    console.log('3. Exporter en PNG 1024x1024px');
    console.log('4. Exécuter: node scripts/resize-icons.js');
    console.log('5. Intégrer dans les projets iOS/Android');
    
  } catch (error) {
    log(`❌ Erreur lors de la génération: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Exécution
main();































