import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchOffIcon from '@mui/icons-material/SearchOff';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      bgcolor: '#f5f5f5',
      p: 2
    }}>
      <Paper elevation={3} sx={{ 
        p: 5, 
        textAlign: 'center', 
        maxWidth: 500, 
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <SearchOffIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        
        <Typography variant="h2" fontWeight="bold" color="primary" gutterBottom>
          404
        </Typography>
        
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Página no encontrada
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Parece que te has perdido. La página que buscas no existe o ha sido movida.
        </Typography>

        <Button 
          variant="contained" 
          size="large" 
          onClick={() => navigate('/dashboard')}
          sx={{ borderRadius: 2, px: 4 }}
        >
          Volver al Inicio
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;