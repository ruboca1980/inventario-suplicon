import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Grid, TextField, FormControl, InputLabel, Select, MenuItem, List, ListItemButton, ListItemText, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import DeleteIcon from '@mui/icons-material/Delete';
import SerialManager from '../components/SerialManager.jsx';
import EntryPreviewModal from '../components/EntryPreviewModal.jsx';
import { getProductsRealTime } from '../firebase/productServices';
import { getSuppliersRealTime } from '../firebase/supplierServices';
import { getStaffRealTime } from '../firebase/staffServices';
import { createInventoryEntry, getNextCorrelative } from '../firebase/transactionServices';
import { getStockByProductId } from '../firebase/inventoryServices';
import { useNavigate } from 'react-router-dom';

// 1. IMPORTAR NOTISTACK
import { useSnackbar } from 'notistack';

const EntryPage = () => {
  // 2. INICIALIZAR
  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedReceiver, setSelectedReceiver] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentStock, setCurrentStock] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [lotNumber, setLotNumber] = useState('');
  const [entryItems, setEntryItems] = useState([]);
  const [isSerialManagerOpen, setIsSerialManagerOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubProducts = getProductsRealTime(setProducts);
    const unsubSuppliers = getSuppliersRealTime(setSuppliers);
    const unsubStaff = getStaffRealTime(setStaff);
    return () => { unsubProducts(); unsubSuppliers(); unsubStaff(); };
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
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleAddItem = () => {
    if (!selectedProduct || !quantity || quantity <= 0) {
      // 3. VALIDACIÓN CON NOTISTACK
      enqueueSnackbar("Selecciona un producto y una cantidad válida.", { variant: 'warning' });
      return;
    }

    if (selectedProduct.type === 'Equipo') {
      setIsSerialManagerOpen(true); // Abre el gestor de seriales para equipos
      return;
    }

    if (entryItems.find(item => item.id === selectedProduct.id)) {
      // 3. VALIDACIÓN CON NOTISTACK
      enqueueSnackbar('Este producto ya ha sido añadido.', { variant: 'warning' });
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
      lotOrSerials: lotNumber,
      serials: [],
    };

    setEntryItems([...entryItems, newItem]);
    setSelectedProduct(null);
    setSearchTerm('');
    setQuantity(1);
    setLotNumber('');
    // 3. FEEDBACK POSITIVO SUTIL
    enqueueSnackbar('Producto añadido a la lista.', { variant: 'info', autoHideDuration: 1500 });
  };

  const handleSaveFromSerialManager = (savedSerials) => {
    if (!selectedProduct) return;

    const newItem = {
      id: selectedProduct.id,
      sku: selectedProduct.sku,
      category: selectedProduct.category,
      description: selectedProduct.description,
      brand: selectedProduct.brand,
      unitOfMeasure: selectedProduct.unitOfMeasure,
      quantity: parseInt(quantity),
      lotOrSerials: savedSerials.join(', '),
      serials: savedSerials,
    };

    setEntryItems([...entryItems, newItem]);
    setSelectedProduct(null);
    setSearchTerm('');
    setQuantity(1);
    // 3. FEEDBACK POSITIVO SUTIL
    enqueueSnackbar('Equipos añadidos a la lista.', { variant: 'info', autoHideDuration: 1500 });
  };

  const handleRemoveItem = (id) => {
    setEntryItems(entryItems.filter(item => item.id !== id));
  };

  const handleOpenPreview = async () => {
    if (!selectedSupplier || !selectedReceiver || entryItems.length === 0) {
      // 3. VALIDACIÓN CON NOTISTACK
      enqueueSnackbar("Completa todos los campos del encabezado y añade al menos un producto.", { variant: 'warning' });
      return;
    }
    try {
      const nextCorrelative = await getNextCorrelative('entry');
      const supplierName = suppliers.find(s => s.id === selectedSupplier)?.name || 'No encontrado';
      const receiverObject = staff.find(p => p.id === selectedReceiver);
      const receiverName = receiverObject?.name || 'No encontrado';
      const receiverNationalId = receiverObject?.nationalId || 'N/A';
      const formattedDate = new Date(entryDate + 'T00:00:00').toLocaleDateString('es-VE');
      setPreviewData({
        correlative: nextCorrelative,
        supplierName,
        receiverName,
        receiverNationalId,
        date: formattedDate,
        items: entryItems,
      });
      setIsPreviewOpen(true);
    } catch (error) {
      // 3. ERROR DE CONEXIÓN
      enqueueSnackbar("No se pudo pre-cargar el número correlativo. Revisa la conexión.", { variant: 'error' });
    }
  };

  const handleSubmitEntry = async () => {
    const dateParts = entryDate.split('-').map(part => parseInt(part, 10));
    const localDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const entryData = {
      supplierId: selectedSupplier,
      staffReceiverId: selectedReceiver,
      entryDate: localDate,
      items: entryItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        serials: item.serials,
      })),
    };

    try {
      await createInventoryEntry(entryData);
      setIsPreviewOpen(false);
      // 3. ÉXITO FINAL
      enqueueSnackbar("¡Entrada registrada con éxito!", { variant: 'success' });
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      // 3. ERROR CRÍTICO
      enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
    }
  };

  const columns = [
    { field: 'sku', headerName: 'Código', flex: 1 },
    { field: 'category', headerName: 'Categoría', flex: 1 },
    { field: 'description', headerName: 'Descripción', flex: 2 },
    { field: 'brand', headerName: 'Marca', flex: 1 },
    { field: 'lotOrSerials', headerName: 'Seriales', flex: 2 },
    { field: 'unitOfMeasure', headerName: 'Unidad', flex: 0.5 },
    { field: 'quantity', headerName: 'Cantidad', flex: 0.5, align: 'right', headerAlign: 'right' },
    {
      field: 'actions', headerName: 'Acciones', flex: 0.5, sortable: false, align: 'center', headerAlign: 'center',
      renderCell: (params) => (<IconButton color="error" onClick={() => handleRemoveItem(params.row.id)}><DeleteIcon /></IconButton>),
    },
  ];

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" component="h1">Registrar Nueva Entrada</Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <TextField type="date" label="Fecha de Entrada" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} sx={{ flex: 1 }} InputLabelProps={{ shrink: true }} />
        <FormControl sx={{ flex: 1 }}><InputLabel id="supplier-select-label">Proveedor</InputLabel><Select labelId="supplier-select-label" value={selectedSupplier} label="Proveedor" onChange={(e) => setSelectedSupplier(e.target.value)}>{suppliers.map(sup => <MenuItem key={sup.id} value={sup.id}>{sup.name}</MenuItem>)}</Select></FormControl>
        <FormControl sx={{ flex: 1 }}><InputLabel id="receiver-select-label">Receptor</InputLabel><Select labelId="receiver-select-label" value={selectedReceiver} label="Receptor" onChange={(e) => setSelectedReceiver(e.target.value)}>{staff.map(person => <MenuItem key={person.id} value={person.id}>{person.name}</MenuItem>)}</Select></FormControl>
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Añadir Productos al Lote</Typography>
        <Box>
          <TextField fullWidth label="Buscar Producto" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Escribe código, descripción, categoría o marca..." />
          <Paper variant="outlined" sx={{ mt: 1, height: 180, overflow: 'auto' }}>
            <List dense>
              {filteredProducts.map(product => (
                <ListItemButton key={product.id} onClick={() => handleProductSelect(product)} selected={selectedProduct?.id === product.id}>
                  <ListItemText primary={`(${product.sku}) ${product.description}`} secondary={`Categoría: ${product.category} | Marca: ${product.brand}`} />
                </ListItemButton>
              ))}
            </List>
          </Paper>

          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={6} sm={2}><TextField label="Stock" value={currentStock} fullWidth InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={6} sm={2}><TextField type="number" label="Cantidad" value={quantity} onChange={(e) => setQuantity(e.target.value)} fullWidth InputProps={{ inputProps: { min: 1 } }} /></Grid>
            {selectedProduct && selectedProduct.type === 'Material' && (
              <Grid item xs={12} sm={6}><TextField label="Número de Lote" value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} fullWidth /></Grid>
            )}
            <Grid item xs={12} sm={8}>
              <Button
                variant="contained"
                onClick={handleAddItem}
                fullWidth
                sx={{ height: '56px' }}
                disabled={!selectedProduct}
              >
                {selectedProduct?.type === 'Equipo' ? 'Gestionar Seriales' : 'Añadir Material'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Box sx={{ height: 350, width: '100%' }}>
        <DataGrid rows={entryItems} columns={columns} localeText={esES.components.MuiDataGrid.defaultProps.localeText} pageSizeOptions={[5, 10, 25, 100]} />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" size="large" onClick={handleOpenPreview}>Revisar y Guardar</Button>
      </Box>

      <SerialManager open={isSerialManagerOpen} onClose={() => setIsSerialManagerOpen(false)} onSave={handleSaveFromSerialManager} quantityNeeded={parseInt(quantity) || 0} />
      <EntryPreviewModal open={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} onConfirm={handleSubmitEntry} entryData={previewData} />
    </Paper>
  );
};

export default EntryPage;