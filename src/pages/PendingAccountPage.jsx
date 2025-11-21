import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const PendingAccountPage = () => {
  const { logout } = useAuth();

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      bgcolor: '#f5f5f5' 
    }}>
      <Paper elevation={3} sx={{ p: 5, maxWidth: 500, textAlign: 'center', borderRadius: 2 }}>
        
        <AccessTimeIcon sx={{ fontSize: 80, color: '#E5B50D', mb: 2 }} />
        
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Cuenta en Espera
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Tu registro ha sido exitoso, pero tu cuenta aún está en estado <strong>Pendiente</strong>.
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Por razones de seguridad, un Administrador o el Desarrollador del sistema debe aprobar tu acceso manualmente antes de que puedas ingresar.
        </Typography>

        <Typography variant="body2" sx={{ mt: 3, mb: 4, bgcolor: '#fff3cd', p: 1, borderRadius: 1 }}>
          Por favor, contacta a tu supervisor para agilizar la activación.
        </Typography>

        <Button variant="outlined" color="primary" onClick={logout}>
          Volver al Inicio de Sesión
        </Button>
      </Paper>
    </Box>
  );
};

export default PendingAccountPage;