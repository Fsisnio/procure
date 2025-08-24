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
} from '@mui/material';
import { mockSuppliers } from '../../data/mockData';
import { Product } from '../../types';

interface EditProductDialogProps {
  open: boolean;
  onClose: () => void;
  onEdit: (editedProduct: Product) => void;
  product: Product | null;
}

const categories = ['Electronics', 'Furniture', 'Office', 'Other'];

const EditProductDialog: React.FC<EditProductDialogProps> = ({
  open,
  onClose,
  onEdit,
  product,
}) => {
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (product) {
      setEditedProduct({
        name: product.name,
        category: product.category,
        price: product.price,
        currency: product.currency,
        stockQuantity: product.stockQuantity,
        supplierId: product.supplierId,
        unit: product.unit,
        status: product.status,
        description: product.description,
        minStockLevel: product.minStockLevel,
      });
      setErrors({});
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProduct(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedProduct(prev => ({ ...prev, category: e.target.value }));
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedProduct(prev => ({ ...prev, supplierId: e.target.value }));
    if (errors.supplierId) {
      setErrors(prev => ({ ...prev, supplierId: '' }));
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedProduct(prev => ({ ...prev, status: e.target.value as Product['status'] }));
    if (errors.status) {
      setErrors(prev => ({ ...prev, status: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!editedProduct.name?.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!editedProduct.category) {
      newErrors.category = 'La catégorie est requise';
    }

    if (!editedProduct.price || isNaN(Number(editedProduct.price))) {
      newErrors.price = 'Le prix doit être un nombre valide';
    }

    if (!editedProduct.stockQuantity || isNaN(Number(editedProduct.stockQuantity))) {
      newErrors.stockQuantity = 'La quantité en stock doit être un nombre valide';
    }

    if (!editedProduct.supplierId) {
      newErrors.supplierId = 'Le fournisseur est requis';
    }

    if (!editedProduct.unit?.trim()) {
      newErrors.unit = "L'unité est requise";
    }

    if (!editedProduct.currency) {
      newErrors.currency = 'La devise est requise';
    }

    if (editedProduct.minStockLevel && isNaN(Number(editedProduct.minStockLevel))) {
      newErrors.minStockLevel = 'Le niveau de stock minimum doit être un nombre valide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm() || !product) return;

    const supplier = mockSuppliers.find(s => s.id === editedProduct.supplierId);
    
    const updatedProduct: Product = {
      ...product,
      name: editedProduct.name!,
      category: editedProduct.category!,
      price: Number(editedProduct.price),
      currency: editedProduct.currency!,
      stockQuantity: Number(editedProduct.stockQuantity),
      supplierId: editedProduct.supplierId!,
      supplierName: supplier ? supplier.name : '',
      unit: editedProduct.unit!,
      status: editedProduct.status!,
      description: editedProduct.description || '',
      minStockLevel: editedProduct.minStockLevel ? Number(editedProduct.minStockLevel) : 0,
    };

    onEdit(updatedProduct);
    onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!product) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span>Modifier le Produit</span>
          <Box sx={{ ml: 'auto', fontSize: '0.9rem', color: 'text.secondary' }}>
            ID: {product.id}
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <TextField
          label="Nom du Produit"
          name="name"
          value={editedProduct.name || ''}
          onChange={handleChange}
          fullWidth
          required
          error={!!errors.name}
          helperText={errors.name}
        />
        
        <TextField
          select
          label="Catégorie"
          name="category"
          value={editedProduct.category || ''}
          onChange={handleCategoryChange}
          fullWidth
          required
          error={!!errors.category}
          helperText={errors.category}
        >
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </TextField>
        
        <TextField
          select
          label="Fournisseur"
          name="supplierId"
          value={editedProduct.supplierId || ''}
          onChange={handleSupplierChange}
          fullWidth
          required
          error={!!errors.supplierId}
          helperText={errors.supplierId}
        >
          {mockSuppliers.map((supplier) => (
            <MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>
          ))}
        </TextField>
        
        <TextField
          label="Unité"
          name="unit"
          value={editedProduct.unit || ''}
          onChange={handleChange}
          fullWidth
          required
          error={!!errors.unit}
          helperText={errors.unit}
        />
        
        <TextField
          label="Prix"
          name="price"
          value={editedProduct.price || ''}
          onChange={handleChange}
          type="number"
          fullWidth
          required
          error={!!errors.price}
          helperText={errors.price}
          InputProps={{
            startAdornment: <span>{editedProduct.currency || 'XOF'}</span>,
          }}
        />
        
        <TextField
          select
          label="Devise"
          name="currency"
          value={editedProduct.currency || 'XOF'}
          onChange={handleChange}
          fullWidth
          required
          error={!!errors.currency}
          helperText={errors.currency}
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
        
        <TextField
          label="Quantité en Stock"
          name="stockQuantity"
          value={editedProduct.stockQuantity || ''}
          onChange={handleChange}
          type="number"
          fullWidth
          required
          error={!!errors.stockQuantity}
          helperText={errors.stockQuantity}
        />
        
        <TextField
          select
          label="Statut"
          name="status"
          value={editedProduct.status || ''}
          onChange={handleStatusChange}
          fullWidth
          required
          error={!!errors.status}
          helperText={errors.status}
        >
          <MenuItem value="available">Disponible</MenuItem>
          <MenuItem value="out_of_stock">En Rupture de Stock</MenuItem>
          <MenuItem value="discontinued">Discontinué</MenuItem>
        </TextField>
        
        <TextField
          label="Description"
          name="description"
          value={editedProduct.description || ''}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
        />
        
        <TextField
          label="Niveau de Stock Minimum"
          name="minStockLevel"
          value={editedProduct.minStockLevel || ''}
          onChange={handleChange}
          type="number"
          fullWidth
          error={!!errors.minStockLevel}
          helperText={errors.minStockLevel}
        />
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} variant="outlined">
          Annuler
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={Object.keys(errors).length > 0}
        >
          Mettre à Jour
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProductDialog; 