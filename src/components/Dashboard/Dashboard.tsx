import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  LinearProgress,
  Button,
  TextField,
} from '@mui/material';
import {
  Business,
  ShoppingCart,
  Inventory,
  TrendingUp,
  CheckCircle,
  Warning,
  Error,
  FileDownload,
  PictureAsPdf,
} from '@mui/icons-material';
// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import { mockSuppliers, mockProducts, mockOrders } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: color, mr: 2 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Box>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const { tenant, user } = useAuth();
  
  // Date range filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  // Fonction pour filtrer les données par tenant
  const getTenantFilteredData = () => {
    const savedSuppliers = localStorage.getItem('suppliers');
    const savedProducts = localStorage.getItem('products');
    const savedOrders = localStorage.getItem('orders');
    
    const allSuppliers = savedSuppliers ? JSON.parse(savedSuppliers) : mockSuppliers;
    const allProducts = savedProducts ? JSON.parse(savedProducts) : mockProducts;
    const allOrders = savedOrders ? JSON.parse(savedOrders) : mockOrders;
    
    // Super admin peut voir toutes les données
    if (user?.role?.name === 'super_admin') {
      return { suppliers: allSuppliers, products: allProducts, orders: allOrders };
    }
    
    // Les utilisateurs de tenant ne voient que leurs données
    const tenantSuppliers = allSuppliers.filter((supplier: any) => supplier.tenantId === tenant?.id);
    const tenantProducts = allProducts.filter((product: any) => product.tenantId === tenant?.id);
    const tenantOrders = allOrders.filter((order: any) => order.tenantId === tenant?.id);
    
    // Log pour debug
    console.log(`Dashboard data for tenant ${tenant?.id}:`, {
      suppliers: tenantSuppliers.length,
      products: tenantProducts.length,
      orders: tenantOrders.length
    });
    
    return { suppliers: tenantSuppliers, products: tenantProducts, orders: tenantOrders };
  };

  // Fonction pour générer des commandes de test pour le mois en cours
  const generateTestOrdersForCurrentMonth = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Créer des commandes pour le mois en cours
    const testOrders = [
      {
        id: `test-${Date.now()}-1`,
        tenantId: tenant?.id || 'system', // Ajouter tenantId
        orderNumber: `ORD-${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-001`,
        supplierId: '1',
        supplierName: 'Tech Solutions Inc.',
        orderDate: new Date(currentYear, currentMonth, 5),
        expectedDeliveryDate: new Date(currentYear, currentMonth, 20),
        status: 'confirmed',
        totalAmount: 1800.00,
        items: [
          {
            id: '1',
            productId: '1',
            productName: 'Laptop Computer',
            quantity: 1,
            unitPrice: 1200.00,
            totalPrice: 1200.00
          },
          {
            id: '2',
            productId: '2',
            productName: 'Steel Sheets',
            quantity: 1,
            unitPrice: 600.00,
            totalPrice: 600.00
          }
        ],
        notes: 'Test order for current month'
      },
      {
        id: `test-${Date.now()}-2`,
        tenantId: tenant?.id || 'system', // Ajouter tenantId
        orderNumber: `ORD-${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-002`,
        supplierId: '2',
        supplierName: 'Global Manufacturing Co.',
        orderDate: new Date(currentYear, currentMonth, 12),
        expectedDeliveryDate: new Date(currentYear, currentMonth, 25),
        status: 'shipped',
        totalAmount: 2200.00,
        items: [
          {
            id: '3',
            productId: '2',
            productName: 'Steel Sheets',
            quantity: 2,
            unitPrice: 850.00,
            totalPrice: 1700.00
          },
          {
            id: '4',
            productId: '3',
            productName: 'Brake Pads',
            quantity: 10,
            unitPrice: 50.00,
            totalPrice: 500.00
          }
        ],
        notes: 'Manufacturing supplies for current month'
      },
      {
        id: `test-${Date.now()}-3`,
        tenantId: tenant?.id || 'system', // Ajouter tenantId
        orderNumber: `ORD-${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-003`,
        supplierId: '3',
        supplierName: 'Quality Parts Ltd.',
        orderDate: new Date(currentYear, currentMonth, 18),
        expectedDeliveryDate: new Date(currentYear, currentMonth, 28),
        status: 'pending',
        totalAmount: 950.00,
        items: [
          {
            id: '5',
            productId: '3',
            productName: 'Brake Pads',
            quantity: 20,
            unitPrice: 45.00,
            totalPrice: 900.00
          },
          {
            id: '6',
            productId: '4',
            productName: 'Recycled Plastic',
            quantity: 20,
            unitPrice: 2.50,
            totalPrice: 50.00
          }
        ],
        notes: 'Maintenance parts for current month'
      }
    ];

    return testOrders;
  };

  // Initialiser les données dans localStorage si elles n'existent pas
  useEffect(() => {
    const initializeData = () => {
      // Vérifier si les données existent dans localStorage
      const existingSuppliers = localStorage.getItem('suppliers');
      const existingProducts = localStorage.getItem('products');
      const existingOrders = localStorage.getItem('orders');

      // Si les données n'existent pas, les initialiser avec mockData
      if (!existingSuppliers) {
        localStorage.setItem('suppliers', JSON.stringify(mockSuppliers));
        console.log('Initialized suppliers data:', mockSuppliers.length, 'suppliers');
      }
      
      if (!existingProducts) {
        localStorage.setItem('products', JSON.stringify(mockProducts));
        console.log('Initialized products data:', mockProducts.length, 'products');
      }
      
      if (!existingOrders) {
        localStorage.setItem('orders', JSON.stringify(mockOrders));
        console.log('Initialized orders data:', mockOrders.length, 'orders');
      }

      // Vérifier s'il y a des commandes pour le mois en cours
      const currentOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const hasCurrentMonthOrders = currentOrders.some((order: any) => {
        const orderDate = new Date(order.orderDate);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      });

      // Si pas de commandes pour le mois en cours, ajouter des données de test
      if (!hasCurrentMonthOrders && currentOrders.length > 0) {
        console.log('No orders for current month, adding test data...');
        const testOrders = generateTestOrdersForCurrentMonth();
        const updatedOrders = [...currentOrders, ...testOrders];
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        console.log('Added test orders for current month:', testOrders.length, 'orders');
      }

      setIsDataLoaded(true);
      setDataVersion(prev => prev + 1);
    };

    initializeData();
  }, []);

  // Écouter les changements dans localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setDataVersion(prev => prev + 1);
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

  // Lecture dynamique depuis localStorage avec filtrage par tenant
  const { suppliers, products, orders } = getTenantFilteredData();
  
  // Debug logs pour vérifier les données
  useEffect(() => {
    console.log('Dashboard data loaded:', {
      suppliers: suppliers.length,
      products: products.length,
      orders: orders.length,
      tenant: tenant?.id,
      userRole: user?.role?.name
    });
  }, [suppliers.length, products.length, orders.length, tenant?.id, user?.role?.name]);

  // Filter data based on date range
  const filterByDateRange = (data: any[], dateField: string) => {
    if (!dateFrom && !dateTo) return data;
    
    return data.filter((item) => {
      const itemDate = new Date(item[dateField]);
      let matchesDate = true;
      
      if (dateFrom) {
        matchesDate = matchesDate && itemDate >= new Date(dateFrom);
      }
      if (dateTo) {
        matchesDate = matchesDate && itemDate <= new Date(dateTo);
      }
      
      return matchesDate;
    });
  };

  // Filter suppliers by registration date
  const filteredSuppliers = filterByDateRange(suppliers, 'registrationDate');
  
  // Filter orders by order date
  const filteredOrders = filterByDateRange(orders, 'orderDate');
  
  // Filter products by creation date
  const filteredProducts = filterByDateRange(products, 'createdAt');

  // Statistiques dynamiques basées sur les données filtrées
  const totalSuppliers = filteredSuppliers.length;
  const activeSuppliers = filteredSuppliers.filter((s: any) => s.status === 'active').length;
  const totalOrders = filteredOrders.length;
  const pendingOrders = filteredOrders.filter((o: any) => o.status === 'pending').length;
  const totalProducts = filteredProducts.length;
  
  // Calculs dynamiques pour les produits en stock faible
  const lowStockProducts = filteredProducts.filter((p: any) => 
    p.stockQuantity !== undefined && 
    p.minStockLevel !== undefined && 
    p.stockQuantity <= p.minStockLevel
  ).length;

  // Calculs dynamiques pour les niveaux de stock
  const totalStockValue = filteredProducts.reduce((sum: number, p: any) => 
    sum + ((p.stockQuantity || 0) * (p.price || 0)), 0
  );
  
  const availableStockValue = filteredProducts.reduce((sum: number, p: any) => 
    sum + ((p.stockQuantity || 0) * (p.price || 0)), 0
  );
  
  const lowStockValue = filteredProducts
    .filter((p: any) => p.stockQuantity !== undefined && p.minStockLevel !== undefined && p.stockQuantity <= p.minStockLevel)
    .reduce((sum: number, p: any) => sum + ((p.stockQuantity || 0) * (p.price || 0)), 0);

  // Calculs dynamiques pour les pourcentages de stock
  const availableStockPercentage = totalStockValue > 0 ? (availableStockValue / totalStockValue) * 100 : 0;
  const lowStockPercentage = totalStockValue > 0 ? (lowStockValue / totalStockValue) * 100 : 0;
  
  // Dépenses du mois en cours (basées sur les commandes filtrées)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Calcul des dépenses mensuelles avec différents critères
  const monthlySpendingByOrderDate = filteredOrders
    .filter((o: any) => {
      const orderDate = new Date(o.orderDate);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    })
    .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

  // Dépenses basées sur la date de livraison (si disponible)
  const monthlySpendingByDeliveryDate = filteredOrders
    .filter((o: any) => {
      if (!o.actualDeliveryDate) return false;
      const deliveryDate = new Date(o.actualDeliveryDate);
      return deliveryDate.getMonth() === currentMonth && deliveryDate.getFullYear() === currentYear;
    })
    .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

  // Dépenses basées sur le statut (commandes livrées ce mois-ci)
  const monthlySpendingDelivered = filteredOrders
    .filter((o: any) => {
      const orderDate = new Date(o.orderDate);
      const isThisMonth = orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      return isThisMonth && o.status === 'delivered';
    })
    .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

  // Dépenses basées sur le statut (commandes confirmées ce mois-ci)
  const monthlySpendingConfirmed = filteredOrders
    .filter((o: any) => {
      const orderDate = new Date(o.orderDate);
      const isThisMonth = orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      return isThisMonth && (o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered');
    })
    .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

  // Utiliser la méthode la plus appropriée (ici: commandes confirmées/livrées)
  const monthlySpending = monthlySpendingConfirmed;

  // Dépenses du mois précédent pour comparaison
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const previousMonthSpending = filteredOrders
    .filter((o: any) => {
      const orderDate = new Date(o.orderDate);
      const isPreviousMonth = orderDate.getMonth() === previousMonth && orderDate.getFullYear() === previousYear;
      return isPreviousMonth && (o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered');
    })
    .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

  // Calcul du pourcentage de changement
  const spendingChange = previousMonthSpending > 0 
    ? ((monthlySpending - previousMonthSpending) / previousMonthSpending) * 100 
    : 0;

  // Statistiques détaillées des dépenses
  const spendingStats = {
    byOrderDate: monthlySpendingByOrderDate,
    byDeliveryDate: monthlySpendingByDeliveryDate,
    delivered: monthlySpendingDelivered,
    confirmed: monthlySpendingConfirmed,
    total: monthlySpending
  };

  // Top suppliers par rating (top 5) - basé sur les fournisseurs filtrés
  const topSuppliers = [...filteredSuppliers]
    .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);
  
  // Commandes récentes (5 dernières) - basées sur les commandes filtrées
  const recentOrders = [...filteredOrders]
    .sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 5);

  // Produits avec stock faible (pour affichage détaillé)
  const lowStockProductsList = filteredProducts
    .filter((p: any) => p.stockQuantity !== undefined && p.minStockLevel !== undefined && p.stockQuantity <= p.minStockLevel)
    .sort((a: any, b: any) => (a.stockQuantity / a.minStockLevel) - (b.stockQuantity / b.minStockLevel))
    .slice(0, 5);

  // Statistiques par catégorie de produits
  const productCategories = filteredProducts.reduce((acc: any, product: any) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = { count: 0, totalValue: 0 };
    }
    acc[category].count++;
    acc[category].totalValue += (product.stockQuantity || 0) * (product.price || 0);
    return acc;
  }, {});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle />;
      case 'pending':
        return <Warning />;
      case 'inactive':
        return <Error />;
      default:
        return <CheckCircle />;
    }
  };

  const handleExportCSV = () => {
    // Export des statistiques principales
    const statsData = [
      ['Metric', 'Value'],
      ['Total Suppliers', totalSuppliers],
      ['Active Suppliers', activeSuppliers],
      ['Total Orders', totalOrders],
      ['Pending Orders', pendingOrders],
      ['Total Products', totalProducts],
      ['Low Stock Products', lowStockProducts],
      ['Monthly Spending (Confirmed)', `$${spendingStats.confirmed.toLocaleString('fr-FR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`],
      ['Monthly Spending (By Order Date)', `$${spendingStats.byOrderDate.toLocaleString('fr-FR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`],
      ['Monthly Spending (By Delivery Date)', `$${spendingStats.byDeliveryDate.toLocaleString('fr-FR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`],
      ['Monthly Spending (Delivered Only)', `$${spendingStats.delivered.toLocaleString('fr-FR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`],
      ['Previous Month Spending', `$${previousMonthSpending.toLocaleString('fr-FR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`],
      ['Spending Change', `${spendingChange.toFixed(1)}%`],
      ['Total Stock Value', `$${totalStockValue.toLocaleString('fr-FR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`],
    ];

    // Export des top suppliers
    const suppliersData = [
      ['Top Suppliers'],
      ['Name', 'Category', 'Rating', 'Status'],
      ...topSuppliers.map((supplier: any) => [
        supplier.name,
        supplier.category,
        supplier.rating,
        supplier.status
      ])
    ];

    // Export des commandes récentes
    const ordersData = [
      ['Recent Orders'],
      ['Order Number', 'Supplier', 'Amount', 'Status'],
      ...recentOrders.map((order: any) => [
        order.orderNumber,
        order.supplierName,
        `$${order.totalAmount}`,
        order.status
      ])
    ];

    // Export des produits en stock faible
    const lowStockData = [
      ['Low Stock Products'],
      ['Name', 'Category', 'Current Stock', 'Min Stock', 'Stock Level %'],
      ...lowStockProductsList.map((product: any) => [
        product.name,
        product.category,
        product.stockQuantity,
        product.minStockLevel,
        `${((product.stockQuantity / product.minStockLevel) * 100).toFixed(1)}%`
      ])
    ];

    const csvContent = [
      ...statsData.map(row => row.join(',')),
      '',
      ...suppliersData.map(row => row.join(',')),
      '',
      ...ordersData.map(row => row.join(',')),
      '',
      ...lowStockData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(24);
    doc.text('Dashboard Report', 14, 22);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    
    // Key Statistics
    doc.setFontSize(16);
    doc.text('Key Statistics', 14, 45);
    
    const statsData = [
      ['Metric', 'Value'],
      ['Total Suppliers', totalSuppliers],
      ['Active Suppliers', activeSuppliers],
      ['Total Orders', totalOrders],
      ['Pending Orders', pendingOrders],
      ['Total Products', totalProducts],
      ['Low Stock Products', lowStockProducts],
      ['Monthly Spending (Confirmed)', `$${spendingStats.confirmed.toLocaleString('fr-FR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`],
      ['Monthly Spending (By Order Date)', `$${spendingStats.byOrderDate.toLocaleString('fr-FR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`],
      ['Monthly Spending (By Delivery Date)', `$${spendingStats.byDeliveryDate.toLocaleString('fr-FR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`],
      ['Monthly Spending (Delivered Only)', `$${spendingStats.delivered.toLocaleString('fr-FR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`],
      ['Previous Month Spending', `$${previousMonthSpending.toLocaleString('fr-FR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`],
      ['Spending Change', `${spendingChange.toFixed(1)}%`],
      ['Total Stock Value', `$${totalStockValue.toLocaleString('fr-FR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`],
    ];

    // @ts-ignore
    autoTable(doc, {
      head: [statsData[0]],
      body: statsData.slice(1),
      startY: 50,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Top Suppliers
    const suppliersY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.text('Top Suppliers', 14, suppliersY);
    
    const suppliersTableData = topSuppliers.map((supplier: any) => [
      supplier.name,
      supplier.category,
      `${supplier.rating}/5`,
      supplier.status
    ]);

    // @ts-ignore
    autoTable(doc, {
      head: [['Name', 'Category', 'Rating', 'Status']],
      body: suppliersTableData,
      startY: suppliersY + 5,
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [46, 125, 50],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Recent Orders
    const ordersY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.text('Recent Orders', 14, ordersY);
    
    const ordersTableData = recentOrders.map((order: any) => [
      order.orderNumber,
      order.supplierName,
      `$${order.totalAmount}`,
      order.status
    ]);

    // @ts-ignore
    autoTable(doc, {
      head: [['Order Number', 'Supplier', 'Amount', 'Status']],
      body: ordersTableData,
      startY: ordersY + 5,
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [237, 108, 2],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Low Stock Products
    const lowStockY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.text('Low Stock Products', 14, lowStockY);
    
    const lowStockTableData = lowStockProductsList.map((product: any) => [
      product.name,
      product.category,
      product.stockQuantity,
      product.minStockLevel,
      `${((product.stockQuantity / product.minStockLevel) * 100).toFixed(1)}%`
    ]);

    // @ts-ignore
    autoTable(doc, {
      head: [['Name', 'Category', 'Current Stock', 'Min Stock', 'Stock Level %']],
      body: lowStockTableData,
      startY: lowStockY + 5,
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [211, 47, 47],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });
    
    doc.save('dashboard_report.pdf');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => {
              const testOrders = generateTestOrdersForCurrentMonth();
              const updatedOrders = [...filteredOrders, ...testOrders];
              localStorage.setItem('orders', JSON.stringify(updatedOrders));
              setDataVersion(prev => prev + 1);
              console.log('Added test orders for current month');
            }}
            sx={{ borderRadius: 2 }}
          >
            Add Test Data
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              const testOrders = generateTestOrdersForCurrentMonth();
              const updatedOrders = [...filteredOrders, ...testOrders];
              localStorage.setItem('orders', JSON.stringify(updatedOrders));
              setDataVersion(prev => prev + 1);
              console.log('Regenerated test orders for current month');
            }}
            sx={{ borderRadius: 2 }}
          >
            Regenerate Test Data
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              // Ajouter un nouveau fournisseur de test
              const newSupplier = {
                id: `test-supplier-${Date.now()}`,
                name: `Test Supplier ${Date.now()}`,
                email: `test${Date.now()}@example.com`,
                phone: `+1-555-${String(Date.now()).slice(-4)}`,
                address: 'Test Address',
                city: 'Test City',
                country: 'Test Country',
                postalCode: '12345',
                category: 'Test Category',
                status: 'active',
                rating: Math.floor(Math.random() * 5) + 1,
                contactPerson: 'Test Contact',
                website: 'https://test.com',
                taxId: `TAX${Date.now()}`,
                registrationDate: new Date(),
                lastContactDate: new Date(),
                notes: 'Test supplier for dashboard testing'
              };
              const updatedSuppliers = [...filteredSuppliers, newSupplier];
              localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
              setDataVersion(prev => prev + 1);
              console.log('Added test supplier');
            }}
            sx={{ borderRadius: 2 }}
          >
            Add Test Supplier
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={handleExportCSV}
            sx={{ borderRadius: 2 }}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={handleExportPDF}
            sx={{ borderRadius: 2 }}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* Date Range Filters */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 1 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="From Date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="To Date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Showing data from {dateFrom || 'all time'} to {dateTo || 'now'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Suppliers"
            value={totalSuppliers}
            icon={<Business />}
            color="#1976d2"
            subtitle={`${activeSuppliers} active`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={totalOrders}
            icon={<ShoppingCart />}
            color="#2e7d32"
            subtitle={`${pendingOrders} pending`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={totalProducts}
            icon={<Inventory />}
            color="#ed6c02"
            subtitle={`${lowStockProducts} low stock`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Spending"
            value={`$${monthlySpending.toLocaleString('fr-FR', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}`}
            icon={<TrendingUp />}
            color="#9c27b0"
            subtitle={spendingChange !== 0 ? `${spendingChange > 0 ? '+' : ''}${spendingChange.toFixed(1)}% vs last month` : 'No change from last month'}
          />
        </Grid>
      </Grid>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {/* Top Suppliers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Top Suppliers
              </Typography>
              <List>
                {topSuppliers.map((supplier: any) => (
                  <ListItem key={supplier.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#1976d2' }}>
                        {supplier.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={supplier.name}
                      secondary={`${supplier.category} • Rating: ${supplier.rating}/5`}
                    />
                    <Chip
                      label={supplier.status}
                      color={getStatusColor(supplier.status) as any}
                      size="small"
                      icon={getStatusIcon(supplier.status)}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Recent Orders
              </Typography>
              <List>
                {recentOrders.map((order: any) => (
                  <ListItem key={order.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#2e7d32' }}>
                        {order.orderNumber ? order.orderNumber.slice(-2) : ''}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={order.orderNumber}
                      secondary={`${order.supplierName} • $${order.totalAmount.toLocaleString('fr-FR', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}`}
                    />
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status) as any}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Stock Levels Overview - Maintenant dynamique */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Stock Levels Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Available Stock Value</Typography>
                      <Typography variant="body2" color="success.main">
                        ${availableStockValue.toLocaleString('fr-FR', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={availableStockPercentage}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Low Stock Items Value</Typography>
                      <Typography variant="body2" color="warning.main">
                        ${lowStockValue.toLocaleString('fr-FR', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={lowStockPercentage}
                      color="warning"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Total Stock Value</Typography>
                      <Typography variant="body2" color="primary.main">
                        ${totalStockValue.toLocaleString('fr-FR', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Products - Nouvelle section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Low Stock Products
              </Typography>
              {lowStockProductsList.length > 0 ? (
                <List>
                  {lowStockProductsList.map((product: any) => {
                    const stockPercentage = ((product.stockQuantity / product.minStockLevel) * 100);
                    return (
                      <ListItem key={product.id} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: stockPercentage < 50 ? '#d32f2f' : '#ed6c02' }}>
                            {product.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={product.name}
                          secondary={`${product.category} • Stock: ${product.stockQuantity}/${product.minStockLevel}`}
                        />
                        <Chip
                          label={`${stockPercentage.toFixed(1)}%`}
                          color={stockPercentage < 50 ? 'error' : 'warning'}
                          size="small"
                        />
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No low stock products found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Product Categories - Nouvelle section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Product Categories Overview
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(productCategories).map(([category, data]: [string, any]) => (
                  <Grid item xs={12} sm={6} md={3} key={category}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {category}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {data.count} products
                      </Typography>
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                        ${data.totalValue.toLocaleString('fr-FR', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })} value
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Spending Details - Nouvelle section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Monthly Spending Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Different calculation methods for monthly spending based on order status and dates
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#f8f9fa' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
                      By Order Date
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      ${spendingStats.byOrderDate.toLocaleString('fr-FR', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      All orders placed this month
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#f8f9fa' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#2e7d32' }}>
                      By Delivery Date
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      ${spendingStats.byDeliveryDate.toLocaleString('fr-FR', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Orders delivered this month
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fff3e0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#ed6c02' }}>
                      Delivered Only
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      ${spendingStats.delivered.toLocaleString('fr-FR', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Orders with 'delivered' status
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, border: '2px solid #9c27b0', borderRadius: 2, bgcolor: '#f3e5f5' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#9c27b0' }}>
                      Confirmed & Delivered
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      ${spendingStats.confirmed.toLocaleString('fr-FR', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Orders confirmed, shipped, or delivered
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, p: 2, bgcolor: '#e8f5e8', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  💡 <strong>Current Method:</strong> Using "Confirmed & Delivered" (${spendingStats.confirmed.toLocaleString('fr-FR', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}) 
                  as it represents committed spending for orders that have been confirmed or completed.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 