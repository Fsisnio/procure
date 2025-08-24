import React, { useState } from 'react';
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
  Rating,
  FormHelperText,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Supplier } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface AddSupplierDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (supplier: Omit<Supplier, 'id' | 'registrationDate'>) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  category: string;
  contactPerson: string;
  website: string;
  taxId: string;
  rating: number;
  notes: string;
}

const AddSupplierDialog: React.FC<AddSupplierDialogProps> = ({ open, onClose, onAdd }) => {
  const { tenant } = useAuth();
  const [rating, setRating] = useState<number>(0);
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      postalCode: '',
      category: '',
      contactPerson: '',
      website: '',
      taxId: '',
      notes: '',
    },
  });

  const onSubmit = (data: FormData) => {
    const newSupplier: Omit<Supplier, 'id' | 'registrationDate'> = {
      ...data,
      status: 'pending',
      rating: rating,
      lastContactDate: new Date(),
      tenantId: tenant?.id || 'system', // Add tenantId with fallback
    };
    
    onAdd(newSupplier);
    reset();
    setRating(0);
    onClose();
  };

  const handleClose = () => {
    reset();
    setRating(0);
    onClose();
  };

  const categories = [
    'Technology',
    'Manufacturing',
    'Automotive',
    'Materials',
    'Food & Beverage',
    'Healthcare',
    'Retail',
    'Other',
  ];

  const countries = [
    'USA',
    'Canada',
    'UK',
    'Germany',
    'France',
    'Spain',
    'Italy',
    'Japan',
    'China',
    'India',
    'Australia',
    'Brazil',
    'Mexico',
    'Other',
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Add New Supplier
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Company Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                Company Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Company name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Company Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="category"
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.category && (
                      <FormHelperText>{errors.category.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#1976d2' }}>
                Contact Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="contactPerson"
                control={control}
                rules={{ required: 'Contact person is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Person"
                    fullWidth
                    error={!!errors.contactPerson}
                    helperText={errors.contactPerson?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                rules={{ 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="phone"
                control={control}
                rules={{ required: 'Phone number is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    fullWidth
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="website"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Website (Optional)"
                    fullWidth
                    placeholder="https://example.com"
                  />
                )}
              />
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#1976d2' }}>
                Address Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                rules={{ required: 'Address is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Street Address"
                    fullWidth
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Controller
                name="city"
                control={control}
                rules={{ required: 'City is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="City"
                    fullWidth
                    error={!!errors.city}
                    helperText={errors.city?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Controller
                name="country"
                control={control}
                rules={{ required: 'Country is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.country}>
                    <InputLabel>Country</InputLabel>
                    <Select {...field} label="Country">
                      {countries.map((country) => (
                        <MenuItem key={country} value={country}>
                          {country}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.country && (
                      <FormHelperText>{errors.country.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Controller
                name="postalCode"
                control={control}
                rules={{ required: 'Postal code is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Postal Code"
                    fullWidth
                    error={!!errors.postalCode}
                    helperText={errors.postalCode?.message}
                  />
                )}
              />
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#1976d2' }}>
                Additional Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="taxId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Tax ID (Optional)"
                    fullWidth
                    placeholder="TAX123456"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box>
                <Typography component="legend" sx={{ mb: 1 }}>
                  Initial Rating
                </Typography>
                <Rating
                  value={rating}
                  onChange={(event, newValue) => {
                    setRating(newValue || 0);
                  }}
                  size="large"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Notes (Optional)"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Additional notes about this supplier..."
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" sx={{ minWidth: 120 }}>
            Add Supplier
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddSupplierDialog; 