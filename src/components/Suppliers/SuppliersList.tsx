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
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Search,
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Star,
  FileDownload,
  PictureAsPdf,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { mockSuppliers } from '../../data/mockData';
import { Supplier } from '../../types';
import AddSupplierDialog from './AddSupplierDialog';
import EditSupplierDialog from './EditSupplierDialog';
import SupplierDetailsDialog from './SupplierDetailsDialog';
import { formatDateSafely } from '../../utils/dateUtils';
import { useAuth } from '../../contexts/AuthContext';
// @ts-ignore
import jsPDF from 'jspdf';

const SuppliersList: React.FC = () => {
  const { hasPermission, tenant, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  
  const initialSuppliers = () => {
    const saved = localStorage.getItem('suppliers');
    const allSuppliers = saved ? JSON.parse(saved) : mockSuppliers;
    
    // Filter suppliers by tenant (except for super admin who can see all)
    if (user?.role?.name === 'super_admin') {
      return allSuppliers;
    }
    
    // For tenant users, only show suppliers that belong to their tenant
    const tenantSuppliers = allSuppliers.filter((supplier: Supplier) => 
      supplier.tenantId === tenant?.id
    );
    
    // Si le tenant n'a pas de suppliers, retourner un tableau vide
    // Cela garantit que les nouveaux administrateurs ont des pages vides
    if (tenantSuppliers.length === 0) {
      console.log(`No suppliers found for tenant ${tenant?.id}, returning empty list`);
      return [];
    }
    
    return tenantSuppliers;
  };
  
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Sauvegarde à chaque modification
  useEffect(() => {
    const allSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
    
    // Update only the suppliers for the current tenant
    const otherTenantSuppliers = allSuppliers.filter((supplier: Supplier) => 
      supplier.tenantId !== tenant?.id
    );
    
    const updatedAllSuppliers = [...otherTenantSuppliers, ...suppliers];
    localStorage.setItem('suppliers', JSON.stringify(updatedAllSuppliers));
  }, [suppliers, tenant?.id]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, supplier: Supplier) => {
    setAnchorEl(event.currentTarget);
    setSelectedSupplier(supplier);
  };

  // Check if user can perform actions
  const canEdit = hasPermission('supplier', 'update');
  const canDelete = hasPermission('supplier', 'delete');

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetails = () => {
    setOpenDetailsDialog(true);
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setOpenEditDialog(true);
    setAnchorEl(null);
  };

  const handleDelete = () => {
    if (selectedSupplier) {
      setSuppliers(suppliers.filter(s => s.id !== selectedSupplier.id));
      setSuccessMessage('Supplier deleted successfully');
      setShowSuccess(true);
      setSelectedSupplier(null);
    }
    setAnchorEl(null);
  };

  const handleAddSupplier = (newSupplier: Omit<Supplier, 'id' | 'registrationDate'>) => {
    const supplier: Supplier = {
      ...newSupplier,
      id: (suppliers.length + 1).toString(),
      tenantId: tenant?.id || 'system', // Ajouter le tenantId
      registrationDate: new Date(),
    };
    setSuppliers([...suppliers, supplier]);
    setSuccessMessage('Supplier added successfully');
    setShowSuccess(true);
  };

  const handleEditSupplier = (updatedSupplier: Supplier) => {
    setSuppliers(suppliers.map(s => 
      s.id === updatedSupplier.id ? updatedSupplier : s
    ));
    setSuccessMessage('Supplier updated successfully');
    setShowSuccess(true);
    setSelectedSupplier(null);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedSupplier(null);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedSupplier(null);
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    
    // Date range filtering
    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(supplier.registrationDate) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDate = matchesDate && new Date(supplier.registrationDate) <= new Date(dateTo);
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Supplier Name',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.contactPerson}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Star sx={{ color: '#ffc107', fontSize: 16, mr: 0.5 }} />
          <Typography variant="body2">
            {params.value}/5
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'active' ? 'success' :
            params.value === 'pending' ? 'warning' : 'error'
          }
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={(e) => handleMenuClick(e, params.row)}
          size="small"
        >
          <MoreVert />
        </IconButton>
      ),
    },
  ];

  const handleExportCSV = () => {
    const header = ['Name', 'Contact Person', 'Email', 'Phone', 'Category', 'Rating', 'Status', 'Registration Date'];
    const rows = filteredSuppliers.map(supplier => [
      supplier.name,
      supplier.contactPerson,
      supplier.email,
      supplier.phone,
      supplier.category,
      supplier.rating,
      supplier.status,
      formatDateSafely(supplier.registrationDate)
    ]);
    const csvContent = [header, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'suppliers_report.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    // Enregistrer la date d'export pour les activités récentes
    localStorage.setItem('lastExport', new Date().toISOString());
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Configuration des couleurs et styles
    const primaryColor = [25, 118, 210];
    const secondaryColor = [245, 245, 245];
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
    
    // Sous-titre
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Rapport des Fournisseurs', 20, 35);
    
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
    })}`, 20, 50);
    
    // Statistiques du rapport
    const totalSuppliers = filteredSuppliers.length;
    const activeSuppliers = filteredSuppliers.filter(s => s.status === 'active').length;
    const pendingSuppliers = filteredSuppliers.filter(s => s.status === 'pending').length;
    const inactiveSuppliers = filteredSuppliers.filter(s => s.status === 'inactive').length;
    const avgRating = filteredSuppliers.reduce((sum, s) => sum + s.rating, 0) / totalSuppliers;
    
    // Box des statistiques
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(20, 60, 170, 30, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, 60, 170, 30, 'S');
    
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Résumé', 25, 72);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total des fournisseurs: ${totalSuppliers}`, 25, 80);
    doc.text(`Actifs: ${activeSuppliers} | En attente: ${pendingSuppliers} | Inactifs: ${inactiveSuppliers}`, 25, 87);
    doc.text(`Note moyenne: ${avgRating.toFixed(1)}/5`, 25, 94);
    
    // Tableau des fournisseurs
    const startY = 110;
    
    // En-têtes du tableau
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(20, startY, 170, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    
    const headers = ['Nom', 'Contact', 'Email', 'Catégorie', 'Note', 'Statut'];
    const columnWidths = [32, 28, 42, 22, 18, 12]; // Largeurs ajustées
    let currentX = 22;
    
    headers.forEach((header, index) => {
      doc.text(header, currentX, startY + 8);
      currentX += columnWidths[index];
    });
    
    // Données du tableau
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    let currentY = startY + 20;
    let rowCount = 0;
    
    filteredSuppliers.forEach((supplier, index) => {
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
      
      // Nom (tronqué si trop long)
      const name = supplier.name.length > 11 ? 
        supplier.name.substring(0, 9) + '...' : supplier.name;
      doc.text(name, colX, currentY);
      colX += columnWidths[0];
      
      // Contact (tronqué si trop long)
      const contact = supplier.contactPerson.length > 7 ? 
        supplier.contactPerson.substring(0, 5) + '...' : supplier.contactPerson;
      doc.text(contact, colX, currentY);
      colX += columnWidths[1];
      
      // Email (tronqué si trop long)
      const email = supplier.email.length > 17 ? 
        supplier.email.substring(0, 15) + '...' : supplier.email;
      doc.text(email, colX, currentY);
      colX += columnWidths[2];
      
      // Catégorie
      doc.text(supplier.category, colX, currentY);
      colX += columnWidths[3];
      
      // Note avec étoiles
      const stars = '★'.repeat(Math.floor(supplier.rating)) + '☆'.repeat(5 - Math.floor(supplier.rating));
      doc.text(stars, colX, currentY);
      colX += columnWidths[4];
      
      // Statut avec couleur
      const statusColors: { [key: string]: number[] } = {
        'active': [76, 175, 80],
        'pending': [255, 193, 7],
        'inactive': [244, 67, 54]
      };
      
      const statusColor = statusColors[supplier.status] || [102, 102, 102];
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.rect(colX - 1, currentY - 6, 10, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      const statusText = supplier.status === 'active' ? 'A' : supplier.status === 'pending' ? 'E' : 'I';
      doc.text(statusText, colX, currentY);
      
      currentY += 15;
      rowCount++;
      
      // Vérifier si on doit passer à la page suivante
      if (currentY > 270 && index < filteredSuppliers.length - 1) {
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
    
    // Légende des statuts
    const legendY = currentY + 20;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Légende des statuts:', 20, legendY);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('A = Actif, E = En attente, I = Inactif', 20, legendY + 8);
    
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
    doc.save('rapport_fournisseurs_procurex.pdf');
    
    // Enregistrer la date d'export pour les activités récentes
    localStorage.setItem('lastExport', new Date().toISOString());
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
          Suppliers ({suppliers.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
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
          {hasPermission('supplier', 'create') && (
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ borderRadius: 2 }}
              onClick={() => setOpenAddDialog(true)}
            >
              Add Supplier
            </Button>
          )}
        </Box>
      </Box>
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 1 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search suppliers..."
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
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="date"
                label="From Date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="date"
                label="To Date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                {filteredSuppliers.length} suppliers found
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card sx={{ borderRadius: 3, boxShadow: 2, width: '100%' }}>
        <CardContent sx={{ p: 0, width: '100%' }}>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <div style={{ minWidth: 900 }}>
              <DataGrid
                rows={filteredSuppliers}
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {canEdit && (
          <MenuItem onClick={handleEdit}>
            <Edit sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        )}
        {canDelete && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* Add Supplier Dialog */}
      <AddSupplierDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onAdd={handleAddSupplier}
      />

      {/* Edit Supplier Dialog */}
      <EditSupplierDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        onSave={handleEditSupplier}
        supplier={selectedSupplier}
      />

      {/* Supplier Details Dialog */}
      <SupplierDetailsDialog
        open={openDetailsDialog}
        onClose={handleCloseDetailsDialog}
        supplier={selectedSupplier}
      />

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

export default SuppliersList; 