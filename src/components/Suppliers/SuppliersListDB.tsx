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
  CircularProgress,
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
import { Supplier } from '../../types';
import { SupplierService } from '../../services/supplierService';
import AddSupplierDialog from './AddSupplierDialog';
import EditSupplierDialog from './EditSupplierDialog';
import SupplierDetailsDialog from './SupplierDetailsDialog';
import { formatDateSafely } from '../../utils/dateUtils';
import { useAuth } from '../../contexts/AuthContext';
// @ts-ignore
import jsPDF from 'jspdf';

const SuppliersListDB: React.FC = () => {
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
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load suppliers from database
  const loadSuppliers = async () => {
    if (!tenant?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let suppliersData: Supplier[];
      
      if (searchTerm.trim()) {
        suppliersData = await SupplierService.searchSuppliers(searchTerm, tenant.id);
      } else if (statusFilter !== 'all') {
        suppliersData = await SupplierService.getSuppliersByCategory(statusFilter, tenant.id);
      } else {
        suppliersData = await SupplierService.getAllSuppliers(tenant.id);
      }
      
      setSuppliers(suppliersData);
    } catch (err) {
      console.error('Error loading suppliers:', err);
      setError('Failed to load suppliers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load suppliers on component mount and when filters change
  useEffect(() => {
    loadSuppliers();
  }, [tenant?.id, searchTerm, statusFilter]);

  // Handle supplier creation
  const handleSupplierCreated = async (newSupplier: Omit<Supplier, 'id' | 'registrationDate'>) => {
    try {
      const createdSupplier = await SupplierService.createSupplier(newSupplier);
      setSuppliers(prev => [...prev, createdSupplier]);
      setShowSuccess(true);
      setSuccessMessage('Supplier created successfully!');
      setOpenAddDialog(false);
    } catch (err) {
      console.error('Error creating supplier:', err);
      setError('Failed to create supplier. Please try again.');
    }
  };

  // Handle supplier update
  const handleSupplierUpdated = async (updatedSupplier: Supplier) => {
    try {
      const result = await SupplierService.updateSupplier(
        updatedSupplier.id,
        updatedSupplier,
        tenant?.id || ''
      );
      setSuppliers(prev => 
        prev.map(s => s.id === result.id ? result : s)
      );
      setShowSuccess(true);
      setSuccessMessage('Supplier updated successfully!');
      setOpenEditDialog(false);
    } catch (err) {
      console.error('Error updating supplier:', err);
      setError('Failed to update supplier. Please try again.');
    }
  };

  // Handle supplier deletion
  const handleSupplierDeleted = async (supplierId: string) => {
    try {
      const deleted = await SupplierService.deleteSupplier(supplierId, tenant?.id || '');
      if (deleted) {
        setSuppliers(prev => prev.filter(s => s.id !== supplierId));
        setShowSuccess(true);
        setSuccessMessage('Supplier deleted successfully!');
      }
      setAnchorEl(null);
    } catch (err) {
      console.error('Error deleting supplier:', err);
      setError('Failed to delete supplier. Please try again.');
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, supplier: Supplier) => {
    setAnchorEl(event.currentTarget);
    setSelectedSupplier(supplier);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSupplier(null);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Suppliers List', 20, 20);
    
    // Add suppliers data
    let yPosition = 40;
    suppliers.forEach((supplier, index) => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${supplier.name}`, 20, yPosition);
      doc.setFontSize(10);
      doc.text(`Email: ${supplier.email || 'N/A'}`, 20, yPosition + 7);
      doc.text(`Phone: ${supplier.phone || 'N/A'}`, 20, yPosition + 14);
      doc.text(`Status: ${supplier.status}`, 20, yPosition + 21);
      
      yPosition += 35;
    });
    
    doc.save('suppliers-list.pdf');
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Category', 'Status', 'Rating', 'Contact Person'];
    const csvContent = [
      headers.join(','),
      ...suppliers.map(supplier => [
        supplier.name,
        supplier.email || '',
        supplier.phone || '',
        supplier.category || '',
        supplier.status,
        supplier.rating,
        supplier.contactPerson || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'suppliers-list.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.category || 'No category'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Contact',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {params.value || 'No email'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.phone || 'No phone'}
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
          color={params.value === 'active' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 100,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Star sx={{ color: 'gold', fontSize: 16, mr: 0.5 }} />
          <Typography variant="body2">
            {params.value || 0}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'lastContactDate',
      headerName: 'Last Contact',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? formatDateSafely(params.value) : 'Never'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={(event) => handleMenuClick(event, params.row)}
          size="small"
        >
          <MoreVert />
        </IconButton>
      ),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2">
              Suppliers
            </Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<PictureAsPdf />}
                onClick={handleExportPDF}
                sx={{ mr: 1 }}
              >
                Export PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={handleExportCSV}
                sx={{ mr: 1 }}
              >
                Export CSV
              </Button>
              {hasPermission('suppliers', 'create') && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenAddDialog(true)}
                >
                  Add Supplier
                </Button>
              )}
            </Box>
          </Box>

          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={handleSearch}
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
                  onChange={handleStatusFilterChange}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <DataGrid
            rows={suppliers}
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
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddSupplierDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onAdd={handleSupplierCreated}
      />

      <EditSupplierDialog
        open={openEditDialog}
        supplier={selectedSupplier}
        onClose={() => setOpenEditDialog(false)}
        onSave={handleSupplierUpdated}
      />

      <SupplierDetailsDialog
        open={openDetailsDialog}
        supplier={selectedSupplier}
        onClose={() => setOpenDetailsDialog(false)}
      />

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          setOpenDetailsDialog(true);
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {hasPermission('suppliers', 'update') && (
          <MenuItem onClick={() => {
            setOpenEditDialog(true);
            handleMenuClose();
          }}>
            <Edit sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        )}
        {hasPermission('suppliers', 'delete') && (
          <MenuItem 
            onClick={() => selectedSupplier && handleSupplierDeleted(selectedSupplier.id)}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SuppliersListDB;
