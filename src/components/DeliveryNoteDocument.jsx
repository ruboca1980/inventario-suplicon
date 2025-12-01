import React from 'react';
import {
  Box, Typography, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Grid, Divider
} from '@mui/material';
import logo from '../assets/logo_nuevo-removebg-preview.png';

/**
 * Plantilla visual para la Nota de Entrega (NE).
 * (ACTUALIZADA: Layout de Cliente (fuente pequeña), Logística (fuente pequeña), Firmas mejorados y Cantidad centrada)
 */
const DeliveryNoteDocument = React.forwardRef(({ neData, copyLabel, isForPrint = false }, ref) => {
  if (!neData) return null;

  const {
    correlative,
    customerData = {},
    logisticsData = {},
    itemsData = [],
    issuerData = {}
  } = neData;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-VE', { timeZone: 'America/Caracas' });
  };

  return (
    <Paper
      ref={ref}
      sx={{
        maxWidth: isForPrint ? 'none' : '800px', // Disable maxWidth for print
        width: '100%',
        minHeight: '950px',
        p: 3,
        backgroundColor: '#fff', color: '#000',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Contenido Superior (para el flexGrow) */}
      <Box sx={{ flexGrow: 1 }}>

        {/* --- ENCABEZADO (CON <table> PARA IMPRESIÓN) --- */}
        <Box sx={{ mb: 1.5, width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ width: '30%', verticalAlign: 'top' }}>
                  <img src={logo} alt="Logo Suplicon C.A." style={{ height: '50px', width: '100%', objectFit: 'contain' }} />
                </td>
                <td style={{ width: '40%', verticalAlign: 'top', textAlign: 'center', padding: '0 8px' }}>
                  <Typography variant="body2" component="h2" sx={{ fontWeight: 'bold', lineHeight: 1.1, fontSize: '0.8rem' }}>
                    INVERSIONES SUPLICON, C.A.
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem', lineHeight: 1.1 }}>
                    Av Veracruz, Edf Torreón, Sto. Piso. Ofic, 4 B. Las Mercedes, Baruta. Caracas. Venezuela.
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem', lineHeight: 1.1 }}>
                    Telefax (0212) 993.64.19 / 991.53.45
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem', lineHeight: 1.1 }}>
                    inv.suplicon@gmail.com / Suplicon@yahoo.com
                  </Typography>
                </td>
                <td style={{ width: '30%', verticalAlign: 'top', textAlign: 'right' }}>
                  <Typography variant="h6" component="h1" align="right" sx={{ lineHeight: 1.1, fontWeight: 'bold' }}>
                    Nota de Entrega
                  </Typography>
                  <Typography align="right" variant="body1" color="error.main" sx={{ fontWeight: 'bold' }}>
                    N° {correlative || 'NE-XX-XXX'}
                  </Typography>
                  <Typography align="right" variant="body2" sx={{ fontSize: '0.8rem' }}>
                    Fecha: {formatDate(logisticsData.fechaDespacho)}
                  </Typography>
                </td>
              </tr>
            </tbody>
          </table>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {/* --- SECCIÓN 1: DATOS DEL CLIENTE (LAYOUT MEJORADO, FUENTE PEQUEÑA) --- */}
        <Box sx={{ border: '1px solid #ccc', p: 1.5, mb: 2, fontSize: '0.75rem' }}>
          {/* Linea 1: Nombre y RIF */}
          <Box sx={{ display: 'flex', mb: 0.5 }}>
            <Box sx={{ flex: 2, pr: 1 }}>
              <Typography variant="caption" sx={{ fontSize: 'inherit' }}><strong>Nombre ó Razón Social:</strong> {customerData.name}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ fontSize: 'inherit' }}><strong>RIF:</strong> {customerData.rif}</Typography>
            </Box>
          </Box>

          {/* Linea 2: Dirección */}
          <Box sx={{ mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: 'inherit' }}><strong>Dirección Fiscal:</strong> {customerData.address}</Typography>
          </Box>

          {/* Linea 3: Contacto, Teléfono, Correo */}
          <Box sx={{ display: 'flex', mb: 0.5 }}>
            <Box sx={{ flex: 1, pr: 1 }}>
              <Typography variant="caption" sx={{ fontSize: 'inherit' }}><strong>Persona Contacto:</strong> {customerData.contactName || 'N/A'}</Typography>
            </Box>
            <Box sx={{ flex: 1, pr: 1 }}>
              <Typography variant="caption" sx={{ fontSize: 'inherit' }}><strong>Teléfono:</strong> {customerData.phone || 'N/A'}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ fontSize: 'inherit' }}><strong>Correo:</strong> {customerData.contactEmail || 'N/A'}</Typography>
            </Box>
          </Box>

          {/* Linea 4: Orden de Compra */}
          <Box>
            <Typography variant="caption" sx={{ fontSize: 'inherit' }}><strong>N° de Orden/Pedido:</strong> {customerData.orderNumber || 'N/A'}</Typography>
          </Box>
        </Box>

        {/* --- SECCIÓN 2: TABLA DE PRODUCTOS --- */}
        <Box sx={{ mb: 2 }}>
          <TableContainer sx={{ '@media print': { overflow: 'hidden' } }}>
            <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '15%', fontWeight: 'bold', fontSize: '0.8rem', p: 0.5 }} align="center">Cantidad</TableCell>
                  <TableCell sx={{ width: '35%', fontWeight: 'bold', fontSize: '0.8rem', p: 0.5 }}>Descripción</TableCell>
                  <TableCell sx={{ width: '20%', fontWeight: 'bold', fontSize: '0.8rem', p: 0.5 }}>Marca</TableCell>
                  <TableCell sx={{ width: '30%', fontWeight: 'bold', fontSize: '0.8rem', p: 0.5 }}>Seriales</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {itemsData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell align="center" sx={{ fontSize: '0.8rem', verticalAlign: 'top', p: 0.5, wordBreak: 'break-word' }}>{item.quantity}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', verticalAlign: 'top', p: 0.5, wordBreak: 'break-word' }}>{item.description}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', verticalAlign: 'top', p: 0.5, wordBreak: 'break-word' }}>{item.brand}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', verticalAlign: 'top', p: 0.5, wordBreak: 'break-word' }}>{Array.isArray(item.serials) ? item.serials.join(', ') : ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

      </Box> {/* --- FIN DEL CONTENIDO SUPERIOR (flexGrow: 1) --- */}

      {/* --- PIE DE PÁGINA (Logística y Firmas) --- */}
      <Box
        component="footer"
        sx={{
          pt: 1,
          breakInside: 'avoid',
          pageBreakInside: 'avoid',
        }}
      >
        {/* --- SECCIÓN 3: DATOS DE LOGÍSTICA (LAYOUT MEJORADO, FUENTE PEQUEÑA) --- */}
        <Box sx={{ border: '1px solid #ccc', p: 1.5, mb: 1.5 }}>
          <Typography variant="body1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Información Logística de Entrega
          </Typography>

          <Box sx={{ fontSize: '0.7rem' }}>
            {/* Fila 1: Conductor */}
            <Box sx={{ display: 'flex', mb: 0.5 }}>
              <Box sx={{ flex: 2, pr: 1 }}>
                <Typography variant="caption" sx={{ fontSize: 'inherit' }}><strong>Conductor:</strong> {logisticsData.conductorName}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontSize: 'inherit' }}><strong>C.I:</strong> {logisticsData.conductorId}</Typography>
              </Box>
            </Box>

            {/* Fila 2: Ayudante */}
            <Box sx={{ display: 'flex', mb: 0.5 }}>
              <Box sx={{ flex: 2, pr: 1 }}>
                <Typography variant="caption" sx={{ fontSize: 'inherit' }}><strong>Ayudante:</strong> {logisticsData.ayudanteName || 'N/A'}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontSize: 'inherit' }}><strong>C.I:</strong> {logisticsData.ayudanteId || 'N/A'}</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 0.5 }} />

            {/* Fila 3: Chuto */}
            <Box sx={{ display: 'flex', mb: 0.5 }}>
              <Box sx={{ flex: 1, pr: 1 }}>
                <Typography variant="caption" sx={{ fontSize: 'inherit' }}><strong>Chuto:</strong> {logisticsData.chutoMarca}</Typography>
              </Box>
              <Box sx={{ flex: 1, pr: 1 }}>
                <Typography variant="caption" sx={{ fontSize: 'inherit' }}><strong>Modelo:</strong> {logisticsData.chutoModelo}</Typography>
              </Box>
              <Box sx={{ flex: 1, pr: 1 }}>
                <Typography variant="caption" sx={{ fontSize: 'inherit' }}><strong>Color:</strong> {logisticsData.chutoColor}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontSize: 'inherit' }}><strong>Placa:</strong> {logisticsData.chutoPlaca}</Typography>
              </Box>
            </Box>

            {/* Fila 4: Batea */}
            <Box sx={{ display: 'flex' }}>
              <Box sx={{ flex: 1, pr: 1 }}>
                <Typography variant="caption" sx={{ fontSize: 'inherit' }}><strong>Batea (Marca):</strong> {logisticsData.bateaMarca}</Typography>
              </Box>
              <Box sx={{ flex: 1, pr: 1 }}>
                <Typography variant="caption" sx={{ fontSize: 'inherit' }}><strong>Batea (Color):</strong> {logisticsData.bateaColor}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontSize: 'inherit' }}><strong>Batea (Placa):</strong> {logisticsData.bateaPlaca}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        {/* --- FIN DE LOGÍSTICA --- */}

        <Divider sx={{ mb: 1.5 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>

          {/* Columna Izquierda (Emisor / Suplicon) */}
          <Box sx={{ width: '45%' }}>
            <Box sx={{ border: '1px solid #ccc', p: 1.5, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>Inversiones Suplicon C.A. (Entrega Conforme)</Typography>
              <Box sx={{ flexGrow: 1, minHeight: '50px' }} />
              <Box sx={{ borderTop: '1px solid #000', pt: 1 }}>
                <Typography display="block" align="left" variant="caption" sx={{ fontSize: '0.7rem', mb: 0.5 }}><strong>Nombre y Apellido:</strong> {issuerData.name}</Typography>
                <Typography display="block" align="left" variant="caption" sx={{ fontSize: '0.7rem', mb: 0.5 }}><strong>C.I:</strong> {issuerData.nationalId}</Typography>
                <Typography display="block" align="left" variant="caption" sx={{ fontSize: '0.7rem', mb: 0.5 }}><strong>Lugar:</strong> {logisticsData.lugarDespacho}</Typography>
                <Typography display="block" align="left" variant="caption" sx={{ fontSize: '0.7rem' }}><strong>Fecha:</strong> {formatDate(logisticsData.fechaDespacho)}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Columna Derecha (Cliente / Recibe) */}
          <Box sx={{ width: '45%' }}>
            <Box sx={{ border: '1px solid #ccc', p: 1.5, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>Cliente (Recibe Conforme)</Typography>
              <Box sx={{ flexGrow: 1, minHeight: '50px' }} />
              <Box sx={{ borderTop: '1px solid #000', pt: 1 }}>
                <Typography display="block" align="left" variant="caption" sx={{ fontSize: '0.7rem', mb: 0.5 }}><strong>Nombre y Apellido:</strong></Typography>
                <Typography display="block" align="left" variant="caption" sx={{ fontSize: '0.7rem', mb: 0.5 }}><strong>C.I:</strong></Typography>
                <Typography display="block" align="left" variant="caption" sx={{ fontSize: '0.7rem', mb: 0.5 }}><strong>Lugar:</strong> {logisticsData.lugarRecepcion}</Typography>
                <Typography display="block" align="left" variant="caption" sx={{ fontSize: '0.7rem' }}><strong>Fecha:</strong> {formatDate(logisticsData.fechaRecepcion)}</Typography>
              </Box>
            </Box>
          </Box>

        </Box>
      </Box> {/* Fin del pie de página */}

      {/* --- ETIQUETA DE COPIA (ORIGINAL / COPIA) --- */}
      {copyLabel && (
        <Box sx={{ mt: 2, textAlign: 'center', width: '100%' }}>
          <Typography className="document-copy-label" variant="body1" sx={{ fontWeight: 'bold', color: 'error.main', textTransform: 'uppercase' }}>
            {copyLabel}
          </Typography>
        </Box>
      )}
    </Paper>
  );
});

export default DeliveryNoteDocument;