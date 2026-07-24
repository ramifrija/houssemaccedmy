import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer le dossier pour les mockups tablettes
const tabletMockupsDir = path.join(__dirname, 'tablet-mockups');
if (!fs.existsSync(tabletMockupsDir)) {
    fs.mkdirSync(tabletMockupsDir);
}

// Créer le mockup tableau de bord pour tablette 7 pouces (1200x1920px)
const createDashboardTablet7 = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="1920" viewBox="0 0 1200 1920" xmlns="http://www.w3.org/2000/svg">
  <!-- Fond blanc -->
  <rect width="1200" height="1920" fill="#FFFFFF"/>
  
  <!-- Header avec logo -->
  <rect x="0" y="0" width="1200" height="140" fill="#1A1A1A"/>
  <circle cx="80" cy="70" r="30" fill="#FFD700"/>
  <path d="M60,55 L100,55 M60,65 L100,65 M60,75 L100,75 M60,85 L100,85" stroke="#1A1A1A" stroke-width="3"/>
  <text x="130" y="55" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#FFD700">Houssem Academy</text>
  <text x="130" y="85" font-family="Arial, sans-serif" font-size="18" fill="#FFFFFF">Administration</text>
  
  <!-- Bouton menu hamburger -->
  <rect x="1080" y="45" width="80" height="50" fill="none" stroke="#FFD700" stroke-width="3" rx="10"/>
  <line x1="1090" y1="60" x2="1150" y2="60" stroke="#FFD700" stroke-width="4"/>
  <line x1="1090" y1="75" x2="1150" y2="75" stroke="#FFD700" stroke-width="4"/>
  <line x1="1090" y1="90" x2="1150" y2="90" stroke="#FFD700" stroke-width="4"/>
  
  <!-- Titre de la page -->
  <text x="600" y="200" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Tableau de Bord</text>
  <text x="600" y="235" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="#666666">Vue d'ensemble de l'établissement</text>
  
  <!-- Cartes de statistiques (2x2 grid) -->
  <!-- Carte 1 -->
  <rect x="80" y="270" width="250" height="160" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="15"/>
  <circle cx="130" cy="330" r="25" fill="#3B82F6"/>
  <text x="180" y="315" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#1A1A1A">0</text>
  <text x="180" y="345" font-family="Arial, sans-serif" font-size="16" fill="#666666">Total Élèves</text>
  
  <!-- Carte 2 -->
  <rect x="350" y="270" width="250" height="160" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="15"/>
  <circle cx="400" cy="330" r="25" fill="#10B981"/>
  <text x="450" y="315" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#1A1A1A">0</text>
  <text x="450" y="345" font-family="Arial, sans-serif" font-size="16" fill="#666666">Présences</text>
  
  <!-- Carte 3 -->
  <rect x="620" y="270" width="250" height="160" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="15"/>
  <circle cx="670" cy="330" r="25" fill="#F59E0B"/>
  <text x="720" y="315" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#1A1A1A">0</text>
  <text x="720" y="345" font-family="Arial, sans-serif" font-size="16" fill="#666666">Cours Aujourd'hui</text>
  
  <!-- Carte 4 -->
  <rect x="890" y="270" width="250" height="160" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="15"/>
  <circle cx="940" cy="330" r="25" fill="#8B5CF6"/>
  <text x="990" y="315" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#1A1A1A">-</text>
  <text x="990" y="345" font-family="Arial, sans-serif" font-size="16" fill="#666666">Taux Présence</text>
  
  <!-- Section Activités Récentes -->
  <rect x="80" y="460" width="1060" height="350" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="15"/>
  <text x="110" y="495" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1A1A1A">Activités Récentes</text>
  <text x="110" y="525" font-family="Arial, sans-serif" font-size="16" fill="#666666">Dernières actions dans le système</text>
  
  <!-- Activités en colonnes -->
  <!-- Colonne 1 -->
  <circle cx="140" cy="570" r="5" fill="#FFD700"/>
  <text x="160" y="575" font-family="Arial, sans-serif" font-size="18" fill="#1A1A1A">Ahmed Benali s'est connecté</text>
  <text x="160" y="600" font-family="Arial, sans-serif" font-size="14" fill="#666666">Il y a 5 min</text>
  
  <circle cx="140" cy="650" r="5" fill="#FFD700"/>
  <text x="160" y="655" font-family="Arial, sans-serif" font-size="18" fill="#1A1A1A">Cours Mathématiques terminé</text>
  <text x="160" y="680" font-family="Arial, sans-serif" font-size="14" fill="#666666">Il y a 15 min</text>
  
  <!-- Colonne 2 -->
  <circle cx="600" cy="570" r="5" fill="#FFD700"/>
  <text x="620" y="575" font-family="Arial, sans-serif" font-size="18" fill="#1A1A1A">3 absences signalées</text>
  <text x="620" y="600" font-family="Arial, sans-serif" font-size="14" fill="#666666">Il y a 30 min</text>
  
  <circle cx="600" cy="650" r="5" fill="#FFD700"/>
  <text x="620" y="655" font-family="Arial, sans-serif" font-size="18" fill="#1A1A1A">Nouveau professeur ajouté</text>
  <text x="620" y="680" font-family="Arial, sans-serif" font-size="14" fill="#666666">Il y a 1h</text>
  
  <!-- Actions Rapides -->
  <rect x="80" y="840" width="1060" height="200" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="15"/>
  <text x="110" y="875" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1A1A1A">Actions Rapides</text>
  <text x="110" y="905" font-family="Arial, sans-serif" font-size="16" fill="#666666">Raccourcis fréquemment utilisés</text>
  
  <!-- Boutons d'action (4 en ligne) -->
  <rect x="110" y="930" width="220" height="80" fill="#FFD700" rx="10"/>
  <text x="220" y="980" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Ajouter un élève</text>
  
  <rect x="350" y="930" width="220" height="80" fill="#FFD700" rx="10"/>
  <text x="460" y="980" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Marquer présences</text>
  
  <rect x="590" y="930" width="220" height="80" fill="#FFD700" rx="10"/>
  <text x="700" y="980" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Créer un cours</text>
  
  <rect x="830" y="930" width="220" height="80" fill="#FFD700" rx="10"/>
  <text x="940" y="980" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Export CSV</text>
  
  <!-- Navigation tablette en bas -->
  <rect x="0" y="1750" width="1200" height="170" fill="#1A1A1A"/>
  <circle cx="240" cy="1835" r="30" fill="#FFD700"/>
  <circle cx="480" cy="1835" r="30" fill="#666666"/>
  <circle cx="720" cy="1835" r="30" fill="#666666"/>
  <circle cx="960" cy="1835" r="30" fill="#666666"/>
