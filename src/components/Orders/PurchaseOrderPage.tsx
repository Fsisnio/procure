import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Add,
  ShoppingCart,
  PictureAsPdf,
  Business,
  Inventory,
  TrendingUp,
  History,
} from '@mui/icons-material';
import PurchaseOrderGenerator from './PurchaseOrderGenerator';
import ExportHistoryDialog from './ExportHistoryDialog';
import { mockSuppliers, mockProducts, mockOrders } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';

const PurchaseOrderPage: React.FC = () => {
  const { tenant, user } = useAuth();
  const [openGenerator, setOpenGenerator] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Initialiser les données si elles n'existent pas
  useEffect(() => {
    const initializeData = () => {
      const existingSuppliers = localStorage.getItem('suppliers');
      const existingProducts = localStorage.getItem('products');
      const existingOrders = localStorage.getItem('orders');

      // Super admin peut initialiser toutes les données
      if (user?.role?.name === 'super_admin') {
        if (!existingSuppliers) {
          localStorage.setItem('suppliers', JSON.stringify(mockSuppliers));
        }
        
        if (!existingProducts) {
          localStorage.setItem('products', JSON.stringify(mockProducts));
        }
        
        if (!existingOrders) {
          localStorage.setItem('orders', JSON.stringify(mockOrders));
        }
      } else {
        // Pour les tenants, ne pas initialiser les données mockées
        // Ils commencent avec des pages vides
        console.log(`Tenant ${tenant?.id} will start with empty pages`);
      }

      setIsDataLoaded(true);
    };

    initializeData();
  }, [user?.role?.name, tenant?.id]);

  // Lire les données depuis localStorage pour les statistiques avec filtrage par tenant
  const getTenantFilteredData = () => {
    const savedSuppliers = localStorage.getItem('suppliers');
    const savedProducts = localStorage.getItem('products');
    const savedOrders = localStorage.getItem('orders');
    
    const allSuppliers = savedSuppliers ? JSON.parse(savedSuppliers) : [];
    const allProducts = savedProducts ? JSON.parse(savedProducts) : [];
    const allOrders = savedOrders ? JSON.parse(savedOrders) : [];
    
    // Super admin peut voir toutes les données
    if (user?.role?.name === 'super_admin') {
      return { suppliers: allSuppliers, products: allProducts, orders: allOrders };
    }
    
    // Les utilisateurs de tenant ne voient que leurs données
    const tenantSuppliers = allSuppliers.filter((supplier: any) => supplier.tenantId === tenant?.id);
    const tenantProducts = allProducts.filter((product: any) => product.tenantId === tenant?.id);
    const tenantOrders = allOrders.filter((order: any) => order.tenantId === tenant?.id);
    
    return { suppliers: tenantSuppliers, products: tenantProducts, orders: tenantOrders };
  };

  const { suppliers, products, orders } = getTenantFilteredData();

  // Statistiques
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const activeSuppliers = suppliers.filter((s: any) => s.status === 'active').length;
  
  // Calculer le taux de réussite en fonction des données réelles
  const calculateSuccessRate = () => {
    if (totalOrders === 0) {
      return 'N/A'; // Pas de commandes = pas de taux
    }
    
    // Compter les commandes avec statut 'delivered' ou 'shipped' comme réussies
    const successfulOrders = orders.filter((order: any) => 
      order.status === 'delivered' || order.status === 'shipped'
    ).length;
    
    if (successfulOrders === 0) {
      return '0%'; // Aucune commande réussie
    }
    
    const successRate = Math.round((successfulOrders / totalOrders) * 100);
    return `${successRate}%`;
  };

  const quickStats = [
    {
      title: 'Fournisseurs Actifs',
      value: activeSuppliers,
      icon: <Business color="primary" />,
      color: '#1976d2',
    },
    {
      title: 'Produits Disponibles',
      value: totalProducts,
      icon: <Inventory color="success" />,
      color: '#2e7d32',
    },
    {
      title: 'Commandes Totales',
      value: totalOrders,
      icon: <ShoppingCart color="warning" />,
      color: '#ed6c02',
    },
    {
      title: 'Taux de Réussite',
      value: calculateSuccessRate(),
      icon: <TrendingUp color="success" />,
      color: totalOrders === 0 ? '#666' : '#2e7d32', // Gris si pas de données
    },
  ];

  const features = [
    {
      title: 'Sélection Multiple de Produits',
      description: 'Ajoutez plusieurs produits à votre bon de commande en une seule fois',
      icon: <Add color="primary" />,
    },
    {
      title: 'Gestion des Fournisseurs',
      description: 'Sélectionnez le fournisseur approprié pour chaque produit',
      icon: <Business color="primary" />,
    },
    {
      title: 'Calculs Automatiques',
      description: 'Les totaux et sous-totaux sont calculés automatiquement',
      icon: <TrendingUp color="primary" />,
    },
    {
      title: 'Export Multi-Formats',
      description: 'Exportez en PDF, Excel ou Word avec personnalisation avancée',
      icon: <PictureAsPdf color="primary" />,
    },
  ];

  return (
    <Box sx={{ 
      width: '100%', 
      px: { xs: 0, md: 2 }, 
      py: 4, 
      backgroundColor: '#fafbfc', 
      minHeight: '80vh' 
    }}>
      {!isDataLoaded ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh' 
        }}>
          <Typography variant="h6" sx={{ color: '#666' }}>
            Chargement des données...
          </Typography>
        </Box>
      ) : (
        <>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2, color: '#1a202c' }}>
              Générateur de Bons de Commande
            </Typography>
            <Typography variant="h6" sx={{ color: '#64748b', mb: 3 }}>
              Créez des bons de commande professionnels pour vos fournisseurs
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => setOpenGenerator(true)}
                sx={{ 
                  borderRadius: 2, 
                  py: 1.5, 
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                Créer un Bon de Commande
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<History />}
                onClick={() => setOpenHistory(true)}
                sx={{ 
                  borderRadius: 2, 
                  py: 1.5, 
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                Historique des Exports
              </Button>
            </Box>
          </Box>

          {/* Statistiques rapides */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {quickStats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: 3, 
                  boxShadow: 2,
                  background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                  border: `1px solid ${stat.color}30`
                }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mb: 2,
                      '& .MuiSvgIcon-root': { fontSize: 40 }
                    }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: stat.color }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                      {stat.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Fonctionnalités */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center', color: '#1a202c' }}>
              Fonctionnalités Principales
            </Typography>
            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper sx={{ 
                    p: 3, 
                    height: '100%', 
                    borderRadius: 3, 
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      borderColor: '#1976d2'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        backgroundColor: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {feature.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#1a202c' }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Guide d'utilisation */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center', color: '#1a202c' }}>
              Comment Utiliser le Générateur
            </Typography>
            <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <List>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 50 }}>
                    <Chip label="1" color="primary" size="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Sélectionnez un fournisseur"
                    secondary="Choisissez le fournisseur pour lequel vous souhaitez créer le bon de commande"
                  />
                </ListItem>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 50 }}>
                    <Chip label="2" color="primary" size="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Ajoutez des produits"
                    secondary="Sélectionnez les produits et spécifiez les quantités souhaitées"
                  />
                </ListItem>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 50 }}>
                    <Chip label="3" color="primary" size="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Personnalisez la commande"
                    secondary="Ajoutez des notes et ajustez les dates de livraison si nécessaire"
                  />
                </ListItem>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 50 }}>
                    <Chip label="4" color="primary" size="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Exportez le bon de commande"
                    secondary="Choisissez le format (PDF, Excel, Word) et personnalisez l'apparence"
                  />
                </ListItem>
              </List>
            </Paper>
          </Box>
        </>
      )}

      {/* Générateur de bon de commande */}
      <PurchaseOrderGenerator
        open={openGenerator}
        onClose={() => setOpenGenerator(false)}
      />

      {/* Historique des exports */}
      <ExportHistoryDialog
        open={openHistory}
        onClose={() => setOpenHistory(false)}
      />
    </Box>
  );
};

export default PurchaseOrderPage; 