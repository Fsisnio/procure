import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Typography, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallback,
}) => {
  const { user, tenant, isAuthenticated, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isAuthenticated === undefined) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user || !tenant) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required roles
  if (requiredRoles.length > 0 && !requiredRoles.some(role => hasRole(role))) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Accès Refusé
        </Typography>
        <Typography variant="body1">
          Vous n'avez pas les droits nécessaires pour accéder à cette page.
        </Typography>
      </Box>
    );
  }

  // Check if user has required permissions
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => {
      const [resource, action] = permission.split(':');
      return hasPermission(resource, action);
    });

    if (!hasAllPermissions) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Permissions Insuffisantes
          </Typography>
          <Typography variant="body1">
            Vous n'avez pas les permissions nécessaires pour accéder à cette fonctionnalité.
          </Typography>
        </Box>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