</svg>`;

    fs.writeFileSync(path.join(tabletMockupsDir, 'dashboard-tablet7-1200x1920.svg'), svgContent);
    console.log('✅ Mockup tableau de bord tablette 7" créé : dashboard-tablet7-1200x1920.svg');
};

// Créer le mockup gestion utilisateurs pour tablette 7 pouces
const createUsersTablet7 = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="1920" viewBox="0 0 1200 1920" xmlns="http://www.w3.org/2000/svg">
  <!-- Fond blanc -->
  <rect width="1200" height="1920" fill="#FFFFFF"/>
  
  <!-- Header avec logo -->
  <rect x="0" y="0" width="1200" height="140" fill="#1A1A1A"/>
  <circle cx="80" cy="70" r="30" fill="#FFD700"/>
  <path d="M60,55 L100,55 M60,65 L100,65 M60,75 L100,75 M60,85 L100,85" stroke="#1A1A1A" stroke-width="3"/>
  <text x="130" y="55" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#FFD700">Houssem Academy</text>
  <text x="130" y="85" font-family="Arial, sans-serif" font-size="18" fill="#FFFFFF">Administration</text>
  
  <!-- Titre de la page -->
  <text x="600" y="200" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Gestion des Utilisateurs</text>
  <text x="600" y="235" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="#666666">Liste des Élèves</text>
  
  <!-- Onglets -->
  <rect x="80" y="260" width="200" height="60" fill="#FFD700" rx="30"/>
  <text x="180" y="300" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Élèves (4)</text>
  
  <rect x="300" y="260" width="200" height="60" fill="#E0E0E0" rx="30"/>
  <text x="400" y="300" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#666666">Professeurs (3)</text>
  
  <!-- Bouton ajouter -->
  <rect x="900" y="260" width="220" height="60" fill="#FFD700" rx="30"/>
  <text x="1010" y="300" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#1A1A1A">+ Ajouter un élève</text>
  
  <!-- Liste des élèves (2 colonnes) -->
  <!-- Élève 1 -->
  <rect x="80" y="350" width="520" height="120" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="15"/>
  <circle cx="130" cy="400" r="25" fill="#3B82F6"/>
  <text x="130" y="408" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#FFFFFF">AB</text>
  <text x="180" y="385" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#1A1A1A">Ahmed Ben Ali</text>
  <text x="180" y="410" font-family="Arial, sans-serif" font-size="16" fill="#666666">Parent: Mohamed Ben Ali</text>
  <rect x="180" y="425" width="80" height="25" fill="#3B82F6" rx="12"/>
  <text x="220" y="440" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#FFFFFF">7ème A</text>
  <rect x="280" y="425" width="70" height="25" fill="#10B981" rx="12"/>
  <text x="315" y="440" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#FFFFFF">Actif</text>
  <text x="370" y="440" font-family="Arial, sans-serif" font-size="14" fill="#666666">Aujourd'hui</text>
  
  <!-- Élève 2 -->
  <rect x="620" y="350" width="520" height="120" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="15"/>
  <circle cx="670" cy="400" r="25" fill="#10B981"/>
  <text x="670" y="408" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#FFFFFF">FZ</text>
  <text x="720" y="385" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#1A1A1A">Fatima Zohra</text>
  <text x="720" y="410" font-family="Arial, sans-serif" font-size="16" fill="#666666">Parent: Aicha Zohra</text>
  <rect x="720" y="425" width="80" height="25" fill="#3B82F6" rx="12"/>
  <text x="760" y="440" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#FFFFFF">7ème B</text>
  <rect x="820" y="425" width="70" height="25" fill="#10B981" rx="12"/>
  <text x="855" y="440" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#FFFFFF">Actif</text>
  <text x="910" y="440" font-family="Arial, sans-serif" font-size="14" fill="#666666">Hier</text>
  
  <!-- Élève 3 -->
  <rect x="80" y="490" width="520" height="120" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="15"/>
  <circle cx="130" cy="540" r="25" fill="#F59E0B"/>
  <text x="130" y="548" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#FFFFFF">YG</text>
  <text x="180" y="525" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#1A1A1A">Youssef Gharbi</text>
  <text x="180" y="550" font-family="Arial, sans-serif" font-size="16" fill="#666666">Parent: Omar Gharbi</text>
  <rect x="180" y="565" width="80" height="25" fill="#3B82F6" rx="12"/>
  <text x="220" y="580" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#FFFFFF">8ème A</text>
  <rect x="280" y="565" width="90" height="25" fill="#F59E0B" rx="12"/>
  <text x="325" y="580" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#FFFFFF">En attente</text>
  <text x="380" y="580" font-family="Arial, sans-serif" font-size="14" fill="#666666">Jamais</text>
  
  <!-- Élève 4 -->
  <rect x="620" y="490" width="520" height="120" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="15"/>
  <circle cx="670" cy="540" r="25" fill="#8B5CF6"/>
  <text x="670" y="548" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#FFFFFF">ST</text>
  <text x="720" y="525" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#1A1A1A">Salma Triki</text>
  <text x="720" y="550" font-family="Arial, sans-serif" font-size="16" fill="#666666">Parent: Leila Triki</text>
  <rect x="720" y="565" width="80" height="25" fill="#3B82F6" rx="12"/>
  <text x="760" y="580" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#FFFFFF">7ème A</text>
  <rect x="820" y="565" width="70" height="25" fill="#10B981" rx="12"/>
  <text x="855" y="580" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#FFFFFF">Actif</text>
  <text x="910" y="580" font-family="Arial, sans-serif" font-size="14" fill="#666666">Il y a 2 jours</text>
  
  <!-- Navigation tablette en bas -->
  <rect x="0" y="1750" width="1200" height="170" fill="#1A1A1A"/>
  <circle cx="240" cy="1835" r="30" fill="#666666"/>
  <circle cx="480" cy="1835" r="30" fill="#FFD700"/>
  <circle cx="720" cy="1835" r="30" fill="#666666"/>
  <circle cx="960" cy="1835" r="30" fill="#666666"/>
</svg>`;

    fs.writeFileSync(path.join(tabletMockupsDir, 'users-tablet7-1200x1920.svg'), svgContent);
    console.log('✅ Mockup gestion utilisateurs tablette 7" créé : users-tablet7-1200x1920.svg');
};

