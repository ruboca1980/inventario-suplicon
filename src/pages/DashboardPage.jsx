import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Divider, IconButton, Tooltip, Paper, Chip, Avatar, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useAuth } from '../context/AuthContext';

// Iconos
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FilterListIcon from '@mui/icons-material/FilterList';

// Gráficas
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Componentes y Servicios
import DashboardWidget from '../components/DashboardWidget';
import { getInventoryRealTime } from '../firebase/inventoryServices';
import { getCompletedExits } from '../firebase/deliveryNoteServices';
import { getInstallationStats } from '../firebase/installationServices';
import { getRecentTransactions } from '../firebase/transactionServices';
import { getCustomersRealTime } from '../firebase/customerServices';

import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import ProductDetailModal from '../components/ProductDetailModal.jsx';

const DashboardPage = () => {
  const { user } = useAuth();

  // Data States
  const [inventoryItems, setInventoryItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);
  const [allExits, setAllExits] = useState([]);
  const [installStats, setInstallStats] = useState({ pending: 0, installed: 0 });

  // Filter States
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // KPI States
  const [lowStockCount, setLowStockCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [yearlyExitsCount, setYearlyExitsCount] = useState(0);

  // UI States
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    // 1. Inventory & Low Stock
    const unsubInventory = getInventoryRealTime((items) => {
      setInventoryItems(items);
      setTotalProducts(items.length);
      const lowStock = items.filter(item => item.currentStock <= (item.minStockLevel || 5)).length;
      setLowStockCount(lowStock);
      setLoading(false);
    });

    // 2. Customers
    const unsubCustomers = getCustomersRealTime((custs) => {
      setCustomers(custs);
    });

    const fetchStats = async () => {
      // 3. Installation Stats
      const stats = await getInstallationStats();
      setInstallStats(stats);

      // 4. Recent Movements
      const recent = await getRecentTransactions(10);
      setRecentMovements(recent);

      // 5. All Exits (for filtering)
      const exits = await getCompletedExits();
      setAllExits(exits);
    };

    fetchStats();
    return () => {
      unsubInventory();
      unsubCustomers();
    };
  }, []);

  // --- FILTERING LOGIC ---

  // Filter Inventory by Type
  const filteredInventory = inventoryItems.filter(item => {
    if (selectedType === 'all') return true;
    return item.type === selectedType; // Assumes 'type' property exists (Equipo/Material)
  });

  // Filter Exits by Year and Customer
  const filteredExits = allExits.filter(exit => {
    const exitDate = exit.date.toDate();
    const matchesYear = exitDate.getFullYear() === selectedYear;
    const matchesCustomer = selectedCustomer === 'all' || exit.customerId === selectedCustomer;
    return matchesYear && matchesCustomer;
  });

  // Update Yearly Exits Count based on filters
  useEffect(() => {
    setYearlyExitsCount(filteredExits.length);
  }, [filteredExits]);

  // Prepare Data for "Dispatches by Customer" Chart
  const dispatchesByCustomerData = customers.map(cust => {
    const count = filteredExits.filter(e => e.customerId === cust.id).length;
    return { name: cust.name, count };
  }).filter(d => d.count > 0).sort((a, b) => b.count - a.count).slice(0, 10); // Top 10

  // --- HANDLERS ---

  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  // --- CHART DATA ---
  const pieData = [
    { name: 'Instalados', value: installStats.installed },
    { name: 'Por Instalar', value: installStats.pending },
  ];
  const COLORS = ['#2e7d32', '#E5B50D'];

  // --- COLUMNS ---
  const columns = [
    { field: 'category', headerName: 'Categoría', width: 150 },
    { field: 'productName', headerName: 'Descripción', flex: 1 },
    { field: 'brand', headerName: 'Marca', width: 120 },
    { field: 'type', headerName: 'Tipo', width: 100 },
    {
      field: 'currentStock', headerName: 'Stock', width: 90, align: 'center', headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value <= (params.row.minStockLevel || 5) ? 'error' : 'success'}
          variant={params.value <= (params.row.minStockLevel || 5) ? 'filled' : 'outlined'}
          size="small"
          sx={{ fontWeight: 'bold' }}
        />
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
  const displayName = user?.name || user?.displayName || user?.email?.split('@')[0] || 'Gerente';
  const currentDate = new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Generate Year Options (Current Year - 5)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <Box sx={{ pb: 4 }}>
      {/* --- ENCABEZADO --- */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: '800', color: '#1a1a1a', mb: 1 }}>
            Hola, {displayName} 👋
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon fontSize="small" /> {currentDate.charAt(0).toUpperCase() + currentDate.slice(1)}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: '#1976d2', width: 56, height: 56 }}>{displayName.charAt(0).toUpperCase()}</Avatar>
      </Box>

      {/* --- KPI CARDS --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget
            title="Total Items"
            value={loading ? "..." : totalProducts}
            icon={<InventoryIcon fontSize="large" />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget
            title="Stock Bajo"
            value={loading ? "..." : lowStockCount}
            icon={<WarningAmberIcon fontSize="large" />}
            color="#d32f2f"
            onClick={() => window.location.href = '/reports/stock'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget
            title={`Salidas (${selectedYear})`}
            value={loading ? "..." : yearlyExitsCount}
            icon={<TrendingUpIcon fontSize="large" />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget
            title="Pendientes"
            value={installStats.pending}
            icon={<BuildIcon fontSize="large" />}
            color="#E5B50D"
            onClick={() => window.location.href = '/installations'}
          />
        </Grid>
      </Grid>

      {/* --- FILTERS BAR --- */}
      <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: 3, border: '1px solid #e0e0e0', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mr: 2 }}>
          <FilterListIcon /> Filtros:
        </Typography>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Año</InputLabel>
          <Select value={selectedYear} label="Año" onChange={(e) => setSelectedYear(e.target.value)}>
            {years.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Cliente</InputLabel>
          <Select value={selectedCustomer} label="Cliente" onChange={(e) => setSelectedCustomer(e.target.value)}>
            <MenuItem value="all">Todos</MenuItem>
            {customers.map(cust => <MenuItem key={cust.id} value={cust.id}>{cust.name}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Tipo Material</InputLabel>
          <Select value={selectedType} label="Tipo Material" onChange={(e) => setSelectedType(e.target.value)}>
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="Equipo">Equipos</MenuItem>
            <MenuItem value="Material">Materiales</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* --- TABLA DE DISPONIBILIDAD (MOVIDA ARRIBA) --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <InventoryIcon color="info" /> Disponibilidad de Inventario
        </Typography>
        <Paper elevation={0} sx={{ width: '100%', borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          <DataGrid
            rows={filteredInventory}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id}
            localeText={esES.components.MuiDataGrid.defaultProps.localeText}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              sorting: { sortModel: [{ field: 'productName', sort: 'asc' }] }
            }}
            disableRowSelectionOnClick
            autoHeight
            sx={{ border: 'none' }}
          />
        </Paper>
      </Box>

      {/* --- CHARTS & MOVEMENTS SECTION --- */}
      <Grid container spacing={4}>

        {/* ROW 1: DISPATCHES BY CUSTOMER CHART */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Despachos por Cliente ({selectedYear})
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={dispatchesByCustomerData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip cursor={{ fill: '#f5f5f5' }} />
                  <Bar dataKey="count" fill="#1976d2" radius={[4, 4, 0, 0]} name="Despachos" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* ROW 2: RECENT MOVEMENTS & INSTALLATION PROGRESS */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <InventoryIcon color="primary" /> Movimientos Recientes
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentMovements.length === 0 ? (
                <Typography color="text.secondary">No hay movimientos recientes.</Typography>
              ) : (
                recentMovements.map((move) => (
                  <Paper key={move.id} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: move.type === 'ENTRADA' ? '#e8f5e9' : '#ffebee', color: move.type === 'ENTRADA' ? '#2e7d32' : '#d32f2f' }}>
                        {move.type === 'ENTRADA' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {move.type === 'ENTRADA' ? 'Entrada de Inventario' : 'Salida de Inventario'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {move.correlative} • {move.date?.toDate().toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip label={move.status} size="small" color={move.status === 'Completado' ? 'success' : 'default'} variant="outlined" />
                  </Paper>
                ))
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
              <BuildIcon color="warning" /> Progreso de Instalaciones
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: '800', color: '#1a1a1a' }}>
                {installStats.pending + installStats.installed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Equipos en Campo
              </Typography>
            </Box>
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