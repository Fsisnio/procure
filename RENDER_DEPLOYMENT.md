# Guide de Déploiement Render - ProcureX

## 🚀 Déploiement Recommandé : Static Hosting

### Pourquoi Static Hosting ?
- ✅ Plus rapide et fiable
- ✅ Pas de problèmes avec les fichiers statiques (icônes, favicon)
- ✅ Meilleure performance
- ✅ Déploiement automatique depuis GitHub

### Configuration Actuelle
Le fichier `render.yaml` est configuré pour utiliser le **Static Hosting** avec le service `e-supplier-web-static`.

## 📋 Étapes de Déploiement

### 1. Préparation du Code
```bash
# Vérifier que tous les fichiers d'icônes sont présents
ls -la public/
# Doit contenir : favicon.ico, logo192.png, logo512.png, apple-touch-icon.png

# Tester le build localement
./scripts/build-prod.sh
```

### 2. Push vers GitHub
```bash
git add .
git commit -m "Fix: Add missing icon files and optimize deployment for Render"
git push origin main
```

### 3. Déploiement sur Render
1. Aller sur [Render Dashboard](https://dashboard.render.com)
2. Sélectionner le service `e-supplier-web-static`
3. Le déploiement se fera automatiquement
4. Vérifier les logs de build

## 🔧 Résolution des Problèmes

### Problème : Icônes manquantes (404 errors)
**Solution appliquée :**
- ✅ Ajout de `favicon.ico` (3.87 KB)
- ✅ Ajout de `logo192.png` (5.35 KB)
- ✅ Ajout de `logo512.png` (9.66 KB)
- ✅ Ajout de `apple-touch-icon.png` (5.35 KB)
- ✅ Mise à jour du `manifest.json`
- ✅ Mise à jour du `index.html`

### Problème : Docker build échoue
**Solution :** Utilisation du déploiement statique au lieu de Docker
- Le service Docker `e-supplier-web-docker` est temporairement désactivé
- Le déploiement statique gère automatiquement les fichiers

### Problème : Erreur "Invalid credentials" après création de tenant
**Solution appliquée :**
- ✅ Correction de la double génération des mots de passe
- ✅ Ajout de logs de débogage pour l'authentification
- ✅ Scripts de test et de diagnostic
- ✅ Guide de résolution des problèmes d'authentification

**Cause identifiée :** Les mots de passe étaient générés deux fois (création + affichage), créant une incohérence entre les identifiants affichés et les données stockées.

## 🔐 Résolution des Problèmes d'Authentification

### Symptômes
- Création de tenant réussie
- Identifiants affichés lors de la création
- Échec de connexion avec "Invalid credentials"

### Solutions Appliquées
1. **Correction du code** : Suppression de la double génération des mots de passe
2. **Logs de débogage** : Ajout de logs détaillés pour tracer le problème
3. **Scripts de test** : Validation de la cohérence des mots de passe
4. **Guide de diagnostic** : Procédures étape par étape

### Diagnostic Rapide
```javascript
// Dans la console du navigateur
console.log('Users:', JSON.parse(localStorage.getItem('users')));
console.log('Tenants:', JSON.parse(localStorage.getItem('tenants')));
```

### Réinitialisation des Données
Si le problème persiste, utilisez le script de réinitialisation :
```bash
node scripts/reset-localStorage.js
```

## 📁 Structure des Fichiers
```
public/
├── favicon.ico (3.87 KB) ✅
├── logo192.png (5.35 KB) ✅
├── logo512.png (9.66 KB) ✅
├── apple-touch-icon.png (5.35 KB) ✅
├── apple-touch-icon-precomposed.png (5.35 KB) ✅
├── index.html ✅
└── manifest.json ✅

scripts/
├── build-prod.sh ✅
├── test-password-generation.js ✅
├── debug-users.js ✅
└── reset-localStorage.js ✅
```

## 🚫 Déploiement Docker (Désactivé)
Le déploiement Docker est actuellement désactivé en raison de problèmes avec les fichiers statiques. Si vous souhaitez l'utiliser plus tard :

1. Vérifier que Docker fonctionne localement
2. Tester le build Docker : `docker build -t procurex-test .`
3. Décommenter la section Docker dans `render.yaml`

## ✅ Vérification Post-Déploiement
1. Vérifier que l'application se charge sans erreurs 404
2. Vérifier que le favicon s'affiche dans l'onglet du navigateur
3. Vérifier que les icônes PWA fonctionnent
4. Tester la navigation et les fonctionnalités principales
5. **IMPORTANT** : Tester la création de tenant et la connexion

## 🔍 Troubleshooting Avancé

### Problèmes d'Authentification
- Consulter [AUTHENTICATION_TROUBLESHOOTING.md](AUTHENTICATION_TROUBLESHOOTING.md)
- Vérifier les logs de la console du navigateur
- Utiliser les scripts de diagnostic fournis

### Problèmes de Build
- Exécuter `./scripts/build-prod.sh` localement
- Vérifier les logs de build sur Render
- S'assurer que tous les fichiers d'icônes sont présents

## 📞 Support

Pour deployment issues, refer to:
- [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) - Complete deployment guide
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Verification checklist
- [AUTHENTICATION_TROUBLESHOOTING.md](AUTHENTICATION_TROUBLESHOOTING.md) - Authentication issues guide

---

**🎉 Ready for deployment!** All icon, static file, and authentication issues have been resolved.
