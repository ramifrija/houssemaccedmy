import { execa } from 'execa';
import fs from 'fs';

async function checkTool(command, args, name) {
  try {
    const { stdout } = await execa(command, args, { stdio: 'pipe' });
    console.log(`✅ ${name} : DÉTECTÉ`);
    console.log(`   Version : ${stdout.split('\n')[0]}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name} : NON DÉTECTÉ`);
    return false;
  }
}

async function checkJava() {
  return await checkTool('java', ['-version'], 'Java JDK');
}

async function checkAndroidSDK() {
  return await checkTool('adb', ['version'], 'Android SDK');
}

async function checkXcode() {
  return await checkTool('xcodebuild', ['-version'], 'Xcode');
}

async function checkGradle() {
  return await checkTool('gradlew', ['--version'], 'Gradle Wrapper');
}

async function main() {
  console.log('🔍 VÉRIFICATION DES OUTILS - HOUSSEM ACADEMY');
  console.log('===============================================');
  
  const javaInstalled = await checkJava();
  const androidInstalled = await checkAndroidSDK();
  const xcodeInstalled = await checkXcode();
  const gradleInstalled = await checkGradle();
  
  console.log('\n📊 RÉSUMÉ :');
  console.log('===========');
  
  if (javaInstalled) {
    console.log('✅ Java JDK : PRÊT');
  } else {
    console.log('❌ Java JDK : REQUIS');
  }
  
  if (androidInstalled) {
    console.log('✅ Android SDK : PRÊT');
  } else {
    console.log('❌ Android SDK : REQUIS');
  }
  
  if (xcodeInstalled) {
    console.log('✅ Xcode : PRÊT (iOS possible)');
  } else {
    console.log('⚠️ Xcode : NON DISPONIBLE (iOS non possible sur Windows)');
  }
  
  if (gradleInstalled) {
    console.log('✅ Gradle : PRÊT');
  } else {
    console.log('❌ Gradle : REQUIS');
  }
  
  console.log('\n🎯 STATUT DES BUILDS :');
  console.log('=====================');
  
  if (javaInstalled && gradleInstalled) {
    console.log('✅ Build Android : POSSIBLE');
  } else {
    console.log('❌ Build Android : IMPOSSIBLE (Java ou Gradle manquant)');
  }
  
  if (xcodeInstalled) {
    console.log('✅ Build iOS : POSSIBLE');
  } else {
    console.log('❌ Build iOS : IMPOSSIBLE (Xcode requis sur macOS)');
  }
  
  console.log('\n📋 PROCHAINES ÉTAPES :');
  console.log('=====================');
  
  if (!javaInstalled) {
    console.log('1. ☕ Installer Java JDK 17+');
    console.log('   → https://www.oracle.com/java/technologies/downloads/');
  }
  
  if (!androidInstalled) {
    console.log('2. 🤖 Installer Android Studio');
    console.log('   → https://developer.android.com/studio');
  }
  
  if (!xcodeInstalled) {
    console.log('3. 🍎 Installer Xcode (macOS uniquement)');
    console.log('   → App Store');
  }
  
  if (javaInstalled && gradleInstalled) {
    console.log('\n🚀 GÉNÉRATION DES BUILDS :');
    console.log('=========================');
    console.log('npm run build:real');
  }
  
  console.log('\n💡 GUIDE COMPLET : GUIDE-FINAL-BUILDS.md');
}

main().catch(console.error);































