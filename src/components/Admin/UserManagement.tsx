import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, UserRole, SYSTEM_ROLES, DEFAULT_PERMISSIONS } from '../../types';
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
  Switch,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  People,
  AdminPanelSettings,
  Person,
  Visibility,
  Security,
} from '@mui/icons-material';

const UserManagement: React.FC = () => {
  const { user: currentUser, tenant, hasRole, hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [userFormData, setUserFormData] = useState<{
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
    status: 'active' | 'inactive' | 'suspended';
  }>({
    email: '',
    firstName: '',
    lastName: '',
    roleId: '',
    status: 'active',
  });
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    permissions: [] as string[],
  });

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    // Filter users by current tenant
    const tenantUsers = storedUsers.filter((u: User) => u.tenantId === tenant?.id);
    setUsers(tenantUsers);
  };

  const loadRoles = () => {
    const storedRoles = JSON.parse(localStorage.getItem('roles') || '[]');
    console.log('Stored roles:', storedRoles);
    console.log('Current tenant:', tenant);
    console.log('Is super admin:', hasRole('super_admin'));
    
    // Super admin peut voir tous les rôles
    if (hasRole('super_admin')) {
      let tenantRoles = storedRoles.filter((r: UserRole) => 
        r.tenantId === 'system' || r.tenantId === tenant?.id
      );
      setRoles(tenantRoles);
      return;
    }
    
    // Les administrateurs de tenant ne peuvent voir que les rôles non-super admin
    let tenantRoles = storedRoles.filter((r: UserRole) => {
      // Exclure le rôle super_admin pour les administrateurs de tenant
      if (r.name === 'super_admin') return false;
      
      // Inclure les rôles système (tenant_admin, user, viewer) mais pas super_admin
      if (r.tenantId === 'system') return true;
      
      // Inclure les rôles spécifiques au tenant
      return r.tenantId === tenant?.id;
    });
    
    console.log('Filtered roles (tenant admin):', tenantRoles);
    setRoles(tenantRoles);
  };

  const handleOpenUserDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.role.id,
        status: user.status,
      });
    } else {
      setEditingUser(null);
      setUserFormData({
        email: '',
        firstName: '',
        lastName: '',
        roleId: '',
        status: 'active',
      });
    }
    setOpenUserDialog(true);
  };

  const handleOpenRoleDialog = (role?: UserRole) => {
    if (role) {
      setEditingRole(role);
      setRoleFormData({
        name: role.name,
        permissions: role.permissions.map(p => `${p.resource}:${p.action}`),
      });
    } else {
      setEditingRole(null);
      setRoleFormData({
        name: '',
        permissions: [],
      });
    }
    setOpenRoleDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
    setEditingUser(null);
  };

  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false);
    setEditingRole(null);
  };

  const handleUserSubmit = () => {
    if (editingUser) {
      // Update existing user
      const updatedUsers = users.map(u =>
        u.id === editingUser.id
          ? { ...u, ...userFormData, updatedAt: new Date() }
          : u
      );
      setUsers(updatedUsers);
      
      // Update in localStorage
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedAllUsers = allUsers.map((u: User) =>
        u.id === editingUser.id ? { ...u, ...userFormData, updatedAt: new Date() } : u
      );
      localStorage.setItem('users', JSON.stringify(updatedAllUsers));
    } else {
      // Create new user
      const defaultPassword = generateUserDefaultPassword(
        { firstName: userFormData.firstName, lastName: userFormData.lastName },
        { companyName: tenant!.companyName }
      );
      
      const newUser: User = {
        id: `user_${Date.now()}`,
        tenantId: tenant!.id,
        ...userFormData,
        password: defaultPassword,
        role: roles.find(r => r.id === userFormData.roleId)!,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      
      // Add to localStorage
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      allUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(allUsers));
      
      // Show success message with default credentials
      alert(`Utilisateur créé avec succès!\n\nIdentifiants par défaut:\n` +
        `Email: ${userFormData.email}\n` +
        `Mot de passe: ${defaultPassword}\n\n` +
        `IMPORTANT: Notez ces identifiants et demandez à l'utilisateur de changer son mot de passe lors de sa première connexion.`);
    }
    handleCloseUserDialog();
  };

  const handleRoleSubmit = () => {
    const permissions = roleFormData.permissions.map(perm => {
      const [resource, action] = perm.split(':');
      return {
        id: `perm_${Date.now()}_${Math.random()}`,
        name: `${resource} ${action}`,
        resource,
        action: action as any,
        description: `Permission to ${action} ${resource}`,
      };
    });

    if (editingRole) {
      // Update existing role
      const updatedRoles = roles.map(r =>
        r.id === editingRole.id
          ? { ...r, ...roleFormData, permissions, updatedAt: new Date() }
          : r
      );
      setRoles(updatedRoles);
      
      // Update in localStorage
      const allRoles = JSON.parse(localStorage.getItem('roles') || '[]');
      const updatedAllRoles = allRoles.map((r: UserRole) =>
        r.id === editingRole.id ? { ...r, ...roleFormData, permissions, updatedAt: new Date() } : r
      );
      localStorage.setItem('roles', JSON.stringify(updatedAllRoles));
    } else {
      // Create new role
      const newRole: UserRole = {
        id: `role_${Date.now()}`,
        tenantId: tenant!.id,
        ...roleFormData,
        permissions,
        isSystemRole: false,
        createdAt: new Date(),
      };
      const updatedRoles = [...roles, newRole];
      setRoles(updatedRoles);
      
      // Add to localStorage
      const allRoles = JSON.parse(localStorage.getItem('roles') || '[]');
      allRoles.push(newRole);
      localStorage.setItem('roles', JSON.stringify(allRoles));
    }
    handleCloseRoleDialog();
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      
      // Remove from localStorage
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedAllUsers = allUsers.filter((u: User) => u.id !== userId);
      localStorage.setItem('users', JSON.stringify(updatedAllUsers));
    }
  };

  const handleDeleteRole = (roleId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      const updatedRoles = roles.filter(r => r.id !== roleId);
      setRoles(updatedRoles);
      
      // Remove from localStorage
      const allRoles = JSON.parse(localStorage.getItem('roles') || '[]');
      const updatedAllRoles = allRoles.filter((r: UserRole) => r.id !== roleId);
      localStorage.setItem('roles', JSON.stringify(updatedAllRoles));
    }
  };

  const handleStatusChange = (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, status: newStatus, updatedAt: new Date() } : u
    );
    setUsers(updatedUsers);
    
    // Update in localStorage
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedAllUsers = allUsers.map((u: User) =>
      u.id === userId ? { ...u, status: newStatus, updatedAt: new Date() } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedAllUsers));
  };

  // Check permissions
  if (!hasPermission('user', 'read')) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
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

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case SYSTEM_ROLES.SUPER_ADMIN: return 'error';
      case SYSTEM_ROLES.TENANT_ADMIN: return 'warning';
      case SYSTEM_ROLES.USER: return 'primary';
      case SYSTEM_ROLES.VIEWER: return 'default';
      default: return 'info';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Gestion des Utilisateurs
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {hasPermission('user', 'create') && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenUserDialog()}
            >
              Nouvel Utilisateur
            </Button>
          )}
          {hasPermission('user', 'manage') && (
            <Button
              variant="outlined"
              startIcon={<Security />}
              onClick={() => handleOpenRoleDialog()}
            >
              Nouveau Rôle
            </Button>
          )}
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Utilisateurs
                  </Typography>
                  <Typography variant="h4">
                    {users.length}
                  </Typography>
                </Box>
                <People color="primary" sx={{ fontSize: 40 }} />
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
                    Utilisateurs Actifs
                  </Typography>
                  <Typography variant="h4">
                    {users.filter(u => u.status === 'active').length}
                  </Typography>
                </Box>
                <Person color="success" sx={{ fontSize: 40 }} />
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
                    Rôles
                  </Typography>
                  <Typography variant="h4">
                    {roles.length}
                  </Typography>
                </Box>
                <AdminPanelSettings color="warning" sx={{ fontSize: 40 }} />
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
                    Administrateurs
                  </Typography>
                  <Typography variant="h4">
                    {users.filter(u => u.role.name === SYSTEM_ROLES.TENANT_ADMIN).length}
                  </Typography>
                </Box>
                <Security color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Users Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', mb: 4 }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Dernière connexion</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role.name}
                      color={getRoleColor(user.role.name)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={getStatusColor(user.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {user.lastLoginAt 
                        ? new Date(user.lastLoginAt).toLocaleDateString('fr-FR')
                        : 'Jamais connecté'
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {hasPermission('user', 'update') && (
                        <IconButton
                          size="small"
                          onClick={() => handleOpenUserDialog(user)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                      )}
                      {hasPermission('user', 'delete') && (
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteUser(user.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Roles Table */}
      {hasPermission('user', 'manage') && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Utilisateurs</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {role.name}
                        </Typography>
                        {role.isSystemRole && (
                          <Chip label="Système" size="small" color="primary" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {role.permissions.slice(0, 3).map((perm) => (
                          <Chip
                            key={perm.id}
                            label={`${perm.resource}:${perm.action}`}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {role.permissions.length > 3 && (
                          <Chip
                            label={`+${role.permissions.length - 3}`}
                            size="small"
                            color="default"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {users.filter(u => u.role.id === role.id).length} utilisateur(s)
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenRoleDialog(role)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                        {!role.isSystemRole && (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRole(role.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Add/Edit User Dialog */}
      <Dialog open={openUserDialog} onClose={handleCloseUserDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prénom"
                value={userFormData.firstName}
                onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom"
                value={userFormData.lastName}
                onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Rôle</InputLabel>
                <Select
                  value={userFormData.roleId}
                  onChange={(e) => setUserFormData({ ...userFormData, roleId: e.target.value })}
                  label="Rôle"
                  required
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={userFormData.status}
                  onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value as any })}
                  label="Statut"
                  required
                >
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="inactive">Inactif</MenuItem>
                  <MenuItem value="suspended">Suspendu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Annuler</Button>
          <Button onClick={handleUserSubmit} variant="contained">
            {editingUser ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Role Dialog */}
      <Dialog open={openRoleDialog} onClose={handleCloseRoleDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRole ? 'Modifier le rôle' : 'Nouveau rôle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom du rôle"
                value={roleFormData.name}
                onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Permissions
              </Typography>
              <FormGroup>
                <Grid container spacing={2}>
                  {Object.entries(DEFAULT_PERMISSIONS).map(([key, permission]) => {
                    const [resource, action] = permission.split(':');
                    const isChecked = roleFormData.permissions.includes(permission);
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={key}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setRoleFormData({
                                    ...roleFormData,
                                    permissions: [...roleFormData.permissions, permission],
                                  });
                                } else {
                                  setRoleFormData({
                                    ...roleFormData,
                                    permissions: roleFormData.permissions.filter(p => p !== permission),
                                  });
                                }
                              }}
                            />
                          }
                          label={`${resource} ${action}`}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog}>Annuler</Button>
          <Button onClick={handleRoleSubmit} variant="contained">
            {editingRole ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
