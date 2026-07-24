import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer le dossier pour les mockups mobiles
const mockupsDir = path.join(__dirname, 'mobile-mockups');
if (!fs.existsSync(mockupsDir)) {
    fs.mkdirSync(mockupsDir);
}

// Créer le mockup du tableau de bord mobile
const createDashboardMockup = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <!-- Fond blanc -->
  <rect width="1080" height="1920" fill="#FFFFFF"/>
  
  <!-- Header avec logo -->
  <rect x="0" y="0" width="1080" height="120" fill="#1A1A1A"/>
  <circle cx="60" cy="60" r="25" fill="#FFD700"/>
  <path d="M45,50 L75,50 M45,55 L75,55 M45,60 L75,60 M45,65 L75,65 M45,70 L75,70" stroke="#1A1A1A" stroke-width="2"/>
  <text x="100" y="45" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#FFD700">Houssem Academy</text>
  <text x="100" y="70" font-family="Arial, sans-serif" font-size="16" fill="#FFFFFF">Administration</text>
  
  <!-- Bouton menu hamburger -->
  <rect x="980" y="35" width="60" height="50" fill="none" stroke="#FFD700" stroke-width="2" rx="8"/>
  <line x1="990" y1="50" x2="1030" y2="50" stroke="#FFD700" stroke-width="3"/>
  <line x1="990" y1="60" x2="1030" y2="60" stroke="#FFD700" stroke-width="3"/>
  <line x1="990" y1="70" x2="1030" y2="70" stroke="#FFD700" stroke-width="3"/>
  
  <!-- Titre de la page -->
  <text x="540" y="180" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Tableau de Bord</text>
  <text x="540" y="210" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#666666">Vue d'ensemble de l'établissement</text>
  
  <!-- Cartes de statistiques -->
  <!-- Carte 1 -->
  <rect x="60" y="250" width="220" height="140" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <circle cx="100" cy="300" r="20" fill="#3B82F6"/>
  <text x="140" y="290" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1A1A1A">0</text>
  <text x="140" y="315" font-family="Arial, sans-serif" font-size="14" fill="#666666">Total Élèves</text>
  
  <!-- Carte 2 -->
  <rect x="300" y="250" width="220" height="140" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <circle cx="340" cy="300" r="20" fill="#10B981"/>
  <text x="380" y="290" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1A1A1A">0</text>
  <text x="380" y="315" font-family="Arial, sans-serif" font-size="14" fill="#666666">Présences</text>
  
  <!-- Carte 3 -->
  <rect x="540" y="250" width="220" height="140" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <circle cx="580" cy="300" r="20" fill="#F59E0B"/>
  <text x="620" y="290" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1A1A1A">0</text>
  <text x="620" y="315" font-family="Arial, sans-serif" font-size="14" fill="#666666">Cours Aujourd'hui</text>
  
  <!-- Carte 4 -->
  <rect x="780" y="250" width="220" height="140" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <circle cx="820" cy="300" r="20" fill="#8B5CF6"/>
  <text x="860" y="290" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1A1A1A">-</text>
  <text x="860" y="315" font-family="Arial, sans-serif" font-size="14" fill="#666666">Taux Présence</text>
  
  <!-- Section Activités Récentes -->
  <rect x="60" y="420" width="940" height="300" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <text x="80" y="450" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#1A1A1A">Activités Récentes</text>
  <text x="80" y="475" font-family="Arial, sans-serif" font-size="14" fill="#666666">Dernières actions dans le système</text>
  
  <!-- Activité 1 -->
  <circle cx="100" cy="520" r="4" fill="#FFD700"/>
  <text x="120" y="525" font-family="Arial, sans-serif" font-size="16" fill="#1A1A1A">Ahmed Benali s'est connecté</text>
  <text x="120" y="545" font-family="Arial, sans-serif" font-size="12" fill="#666666">Il y a 5 min</text>
  
  <!-- Activité 2 -->
  <circle cx="100" cy="580" r="4" fill="#FFD700"/>
  <text x="120" y="585" font-family="Arial, sans-serif" font-size="16" fill="#1A1A1A">Cours Mathématiques terminé</text>
  <text x="120" y="605" font-family="Arial, sans-serif" font-size="12" fill="#666666">Il y a 15 min</text>
  
  <!-- Activité 3 -->
  <circle cx="100" cy="640" r="4" fill="#FFD700"/>
  <text x="120" y="645" font-family="Arial, sans-serif" font-size="16" fill="#1A1A1A">3 absences signalées</text>
  <text x="120" y="665" font-family="Arial, sans-serif" font-size="12" fill="#666666">Il y a 30 min</text>
  
  <!-- Actions Rapides -->
  <rect x="60" y="750" width="940" height="200" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <text x="80" y="780" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#1A1A1A">Actions Rapides</text>
  <text x="80" y="805" font-family="Arial, sans-serif" font-size="14" fill="#666666">Raccourcis fréquemment utilisés</text>
  
  <!-- Boutons d'action -->
  <rect x="80" y="830" width="200" height="80" fill="#FFD700" rx="8"/>
  <text x="180" y="875" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Ajouter un élève</text>
  
  <rect x="300" y="830" width="200" height="80" fill="#FFD700" rx="8"/>
  <text x="400" y="875" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Marquer présences</text>
  
  <rect x="520" y="830" width="200" height="80" fill="#FFD700" rx="8"/>
  <text x="620" y="875" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Créer un cours</text>
  
  <rect x="740" y="830" width="200" height="80" fill="#FFD700" rx="8"/>
  <text x="840" y="875" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Export CSV</text>
  
  <!-- Navigation mobile en bas -->
  <rect x="0" y="1800" width="1080" height="120" fill="#1A1A1A"/>
  <circle cx="216" cy="1860" r="25" fill="#FFD700"/>
  <circle cx="432" cy="1860" r="25" fill="#666666"/>
  <circle cx="648" cy="1860" r="25" fill="#666666"/>
  <circle cx="864" cy="1860" r="25" fill="#666666"/>
