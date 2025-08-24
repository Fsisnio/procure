import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
} from '@mui/material';
import {
  Search,
  Logout,
} from '@mui/icons-material';

interface HeaderProps {
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - 240px)`,
        ml: '240px',
        backgroundColor: 'white',
        color: '#333',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        height: '64px', // Hauteur fixe et compacte
        minHeight: '64px',
        maxHeight: '64px',
      }}
    >
      <Toolbar sx={{ 
        minHeight: '64px !important',
        height: '64px',
        py: 0,
        px: 3
      }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontSize: '1rem',
            fontWeight: 500,
            color: '#666'
          }}
        >
          Welcome back, Admin
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            color="inherit" 
            size="small"
            sx={{ 
              color: '#666',
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            <Search fontSize="small" />
          </IconButton>
          
          <Button
            variant="outlined"
            startIcon={<Logout />}
            onClick={handleLogout}
            size="small"
            sx={{ 
              borderRadius: 2,
              borderColor: '#e0e0e0',
              color: '#666',
              py: 0.5,
              px: 2,
              fontSize: '0.875rem',
              height: '36px',
              '&:hover': {
                borderColor: '#d32f2f',
                color: '#d32f2f',
                backgroundColor: '#fff5f5',
              }
            }}
          >
            Déconnexion
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 