// Créer le mockup calendrier pour tablette 7 pouces
const createCalendarTablet7 = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="1920" viewBox="0 0 1200 1920" xmlns="http://www.w3.org/2000/svg">
  <!-- Fond blanc -->
  <rect width="1200" height="1920" fill="#FFFFFF"/>
  
  <!-- Header avec logo -->
  <rect x="0" y="0" width="1200" height="140" fill="#1A1A1A"/>
  <circle cx="80" cy="70" r="30" fill="#FFD700"/>
  <path d="M60,55 L100,55 M60,65 L100,65 M60,75 L100,75 M60,85 L100,85" stroke="#1A1A1A" stroke-width="3"/>
  <text x="130" y="55" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#FFD700">Houssem Academy</text>
  <text x="130" y="85" font-family="Arial, sans-serif" font-size="18" fill="#FFFFFF">Administration</text>
  
  <!-- Bouton nouveau cours -->
  <rect x="900" y="45" width="220" height="50" fill="#FFD700" rx="25"/>
  <text x="1010" y="75" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#1A1A1A">+ Nouveau Cours</text>
  
  <!-- Titre de la page -->
  <text x="600" y="200" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Calendrier des Cours</text>
  <text x="600" y="235" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="#666666">Planning et organisation</text>
  
  <!-- Onglets de vue -->
  <rect x="80" y="260" width="200" height="60" fill="#FFD700" rx="30"/>
  <text x="180" y="300" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Vue Journalière</text>
  
  <rect x="300" y="260" width="200" height="60" fill="#E0E0E0" rx="30"/>
  <text x="400" y="300" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#666666">Planning Mensuel</text>
  
  <!-- Section calendrier et cours côte à côte -->
  <!-- Calendrier (gauche) -->
  <rect x="80" y="350" width="520" height="400" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="15"/>
  <text x="110" y="385" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1A1A1A">Calendrier</text>
  <text x="110" y="415" font-family="Arial, sans-serif" font-size="16" fill="#666666">Sélectionner une date</text>
  
  <!-- Mini calendrier -->
  <rect x="110" y="435" width="460" height="280" fill="#F8F9FA" rx="10"/>
  <text x="340" y="465" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Octobre 2025</text>
  
  <!-- Jours de la semaine -->
  <text x="130" y="495" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#666666">Di</text>
  <text x="180" y="495" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#666666">Lu</text>
  <text x="230" y="495" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#666666">Ma</text>
  <text x="280" y="495" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#666666">Me</text>
  <text x="330" y="495" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#666666">Je</text>
  <text x="380" y="495" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#666666">Ve</text>
  <text x="430" y="495" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#666666">Sa</text>
  
  <!-- Date sélectionnée -->
  <circle cx="330" cy="550" r="25" fill="#1A1A1A"/>
  <text x="330" y="558" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#FFFFFF">12</text>
  
  <!-- Cours du jour (droite) -->
  <rect x="620" y="350" width="520" height="400" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="15"/>
  <text x="650" y="385" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1A1A1A">Cours d'Aujourd'hui</text>
  <text x="650" y="415" font-family="Arial, sans-serif" font-size="16" fill="#666666">dimanche 12 octobre 2025</text>
  
  <!-- Cours 1 -->
  <rect x="650" y="440" width="460" height="100" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="10"/>
  <rect x="650" y="440" width="8" height="100" fill="#3B82F6"/>
  <text x="680" y="465" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#1A1A1A">Mathématiques</text>
  <rect x="680" y="475" width="70" height="25" fill="#3B82F6" rx="12"/>
  <text x="715" y="490" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#FFFFFF">7ème A</text>
  <text x="680" y="515" font-family="Arial, sans-serif" font-size="16" fill="#666666">08:00 - 09:00 • Salle 101</text>
  <text x="680" y="535" font-family="Arial, sans-serif" font-size="16" fill="#666666">25 élèves • Prof. Hassan Amri</text>
  
  <!-- Cours 2 -->
  <rect x="650" y="560" width="460" height="100" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="10"/>
  <rect x="650" y="560" width="8" height="100" fill="#10B981"/>
  <text x="680" y="585" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#1A1A1A">Français</text>
  <rect x="680" y="595" width="70" height="25" fill="#3B82F6" rx="12"/>
  <text x="715" y="610" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#FFFFFF">7ème B</text>
  <text x="680" y="635" font-family="Arial, sans-serif" font-size="16" fill="#666666">09:15 - 10:15 • Salle 203</text>
  <text x="680" y="655" font-family="Arial, sans-serif" font-size="16" fill="#666666">23 élèves • Prof. Nadia Slim</text>
  
  <!-- Navigation tablette en bas -->
  <rect x="0" y="1750" width="1200" height="170" fill="#1A1A1A"/>
  <circle cx="240" cy="1835" r="30" fill="#666666"/>
  <circle cx="480" cy="1835" r="30" fill="#666666"/>
  <circle cx="720" cy="1835" r="30" fill="#FFD700"/>
  <circle cx="960" cy="1835" r="30" fill="#666666"/>
