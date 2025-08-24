import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Tenant, UserRole, AuthContext as AuthContextType, SYSTEM_ROLES, DEFAULT_PERMISSIONS } from '../types';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const storedTenant = localStorage.getItem('currentTenant');
    
    if (storedUser && storedTenant) {
      try {
        const userData = JSON.parse(storedUser);
        const tenantData = JSON.parse(storedTenant);
        
        // Check if the stored data is still valid
        if (userData && tenantData && userData.status === 'active' && tenantData.status === 'active') {
          setUser(userData);
          setTenant(tenantData);
          setIsAuthenticated(true);
        } else {
          // Clear invalid data
          localStorage.removeItem('currentUser');
          localStorage.removeItem('currentTenant');
        }
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentTenant');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Email:', email);
      console.log('Password:', password);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication logic
      const mockUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const mockTenants = JSON.parse(localStorage.getItem('tenants') || '[]');
      
      console.log('Mock users from localStorage:', mockUsers);
      console.log('Mock tenants from localStorage:', mockTenants);
      
      const foundUser = mockUsers.find((u: User) => u.email === email);
      console.log('Found user:', foundUser);
      
      if (!foundUser) {
        console.log('User not found');
        throw new Error('Invalid credentials');
      }
      
      // Verify password (in a real app, you would hash and compare passwords)
      console.log('Comparing passwords:');
      console.log('Input password:', password);
      console.log('Stored password:', foundUser.password);
      console.log('Passwords match:', foundUser.password === password);
      
      if (foundUser.password !== password) {
        console.log('Password mismatch');
        throw new Error('Invalid credentials');
      }
      
      // Find tenant (for system users, tenantId is 'system')
      let foundTenant = null;
      if (foundUser.tenantId === 'system') {
        // System users don't have a specific tenant
        foundTenant = {
          id: 'system',
          name: 'system',
          domain: 'procurex.com',
          companyName: 'ProcureX System',
          status: 'active'
        } as Tenant;
      } else {
        foundTenant = mockTenants.find((t: Tenant) => t.id === foundUser.tenantId);
      }
      
      console.log('Found tenant:', foundTenant);
      
      if (!foundTenant || foundTenant.status !== 'active') {
        console.log('Tenant not found or inactive');
        throw new Error('Account is not active');
      }
      
      if (foundUser.status !== 'active') {
        console.log('User not active');
        throw new Error('Account is not active');
      }
      
      console.log('Login successful!');
      
      // Update last login
      foundUser.lastLoginAt = new Date();
      localStorage.setItem('users', JSON.stringify(mockUsers));
      
      // Set auth state
      setUser(foundUser);
      setTenant(foundTenant);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      localStorage.setItem('currentTenant', JSON.stringify(foundTenant));
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setTenant(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentTenant');
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user || !user.role) return false;
    
    // Super admin has all permissions
    if (user.role.name === SYSTEM_ROLES.SUPER_ADMIN) return true;
    
    // Check if user has the specific permission
    return user.role.permissions.some(
      permission => permission.resource === resource && permission.action === action
    );
  };

  const hasRole = (roleName: string): boolean => {
    if (!user || !user.role) return false;
    return user.role.name === roleName;
  };

  const value: AuthContextType = {
    user,
    tenant,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
