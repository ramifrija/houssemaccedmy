# 📱 Instructions de Génération des Icônes

## 🎯 Étapes à Suivre

### 1. Créer l'Icône Principale
- Ouvrir `assets/store-assets/icon-template.svg` dans Figma/Illustrator
- Personnaliser le design selon vos préférences
- Exporter en PNG 1024x1024px
- Sauvegarder comme `assets/store-assets/generated/icon-1024.png`

### 2. Installer Sharp (pour le redimensionnement)
```bash
npm install sharp
```

### 3. Générer Toutes les Tailles
```bash
node scripts/resize-icons.js
```

### 4. Vérifier les Icônes
- Vérifier que toutes les icônes sont générées
- Tester la lisibilité sur différents fonds
- Valider la cohérence visuelle

### 5. Intégrer dans les Projets
- Copier les icônes iOS dans `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Copier les icônes Android dans `android/app/src/main/res/`

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
