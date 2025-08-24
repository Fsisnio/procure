#!/usr/bin/env node

/**
 * Script de test pour vérifier la génération des mots de passe
 * Usage: node scripts/test-password-generation.js
 */

// Simuler la fonction generateUserDefaultPassword
const generateUserDefaultPassword = (user, tenant) => {
  const cleanCompanyName = tenant.companyName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 6);
  
  const cleanFirstName = user.firstName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 3);
  
  return `${cleanCompanyName}${cleanFirstName}123!`;
};

// Test avec des données d'exemple
const testCases = [
  {
    user: { firstName: 'Admin', lastName: 'Company One' },
    tenant: { companyName: 'Company One SARL' }
  },
  {
    user: { firstName: 'User', lastName: 'Company One' },
    tenant: { companyName: 'Company One SARL' }
  },
  {
    user: { firstName: 'Admin', lastName: 'Enterprise Solutions' },
    tenant: { companyName: 'Enterprise Solutions SARL' }
  }
];

console.log('🧪 Test de génération des mots de passe\n');

testCases.forEach((testCase, index) => {
  console.log(`--- Test ${index + 1} ---`);
  console.log('User:', testCase.user);
  console.log('Tenant:', testCase.tenant);
  
  const password1 = generateUserDefaultPassword(testCase.user, testCase.tenant);
  const password2 = generateUserDefaultPassword(testCase.user, testCase.tenant);
  
  console.log('Password 1:', password1);
  console.log('Password 2:', password2);
  console.log('Consistent:', password1 === password2 ? '✅' : '❌');
  console.log('');
});

// Test de cohérence avec des données réelles
console.log('🔍 Test de cohérence avec des données réelles\n');

const realTenant = {
  companyName: 'Test Company SARL',
  domain: 'testcompany.com'
};

const adminUser = { firstName: 'Admin', lastName: 'Test Company' };
const standardUser = { firstName: 'User', lastName: 'Test Company' };

const adminPassword = generateUserDefaultPassword(adminUser, realTenant);
const userPassword = generateUserDefaultPassword(standardUser, realTenant);

console.log('Tenant:', realTenant.companyName);
console.log('Admin password:', adminPassword);
console.log('User password:', userPassword);
console.log('Passwords are different:', adminPassword !== userPassword ? '✅' : '❌');

console.log('\n�� Test terminé !');
