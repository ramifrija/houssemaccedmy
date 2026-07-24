# 🖼️ Guide des Splash Screens - Houssem Academy

## 📋 Spécifications Techniques

### **Splash Screen iOS**
- **iPhone X/XS/11 Pro** : 1242x2688px
- **iPhone X/XS** : 1125x2436px
- **iPhone XR/11** : 828x1792px
- **iPhone 6/7/8** : 750x1334px
- **iPad Pro 12.9"** : 2048x2732px
- **iPad Pro 11"** : 1668x2388px

### **Splash Screen Android**
- **Full HD** : 1080x1920px
- **HD** : 720x1280px
- **WVGA** : 480x800px

## 🎨 Design Guidelines

### **Éléments Visuels**
1. **Logo Houssem Academy** centré
2. **Couleurs de la marque** (bleu #2563eb, jaune #f59e0b)
3. **Fond uni** ou dégradé subtil
4. **Texte "Houssem Academy"** (optionnel)
5. **Animation de chargement** (optionnel)

### **Contraintes**
- ✅ **Design simple** et épuré
- ✅ **Cohérent** avec l'identité visuelle
- ✅ **Lisibilité** sur tous les appareils
- ✅ **Chargement rapide** (< 3 secondes)

## 🎯 Concept de Design

### **Option 1 : Minimaliste**
```
┌─────────────────────────┐
│                         │
│                         │
│                         │
│        [LOGO H]         │
│                         │
│                         │
│                         │
│                         │
└─────────────────────────┘
```

### **Option 2 : Avec Texte**
```
┌─────────────────────────┐
│                         │
│                         │
│        [LOGO H]         │
│                         │
│    Houssem Academy      │
│                         │
│                         │
│                         │
└─────────────────────────┘
```

### **Option 3 : Avec Dégradé**
```
┌─────────────────────────┐
│ ███████████████████████ │
│ ███████████████████████ │
│ ███████████████████████ │
│ ███████████████████████ │
│ ███████████████████████ │
│ ███████████████████████ │
│ ███████████████████████ │
│ ███████████████████████ │
└─────────────────────────┘
```

## 🛠️ Outils de Création

### **Gratuits**
- **Figma** : Design professionnel
- **GIMP** : Éditeur d'images
- **Canva** : Templates rapides

### **Payants**
- **Adobe Illustrator** : Vectoriel
- **Sketch** : Design macOS
- **Adobe Photoshop** : Raster

### **Générateurs Automatiques**
- **Capacitor Assets** : Génération automatique
- **App Icon Generator** : Splash screens inclus
- **MakeAppIcon** : Génération complète

## 📐 Tailles Détaillées

### **iOS**
| Appareil | Résolution | Taille | Ratio |
|----------|------------|--------|-------|
| iPhone X/XS/11 Pro | 1242x2688 | 6.7" | 19.5:9 |
| iPhone X/XS | 1125x2436 | 5.8" | 19.5:9 |
| iPhone XR/11 | 828x1792 | 6.1" | 19.5:9 |
| iPhone 6/7/8 | 750x1334 | 4.7" | 16:9 |
| iPad Pro 12.9" | 2048x2732 | 12.9" | 4:3 |
| iPad Pro 11" | 1668x2388 | 11" | 4:3 |

### **Android**
| Densité | Résolution | Taille | DPI |
|---------|------------|--------|-----|
| xxxhdpi | 1080x1920 | 5.5" | 480 |
| xxhdpi | 720x1280 | 5.0" | 320 |
| xhdpi | 480x800 | 4.0" | 240 |

## 🎨 Template SVG

### **Splash Screen Template**
```svg
<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <!-- Fond avec dégradé -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fond principal -->
  <rect width="1080" height="1920" fill="url(#bgGradient)"/>
  
  <!-- Logo centré -->
  <g transform="translate(540, 960)">
    <!-- Logo "H" -->
    <rect x="-60" y="-120" width="40" height="240" rx="20" fill="#ffffff"/>
    <rect x="20" y="-120" width="40" height="240" rx="20" fill="#ffffff"/>
    <rect x="-60" y="-20" width="120" height="40" rx="20" fill="#ffffff"/>
    
    <!-- Texte -->
    <text x="0" y="200" text-anchor="middle" font-family="Arial, sans-serif" 
          font-size="48" font-weight="bold" fill="#ffffff">
      Houssem Academy
    </text>
  </g>
</svg>
```

## 📋 Checklist de Validation

### **Design**
- [ ] **Logo** bien visible et centré
- [ ] **Couleurs** conformes à la charte graphique
- [ ] **Lisibilité** sur tous les appareils
- [ ] **Cohérence** avec l'identité visuelle

### **Technique**
- [ ] **Format** PNG optimisé
- [ ] **Résolution** correcte pour chaque appareil
- [ ] **Taille** < 1 MB par image
- [ ] **Couleurs** RGB, sRGB

### **Test**
- [ ] **Affichage** correct sur iPhone
- [ ] **Affichage** correct sur iPad
- [ ] **Affichage** correct sur Android
- [ ] **Temps de chargement** < 3 secondes

## 🚀 Prochaines Étapes

1. **Créer** le template de base
2. **Générer** toutes les tailles
3. **Tester** sur différents appareils
4. **Optimiser** la taille des fichiers
5. **Intégrer** dans les projets

## 📞 Support

Pour toute question sur les splash screens :
- 🎨 **Design** : design@houssemacademy.com
- 📱 **Mobile** : mobile@houssemacademy.com
- 🔧 **Technique** : dev@houssemacademy.com































