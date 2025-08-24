import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Tenant, SYSTEM_ROLES, User } from '../../types';
import { generateUserDefaultPassword } from '../../utils/passwordUtils';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Business,
  People,
  Inventory,
  ShoppingCart,
  Visibility,
} from '@mui/icons-material';

const TenantManagement: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [systemRoles, setSystemRoles] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    domain: string;
    companyName: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    phone: string;
    email: string;
    subscriptionPlan: 'basic' | 'premium' | 'enterprise';
    maxUsers: number;
    maxSuppliers: number;
    maxProducts: number;
    selectedRoles: string[];
  }>({
    name: '',
    domain: '',
    companyName: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    phone: '',
    email: '',
    subscriptionPlan: 'basic',
    maxUsers: 5,
    maxSuppliers: 50,
    maxProducts: 200,
    selectedRoles: ['tenant_admin', 'user', 'viewer'],
  });

  useEffect(() => {
    loadTenants();
    loadSystemRoles();
  }, []);

  const loadTenants = () => {
    const storedTenants = JSON.parse(localStorage.getItem('tenants') || '[]');
    setTenants(storedTenants);
  };

  const loadSystemRoles = () => {
    const storedRoles = JSON.parse(localStorage.getItem('roles') || '[]');
    // Filtrer les rôles système (non spécifiques à un tenant)
    const systemRolesOnly = storedRoles.filter((role: any) => role.tenantId === 'system');
    setSystemRoles(systemRolesOnly);
  };

  const handleOpenDialog = (tenant?: Tenant) => {
    if (tenant) {
      setEditingTenant(tenant);
      setFormData({
        name: tenant.name,
        domain: tenant.domain,
        companyName: tenant.companyName,
        address: tenant.address,
        city: tenant.city,
        country: tenant.country,
        postalCode: tenant.postalCode,
        phone: tenant.phone,
        email: tenant.email,
        subscriptionPlan: tenant.subscriptionPlan,
        maxUsers: tenant.maxUsers,
        maxSuppliers: tenant.maxSuppliers,
        maxProducts: tenant.maxProducts,
        selectedRoles: ['tenant_admin', 'user', 'viewer'], // Rôles par défaut pour l'édition
      });
    } else {
      setEditingTenant(null);
      setFormData({
        name: '',
        domain: '',
        companyName: '',
        address: '',
        city: '',
        country: '',
        postalCode: '',
        phone: '',
        email: '',
        subscriptionPlan: 'basic',
        maxUsers: 5,
        maxSuppliers: 50,
        maxProducts: 200,
        selectedRoles: ['tenant_admin', 'user', 'viewer'],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTenant(null);
  };

  const handleSubmit = () => {
    if (editingTenant) {
      // Update existing tenant
      const updatedTenants = tenants.map(t =>
        t.id === editingTenant.id
          ? { ...t, ...formData, updatedAt: new Date() }
          : t
      );
      setTenants(updatedTenants);
      localStorage.setItem('tenants', JSON.stringify(updatedTenants));
    } else {
      // Create new tenant
      const newTenant: Tenant = {
        id: `tenant_${Date.now()}`,
        ...formData,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Create tenant-specific roles based on selected system roles
      const newRoles = formData.selectedRoles.map(roleName => {
        const systemRole = systemRoles.find(r => r.name === roleName);
        if (systemRole) {
          return {
            ...systemRole,
            id: `role_${roleName}_${newTenant.id}`,
            tenantId: newTenant.id,
            isSystemRole: false,
            createdAt: new Date(),
          };
        }
        return null;
      }).filter(Boolean);
      
      // Save new roles
      const existingRoles = JSON.parse(localStorage.getItem('roles') || '[]');
      const updatedRoles = [...existingRoles, ...newRoles];
      localStorage.setItem('roles', JSON.stringify(updatedRoles));
      
      // Create default users for the new tenant
      const defaultUsers: User[] = [];
      
      // Create tenant admin user using the email from the form
      const adminRole = newRoles.find(r => r.name === 'tenant_admin');
      if (adminRole && formData.email) {
        const adminPassword = generateUserDefaultPassword(
          { firstName: 'Admin', lastName: newTenant.companyName },
          newTenant
        );
        
        defaultUsers.push({
          id: `user_admin_${newTenant.id}`,
          tenantId: newTenant.id,
          email: formData.email, // Use the email from the form
          firstName: 'Admin',
          lastName: newTenant.companyName,
          password: adminPassword,
          role: adminRole,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      // Create standard user (only if admin email is different from a potential user email)
      const userRole = newRoles.find(r => r.name === 'user');
      if (userRole) {
        const userPassword = generateUserDefaultPassword(
          { firstName: 'User', lastName: newTenant.companyName },
          newTenant
        );
        
        // Create a user email based on the admin email domain
        const emailDomain = formData.email ? formData.email.split('@')[1] : newTenant.domain;
        const userEmail = `user@${emailDomain}`;
        
        defaultUsers.push({
          id: `user_standard_${newTenant.id}`,
          tenantId: newTenant.id,
          email: userEmail,
          firstName: 'User',
          lastName: newTenant.companyName,
          password: userPassword,
          role: userRole,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      // Save new users
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = [...existingUsers, ...defaultUsers];
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      const updatedTenants = [...tenants, newTenant];
      setTenants(updatedTenants);
      localStorage.setItem('tenants', JSON.stringify(updatedTenants));
      
      // Show success message with default credentials
      const adminPassword = adminRole ? generateUserDefaultPassword({ firstName: 'Admin', lastName: newTenant.companyName }, newTenant) : 'N/A';
      const userPassword = userRole ? generateUserDefaultPassword({ firstName: 'User', lastName: newTenant.companyName }, newTenant) : 'N/A';
      
      const adminEmail = formData.email || `admin@${newTenant.domain}`;
      const emailDomain = formData.email ? formData.email.split('@')[1] : newTenant.domain;
      const userEmail = `user@${emailDomain}`;
      
      const credentialsMessage = `Tenant créé avec succès!

Utilisateurs par défaut créés:

ADMIN:
Email: ${adminEmail}
Mot de passe: ${adminPassword}

UTILISATEUR:
Email: ${userEmail}
Mot de passe: ${userPassword}

IMPORTANT: Notez ces identifiants et demandez aux utilisateurs de changer leur mot de passe lors de leur première connexion.`;

      alert(credentialsMessage);
    }
    handleCloseDialog();
  };

  const handleDeleteTenant = (tenantId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce tenant ?')) {
      const updatedTenants = tenants.filter(t => t.id !== tenantId);
      setTenants(updatedTenants);
      localStorage.setItem('tenants', JSON.stringify(updatedTenants));
    }
  };

  const handleStatusChange = (tenantId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    const updatedTenants = tenants.map(t =>
      t.id === tenantId ? { ...t, status: newStatus, updatedAt: new Date() } : t
    );
    setTenants(updatedTenants);
    localStorage.setItem('tenants', JSON.stringify(updatedTenants));
  };

  // Check if user is super admin
  if (!hasRole(SYSTEM_ROLES.SUPER_ADMIN)) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          Accès refusé. Seuls les super administrateurs peuvent accéder à cette page.
        </Alert>
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'error';
      case 'premium': return 'warning';
      case 'basic': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Gestion des Tenants
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nouveau Tenant
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Tenants
                  </Typography>
                  <Typography variant="h4">
                    {tenants.length}
                  </Typography>
                </Box>
                <Business color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Tenants Actifs
                  </Typography>
                  <Typography variant="h4">
                    {tenants.filter(t => t.status === 'active').length}
                  </Typography>
                </Box>
                <People color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Premium+
                  </Typography>
                  <Typography variant="h4">
                    {tenants.filter(t => t.subscriptionPlan !== 'basic').length}
                  </Typography>
                </Box>
                <Inventory color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Suspended
                  </Typography>
                  <Typography variant="h4">
                    {tenants.filter(t => t.status === 'suspended').length}
                  </Typography>
                </Box>
                <ShoppingCart color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tenants Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Tenant</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Limites</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Créé le</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {tenant.companyName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tenant.domain}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tenant.subscriptionPlan.toUpperCase()}
                      color={getPlanColor(tenant.subscriptionPlan)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="caption" display="block">
                        👥 {tenant.maxUsers} utilisateurs
                      </Typography>
                      <Typography variant="caption" display="block">
                        🏢 {tenant.maxSuppliers} fournisseurs
                      </Typography>
                      <Typography variant="caption" display="block">
                        📦 {tenant.maxProducts} produits
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tenant.status}
                      color={getStatusColor(tenant.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(tenant.createdAt).toLocaleDateString('fr-FR')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(tenant)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTenant(tenant.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Tenant Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTenant ? 'Modifier le Tenant' : 'Nouveau Tenant'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du tenant"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Domaine"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                margin="normal"
                required
                placeholder="company1.procurex.com"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom de l'entreprise"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Adresse"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ville"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pays"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Code postal"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Plan d'abonnement</InputLabel>
                <Select
                  value={formData.subscriptionPlan}
                  onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value as any })}
                  label="Plan d'abonnement"
                >
                  <MenuItem value="basic">Basic</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                  <MenuItem value="enterprise">Enterprise</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Max utilisateurs"
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Max fournisseurs"
                type="number"
                value={formData.maxSuppliers}
                onChange={(e) => setFormData({ ...formData, maxSuppliers: parseInt(e.target.value) })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Max produits"
                type="number"
                value={formData.maxProducts}
                onChange={(e) => setFormData({ ...formData, maxProducts: parseInt(e.target.value) })}
                margin="normal"
                required
              />
            </Grid>
            
            {/* Rôles disponibles pour ce tenant */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Rôles disponibles pour ce tenant
              </Typography>
              <Grid container spacing={2}>
                {systemRoles.map((role) => (
                  <Grid item xs={12} sm={6} md={4} key={role.id}>
                    <FormControl fullWidth>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <input
                          type="checkbox"
                          id={`role_${role.name}`}
                          checked={formData.selectedRoles.includes(role.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                selectedRoles: [...formData.selectedRoles, role.name]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                selectedRoles: formData.selectedRoles.filter(r => r !== role.name)
                              });
                            }
                          }}
                        />
                        <label htmlFor={`role_${role.name}`}>
                          <Typography variant="body2">
                            {role.name === 'super_admin' ? 'Super Administrateur' :
                             role.name === 'tenant_admin' ? 'Administrateur Tenant' :
                             role.name === 'user' ? 'Utilisateur Standard' :
                             role.name === 'viewer' ? 'Lecteur Seulement' : role.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {role.permissions.length} permissions
                          </Typography>
                        </label>
                      </Box>
                    </FormControl>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTenant ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantManagement;
