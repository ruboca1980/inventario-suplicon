import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Chip, IconButton, Menu, MenuItem, Divider, Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import SecurityIcon from '@mui/icons-material/Security';

import { getUsersRealTime, updateUser } from '../firebase/userServices';
import { getAuditHistory } from '../firebase/reportServices';
import { getCustomersRealTime } from '../firebase/customerServices';
import { getSuppliersRealTime } from '../firebase/supplierServices';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Estados para Historial y Mapas ---
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [customerMap, setCustomerMap] = useState(new Map());
  const [supplierMap, setSupplierMap] = useState(new Map());

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const openMenu = Boolean(anchorEl);

  useEffect(() => {
    // 1. Cargar Usuarios (Realtime)
    const unsubscribeUsers = getUsersRealTime((fetchedUsers) => {
      setUsers(fetchedUsers);
      setLoading(false);
    });

    // 2. Cargar Clientes (Realtime) para resolver nombres
    const unsubscribeCustomers = getCustomersRealTime((customers) => {
      const newMap = new Map();
      customers.forEach(c => newMap.set(c.id, c.name));
      setCustomerMap(newMap);
    });

    // 3. Cargar Proveedores (Realtime) para resolver nombres
    const unsubscribeSuppliers = getSuppliersRealTime((suppliers) => {
      const newMap = new Map();
      suppliers.forEach(s => newMap.set(s.id, s.name));
      setSupplierMap(newMap);
    });

    // 4. Cargar Historial (One-time fetch)
    const fetchHistory = async () => {
      setHistoryLoading(true);
      const data = await getAuditHistory();
      setHistory(data);
      setHistoryLoading(false);
    };
    fetchHistory();

    return () => {
      unsubscribeUsers();
      unsubscribeCustomers();
      unsubscribeSuppliers();
    };
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

  const userColumns = [
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

  const historyColumns = useMemo(() => [
    { field: 'date', headerName: 'Fecha', width: 120 },
    { field: 'time', headerName: 'Hora', width: 100 },
    {
      field: 'type',
      headerName: 'Tipo',
      width: 150,
      renderCell: (params) => {
        let color = 'default';
        if (params.value === 'ENTRADA') color = 'success';
        if (params.value === 'SALIDA') color = 'error';
        if (params.value === 'NOTA DE ENTREGA') color = 'info';
        return <Chip label={params.value} color={color} size="small" variant="outlined" />;
      }
    },
    {
      field: 'entityName',
      headerName: 'Nombre (Cliente/Prov.)',
      flex: 1,
      valueGetter: (value, row) => {
        if (row.entityNameFallback) return row.entityNameFallback;
        if (row.entityType === 'Cliente') return customerMap.get(row.entityId) || 'Cliente Desconocido';
        if (row.entityType === 'Proveedor') return supplierMap.get(row.entityId) || 'Proveedor Desconocido';
        return 'N/A';
      }
    },
    { field: 'user', headerName: 'Usuario', flex: 1 },
    { field: 'correlative', headerName: 'Correlativo', width: 150 },
  ], [customerMap, supplierMap]);

  return (
    <Paper sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Usuarios
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Administra el acceso y los permisos del personal.
      </Typography>

      {/* --- TABLA DE USUARIOS (Auto Height) --- */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <DataGrid
          rows={users}
          columns={userColumns}
          loading={loading}
          autoHeight // ¡Ajuste automático de altura!
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          pageSizeOptions={[5, 8, 10]} // Opciones solicitadas
          initialState={{
            pagination: { paginationModel: { pageSize: 8 } }, // Máximo 8 filas por defecto
          }}
          sx={{ minHeight: 200 }} // Altura mínima para que no se vea mal si está vacío
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* --- TABLA DE HISTORIAL DE TRANSACCIONES --- */}
      <Typography variant="h5" component="h2" gutterBottom>
        Historial de Transacciones
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Auditoría de las últimas operaciones realizadas en el sistema.
      </Typography>

      <Box sx={{ width: '100%', height: 500 }}>
        <DataGrid
          rows={history}
          columns={historyColumns}
          loading={historyLoading}
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: 'date', sort: 'desc' }] } // Ordenar por fecha por defecto (aunque ya viene ordenado)
          }}
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

      </Menu>
    </Paper>
  );
};

export default UsersPage;