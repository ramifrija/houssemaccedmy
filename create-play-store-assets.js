import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer le dossier pour les assets si il n'existe pas
const assetsDir = path.join(__dirname, 'play-store-assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
}

// Créer l'icône de l'application (512x512px)
const createAppIcon = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Fond jaune -->
  <rect width="512" height="512" fill="#FFD700"/>
  
  <!-- Chapeau de diplômé -->
  <g transform="translate(256, 120)">
    <!-- Base du chapeau (forme semi-circulaire) -->
    <path d="M-80,0 Q0,-20 80,0 L80,15 Q0,5 -80,15 Z" fill="#000000"/>
    
    <!-- Dessus du chapeau (carré incliné) -->
    <path d="M-75,-15 L75,-15 L85,-5 L-85,-5 Z" fill="#000000"/>
    
    <!-- Tige du gland -->
    <rect x="-2" y="-5" width="4" height="25" fill="#000000"/>
    
    <!-- Gland (petit cercle) -->
    <circle cx="0" cy="25" r="8" fill="#000000"/>
  </g>
  
  <!-- Texte "Houssem" -->
  <text x="256" y="280" font-family="Georgia, serif" font-size="48" font-weight="bold" text-anchor="middle" fill="#000000">Houssem</text>
  
  <!-- Lignes décoratives -->
  <line x1="180" y1="320" x2="332" y2="320" stroke="#000000" stroke-width="3"/>
  <line x1="180" y1="380" x2="332" y2="380" stroke="#000000" stroke-width="3"/>
  
  <!-- Texte "ACADEMY" -->
  <text x="256" y="355" font-family="Arial, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="#000000">ACADEMY</text>
</svg>`;

    fs.writeFileSync(path.join(assetsDir, 'app-icon-512.svg'), svgContent);
    console.log('✅ Icône de l\'application créée : app-icon-512.svg');
};

// Créer l'image de présentation (1024x500px)
const createFeatureGraphic = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
  <!-- Fond jaune -->
  <rect width="1024" height="500" fill="#FFD700"/>
  
  <!-- Chapeau de diplômé (plus grand) -->
  <g transform="translate(512, 120)">
    <!-- Base du chapeau -->
    <path d="M-120,0 Q0,-30 120,0 L120,20 Q0,10 -120,20 Z" fill="#000000"/>
    
    <!-- Dessus du chapeau -->
    <path d="M-110,-25 L110,-25 L125,-10 L-125,-10 Z" fill="#000000"/>
    
    <!-- Tige du gland -->
    <rect x="-3" y="-10" width="6" height="35" fill="#000000"/>
    
    <!-- Gland -->
    <circle cx="0" cy="30" r="12" fill="#000000"/>
  </g>
  
  <!-- Texte "Houssem" -->
  <text x="512" y="280" font-family="Georgia, serif" font-size="72" font-weight="bold" text-anchor="middle" fill="#000000">Houssem</text>
  
  <!-- Lignes décoratives -->
  <line x1="300" y1="320" x2="724" y2="320" stroke="#000000" stroke-width="4"/>
  <line x1="300" y1="380" x2="724" y2="380" stroke="#000000" stroke-width="4"/>
  
  <!-- Texte "ACADEMY" -->
  <text x="512" y="355" font-family="Arial, sans-serif" font-size="42" font-weight="bold" text-anchor="middle" fill="#000000">ACADEMY</text>
  
  <!-- Texte descriptif -->
  <text x="512" y="420" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#000000">Plateforme éducative complète</text>
  <text x="512" y="450" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="#333333">Pour élèves, professeurs et parents</text>
</svg>`;

    fs.writeFileSync(path.join(assetsDir, 'feature-graphic-1024x500.svg'), svgContent);
    console.log('✅ Image de présentation créée : feature-graphic-1024x500.svg');
};

// Créer un template pour les captures d'écran
const createScreenshotTemplate = () => {
    const templateContent = `# GUIDE POUR LES CAPTURES D'ÉCRAN

## Formats requis par Google Play Console :

### 1. Téléphone (ratio 16:9 ou 9:16)
- **Minimum :** 320px de hauteur
- **Maximum :** 3840px de hauteur
- **Recommandé :** 1080x1920px ou 1920x1080px

### 2. Tablette 7 pouces
- **Minimum :** 1080x1920px
- **Recommandé :** 1200x1920px

### 3. Tablette 10 pouces
- **Minimum :** 1080x1920px
- **Recommandé :** 1600x2560px

## Contenu des captures d'écran :

### Capture 1 : Écran de connexion
- Montrer l'interface de connexion avec le logo
- Afficher les différents types de comptes (élève, professeur, parent, admin)

### Capture 2 : Tableau de bord
- Montrer le tableau de bord principal selon le rôle
- Afficher les statistiques et informations clés

### Capture 3 : Calendrier/Cours
- Montrer l'interface du calendrier
- Afficher les cours programmés

### Capture 4 : Messagerie
- Montrer l'interface de messagerie
- Afficher les conversations

### Capture 5 : Profil utilisateur
- Montrer la page de profil
- Afficher les informations personnelles et paramètres

## Instructions :
1. Prenez des captures d'écran de votre application en cours d'exécution
2. Assurez-vous que le contenu est lisible et bien formaté
3. Utilisez un appareil avec une résolution élevée
4. Évitez les contenus sensibles ou personnels
5. Testez sur différents appareils si possible

## Conversion des images :
Pour convertir les SVG en PNG :
1. Utilisez un convertisseur en ligne (ex: convertio.co)
2. Ou utilisez des outils comme GIMP, Photoshop, ou ImageMagick
3. Respectez exactement les dimensions requises
`;

    fs.writeFileSync(path.join(assetsDir, 'GUIDE-CAPTURES-ECRAN.md'), templateContent);
    console.log('✅ Guide pour les captures d\'écran créé : GUIDE-CAPTURES-ECRAN.md');
};

// Exécuter la création des assets
console.log('🎨 Création des assets graphiques pour Google Play Store...\n');

createAppIcon();
createFeatureGraphic();
createScreenshotTemplate();

console.log('\n✅ Tous les assets ont été créés dans le dossier "play-store-assets/"');
console.log('\n📋 Prochaines étapes :');
console.log('1. Convertir les fichiers SVG en PNG avec les bonnes dimensions');
console.log('2. Prendre les captures d\'écran de votre application');
console.log('3. Télécharger tous les assets dans Google Play Console');