</svg>`;

    fs.writeFileSync(path.join(tabletMockupsDir, 'calendar-tablet7-1200x1920.svg'), svgContent);
    console.log('✅ Mockup calendrier tablette 7" créé : calendar-tablet7-1200x1920.svg');
};

// Créer le mockup tableau de bord pour tablette 10 pouces (1600x2560px)
const createDashboardTablet10 = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="2560" viewBox="0 0 1600 2560" xmlns="http://www.w3.org/2000/svg">
  <!-- Fond blanc -->
  <rect width="1600" height="2560" fill="#FFFFFF"/>
  
  <!-- Header avec logo -->
  <rect x="0" y="0" width="1600" height="180" fill="#1A1A1A"/>
  <circle cx="100" cy="90" r="35" fill="#FFD700"/>
  <path d="M75,75 L125,75 M75,85 L125,85 M75,95 L125,95 M75,105 L125,105" stroke="#1A1A1A" stroke-width="4"/>
  <text x="150" y="70" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#FFD700">Houssem Academy</text>
  <text x="150" y="105" font-family="Arial, sans-serif" font-size="20" fill="#FFFFFF">Administration</text>
  
  <!-- Bouton menu hamburger -->
  <rect x="1400" y="60" width="100" height="60" fill="none" stroke="#FFD700" stroke-width="4" rx="12"/>
  <line x1="1420" y1="80" x2="1480" y2="80" stroke="#FFD700" stroke-width="5"/>
  <line x1="1420" y1="100" x2="1480" y2="100" stroke="#FFD700" stroke-width="5"/>
  <line x1="1420" y1="120" x2="1480" y2="120" stroke="#FFD700" stroke-width="5"/>
  
  <!-- Titre de la page -->
  <text x="800" y="270" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Tableau de Bord</text>
  <text x="800" y="310" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#666666">Vue d'ensemble de l'établissement</text>
  
  <!-- Cartes de statistiques (4 en ligne) -->
  <!-- Carte 1 -->
  <rect x="100" y="350" width="320" height="200" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="20"/>
  <circle cx="180" cy="430" r="30" fill="#3B82F6"/>
  <text x="250" y="410" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#1A1A1A">0</text>
  <text x="250" y="440" font-family="Arial, sans-serif" font-size="18" fill="#666666">Total Élèves</text>
  
  <!-- Carte 2 -->
  <rect x="450" y="350" width="320" height="200" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="20"/>
  <circle cx="530" cy="430" r="30" fill="#10B981"/>
  <text x="600" y="410" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#1A1A1A">0</text>
  <text x="600" y="440" font-family="Arial, sans-serif" font-size="18" fill="#666666">Présences</text>
  
  <!-- Carte 3 -->
  <rect x="800" y="350" width="320" height="200" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="20"/>
  <circle cx="880" cy="430" r="30" fill="#F59E0B"/>
  <text x="950" y="410" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#1A1A1A">0</text>
  <text x="950" y="440" font-family="Arial, sans-serif" font-size="18" fill="#666666">Cours Aujourd'hui</text>
  
  <!-- Carte 4 -->
  <rect x="1150" y="350" width="320" height="200" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="20"/>
  <circle cx="1230" cy="430" r="30" fill="#8B5CF6"/>
  <text x="1300" y="410" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#1A1A1A">-</text>
  <text x="1300" y="440" font-family="Arial, sans-serif" font-size="18" fill="#666666">Taux Présence</text>
  
  <!-- Section Activités Récentes -->
  <rect x="100" y="580" width="1400" height="450" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="20"/>
  <text x="150" y="620" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#1A1A1A">Activités Récentes</text>
  <text x="150" y="655" font-family="Arial, sans-serif" font-size="18" fill="#666666">Dernières actions dans le système</text>
  
  <!-- Activités en 3 colonnes -->
  <!-- Colonne 1 -->
  <circle cx="180" cy="720" r="6" fill="#FFD700"/>
  <text x="210" y="730" font-family="Arial, sans-serif" font-size="20" fill="#1A1A1A">Ahmed Benali s'est connecté</text>
  <text x="210" y="760" font-family="Arial, sans-serif" font-size="16" fill="#666666">Il y a 5 min</text>
  
  <circle cx="180" cy="820" r="6" fill="#FFD700"/>
  <text x="210" y="830" font-family="Arial, sans-serif" font-size="20" fill="#1A1A1A">Cours Mathématiques terminé</text>
  <text x="210" y="860" font-family="Arial, sans-serif" font-size="16" fill="#666666">Il y a 15 min</text>
  
  <!-- Colonne 2 -->
  <circle cx="750" cy="720" r="6" fill="#FFD700"/>
  <text x="780" y="730" font-family="Arial, sans-serif" font-size="20" fill="#1A1A1A">3 absences signalées</text>
  <text x="780" y="760" font-family="Arial, sans-serif" font-size="16" fill="#666666">Il y a 30 min</text>
  
  <circle cx="750" cy="820" r="6" fill="#FFD700"/>
  <text x="780" y="830" font-family="Arial, sans-serif" font-size="20" fill="#1A1A1A">Nouveau professeur ajouté</text>
  <text x="780" y="860" font-family="Arial, sans-serif" font-size="16" fill="#666666">Il y a 1h</text>
  
  <!-- Colonne 3 -->
  <circle cx="1320" cy="720" r="6" fill="#FFD700"/>
  <text x="1350" y="730" font-family="Arial, sans-serif" font-size="20" fill="#1A1A1A">Export de données réussi</text>
  <text x="1350" y="760" font-family="Arial, sans-serif" font-size="16" fill="#666666">Il y a 2h</text>
  
  <circle cx="1320" cy="820" r="6" fill="#FFD700"/>
  <text x="1350" y="830" font-family="Arial, sans-serif" font-size="20" fill="#1A1A1A">Rapport mensuel généré</text>
  <text x="1350" y="860" font-family="Arial, sans-serif" font-size="16" fill="#666666">Il y a 3h</text>
  
  <!-- Actions Rapides -->
  <rect x="100" y="1060" width="1400" height="250" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="20"/>
  <text x="150" y="1100" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#1A1A1A">Actions Rapides</text>
  <text x="150" y="1135" font-family="Arial, sans-serif" font-size="18" fill="#666666">Raccourcis fréquemment utilisés</text>
  
  <!-- Boutons d'action (4 en ligne) -->
  <rect x="150" y="1160" width="280" height="100" fill="#FFD700" rx="15"/>
  <text x="290" y="1220" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Ajouter un élève</text>
  
  <rect x="460" y="1160" width="280" height="100" fill="#FFD700" rx="15"/>
  <text x="600" y="1220" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Marquer présences</text>
  
  <rect x="770" y="1160" width="280" height="100" fill="#FFD700" rx="15"/>
  <text x="910" y="1220" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Créer un cours</text>
  
  <rect x="1080" y="1160" width="280" height="100" fill="#FFD700" rx="15"/>
  <text x="1220" y="1220" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Export CSV</text>
  
  <!-- Navigation tablette en bas -->
  <rect x="0" y="2300" width="1600" height="260" fill="#1A1A1A"/>
  <circle cx="320" cy="2430" r="40" fill="#FFD700"/>
  <circle cx="640" cy="2430" r="40" fill="#666666"/>
  <circle cx="960" cy="2430" r="40" fill="#666666"/>
  <circle cx="1280" cy="2430" r="40" fill="#666666"/>
</svg>`;

    fs.writeFileSync(path.join(tabletMockupsDir, 'dashboard-tablet10-1600x2560.svg'), svgContent);
    console.log('✅ Mockup tableau de bord tablette 10" créé : dashboard-tablet10-1600x2560.svg');
};

