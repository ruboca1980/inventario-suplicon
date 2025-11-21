import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Divider, IconButton, Tooltip, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';

// Iconos
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; 
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Gráficas
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

// Componentes y Servicios
import DashboardWidget from '../components/DashboardWidget';
import { getInventoryRealTime } from '../firebase/inventoryServices';
import { getCompletedExits } from '../firebase/deliveryNoteServices';
import { getInstallationStats } from '../firebase/installationServices';

import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import ProductDetailModal from '../components/ProductDetailModal.jsx';

const DashboardPage = () => {
  const { user } = useAuth();
  
  const [inventoryItems, setInventoryItems] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // --- CAMBIO DE ESTADO ---
  const [yearExits, setYearExits] = useState(0); // Antes recentMovements
  // ------------------------
  
  const [installStats, setInstallStats] = useState({ pending: 0, installed: 0 });
  
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const unsubInventory = getInventoryRealTime((items) => {
      setInventoryItems(items);
      setTotalProducts(items.length);
      const lowStock = items.filter(item => item.currentStock <= (item.minStockLevel || 5)).length;
      setLowStockCount(lowStock);
      setLoading(false);
    });

    const fetchStats = async () => {
      const exits = await getCompletedExits();
      
      // --- LÓGICA NUEVA: FILTRAR POR AÑO ACTUAL ---
      const currentYear = new Date().getFullYear();
      const exitsThisYear = exits.filter(e => {
        const exitDate = e.date.toDate(); // Convertir Timestamp a Date
        return exitDate.getFullYear() === currentYear;
      }).length;
      
      setYearExits(exitsThisYear);
      // --------------------------------------------

      const stats = await getInstallationStats();
      setInstallStats(stats);
    };

    fetchStats();
    return () => unsubInventory();
  }, []);

  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const pieData = [
    { name: 'Instalados', value: installStats.installed },
    { name: 'Por Instalar', value: installStats.pending },
  ];
  const COLORS = ['#2e7d32', '#E5B50D'];

  const columns = [
    { field: 'sku', headerName: 'Código', width: 100 },
    { field: 'productName', headerName: 'Descripción', flex: 1 },
    { field: 'category', headerName: 'Categoría', width: 120 },
    { field: 'brand', headerName: 'Marca', width: 120 },
    { 
      field: 'currentStock', headerName: 'Stock', width: 90, align: 'center', headerAlign: 'center',
      renderCell: (params) => (
        <span style={{ fontWeight: 'bold', color: params.value <= (params.row.minStockLevel || 5) ? '#d32f2f' : '#2e7d32' }}>
          {params.value}
        </span>
      )
    },
    {
      field: 'actions', headerName: 'Detalles', width: 80, sortable: false, align: 'center',
      renderCell: (params) => (
        <Tooltip title="Ver Seriales">
          <IconButton color="primary" size="small" onClick={() => handleViewDetail(params.row)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  // Obtener nombre para mostrar
  const displayName = user?.name || user?.displayName || user?.email?.split('@')[0] || 'Usuario';

  return (
    <Box>
      {/* --- ENCABEZADO --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
          Hola, {displayName} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Resumen operativo del sistema.
        </Typography>
      </Box>

      {/* --- SECCIÓN 1: ALMACÉN (KPIs) --- */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#555' }}>
        Almacén
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardWidget
            title="Alertas de Stock"
            value={loading ? "..." : lowStockCount}
            icon={<WarningAmberIcon fontSize="large" />}
            color="#d32f2f" 
            onClick={() => window.location.href = '/reports/stock'} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardWidget
            title="Productos Activos"
            value={loading ? "..." : totalProducts}
            icon={<InventoryIcon fontSize="large" />}
            color="#1976d2" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          {/* --- WIDGET ACTUALIZADO --- */}
          <DashboardWidget
            title={`Total Salidas (${new Date().getFullYear()})`} // Muestra el año actual dinámicamente
            value={loading ? "..." : yearExits}
            icon={<TrendingUpIcon fontSize="large" />}
            color="#2e7d32" 
          />
          {/* -------------------------- */}
        </Grid>
      </Grid>

      {/* --- TABLA DE DISPONIBILIDAD --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            Equipos y Materiales Disponibles
        </Typography>
        <Paper sx={{ height: 400, width: '100%', boxShadow: 2 }}>
            <DataGrid
                rows={inventoryItems}
                columns={columns}
                loading={loading}
                getRowId={(row) => row.id}
                localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                pageSizeOptions={[5, 10]}
                initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
                sorting: { sortModel: [{ field: 'productName', sort: 'asc' }] }
                }}
                disableRowSelectionOnClick
            />
        </Paper>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* --- SECCIÓN 2: SERVICIOS DE CAMPO --- */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#555' }}>
        Servicios de Campo
      </Typography>
      
      <Grid container spacing={3}>
        
        {/* Columna Izquierda: Tarjetas de Números */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <DashboardWidget
                title="Pendientes por Instalar"
                value={installStats.pending}
                icon={<BuildIcon fontSize="large" />}
                color="#E5B50D" 
                onClick={() => window.location.href = '/installations'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DashboardWidget
                title="Equipos Instalados"
                value={installStats.installed}
                icon={<CheckCircleIcon fontSize="large" />}
                color="#2e7d32" 
                onClick={() => window.location.href = '/installations'}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Columna Derecha: Gráfica de Torta */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%', minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Progreso de Instalaciones</Typography>
            <Box sx={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60} 
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Typography variant="body2" color="text.secondary" align="center">
              Total Equipos en Campo: {installStats.pending + installStats.installed}
            </Typography>
          </Paper>
        </Grid>

      </Grid>

      {/* Modal de Detalles */}
      <ProductDetailModal 
        open={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        product={selectedProduct} 
      />

    </Box>
  );
};

export default DashboardPage;