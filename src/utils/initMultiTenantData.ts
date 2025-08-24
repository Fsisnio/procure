import { Tenant, User, UserRole, Permission, SYSTEM_ROLES, DEFAULT_PERMISSIONS } from '../types';
import { generateUserDefaultPassword } from './passwordUtils';

// Initialize demo data for multi-tenant system
export const initializeMultiTenantData = () => {
  console.log('=== INITIALIZING MULTI-TENANT DATA ===');
  
  // Check if data already exists
  if (localStorage.getItem('tenants') && localStorage.getItem('users') && localStorage.getItem('roles')) {
    console.log('Data already exists, skipping initialization');
    return; // Data already initialized
  }

  console.log('Initializing multi-tenant demo data...');

  // Create default permissions
  const createPermissions = () => {
    const permissions: Permission[] = [];
    
    Object.entries(DEFAULT_PERMISSIONS).forEach(([key, permission]) => {
      const [resource, action] = permission.split(':');
      permissions.push({
        id: `perm_${key}`,
        name: `${resource} ${action}`,
        resource,
        action: action as any,
        description: `Permission to ${action} ${resource}`,
      });
    });
    
    return permissions;
  };

  const allPermissions = createPermissions();

  // Create system roles
  const createSystemRoles = () => {
    const roles: UserRole[] = [];

    // Super Admin Role (all permissions)
    roles.push({
      id: 'role_super_admin',
      name: SYSTEM_ROLES.SUPER_ADMIN,
      permissions: allPermissions,
      tenantId: 'system',
      isSystemRole: true,
      createdAt: new Date(),
    });

    // Tenant Admin Role
    const tenantAdminPermissions = allPermissions.filter(p => 
      !p.resource.includes('tenant') // Exclude tenant management permissions
    );
    roles.push({
      id: 'role_tenant_admin',
      name: SYSTEM_ROLES.TENANT_ADMIN,
      permissions: tenantAdminPermissions,
      tenantId: 'system',
      isSystemRole: true,
      createdAt: new Date(),
    });

    // User Role (basic permissions)
    const userPermissions = allPermissions.filter(p => 
      ['supplier', 'product', 'order'].includes(p.resource) && 
      ['read', 'create', 'update'].includes(p.action)
    );
    roles.push({
      id: 'role_user',
      name: SYSTEM_ROLES.USER,
      permissions: userPermissions,
      tenantId: 'system',
      isSystemRole: true,
      createdAt: new Date(),
    });

    // Viewer Role (read-only permissions - can only view, nothing else)
    const viewerPermissions = allPermissions.filter(p => 
      ['supplier', 'product', 'order'].includes(p.resource) && 
      p.action === 'read'
    );
    roles.push({
      id: 'role_viewer',
      name: SYSTEM_ROLES.VIEWER,
      permissions: viewerPermissions,
      tenantId: 'system',
      isSystemRole: true,
      createdAt: new Date(),
    });

    return roles;
  };

  const systemRoles = createSystemRoles();

  // Create demo tenants
  const createDemoTenants = () => {
    const tenants: Tenant[] = [
      {
        id: 'tenant_company1',
        name: 'company1',
        domain: 'company1.procurex.com',
        companyName: 'Company One SARL',
        address: '123 Rue de la Paix',
        city: 'Paris',
        country: 'France',
        postalCode: '75001',
        phone: '+33 1 23 45 67 89',
        email: 'contact@company1.com',
        status: 'active',
        subscriptionPlan: 'premium',
        maxUsers: 10,
        maxSuppliers: 100,
        maxProducts: 500,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'tenant_company2',
        name: 'company2',
        domain: 'company2.procurex.com',
        companyName: 'Company Two SARL',
        address: '456 Avenue des Champs',
        city: 'Lyon',
        country: 'France',
        postalCode: '69001',
        phone: '+33 4 56 78 90 12',
        email: 'contact@company2.com',
        status: 'active',
        subscriptionPlan: 'basic',
        maxUsers: 5,
        maxSuppliers: 50,
        maxProducts: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'tenant_enterprise',
        name: 'enterprise',
        domain: 'enterprise.procurex.com',
        companyName: 'Enterprise Solutions SARL',
        address: '789 Boulevard de l\'Innovation',
        city: 'Marseille',
        country: 'France',
        postalCode: '13001',
        phone: '+33 4 91 23 45 67',
        email: 'contact@enterprise.com',
        status: 'active',
        subscriptionPlan: 'enterprise',
        maxUsers: 50,
        maxSuppliers: 500,
        maxProducts: 2000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return tenants;
  };

  const demoTenants = createDemoTenants();

  // Create demo users
  const createDemoUsers = () => {
    const users: User[] = [];

    // Super Admin (system-wide)
    users.push({
      id: 'user_super_admin',
      tenantId: 'system',
      email: 'superadmin@procurex.com',
      firstName: 'Super',
      lastName: 'Administrator',
      password: 'SuperAdmin123!',
      role: systemRoles.find(r => r.name === SYSTEM_ROLES.SUPER_ADMIN)!,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Company 1 users
    users.push({
      id: 'user_admin_company1',
      tenantId: 'tenant_company1',
      email: 'admin@company1.com',
      firstName: 'Admin',
      lastName: 'Company One',
      password: 'CompanyOne123!',
      role: systemRoles.find(r => r.name === SYSTEM_ROLES.TENANT_ADMIN)!,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    users.push({
      id: 'user_standard_company1',
      tenantId: 'tenant_company1',
      email: 'user@company1.com',
      firstName: 'User',
      lastName: 'Standard',
      password: 'CompanyOne123!',
      role: systemRoles.find(r => r.name === SYSTEM_ROLES.USER)!,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    users.push({
      id: 'user_viewer_company1',
      tenantId: 'tenant_company1',
      email: 'viewer@company1.com',
      firstName: 'Viewer',
      lastName: 'Only',
      password: 'CompanyOne123!',
      role: systemRoles.find(r => r.name === SYSTEM_ROLES.VIEWER)!,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Company 2 users
    users.push({
      id: 'user_admin_company2',
      tenantId: 'tenant_company2',
      email: 'admin@company2.com',
      firstName: 'Admin',
      lastName: 'Company Two',
      password: 'CompanyTwo123!',
      role: systemRoles.find(r => r.name === SYSTEM_ROLES.TENANT_ADMIN)!,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    users.push({
      id: 'user_standard_company2',
      tenantId: 'tenant2',
      email: 'user@company2.com',
      firstName: 'User',
      lastName: 'Standard',
      password: 'CompanyTwo123!',
      role: systemRoles.find(r => r.name === SYSTEM_ROLES.USER)!,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Enterprise users
    users.push({
      id: 'user_admin_enterprise',
      tenantId: 'tenant_enterprise',
      email: 'admin@enterprise.com',
      firstName: 'Admin',
      lastName: 'Enterprise',
      password: 'Enterprise123!',
      role: systemRoles.find(r => r.name === SYSTEM_ROLES.TENANT_ADMIN)!,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    users.push({
      id: 'user_manager_enterprise',
      tenantId: 'tenant_enterprise',
      email: 'manager@enterprise.com',
      firstName: 'Manager',
      lastName: 'Enterprise',
      password: 'Enterprise123!',
      role: systemRoles.find(r => r.name === SYSTEM_ROLES.USER)!,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return users;
  };

  const demoUsers = createDemoUsers();

  // Store data in localStorage
  localStorage.setItem('tenants', JSON.stringify(demoTenants));
  localStorage.setItem('users', JSON.stringify(demoUsers));
  localStorage.setItem('roles', JSON.stringify(systemRoles));

  console.log('Multi-tenant demo data initialized successfully!');
  console.log('Demo accounts available:');
  console.log('- Super Admin: superadmin@procurex.com (password: SuperAdmin123!)');
  console.log('- Company 1 Admin: admin@company1.com (password: CompanyOne123!)');
  console.log('- Company 1 User: user@company1.com (password: CompanyOne123!)');
  console.log('- Company 1 Viewer: viewer@company1.com (password: CompanyOne123!)');
  console.log('- Company 2 Admin: admin@company2.com (password: CompanyTwo123!)');
  console.log('- Company 2 User: user@company2.com (password: CompanyTwo123!)');
  console.log('- Enterprise Admin: admin@enterprise.com (password: Enterprise123!)');
  console.log('- Enterprise Manager: manager@enterprise.com (password: Enterprise123!)');
};

// Initialize data when this module is imported
initializeMultiTenantData();
