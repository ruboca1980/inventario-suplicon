import React from 'react';
import {
  Box, Typography, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Grid, Divider
} from '@mui/material';
import logo from '../assets/logo_nuevo-removebg-preview.png';

/**
 * Este componente es una plantilla visual "tonta" (presentacional).
 * Su único trabajo es recibir los datos de una entrada (entryData)
 * y mostrarlos en un formato de "documento" o "reporte".
 * No tiene lógica de negocio, solo se encarga de la apariencia.
 */

// Usamos React.forwardRef para que el componente padre (EntryPreviewModal)
// pueda obtener una referencia a este <Paper> y pasársela a html2canvas para la exportación a PDF.
const EntryDocument = React.forwardRef(({ entryData }, ref) => {
  // Si no hay datos, no renderiza nada.
  if (!entryData) return null;

  return (
    // Contenedor principal que simula una hoja de papel.
    <Paper
      ref={ref}
      sx={{
        // --- Estilos para VISTA PREVIA y EXPORTACIÓN PDF ---

        // Ancho máximo para la vista previa en pantalla (modal).
        // Al imprimir o exportar, esto se anula.
        maxWidth: '800px',
        width: '100%',

        // Altura mínima fija (en píxeles) para la exportación a PDF.
        // Esto fue clave para solucionar el problema del pie de página flotante.
        // '1000px' es más corto que una página Carta (~1056px), asegurando que todo quepa.
        minHeight: '1000px',

        // Padding interno (p: 4 equivale a 4 * 8px = 32px).
        p: 4,
        backgroundColor: '#fff',
        color: '#000',
        boxSizing: 'border-box',

        // --- Lógica de Layout (Flexbox y Posicionamiento) ---

        // 1. Usamos Flexbox vertical para estructurar el contenido y el pie de página.
        display: 'flex',
        flexDirection: 'column',

        // 2. Es el "ancla" para el pie de página (que usa position: 'absolute').
        position: 'relative',

        // --- Estilos de Impresión (Comentados) ---
        // Este bloque @media print está comentado a propósito.
        // Los estilos de impresión reales se manejan en el componente
        // padre (EntryPreviewModal.jsx), donde está la etiqueta <style>.
        // Dejar esto activo causaría conflictos.
        // '@media print': { ... }
      }}
    >
      {/* --- CONTENIDO DEL DOCUMENTO --- */}
      {/* Este Box envuelve todo el contenido *excepto* el pie de página */}
      <Box>
        {/* --- ENCABEZADO (Logo y Título) --- */}
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Grid item>
            <img src={logo} alt="Logo Suplicon C.A." style={{ height: '60px' }} />
          </Grid>
          <Grid item>
            <Typography variant="h4" component="h1" align="right">Reporte de Entrada</Typography>
            <Typography align="right">Correlativo: **{entryData.correlative}**</Typography>
          </Grid>
        </Grid>

        {/* --- DETALLES (Fecha, Proveedor, Receptor) --- */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, borderBottom: '1px solid #ccc', pb: 2 }}>
          <Box><Typography variant="subtitle2" color="textSecondary">Fecha:</Typography><Typography variant="body1">{entryData.date}</Typography></Box>
          <Box><Typography variant="subtitle2" color="textSecondary">Proveedor:</Typography><Typography variant="body1">{entryData.supplierName}</Typography></Box>
          <Box><Typography variant="subtitle2" color="textSecondary">Receptor:</Typography><Typography variant="body1">{entryData.receiverName}</Typography></Box>
        </Box>

        {/* --- TABLA DE PRODUCTOS --- */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Productos Ingresados</Typography>
          {/* Contenedor de la tabla. Aseguramos que no haya scroll horizontal. */}
          <TableContainer sx={{ overflowX: 'hidden' }}>
            {/* tableLayout: 'fixed' es la clave para la impresión del navegador.
                Fuerza a la tabla a respetar el width: '100%' y a
                ajustar (wrap) el texto en lugar de desbordarse. */}
            <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold', fontSize: '11px', width: '10%', padding: '4px' }}>Código</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold', fontSize: '11px', width: '12%', padding: '4px' }}>Categoría</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold', fontSize: '11px', width: '35%', padding: '4px' }}>Descripción</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold', fontSize: '11px', width: '10%', padding: '4px' }}>Marca</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold', fontSize: '11px', width: '20%', padding: '4px' }}>Seriales</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold', fontSize: '11px', width: '8%', padding: '4px' }}>Unidad</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 'bold', fontSize: '11px', width: '5%', padding: '4px' }} align="right">Cant.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entryData.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ color: '#000', fontSize: '10px', padding: '4px' }}>{item.sku}</TableCell>
                    <TableCell sx={{ color: '#000', fontSize: '10px', padding: '4px' }}>{item.category}</TableCell>
                    <TableCell sx={{ color: '#000', fontSize: '10px', padding: '4px', wordWrap: 'break-word' }}>{item.description}</TableCell>
                    <TableCell sx={{ color: '#000', fontSize: '10px', padding: '4px' }}>{item.brand}</TableCell>
                    <TableCell sx={{ color: '#000', fontSize: '10px', padding: '4px', wordWrap: 'break-word' }}>{item.lotOrSerials}</TableCell>
                    <TableCell sx={{ color: '#000', fontSize: '10px', padding: '4px' }}>{item.unitOfMeasure}</TableCell>
                    <TableCell sx={{ color: '#000', fontSize: '10px', padding: '4px' }} align="right">{item.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box> {/* Fin del contenido superior */}

      {/* --- PIE DE PÁGINA --- */}
      <Box
        component="footer"
        sx={{
          // 1. "Clavamos" el pie de página al fondo del 'Paper' (ancla relativa).
          position: 'absolute',

          // 2. p: 4 (padding del Paper) = 4 * 8px = 32px.
          //    Esto alinea el footer con los márgenes del contenido.
          bottom: '32px',
          left: '32px',
          right: '32px',

          pt: 2, // Padding superior para el Divider

          // 3. Evita que html2canvas/jsPDF partan el pie de página en dos hojas.
          breakInside: 'avoid',
          pageBreakInside: 'avoid',
        }}
      >
        <Divider sx={{ mb: 2 }} />

        {/* Usamos Flexbox en lugar de Grid para un layout más robusto
            que html2canvas (PDF) no intente partir. */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>

          {/* Columna Izquierda (Info de la Empresa) */}
          <Box sx={{ width: '60%' }}>
            <Typography variant="subtitle2">Inversiones Suplicon C.A.</Typography>
            <Typography variant="caption" display="block">Av. Veracruz, Edif. Torreon, Piso 5, Of B-4, Urb. Las Mercedes, Caracas, Venezuela.</Typography>
            <Typography variant="caption" display="block">Teléfono: (0212) 951-8303</Typography>
            <Typography variant="caption" display="block">Email: suplicon@suplicon.com</Typography>
          </Box>

          {/* Columna Derecha (Firma) */}
          <Box sx={{ width: '35%' }}>
            <Box sx={{ border: '1px solid #ccc', p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              {/* Esta caja interna es solo para la línea superior y la firma */}
              <Box sx={{ borderTop: '1px solid #000', pt: 1 }}>
                <Typography align="center" variant="body2" sx={{ mb: 1 }}>Firma del Receptor</Typography>
                <Typography align="left" variant="caption" display="block">**Nombre:** {entryData.receiverName}</Typography>
                <Typography align="left" variant="caption" display="block">**C.I:** {entryData.receiverNationalId}</Typography>
              </Box>
            </Box>
          </Box>

        </Box>
      </Box> {/* Fin del pie de página */}
    </Paper>
  );
});

export default EntryDocument;