</svg>`;

    fs.writeFileSync(path.join(mockupsDir, 'dashboard-mobile-1080x1920.svg'), svgContent);
    console.log('✅ Mockup tableau de bord mobile créé : dashboard-mobile-1080x1920.svg');
};

// Créer le mockup de la gestion des utilisateurs
const createUsersMockup = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <!-- Fond blanc -->
  <rect width="1080" height="1920" fill="#FFFFFF"/>
  
  <!-- Header avec logo -->
  <rect x="0" y="0" width="1080" height="120" fill="#1A1A1A"/>
  <circle cx="60" cy="60" r="25" fill="#FFD700"/>
  <path d="M45,50 L75,50 M45,55 L75,55 M45,60 L75,60 M45,65 L75,65 M45,70 L75,70" stroke="#1A1A1A" stroke-width="2"/>
  <text x="100" y="45" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#FFD700">Houssem Academy</text>
  <text x="100" y="70" font-family="Arial, sans-serif" font-size="16" fill="#FFFFFF">Administration</text>
  
  <!-- Bouton retour -->
  <rect x="20" y="35" width="40" height="50" fill="none" stroke="#FFD700" stroke-width="2" rx="8"/>
  <path d="M30,50 L50,50 M30,60 L50,60" stroke="#FFD700" stroke-width="2"/>
  
  <!-- Titre de la page -->
  <text x="540" y="180" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Gestion des Utilisateurs</text>
  <text x="540" y="210" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#666666">Liste des Élèves</text>
  
  <!-- Onglets -->
  <rect x="60" y="230" width="180" height="50" fill="#FFD700" rx="25"/>
  <text x="150" y="260" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Élèves (4)</text>
  
  <rect x="260" y="230" width="180" height="50" fill="#E0E0E0" rx="25"/>
  <text x="350" y="260" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#666666">Professeurs (3)</text>
  
  <!-- Bouton ajouter -->
  <rect x="780" y="230" width="220" height="50" fill="#FFD700" rx="25"/>
  <text x="890" y="260" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#1A1A1A">+ Ajouter un élève</text>
  
  <!-- Liste des élèves -->
  <!-- Élève 1 -->
  <rect x="60" y="310" width="940" height="100" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <circle cx="100" cy="350" r="20" fill="#3B82F6"/>
  <text x="140" y="340" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1A1A1A">Ahmed Ben Ali</text>
  <text x="140" y="360" font-family="Arial, sans-serif" font-size="14" fill="#666666">Parent: Mohamed Ben Ali</text>
  <rect x="140" y="375" width="80" height="20" fill="#3B82F6" rx="10"/>
  <text x="180" y="388" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#FFFFFF">7ème A</text>
  <rect x="240" y="375" width="60" height="20" fill="#10B981" rx="10"/>
  <text x="270" y="388" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#FFFFFF">Actif</text>
  <text x="320" y="388" font-family="Arial, sans-serif" font-size="12" fill="#666666">Aujourd'hui</text>
  
  <!-- Élève 2 -->
  <rect x="60" y="430" width="940" height="100" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <circle cx="100" cy="470" r="20" fill="#10B981"/>
  <text x="140" y="460" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1A1A1A">Fatima Zohra</text>
  <text x="140" y="480" font-family="Arial, sans-serif" font-size="14" fill="#666666">Parent: Aicha Zohra</text>
  <rect x="140" y="495" width="80" height="20" fill="#3B82F6" rx="10"/>
  <text x="180" y="508" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#FFFFFF">7ème B</text>
  <rect x="240" y="495" width="60" height="20" fill="#10B981" rx="10"/>
  <text x="270" y="508" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#FFFFFF">Actif</text>
  <text x="320" y="508" font-family="Arial, sans-serif" font-size="12" fill="#666666">Hier</text>
  
  <!-- Élève 3 -->
  <rect x="60" y="550" width="940" height="100" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <circle cx="100" cy="590" r="20" fill="#F59E0B"/>
  <text x="140" y="580" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1A1A1A">Youssef Gharbi</text>
  <text x="140" y="600" font-family="Arial, sans-serif" font-size="14" fill="#666666">Parent: Omar Gharbi</text>
  <rect x="140" y="615" width="80" height="20" fill="#3B82F6" rx="10"/>
  <text x="180" y="628" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#FFFFFF">8ème A</text>
  <rect x="240" y="615" width="80" height="20" fill="#F59E0B" rx="10"/>
  <text x="280" y="628" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#FFFFFF">En attente</text>
  <text x="340" y="628" font-family="Arial, sans-serif" font-size="12" fill="#666666">Jamais</text>
  
  <!-- Élève 4 -->
  <rect x="60" y="670" width="940" height="100" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <circle cx="100" cy="710" r="20" fill="#8B5CF6"/>
  <text x="140" y="700" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1A1A1A">Salma Triki</text>
  <text x="140" y="720" font-family="Arial, sans-serif" font-size="14" fill="#666666">Parent: Leila Triki</text>
  <rect x="140" y="735" width="80" height="20" fill="#3B82F6" rx="10"/>
  <text x="180" y="748" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#FFFFFF">7ème A</text>
  <rect x="240" y="735" width="60" height="20" fill="#10B981" rx="10"/>
  <text x="270" y="748" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#FFFFFF">Actif</text>
  <text x="320" y="748" font-family="Arial, sans-serif" font-size="12" fill="#666666">Il y a 2 jours</text>
  
  <!-- Navigation mobile en bas -->
  <rect x="0" y="1800" width="1080" height="120" fill="#1A1A1A"/>
  <circle cx="216" cy="1860" r="25" fill="#666666"/>
  <circle cx="432" cy="1860" r="25" fill="#FFD700"/>
  <circle cx="648" cy="1860" r="25" fill="#666666"/>
  <circle cx="864" cy="1860" r="25" fill="#666666"/>
</svg>`;

    fs.writeFileSync(path.join(mockupsDir, 'users-mobile-1080x1920.svg'), svgContent);
    console.log('✅ Mockup gestion utilisateurs mobile créé : users-mobile-1080x1920.svg');
};

