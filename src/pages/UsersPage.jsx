import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Chip, IconButton, Menu, MenuItem, Divider
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import SecurityIcon from '@mui/icons-material/Security';

import { getUsersRealTime, updateUser } from '../firebase/userServices';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';

const UsersPage = () => {
  const { user: currentUser } = useAuth(); 
  const { enqueueSnackbar } = useSnackbar();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const openMenu = Boolean(anchorEl);

  useEffect(() => {
    const unsubscribe = getUsersRealTime((fetchedUsers) => {
      setUsers(fetchedUsers);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleChangeStatus = async (newStatus) => {
    try {
      await updateUser(selectedUser.id, { status: newStatus });
      enqueueSnackbar(`Usuario ${newStatus === 'active' ? 'activado' : 'bloqueado'} correctamente.`, { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Error al actualizar estado.", { variant: 'error' });
    }
    handleMenuClose();
  };

  const handleChangeRole = async (newRole) => {
    try {
      await updateUser(selectedUser.id, { role: newRole });
      enqueueSnackbar(`Rol actualizado correctamente.`, { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Error al cambiar rol.", { variant: 'error' });
    }
    handleMenuClose();
  };

  const columns = [
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'email', headerName: 'Correo', flex: 1 },
    { 
      field: 'role', 
      headerName: 'Rol', 
      width: 150,
      renderCell: (params) => {
        let color = 'default';
        let label = params.value;

        if (params.value === 'programmer') {
            color = 'secondary';
            label = 'Desarrollador'; 
        }
        if (params.value === 'admin') {
            color = 'primary';
            label = 'Jefe (Admin)';
        }
        if (params.value === 'user') {
            label = 'Usuario';
        }
        
        return <Chip label={label} color={color} variant="outlined" size="small" />;
      }
    },
    { 
      field: 'status', 
      headerName: 'Estatus', 
      width: 130,
      renderCell: (params) => {
        const isPending = params.value === 'pending';
        const isActive = params.value === 'active';
        return (
          <Chip 
            label={isPending ? 'Pendiente' : isActive ? 'Activo' : 'Bloqueado'} 
            color={isActive ? 'success' : isPending ? 'warning' : 'error'} 
            size="small" 
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 80,
      sortable: false,
      align: 'center',
      renderCell: (params) => {
        // No puedes editarte a ti mismo ni editar a otros desarrolladores
        if (params.row.id === currentUser.uid || params.row.role === 'programmer') return null;
        
        return (
          <IconButton onClick={(e) => handleMenuClick(e, params.row)}>
            <MoreVertIcon />
          </IconButton>
        );
      }
    }
  ];

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Usuarios
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Administra el acceso y los permisos del personal.
      </Typography>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          pageSizeOptions={[10, 25]}
        />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
      >
        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
          CAMBIAR ESTATUS
        </Typography>
        <MenuItem onClick={() => handleChangeStatus('active')} disabled={selectedUser?.status === 'active'}>
          <CheckCircleIcon color="success" sx={{ mr: 1 }} /> Aprobar / Activar
        </MenuItem>
        <MenuItem onClick={() => handleChangeStatus('blocked')} disabled={selectedUser?.status === 'blocked'}>
          <BlockIcon color="error" sx={{ mr: 1 }} /> Bloquear Acceso
        </MenuItem>
        
        <Divider sx={{ my: 1 }} />

        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
          CAMBIAR ROL
        </Typography>
        <MenuItem onClick={() => handleChangeRole('user')} selected={selectedUser?.role === 'user'}>
          Usuario (Operador)
        </MenuItem>
        <MenuItem onClick={() => handleChangeRole('admin')} selected={selectedUser?.role === 'admin'}>
          <SecurityIcon color="primary" sx={{ mr: 1 }} /> Jefe (Admin)
        </MenuItem>
        
        {/* SECCIÓN DE DESARROLLADOR ELIMINADA POR SEGURIDAD */}

      </Menu>
    </Paper>
  );
};

export default UsersPage;