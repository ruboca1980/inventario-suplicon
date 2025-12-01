import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Divider } from '@mui/material';
import logo from '../assets/logo_nuevo-removebg-preview.png';

const ExitDocument = React.forwardRef(({ exitData }, ref) => {
    if (!exitData) return null;

    return (
        <Paper
            ref={ref}
            sx={{
                // --- Estilos para VISTA PREVIA y EXPORTACIÓN PDF ---
                maxWidth: '800px',
                width: '100%',
                minHeight: '1000px', // Altura fija para evitar problemas con el footer
                p: 4,
                backgroundColor: '#fff',
                color: '#000',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative', // Ancla para el footer absoluto
            }}
        >
            {/* --- CONTENIDO DEL DOCUMENTO --- */}
            <Box>
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
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>Productos Egresados</Typography>
                    <TableContainer sx={{ overflowX: 'hidden' }}>
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
                                {exitData.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell sx={{ color: '#000', fontSize: '10px', padding: '4px' }}>{item.sku}</TableCell>
                                        <TableCell sx={{ color: '#000', fontSize: '10px', padding: '4px' }}>{item.category}</TableCell>
                                        <TableCell sx={{ color: '#000', fontSize: '10px', padding: '4px', wordWrap: 'break-word' }}>{item.description}</TableCell>
                                        <TableCell sx={{ color: '#000', fontSize: '10px', padding: '4px' }}>{item.brand}</TableCell>
                                        <TableCell sx={{ color: '#000', fontSize: '10px', padding: '4px', wordWrap: 'break-word' }}>{item.serials.join(', ')}</TableCell>
                                        <TableCell sx={{ color: '#000', fontSize: '10px', padding: '4px' }}>{item.unitOfMeasure}</TableCell>
                                        <TableCell sx={{ color: '#000', fontSize: '10px', padding: '4px' }} align="right">{item.quantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box>

            {/* --- PIE DE PÁGINA --- */}
            <Box
                component="footer"
                sx={{
                    position: 'absolute',
                    bottom: '32px',
                    left: '32px',
                    right: '32px',
                    pt: 2,
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid',
                }}
            >
                <Divider sx={{ mb: 2 }} />
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
                            <Box sx={{ borderTop: '1px solid #000', pt: 1 }}>
                                <Typography align="center" variant="body2" sx={{ mb: 1 }}>Firma del Emisor</Typography>
                                <Typography align="left" variant="caption" display="block">**Nombre:** {exitData.issuerName}</Typography>
                                <Typography align="left" variant="caption" display="block">**C.I:** {exitData.issuerNationalId}</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
});

export default ExitDocument;