// Créer le mockup du calendrier
const createCalendarMockup = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <!-- Fond blanc -->
  <rect width="1080" height="1920" fill="#FFFFFF"/>
  
  <!-- Header avec logo -->
  <rect x="0" y="0" width="1080" height="120" fill="#1A1A1A"/>
  <circle cx="60" cy="60" r="25" fill="#FFD700"/>
  <path d="M45,50 L75,50 M45,55 L75,55 M45,60 L75,60 M45,65 L75,65 M45,70 L75,70" stroke="#1A1A1A" stroke-width="2"/>
  <text x="100" y="45" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#FFD700">Houssem Academy</text>
  <text x="100" y="70" font-family="Arial, sans-serif" font-size="16" fill="#FFFFFF">Administration</text>
  
  <!-- Bouton nouveau cours -->
  <rect x="780" y="35" width="220" height="50" fill="#FFD700" rx="25"/>
  <text x="890" y="65" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#1A1A1A">+ Nouveau Cours</text>
  
  <!-- Titre de la page -->
  <text x="540" y="180" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Calendrier des Cours</text>
  <text x="540" y="210" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#666666">Planning et organisation</text>
  
  <!-- Onglets de vue -->
  <rect x="60" y="230" width="200" height="50" fill="#FFD700" rx="25"/>
  <text x="160" y="260" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Vue Journalière</text>
  
  <rect x="280" y="230" width="200" height="50" fill="#E0E0E0" rx="25"/>
  <text x="380" y="260" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#666666">Planning Mensuel</text>
  
  <!-- Section calendrier -->
  <rect x="60" y="300" width="940" height="350" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <text x="80" y="330" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#1A1A1A">Calendrier</text>
  <text x="80" y="355" font-family="Arial, sans-serif" font-size="14" fill="#666666">Sélectionner une date</text>
  
  <!-- Mini calendrier -->
  <rect x="80" y="370" width="400" height="250" fill="#F8F9FA" rx="8"/>
  <text x="280" y="395" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Octobre 2025</text>
  
  <!-- Jours de la semaine -->
  <text x="110" y="425" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#666666">Di</text>
  <text x="150" y="425" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#666666">Lu</text>
  <text x="190" y="425" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#666666">Ma</text>
  <text x="230" y="425" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#666666">Me</text>
  <text x="270" y="425" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#666666">Je</text>
  <text x="310" y="425" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#666666">Ve</text>
  <text x="350" y="425" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#666666">Sa</text>
  
  <!-- Dates du calendrier -->
  <circle cx="270" cy="480" r="20" fill="#1A1A1A"/>
  <text x="270" y="487" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#FFFFFF">12</text>
  
  <!-- Section cours du jour -->
  <rect x="60" y="670" width="940" height="400" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <text x="80" y="700" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#1A1A1A">Cours d'Aujourd'hui</text>
  <text x="80" y="725" font-family="Arial, sans-serif" font-size="14" fill="#666666">dimanche 12 octobre 2025</text>
  
  <!-- Cours 1 -->
  <rect x="80" y="750" width="880" height="120" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="8"/>
  <rect x="80" y="750" width="8" height="120" fill="#3B82F6"/>
  <text x="110" y="775" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1A1A1A">Mathématiques</text>
  <rect x="110" y="785" width="60" height="20" fill="#3B82F6" rx="10"/>
  <text x="140" y="798" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#FFFFFF">7ème A</text>
  <text x="110" y="820" font-family="Arial, sans-serif" font-size="14" fill="#666666">08:00 - 09:00 • Salle 101</text>
  <text x="110" y="840" font-family="Arial, sans-serif" font-size="14" fill="#666666">25 élèves • Prof. Hassan Amri</text>
  
  <!-- Cours 2 -->
  <rect x="80" y="890" width="880" height="120" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="8"/>
  <rect x="80" y="890" width="8" height="120" fill="#10B981"/>
  <text x="110" y="915" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1A1A1A">Français</text>
  <rect x="110" y="925" width="60" height="20" fill="#3B82F6" rx="10"/>
  <text x="140" y="938" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#FFFFFF">7ème B</text>
  <text x="110" y="960" font-family="Arial, sans-serif" font-size="14" fill="#666666">09:15 - 10:15 • Salle 203</text>
  <text x="110" y="980" font-family="Arial, sans-serif" font-size="14" fill="#666666">23 élèves • Prof. Nadia Slim</text>
  
  <!-- Navigation mobile en bas -->
  <rect x="0" y="1800" width="1080" height="120" fill="#1A1A1A"/>
  <circle cx="216" cy="1860" r="25" fill="#666666"/>
  <circle cx="432" cy="1860" r="25" fill="#666666"/>
  <circle cx="648" cy="1860" r="25" fill="#FFD700"/>
  <circle cx="864" cy="1860" r="25" fill="#666666"/>
