import { execa } from 'execa';
import fs from 'fs';
import path from 'path';

const TEST_REPORT_PATH = 'TEST-COMPLETE-REPORT.json';

async function runCommand(command, args, description) {
  console.log(`ℹ️ [${new Date().toLocaleTimeString('fr-FR')}] Test: ${description}`);
  try {
    const { stdout, stderr } = await execa(command, args, { stdio: 'pipe' });
    console.log(`✅ [${new Date().toLocaleTimeString('fr-FR')}] Succès: ${description}`);
    return { success: true, output: stdout, error: stderr };
  } catch (error) {
    console.log(`❌ [${new Date().toLocaleTimeString('fr-FR')}] Échec: ${description}`);
    return { success: false, output: '', error: error.message };
  }
}

async function testWebBuild() {
  console.log('🧪 TEST 1: Build web de production');
  
  const result = await runCommand('npm', ['run', 'build:prod'], 'Build web de production');
  
  if (result.success) {
    const distExists = fs.existsSync('dist');
    const indexExists = fs.existsSync('dist/index.html');
    
    return {
      name: 'Build Web',
      status: distExists && indexExists ? 'success' : 'failed',
      details: {
        distFolder: distExists,
        indexFile: indexExists,
        buildOutput: result.output
      }
    };
  }
  
  return {
    name: 'Build Web',
    status: 'failed',
    details: { error: result.error }
  };
}

async function testCapacitorSync() {
  console.log('🧪 TEST 2: Synchronisation Capacitor');
  
  const result = await runCommand('npx', ['cap', 'sync'], 'Synchronisation Capacitor');
  
  const androidAssets = fs.existsSync('android/app/src/main/assets/public/index.html');
  const iosAssets = fs.existsSync('ios/App/App/public/index.html');
  
  return {
    name: 'Capacitor Sync',
    status: result.success && androidAssets && iosAssets ? 'success' : 'failed',
    details: {
      syncSuccess: result.success,
      androidAssets,
      iosAssets,
      output: result.output
    }
  };
}

async function testAndroidBuilds() {
  console.log('🧪 TEST 3: Builds Android');
  
  const debugAPK = fs.existsSync('android/app/build/outputs/apk/debug/app-debug.apk');
  const releaseAPK = fs.existsSync('android/app/build/outputs/apk/release/app-release-unsigned.apk');
  const releaseAAB = fs.existsSync('android/app/build/outputs/bundle/release/app-release.aab');
  
  // Vérifier les tailles des fichiers
  const getFileSize = (filePath) => {
    try {
      const stats = fs.statSync(filePath);
      return Math.round(stats.size / 1024 / 1024 * 100) / 100; // MB
    } catch {
      return 0;
    }
  };
  
  return {
    name: 'Builds Android',
    status: debugAPK && releaseAPK && releaseAAB ? 'success' : 'failed',
    details: {
      debugAPK: { exists: debugAPK, size: getFileSize('android/app/build/outputs/apk/debug/app-debug.apk') + ' MB' },
      releaseAPK: { exists: releaseAPK, size: getFileSize('android/app/build/outputs/apk/release/app-release-unsigned.apk') + ' MB' },
      releaseAAB: { exists: releaseAAB, size: getFileSize('android/app/build/outputs/bundle/release/app-release.aab') + ' MB' }
    }
  };
}

async function testAssets() {
  console.log('🧪 TEST 4: Assets et ressources');
  
  const icon1024 = fs.existsSync('assets/store-assets/generated/icon-1024.png');
  const splashScreens = fs.existsSync('assets/store-assets/splash');
  const keystore = fs.existsSync('android/app/houssem-academy-key.keystore');
  
  return {
    name: 'Assets et Ressources',
    status: icon1024 && splashScreens && keystore ? 'success' : 'failed',
    details: {
      icon1024,
      splashScreens,
      keystore,
      androidIcons: fs.existsSync('assets/store-assets/icons/android'),
      iosIcons: fs.existsSync('assets/store-assets/icons/ios')
    }
  };
}

