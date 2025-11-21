import React, { useState } from 'react';
import { AppBar, Toolbar, Box, IconButton, Menu, MenuItem, Avatar, Typography, Tooltip, Divider, ListItemIcon } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo_nuevo-removebg-preview.png';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../context/ThemeContext';

// Iconos
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; // El botón del juicio final
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';

import ResetDatabaseModal from './ResetDatabaseModal.jsx';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const muiTheme = useMuiTheme();
  const { toggleTheme } = useTheme();
  const { user, logout, isProgrammer } = useAuth(); // Traemos 'isProgrammer'
  const navigate = useNavigate();
  
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const openUserMenu = Boolean(userAnchorEl);

  const handleUserClick = (event) => setUserAnchorEl(event.currentTarget);
  const handleUserClose = () => setUserAnchorEl(null);

  const handleLogout = async () => {
    handleUserClose();
    await logout();
    navigate('/login');
  };

  return (
    <>
      <AppBar
        position="static"
        elevation={0} // Sin sombra para un look más plano y moderno
        sx={{
          backgroundColor: muiTheme.palette.mode === 'light' ? '#fff' : muiTheme.palette.background.paper,
          color: muiTheme.palette.text.primary,
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)', // Línea sutil abajo
        }}
      >
        <Toolbar sx={{ minHeight: '64px' }}>
          
          {/* 1. LOGO (Izquierda) */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img
                src={logo}
                alt="Logo"
                style={{ height: '45px', marginRight: '10px' }}
              />
               {/* Opcional: Título de la App si quieres */}
               {/* <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
                  SUPLICON
               </Typography> */}
            </Link>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* 2. HERRAMIENTAS (Derecha) */}

          {/* A. Botón del Juicio Final (SOLO PROGRAMADOR) */}
          {isProgrammer && (
            <Tooltip title="[DANGER] Resetear Base de Datos">
              <IconButton 
                onClick={() => setIsResetModalOpen(true)}
                sx={{ 
                  mr: 1,
                  color: 'error.main',
                  border: '1px solid rgba(211, 47, 47, 0.3)',
                  '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' }
                }}
              >
                <DeleteForeverIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* B. Cambio de Tema */}
          <Tooltip title="Cambiar Tema">
            <IconButton onClick={toggleTheme} sx={{ mr: 2 }}>
              {muiTheme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          {/* C. Perfil de Usuario */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             {/* Nombre visible en pantallas grandes */}
             <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' }, fontWeight: 500 }}>
                {user?.name?.split(' ')[0]} {/* Solo el primer nombre */}
             </Typography>

             <IconButton onClick={handleUserClick} sx={{ p: 0 }}>
              <Avatar 
                alt={user?.name} 
                src={user?.photoURL} 
                sx={{ 
                  bgcolor: 'secondary.main', 
                  width: 40, height: 40,
                  border: '2px solid #fff',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            </IconButton>
          </Box>

        </Toolbar>
      </AppBar>

      {/* Menú Desplegable de Usuario */}
      <Menu
        anchorEl={userAnchorEl}
        open={openUserMenu}
        onClose={handleUserClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 200,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight="bold">{user?.name}</Typography>
          <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
        </Box>
        <Divider />
        
        <MenuItem component={Link} to="/profile" onClick={handleUserClose}>
          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
          Configuración
        </MenuItem>
        
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
          Cerrar Sesión
        </MenuItem>
      </Menu>
      
      <ResetDatabaseModal
        open={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />
    </>
  );
};

export default Navbar;