</svg>`;

    fs.writeFileSync(path.join(mockupsDir, 'calendar-mobile-1080x1920.svg'), svgContent);
    console.log('✅ Mockup calendrier mobile créé : calendar-mobile-1080x1920.svg');
};

// Créer le mockup de la messagerie
const createMessagingMockup = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <!-- Fond blanc -->
  <rect width="1080" height="1920" fill="#FFFFFF"/>
  
  <!-- Header avec logo -->
  <rect x="0" y="0" width="1080" height="120" fill="#1A1A1A"/>
  <circle cx="60" cy="60" r="25" fill="#FFD700"/>
  <path d="M45,50 L75,50 M45,55 L75,55 M45,60 L75,60 M45,65 L75,65 M45,70 L75,70" stroke="#1A1A1A" stroke-width="2"/>
  <text x="100" y="45" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#FFD700">Houssem Academy</text>
  <text x="100" y="70" font-family="Arial, sans-serif" font-size="16" fill="#FFFFFF">Messagerie</text>
  
  <!-- Bouton nouveau message -->
  <rect x="780" y="35" width="220" height="50" fill="#FFD700" rx="25"/>
  <text x="890" y="65" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#1A1A1A">+ Nouveau Message</text>
  
  <!-- Titre de la page -->
  <text x="540" y="180" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Messagerie</text>
  <text x="540" y="210" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#666666">Communication entre utilisateurs</text>
  
  <!-- Onglets -->
  <rect x="60" y="230" width="150" height="50" fill="#FFD700" rx="25"/>
  <text x="135" y="260" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Tous (12)</text>
  
  <rect x="230" y="230" width="150" height="50" fill="#E0E0E0" rx="25"/>
  <text x="305" y="260" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#666666">Non lus (3)</text>
  
  <rect x="400" y="230" width="150" height="50" fill="#E0E0E0" rx="25"/>
  <text x="475" y="260" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#666666">Importants</text>
  
  <!-- Barre de recherche -->
  <rect x="60" y="300" width="860" height="60" fill="#F8F9FA" stroke="#E0E0E0" stroke-width="2" rx="30"/>
  <text x="100" y="340" font-family="Arial, sans-serif" font-size="16" fill="#666666">Rechercher des messages...</text>
  
  <!-- Liste des conversations -->
  <!-- Conversation 1 -->
  <rect x="60" y="380" width="940" height="100" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <circle cx="100" cy="420" r="25" fill="#3B82F6"/>
  <text x="100" y="427" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#FFFFFF">AH</text>
  <text x="140" y="405" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1A1A1A">Ahmed Ben Ali</text>
  <text x="140" y="425" font-family="Arial, sans-serif" font-size="14" fill="#666666">Absence justifiée pour le cours de...</text>
  <text x="140" y="445" font-family="Arial, sans-serif" font-size="12" fill="#999999">Il y a 5 min</text>
  <circle cx="950" cy="410" r="12" fill="#FF4444"/>
  <text x="950" y="416" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="#FFFFFF">2</text>
  
  <!-- Conversation 2 -->
  <rect x="60" y="500" width="940" height="100" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <circle cx="100" cy="540" r="25" fill="#10B981"/>
  <text x="100" y="547" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#FFFFFF">FZ</text>
  <text x="140" y="525" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1A1A1A">Fatima Zohra</text>
  <text x="140" y="545" font-family="Arial, sans-serif" font-size="14" fill="#666666">Merci pour les notes du cours...</text>
  <text x="140" y="565" font-family="Arial, sans-serif" font-size="12" fill="#999999">Il y a 1h</text>
  
  <!-- Conversation 3 -->
  <rect x="60" y="620" width="940" height="100" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <circle cx="100" cy="660" r="25" fill="#F59E0B"/>
  <text x="100" y="667" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#FFFFFF">YG</text>
  <text x="140" y="645" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1A1A1A">Youssef Gharbi</text>
  <text x="140" y="665" font-family="Arial, sans-serif" font-size="14" fill="#666666">Question sur le devoir de maths</text>
  <text x="140" y="685" font-family="Arial, sans-serif" font-size="12" fill="#999999">Il y a 2h</text>
  <circle cx="950" cy="650" r="12" fill="#FF4444"/>
  <text x="950" y="656" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="#FFFFFF">1</text>
  
  <!-- Conversation 4 -->
  <rect x="60" y="740" width="940" height="100" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <circle cx="100" cy="780" r="25" fill="#8B5CF6"/>
  <text x="100" y="787" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#FFFFFF">ST</text>
  <text x="140" y="765" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1A1A1A">Salma Triki</text>
  <text x="140" y="785" font-family="Arial, sans-serif" font-size="14" fill="#666666">Rendez-vous parent-professeur</text>
  <text x="140" y="805" font-family="Arial, sans-serif" font-size="12" fill="#999999">Hier</text>
  
  <!-- Conversation 5 -->
  <rect x="60" y="860" width="940" height="100" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <circle cx="100" cy="900" r="25" fill="#EF4444"/>
  <text x="100" y="907" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#FFFFFF">MB</text>
  <text x="140" y="885" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1A1A1A">Mohamed Ben Ali</text>
  <text x="140" y="905" font-family="Arial, sans-serif" font-size="14" fill="#666666">Suivi de mon fils Ahmed</text>
  <text x="140" y="925" font-family="Arial, sans-serif" font-size="12" fill="#999999">Il y a 3 jours</text>
  
  <!-- Navigation mobile en bas -->
  <rect x="0" y="1800" width="1080" height="120" fill="#1A1A1A"/>
  <circle cx="216" cy="1860" r="25" fill="#666666"/>
  <circle cx="432" cy="1860" r="25" fill="#666666"/>
  <circle cx="648" cy="1860" r="25" fill="#666666"/>
  <circle cx="864" cy="1860" r="25" fill="#FFD700"/>
</svg>`;

    fs.writeFileSync(path.join(mockupsDir, 'messaging-mobile-1080x1920.svg'), svgContent);
    console.log('✅ Mockup messagerie mobile créé : messaging-mobile-1080x1920.svg');
};

