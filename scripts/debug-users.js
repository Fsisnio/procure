#!/usr/bin/env node

/**
 * Script de débogage pour vérifier les utilisateurs et tenants
 * Usage: node scripts/debug-users.js
 */

console.log('🔍 Débogage des utilisateurs et tenants\n');

// Simuler le localStorage (pour le test)
const mockLocalStorage = {
  users: [
    {
      id: 'user_admin_tenant_1735027200000',
      tenantId: 'tenant_1735027200000',
      email: 'admin@testcompany.com',
      firstName: 'Admin',
      lastName: 'Test Company SARL',
      password: 'TestCoAdm123!',
      role: { name: 'tenant_admin' },
      status: 'active'
    },
    {
      id: 'user_standard_tenant_1735027200000',
      tenantId: 'tenant_1735027200000',
      email: 'user@testcompany.com',
      firstName: 'User',
      lastName: 'Test Company SARL',
      password: 'TestCoUse123!',
      role: { name: 'user' },
      status: 'active'
    }
  ],
  tenants: [
    {
      id: 'tenant_1735027200000',
      name: 'testcompany',
      domain: 'testcompany.com',
      companyName: 'Test Company SARL',
      status: 'active'
    }
  ]
};

console.log('📋 Utilisateurs existants:');
mockLocalStorage.users.forEach((user, index) => {
  console.log(`\n--- Utilisateur ${index + 1} ---`);
  console.log('ID:', user.id);
  console.log('Email:', user.email);
  console.log('Mot de passe:', user.password);
  console.log('Tenant ID:', user.tenantId);
  console.log('Rôle:', user.role.name);
  console.log('Statut:', user.status);
});

console.log('\n🏢 Tenants existants:');
mockLocalStorage.tenants.forEach((tenant, index) => {
  console.log(`\n--- Tenant ${index + 1} ---`);
  console.log('ID:', tenant.id);
  console.log('Nom:', tenant.name);
  console.log('Domaine:', tenant.domain);
  console.log('Nom de l\'entreprise:', tenant.companyName);
  console.log('Statut:', tenant.status);
});

// Test de connexion simulé
console.log('\n🔐 Test de connexion simulé:');

const testLogin = (email, password) => {
  console.log(`\nTentative de connexion avec: ${email}`);
  
  const user = mockLocalStorage.users.find(u => u.email === email);
  if (!user) {
    console.log('❌ Utilisateur non trouvé');
    return false;
  }
  
  console.log('✅ Utilisateur trouvé:', user.firstName, user.lastName);
  console.log('Mot de passe stocké:', user.password);
  console.log('Mot de passe saisi:', password);
  
  if (user.password === password) {
    console.log('✅ Mot de passe correct');
    
    const tenant = mockLocalStorage.tenants.find(t => t.id === user.tenantId);
    if (tenant && tenant.status === 'active') {
      console.log('✅ Tenant actif:', tenant.companyName);
      return true;
    } else {
      console.log('❌ Tenant inactif ou non trouvé');
      return false;
    }
  } else {
    console.log('❌ Mot de passe incorrect');
    return false;
  }
};

// Tests de connexion
console.log('\n🧪 Tests de connexion:');

// Test 1: Connexion admin réussie
testLogin('admin@testcompany.com', 'TestCoAdm123!');

// Test 2: Connexion utilisateur réussie
testLogin('user@testcompany.com', 'TestCoUse123!');

// Test 3: Mot de passe incorrect
testLogin('admin@testcompany.com', 'WrongPassword123!');

// Test 4: Utilisateur inexistant
testLogin('nonexistent@testcompany.com', 'TestCoAdm123!');

console.log('\n🎯 Débogage terminé !');
