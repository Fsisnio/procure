import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Card,
  CardContent,
  Rating,
  Link,
} from '@mui/material';
import {
  Business,
  Person,
  Email,
  Phone,
  Language,
  LocationOn,
  Star,
  CalendarToday,
  Category,
  Receipt,
  Notes,
} from '@mui/icons-material';
import { Supplier } from '../../types';
import { formatDateSafely } from '../../utils/dateUtils';

interface SupplierDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  supplier: Supplier | null;
}

const SupplierDetailsDialog: React.FC<SupplierDetailsDialogProps> = ({ 
  open, 
  onClose, 
  supplier 
}) => {
  if (!supplier) return null;

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
        return '✓';
      case 'pending':
        return '⏳';
      case 'inactive':
        return '✗';
      default:
        return '?';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#1976d2', width: 48, height: 48 }}>
            {supplier.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {supplier.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {supplier.category} • {supplier.contactPerson}
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Chip
              label={supplier.status}
              color={getStatusColor(supplier.status) as any}
              icon={<span>{getStatusIcon(supplier.status)}</span>}
              size="medium"
            />
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          {/* Company Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                  <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Company Information
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Business color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Company Name"
                      secondary={supplier.name}
                      primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Category color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Category"
                      secondary={supplier.category}
                      primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Person color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Contact Person"
                      secondary={supplier.contactPerson}
                      primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
                    />
                  </ListItem>
                  
                  {supplier.website && (
                    <ListItem>
                      <ListItemIcon>
                        <Language color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Website"
                        secondary={
                          <Link href={supplier.website} target="_blank" rel="noopener">
                            {supplier.website}
                          </Link>
                        }
                        primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
                      />
                    </ListItem>
                  )}
                  
                  {supplier.taxId && (
                    <ListItem>
                      <ListItemIcon>
                        <Receipt color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Tax ID"
                        secondary={supplier.taxId}
                        primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Contact Information
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Email color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={
                        <Link href={`mailto:${supplier.email}`}>
                          {supplier.email}
                        </Link>
                      }
                      primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Phone color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={
                        <Link href={`tel:${supplier.phone}`}>
                          {supplier.phone}
                        </Link>
                      }
                      primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Address Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                  <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Address Information
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <LocationOn color="primary" />
                  <Typography variant="body1">
                    {supplier.address}
                  </Typography>
                </Box>
                
                <Typography variant="body1" sx={{ ml: 4, mb: 1 }}>
                  {supplier.city}, {supplier.country} {supplier.postalCode}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Additional Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                  <Star sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Performance & Rating
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={supplier.rating} readOnly size="large" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {supplier.rating}/5
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Based on performance and reliability
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Timeline Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                  <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Timeline
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Registration Date"
                      secondary={formatDateSafely(supplier.registrationDate)}
                      primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
                    />
                  </ListItem>
                  
                  {supplier.lastContactDate && (
                    <ListItem>
                      <ListItemIcon>
                        <CalendarToday color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Last Contact"
                        secondary={formatDateSafely(supplier.lastContactDate)}
                        primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Notes */}
          {supplier.notes && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                    <Notes sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Notes
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {supplier.notes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button 
          variant="contained" 
          onClick={() => {
            // This would trigger edit mode
            onClose();
          }}
        >
          Edit Supplier
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SupplierDetailsDialog; 