// Créer le mockup du profil utilisateur
const createProfileMockup = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <!-- Fond blanc -->
  <rect width="1080" height="1920" fill="#FFFFFF"/>
  
  <!-- Header avec logo -->
  <rect x="0" y="0" width="1080" height="120" fill="#1A1A1A"/>
  <circle cx="60" cy="60" r="25" fill="#FFD700"/>
  <path d="M45,50 L75,50 M45,55 L75,55 M45,60 L75,60 M45,65 L75,65 M45,70 L75,70" stroke="#1A1A1A" stroke-width="2"/>
  <text x="100" y="45" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#FFD700">Houssem Academy</text>
  <text x="100" y="70" font-family="Arial, sans-serif" font-size="16" fill="#FFFFFF">Profil</text>
  
  <!-- Bouton modifier -->
  <rect x="780" y="35" width="220" height="50" fill="#FFD700" rx="25"/>
  <text x="890" y="65" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Modifier Profil</text>
  
  <!-- Section profil -->
  <rect x="60" y="150" width="940" height="200" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <circle cx="540" cy="220" r="50" fill="#3B82F6"/>
  <text x="540" y="230" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#FFFFFF">AB</text>
  <text x="540" y="280" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Ahmed Ben Ali</text>
  <text x="540" y="305" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#666666">Élève - 7ème A</text>
  <rect x="460" y="315" width="160" height="25" fill="#10B981" rx="12"/>
  <text x="540" y="330" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#FFFFFF">Compte Actif</text>
  
  <!-- Informations personnelles -->
  <rect x="60" y="370" width="940" height="300" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <text x="80" y="400" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#1A1A1A">Informations Personnelles</text>
  
  <!-- Email -->
  <text x="80" y="430" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#666666">Email</text>
  <text x="80" y="450" font-family="Arial, sans-serif" font-size="16" fill="#1A1A1A">ahmed.benali@houssemacademy.com</text>
  
  <!-- Téléphone -->
  <text x="80" y="480" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#666666">Téléphone</text>
  <text x="80" y="500" font-family="Arial, sans-serif" font-size="16" fill="#1A1A1A">+216 25 123 456</text>
  
  <!-- Date de naissance -->
  <text x="80" y="530" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#666666">Date de naissance</text>
  <text x="80" y="550" font-family="Arial, sans-serif" font-size="16" fill="#1A1A1A">15 Mars 2010</text>
  
  <!-- Adresse -->
  <text x="80" y="580" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#666666">Adresse</text>
  <text x="80" y="600" font-family="Arial, sans-serif" font-size="16" fill="#1A1A1A">123 Rue de l'Éducation, Tunis</text>
  
  <!-- Informations académiques -->
  <rect x="60" y="690" width="940" height="250" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <text x="80" y="720" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#1A1A1A">Informations Académiques</text>
  
  <!-- Classe -->
  <text x="80" y="750" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#666666">Classe</text>
  <rect x="80" y="760" width="100" height="25" fill="#3B82F6" rx="12"/>
  <text x="130" y="775" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#FFFFFF">7ème A</text>
  
  <!-- Moyenne -->
  <text x="220" y="750" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#666666">Moyenne Générale</text>
  <text x="220" y="775" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#10B981">15.8/20</text>
  
  <!-- Présence -->
  <text x="400" y="750" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#666666">Taux de Présence</text>
  <text x="400" y="775" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#F59E0B">92%</text>
  
  <!-- Statistiques -->
  <rect x="80" y="800" width="800" height="120" fill="#F8F9FA" rx="8"/>
  <text x="100" y="825" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#1A1A1A">Statistiques du Trimestre</text>
  
  <!-- Matières -->
  <text x="100" y="850" font-family="Arial, sans-serif" font-size="14" fill="#666666">Mathématiques: 16/20</text>
  <text x="300" y="850" font-family="Arial, sans-serif" font-size="14" fill="#666666">Français: 15/20</text>
  <text x="500" y="850" font-family="Arial, sans-serif" font-size="14" fill="#666666">Sciences: 17/20</text>
  <text x="700" y="850" font-family="Arial, sans-serif" font-size="14" fill="#666666">Histoire: 14/20</text>
  
  <!-- Actions rapides -->
  <rect x="60" y="960" width="940" height="150" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" rx="12"/>
  <text x="80" y="990" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#1A1A1A">Actions Rapides</text>
  
  <!-- Boutons d'action -->
  <rect x="80" y="1010" width="200" height="60" fill="#FFD700" rx="8"/>
  <text x="180" y="1050" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Voir les Notes</text>
  
  <rect x="300" y="1010" width="200" height="60" fill="#FFD700" rx="8"/>
  <text x="400" y="1050" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Absences</text>
  
  <rect x="520" y="1010" width="200" height="60" fill="#FFD700" rx="8"/>
  <text x="620" y="1050" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Devoirs</text>
  
  <rect x="740" y="1010" width="200" height="60" fill="#FFD700" rx="8"/>
  <text x="840" y="1050" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#1A1A1A">Messages</text>
  
  <!-- Navigation mobile en bas -->
  <rect x="0" y="1800" width="1080" height="120" fill="#1A1A1A"/>
  <circle cx="216" cy="1860" r="25" fill="#666666"/>
  <circle cx="432" cy="1860" r="25" fill="#666666"/>
  <circle cx="648" cy="1860" r="25" fill="#666666"/>
  <circle cx="864" cy="1860" r="25" fill="#666666"/>
</svg>`;

    fs.writeFileSync(path.join(mockupsDir, 'profile-mobile-1080x1920.svg'), svgContent);
    console.log('✅ Mockup profil mobile créé : profile-mobile-1080x1920.svg');
};

// Exécuter la création des mockups
console.log('🎨 Création des mockups mobiles pour Google Play Store...\n');

createDashboardMockup();
createUsersMockup();
createCalendarMockup();
createMessagingMockup();
createProfileMockup();

console.log('\n✅ Tous les mockups mobiles ont été créés dans le dossier "mobile-mockups/"');
console.log('\n📱 Mockups créés :');
console.log('1. dashboard-mobile-1080x1920.svg - Tableau de bord');
console.log('2. users-mobile-1080x1920.svg - Gestion des utilisateurs');
console.log('3. calendar-mobile-1080x1920.svg - Calendrier des cours');
console.log('4. messaging-mobile-1080x1920.svg - Messagerie');
console.log('5. profile-mobile-1080x1920.svg - Profil utilisateur');
console.log('\n📋 Prochaines étapes :');
console.log('1. Convertir les fichiers SVG en PNG (1080x1920px)');
console.log('2. Télécharger dans Google Play Console');
console.log('3. Continuer avec la publication !');
