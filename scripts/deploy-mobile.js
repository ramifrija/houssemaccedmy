#!/usr/bin/env node

/**
 * Script de déploiement mobile pour Houssem Academy
 * Automatise le processus de build et de synchronisation
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  appName: 'Houssem Academy',
  appId: 'com.houssemacademy.app',
  version: '1.0.0',
  platforms: ['ios', 'android']
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

function execCommand(command, description) {
  try {
    log(`Exécution: ${description}`, 'info');
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`Succès: ${description}`, 'success');
    return output;
  } catch (error) {
    log(`Erreur: ${description} - ${error.message}`, 'error');
    throw error;
  }
}

// Étapes de déploiement
function cleanBuild() {
  log('Nettoyage des builds précédents...', 'info');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }
  log('Build nettoyé', 'success');
}

function buildProduction() {
  log('Build de production...', 'info');
  execCommand('npm run build:prod', 'Build de production');
  log('Build de production terminé', 'success');
}

function syncCapacitor() {
  log('Synchronisation Capacitor...', 'info');
  execCommand('npx cap sync', 'Synchronisation Capacitor');
  log('Synchronisation terminée', 'success');
}

function checkPlatforms() {
  log('Vérification des plateformes...', 'info');
  
  CONFIG.platforms.forEach(platform => {
    const platformPath = path.join(process.cwd(), platform);
    if (fs.existsSync(platformPath)) {
      log(`Plateforme ${platform} détectée`, 'success');
    } else {
      log(`Plateforme ${platform} manquante`, 'warning');
    }
  });
}

function generateDeploymentReport() {
  const report = {
    project: CONFIG.appName,
    version: CONFIG.version,
    appId: CONFIG.appId,
    deployment: {
      timestamp: new Date().toISOString(),
      status: 'ready',
      platforms: CONFIG.platforms,
      buildSize: getBuildSize(),
      nextSteps: [
        'Ouvrir Xcode pour iOS',
        'Ouvrir Android Studio pour Android',
        'Configurer les certificats de signature',
        'Tester sur appareils réels',
        'Soumettre aux stores'
      ]
    }
  };

  fs.writeFileSync(
    'deployment-report.json',
    JSON.stringify(report, null, 2)
  );
  
  log('Rapport de déploiement généré', 'success');
}

function getBuildSize() {
  try {
    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) return 'N/A';
    
    const stats = fs.statSync(distPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    return `${sizeInMB} MB`;
  } catch (error) {
    return 'N/A';
  }
}

function openPlatforms() {
  log('Ouverture des plateformes...', 'info');
  
  CONFIG.platforms.forEach(platform => {
    try {
      const command = `npx cap open ${platform}`;
      log(`Ouverture de ${platform}...`, 'info');
      // Note: npx cap open ouvre l'IDE, on ne peut pas capturer la sortie
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      log(`Impossible d'ouvrir ${platform}: ${error.message}`, 'warning');
    }
  });
}

// Fonction principale
function main() {
  log(`🚀 Déploiement mobile - ${CONFIG.appName} v${CONFIG.version}`, 'info');
  log(`App ID: ${CONFIG.appId}`, 'info');
  
  try {
    cleanBuild();
    buildProduction();
    checkPlatforms();
    syncCapacitor();
    generateDeploymentReport();
    
    log('🎉 Déploiement terminé avec succès !', 'success');
    log('📱 Votre application est prête pour les stores', 'success');
    
    // Instructions finales
    console.log('\n📋 Prochaines étapes :');
    console.log('1. Ouvrir Xcode : npx cap open ios');
    console.log('2. Ouvrir Android Studio : npx cap open android');
    console.log('3. Configurer les certificats de signature');
    console.log('4. Tester sur appareils réels');
    console.log('5. Soumettre aux stores');
    
    // Demander si on veut ouvrir les plateformes
    console.log('\n❓ Voulez-vous ouvrir les plateformes maintenant ? (y/n)');
    // Note: En mode automatique, on ne peut pas attendre la réponse utilisateur
    
  } catch (error) {
    log(`❌ Erreur lors du déploiement: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Exécution
main();































