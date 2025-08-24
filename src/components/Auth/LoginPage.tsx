import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Business, Lock } from '@mui/icons-material';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    setError('');
    setIsLoading(true);

    try {
      // Demo login with predefined credentials
      let demoEmail = '';
      let demoPassword = 'demo123';

      switch (role) {
        case 'super_admin':
          demoEmail = 'superadmin@procurex.com';
          break;
        case 'tenant_admin':
          demoEmail = 'admin@company1.com';
          break;
        case 'user':
          demoEmail = 'user@company1.com';
          break;
        case 'viewer':
          demoEmail = 'viewer@company1.com';
          break;
        default:
          demoEmail = 'viewer@company1.com';
      }

      setEmail(demoEmail);
      setPassword(demoPassword);
      await login(demoEmail, demoPassword);
      navigate(from, { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Business sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              ProcureX
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Connectez-vous à votre espace de gestion des fournisseurs
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
            />

            <TextField
              fullWidth
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
              startIcon={isLoading ? <CircularProgress size={20} /> : <Lock />}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
              Connexions de démonstration
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleDemoLogin('super_admin')}
                disabled={isLoading}
                sx={{ justifyContent: 'flex-start' }}
              >
                🔑 Super Administrateur
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleDemoLogin('tenant_admin')}
                disabled={isLoading}
                sx={{ justifyContent: 'flex-start' }}
              >
                👨‍💼 Administrateur Tenant
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleDemoLogin('user')}
                disabled={isLoading}
                sx={{ justifyContent: 'flex-start' }}
              >
                👤 Utilisateur Standard
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleDemoLogin('viewer')}
                disabled={isLoading}
                sx={{ justifyContent: 'flex-start' }}
              >
                👁️ Lecteur Seulement
              </Button>
            </Box>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Version Multi-Tenant avec Gestion des Rôles et Permissions
            </Typography>
            
            {/* Debug button - temporary */}
            <Button
              variant="text"
              size="small"
              onClick={() => {
                console.log('=== DEBUG INFO ===');
                console.log('Users:', localStorage.getItem('users'));
                console.log('Tenants:', localStorage.getItem('tenants'));
                console.log('Roles:', localStorage.getItem('roles'));
                console.log('Current user:', localStorage.getItem('currentUser'));
                console.log('Current tenant:', localStorage.getItem('currentTenant'));
              }}
              sx={{ mt: 1, fontSize: '0.7rem' }}
            >
              Debug Info
            </Button>
            
            {/* Reset data button - temporary */}
            <Button
              variant="text"
              size="small"
              onClick={() => {
                console.log('=== RESETTING DATA ===');
                localStorage.removeItem('users');
                localStorage.removeItem('tenants');
                localStorage.removeItem('roles');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('currentTenant');
                window.location.reload();
              }}
              sx={{ mt: 1, fontSize: '0.7rem', ml: 1 }}
            >
              Reset Data
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
