import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Divider } from '@mui/material';
import logo from '../assets/logo_nuevo-removebg-preview.png';

const ExitDocument = React.forwardRef(({ exitData }, ref) => {
    if (!exitData) return null;

    return (
        // Estilos para simular hoja Carta en pantalla, anulados para impresión
        <Paper ref={ref} sx={{
            p: 4,
            margin: 'auto',
            width: '100%',
            maxWidth: '800px',
            minHeight: '1000px',
            backgroundColor: '#fff',
            color: '#000',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            
            
        }}>
            {/* --- ENCABEZADO --- */}
            <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Grid item><img src={logo} alt="Logo Suplicon C.A." style={{ height: '60px' }} /></Grid>
                <Grid item>
                    <Typography variant="h4" component="h1" align="right">Reporte de Salida</Typography>
                    <Typography align="right">Correlativo: **{exitData.correlative}**</Typography>
                </Grid>
            </Grid>

            {/* --- DETALLES DE LA SALIDA --- */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, borderBottom: '1px solid #ccc', pb: 2 }}>
                <Box><Typography variant="subtitle2" color="textSecondary">Fecha:</Typography><Typography variant="body1">{exitData.date}</Typography></Box>
                <Box><Typography variant="subtitle2" color="textSecondary">Cliente:</Typography><Typography variant="body1">{exitData.customerName}</Typography></Box>
                <Box><Typography variant="subtitle2" color="textSecondary">Emisor:</Typography><Typography variant="body1">{exitData.issuerName}</Typography></Box>
            </Box>

            {/* --- TABLA DE PRODUCTOS --- */}
            <Box sx={{ flexGrow: 1, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Productos Egresados</Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Código</TableCell>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Categoría</TableCell>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Descripción</TableCell>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Marca</TableCell>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Seriales</TableCell>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Unidad</TableCell>
                                <TableCell sx={{ color: '#000', fontWeight: 'bold' }} align="right">Cantidad</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {exitData.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell sx={{ color: '#000' }}>{item.sku}</TableCell>
                                    <TableCell sx={{ color: '#000' }}>{item.category}</TableCell>
                                    <TableCell sx={{ color: '#000' }}>{item.description}</TableCell>
                                    <TableCell sx={{ color: '#000' }}>{item.brand}</TableCell>
                                    <TableCell sx={{ color: '#000' }}>{item.serials.join(', ')}</TableCell>
                                    <TableCell sx={{ color: '#000' }}>{item.unitOfMeasure}</TableCell>
                                    <TableCell sx={{ color: '#000' }} align="right">{item.quantity}</TableCell>
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
                    <Grid item xs={6}>
                        <Typography variant="subtitle2">Inversiones Suplicon C.A.</Typography>
                        <Typography variant="caption" display="block">Av. Veracruz, Edif. Torreon, Piso 5, Of B-4, Urb. Las Mercedes, Caracas, Venezuela.</Typography>
                        <Typography variant="caption" display="block">Teléfono: (0212) 951-8303</Typography>
                        <Typography variant="caption" display="block">Email: suplicon@suplicon.com</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Box sx={{ border: '1px solid #ccc', p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                            <Box sx={{ borderTop: '1px solid #000', mt: 8, pt: 1 }}>
                                <Typography align="center" variant="body2" sx={{ mb: 1 }}>Firma del Emisor</Typography>
                                <Typography align="left" variant="caption" display="block">**Nombre:** {exitData.issuerName}</Typography>
                                <Typography align="left" variant="caption" display="block">**C.I:** {exitData.issuerNationalId}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
});

export default ExitDocument;