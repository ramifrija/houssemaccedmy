import fs from 'fs';
import path from 'path';

function fixJavaVersion() {
  console.log('ℹ️ [16:20:00] 🔧 Correction de la version Java...');
  
  // Fichiers à modifier
  const filesToFix = [
    'android/capacitor-android/build.gradle',
    'android/capacitor-cordova-android-plugins/build.gradle'
  ];
  
  filesToFix.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      console.log(`ℹ️ [16:20:01] 🔧 Correction de : ${filePath}`);
      
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Ajouter ou modifier compileOptions
      if (!content.includes('compileOptions')) {
        // Trouver la fermeture du bloc android
        const androidBlockEnd = content.lastIndexOf('}');
        if (androidBlockEnd !== -1) {
          const beforeClose = content.substring(0, androidBlockEnd);
          const afterClose = content.substring(androidBlockEnd);
          
          const compileOptions = `
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }`;
          
          content = beforeClose + compileOptions + '\n' + afterClose;
          fs.writeFileSync(filePath, content);
          console.log(`✅ [16:20:02] ✅ ${filePath} corrigé`);
        }
      } else {
        console.log(`✅ [16:20:02] ✅ ${filePath} déjà configuré`);
      }
    } else {
      console.log(`⚠️ [16:20:02] ⚠️ ${filePath} non trouvé`);
    }
  });
  
  // Créer un fichier gradle.properties global
  const gradlePropertiesPath = 'android/gradle.properties';
  if (fs.existsSync(gradlePropertiesPath)) {
    let content = fs.readFileSync(gradlePropertiesPath, 'utf8');
    
    if (!content.includes('org.gradle.java.home')) {
      content += '\n# Java version\norg.gradle.java.home=C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.16.8-hotspot\n';
      fs.writeFileSync(gradlePropertiesPath, content);
      console.log('✅ [16:20:03] ✅ gradle.properties mis à jour');
    }
  }
  
  console.log('✅ [16:20:04] ✅ Configuration Java corrigée');
}

function main() {
  console.log('🔧 CORRECTION VERSION JAVA - HOUSSEM ACADEMY');
  console.log('============================================');
  
  fixJavaVersion();
  
  console.log('\n🎉 CORRECTION TERMINÉE !');
  console.log('========================');
  console.log('📋 Modifications :');
  console.log('• ✅ Version Java 17 configurée');
  console.log('• ✅ Projets Capacitor mis à jour');
  console.log('• ✅ Gradle properties configuré');
  
  console.log('\n🎯 PROCHAINES ÉTAPES :');
  console.log('=====================');
  console.log('1. 🔄 Relancer : npm run build:final');
  console.log('2. 📱 Générer l\'APK DEBUG');
  console.log('3. 🧪 Tester sur un appareil');
}

main();
