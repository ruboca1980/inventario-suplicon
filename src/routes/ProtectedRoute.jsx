import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
// Importamos la página de espera
import PendingAccountPage from '../pages/PendingAccountPage';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // 1. Cargando...
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 2. No hay usuario -> Al Login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 3. Usuario Bloqueado -> Expulsar o mostrar mensaje
  if (user.status === 'blocked') {
    alert("Tu cuenta ha sido bloqueada por un administrador.");
    return <Navigate to="/login" />; // O podrías crear una BlockedPage
  }

  // 4. Usuario Pendiente -> Sala de Espera
  // (Solo si NO es el programador, por si acaso te bloqueas a ti mismo por error)
  if (user.status === 'pending' && user.role !== 'programmer') {
    return <PendingAccountPage />;
  }

  // 5. Usuario Activo -> Pasa adelante
  return <>{children}</>;
};

export default ProtectedRoute;