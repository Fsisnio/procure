import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import SuppliersList from './components/Suppliers/SuppliersList';
import ProductsList from './components/Products/ProductsList';
import OrdersList from './components/Orders/OrdersList';
import PurchaseOrderPage from './components/Orders/PurchaseOrderPage';
import Home from './components/Home/Home';
import LoginPage from './components/Auth/LoginPage';
import TenantManagement from './components/SuperAdmin/TenantManagement';
import UserManagement from './components/Admin/UserManagement';
import Onboarding from './components/Onboarding/Onboarding';

// Import to initialize demo data
import { initializeMultiTenantData } from './utils/initMultiTenantData';

// Initialize demo data on app startup
initializeMultiTenantData();

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

function AppRoutes() {
  const { isAuthenticated, user, hasRole } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/suppliers" element={<SuppliersList />} />
          <Route path="/products" element={<ProductsList />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/purchase-order" element={<PurchaseOrderPage />} />
          
          {/* Super Admin Routes */}
          {hasRole('super_admin') && (
            <Route path="/admin/tenants" element={<TenantManagement />} />
          )}
          
          {/* Admin Routes */}
          {hasRole('tenant_admin') && (
            <Route path="/admin/users" element={<UserManagement />} />
          )}
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App; 