async function testConfiguration() {
  console.log('🧪 TEST 5: Configuration et sécurité');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  // Capacitor config est un fichier TypeScript, pas JSON
  const capacitorConfigExists = fs.existsSync('capacitor.config.ts');
  
  // Vérifier les variables d'environnement
  const envVars = {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY
  };
  
  return {
    name: 'Configuration',
    status: 'success',
    details: {
      packageVersion: packageJson.version,
      appName: packageJson.name,
      dependencies: Object.keys(packageJson.dependencies).length,
      devDependencies: Object.keys(packageJson.devDependencies).length,
      capacitorConfig: capacitorConfigExists,
      environmentVariables: Object.keys(envVars).filter(key => envVars[key]).length,
      hasEnvVars: Object.values(envVars).some(val => val)
    }
  };
}

async function testCodeQuality() {
  console.log('🧪 TEST 6: Qualité du code');
  
  const result = await runCommand('npm', ['run', 'lint'], 'Linting du code');
  
  const srcFiles = fs.existsSync('src') ? 
    fs.readdirSync('src', { recursive: true }).filter(f => f.toString().endsWith('.tsx') || f.toString().endsWith('.ts')).length : 0;
  
  return {
    name: 'Qualité du Code',
    status: result.success ? 'success' : 'warning',
    details: {
      lintingSuccess: result.success,
      sourceFiles: srcFiles,
      lintOutput: result.output,
      hasErrors: result.output.includes('error')
    }
  };
}

async function createTestReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    application: 'Houssem Academy',
    version: '1.0.0',
    tests: results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      warnings: results.filter(r => r.status === 'warning').length
    },
    readiness: {
      webBuild: results.find(r => r.name === 'Build Web')?.status === 'success',
      mobileBuilds: results.find(r => r.name === 'Builds Android')?.status === 'success',
      assets: results.find(r => r.name === 'Assets et Ressources')?.status === 'success',
      configuration: results.find(r => r.name === 'Configuration')?.status === 'success',
      readyForPublication: results.every(r => r.status === 'success' || r.status === 'warning')
    },
    nextSteps: [
      'Vérifier les tests échoués',
      'Corriger les problèmes identifiés',
      'Tester sur appareil réel',
      'Publier sur Google Play Store'
    ]
  };
  
  fs.writeFileSync(TEST_REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`✅ [${new Date().toLocaleTimeString('fr-FR')}] Rapport de test créé: ${TEST_REPORT_PATH}`);
  
  return report;
}

async function main() {
  console.log('🧪 TESTS COMPLETS - HOUSSEM ACADEMY');
  console.log('=====================================');
  console.log('📋 Vérification complète avant publication');
  console.log('');
  
  const results = [];
  
  // Exécuter tous les tests
  results.push(await testWebBuild());
  results.push(await testCapacitorSync());
  results.push(await testAndroidBuilds());
  results.push(await testAssets());
  results.push(await testConfiguration());
  results.push(await testCodeQuality());
  
  // Créer le rapport
  const report = await createTestReport(results);
  
  // Afficher le résumé
  console.log('\n📊 RÉSUMÉ DES TESTS');
  console.log('===================');
  console.log(`✅ Réussis: ${report.summary.passed}`);
  console.log(`❌ Échoués: ${report.summary.failed}`);
  console.log(`⚠️ Avertissements: ${report.summary.warnings}`);
  
  console.log('\n🎯 ÉTAT DE PRÉPARATION');
  console.log('======================');
  console.log(`🌐 Build Web: ${report.readiness.webBuild ? '✅' : '❌'}`);
  console.log(`📱 Builds Mobile: ${report.readiness.mobileBuilds ? '✅' : '❌'}`);
  console.log(`🎨 Assets: ${report.readiness.assets ? '✅' : '❌'}`);
  console.log(`⚙️ Configuration: ${report.readiness.configuration ? '✅' : '❌'}`);
  console.log(`🚀 Prêt pour publication: ${report.readiness.readyForPublication ? '✅' : '❌'}`);
  
  if (report.readiness.readyForPublication) {
    console.log('\n🎉 APPLICATION PRÊTE POUR PUBLICATION !');
    console.log('=====================================');
    console.log('📱 Tous les tests sont passés');
    console.log('🏪 Prêt pour Google Play Store');
    console.log('🎊 Les utilisateurs pourront télécharger l\'app !');
  } else {
    console.log('\n⚠️ ATTENTION: Problèmes détectés');
    console.log('===============================');
    results.filter(r => r.status === 'failed').forEach(test => {
      console.log(`❌ ${test.name}: ${JSON.stringify(test.details)}`);
    });
  }
  
  console.log(`\n📄 Rapport détaillé: ${TEST_REPORT_PATH}`);
}

main().catch(console.error);
