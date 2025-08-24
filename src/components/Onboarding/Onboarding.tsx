import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Container,
  Paper,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Business, 
  ShoppingCart, 
  TrendingUp, 
  Lock 
} from '@mui/icons-material';

const Onboarding: React.FC = () => {
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validCodes = ['SAMA2025', 'ALBA2025'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simuler un délai d'authentification
    setTimeout(() => {
      if (validCodes.includes(code.toUpperCase())) {
        // Stocker l'authentification dans localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('accessCode', code.toUpperCase());
        localStorage.setItem('accessDate', new Date().toISOString());
        navigate('/login');
      } else {
        setError('Code d\'accès invalide. Veuillez réessayer.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'center' }}>
          {/* Section de présentation */}
          <Box sx={{ flex: 1, color: 'white', textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
              ProcureX
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Plateforme de gestion des fournisseurs et des commandes
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Business sx={{ fontSize: 24 }} />
                <Typography variant="body1">Gestion complète des fournisseurs</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ShoppingCart sx={{ fontSize: 24 }} />
                <Typography variant="body1">Suivi des commandes en temps réel</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp sx={{ fontSize: 24 }} />
                <Typography variant="body1">Analytics et rapports détaillés</Typography>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Accédez à votre tableau de bord avec votre code d'authentification
            </Typography>
          </Box>

          {/* Formulaire d'authentification */}
          <Paper
            elevation={8}
            sx={{
              p: 4,
              borderRadius: 3,
              width: { xs: '100%', md: 400 },
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Lock sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                Authentification
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Entrez votre code d'accès pour continuer
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Code d'accès"
                value={code}
                onChange={handleCodeChange}
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                size="medium"
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                error={!!error}
                helperText={error}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={!code.trim() || isLoading}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                }}
              >
                {isLoading ? 'Vérification...' : 'Accéder au système'}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Utilisez le code adéquat pour avoir accès à la plateforme
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Onboarding; 