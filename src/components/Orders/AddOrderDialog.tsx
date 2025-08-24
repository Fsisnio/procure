import React, { useState } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

import { Order, OrderItem } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface AddOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (order: Omit<Order, 'id'>) => void;
}

const AddOrderDialog: React.FC<AddOrderDialogProps> = ({ open, onClose, onAdd }) => {
  const { tenant, user } = useAuth();
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState<Omit<OrderItem, 'id'>[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Get dynamic data from localStorage with tenant filtering
  const allSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
  const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
  
  // Filter suppliers by tenant (except for super admin who can see all)
  const suppliers = user?.role?.name === 'super_admin' 
    ? allSuppliers 
    : allSuppliers.filter((supplier: any) => supplier.tenantId === tenant?.id);
  
  // Filter products by tenant (except for super admin who can see all)
  const products = user?.role?.name === 'super_admin' 
    ? allProducts 
    : allProducts.filter((product: any) => product.tenantId === tenant?.id);

  const availableProducts = products.filter((product: any) => 
    product.supplierId === selectedSupplier
  );

  const selectedSupplierData = suppliers.find((s: any) => s.id === selectedSupplier);

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) {
      setErrors({ item: 'Please select a product and enter a valid quantity' });
      return;
    }

    const product = products.find((p: any) => p.id === selectedProduct);
    if (!product) return;

    const newItem: Omit<OrderItem, 'id'> = {
      productId: selectedProduct,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      totalPrice: product.price * quantity,
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedProduct('');
    setQuantity(1);
    setErrors({});
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedSupplier) {
      newErrors.supplier = 'Please select a supplier';
    }

    if (orderItems.length === 0) {
      newErrors.items = 'Please add at least one item to the order';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newOrder: Omit<Order, 'id'> = {
      orderNumber: `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      supplierId: selectedSupplier,
      supplierName: selectedSupplierData?.name || '',
      orderDate: new Date(),
      expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: 'pending',
      totalAmount: calculateTotal(),
      items: orderItems.map((item, index) => ({ ...item, id: String(index + 1) })),
      notes: notes.trim() || undefined,
      tenantId: tenant?.id || 'system', // Ajouter le tenantId
    };

    onAdd(newOrder);
    handleClose();
  };

  const handleClose = () => {
    setSelectedSupplier('');
    setSelectedProduct('');
    setQuantity(1);
    setNotes('');
    setOrderItems([]);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* <ShoppingCart color="primary" /> */}
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Create New Order
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Supplier Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.supplier}>
              <InputLabel>Supplier *</InputLabel>
              <Select
                value={selectedSupplier}
                label="Supplier *"
                onChange={(e) => setSelectedSupplier(e.target.value)}
              >
                {suppliers.map((supplier: any) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {errors.supplier && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {errors.supplier}
              </Typography>
            )}
          </Grid>

          {/* Notes */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this order..."
            />
          </Grid>

          <Grid item xs={12}>
            {/* <Divider sx={{ my: 2 }} /> */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Order Items
            </Typography>
          </Grid>

          {/* Add Item Section */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Product</InputLabel>
              <Select
                value={selectedProduct}
                label="Product"
                onChange={(e) => setSelectedProduct(e.target.value)}
                disabled={!selectedSupplier}
              >
                {availableProducts.map((product: any) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name} - ${product.price}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddItem}
              disabled={!selectedProduct || quantity <= 0}
              sx={{ height: 56 }}
            >
              Add Item
            </Button>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              {selectedProduct && quantity > 0 && (() => {
                const product = products.find((p: any) => p.id === selectedProduct);
                return product ? `Total: $${product.price * quantity}` : '';
              })()}
            </Typography>
          </Grid>

          {errors.item && (
            <Grid item xs={12}>
              <Typography variant="caption" color="error">
                {errors.item}
              </Typography>
            </Grid>
          )}

          {/* Order Items List */}
          {orderItems.length > 0 && (
            <Grid item xs={12}>
              <List>
                {orderItems.map((item, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={item.productName}
                      secondary={`Quantity: ${item.quantity} | Unit Price: $${item.unitPrice}`}
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          ${item.totalPrice.toLocaleString('fr-FR', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </Typography>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveItem(index)}
                          color="error"
                        >
                          <Remove />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Total Amount:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  Total: ${calculateTotal().toLocaleString('fr-FR', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </Typography>
              </Box>
            </Grid>
          )}

          {errors.items && (
            <Grid item xs={12}>
              <Typography variant="caption" color="error">
                {errors.items}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={orderItems.length === 0}
        >
          Create Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrderDialog; 