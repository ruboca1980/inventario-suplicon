import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Grid, Autocomplete, CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';

// --- ¡NUEVAS IMPORTACIONES DE SERVICIOS! ---
import {
  searchAllDocuments,
  getEntryPreviewData,
  getExitPreviewData,
  getDeliveryNotePreviewData
} from '../firebase/reportServices';
import { getCustomersRealTime } from '../firebase/customerServices';
import { getSuppliersRealTime } from '../firebase/supplierServices';

// --- ¡NUEVAS IMPORTACIONES DE MODALES! ---
import EntryPreviewModal from '../components/EntryPreviewModal.jsx';
import ExitPreviewModal from '../components/ExitPreviewModal.jsx';
import DeliveryNotePreviewModal from '../components/DeliveryNotePreviewModal.jsx';


const docTypes = ['Todos', 'Entrada', 'Salida', 'Nota de Entrega'];

const DocumentArchivePage = () => {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);

  const [customerMap, setCustomerMap] = useState(new Map());
  const [supplierMap, setSupplierMap] = useState(new Map());

  // --- ¡NUEVOS ESTADOS PARA LOS MODALES! ---
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'ENTRADA', 'SALIDA', 'Nota de Entrega'

  // Filtros
  const [filterType, setFilterType] = useState('Todos');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterCorrelative, setFilterCorrelative] = useState('');

  useEffect(() => {
    // ... (Tu useEffect para cargar mapas no cambia)
    const unsubCustomers = getCustomersRealTime((customers) => {
      const newMap = new Map();
      customers.forEach(c => newMap.set(c.id, c.name));
      setCustomerMap(newMap);
    });
    const unsubSuppliers = getSuppliersRealTime((suppliers) => {
      const newMap = new Map();
      suppliers.forEach(s => newMap.set(s.id, s.name));
      setSupplierMap(newMap);
    });
    return () => {
      unsubCustomers();
      unsubSuppliers();
    };
  }, []);

  const handleSearch = async () => {
    // ... (Tu handleSearch no cambia)
    setLoading(true);
    const filters = {
      type: filterType === 'Todos' ? null : filterType.toUpperCase(),
      startDate: filterStartDate,
      endDate: filterEndDate,
      correlative: filterCorrelative,
    };
    if (filters.type === 'NOTA DE ENTREGA') filters.type = 'Nota de Entrega';
    const results = await searchAllDocuments(filters);
    setDocuments(results);
    setLoading(false);
  };

  const columns = useMemo(() => [
    // ... (Tu array de columnas no cambia)
    { field: 'correlative', headerName: 'Correlativo', width: 180 },
    {
      field: '_docType', headerName: 'Tipo de Documento', width: 150, headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ color: params.value === 'ENTRADA' ? 'success.main' : params.value === 'SALIDA' ? 'error.main' : 'primary.main', fontWeight: 'bold' }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    { field: 'date', headerName: 'Fecha', width: 150, valueFormatter: (value) => new Date(value).toLocaleDateString('es-VE') },
    {
      field: 'entityName', headerName: 'Cliente / Proveedor', flex: 1,
      valueGetter: (value, row) => {
        if (row.customerId) { return customerMap.get(row.customerId) || 'Cliente Desconocido'; }
        if (row.supplierId) { return supplierMap.get(row.supplierId) || 'Proveedor Desconocido'; }
        return 'N/A';
      },
    },
    {
      field: 'actions', headerName: 'Acciones', width: 160, headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleViewDocument(params.row)}
            disabled={isLoadingData} // Deshabilitar si ya está cargando uno
            sx={{ px: 2 }}
          >
            {/* Mostrar Círculo de Carga si estamos cargando ESTE documento */}
            {isLoadingData && previewData === params.row._id ? <CircularProgress size={20} /> : 'Ver Documento'}
          </Button>
        </Box>
      ),
    },
  ], [customerMap, supplierMap, isLoadingData, previewData]); // Añadir dependencias

  // --- ¡FUNCIÓN handleViewDocument ACTUALIZADA! ---
  const handleViewDocument = async (document) => {
    setIsLoadingData(true);
    setPreviewData(document._id); // Usamos 'previewData' para guardar el ID y mostrar el spinner

    try {
      const { _docType, _id } = document;
      let data;

      // 1. Llamar al servicio correcto según el tipo
      if (_docType === 'ENTRADA') {
        data = await getEntryPreviewData(_id);
      } else if (_docType === 'SALIDA') {
        data = await getExitPreviewData(_id);
      } else if (_docType === 'Nota de Entrega') {
        data = await getDeliveryNotePreviewData(_id);
      } else {
        throw new Error("Tipo de documento desconocido");
      }

      // 2. Guardar los datos completos y establecer el tipo de modal
      setPreviewData(data);
      setActiveModal(_docType); // 'ENTRADA', 'SALIDA', etc.

    } catch (error) {
      console.error("Error al cargar datos del documento:", error);
      alert(`Error al cargar los datos: ${error.message}`);
      setPreviewData(null); // Limpiar en caso de error
    }

    setIsLoadingData(false);
  };

  // --- ¡NUEVA FUNCIÓN PARA CERRAR MODALES! ---
  const handleCloseModal = () => {
    setActiveModal(null);
    setPreviewData(null);
  };

  return (
    <> {/* ¡Añadido Fragment para envolver la página y los modales! */}
      <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h4" component="h1">
          Archivo de Documentos
        </Typography>

        {/* --- Panel de Filtros (con Flexbox) --- */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
            <Autocomplete
              options={docTypes}
              value={filterType}
              onChange={(e, newValue) => setFilterType(newValue || 'Todos')}
              renderInput={(params) => <TextField {...params} label="Tipo de Documento" />}
              sx={{ width: '100%', flex: { sm: 4 } }}
            />
            <TextField
              fullWidth
              label="Desde"
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: '100%', flex: { sm: 2.5 } }}
            />
            <TextField
              fullWidth
              label="Hasta"
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: '100%', flex: { sm: 2.5 } }}
            />
            <TextField
              fullWidth
              label="Buscar Correlativo..."
              value={filterCorrelative}
              onChange={(e) => setFilterCorrelative(e.target.value)}
              sx={{ width: '100%', flex: { sm: 3 } }}
            />
          </Box>
          <Box sx={{ textAlign: 'right', mt: 2 }}>
            <Button variant="contained" onClick={handleSearch} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Buscar'}
            </Button>
          </Box>
        </Paper>

        {/* --- Tabla de Resultados --- */}
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={documents}
            columns={columns}
            loading={loading}
            getRowId={(row) => row._id}
            localeText={esES.components.MuiDataGrid.defaultProps.localeText}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
          />
        </Box>
      </Paper>

      {/* --- ¡SECCIÓN DE MODALES AÑADIDA! --- */}
      {/* (Están ocultos hasta que 'activeModal' y 'previewData' se establezcan) */}

      {/* Modal de Entrada */}
      <EntryPreviewModal
        open={activeModal === 'ENTRADA'}
        onClose={handleCloseModal}
        onConfirm={() => { }} // No hacemos nada al confirmar, solo cerramos
        entryData={previewData}
        isSaved={true} // ¡IMPORTANTE! Oculta el botón de guardar
      />

      {/* Modal de Salida */}
      <ExitPreviewModal
        open={activeModal === 'SALIDA'}
        onClose={handleCloseModal}
        onConfirm={() => { }} // Solo cerramos
        exitData={previewData}
        isSaved={true} // ¡IMPORTANTE! Oculta el botón de guardar
      />

      {/* Modal de Nota de Entrega */}
      <DeliveryNotePreviewModal
        open={activeModal === 'Nota de Entrega'}
        onClose={handleCloseModal}
        onConfirm={() => { }} // Solo cerramos
        neData={previewData}
        isSaved={true} // ¡IMPORTANTE! Oculta el botón de guardar
        isReadOnly={true} // Oculta el botón "Finalizar"
      />
    </>
  );
};

export default DocumentArchivePage;