// Créer le mockup gestion utilisateurs pour tablette 10 pouces
const createUsersTablet10 = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="2560" viewBox="0 0 1600 2560" xmlns="http://www.w3.org/2000/svg">
  <!-- Fond blanc -->
  <rect width="1600" height="2560" fill="#FFFFFF"/>
  
  <!-- Header avec logo -->
  <rect x="0" y="0" width="1600" height="180" fill="#1A1A1A"/>
  <circle cx="100" cy="90" r="35" fill="#FFD700"/>
  <path d="M75,75 L125,75 M75,85 L125,85 M75,95 L125,95 M75,105 L125,105" stroke="#1A1A1A" stroke-width="4"/>
  <text x="150" y="70" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#FFD700">Houssem Academy</text>
  <text x="150" y="105" font-family="Arial, sans-serif" font-size="20" fill="#FFFFFF">Administration</text>
  
  <!-- Titre de la page -->
  <text x="800" y="270" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Gestion des Utilisateurs</text>
  <text x="800" y="310" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#666666">Liste des Élèves</text>
  
  <!-- Onglets -->
  <rect x="100" y="340" width="250" height="70" fill="#FFD700" rx="35"/>
  <text x="225" y="385" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Élèves (4)</text>
  
  <rect x="370" y="340" width="250" height="70" fill="#E0E0E0" rx="35"/>
  <text x="495" y="385" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="#666666">Professeurs (3)</text>
  
  <!-- Bouton ajouter -->
  <rect x="1200" y="340" width="280" height="70" fill="#FFD700" rx="35"/>
  <text x="1340" y="385" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#1A1A1A">+ Ajouter un élève</text>
  
  <!-- Liste des élèves (2 colonnes) -->
  <!-- Élève 1 -->
  <rect x="100" y="440" width="680" height="150" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="20"/>
  <circle cx="170" cy="500" r="30" fill="#3B82F6"/>
  <text x="170" y="508" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#FFFFFF">AB</text>
  <text x="230" y="485" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1A1A1A">Ahmed Ben Ali</text>
  <text x="230" y="515" font-family="Arial, sans-serif" font-size="18" fill="#666666">Parent: Mohamed Ben Ali</text>
  <rect x="230" y="535" width="90" height="30" fill="#3B82F6" rx="15"/>
  <text x="275" y="552" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#FFFFFF">7ème A</text>
  <rect x="340" y="535" width="80" height="30" fill="#10B981" rx="15"/>
  <text x="380" y="552" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#FFFFFF">Actif</text>
  <text x="450" y="552" font-family="Arial, sans-serif" font-size="16" fill="#666666">Aujourd'hui</text>
  
  <!-- Élève 2 -->
  <rect x="820" y="440" width="680" height="150" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="20"/>
  <circle cx="890" cy="500" r="30" fill="#10B981"/>
  <text x="890" y="508" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#FFFFFF">FZ</text>
  <text x="950" y="485" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1A1A1A">Fatima Zohra</text>
  <text x="950" y="515" font-family="Arial, sans-serif" font-size="18" fill="#666666">Parent: Aicha Zohra</text>
  <rect x="950" y="535" width="90" height="30" fill="#3B82F6" rx="15"/>
  <text x="995" y="552" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#FFFFFF">7ème B</text>
  <rect x="1060" y="535" width="80" height="30" fill="#10B981" rx="15"/>
  <text x="1100" y="552" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#FFFFFF">Actif</text>
  <text x="1170" y="552" font-family="Arial, sans-serif" font-size="16" fill="#666666">Hier</text>
  
  <!-- Élève 3 -->
  <rect x="100" y="610" width="680" height="150" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="20"/>
  <circle cx="170" cy="670" r="30" fill="#F59E0B"/>
  <text x="170" y="678" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#FFFFFF">YG</text>
  <text x="230" y="655" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1A1A1A">Youssef Gharbi</text>
  <text x="230" y="685" font-family="Arial, sans-serif" font-size="18" fill="#666666">Parent: Omar Gharbi</text>
  <rect x="230" y="705" width="90" height="30" fill="#3B82F6" rx="15"/>
  <text x="275" y="722" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#FFFFFF">8ème A</text>
  <rect x="340" y="705" width="100" height="30" fill="#F59E0B" rx="15"/>
  <text x="390" y="722" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#FFFFFF">En attente</text>
  <text x="460" y="722" font-family="Arial, sans-serif" font-size="16" fill="#666666">Jamais</text>
  
  <!-- Élève 4 -->
  <rect x="820" y="610" width="680" height="150" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="20"/>
  <circle cx="890" cy="670" r="30" fill="#8B5CF6"/>
  <text x="890" y="678" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#FFFFFF">ST</text>
  <text x="950" y="655" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1A1A1A">Salma Triki</text>
  <text x="950" y="685" font-family="Arial, sans-serif" font-size="18" fill="#666666">Parent: Leila Triki</text>
  <rect x="950" y="705" width="90" height="30" fill="#3B82F6" rx="15"/>
  <text x="995" y="722" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#FFFFFF">7ème A</text>
  <rect x="1060" y="705" width="80" height="30" fill="#10B981" rx="15"/>
  <text x="1100" y="722" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#FFFFFF">Actif</text>
  <text x="1170" y="722" font-family="Arial, sans-serif" font-size="16" fill="#666666">Il y a 2 jours</text>
  
  <!-- Navigation tablette en bas -->
  <rect x="0" y="2300" width="1600" height="260" fill="#1A1A1A"/>
  <circle cx="320" cy="2430" r="40" fill="#666666"/>
  <circle cx="640" cy="2430" r="40" fill="#FFD700"/>
  <circle cx="960" cy="2430" r="40" fill="#666666"/>
  <circle cx="1280" cy="2430" r="40" fill="#666666"/>
