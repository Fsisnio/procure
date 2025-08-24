export interface Supplier {
  id: string;
  tenantId: string; // Pour l'isolation multi-tenant
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  category: string;
  status: 'active' | 'inactive' | 'pending';
  rating: number;
  contactPerson: string;
  website?: string;
  taxId?: string;
  registrationDate: Date;
  lastContactDate?: Date;
  notes?: string;
}

export interface Product {
  id: string;
  tenantId: string; // Pour l'isolation multi-tenant
  name: string;
  description: string;
  category: string;
  unit: string;
  price: number;
  currency: string; // Devise d'achat
  supplierId: string;
  supplierName: string;
  stockQuantity: number;
  minStockLevel: number;
  status: 'available' | 'out_of_stock' | 'discontinued';
  createdAt: Date;
}

export interface Order {
  id: string;
  tenantId: string; // Pour l'isolation multi-tenant
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: OrderItem[];
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DashboardStats {
  totalSuppliers: number;
  activeSuppliers: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  monthlySpending: number;
  topSuppliers: Supplier[];
}

// Multi-tenant types
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  companyName: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  logo?: string;
  status: 'active' | 'inactive' | 'suspended';
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  maxUsers: number;
  maxSuppliers: number;
  maxProducts: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string; // Mot de passe hashé
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
  tenantId: string;
  isSystemRole: boolean;
  createdAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  description: string;
}

export interface AuthContext {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (roleName: string) => boolean;
}

// System roles
export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super_admin',
  TENANT_ADMIN: 'tenant_admin',
  USER: 'user',
  VIEWER: 'viewer',
} as const;

// Default permissions
export const DEFAULT_PERMISSIONS = {
  // Supplier permissions
  SUPPLIER_CREATE: 'supplier:create',
  SUPPLIER_READ: 'supplier:read',
  SUPPLIER_UPDATE: 'supplier:update',
  SUPPLIER_DELETE: 'supplier:delete',
  SUPPLIER_MANAGE: 'supplier:manage',
  
  // Product permissions
  PRODUCT_CREATE: 'product:create',
  PRODUCT_READ: 'product:read',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',
  PRODUCT_MANAGE: 'product:manage',
  
  // Order permissions
  ORDER_CREATE: 'order:create',
  ORDER_READ: 'order:read',
  ORDER_UPDATE: 'order:update',
  ORDER_DELETE: 'order:delete',
  ORDER_MANAGE: 'order:manage',
  
  // User management permissions
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE: 'user:manage',
  
  // Tenant management permissions (super admin only)
  TENANT_CREATE: 'tenant:create',
  TENANT_READ: 'tenant:read',
  TENANT_UPDATE: 'tenant:update',
  TENANT_DELETE: 'tenant:delete',
  TENANT_MANAGE: 'tenant:manage',
} as const; 