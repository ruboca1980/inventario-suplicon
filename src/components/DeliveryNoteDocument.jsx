import React from 'react';
import {
  Box, Typography, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Grid, Divider
} from '@mui/material';
import logo from '../assets/logo_nuevo-removebg-preview.png';

/**
 * Plantilla visual para la Nota de Entrega (NE).
 * (ACTUALIZADA: Corregido error de tipeo 'logDisticsData')
 */
const DeliveryNoteDocument = React.forwardRef(({ neData }, ref) => {
  if (!neData) return null;

  const { correlative, customerData, logisticsData, itemsData, issuerData } = neData;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-VE', { timeZone: 'America/Caracas' });
  };

  return (
    <Paper
      ref={ref}
      sx={{
        maxWidth: '800px', width: '100%', minHeight: '950px',
        p: 3,
        backgroundColor: '#fff', color: '#000',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        // position: 'relative', // ELIMINADO
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

        {/* --- SECCIÓN 1: DATOS DEL CLIENTE --- */}
        <Box sx={{ border: '1px solid #ccc', p: 1.5, mb: 2 }}>
          <Grid container spacing={1} sx={{ fontSize: '0.8rem' }}>
            <Grid item xs={12} sm={7}><Typography variant="body2"><strong>Nombre ó Razón Social:</strong> {customerData.name}</Typography></Grid>
            <Grid item xs={12} sm={5}><Typography variant="body2"><strong>RIF:</strong> {customerData.rif}</Typography></Grid>
            <Grid item xs={12}><Typography variant="body2"><strong>Dirección Fiscal:</strong> {customerData.address}</Typography></Grid>
            <Grid item xs={12} sm={7}><Typography variant="body2"><strong>Persona Contacto:</strong> {customerData.contactName || 'N/A'}</Typography></Grid>
            <Grid item xs={12} sm={5}><Typography variant="body2"><strong>Teléfono:</strong> {customerData.phone || 'N/A'}</Typography></Grid>
            <Grid item xs={12} sm={7}><Typography variant="body2"><strong>Correo:</strong> {customerData.contactEmail || 'N/A'}</Typography></Grid>
            <Grid item xs={12} sm={5}><Typography variant="body2"><strong>N° de Orden/Pedido:</strong> {customerData.orderNumber || 'N/A'}</Typography></Grid>
          </Grid>
        </Box>

        {/* --- SECCIÓN 2: TABLA DE PRODUCTOS --- */}
        <Box sx={{ mb: 2 }}>
          <TableContainer sx={{ '@media print': { overflow: 'hidden' } }}>
            <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '15%', fontWeight: 'bold', fontSize: '0.8rem', p: 0.5 }} align="right">Cantidad</TableCell>
                  <TableCell sx={{ width: '35%', fontWeight: 'bold', fontSize: '0.8rem', p: 0.5 }}>Descripción</TableCell>
                  <TableCell sx={{ width: '20%', fontWeight: 'bold', fontSize: '0.8rem', p: 0.5 }}>Marca</TableCell>
                  <TableCell sx={{ width: '30%', fontWeight: 'bold', fontSize: '0.8rem', p: 0.5 }}>Seriales</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {itemsData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell align="right" sx={{ fontSize: '0.8rem', verticalAlign: 'top', p: 0.5, wordBreak: 'break-word' }}>{item.quantity}</TableCell>
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
        {/* --- SECCIÓN 3: DATOS DE LOGÍSTICA --- */}
        <Box sx={{ border: '1px solid #ccc', p: 1.5, mb: 1.5 }}>
          <Typography variant="body1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Información Logística de Entrega
          </Typography>
          <Grid container spacing={0.5} sx={{ fontSize: '0.75rem' }}>
            <Grid item xs={8}><Typography variant="caption"><strong>Conductor:</strong> {logisticsData.conductorName}</Typography></Grid>
            <Grid item xs={4}><Typography variant="caption"><strong>C.I:</strong> {logisticsData.conductorId}</Typography></Grid>
            {/* --- ¡AQUÍ ESTABA EL ERROR! --- */}
            {/* Corregido de logDisticsData a logisticsData */}
            <Grid item xs={8}><Typography variant="caption"><strong>Ayudante:</strong> {logisticsData.ayudanteName || 'N/A'}</Typography></Grid>
            <Grid item xs={4}><Typography variant="caption"><strong>C.I:</strong> {logisticsData.ayudanteId || 'N/A'}</Typography></Grid>
          </Grid>
          <Divider sx={{ my: 0.5 }} />
          <Grid container spacing={0.5} sx={{ fontSize: '0.75rem' }}>
            <Grid item xs={3}><Typography variant="caption"><strong>Chuto:</strong> {logisticsData.chutoMarca}</Typography></Grid>
            <Grid item xs={3}><Typography variant="caption"><strong>Modelo:</strong> {logisticsData.chutoModelo}</Typography></Grid>
            <Grid item xs={3}><Typography variant="caption"><strong>Color:</strong> {logisticsData.chutoColor}</Typography></Grid>
            <Grid item xs={3}><Typography variant="caption"><strong>Placa:</strong> {logisticsData.chutoPlaca}</Typography></Grid>
          </Grid>
          <Grid container spacing={0.5} sx={{ fontSize: '0.75rem' }}>
            <Grid item xs={4}><Typography variant="caption"><strong>Batea (Marca):</strong> {logisticsData.bateaMarca}</Typography></Grid>
            <Grid item xs={4}><Typography variant="caption"><strong>Batea (Color):</strong> {logisticsData.bateaColor}</Typography></Grid>
            <Grid item xs={4}><Typography variant="caption"><strong>Batea (Placa):</strong> {logisticsData.bateaPlaca}</Typography></Grid>
          </Grid>
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
                <Typography align="left" variant="caption" sx={{ fontSize: '0.7rem' }}><strong>Nombre:</strong> {issuerData.name}</Typography>
                <Typography align="left" variant="caption" sx={{ fontSize: '0.7rem' }}><strong>C.I:</strong> {issuerData.nationalId}</Typography>
                <Typography align="left" variant="caption" sx={{ fontSize: '0.7rem' }}><strong>Lugar:</strong> {logisticsData.lugarDespacho}</Typography>
                <Typography align="left" variant="caption" sx={{ fontSize: '0.7rem' }}><strong>Fecha:</strong> {formatDate(logisticsData.fechaDespacho)}</Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Columna Derecha (Cliente / Recibe) */}
          <Box sx={{ width: '45%' }}>
            <Box sx={{ border: '1px solid #ccc', p: 1.5, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>Cliente (Recibe Conforme)</Typography>
              <Box sx={{ flexGrow: 1, minHeight: '50px' }} />
              <Box sx={{ borderTop: '1px solid #000', pt: 1 }}>
                <Typography align="left" variant="caption" sx={{ fontSize: '0.7rem' }}><strong>Nombre y Apellido:</strong></Typography>
                <Typography align="left" variant="caption" sx={{ fontSize: '0.7rem' }}><strong>C.I:</strong></Typography>
                <Typography align="left" variant="caption" sx={{ fontSize: '0.7rem' }}><strong>Lugar:</strong> {logisticsData.lugarRecepcion}</Typography>
                <Typography align="left" variant="caption" sx={{ fontSize: '0.7rem' }}><strong>Fecha:</strong> {formatDate(logisticsData.fechaRecepcion)}</Typography>
              </Box>
            </Box>
          </Box>
          
        </Box>
      </Box> {/* Fin del pie de página */}
    </Paper>
  );
});

export default DeliveryNoteDocument;