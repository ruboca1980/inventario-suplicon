import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Tabs, Tab, IconButton, Tooltip, Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';

// Iconos
import BuildIcon from '@mui/icons-material/Build';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

// Servicios
import { getPendingInstallations, getInstalledEquipment } from '../firebase/installationServices';
import InstallationFormModal from '../components/InstallationFormModal.jsx';

// 1. IMPORTAR NOTISTACK
import { useSnackbar } from 'notistack';

const InstallationsPage = () => {
  // 2. INICIALIZAR
  const { enqueueSnackbar } = useSnackbar();

  // Estado de las Pestañas (0 = Pendientes, 1 = Instalados)
  const [tabValue, setTabValue] = useState(0);

  // Estados de Datos
  const [pendingList, setPendingList] = useState([]);
  const [installedList, setInstalledList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados del Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar datos según la pestaña activa
  const fetchData = async () => {
    setLoading(true);
    try {
      if (tabValue === 0) {
        // Cargar Pestaña 1: Pendientes
        const data = await getPendingInstallations();
        setPendingList(data);
      } else {
        // Cargar Pestaña 2: Instalados
        const data = await getInstalledEquipment();
        setInstalledList(data);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      // 3. NOTIFICACIÓN DE ERROR
      enqueueSnackbar('Error al cargar la lista de equipos.', { variant: 'error' });
    }
    setLoading(false);
  };

  // Recargar cuando cambiamos de pestaña
  useEffect(() => {
    fetchData();
  }, [tabValue]);

  // Manejador para cambiar de pestaña
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // --- MANEJADORES DE ACCIONES ---

  // Abre el modal de 'Registrar Instalación'
  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Cierra el modal. Si 'shouldReload' es true, refresca la tabla.
  const handleCloseModal = (shouldReload) => {
    setSelectedItem(null);
    setIsModalOpen(false);
    if (shouldReload) {
      fetchData(); // Recarga los datos para que el ítem desaparezca de "Pendientes"
    }
  };

  // Abre el enlace del PDF en una nueva pestaña
  const handleOpenReport = (url) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      // 3. REEMPLAZO DE ALERT
      enqueueSnackbar('No hay enlace de reporte disponible para este equipo.', { variant: 'info' });
    }
  };

  // --- DEFINICIÓN DE COLUMNAS ---

  // Columnas para la tabla de "Pendientes"
  const columnsPending = [
    { field: 'serialNumber', headerName: 'Serial', width: 150, fontWeight: 'bold' },
    { field: 'productName', headerName: 'Descripción', flex: 1 },
    { field: 'brand', headerName: 'Marca', width: 120 },
    { field: 'clientName', headerName: 'Cliente Destino', flex: 1 },
    {
      field: 'dispatchDate',
      headerName: 'Fecha Despacho',
      width: 130,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString('es-VE') : '-'
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Button
          variant="contained"
          color="secondary"
          size="small"
          startIcon={<BuildIcon />}
          onClick={() => handleOpenModal(params.row)}
        >
          Instalar
        </Button>
      ),
    },
  ];

  // Columnas para la tabla de "Instalados"
  const columnsInstalled = [
    { field: 'serialNumber', headerName: 'Serial', width: 140 },
    { field: 'productName', headerName: 'Descripción', width: 200 },
    { field: 'clientName', headerName: 'Cliente', width: 180 },
    {
      field: 'installationDate',
      headerName: 'Fecha Inst.',
      width: 120,
      valueFormatter: (value) => {
        if (!value) return '-';
        const [y, m, d] = value.split('-');
        return `${d}/${m}/${y}`;
      }
    },
    {
      field: 'location',
      headerName: 'Ubicación (Macolla/Pozo)',
      flex: 1,
      valueGetter: (value, row) => {
        if (row.location) {
          return `${row.location.macolla} - ${row.location.pozo}`;
        }
        return 'N/A';
      }
    },
    { field: 'technician', headerName: 'Técnico', width: 150 },
    {
      field: 'reportUrl',
      headerName: 'Reporte',
      width: 100,
      align: 'center',
      renderCell: (params) => (
        <Tooltip title="Ver Reporte Digital">
          <IconButton
            color="primary"
            onClick={() => handleOpenReport(params.value)}
            disabled={!params.value}
          >
            <PictureAsPdfIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Instalaciones
        </Typography>

        {/* --- PESTAÑAS --- */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab icon={<PendingIcon />} iconPosition="start" label="Pendientes por Instalar" />
          <Tab icon={<CheckCircleIcon />} iconPosition="start" label="Historial de Instalados" />
        </Tabs>
      </Box>

      {/* --- TABLA DE DATOS (DATA GRID) --- */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          // Carga filas y columnas dinámicamente según la pestaña
          rows={tabValue === 0 ? pendingList : installedList}
          columns={tabValue === 0 ? columnsPending : columnsInstalled}
          loading={loading}
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      </Box>

      {/* --- MODAL DE REGISTRO (oculto) --- */}
      <InstallationFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        item={selectedItem}
      />
    </Paper>
  );
};

export default InstallationsPage;