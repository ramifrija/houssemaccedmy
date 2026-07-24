import { execa } from 'execa';
import fs from 'fs';
import path from 'path';

async function runCommand(command, args, description) {
  console.log(`ℹ️ [${new Date().toLocaleTimeString('fr-FR')}] Exécution: ${description}`);
  try {
    await execa(command, args, { stdio: 'inherit' });
    console.log(`✅ [${new Date().toLocaleTimeString('fr-FR')}] Succès: ${description}`);
    return true;
  } catch (error) {
    console.error(`❌ [${new Date().toLocaleTimeString('fr-FR')}] Erreur: ${description} - ${error.message}`);
    return false;
  }
}

async function createKeystore() {
  console.log('ℹ️ [16:10:00] 🔐 Création du keystore pour la signature...');
  
  const keystorePath = 'android/app/houssem-academy-key.keystore';
  const androidAppDir = 'android/app';
  
  // Vérifier si le keystore existe déjà
  if (fs.existsSync(keystorePath)) {
    console.log('✅ [16:10:00] ✅ Keystore existe déjà');
    return true;
  }
  
  // Créer le répertoire si nécessaire
  if (!fs.existsSync(androidAppDir)) {
    fs.mkdirSync(androidAppDir, { recursive: true });
  }
  
  const storePass = process.env.KEYSTORE_PASSWORD
  const keyPass = process.env.KEY_PASSWORD || storePass

  if (!storePass) {
    console.error('❌ Définissez KEYSTORE_PASSWORD avant de lancer ce script.')
    process.exit(1)
  }

  try {
    const keytoolCommand = [
      'keytool',
      '-genkey', '-v',
      '-keystore', keystorePath,
      '-alias', 'houssem-academy',
      '-keyalg', 'RSA',
      '-keysize', '2048',
      '-validity', '10000',
      '-storepass', storePass,
      '-keypass', keyPass,
      '-dname', 'CN=Houssem Academy, OU=IT, O=Houssem Academy, L=Paris, ST=Paris, C=FR'
    ];
    
    await runCommand(keytoolCommand[0], keytoolCommand.slice(1), 'Génération du keystore');
    
    console.log('✅ [16:10:01] ✅ Keystore créé avec succès');
    console.log(`📁 Emplacement : ${keystorePath}`);
    
    return true;
  } catch (error) {
    console.log('⚠️ [16:10:01] ⚠️ Erreur lors de la création du keystore');
    console.log('💡 Vérifiez que Java est correctement installé et configuré');
    return false;
  }
}

async function main() {
  console.log('🔐 CRÉATION DU KEYSTORE - HOUSSEM ACADEMY');
  console.log('=========================================');
  
  const success = await createKeystore();
  
  if (success) {
    console.log('\n🎉 KEYSTORE CRÉÉ AVEC SUCCÈS !');
    console.log('===============================');
    console.log('📋 Keystore créé :');
    console.log('• 📁 Fichier : android/app/houssem-academy-key.keystore');
    console.log('• 🔑 Alias : houssem-academy');
    console.log('• 🔐 Mot de passe : défini via KEYSTORE_PASSWORD (non affiché)');
    
    console.log('\n🎯 PROCHAINES ÉTAPES :');
    console.log('=====================');
    console.log('1. 🚀 Générer les builds : npm run build:real');
    console.log('2. 📱 Tester l\'APK sur un appareil');
    console.log('3. 🏪 Publier sur Google Play Store');
  } else {
    console.log('\n❌ ÉCHEC DE LA CRÉATION DU KEYSTORE');
    console.log('==================================');
    console.log('📋 Solutions possibles :');
    console.log('1. ☕ Vérifier que Java est installé');
    console.log('2. 🔧 Vérifier que keytool est dans le PATH');
    console.log('3. 🔄 Relancer : npm run build:real');
  }
}

main().catch(console.error);






























