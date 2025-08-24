import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  ShoppingCart,
  LocalShipping,
  CheckCircle,
  Schedule,
  Cancel,
  Warning,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { mockOrders } from '../../data/mockData';
import { Order } from '../../types';
import AddOrderDialog from './AddOrderDialog';
import EditOrderDialog from './EditOrderDialog';
import { useAuth } from '../../contexts/AuthContext';
// @ts-ignore
import jsPDF from 'jspdf';

const OrdersList: React.FC = () => {
  const { hasPermission, tenant, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const initialOrders = () => {
    const saved = localStorage.getItem('orders');
    const allOrders = saved ? JSON.parse(saved) : mockOrders;
    
    // Filter orders by tenant (except for super admin who can see all)
    if (user?.role?.name === 'super_admin') {
      return allOrders;
    }
    
    // For tenant users, only show orders that belong to their tenant
    const tenantOrders = allOrders.filter((order: Order) => 
      order.tenantId === tenant?.id
    );
    
    // Si le tenant n'a pas d'orders, retourner un tableau vide
    // Cela garantit que les nouveaux administrateurs ont des pages vides
    if (tenantOrders.length === 0) {
      console.log(`No orders found for tenant ${tenant?.id}, returning empty list`);
      return [];
    }
    
    return tenantOrders;
  };
  
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Sauvegarde à chaque modification
  useEffect(() => {
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Update only the orders for the current tenant
    const otherTenantOrders = allOrders.filter((order: Order) => 
      order.tenantId !== tenant?.id
    );
    
    const updatedAllOrders = [...otherTenantOrders, ...orders];
    localStorage.setItem('orders', JSON.stringify(updatedAllOrders));
  }, [orders, tenant?.id]);

  const handleEdit = () => {
    setOpenEditDialog(true);
  };

  const handleDelete = () => {
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedOrder) {
      setOrders(orders.filter(o => o.id !== selectedOrder.id));
      setSuccessMessage('Order deleted successfully');
      setShowSuccess(true);
    }
    setOpenDeleteDialog(false);
    setSelectedOrder(null);
  };

  const handleEditOrder = (updatedOrder: Order) => {
    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setSuccessMessage('Order updated successfully');
    setShowSuccess(true);
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    // Logique métier : si une commande est livrée, elle doit être confirmée et expédiée
    let updatedStatus = newStatus;
    let additionalUpdates = {};
    
    if (newStatus === 'delivered') {
      // Si la commande est marquée comme livrée, s'assurer qu'elle est aussi confirmée et expédiée
      additionalUpdates = {
        status: 'delivered',
        // On pourrait ajouter des champs comme deliveredDate si nécessaire
      };
    }
    
    // Mettre à jour la commande
    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, ...additionalUpdates } : o
    );
    
    setOrders(updatedOrders);
    
    // Mettre à jour le localStorage pour persister les changements
    const tenantId = tenant?.id || 'system';
    const existingOrders = JSON.parse(localStorage.getItem(`orders_${tenantId}`) || '[]');
    const updatedExistingOrders = existingOrders.map((o: any) => 
      o.id === orderId ? { ...o, ...additionalUpdates } : o
    );
    localStorage.setItem(`orders_${tenantId}`, JSON.stringify(updatedExistingOrders));
    
    setSuccessMessage(`Statut de la commande mis à jour vers ${newStatus}`);
    setShowSuccess(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Schedule />;
      case 'confirmed':
        return <CheckCircle />;
      case 'shipped':
        return <LocalShipping />;
      case 'delivered':
        return <CheckCircle />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <Schedule />;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(order.orderDate) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDate = matchesDate && new Date(order.orderDate) <= new Date(dateTo);
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleExportCSV = () => {
    const header = ['Order Number', 'Supplier', 'Order Date', 'Expected Delivery', 'Status', 'Total Amount', 'Notes'];
    const rows = filteredOrders.map(order => [
      order.orderNumber,
      order.supplierName,
      new Date(order.orderDate).toLocaleDateString(),
      new Date(order.expectedDeliveryDate).toLocaleDateString(),
      order.status,
      order.totalAmount,
      order.notes || ''
    ]);
    const csvContent = [header, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders_report.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    // Enregistrer la date d'export pour les activités récentes
    localStorage.setItem('lastExport', new Date().toISOString());
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Configuration des couleurs et styles
    const primaryColor = [25, 118, 210];
    const textColor = [51, 51, 51];
    const lightTextColor = [102, 102, 102];
    
    // Header avec logo et titre
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 220, 40, 'F');
    
    // Titre principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ProcureX', 20, 25);
    
    // Nom de l'entreprise (tenant)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const companyName = tenant?.name || 'Entreprise';
    doc.text(companyName, 20, 35);
    
    // Sous-titre
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Rapport des Commandes', 20, 45);
    
    // Informations de génération
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 20, 55);
    
    // Statistiques du rapport avec logique métier corrigée
    const totalOrders = filteredOrders.length;
    const totalAmount = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Logique métier : une commande livrée est automatiquement confirmée et expédiée
    const confirmedOrders = filteredOrders.filter(order => 
      order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered'
    ).length;
    const shippedOrders = filteredOrders.filter(order => 
      order.status === 'shipped' || order.status === 'delivered'
    ).length;
    const deliveredOrders = filteredOrders.filter(order => order.status === 'delivered').length;
    
    // Box des statistiques avec design amélioré
    doc.setFillColor(248, 249, 250);
    doc.rect(20, 65, 170, 35, 'F'); // Hauteur augmentée pour accommoder tous les éléments
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, 65, 170, 35, 'S');
    
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Résumé', 25, 77);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Formatage des montants corrigé
    const formatAmount = (amount: number) => {
      return amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
    };
    
    // Disposition en deux colonnes pour une meilleure organisation
    doc.text(`Total des commandes: ${totalOrders}`, 25, 85);
    doc.text(`Montant total: $${formatAmount(totalAmount)}`, 25, 92);
    doc.text(`Confirmées: ${confirmedOrders}`, 25, 99);
    doc.text(`Expédiées: ${shippedOrders}`, 100, 85);
    doc.text(`Livrées: ${deliveredOrders}`, 100, 92);
    
    // Tableau des commandes avec design amélioré
    const startY = 115; // Ajusté pour tenir compte de l'espace supplémentaire
    
    // En-têtes du tableau avec ombre
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(20, startY, 170, 12, 'F');
    
    // Ombre légère sous l'en-tête
    doc.setFillColor(200, 200, 200);
    doc.rect(21, startY + 1, 170, 12, 'F');
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(20, startY, 170, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    
    const headers = ['N° Commande', 'Fournisseur', 'Date', 'Statut', 'Montant'];
    const columnWidths = [30, 55, 20, 20, 30]; // Largeurs ajustées pour donner plus d'espace au fournisseur
    let currentX = 22;
    
    headers.forEach((header, index) => {
      doc.text(header, currentX, startY + 8);
      currentX += columnWidths[index];
    });
    
    // Données du tableau avec design amélioré
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    let currentY = startY + 20;
    let rowCount = 0;
    
    filteredOrders.forEach((order, index) => {
      // Alternance des couleurs de lignes
      if (rowCount % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(20, currentY - 8, 170, 12, 'F');
      }
      
      // Bordure de ligne
      doc.setDrawColor(220, 220, 220);
      doc.line(20, currentY - 8, 190, currentY - 8);
      doc.line(20, currentY + 4, 190, currentY + 4);
      
      // Contenu des colonnes
      let colX = 22;
      
      // Numéro de commande
      doc.text(order.orderNumber, colX, currentY);
      colX += columnWidths[0];
      
      // Fournisseur - affichage complet sans troncature
      const supplierName = order.supplierName;
      doc.text(supplierName, colX, currentY);
      colX += columnWidths[1];
      
      // Date
      const orderDate = new Date(order.orderDate).toLocaleDateString('fr-FR');
      doc.text(orderDate, colX, currentY);
      colX += columnWidths[2];
      
      // Statut avec couleur et design amélioré
      const statusColors: { [key: string]: number[] } = {
        'pending': [255, 193, 7],
        'confirmed': [25, 118, 210],
        'shipped': [255, 152, 0],
        'delivered': [76, 175, 80],
        'cancelled': [244, 67, 54]
      };
      
      const statusColor = statusColors[order.status] || [102, 102, 102];
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.rect(colX - 1, currentY - 6, 20, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      
      // Texte du statut traduit et formaté
      const statusText = {
        'pending': 'En attente',
        'confirmed': 'Confirmée',
        'shipped': 'Expédiée',
        'delivered': 'Livrée',
        'cancelled': 'Annulée'
      }[order.status] || order.status;
      
      doc.text(statusText, colX, currentY);
      colX += columnWidths[3];
      
      // Montant avec formatage corrigé
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(9);
      doc.text(`$${formatAmount(order.totalAmount)}`, colX, currentY);
      
      currentY += 15;
      rowCount++;
      
      // Vérifier si on doit passer à la page suivante
      if (currentY > 270 && index < filteredOrders.length - 1) {
        doc.addPage();
        currentY = 30;
        
        // Réafficher les en-têtes sur la nouvelle page
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(20, currentY - 10, 170, 12, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        
        currentX = 22;
        headers.forEach((header, headerIndex) => {
          doc.text(header, currentX, currentY - 2);
          currentX += columnWidths[headerIndex];
        });
        
        currentY += 20;
        rowCount = 0;
      }
    });
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Ligne de séparation
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 280, 190, 280);
      
      // Informations de page
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} sur ${pageCount}`, 20, 285);
      doc.text('ProcureX - Système de gestion des fournisseurs', 20, 290);
    }
    
    // Sauvegarde du PDF
    doc.save('rapport_commandes_procurex.pdf');
    
    // Enregistrer la date d'export pour les activités récentes
    localStorage.setItem('lastExport', new Date().toISOString());
  };

  const columns: GridColDef[] = [
    {
      field: 'orderNumber',
      headerName: 'Order Number',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.supplierName}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'orderDate',
      headerName: 'Order Date',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'expectedDeliveryDate',
      headerName: 'Expected Delivery',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'totalAmount',
      headerName: 'Total Amount',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          ${params.value.toLocaleString('fr-FR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value) as any}
          size="small"
          icon={getStatusIcon(params.value)}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 260,
      sortable: false,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 1, sm: 2 },
            width: '100%',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
            <Tooltip title="View Details">
              <IconButton
                color="primary"
                onClick={() => { setSelectedOrder(params.row); setOpenDetailsDialog(true); }}
                size="small"
                sx={{
                  transition: 'background 0.2s',
                  '&:hover': { backgroundColor: '#e3e6ea' },
                }}
              >
                <Visibility />
              </IconButton>
            </Tooltip>
            {hasPermission('order', 'update') && (
              <Tooltip title="Edit">
                <IconButton
                  color="info"
                  onClick={() => { setSelectedOrder(params.row); handleEdit(); }}
                  size="small"
                  sx={{
                    transition: 'background 0.2s',
                    '&:hover': { backgroundColor: '#e3e6ea' },
                  }}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
            )}
            {hasPermission('order', 'delete') && (
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={() => { setSelectedOrder(params.row); handleDelete(); }}
                  size="small"
                  sx={{
                    transition: 'background 0.2s',
                    '&:hover': { backgroundColor: '#e3e6ea' },
                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          {hasPermission('order', 'update') && (
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <Select
                value={params.row.status}
                onChange={(e) => handleStatusChange(params.row.id, e.target.value as Order['status'])}
                sx={{ height: 32, fontSize: 13 }}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      ),
    },
  ];

  const handleAddOrder = (newOrder: Omit<Order, 'id'>) => {
    const orderWithId: Order = {
      ...newOrder,
      id: String(orders.length + 1),
    };
    setOrders([orderWithId, ...orders]);
    setSuccessMessage('Order created successfully');
    setShowSuccess(true);
  };

  return (
    <Box sx={{
      width: '100%',
      px: { xs: 0, md: 2 },
      py: 4,
      backgroundColor: '#fafbfc',
      minHeight: '80vh',
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Orders ({filteredOrders.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={handleExportCSV}>Export CSV</Button>
          <Button variant="contained" onClick={handleExportPDF}>Export PDF</Button>
        </Box>
        {hasPermission('order', 'create') && (
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ borderRadius: 2 }}
            onClick={() => setOpenAddDialog(true)}
          >
            New Order
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 1 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={1.5}>
              <TextField
                label="From"
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} md={1.5}>
              <TextField
                label="To"
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                {filteredOrders.length} orders found
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <DataGrid
              rows={filteredOrders}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              autoHeight
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid #e0e0e0',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ShoppingCart color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Order Details
            </Typography>
            {selectedOrder && (
              <Chip
                label={selectedOrder.status}
                color={getStatusColor(selectedOrder.status) as any}
                icon={getStatusIcon(selectedOrder.status)}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Order Number
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                  {selectedOrder.orderNumber}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Supplier
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedOrder.supplierName}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Order Date
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {new Date(selectedOrder.orderDate).toLocaleDateString()}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Expected Delivery
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                  ${selectedOrder.totalAmount.toLocaleString('fr-FR', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={selectedOrder.status}
                  color={getStatusColor(selectedOrder.status) as any}
                  icon={getStatusIcon(selectedOrder.status)}
                  sx={{ mb: 2 }}
                />
                
                {selectedOrder.actualDeliveryDate && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">
                      Actual Delivery
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {new Date(selectedOrder.actualDeliveryDate).toLocaleDateString()}
                    </Typography>
                  </>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Order Items
                </Typography>
                <List>
                  {selectedOrder.items.map((item, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={item.productName}
                        secondary={`Quantity: ${item.quantity} | Unit Price: $${item.unitPrice}`}
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          ${item.totalPrice.toLocaleString('fr-FR', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Grid>
              
              {selectedOrder.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body1">
                    {selectedOrder.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Order Dialog */}
      <AddOrderDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onAdd={handleAddOrder}
      />

      {/* Edit Order Dialog */}
      <EditOrderDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        order={selectedOrder}
        onEdit={handleEditOrder}
      />

      {/* Delete Order Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Warning color="error" />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Confirm Delete
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this order?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrdersList; 