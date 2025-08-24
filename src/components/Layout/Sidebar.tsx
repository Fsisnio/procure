import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Button,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Business,
  ShoppingCart,
  Inventory,
  Home,
  Search,
  Logout,
  Person,
  TrendingUp,
  FileDownload,
  AdminPanelSettings,
  People,
  Security,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SYSTEM_ROLES } from '../../types';

const drawerWidth = 280; // Largeur augmentée pour accommoder les nouveaux éléments

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const { user, tenant, logout, hasRole } = useAuth();

  const menuItems = [
    { text: 'Accueil', icon: <Home />, path: '/' },
    { text: 'Dashboard', icon: <TrendingUp />, path: '/dashboard' },
    { text: 'Fournisseurs', icon: <Business />, path: '/suppliers' },
    { text: 'Produits', icon: <Inventory />, path: '/products' },
    { text: 'Commandes', icon: <ShoppingCart />, path: '/orders' },
    { text: 'Bon de Commande', icon: <FileDownload />, path: '/purchase-order' },
  ];

  // Admin menu items
  const adminMenuItems = [
    { text: 'Gestion des Utilisateurs', icon: <People />, path: '/admin/users' },
  ];

  // Super admin menu items
  const superAdminMenuItems = [
    { text: 'Gestion des Tenants', icon: <AdminPanelSettings />, path: '/admin/tenants' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e0e0e0',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        },
      }}
    >
      {/* Header Section */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f8fafc'
      }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 0.5 }}>
            ProcureX
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
            Supplier Management
          </Typography>
        </Box>
        
        {/* User Welcome */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          p: 2,
          backgroundColor: '#ffffff',
          borderRadius: 2,
          border: '1px solid #e0e0e0'
        }}>
          <Avatar sx={{ 
            bgcolor: '#1976d2', 
            width: 40, 
            height: 40, 
            mr: 2,
            fontSize: '1rem'
          }}>
            <Person />
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
              Welcome back
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Admin
            </Typography>
          </Box>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#666', fontSize: '1.2rem' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#ffffff',
              borderRadius: 2,
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                },
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                },
              },
            },
          }}
        />
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ pt: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 2,
                  height: 48,
                  '&.Mui-selected': {
                    backgroundColor: '#e3f2fd',
                    '&:hover': {
                      backgroundColor: '#e3f2fd',
                    },
                  },
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? '#1976d2' : '#666',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: location.pathname === item.path ? 600 : 500,
                      color: location.pathname === item.path ? '#1976d2' : '#333',
                      fontSize: '0.95rem',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          {/* Admin Menu Items */}
          {hasRole(SYSTEM_ROLES.TENANT_ADMIN) && (
            <>
              <Divider sx={{ my: 2, mx: 2 }} />
              <ListItem disablePadding>
                <ListItemText
                  primary="Administration"
                  sx={{
                    px: 3,
                    '& .MuiListItemText-primary': {
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    },
                  }}
                />
              </ListItem>
              {adminMenuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    selected={location.pathname === item.path}
                    sx={{
                      mx: 1,
                      mb: 0.5,
                      borderRadius: 2,
                      height: 48,
                      '&.Mui-selected': {
                        backgroundColor: '#e3f2fd',
                        '&:hover': {
                          backgroundColor: '#e3f2fd',
                        },
                      },
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: location.pathname === item.path ? '#1976d2' : '#666',
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: location.pathname === item.path ? 600 : 500,
                          color: location.pathname === item.path ? '#1976d2' : '#333',
                          fontSize: '0.95rem',
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </>
          )}

          {/* Super Admin Menu Items */}
          {hasRole(SYSTEM_ROLES.SUPER_ADMIN) && (
            <>
              <Divider sx={{ my: 2, mx: 2 }} />
              <ListItem disablePadding>
                <ListItemText
                  primary="Super Administration"
                  sx={{
                    px: 3,
                    '& .MuiListItemText-primary': {
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    },
                  }}
                />
              </ListItem>
              {superAdminMenuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    selected={location.pathname === item.path}
                    sx={{
                      mx: 1,
                      mb: 0.5,
                      borderRadius: 2,
                      height: 48,
                      '&.Mui-selected': {
                        backgroundColor: '#e3f2fd',
                        '&:hover': {
                          backgroundColor: '#e3f2fd',
                        },
                      },
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: location.pathname === item.path ? '#1976d2' : '#666',
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: location.pathname === item.path ? 600 : 500,
                          color: location.pathname === item.path ? '#1976d2' : '#333',
                          fontSize: '0.95rem',
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </>
          )}
        </List>
      </Box>

      {/* Footer with Logout */}
      <Box sx={{ 
        p: 3, 
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#f8fafc'
      }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            borderColor: '#e0e0e0',
            color: '#666',
            py: 1.5,
            fontSize: '0.9rem',
            fontWeight: 500,
            '&:hover': {
              borderColor: '#d32f2f',
              color: '#d32f2f',
              backgroundColor: '#fff5f5',
            },
          }}
        >
          Déconnexion
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 