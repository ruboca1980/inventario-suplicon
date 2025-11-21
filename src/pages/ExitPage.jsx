import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Grid, TextField, FormControl, InputLabel, Select, MenuItem, List, ListItemButton, ListItemText, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import DeleteIcon from '@mui/icons-material/Delete';
import SerialSelector from '../components/SerialSelector.jsx';
import ExitPreviewModal from '../components/ExitPreviewModal.jsx';
import { getProductsRealTime } from '../firebase/productServices';
import { getCustomersRealTime } from '../firebase/customerServices';
import { getStaffRealTime } from '../firebase/staffServices';
import { getStockByProductId } from '../firebase/inventoryServices';
import { createInventoryExit, getNextCorrelative } from '../firebase/transactionServices';
import { useNavigate } from 'react-router-dom';

// 1. IMPORTAR NOTISTACK
import { useSnackbar } from 'notistack';

const ExitPage = () => {
  // 2. INICIALIZAR
  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [exitDate, setExitDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedIssuer, setSelectedIssuer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentStock, setCurrentStock] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [exitItems, setExitItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSerialSelectorOpen, setIsSerialSelectorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    const unsubProducts = getProductsRealTime(setProducts);
    const unsubCustomers = getCustomersRealTime(setCustomers);
    const unsubStaff = getStaffRealTime(setStaff);
    return () => { unsubProducts(); unsubCustomers(); unsubStaff(); };
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      const fetchStock = async () => {
        const stock = await getStockByProductId(selectedProduct.id);
        setCurrentStock(stock);
      };
      fetchStock();
    } else {
      setCurrentStock(0);
    }
  }, [selectedProduct]);

  const filteredProducts = products.filter(product =>
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleAddMaterial = () => {
    if (!selectedProduct || !quantity || quantity <= 0) {
      enqueueSnackbar("Selecciona un producto y una cantidad válida.", { variant: 'warning' });
      return;
    }
    if (selectedProduct.type === 'Equipo') {
      enqueueSnackbar('Para Equipos, por favor use el botón "Seleccionar Seriales".', { variant: 'info' });
      return;
    }
    if (parseInt(quantity) > currentStock) {
      enqueueSnackbar(`Stock insuficiente. Solo hay ${currentStock} unidades disponibles.`, { variant: 'error' });
      return;
    }
    if (exitItems.find(item => item.id === selectedProduct.id)) {
      enqueueSnackbar('Este producto ya ha sido añadido a la lista de salida.', { variant: 'warning' });
      return;
    }

    const newItem = {
      id: selectedProduct.id,
      sku: selectedProduct.sku,
      category: selectedProduct.category,
      description: selectedProduct.description,
      brand: selectedProduct.brand,
      unitOfMeasure: selectedProduct.unitOfMeasure,
      quantity: parseInt(quantity),
      serials: [],
    };

    setExitItems([...exitItems, newItem]);
    setSelectedProduct(null);
    setSearchTerm('');
    setQuantity(1);
    enqueueSnackbar('Material añadido a la lista.', { variant: 'info', autoHideDuration: 1500 });
  };

  const handleSerialsSelected = (selectedSerials) => {
    if (!selectedProduct) return;

    const newItem = {
      id: selectedProduct.id,
      sku: selectedProduct.sku,
      category: selectedProduct.category,
      description: selectedProduct.description,
      brand: selectedProduct.brand,
      unitOfMeasure: selectedProduct.unitOfMeasure,
      quantity: parseInt(quantity),
      serials: selectedSerials,
    };

    setExitItems([...exitItems, newItem]);
    setIsSerialSelectorOpen(false);
    setSelectedProduct(null);
    setSearchTerm('');
    setQuantity(1);
    enqueueSnackbar('Equipos añadidos a la lista.', { variant: 'info', autoHideDuration: 1500 });
  };

  const handleRemoveItem = (id) => {
    setExitItems(exitItems.filter(item => item.id !== id));
  };

  const handleOpenPreview = async () => {
    if (!selectedCustomer || !selectedIssuer || exitItems.length === 0) {
      enqueueSnackbar("Completa todos los campos y añade al menos un producto.", { variant: 'warning' });
      return;
    }
    try {
      const nextCorrelative = await getNextCorrelative('exit');
      const customerName = customers.find(c => c.id === selectedCustomer)?.name || 'No encontrado';
      const issuerObject = staff.find(p => p.id === selectedIssuer);
      const issuerName = issuerObject?.name || 'No encontrado';
      const issuerNationalId = issuerObject?.nationalId || 'N/A';
      const formattedDate = new Date(exitDate + 'T00:00:00').toLocaleDateString('es-VE');

      setPreviewData({
        correlative: nextCorrelative,
        customerName,
        issuerName,
        issuerNationalId,
        date: formattedDate,
        items: exitItems,
      });
      setIsPreviewOpen(true);
    } catch (error) {
      enqueueSnackbar("No se pudo pre-cargar el número correlativo.", { variant: 'error' });
    }
  };

  const handleSubmitExit = async () => {
    const dateParts = exitDate.split('-').map(part => parseInt(part, 10));
    const localDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const exitData = {
      customerId: selectedCustomer,
      staffIssuerId: selectedIssuer,
      exitDate: localDate,
      items: exitItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        serials: item.serials,
      })),
    };
    try {
      await createInventoryExit(exitData);
      setIsPreviewOpen(false);
      // ÉXITO FINAL
      enqueueSnackbar("¡Salida registrada con éxito!", { variant: 'success' });
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Error al registrar la salida. " + error.message, { variant: 'error' });
    }
  };

  const columns = [
    { field: 'sku', headerName: 'Código', flex: 1 },
    { field: 'category', headerName: 'Categoría', flex: 1 },
    { field: 'description', headerName: 'Descripción', flex: 2 },
    { field: 'brand', headerName: 'Marca', flex: 1 },
    { field: 'serials', headerName: 'Seriales', flex: 2, renderCell: (params) => params.value.join(', ') },
    { field: 'unitOfMeasure', headerName: 'Unidad', flex: 0.5 },
    { field: 'quantity', headerName: 'Cantidad', flex: 0.5, align: 'right', headerAlign: 'right' },
    {
      field: 'actions', headerName: 'Acciones', flex: 0.5, sortable: false, align: 'center', headerAlign: 'center',
      renderCell: (params) => (<IconButton color="error" onClick={() => handleRemoveItem(params.row.id)}><DeleteIcon /></IconButton>),
    },
  ];

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" component="h1">Registrar Nueva Salida</Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <TextField type="date" label="Fecha de Salida" value={exitDate} onChange={(e) => setExitDate(e.target.value)} sx={{ flex: 1 }} InputLabelProps={{ shrink: true }} />
        <FormControl sx={{ flex: 1 }}><InputLabel id="customer-select-label">Cliente</InputLabel><Select labelId="customer-select-label" value={selectedCustomer} label="Cliente" onChange={(e) => setSelectedCustomer(e.target.value)}>{customers.map(cust => <MenuItem key={cust.id} value={cust.id}>{cust.name}</MenuItem>)}</Select></FormControl>
        <FormControl sx={{ flex: 1 }}><InputLabel id="issuer-select-label">Emisor</InputLabel><Select labelId="issuer-select-label" value={selectedIssuer} label="Emisor" onChange={(e) => setSelectedIssuer(e.target.value)}>{staff.map(person => <MenuItem key={person.id} value={person.id}>{person.name}</MenuItem>)}</Select></FormControl>
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Añadir Productos</Typography>
        <Box>
          <TextField
            fullWidth
            label="Buscar Producto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Escribe un código o descripción..."
          />
          <Paper variant="outlined" sx={{ mt: 1, height: 180, overflow: 'auto' }}>
            <List dense>
              {filteredProducts.map(product => (
                <ListItemButton
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  selected={selectedProduct?.id === product.id}
                >
                  <ListItemText
                    primary={`(${product.sku}) ${product.description}`}
                    secondary={`Categoría: ${product.category} | Marca: ${product.brand}`}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={6} sm={3}>
              <TextField label="Stock Disp." value={currentStock} fullWidth InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField type="number" label="Cantidad" value={quantity} onChange={(e) => setQuantity(e.target.value)} fullWidth InputProps={{ inputProps: { min: 1 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              {selectedProduct && selectedProduct.type === 'Material' ? (
                <Button variant="contained" onClick={handleAddMaterial} fullWidth sx={{ height: '56px' }}>Añadir Material</Button>
              ) : selectedProduct && selectedProduct.type === 'Equipo' ? (
                <Button variant="outlined" onClick={() => setIsSerialSelectorOpen(true)} fullWidth sx={{ height: '56px' }}>Seleccionar Seriales</Button>
              ) : (
                <Button variant="contained" disabled fullWidth sx={{ height: '56px' }}>Añadir</Button>
              )}
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Box sx={{ height: 350, width: '100%' }}>
        <DataGrid rows={exitItems} columns={columns} localeText={esES.components.MuiDataGrid.defaultProps.localeText} pageSizeOptions={[5, 10, 25, 100]} />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" size="large" onClick={handleOpenPreview}>Revisar y Guardar Salida</Button>
      </Box>

      <SerialSelector
        open={isSerialSelectorOpen}
        onClose={() => setIsSerialSelectorOpen(false)}
        onSave={handleSerialsSelected}
        productId={selectedProduct?.id}
        productDescription={selectedProduct?.description}
        quantityNeeded={parseInt(quantity) || 0}
      />
      <ExitPreviewModal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onConfirm={handleSubmitExit}
        exitData={previewData}
      />
    </Paper>
  );
};

export default ExitPage;