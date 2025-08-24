import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Business,
  Inventory,
  ShoppingCart,
  TrendingUp,
  People,
  Dashboard,
  Assessment,
  ArrowForward,
  CheckCircle,
  Star,
  TrendingDown,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { tenant, user } = useAuth();
  const [activitiesVersion, setActivitiesVersion] = useState(0);

  // Écouter les changements dans localStorage pour mettre à jour les activités
  useEffect(() => {
    const handleStorageChange = () => {
      setActivitiesVersion(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Écouter les changements locaux (pour le même onglet)
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, [key, value]);
      if (key === 'orders' || key === 'suppliers' || key === 'products') {
        handleStorageChange();
      }
    };

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  const quickActions = [
    {
      title: 'Gestion des Fournisseurs',
      description: 'Ajoutez, modifiez et gérez vos fournisseurs',
      icon: <Business sx={{ fontSize: 40, color: '#1976d2' }} />,
      path: '/suppliers',
      color: '#1976d2',
    },
    {
      title: 'Gestion des Produits',
      description: 'Gérez votre inventaire et vos produits',
      icon: <Inventory sx={{ fontSize: 40, color: '#2e7d32' }} />,
      path: '/products',
      color: '#2e7d32',
    },
    {
      title: 'Gestion des Commandes',
      description: 'Suivez et gérez vos commandes',
      icon: <ShoppingCart sx={{ fontSize: 40, color: '#ed6c02' }} />,
      path: '/orders',
      color: '#ed6c02',
    },
    {
      title: 'Tableau de Bord',
      description: 'Vue d\'ensemble de vos activités',
      icon: <Dashboard sx={{ fontSize: 40, color: '#9c27b0' }} />,
      path: '/dashboard',
      color: '#9c27b0',
    },
  ];

  // Générer des statistiques dynamiques basées sur les données réelles
  const generateDynamicStats = () => {
    // Lire les données depuis localStorage
    const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Filtrer par tenant selon l'utilisateur connecté
    let filteredSuppliers, filteredProducts, filteredOrders;
    
    if (user?.role?.name === 'super_admin') {
      // Super admin voit toutes les données
      filteredSuppliers = suppliers;
      filteredProducts = products;
      filteredOrders = orders;
    } else if (tenant?.id) {
      // Utilisateur de tenant ne voit que ses données
      filteredSuppliers = suppliers.filter((s: any) => s.tenantId === tenant.id);
      filteredProducts = products.filter((p: any) => p.tenantId === tenant.id);
      filteredOrders = orders.filter((o: any) => o.tenantId === tenant.id);
    } else {
      // Pas de tenant, données vides
      filteredSuppliers = [];
      filteredProducts = [];
      filteredOrders = [];
    }
    
    // Calculer les statistiques réelles
    const activeSuppliers = filteredSuppliers.filter((s: any) => s.status === 'active').length;
    const totalProducts = filteredProducts.length;
    const productsInStock = filteredProducts.filter((p: any) => 
      p.stockQuantity !== undefined && p.stockQuantity > 0
    ).length;
    
    // Commandes du mois en cours
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const ordersThisMonth = filteredOrders.filter((o: any) => {
      const orderDate = new Date(o.orderDate);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    }).length;
    
    // Calculer le chiffre d'affaires (basé sur les commandes livrées)
    const deliveredOrders = filteredOrders.filter((o: any) => o.status === 'delivered');
    const totalRevenue = deliveredOrders.reduce((sum: number, order: any) => {
      if (order.total && typeof order.total === 'number') {
        return sum + order.total;
      }
      return sum;
    }, 0);
    
    // Calculer les tendances (comparaison avec le mois précédent)
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const ordersPreviousMonth = filteredOrders.filter((o: any) => {
      const orderDate = new Date(o.orderDate);
      return orderDate.getMonth() === previousMonth && orderDate.getFullYear() === previousYear;
    }).length;
    
    const previousMonthRevenue = filteredOrders
      .filter((o: any) => {
        const orderDate = new Date(o.orderDate);
        return orderDate.getMonth() === previousMonth && orderDate.getFullYear() === previousYear && o.status === 'delivered';
      })
      .reduce((sum: number, order: any) => {
        if (order.total && typeof order.total === 'number') {
          return sum + order.total;
        }
        return sum;
      }, 0);
    
    // Calculer les pourcentages de changement
    const ordersChange = ordersPreviousMonth > 0 
      ? Math.round(((ordersThisMonth - ordersPreviousMonth) / ordersPreviousMonth) * 100)
      : ordersThisMonth > 0 ? 100 : 0;
    
    const revenueChange = previousMonthRevenue > 0 
      ? Math.round(((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
      : totalRevenue > 0 ? 100 : 0;
    
    return [
      {
        label: 'Fournisseurs Actifs',
        value: activeSuppliers.toString(),
        icon: <People sx={{ fontSize: 30, color: '#1976d2' }} />,
        trend: activeSuppliers > 0 ? `+${activeSuppliers}` : '0',
        trendColor: activeSuppliers > 0 ? '#2e7d32' : '#666',
        subtitle: `${filteredSuppliers.length} total`,
      },
      {
        label: 'Produits en Stock',
        value: productsInStock.toString(),
        icon: <Inventory sx={{ fontSize: 30, color: '#2e7d32' }} />,
        trend: totalProducts > 0 ? `+${totalProducts - productsInStock}` : '0',
        trendColor: totalProducts > 0 ? '#2e7d32' : '#666',
        subtitle: `${totalProducts} total`,
      },
      {
        label: 'Commandes du Mois',
        value: ordersThisMonth.toString(),
        icon: <ShoppingCart sx={{ fontSize: 30, color: '#ed6c02' }} />,
        trend: ordersChange > 0 ? `+${ordersChange}%` : ordersChange < 0 ? `${ordersChange}%` : '0%',
        trendColor: ordersChange > 0 ? '#2e7d32' : ordersChange < 0 ? '#d32f2f' : '#666',
        subtitle: `${filteredOrders.length} total`,
      },
      {
        label: 'Chiffre d\'Affaires',
        value: totalRevenue > 0 ? `$${totalRevenue.toLocaleString('fr-FR')}` : '$0',
        icon: <TrendingUp sx={{ fontSize: 30, color: '#2e7d32' }} />,
        trend: revenueChange > 0 ? `+${revenueChange}%` : revenueChange < 0 ? `${revenueChange}%` : '0%',
        trendColor: revenueChange > 0 ? '#2e7d32' : revenueChange < 0 ? '#d32f2f' : '#666',
        subtitle: 'Ce mois',
      },
    ];
  };

  const stats = generateDynamicStats();
  
  // Vérifier si l'utilisateur a des données à afficher
  const hasData = stats.some(stat => {
    const value = parseInt(stat.value.replace(/[^0-9]/g, ''));
    return value > 0;
  });

  // Générer des activités récentes dynamiques basées sur les données réelles
  const generateRecentActivities = () => {
    const activities = [];
    const now = new Date();
    
    // Lire les données depuis localStorage
    const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Filtrer par tenant selon l'utilisateur connecté
    let filteredSuppliers, filteredProducts, filteredOrders;
    
    if (user?.role?.name === 'super_admin') {
      // Super admin voit toutes les données
      filteredSuppliers = suppliers;
      filteredProducts = products;
      filteredOrders = orders;
    } else if (tenant?.id) {
      // Utilisateur de tenant ne voit que ses données
      filteredSuppliers = suppliers.filter((s: any) => s.tenantId === tenant.id);
      filteredProducts = products.filter((p: any) => p.tenantId === tenant.id);
      filteredOrders = orders.filter((o: any) => o.tenantId === tenant.id);
    } else {
      // Pas de tenant, données vides
      filteredSuppliers = [];
      filteredProducts = [];
      filteredOrders = [];
    }
    
    // Ajouter des activités basées sur les fournisseurs récents
    if (suppliers.length > 0) {
      const recentSupplier = suppliers[0]; // Le plus récent
      const supplierDate = new Date(recentSupplier.registrationDate);
      const hoursAgo = Math.floor((now.getTime() - supplierDate.getTime()) / (1000 * 60 * 60));
      
      if (hoursAgo < 24) {
        activities.push({
          action: 'Nouveau fournisseur ajouté',
          description: `${recentSupplier.name} a été ajouté à la base de données`,
          time: hoursAgo < 1 ? 'À l\'instant' : `Il y a ${hoursAgo} heure${hoursAgo > 1 ? 's' : ''}`,
          type: 'supplier',
          timestamp: supplierDate.getTime()
        });
      }
    }
    
    // Ajouter des activités basées sur les commandes récentes
    if (orders.length > 0) {
      const recentOrders = orders
        .sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
        .slice(0, 3);
      
      recentOrders.forEach((order: any) => {
        const orderDate = new Date(order.orderDate);
        const hoursAgo = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60));
        
        if (hoursAgo < 48) { // Commandes des 2 derniers jours
          let action = '';
          let description = '';
          
          switch (order.status) {
            case 'confirmed':
              action = 'Commande confirmée';
              description = `Commande #${order.orderNumber} confirmée pour ${order.supplierName}`;
              break;
            case 'shipped':
              action = 'Commande expédiée';
              description = `Commande #${order.orderNumber} expédiée par ${order.supplierName}`;
              break;
            case 'delivered':
              action = 'Commande livrée';
              description = `Commande #${order.orderNumber} livrée par ${order.supplierName}`;
              break;
            case 'pending':
              action = 'Nouvelle commande';
              description = `Commande #${order.orderNumber} créée pour ${order.supplierName}`;
              break;
            default:
              action = 'Commande mise à jour';
              description = `Statut de la commande #${order.orderNumber} mis à jour`;
          }
          
          activities.push({
            action,
            description,
            time: hoursAgo < 1 ? 'À l\'instant' : `Il y a ${hoursAgo} heure${hoursAgo > 1 ? 's' : ''}`,
            type: 'order',
            timestamp: orderDate.getTime()
          });
        }
      });
    }
    
    // Ajouter des activités basées sur les produits en stock faible
    const lowStockProducts = products.filter((p: any) => 
      p.stockQuantity !== undefined && 
      p.minStockLevel !== undefined && 
      p.stockQuantity <= p.minStockLevel
    );
    
    if (lowStockProducts.length > 0) {
      const lowStockProduct = lowStockProducts[0];
      activities.push({
        action: 'Stock faible détecté',
        description: `Produit "${lowStockProduct.name}" en stock faible (${lowStockProduct.stockQuantity}/${lowStockProduct.minStockLevel})`,
        time: 'À surveiller',
        type: 'product',
        timestamp: now.getTime() - 1000 * 60 * 60 // 1 heure ago
      });
    }
    
    // Ajouter des activités basées sur les nouveaux produits
    if (products.length > 0) {
      const recentProduct = products[0]; // Le plus récent
      const productDate = new Date(recentProduct.createdAt);
      const hoursAgo = Math.floor((now.getTime() - productDate.getTime()) / (1000 * 60 * 60));
      
      if (hoursAgo < 24) {
        activities.push({
          action: 'Nouveau produit ajouté',
          description: `Produit "${recentProduct.name}" ajouté à l'inventaire`,
          time: hoursAgo < 1 ? 'À l\'instant' : `Il y a ${hoursAgo} heure${hoursAgo > 1 ? 's' : ''}`,
          type: 'product',
          timestamp: productDate.getTime()
        });
      }
    }
    
    // Ajouter une activité de rapport si des exports ont été effectués
    const lastExport = localStorage.getItem('lastExport');
    if (lastExport) {
      const exportDate = new Date(lastExport);
      const hoursAgo = Math.floor((now.getTime() - exportDate.getTime()) / (1000 * 60 * 60));
      
      if (hoursAgo < 24) {
        activities.push({
          action: 'Rapport généré',
          description: 'Rapport des données exporté en PDF/CSV',
          time: hoursAgo < 1 ? 'À l\'instant' : `Il y a ${hoursAgo} heure${hoursAgo > 1 ? 's' : ''}`,
          type: 'report',
          timestamp: exportDate.getTime()
        });
      }
    }
    
    // Si pas assez d'activités, ajouter des activités par défaut
    if (activities.length < 3) {
      activities.push({
        action: 'Système opérationnel',
        description: 'Toutes les fonctionnalités sont disponibles et fonctionnelles',
        time: 'Maintenant',
        type: 'system',
        timestamp: now.getTime()
      });
    }
    
    // Trier par timestamp et prendre les 4 plus récentes
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 4);
  };

  const recentActivities = generateRecentActivities();

  // Régénérer les activités et statistiques quand activitiesVersion change
  useEffect(() => {
    // Cette fonction sera appelée à chaque changement de activitiesVersion
    // Les statistiques et activités seront automatiquement mises à jour
  }, [activitiesVersion]);

  // Mettre à jour les statistiques quand les données changent
  useEffect(() => {
    const handleDataChange = () => {
      setActivitiesVersion(prev => prev + 1);
    };

    // Écouter les changements dans localStorage
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, [key, value]);
      if (key === 'orders' || key === 'suppliers' || key === 'products') {
        handleDataChange();
      }
    };

    return () => {
      localStorage.setItem = originalSetItem;
    };
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'supplier':
        return <Business color="primary" />;
      case 'order':
        return <ShoppingCart color="warning" />;
      case 'product':
        return <Inventory color="success" />;
      case 'report':
        return <Assessment color="info" />;
      case 'system':
        return <CheckCircle color="success" />;
      default:
        return <CheckCircle color="primary" />;
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      pt: 4, // Espacement réduit sans header
      pb: 6,
      px: { xs: 2, md: 4 }
    }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ 
          mb: 6, 
          textAlign: 'center',
          pt: 2,
          pb: 4
        }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 'bold', 
              color: '#1a202c',
              mb: 3,
              fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
              lineHeight: 1.2,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {tenant?.companyName ? `Bienvenue chez ${tenant.companyName}` : 'Bienvenue sur ProcureX'}
          </Typography>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: '600', 
              color: '#2c3e50',
              mb: 3,
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }
            }}
          >
            {tenant?.companyName ? 'Gestion des Fournisseurs' : 'Supplier Management'}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#64748b',
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.7,
              fontSize: { xs: '1rem', md: '1.1rem' }
            }}
          >
            {tenant?.companyName 
              ? `Gérez efficacement vos fournisseurs, produits et commandes avec notre plateforme 
                 intuitive et complète de gestion des relations fournisseurs.`
              : `Gérez efficacement vos fournisseurs, produits et commandes avec notre plateforme 
                 intuitive et complète de gestion des relations fournisseurs.`
            }
          </Typography>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              color: '#1a202c',
              textAlign: 'center',
              fontSize: { xs: '1.8rem', md: '2.2rem' }
            }}
          >
            Actions Rapides
          </Typography>
          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      borderColor: action.color,
                    }
                  }}
                  onClick={() => navigate(action.path)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      {action.icon}
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 'bold', 
                        mb: 2,
                        color: '#1a202c',
                        fontSize: { xs: '1.1rem', md: '1.2rem' }
                      }}
                    >
                      {action.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#64748b',
                        mb: 2,
                        lineHeight: 1.6,
                        fontSize: { xs: '0.9rem', md: '1rem' }
                      }}
                    >
                      {action.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 2, px: 3 }}>
                    <Button 
                      variant="outlined" 
                      endIcon={<ArrowForward />}
                      size="large"
                      sx={{ 
                        borderColor: action.color,
                        color: action.color,
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: action.color,
                          backgroundColor: `${action.color}10`,
                          transform: 'scale(1.05)',
                        }
                      }}
                    >
                      Accéder
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Statistics */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              color: '#1a202c',
              textAlign: 'center',
              fontSize: { xs: '1.8rem', md: '2.2rem' }
            }}
          >
            Statistiques en Temps Réel
            {tenant?.companyName && (
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#64748b',
                  fontWeight: 'normal',
                  mt: 1,
                  fontSize: { xs: '1rem', md: '1.1rem' }
                }}
              >
                Données spécifiques à {tenant.companyName}
              </Typography>
            )}
          </Typography>
          {!hasData && tenant?.companyName ? (
            <Paper sx={{ 
              p: 4, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              border: '1px solid #cbd5e1',
              borderRadius: 3
            }}>
              <Inventory sx={{ fontSize: 64, color: '#64748b', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#475569' }}>
                Aucune donnée disponible
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', mb: 3, maxWidth: '600px', mx: 'auto' }}>
                {tenant.companyName} n'a pas encore de données dans le système. 
                Commencez par ajouter des fournisseurs, des produits et des commandes pour voir vos statistiques.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Business />}
                  onClick={() => navigate('/suppliers')}
                  sx={{ borderRadius: 2, py: 1.5, px: 3 }}
                >
                  Ajouter un Fournisseur
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Inventory />}
                  onClick={() => navigate('/products')}
                  sx={{ borderRadius: 2, py: 1.5, px: 3 }}
                >
                  Ajouter un Produit
                </Button>
              </Box>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper 
                    sx={{ 
                      p: 3,
                      textAlign: 'center',
                      height: '100%',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      border: '1px solid #e2e8f0',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      {stat.icon}
                    </Box>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 'bold', 
                        mb: 2,
                        color: '#1a202c',
                        fontSize: { xs: '2rem', md: '2.5rem' }
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#64748b',
                        mb: 1,
                        fontSize: { xs: '0.9rem', md: '1rem' },
                        fontWeight: 500
                      }}
                    >
                      {stat.label}
                    </Typography>
                    {stat.subtitle && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#94a3b8',
                          mb: 2,
                          fontSize: '0.8rem',
                          display: 'block'
                        }}
                      >
                        {stat.subtitle}
                      </Typography>
                    )}
                    <Chip
                      label={stat.trend}
                      size="medium"
                      sx={{
                        backgroundColor: stat.trendColor,
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        height: '32px'
                      }}
                      icon={stat.trend.startsWith('+') ? <TrendingUp /> : <TrendingDown />}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Alertes et Notifications */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              color: '#1a202c',
              textAlign: 'center',
              fontSize: { xs: '1.8rem', md: '2.2rem' }
            }}
          >
            Alertes et Notifications
          </Typography>
          <Paper sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
            borderRadius: 3,
            border: '1px solid #ffc107'
          }}>
            <Grid container spacing={2}>
              {(() => {
                const alerts = [];
                const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
                const products = JSON.parse(localStorage.getItem('products') || '[]');
                const orders = JSON.parse(localStorage.getItem('orders') || '[]');
                
                // Filtrer par tenant selon l'utilisateur connecté
                let filteredSuppliers, filteredProducts, filteredOrders;
                
                if (user?.role?.name === 'super_admin') {
                  // Super admin voit toutes les données
                  filteredSuppliers = suppliers;
                  filteredProducts = products;
                  filteredOrders = orders;
                } else if (tenant?.id) {
                  // Utilisateur de tenant ne voit que ses données
                  filteredSuppliers = suppliers.filter((s: any) => s.tenantId === tenant.id);
                  filteredProducts = products.filter((p: any) => p.tenantId === tenant.id);
                  filteredOrders = orders.filter((o: any) => o.tenantId === tenant.id);
                } else {
                  // Pas de tenant, données vides
                  filteredSuppliers = [];
                  filteredProducts = [];
                  filteredOrders = [];
                }
                
                // Alertes de stock faible
                const lowStockProducts = filteredProducts.filter((p: any) => 
                  p.stockQuantity !== undefined && 
                  p.minStockLevel !== undefined && 
                  p.stockQuantity <= p.minStockLevel
                );
                
                if (lowStockProducts.length > 0) {
                  alerts.push({
                    type: 'warning',
                    title: 'Stock Faible',
                    message: `${lowStockProducts.length} produit(s) en stock faible`,
                    icon: <Inventory color="warning" />
                  });
                }
                
                // Alertes de commandes en attente
                const pendingOrders = filteredOrders.filter((o: any) => o.status === 'pending');
                if (pendingOrders.length > 0) {
                  alerts.push({
                    type: 'info',
                    title: 'Commandes en Attente',
                    message: `${pendingOrders.length} commande(s) en attente de traitement`,
                    icon: <ShoppingCart color="info" />
                  });
                }
                
                // Alertes de nouveaux fournisseurs
                const newSuppliers = filteredSuppliers.filter((s: any) => {
                  const supplierDate = new Date(s.registrationDate);
                  const hoursAgo = (Date.now() - supplierDate.getTime()) / (1000 * 60 * 60);
                  return hoursAgo < 24;
                });
                
                if (newSuppliers.length > 0) {
                  alerts.push({
                    type: 'success',
                    title: 'Nouveaux Fournisseurs',
                    message: `${newSuppliers.length} nouveau(x) fournisseur(s) ajouté(s)`,
                    icon: <Business color="success" />
                  });
                }
                
                // Si aucune alerte, afficher un message positif
                if (alerts.length === 0) {
                  alerts.push({
                    type: 'success',
                    title: 'Tout va bien !',
                    message: 'Aucune alerte en cours. Votre système fonctionne parfaitement.',
                    icon: <CheckCircle color="success" />
                  });
                }
                
                return alerts.map((alert, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 2,
                      backgroundColor: 'white',
                      borderRadius: 2,
                      border: `1px solid ${alert.type === 'warning' ? '#ffc107' : alert.type === 'info' ? '#17a2b8' : '#28a745'}`
                    }}>
                      {alert.icon}
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a202c', mb: 0.5 }}>
                          {alert.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          {alert.message}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ));
              })()}
            </Grid>
          </Paper>
        </Box>

        {/* Recent Activities */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              color: '#1a202c',
              textAlign: 'center',
              fontSize: { xs: '1.8rem', md: '2.2rem' }
            }}
          >
            Activités Récentes
          </Typography>
          <Paper sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: 3,
            border: '1px solid #e2e8f0'
          }}>
            <List>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 50 }}>
                      {getActivityIcon(activity.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a202c', mb: 1 }}>
                          {activity.action}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body1" sx={{ color: '#64748b', mb: 1, lineHeight: 1.5 }}>
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                            {activity.time}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider sx={{ my: 0.5 }} />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Métriques de Performance */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              color: '#1a202c',
              textAlign: 'center',
              fontSize: { xs: '1.8rem', md: '2.2rem' }
            }}
          >
            Métriques de Performance
          </Typography>
          <Grid container spacing={3}>
            {(() => {
              const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
              const products = JSON.parse(localStorage.getItem('products') || '[]');
              const orders = JSON.parse(localStorage.getItem('orders') || '[]');
              
              // Filtrer par tenant selon l'utilisateur connecté
              let filteredSuppliers, filteredProducts, filteredOrders;
              
              if (user?.role?.name === 'super_admin') {
                // Super admin voit toutes les données
                filteredSuppliers = suppliers;
                filteredProducts = products;
                filteredOrders = orders;
              } else if (tenant?.id) {
                // Utilisateur de tenant ne voit que ses données
                filteredSuppliers = suppliers.filter((s: any) => s.tenantId === tenant.id);
                filteredProducts = products.filter((p: any) => p.tenantId === tenant.id);
                filteredOrders = orders.filter((o: any) => o.tenantId === tenant.id);
              } else {
                // Pas de tenant, données vides
                filteredSuppliers = [];
                filteredProducts = [];
                filteredOrders = [];
              }
              
              // Calculer les métriques
              const totalSuppliers = filteredSuppliers.length;
              const activeSuppliers = filteredSuppliers.filter((s: any) => s.status === 'active').length;
              const supplierActivityRate = totalSuppliers > 0 ? Math.round((activeSuppliers / totalSuppliers) * 100) : 0;
              
              const totalProducts = filteredProducts.length;
              const productsInStock = filteredProducts.filter((p: any) => 
                p.stockQuantity !== undefined && p.stockQuantity > 0
              ).length;
              const stockCoverage = totalProducts > 0 ? Math.round((productsInStock / totalProducts) * 100) : 0;
              
              const totalOrders = filteredOrders.length;
              const deliveredOrders = filteredOrders.filter((o: any) => o.status === 'delivered').length;
              const orderSuccessRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
              
              const avgOrderValue = deliveredOrders > 0 
                ? filteredOrders
                    .filter((o: any) => o.status === 'delivered' && o.total)
                    .reduce((sum: number, o: any) => sum + (o.total || 0), 0) / deliveredOrders
                : 0;
              
              return [
                {
                  title: 'Taux d\'Activité Fournisseurs',
                  value: `${supplierActivityRate}%`,
                  subtitle: `${activeSuppliers}/${totalSuppliers} actifs`,
                  color: supplierActivityRate > 80 ? '#28a745' : supplierActivityRate > 60 ? '#ffc107' : '#dc3545',
                  icon: <Business sx={{ fontSize: 40, color: 'inherit' }} />
                },
                {
                  title: 'Couverture de Stock',
                  value: `${stockCoverage}%`,
                  subtitle: `${productsInStock}/${totalProducts} en stock`,
                  color: stockCoverage > 80 ? '#28a745' : stockCoverage > 60 ? '#ffc107' : '#dc3545',
                  icon: <Inventory sx={{ fontSize: 40, color: 'inherit' }} />
                },
                {
                  title: 'Taux de Réussite Commandes',
                  value: `${orderSuccessRate}%`,
                  subtitle: `${deliveredOrders}/${totalOrders} livrées`,
                  color: orderSuccessRate > 80 ? '#28a745' : orderSuccessRate > 60 ? '#ffc107' : '#dc3545',
                  icon: <ShoppingCart sx={{ fontSize: 40, color: 'inherit' }} />
                },
                {
                  title: 'Valeur Moyenne Commande',
                  value: `$${avgOrderValue.toFixed(0)}`,
                  subtitle: 'Parmi les commandes livrées',
                  color: '#17a2b8',
                  icon: <TrendingUp sx={{ fontSize: 40, color: 'inherit' }} />
                }
              ];
            })().map((metric, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper sx={{ 
                  p: 3, 
                  height: '100%', 
                  borderRadius: 3, 
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  }
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ mb: 2, color: metric.color }}>
                      {metric.icon}
                    </Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 'bold', 
                        mb: 1,
                        color: metric.color,
                        fontSize: { xs: '1.8rem', md: '2.2rem' }
                      }}
                    >
                      {metric.value}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: '600', 
                        mb: 1,
                        color: '#1a202c',
                        fontSize: { xs: '1rem', md: '1.1rem' }
                      }}
                    >
                      {metric.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#64748b',
                        fontSize: '0.9rem'
                      }}
                    >
                      {metric.subtitle}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features Overview */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              color: '#1a202c',
              textAlign: 'center',
              fontSize: { xs: '1.8rem', md: '2.2rem' }
            }}
          >
            Fonctionnalités Principales
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Star sx={{ color: '#fbbf24', mr: 2, fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a202c' }}>
                    Gestion Complète des Fournisseurs
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.8, fontSize: '1rem' }}>
                  • Ajout et modification de fournisseurs avec informations détaillées<br/>
                  • Suivi des performances et évaluations<br/>
                  • Historique des contacts et interactions<br/>
                  • Export des données en CSV et PDF
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Star sx={{ color: '#fbbf24', mr: 2, fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a202c' }}>
                    Inventaire et Produits
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.8, fontSize: '1rem' }}>
                  • Gestion complète de l'inventaire<br/>
                  • Suivi des niveaux de stock<br/>
                  • Catégorisation des produits<br/>
                  • Alertes de stock faible
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Star sx={{ color: '#fbbf24', mr: 2, fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a202c' }}>
                    Suivi des Commandes
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.8, fontSize: '1rem' }}>
                  • Création et suivi des commandes<br/>
                  • Gestion des statuts et livraisons<br/>
                  • Historique des transactions<br/>
                  • Rapports détaillés
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Star sx={{ color: '#fbbf24', mr: 2, fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a202c' }}>
                    Tableau de Bord Analytique
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.8, fontSize: '1rem' }}>
                  • Statistiques en temps réel<br/>
                  • Graphiques et visualisations<br/>
                  • Métriques de performance<br/>
                  • Rapports personnalisables
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', py: 4, mt: 6 }}>
          <Typography variant="body1" sx={{ color: '#94a3b8', mb: 2 }}>
            © 2025 ProcureX. Tous droits réservés.
          </Typography>
          <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
            Plateforme de gestion des relations fournisseurs
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 