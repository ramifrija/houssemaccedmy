# 🌐 ACCÈS AU DASHBOARD CLIENT

## 🎯 LIENS D'ACCÈS

### **Option 1 : Ouvrir directement dans le navigateur (Recommandé)**

Le dashboard est un fichier HTML autonome. Vous pouvez l'ouvrir directement :

**Windows :**
```
Double-cliquez sur : dashboard-client.html
```

**Ou via l'explorateur de fichiers :**
```
C:\Users\MOHAMEDKHALILBECH\HOUSSEM-ACADEMY\dashboard-client.html
```

**Lien direct (file://) :**
```
file:///C:/Users/MOHAMEDKHALILBECH/HOUSSEM-ACADEMY/dashboard-client.html
```

---

### **Option 2 : Serveur local (Pour accès réseau)**

#### **Méthode A : Script Node.js (Recommandé)**

```bash
# Dans le répertoire du projet
node serve-dashboard.js
```

**Accès :**
- Local : http://localhost:3000
- Réseau : http://[VOTRE_IP]:3000

#### **Méthode B : Python (si Node.js non disponible)**

```bash
# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

**Accès :** http://localhost:3000/dashboard-client.html

#### **Méthode C : PHP (si disponible)**

```bash
php -S localhost:3000
```

**Accès :** http://localhost:3000/dashboard-client.html

---

### **Option 3 : Via VSCode Live Server**

Si vous utilisez VSCode avec l'extension "Live Server" :

1. Clic droit sur `dashboard-client.html`
2. Sélectionner "Open with Live Server"
3. Le dashboard s'ouvrira automatiquement

---

## 📱 ACCÈS DEPUIS UN AUTRE APPAREIL

### **Sur le même réseau WiFi :**

1. **Trouver votre IP locale :**
   ```bash
   # Windows
   ipconfig
   # Chercher "IPv4 Address" (ex: 192.168.1.100)
   
   # Mac/Linux
   ifconfig
   # Chercher "inet" (ex: 192.168.1.100)
   ```

2. **Démarrer le serveur :**
   ```bash
   node serve-dashboard.js
   ```

3. **Accéder depuis un autre appareil :**
   ```
   http://[VOTRE_IP]:3000
   ```
   Exemple : http://192.168.1.100:3000

---

## 🔗 LIENS RAPIDES

### **Dashboard Local**
- **Fichier direct :** `dashboard-client.html`
- **Serveur local :** http://localhost:3000
- **Chemin complet :** `C:\Users\MOHAMEDKHALILBECH\HOUSSEM-ACADEMY\dashboard-client.html`

### **Application de Développement**
- **URL :** http://localhost:5173
- **Commande :** `npm run dev`

---

## ✅ VÉRIFICATION

Pour vérifier que le dashboard fonctionne :

1. **Ouvrir le fichier** `dashboard-client.html` dans votre navigateur
2. **Vérifier que vous voyez :**
   - Le header "🎓 Houssem Academy"
   - Les cartes avec les informations
   - Les barres de progression
   - La checklist

---

## 🚨 DÉPANNAGE

### **Le dashboard ne s'affiche pas correctement**

**Solution 1 :** Vérifier que tous les fichiers sont dans le même répertoire

**Solution 2 :** Utiliser un serveur local au lieu d'ouvrir directement :
```bash
node serve-dashboard.js
```

**Solution 3 :** Vérifier la console du navigateur (F12) pour les erreurs

### **Les liens vers les documents ne fonctionnent pas**

Les liens vers les fichiers `.md` fonctionnent uniquement si :
- Vous utilisez un serveur local
- Vous avez une extension Markdown dans votre navigateur
- Vous ouvrez les fichiers directement depuis l'explorateur

**Solution :** Utiliser un serveur local ou ouvrir les fichiers `.md` directement

---

## 📝 NOTES

- Le dashboard est un fichier HTML autonome (pas besoin de serveur pour l'ouvrir)
- Pour un accès réseau, utilisez le serveur local
- Tous les liens vers les documents `.md` nécessitent un lecteur Markdown

---

## 🎯 ACCÈS RAPIDE

**Le moyen le plus simple :**

1. Ouvrir l'explorateur de fichiers
2. Naviguer vers : `C:\Users\MOHAMEDKHALILBECH\HOUSSEM-ACADEMY`
3. Double-cliquer sur `dashboard-client.html`

**C'est tout ! Le dashboard s'ouvrira dans votre navigateur par défaut.**

---

**Dernière mise à jour :** Janvier 2025





