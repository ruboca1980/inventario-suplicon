import React, { useState } from 'react';
import { 
  Box, List, ListItemButton, ListItemIcon, ListItemText, 
  Divider, Typography, ListSubheader, IconButton, Tooltip 
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- ICONOS ---
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import BuildIcon from '@mui/icons-material/Build';
import InventoryIcon from '@mui/icons-material/Inventory';
import StoreIcon from '@mui/icons-material/Store';
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

// Iconos de control de menú
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';

const Sidebar = () => {
  const location = useLocation();
  const { isAdmin, isProgrammer } = useAuth(); 
  
  // --- ¡CAMBIO AQUÍ! ---
  // Inicializamos en false para que empiece cerrado
  const [isOpen, setIsOpen] = useState(false); 

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Función auxiliar renderItem mejorada con Tooltip
  const renderItem = (text, path, icon, color = 'inherit') => (
    <Tooltip title={!isOpen ? text : ""} placement="right" arrow>
      <ListItemButton
        component={Link}
        to={path}
        selected={isActive(path)}
        sx={{
          minHeight: 48,
          justifyContent: isOpen ? 'initial' : 'center', // Centra icono si está cerrado
          px: 2.5,
          borderLeft: isActive(path) ? `4px solid ${color !== 'inherit' ? color : '#1976d2'}` : '4px solid transparent',
          '&.Mui-selected': {
            bgcolor: 'action.selected',
            '&:hover': { bgcolor: 'action.hover' },
          },
          transition: 'all 0.2s' // Transición suave
        }}
      >
        <ListItemIcon 
          sx={{ 
            minWidth: 0,
            mr: isOpen ? 2 : 'auto', // Margen solo si está abierto
            justifyContent: 'center',
            color: isActive(path) ? (color !== 'inherit' ? color : 'primary.main') : 'text.secondary'
          }}
        >
          {icon}
        </ListItemIcon>
        
        {/* El texto solo se muestra si isOpen es true */}
        <ListItemText 
          primary={text} 
          sx={{ opacity: isOpen ? 1 : 0, display: isOpen ? 'block' : 'none' }} 
          primaryTypographyProps={{ 
            variant: 'body2',
            fontWeight: isActive(path) ? 'bold' : 'medium',
            color: isActive(path) ? 'text.primary' : 'text.secondary'
          }} 
        />
      </ListItemButton>
    </Tooltip>
  );

  // Función para renderizar los títulos de sección (se ocultan al cerrar)
  const renderSubheader = (text) => (
    <ListSubheader 
      sx={{ 
        fontWeight: 'bold', 
        letterSpacing: 1, 
        fontSize: '0.75rem', 
        opacity: isOpen ? 1 : 0, // Se desvanecen
        height: isOpen ? 'auto' : 0, // Desaparecen físicamente
        visibility: isOpen ? 'visible' : 'hidden',
        transition: 'all 0.2s'
      }}
    >
      {text}
    </ListSubheader>
  );

  return (
    <Box
      sx={{
        width: isOpen ? 260 : 70, // Ancho dinámico
        flexShrink: 0,
        bgcolor: 'background.paper',
        borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        height: 'calc(100vh - 64px)',
        overflowX: 'hidden', // Oculta scroll horizontal durante la animación
        overflowY: 'auto',
        pb: 4,
        transition: 'width 0.3s ease', // La magia de la animación suave
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* BOTÓN DE TOGGLE (EXPANDIR/CONTRAER) */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isOpen ? 'flex-end' : 'center', p: 1 }}>
        <IconButton onClick={toggleSidebar}>
          {isOpen ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>
      </Box>
      
      <Divider />

      {/* --- PRINCIPAL --- */}
      <List subheader={renderSubheader('PRINCIPAL')}>
        {renderItem('Dashboard', '/dashboard', <DashboardIcon />, '#1976d2')}
      </List>
      <Divider variant="middle" sx={{ my: 1, opacity: isOpen ? 1 : 0.5 }} />

      {/* --- OPERACIONES --- */}
      <List subheader={renderSubheader('OPERACIONES')}>
        {renderItem('Registrar Entrada', '/inventory/entry', <AddCircleOutlineIcon />, '#2e7d32')}
        {renderItem('Registrar Salida', '/inventory/exit', <RemoveCircleOutlineIcon />, '#d32f2f')}
        {renderItem('Nota de Entrega', '/delivery-note', <DescriptionIcon />, '#1976d2')}
        {renderItem('Instalaciones', '/installations', <BuildIcon />, '#009688')}
      </List>
      <Divider variant="middle" sx={{ my: 1, opacity: isOpen ? 1 : 0.5 }} />

      {/* --- GESTIÓN --- */}
      <List subheader={renderSubheader('GESTIÓN')}>
        {renderItem('Productos', '/products', <InventoryIcon />)}
        {renderItem('Proveedores', '/suppliers', <StoreIcon />)}
        {renderItem('Clientes', '/customers', <PeopleIcon />)}
        {renderItem('Personal', '/staff', <BadgeIcon />)}
      </List>
      <Divider variant="middle" sx={{ my: 1, opacity: isOpen ? 1 : 0.5 }} />

      {/* --- REPORTES --- */}
      <List subheader={renderSubheader('REPORTES')}>
        {renderItem('Stock Actual', '/reports/stock', <AssessmentIcon />)}
        {renderItem('Kardex', '/reports/kardex', <MenuBookIcon />)}
        {renderItem('Archivo', '/archive', <FolderOpenIcon />)}
      </List>

      {/* --- ADMIN --- */}
      {(isAdmin || isProgrammer) && (
        <>
          <Divider variant="middle" sx={{ my: 1, opacity: isOpen ? 1 : 0.5 }} />
          <List subheader={renderSubheader('ADMINISTRACIÓN')}>
            {renderItem('Usuarios', '/users', <AdminPanelSettingsIcon />, '#d32f2f')}
          </List>
        </>
      )}
    </Box>
  );
};

export default Sidebar;