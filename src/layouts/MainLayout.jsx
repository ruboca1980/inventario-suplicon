import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx'; // ¡Importamos el nuevo Sidebar!
import { Box, Container } from '@mui/material';

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 1. La Navbar se queda arriba ocupando todo el ancho */}
      <Navbar />

      {/* 2. Contenedor Flexible para Sidebar + Contenido */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        
        {/* A. El Sidebar a la izquierda */}
        <Sidebar />

        {/* B. El Área de Contenido a la derecha */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default', // Color de fondo gris suave de tu tema
            p: 3, // Padding alrededor del contenido
            overflow: 'auto', // Permite scroll si el contenido es muy largo
            height: 'calc(100vh - 64px)' // Altura restante
          }}
        >
          {/* Container limita el ancho máximo del contenido para que no se "estire" demasiado */}
          <Container maxWidth="xl" sx={{ mt: 0, mb: 4, px: { xs: 0 } }}>
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;