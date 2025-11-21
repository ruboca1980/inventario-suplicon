import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Divider } from '@mui/material';
import logo from '../assets/logo_nuevo-removebg-preview.png';

const StockDocument = React.forwardRef(({ stockData }, ref) => {
    if (!stockData) return null;

    return (
        // Estilos para simular hoja Carta en pantalla, anulados para impresión
        <Paper ref={ref} sx={{
            p: '20mm', // Padding similar a margen de impresión
            margin: 'auto', // Centrado
            width: '216mm', // Ancho Carta
            maxWidth: '100%', // Asegura que no se desborde en pantallas pequeñas
            minHeight: '279mm', // Alto Carta (mínimo)
            backgroundColor: '#fff',
            color: '#000',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box', // Incluye padding en el tamaño total
            '@media print': { // Estilos específicos para impresión (resetean lo anterior)
                boxShadow: 'none !important',
                border: 'none !important',
                maxWidth: 'none !important',
                width: '100% !important',
                height: '100% !important', // Ocupa toda la altura de @page
                minHeight: 'auto !important',
                margin: '0 !important',
                padding: '10mm !important', // Padding real de impresión
                }
        }}>
            {/* --- ENCABEZADO --- */}
            <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Grid item><img src={logo} alt="Logo Suplicon C.A." style={{ height: '60px' }} /></Grid>
                <Grid item>
                    <Typography variant="h4" component="h1" align="right">Reporte de Stock Actual</Typography>
                    <Typography align="right" variant="caption">Generado el: {new Date().toLocaleDateString('es-VE')}</Typography>
                </Grid>
            </Grid>

            {/* --- TABLA DE PRODUCTOS --- */}
            <Box sx={{ flexGrow: 1, mb: 4 }}> {/* Ocupa espacio disponible */}
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Código</TableCell>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Categoría</TableCell>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Descripción</TableCell>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Marca</TableCell>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Tipo</TableCell>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Unidad</TableCell>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }} align="right">Stock Actual</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stockData.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell sx={{ color: '#000' }}>{item.sku || ''}</TableCell>
                                    <TableCell sx={{ color: '#000' }}>{item.category || ''}</TableCell>
                                    <TableCell sx={{ color: '#000' }}>{item.productName || ''}</TableCell>
                                    <TableCell sx={{ color: '#000' }}>{item.brand || ''}</TableCell>
                                    <TableCell sx={{ color: '#000' }}>{item.type || ''}</TableCell>
                                    <TableCell sx={{ color: '#000' }}>{item.unitOfMeasure || ''}</TableCell>
                                    <TableCell sx={{ color: '#000' }} align="right">{item.currentStock ?? 0}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* --- PIE DE PÁGINA --- */}
            <Box component="footer" sx={{ mt: 'auto', pt: 2 }}> {/* mt: 'auto' lo empuja al final */}
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2">Inversiones Suplicon C.A.</Typography>
                        <Typography variant="caption" display="block">Av. Veracruz, Edif. Torreon, Piso 5, Of B-4, Urb. Las Mercedes, Caracas, Venezuela.</Typography>
                        <Typography variant="caption" display="block">Teléfono: (0212) 951-8303</Typography>
                        <Typography variant="caption" display="block">Email: suplicon@suplicon.com</Typography>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
});

export default StockDocument;