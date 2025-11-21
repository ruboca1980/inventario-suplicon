import React from 'react';
import { Box } from '@mui/material';
import logo from '../assets/logo_nuevo-removebg-preview.png';

// Imágenes para el fondo
import mainBackgroundImg from '../assets/6.jpg'; // La imagen del camión para el fondo principal
import overlayImg1 from '../assets/2.jpg';    // Grúa diurna (para el panel flotante)
import overlayImg2 from '../assets/3.jpg';
import overlayImg3 from '../assets/4.jpg';   
import overlayImg4 from '../assets/5.jpg';
// Grúa nocturna (para el panel flotante)

const AuthLayout = ({ children }) => {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      width: '100%',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      position: 'relative',
      overflow: 'hidden',
      bgcolor: '#212121' // Fallback color
    }}>
      
      {/* --- LAYER 1: FONDO PRINCIPAL (Imagen del camión) --- */}
      <Box sx={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: `url(${mainBackgroundImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(100%) brightness(0.4)', // Oscurecemos la foto para legibilidad
          zIndex: 0,
          animation: 'slowZoom 40s infinite alternate', // Animación sutil de zoom
          '@keyframes slowZoom': {
            '0%': { transform: 'scale(1)' },
            '100%': { transform: 'scale(1.05)' },
          }
      }} />

      {/* --- LAYER 2: DEGRADADO CORPORATIVO (Rojo a Ámbar) --- */}
      <Box sx={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'linear-gradient(135deg, rgba(148, 35, 35, 0.9) 0%, rgba(229, 181, 13, 0.7) 100%)',
          zIndex: 1
      }} />

      {/* --- LAYER 3: PANEL LATERAL DE FOTOS FLOTANTE (Grúas) --- */}
      <Box sx={{
          width: '26%',
          height: '95%',
          position: 'absolute',
          top: '50%',
          left: '10%', // Posicionado a la izquierda
          transform: 'translateY(-50%) rotate(-0deg)', // Ligeramente inclinado
          zIndex: 3, // Por encima del degradado, pero debajo de la tarjeta de login
          display: { xs: 'none', sm: 'flex' }, // Visible solo en pantallas grandes
          flexDirection: 'column',
          gap: 2, // Espacio entre las imágenes
          p: 2,
          backgroundColor: 'rgba(148, 35, 35, 0.9)', // Fondo sutil para el panel
          borderRadius: 3,
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          
      }}>
          <Box 
            component="img" 
            src={overlayImg3} 
            sx={{ 
              width: '70%', 
              height: '70%', 
              opacity: 0.7, 
              objectFit: 'cover', 
              borderRadius: 2, 
              boxShadow: 8 
            }} 
          />
          <Box 
            component="img" 
            src={overlayImg2} 
            sx={{ 
              width: '70%', 
              height: '70%', 
              opacity: 0.9, 
              objectFit: 'cover', 
             
              borderRadius: 2, 
              boxShadow: 10, 
              mt: -8, // Ligeramente solapado
              ml: 8 // Desplazado
            }} 
          />
      </Box>

      {/* --- LAYER 4: MARCA DE AGUA DEL LOGO --- */}
      <Box component="img" src={logo} 
           sx={{
             position: 'absolute',
             bottom: '5%', 
             right: '5%',
             width: '40vw', 
             maxWidth: '700px', 
             opacity: 0.3, 
             filter: 'invert(1) brightness(2)', 
             zIndex: 2,
             pointerEvents: 'none',
             objectFit: 'contain'
           }} 
      />

      {/* --- LAYER 5: CONTENEDOR DE LA TARJETA DE LOGIN --- */}
      <Box sx={{ 
        position: 'relative', 
        zIndex: 10, 
        width: '100%', 
        maxWidth: '400px', 
        p: 2 
      }}>
         {children} {/* Aquí se renderizará LoginPage.jsx */}
      </Box>

    </Box>
  );
};

export default AuthLayout;