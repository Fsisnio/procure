import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import { Add, Delete, ShoppingCart } from '@mui/icons-material';
import { Order, OrderItem, Supplier, Product } from '../../types';

interface EditOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onEdit: (order: Order) => void;
  order: Order | null;
}

const EditOrderDialog: React.FC<EditOrderDialogProps> = ({ open, onClose, onEdit, order }) => {
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Get dynamic data from localStorage
  const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
  const products = JSON.parse(localStorage.getItem('products') || '[]');

  const availableProducts = products.filter((product: Product) => 
    product.supplierId === selectedSupplier
  );

  const selectedSupplierData = suppliers.find((s: Supplier) => s.id === selectedSupplier);

  // Initialize form when order changes
  useEffect(() => {
    if (order) {
      setSelectedSupplier(order.supplierId);
      setNotes(order.notes || '');
      setOrderItems([...order.items]);
    }
  }, [order]);

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) {
      setErrors({ item: 'Please select a product and enter a valid quantity' });
      return;
    }

    const product = products.find((p: Product) => p.id === selectedProduct);
    if (!product) return;

    const newItem: OrderItem = {
      id: String(orderItems.length + 1),
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

    if (!order) return;

    const updatedOrder: Order = {
      ...order,
      supplierId: selectedSupplier,
      supplierName: selectedSupplierData?.name || '',
      totalAmount: calculateTotal(),
      items: orderItems,
      notes: notes.trim() || undefined,
    };

    onEdit(updatedOrder);
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

  if (!order) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ShoppingCart color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Edit Order - {order.orderNumber}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Order Number (Read-only) */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Order Number"
              value={order.orderNumber}
              disabled
              sx={{ '& .MuiInputBase-input': { color: 'text.secondary' } }}
            />
          </Grid>

          {/* Order Date (Read-only) */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Order Date"
              value={new Date(order.orderDate).toLocaleDateString()}
              disabled
              sx={{ '& .MuiInputBase-input': { color: 'text.secondary' } }}
            />
          </Grid>

          {/* Supplier Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.supplier}>
              <InputLabel>Supplier *</InputLabel>
              <Select
                value={selectedSupplier}
                label="Supplier *"
                onChange={(e) => setSelectedSupplier(e.target.value)}
              >
                {suppliers.map((supplier: Supplier) => (
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
            <Divider sx={{ my: 2 }} />
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
                {availableProducts.map((product: Product) => (
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
                const product = products.find((p: Product) => p.id === selectedProduct);
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
                          <Delete />
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
          Update Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditOrderDialog; 