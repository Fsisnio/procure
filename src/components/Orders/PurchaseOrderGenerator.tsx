import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  Download,
} from '@mui/icons-material';
import { Product, Supplier } from '../../types';
import EnhancedExportDialog from './EnhancedExportDialog';
import ExportService, { ExportOptions, OrderData } from '../../utils/exportService';
import { useAuth } from '../../contexts/AuthContext';

interface PurchaseOrderItem {
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  unit: string;
}

interface PurchaseOrderGeneratorProps {
  open: boolean;
  onClose: () => void;
}

const PurchaseOrderGenerator: React.FC<PurchaseOrderGeneratorProps> = ({
  open,
  onClose,
}) => {
  const { tenant, user } = useAuth();
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [tvaRate, setTvaRate] = useState(20); // Taux de TVA par défaut à 20%
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [openEnhancedExport, setOpenEnhancedExport] = useState(false);

  // Charger les données depuis localStorage
  useEffect(() => {
    if (open) {
      const storedSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
      const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
      
      // Filter suppliers by tenant (except for super admin who can see all)
      const filteredSuppliers = user?.role?.name === 'super_admin' 
        ? storedSuppliers 
        : storedSuppliers.filter((supplier: any) => supplier.tenantId === tenant?.id);
      
      // Filter products by tenant (except for super admin who can see all)
      const filteredProducts = user?.role?.name === 'super_admin' 
        ? storedProducts 
        : storedProducts.filter((product: any) => product.tenantId === tenant?.id);
      
      setSuppliers(filteredSuppliers);
      setProducts(filteredProducts);
      
      // Initialiser les données si elles sont vides (seulement pour le tenant connecté)
      if (filteredSuppliers.length === 0 && user?.role?.name !== 'super_admin') {
        const mockSuppliers: Supplier[] = [
          { 
            id: '1', 
            name: 'Fournisseur A', 
            contactPerson: 'Contact A', 
            email: 'a@example.com', 
            phone: '123456789', 
            address: 'Adresse A', 
            city: 'Ville A',
            country: 'Pays A',
            postalCode: '12345',
            category: 'Général',
            status: 'active',
            rating: 4.5,
            registrationDate: new Date(),
            lastContactDate: new Date(),
            tenantId: tenant?.id || 'system'
          },
          { 
            id: '2', 
            name: 'Fournisseur B', 
            contactPerson: 'Contact B', 
            email: 'b@example.com', 
            phone: '987654321', 
            address: 'Adresse B', 
            city: 'Ville B',
            country: 'Pays B',
            postalCode: '54321',
            category: 'Général',
            status: 'active',
            rating: 4.0,
            registrationDate: new Date(),
            lastContactDate: new Date(),
            tenantId: tenant?.id || 'system'
          }
        ];
        
        // Ajouter les nouveaux suppliers au localStorage existant
        const allSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
        const updatedSuppliers = [...allSuppliers, ...mockSuppliers];
        localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
        setSuppliers(mockSuppliers);
      }
      
      if (filteredProducts.length === 0 && user?.role?.name !== 'super_admin') {
        const mockProducts: Product[] = [
          { 
            id: '1', 
            name: 'Produit A', 
            description: 'Description A', 
            category: 'Catégorie A', 
            unit: 'pièce', 
            price: 100, 
            currency: 'XOF', 
            supplierId: '1', 
            supplierName: 'Fournisseur A', 
            stockQuantity: 50, 
            minStockLevel: 10, 
            status: 'available', 
            createdAt: new Date(),
            tenantId: tenant?.id || 'system'
          },
          { 
            id: '2', 
            name: 'Produit B', 
            description: 'Description B', 
            category: 'Catégorie B', 
            unit: 'kg', 
            price: 25, 
            currency: 'XOF', 
            supplierId: '2', 
            supplierName: 'Fournisseur B', 
            stockQuantity: 100, 
            minStockLevel: 20, 
            status: 'available', 
            createdAt: new Date(),
            tenantId: tenant?.id || 'system'
          }
        ];
        
        // Ajouter les nouveaux products au localStorage existant
        const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
        const updatedProducts = [...allProducts, ...mockProducts];
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        setProducts(mockProducts);
      }
    }
  }, [open, tenant, user?.role?.name]);

  // Mettre à jour les produits disponibles quand le fournisseur change
  useEffect(() => {
    if (selectedSupplier && products.length > 0) {
      const filtered = products.filter((p: Product) => p.supplierId === selectedSupplier);
      setAvailableProducts(filtered);
      setSelectedProduct(''); // Réinitialiser la sélection de produit
    } else {
      setAvailableProducts([]);
      setSelectedProduct('');
    }
  }, [selectedSupplier, products]);

  // Générer un numéro de commande unique
  useEffect(() => {
    if (open && !orderNumber) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const timestamp = Date.now().toString().slice(-4);
      setOrderNumber(`PO-${year}-${month}-${day}-${timestamp}`);
    }
  }, [open, orderNumber]);

  // Définir la date de livraison par défaut (7 jours)
  useEffect(() => {
    if (open && !expectedDeliveryDate) {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 7);
      setExpectedDeliveryDate(deliveryDate.toISOString().split('T')[0]);
    }
  }, [open, expectedDeliveryDate]);

  const handleAddItem = () => {
    if (!selectedProduct || !quantity || !selectedSupplier) {
      setErrors({
        product: !selectedProduct ? 'Sélectionnez un produit' : '',
        quantity: !quantity ? 'Entrez une quantité' : '',
        supplier: !selectedSupplier ? 'Sélectionnez un fournisseur' : '',
      });
      return;
    }

    const product = products.find((p: Product) => p.id === selectedProduct);
    const supplier = suppliers.find((s: Supplier) => s.id === selectedSupplier);

    if (!product || !supplier) {
      setErrors({ general: 'Produit ou fournisseur non trouvé' });
      return;
    }

    // Vérifier que le prix est valide
    if (typeof product.price !== 'number' || isNaN(product.price)) {
      setErrors({ general: 'Prix du produit invalide' });
      return;
    }

    const newItem: PurchaseOrderItem = {
      productId: product.id,
      productName: product.name,
      supplierId: supplier.id,
      supplierName: supplier.name,
      quantity: Number(quantity),
      unitPrice: product.price,
      totalPrice: product.price * Number(quantity),
      currency: product.currency || 'XOF',
      unit: product.unit || 'unité',
    };

    // Vérifier si le produit est déjà dans la liste
    const existingItemIndex = orderItems.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      // Mettre à jour la quantité existante
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += Number(quantity);
      updatedItems[existingItemIndex].totalPrice = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
      setOrderItems(updatedItems);
    } else {
      // Ajouter un nouvel élément
      setOrderItems([...orderItems, newItem]);
    }

    // Réinitialiser les champs
    setSelectedProduct('');
    setQuantity('');
    setErrors({});
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(index);
      return;
    }

    const updatedItems = [...orderItems];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].totalPrice = newQuantity * updatedItems[index].unitPrice;
    setOrderItems(updatedItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleGeneratePDF = () => {
    if (orderItems.length === 0) {
      setErrors({ general: 'Ajoutez au moins un produit avant de générer le bon de commande' });
      return;
    }

    // Ouvrir le dialogue d'export amélioré
    setOpenEnhancedExport(true);
  };

  const handleEnhancedExport = async (format: string, options: ExportOptions) => {
    if (orderItems.length === 0) {
      setErrors({ general: 'Ajoutez au moins un produit avant de générer le bon de commande' });
      return;
    }

    try {
      const supplier = suppliers.find(s => s.id === selectedSupplier);
      
      const orderData: OrderData = {
        orderNumber: orderNumber || 'SANS-NUMERO',
        orderDate: orderDate,
        expectedDeliveryDate: expectedDeliveryDate,
        supplier: supplier || {},
        items: orderItems,
        notes: notes,
        total: calculateTotal(),
        tvaRate: tvaRate, // Ajouter le taux de TVA
        tenant: tenant ? {
          id: tenant.id,
          name: tenant.name,
          domain: tenant.domain,
          address: tenant.address,
          city: tenant.city,
          country: tenant.country,
          postalCode: tenant.postalCode,
          phone: tenant.phone,
          email: tenant.email
        } : undefined,
      };

      // S'assurer que le taux de TVA est passé dans les options
      const exportOptions = {
        ...options,
        tvaRate: tvaRate,
      };

      await ExportService.exportOrder(orderData, exportOptions);
      
      // Afficher un message de succès
      alert(`Bon de commande exporté avec succès en format ${format.toUpperCase()} !`);
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setErrors({ general: 'Erreur lors de l\'export. Veuillez réessayer.' });
    }
  };

  const handleClose = () => {
    setOrderItems([]);
    setSelectedSupplier('');
    setSelectedProduct('');
    setQuantity('');
    setOrderNumber('');
    setOrderDate(new Date().toISOString().split('T')[0]);
    setExpectedDeliveryDate('');
    setNotes('');
    setTvaRate(20); // Réinitialiser le taux de TVA
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ShoppingCart color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Générateur de Bon de Commande
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
        {/* Informations de base */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Numéro de Commande"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Date de Commande"
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Date de Livraison Prévue"
              type="date"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Fournisseur</InputLabel>
              <Select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                label="Fournisseur"
              >
                {suppliers.map((supplier: Supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Taux de TVA (%)"
              type="number"
              value={tvaRate}
              onChange={(e) => setTvaRate(Number(e.target.value))}
              fullWidth
              required
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              helperText="Taux de TVA applicable à cette commande"
              sx={{ mt: { xs: 2, md: 0 } }}
            />
          </Grid>
        </Grid>

        {/* Ajout de produits */}
        <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Ajouter des Produits
            </Typography>
            {selectedSupplier && (
              <Chip 
                label={`${availableProducts.length} produit(s) disponible(s)`}
                color={availableProducts.length > 0 ? 'success' : 'warning'}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Produit</InputLabel>
                <Select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  label="Produit"
                  disabled={!selectedSupplier}
                  displayEmpty
                >
                  {!selectedSupplier ? (
                    <MenuItem disabled>
                      Sélectionnez d'abord un fournisseur
                    </MenuItem>
                  ) : availableProducts.length === 0 ? (
                    <MenuItem disabled>
                      Aucun produit disponible pour ce fournisseur
                    </MenuItem>
                  ) : (
                    availableProducts.map((product: Product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name} - {product.currency} {product.price.toLocaleString('fr-FR', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })} / {product.unit}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {!selectedSupplier && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Sélectionnez un fournisseur pour voir les produits disponibles
                  </Typography>
                )}
                {selectedSupplier && availableProducts.length === 0 && (
                  <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                    Aucun produit trouvé pour ce fournisseur. Vérifiez que des produits sont associés à ce fournisseur.
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Quantité"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                fullWidth
                required
                InputProps={{
                  endAdornment: <InputAdornment position="end">
                    {availableProducts.find((p: Product) => p.id === selectedProduct)?.unit || 'unité'}
                  </InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddItem}
                fullWidth
                sx={{ height: 56 }}
              >
                Ajouter
              </Button>
            </Grid>
          </Grid>
          
          {errors.product && <Alert severity="error" sx={{ mt: 1 }}>{errors.product}</Alert>}
          {errors.quantity && <Alert severity="error" sx={{ mt: 1 }}>{errors.quantity}</Alert>}
          {errors.supplier && <Alert severity="error" sx={{ mt: 1 }}>{errors.supplier}</Alert>}
        </Paper>

        {/* Liste des produits */}
        {orderItems.length > 0 && (
          <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Produits de la Commande ({orderItems.length})
            </Typography>
            
            {/* En-têtes du tableau */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 1fr 1fr 1fr auto', 
              gap: 2, 
              p: 2, 
              backgroundColor: 'primary.main', 
              color: 'white',
              borderRadius: 1,
              mb: 2
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Produit</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Quantité</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Prix Unitaire</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Total</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</Typography>
            </Box>
            
            {/* Lignes du tableau */}
            {orderItems.map((item, index) => (
              <Box key={index} sx={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr 1fr auto', 
                gap: 2, 
                p: 2, 
                backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                borderRadius: 1,
                mb: 1,
                alignItems: 'center',
                border: '1px solid #e0e0e0'
              }}>
                {/* Nom du produit et fournisseur */}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {item.productName}
                  </Typography>
                  <Chip 
                    label={item.supplierName} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
                
                {/* Quantité */}
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                    >
                      <Remove />
                    </IconButton>
                    <Typography variant="body1" sx={{ minWidth: 40, fontWeight: 600 }}>
                      {item.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {item.unit}
                  </Typography>
                </Box>
                
                {/* Prix unitaire */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {item.currency} {item.unitPrice.toLocaleString('fr-FR', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    par {item.unit}
                  </Typography>
                </Box>
                
                {/* Total */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {item.currency} {item.totalPrice.toLocaleString('fr-FR', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </Typography>
                </Box>
                
                {/* Actions */}
                <Box sx={{ textAlign: 'center' }}>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveItem(index)}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
            ))}
            
            <Divider sx={{ my: 2 }} />
            
            {/* Affichage des totaux avec TVA */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr auto', 
              gap: 2, 
              p: 2, 
              backgroundColor: '#f8f9fa',
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#666' }}>
                  Total HT:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#666' }}>
                  TVA ({tvaRate}%):
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', mt: 1 }}>
                  Total TTC:
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#666' }}>
                  {orderItems[0]?.currency || 'XOF'} {calculateTotal().toLocaleString('fr-FR', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#666' }}>
                  {orderItems[0]?.currency || 'XOF'} {(calculateTotal() * tvaRate / 100).toLocaleString('fr-FR', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', mt: 1 }}>
                  {orderItems[0]?.currency || 'XOF'} {(calculateTotal() * (1 + tvaRate / 100)).toLocaleString('fr-FR', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Notes */}
        <TextField
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          fullWidth
          multiline
          rows={3}
          placeholder="Ajoutez des notes ou instructions pour cette commande..."
        />

        {errors.general && <Alert severity="error">{errors.general}</Alert>}
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} variant="outlined">
          Annuler
        </Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleGeneratePDF}
          disabled={orderItems.length === 0}
          sx={{ minWidth: 200 }}
        >
          Exporter le Bon de Commande
        </Button>
      </DialogActions>

      {/* Dialogue d'export amélioré */}
      <EnhancedExportDialog
        open={openEnhancedExport}
        onClose={() => setOpenEnhancedExport(false)}
        orderData={{
          orderNumber: orderNumber || 'SANS-NUMERO',
          orderDate: orderDate,
          expectedDeliveryDate: expectedDeliveryDate,
          supplier: suppliers.find(s => s.id === selectedSupplier) || {},
          items: orderItems,
          notes: notes,
          total: calculateTotal(),
          tvaRate: tvaRate, // Passer le taux de TVA
        }}
        onExport={handleEnhancedExport}
      />
    </Dialog>
  );
};

export default PurchaseOrderGenerator; 