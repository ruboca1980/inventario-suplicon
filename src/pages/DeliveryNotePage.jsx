import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Grid, Autocomplete, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { getCompletedExits, saveDeliveryNote } from '../firebase/deliveryNoteServices';
import { getNextCorrelative } from '../firebase/transactionServices';
import { getCustomersRealTime } from '../firebase/customerServices';
import { getStaffRealTime } from '../firebase/staffServices';
import { getTransactionsForBatch } from '../firebase/reportServices';

import DeliveryNoteHeader from '../components/DeliveryNoteHeader.jsx';
import DeliveryNoteLogistics from '../components/DeliveryNoteLogistics.jsx';
import DeliveryNoteItemsTable from '../components/DeliveryNoteItemsTable.jsx';
import DeliveryNotePreviewModal from '../components/DeliveryNotePreviewModal.jsx';

// 1. IMPORTAR NOTISTACK
import { useSnackbar } from 'notistack';

const DeliveryNotePage = () => {
  // 2. INICIALIZAR
  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();
  const [exits, setExits] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loadingExits, setLoadingExits] = useState(true);

  const [selectedExit, setSelectedExit] = useState(null);

  const initialCustomerState = {
    name: '', rif: '', address: '', phone: '',
    contactName: '', contactEmail: '', orderNumber: '',
  };
  const [customerData, setCustomerData] = useState(initialCustomerState);

  const initialLogisticsState = {
    conductorName: '', conductorId: '', ayudanteName: '', ayudanteId: '',
    chutoMarca: '', chutoModelo: '', chutoColor: '', chutoPlaca: '',
    bateaMarca: '', bateaColor: '', bateaPlaca: '',
    lugarDespacho: 'Galpón El Tigre',
    fechaDespacho: new Date().toISOString().split('T')[0],
    lugarRecepcion: 'Almacén Principal Petrolera Roraima, San Diego de Cabrutica',
    fechaRecepcion: new Date().toISOString().split('T')[0],
  };
  const [logisticsData, setLogisticsData] = useState(initialLogisticsState);

  const [itemsData, setItemsData] = useState([]);
  const [issuerData, setIssuerData] = useState({ name: '', nationalId: '' });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    const fetchExits = async () => {
      setLoadingExits(true);
      try {
        const exitList = await getCompletedExits();
        setExits(exitList);
      } catch (error) {
        console.error("Error cargando salidas:", error);
        // 3. ERROR DE CARGA
        enqueueSnackbar("Error al cargar las salidas.", { variant: 'error' });
      }
      setLoadingExits(false);
    };
    const unsubCustomers = getCustomersRealTime(setCustomers);
    const unsubStaff = getStaffRealTime(setStaff);
    fetchExits();
    return () => {
      unsubCustomers();
      unsubStaff();
    };
  }, []);

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Cliente Desconocido';
  };

  const exitOptions = exits.map(exit => ({
    id: exit.id,
    label: `${exit.correlative} - ${getCustomerName(exit.customerId)} - ${exit.date.toDate().toLocaleDateString('es-VE')}`,
    ...exit
  }));

  const handleExitSelect = async (event, selectedValue) => {
    setSelectedExit(selectedValue);

    if (selectedValue) {
      const customer = customers.find(c => c.id === selectedValue.customerId);
      if (customer) {
        setCustomerData({
          name: customer.name || '',
          rif: customer.rif || '',
          address: customer.address || '',
          phone: customer.phone || '',
          contactName: '',
          contactEmail: '',
          orderNumber: '',
        });
      } else {
        setCustomerData(initialCustomerState);
      }

      const issuer = staff.find(p => p.id === selectedValue.staffIssuerId);
      if (issuer) { setIssuerData({ name: issuer.name || '', nationalId: issuer.nationalId || '' }); }
      else { setIssuerData({ name: 'Emisor no encontrado', nationalId: '' }); }

      try {
        const items = await getTransactionsForBatch(selectedValue.id);
        setItemsData(items.map(item => ({
          id: item.id, productId: item.productId, sku: item.sku || '',
          description: item.description || '', brand: item.brand || '',
          category: item.category || '', serials: item.serials || [],
          quantity: item.quantity || 0,
        })));
      } catch (error) {
        console.error("Error al cargar los ítems:", error);
        enqueueSnackbar("Error al cargar los detalles de la salida.", { variant: 'error' });
        setItemsData([]);
      }
      
      // Resetear logística
      setLogisticsData(initialLogisticsState);

    } else {
      setSelectedExit(null);
      setCustomerData(initialCustomerState);
      setLogisticsData(initialLogisticsState);
      setItemsData([]);
      setIssuerData({ name: '', nationalId: '' });
    }
  };

  const handleOpenPreview = async () => {
    // 3. VALIDACIÓN SUAVE (Sugerencia)
    if (!logisticsData.conductorName || !logisticsData.conductorId) {
      enqueueSnackbar('Sugerencia: No olvides llenar los datos del conductor.', { variant: 'info', autoHideDuration: 4000 });
    }

    try {
      const nextCorrelative = await getNextCorrelative('deliveryNote');
      const allNoteData = {
        originalExitId: selectedExit.id,
        originalExitCorrelative: selectedExit.correlative,
        correlative: nextCorrelative,
        customerData: customerData,
        logisticsData: logisticsData,
        itemsData: itemsData,
        issuerData: issuerData,
      };
      setPreviewData(allNoteData);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Error al generar el correlativo:", error);
      enqueueSnackbar("Error al generar el correlativo.", { variant: 'error' });
    }
  };

  const handleConfirmSave = async () => {
    if (!previewData) {
      enqueueSnackbar("No hay datos para guardar.", { variant: 'warning' });
      return;
    }
    try {
      await saveDeliveryNote(previewData);
      // 3. ÉXITO FINAL
      enqueueSnackbar(`¡Nota de Entrega ${previewData.correlative} guardada con éxito!`, { variant: 'success' });
      setIsPreviewOpen(false);
      setPreviewData(null);
      navigate('/dashboard');
    } catch (error) {
      console.error("Error al guardar:", error);
      // 3. ERROR
      enqueueSnackbar("Error al guardar la Nota de Entrega. Revisa la consola.", { variant: 'error' });
      throw error;
    }
  };

  const handleLogisticsDatePlaceChange = (e) => {
    const { name, value } = e.target;
    setLogisticsData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <>
      <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Generar Nota de Entrega
        </Typography>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>1. Seleccionar Salida de Origen</Typography>
          <Autocomplete
            options={exitOptions}
            value={selectedExit}
            onChange={handleExitSelect}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={loadingExits}
            renderInput={(params) => <TextField {...params} label="Buscar Salida por Correlativo o Cliente" />}
          />
        </Paper>

        {selectedExit && (
          <>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>2. Datos del Cliente (Editable)</Typography>
              <DeliveryNoteHeader
                customerData={customerData}
                setCustomerData={setCustomerData}
              />
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>3. Ítems de la Entrega (Editable)</Typography>
              <DeliveryNoteItemsTable
                itemsData={itemsData}
                setItemsData={setItemsData}
              />
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>4. Información Logística (Editable)</Typography>
              <DeliveryNoteLogistics
                logisticsData={logisticsData}
                setLogisticsData={setLogisticsData}
              />
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>5. Datos de Despacho y Recepción (Editable)</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Lugar de Despacho (Emisor)"
                    name="lugarDespacho"
                    value={logisticsData.lugarDespacho}
                    onChange={handleLogisticsDatePlaceChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Fecha de Despacho (Emisor)"
                    name="fechaDespacho"
                    type="date"
                    value={logisticsData.fechaDespacho}
                    onChange={handleLogisticsDatePlaceChange}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Lugar de Recepción (Cliente)"
                    name="lugarRecepcion"
                    value={logisticsData.lugarRecepcion}
                    onChange={handleLogisticsDatePlaceChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Fecha de Recepción (Cliente)"
                    name="fechaRecepcion"
                    type="date"
                    value={logisticsData.fechaRecepcion}
                    onChange={handleLogisticsDatePlaceChange}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            disabled={!selectedExit}
            onClick={handleOpenPreview}
          >
            Revisar y Guardar Nota de Entrega
          </Button>
        </Box>
      </Paper>

      {isPreviewOpen && (
        <DeliveryNotePreviewModal
          open={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onConfirm={handleConfirmSave}
          neData={previewData}
        />
      )}
    </>
  );
};

export default DeliveryNotePage;