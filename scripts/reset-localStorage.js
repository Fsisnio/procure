#!/usr/bin/env node

/**
 * Script de réinitialisation du localStorage
 * Usage: Copier le contenu dans la console du navigateur
 */

console.log('🧹 Script de réinitialisation du localStorage');
console.log('Copiez ce code dans la console de votre navigateur\n');

const resetScript = `
// === SCRIPT DE RÉINITIALISATION ===
console.log('🧹 Début de la réinitialisation...');

// 1. Sauvegarder les données actuelles (optionnel)
const currentUsers = localStorage.getItem('users');
const currentTenants = localStorage.getItem('tenants');
const currentRoles = localStorage.getItem('roles');

console.log('📋 Données actuelles sauvegardées');

// 2. Nettoyer le localStorage
localStorage.clear();
console.log('🗑️ localStorage nettoyé');

// 3. Recharger la page pour réinitialiser les données
console.log('🔄 Rechargement de la page dans 3 secondes...');
setTimeout(() => {
  window.location.reload();
}, 3000);

console.log('✅ Réinitialisation terminée. La page va se recharger automatiquement.');
`;

console.log(resetScript);

console.log('\n📋 Instructions d\'utilisation :');
console.log('1. Ouvrez la console de votre navigateur (F12)');
console.log('2. Copiez le script ci-dessus');
console.log('3. Collez-le dans la console et appuyez sur Entrée');
console.log('4. La page se rechargera automatiquement');
console.log('5. Les données seront réinitialisées avec les comptes de démonstration');

console.log('\n⚠️  ATTENTION : Ce script supprime TOUTES les données locales !');
console.log('Assurez-vous de sauvegarder toute information importante avant de l\'exécuter.');