</svg>`;

    fs.writeFileSync(path.join(tabletMockupsDir, 'users-tablet10-1600x2560.svg'), svgContent);
    console.log('✅ Mockup gestion utilisateurs tablette 10" créé : users-tablet10-1600x2560.svg');
};

// Créer le mockup calendrier pour tablette 10 pouces
const createCalendarTablet10 = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="2560" viewBox="0 0 1600 2560" xmlns="http://www.w3.org/2000/svg">
  <!-- Fond blanc -->
  <rect width="1600" height="2560" fill="#FFFFFF"/>
  
  <!-- Header avec logo -->
  <rect x="0" y="0" width="1600" height="180" fill="#1A1A1A"/>
  <circle cx="100" cy="90" r="35" fill="#FFD700"/>
  <path d="M75,75 L125,75 M75,85 L125,85 M75,95 L125,95 M75,105 L125,105" stroke="#1A1A1A" stroke-width="4"/>
  <text x="150" y="70" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#FFD700">Houssem Academy</text>
  <text x="150" y="105" font-family="Arial, sans-serif" font-size="20" fill="#FFFFFF">Administration</text>
  
  <!-- Bouton nouveau cours -->
  <rect x="1200" y="60" width="280" height="60" fill="#FFD700" rx="30"/>
  <text x="1340" y="100" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#1A1A1A">+ Nouveau Cours</text>
  
  <!-- Titre de la page -->
  <text x="800" y="270" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Calendrier des Cours</text>
  <text x="800" y="310" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#666666">Planning et organisation</text>
  
  <!-- Onglets de vue -->
  <rect x="100" y="340" width="250" height="70" fill="#FFD700" rx="35"/>
  <text x="225" y="385" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Vue Journalière</text>
  
  <rect x="370" y="340" width="250" height="70" fill="#E0E0E0" rx="35"/>
  <text x="495" y="385" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="#666666">Planning Mensuel</text>
  
  <!-- Section calendrier et cours côte à côte -->
  <!-- Calendrier (gauche) -->
  <rect x="100" y="440" width="700" height="500" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="20"/>
  <text x="150" y="485" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#1A1A1A">Calendrier</text>
  <text x="150" y="520" font-family="Arial, sans-serif" font-size="18" fill="#666666">Sélectionner une date</text>
  
  <!-- Mini calendrier -->
  <rect x="150" y="545" width="600" height="360" fill="#F8F9FA" rx="15"/>
  <text x="450" y="585" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Octobre 2025</text>
  
  <!-- Jours de la semaine -->
  <text x="180" y="625" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#666666">Di</text>
  <text x="240" y="625" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#666666">Lu</text>
  <text x="300" y="625" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#666666">Ma</text>
  <text x="360" y="625" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#666666">Me</text>
  <text x="420" y="625" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#666666">Je</text>
  <text x="480" y="625" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#666666">Ve</text>
  <text x="540" y="625" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#666666">Sa</text>
  
  <!-- Date sélectionnée -->
  <circle cx="420" cy="700" r="30" fill="#1A1A1A"/>
  <text x="420" y="710" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#FFFFFF">12</text>
  
  <!-- Cours du jour (droite) -->
  <rect x="820" y="440" width="680" height="500" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="20"/>
  <text x="870" y="485" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#1A1A1A">Cours d'Aujourd'hui</text>
  <text x="870" y="520" font-family="Arial, sans-serif" font-size="18" fill="#666666">dimanche 12 octobre 2025</text>
  
  <!-- Cours 1 -->
  <rect x="870" y="550" width="600" height="120" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="15"/>
  <rect x="870" y="550" width="10" height="120" fill="#3B82F6"/>
  <text x="910" y="580" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1A1A1A">Mathématiques</text>
  <rect x="910" y="590" width="90" height="30" fill="#3B82F6" rx="15"/>
  <text x="955" y="607" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#FFFFFF">7ème A</text>
  <text x="910" y="640" font-family="Arial, sans-serif" font-size="18" fill="#666666">08:00 - 09:00 • Salle 101</text>
  <text x="910" y="665" font-family="Arial, sans-serif" font-size="18" fill="#666666">25 élèves • Prof. Hassan Amri</text>
  
  <!-- Cours 2 -->
  <rect x="870" y="690" width="600" height="120" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="15"/>
  <rect x="870" y="690" width="10" height="120" fill="#10B981"/>
  <text x="910" y="720" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1A1A1A">Français</text>
  <rect x="910" y="730" width="90" height="30" fill="#3B82F6" rx="15"/>
  <text x="955" y="747" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#FFFFFF">7ème B</text>
  <text x="910" y="780" font-family="Arial, sans-serif" font-size="18" fill="#666666">09:15 - 10:15 • Salle 203</text>
  <text x="910" y="805" font-family="Arial, sans-serif" font-size="18" fill="#666666">23 élèves • Prof. Nadia Slim</text>
  
  <!-- Navigation tablette en bas -->
  <rect x="0" y="2300" width="1600" height="260" fill="#1A1A1A"/>
  <circle cx="320" cy="2430" r="40" fill="#666666"/>
  <circle cx="640" cy="2430" r="40" fill="#666666"/>
  <circle cx="960" cy="2430" r="40" fill="#FFD700"/>
  <circle cx="1280" cy="2430" r="40" fill="#666666"/>
</svg>`;

    fs.writeFileSync(path.join(tabletMockupsDir, 'calendar-tablet10-1600x2560.svg'), svgContent);
    console.log('✅ Mockup calendrier tablette 10" créé : calendar-tablet10-1600x2560.svg');
};

// Exécuter la création des mockups tablettes
console.log('📱 Création des mockups tablettes pour Google Play Store...\n');

createDashboardTablet7();
createUsersTablet7();
createCalendarTablet7();

createDashboardTablet10();
createUsersTablet10();
createCalendarTablet10();

console.log('\n✅ Tous les mockups tablettes ont été créés dans le dossier "tablet-mockups/"');
console.log('\n📱 Mockups tablettes 7" créés :');
console.log('1. dashboard-tablet7-1200x1920.svg - Tableau de bord');
console.log('2. users-tablet7-1200x1920.svg - Gestion des utilisateurs');
console.log('3. calendar-tablet7-1200x1920.svg - Calendrier des cours');
console.log('\n📱 Mockups tablettes 10" créés :');
console.log('4. dashboard-tablet10-1600x2560.svg - Tableau de bord');
console.log('5. users-tablet10-1600x2560.svg - Gestion des utilisateurs');
console.log('6. calendar-tablet10-1600x2560.svg - Calendrier des cours');
console.log('\n📋 Prochaines étapes :');
console.log('1. Convertir les fichiers SVG en PNG avec les bonnes dimensions');
console.log('2. Télécharger dans Google Play Console');
console.log('3. Continuer avec la publication !');
