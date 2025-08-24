import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add, Edit, Delete, FileDownload, PictureAsPdf } from '@mui/icons-material';
import { mockSuppliers, mockProducts } from '../../data/mockData';
import { Product } from '../../types';
import EditProductDialog from './EditProductDialog';
import { useAuth } from '../../contexts/AuthContext';
// @ts-ignore
import jsPDF from 'jspdf';

const categories = ['Electronics', 'Furniture', 'Office', 'Other'];

// Type local pour le formulaire d'ajout de produit
type NewProductForm = {
  name: string;
  category: string;
  price: string;
  stockQuantity: string;
  supplierId: string;
  unit: string;
  status: string;
  description: string;
  minStockLevel: string;
  currency: string; // Added for currency
};

const ProductsList: React.FC = () => {
  const { hasPermission, tenant, user } = useAuth();
  const initialProducts = () => {
    const saved = localStorage.getItem('products');
    const allProducts = saved ? JSON.parse(saved) : mockProducts;
    
    // Filter products by tenant (except for super admin who can see all)
    if (user?.role?.name === 'super_admin') {
      return allProducts;
    }
    
    // For tenant users, only show products that belong to their tenant
    const tenantProducts = allProducts.filter((product: Product) => 
      product.tenantId === tenant?.id
    );
    
    // Si le tenant n'a pas de products, retourner un tableau vide
    // Cela garantit que les nouveaux administrateurs ont des pages vides
    if (tenantProducts.length === 0) {
      console.log(`No products found for tenant ${tenant?.id}, returning empty list`);
      return [];
    }
    
    return tenantProducts;
  };
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<NewProductForm>({
    name: '',
    category: '',
    price: '',
    stockQuantity: '',
    supplierId: '',
    unit: '',
    status: 'available',
    description: '',
    minStockLevel: '',
    currency: 'XOF', // Default currency
  });
  const [formError, setFormError] = useState('');

  // Sauvegarde à chaque modification
  useEffect(() => {
    const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
    
    // Update only the products for the current tenant
    const otherTenantProducts = allProducts.filter((product: Product) => 
      product.tenantId !== tenant?.id
    );
    
    const updatedAllProducts = [...otherTenantProducts, ...products];
    localStorage.setItem('products', JSON.stringify(updatedAllProducts));
  }, [products, tenant?.id]);

  // Fonction pour obtenir les suppliers filtrés par tenant
  const getTenantFilteredSuppliers = () => {
    const savedSuppliers = localStorage.getItem('suppliers');
    const allSuppliers = savedSuppliers ? JSON.parse(savedSuppliers) : mockSuppliers;
    
    // Super admin peut voir tous les suppliers
    if (user?.role?.name === 'super_admin') {
      return allSuppliers;
    }
    
    // Les utilisateurs de tenant ne voient que leurs suppliers
    return allSuppliers.filter((supplier: any) => supplier.tenantId === tenant?.id);
  };

  const handleEdit = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setSelectedProduct(product);
      setOpenEditDialog(true);
    }
  };

  const handleEditProduct = (editedProduct: Product) => {
    setProducts(products.map(p => p.id === editedProduct.id ? editedProduct : p));
    setSuccessMessage('Produit modifié avec succès');
    setShowSuccess(true);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    setSuccessMessage('Produit supprimé avec succès');
    setShowSuccess(true);
  };

  const handleOpenDialog = () => {
    setNewProduct({
      name: '',
      category: '',
      price: '',
      stockQuantity: '',
      supplierId: '',
      unit: '',
      status: 'available',
      description: '',
      minStockLevel: '',
      currency: 'XOF', // Default currency
    });
    setFormError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewProduct({ ...newProduct, category: e.target.value });
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewProduct({ ...newProduct, supplierId: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewProduct({ ...newProduct, status: e.target.value as Product['status'] });
  };

  const handleAddProduct = () => {
    if (
      !newProduct.name ||
      !newProduct.category ||
      !newProduct.price ||
      !newProduct.stockQuantity ||
      !newProduct.supplierId ||
      !newProduct.unit
    ) {
      setFormError('All fields are required');
      return;
    }
    if (
      isNaN(Number(newProduct.price)) ||
      isNaN(Number(newProduct.stockQuantity)) ||
      (newProduct.minStockLevel && isNaN(Number(newProduct.minStockLevel)))
    ) {
      setFormError('Price, Stock, and Min Stock Level must be numbers');
      return;
    }
    const supplier = getTenantFilteredSuppliers().find((s: any) => s.id === newProduct.supplierId);
    setProducts([
      {
        id: String(Date.now()),
        name: newProduct.name,
        category: newProduct.category,
        price: Number(newProduct.price),
        currency: newProduct.currency || 'XOF', // Devise par défaut
        stockQuantity: Number(newProduct.stockQuantity),
        supplierId: newProduct.supplierId,
        supplierName: supplier ? supplier.name : '',
        unit: newProduct.unit,
        status: (newProduct.status as Product['status']) || 'available',
        description: newProduct.description || '',
        minStockLevel: newProduct.minStockLevel ? Number(newProduct.minStockLevel) : 0,
        createdAt: new Date(),
        tenantId: tenant?.id || 'system', // Add tenantId with fallback
      },
      ...products,
    ]);
    setShowSuccess(true);
    setSuccessMessage('Product added successfully');
    setOpenDialog(false);
  };

  // Filter products based on date range
  const filteredProducts = products.filter((product) => {
    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(product.createdAt) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDate = matchesDate && new Date(product.createdAt) <= new Date(dateTo);
    }
    return matchesDate;
  });

  const handleExportCSV = () => {
    const header = ['Name', 'Category', 'Supplier', 'Unit', 'Currency', 'Price', 'Stock Quantity', 'Status', 'Description', 'Min Stock Level'];
    const rows = filteredProducts.map(product => [
      product.name,
      product.category,
      product.supplierName,
      product.unit,
      product.currency,
      product.price,
      product.stockQuantity,
      product.status,
      product.description,
      product.minStockLevel
    ]);
    const csvContent = [header, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_report.csv';
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
    doc.text('Rapport des Produits', 20, 35);
    
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
    const totalValue = filteredProducts.reduce((sum, product) => sum + (product.price * product.stockQuantity), 0);
    const availableProducts = filteredProducts.filter(product => product.status === 'available').length;
    const outOfStockProducts = filteredProducts.filter(product => product.status === 'out_of_stock').length;
    const discontinuedProducts = filteredProducts.filter(product => product.status === 'discontinued').length;
    // Note: totalProducts was removed as it was unused
    
    const formattedTotalValue = totalValue.toLocaleString('fr-FR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    
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
    doc.text(`Total des produits: ${filteredProducts.length}`, 25, 78);
    doc.text(`Valeur totale du stock: $${formattedTotalValue}`, 25, 87);
    doc.text(`Disponibles: ${availableProducts} | En rupture: ${outOfStockProducts} | Discontinués: ${discontinuedProducts}`, 25, 96);
    
    // Tableau des produits
    const startY = 110;
    
    // En-têtes du tableau
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(20, startY, 170, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    
    const headers = ['Nom', 'Catégorie', 'Fournisseur', 'Prix', 'Stock', 'Statut'];
    const columnWidths = [32, 22, 32, 22, 18, 25]; // Largeurs ajustées
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
    
    filteredProducts.forEach((product, index) => {
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
      const name = product.name.length > 11 ? 
        product.name.substring(0, 9) + '...' : product.name;
      doc.text(name, colX, currentY);
      colX += columnWidths[0];
      
      // Catégorie
      doc.text(product.category, colX, currentY);
      colX += columnWidths[1];
      
      // Fournisseur (tronqué si trop long)
      const supplier = product.supplierName.length > 9 ? 
        product.supplierName.substring(0, 7) + '...' : product.supplierName;
      doc.text(supplier, colX, currentY);
      colX += columnWidths[2];
      
      // Prix
      const formattedPrice = product.price.toLocaleString('fr-FR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
      doc.text(`${product.currency} ${formattedPrice}`, colX, currentY);
      colX += columnWidths[3];
      
      // Stock
      doc.text(product.stockQuantity.toString(), colX, currentY);
      colX += columnWidths[4];
      
      // Statut avec couleur
      const statusColors: { [key: string]: number[] } = {
        'available': [76, 175, 80],
        'out_of_stock': [244, 67, 54],
        'discontinued': [102, 102, 102]
      };
      
      const statusColor = statusColors[product.status] || [102, 102, 102];
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.rect(colX - 1, currentY - 6, 22, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      const statusText = product.status === 'available' ? 'Dispo' : 
                        product.status === 'out_of_stock' ? 'Rupture' : 'Discont';
      doc.text(statusText, colX, currentY);
      
      currentY += 15;
      rowCount++;
      
      // Vérifier si on doit passer à la page suivante
      if (currentY > 270 && index < filteredProducts.length - 1) {
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
    doc.text('Dispo = Disponible, Rupture = En rupture de stock, Discont = Discontinué', 20, legendY + 8);
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
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
    doc.save('rapport_produits_procurex.pdf');
    
    // Enregistrer la date d'export pour les activités récentes
    localStorage.setItem('lastExport', new Date().toISOString());
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'category', headerName: 'Category', flex: 1 },
    { field: 'supplierName', headerName: 'Supplier', flex: 1 },
    { field: 'unit', headerName: 'Unit', width: 100 },
    {
      field: 'price',
      headerName: 'Prix',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.row.currency} {params.row.price.toLocaleString('fr-FR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </Typography>
      ),
    },
    { field: 'stockQuantity', headerName: 'Stock', width: 100 },
    { field: 'status', headerName: 'Status', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {hasPermission('product', 'update') && (
            <Tooltip title="Edit">
              <IconButton color="info" onClick={() => handleEdit(params.row.id)} size="small">
                <Edit />
              </IconButton>
            </Tooltip>
          )}
          {hasPermission('product', 'delete') && (
            <Tooltip title="Delete">
              <IconButton color="error" onClick={() => handleDelete(params.row.id)} size="small">
                <Delete />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%', px: { xs: 0, md: 2 }, py: 4, backgroundColor: '#fafbfc', minHeight: '80vh' }}>
      {showSuccess && (
        <Snackbar open={showSuccess} autoHideDuration={2500} onClose={() => setShowSuccess(false)}>
          <Alert severity="success" sx={{ width: '100%' }}>{successMessage}</Alert>
        </Snackbar>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Products ({filteredProducts.length})
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
          {hasPermission('product', 'create') && (
            <Button variant="contained" startIcon={<Add />} sx={{ borderRadius: 2 }} onClick={handleOpenDialog}>
              New Product
            </Button>
          )}
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
                {filteredProducts.length} products found
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <DataGrid
              rows={filteredProducts}
              columns={columns}
              autoHeight
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' },
                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f8f9fa', borderBottom: '2px solid #e0e0e0' },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Dialog d'ajout de produit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            name="name"
            value={newProduct.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            select
            label="Category"
            name="category"
            value={newProduct.category}
            onChange={handleCategoryChange}
            fullWidth
            required
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Supplier"
            name="supplierId"
            value={newProduct.supplierId}
            onChange={handleSupplierChange}
            fullWidth
            required
          >
            {getTenantFilteredSuppliers().map((supplier: any) => (
              <MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Unit"
            name="unit"
            value={newProduct.unit}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Price"
            name="price"
            value={newProduct.price}
            onChange={handleChange}
            type="number"
            fullWidth
            required
            InputProps={{
              startAdornment: <span>{newProduct.currency || 'XOF'}</span>,
            }}
          />
          <TextField
            label="Stock Quantity"
            name="stockQuantity"
            value={newProduct.stockQuantity}
            onChange={handleChange}
            type="number"
            fullWidth
            required
          />
          <TextField
            select
            label="Status"
            name="status"
            value={newProduct.status}
            onChange={handleStatusChange}
            fullWidth
            required
          >
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="out_of_stock">Out of Stock</MenuItem>
            <MenuItem value="discontinued">Discontinued</MenuItem>
          </TextField>
          <TextField
            label="Description"
            name="description"
            value={newProduct.description}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Min Stock Level"
            name="minStockLevel"
            value={newProduct.minStockLevel}
            onChange={handleChange}
            type="number"
            fullWidth
          />
          <TextField
            label="Currency"
            name="currency"
            value={newProduct.currency}
            onChange={handleChange}
            fullWidth
            select
            required
          >
            <MenuItem value="XOF">XOF (Franc CFA)</MenuItem>
            <MenuItem value="NGN">NGN (Naira Nigérian)</MenuItem>
            <MenuItem value="GHS">GHS (Cedi Ghanéen)</MenuItem>
            <MenuItem value="KES">KES (Shilling Kenyan)</MenuItem>
            <MenuItem value="EGP">EGP (Livre Égyptienne)</MenuItem>
            <MenuItem value="MAD">MAD (Dirham Marocain)</MenuItem>
            <MenuItem value="TND">TND (Dinar Tunisien)</MenuItem>
            <MenuItem value="USD">USD (Dollar US)</MenuItem>
            <MenuItem value="EUR">EUR (Euro)</MenuItem>
          </TextField>
          {formError && <Alert severity="error">{formError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleAddProduct}>Add</Button>
        </DialogActions>
      </Dialog>

             {/* Dialog d'édition de produit */}
       <EditProductDialog
         open={openEditDialog}
         onClose={() => setOpenEditDialog(false)}
         product={selectedProduct}
         onEdit={handleEditProduct}
       />
    </Box>
  );
};

export default ProductsList; 