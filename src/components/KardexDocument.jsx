import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Divider } from '@mui/material';
import logo from '../assets/logo_nuevo-removebg-preview.png'; // Asegúrate que la ruta al logo sea correcta

const KardexDocument = React.forwardRef(({ kardexData, productInfo }, ref) => {
    if (!kardexData || !productInfo) return null;

    return (
        <Paper ref={ref} sx={{
            p: 4,
            margin: 'auto',
            maxWidth: '800px',
            width: '100%',
            backgroundColor: '#fff',
            color: '#000',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '95vh', // Altura para vista en pantalla
            '@media print': { // Estilos para impresión
            boxShadow: 'none !important',
            border: 'none !important',
            maxWidth: 'none !important',
            width: '100% !important',
            minHeight: 'auto !important',
            margin: '0 !important',
            padding: '0 !important',
            }
        }}>
            {/* --- ENCABEZADO --- */}
            <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Grid item>
                    <img src={logo} alt="Logo Suplicon C.A." style={{ height: '60px' }} />
                </Grid>
                <Grid item>
                    <Typography variant="h4" component="h1" align="right">Kardex de Producto</Typography>
                    <Typography align="right" variant="caption">Generado el: {new Date().toLocaleDateString('es-VE')}</Typography>
                </Grid>
            </Grid>

            {/* --- INFORMACIÓN DEL PRODUCTO --- */}
            <Box sx={{ mb: 3, borderBottom: '1px solid #ccc', pb: 2 }}>
                <Typography variant="h6">Producto:</Typography>
                <Typography variant="body1">**Código:** {productInfo.sku}</Typography>
                <Typography variant="body1">**Descripción:** {productInfo.description}</Typography>
                <Typography variant="body1">**Categoría:** {productInfo.category} | **Marca:** {productInfo.brand}</Typography>
            </Box>


            {/* --- TABLA DE MOVIMIENTOS --- */}
            <Box sx={{ flexGrow: 1, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Historial de Movimientos</Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Fecha</TableCell>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Correlativo</TableCell>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Tipo</TableCell>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Proveedor / Cliente</TableCell>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }} align="right">Cantidad</TableCell>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }} align="right">Saldo</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {kardexData.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell sx={{ color: '#000' }}>{item.date}</TableCell>
                                    <TableCell sx={{ color: '#000' }}>{item.correlative}</TableCell>
                                    <TableCell sx={{ color: '#000' }}>{item.type}</TableCell>
                                    <TableCell sx={{ color: '#000' }}>{item.entityName}</TableCell>
                                    <TableCell sx={{ color: '#000' }} align="right">{item.quantity}</TableCell>
                                    <TableCell sx={{ color: '#000' }} align="right">{item.balance}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* --- PIE DE PÁGINA --- */}
            <Box component="footer" sx={{ mt: 'auto', pt: 2 }}>
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

export default KardexDocument;