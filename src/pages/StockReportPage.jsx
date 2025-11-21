import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'; // Lo mantenemos para el botón
import VisibilityIcon from '@mui/icons-material/Visibility'; // Icono para vista previa
import { getInventoryRealTime } from '../firebase/inventoryServices';
import StockPreviewModal from '../components/StockPreviewModal.jsx'; // Importamos el nuevo modal

// Las librerías jsPDF y html2canvas ya no son necesarias aquí, se usan en el modal
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

const StockReportPage = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    // Estados para el modal
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState([]);

    useEffect(() => {
        const unsubscribe = getInventoryRealTime((inventoryItems) => {
            const formattedInventory = inventoryItems.map(item => ({
                id: item.productId || doc.id,
                ...item
            }));
            setInventory(formattedInventory);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredInventory = inventory.filter(item =>
        (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.productName && item.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const columns = [
        { field: 'sku', headerName: 'Código', flex: 1 },
        { field: 'category', headerName: 'Categoría', flex: 1 },
        { field: 'productName', headerName: 'Descripción', flex: 2 },
        { field: 'brand', headerName: 'Marca', flex: 1 },
        { field: 'type', headerName: 'Tipo', flex: 1 },
        { field: 'unitOfMeasure', headerName: 'Unidad', flex: 0.5 },
        {
            field: 'currentStock',
            headerName: 'Stock Actual',
            flex: 0.5,
            align: 'right',
            headerAlign: 'right',
            cellClassName: (params) => {
                if (params.row.minStockLevel && params.value <= params.row.minStockLevel) {
                    return 'low-stock';
                }
                return '';
            },
        },
    ];

    // Función para abrir el modal de vista previa
    const handleOpenPreview = () => {
        setPreviewData(filteredInventory); // Pasamos los datos filtrados al modal
        setIsPreviewOpen(true);
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{
                '& .low-stock': { backgroundColor: 'rgba(255, 153, 153, 0.3)', color: '#000',},
                '& .MuiDataGrid-cell.low-stock': { color: '#000', }
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4">Reporte de Stock Actual</Typography>
                    {/* El botón ahora abre la vista previa */}
                    <Tooltip title="Vista Previa / Exportar">
                        <Button variant="contained" onClick={handleOpenPreview} startIcon={<VisibilityIcon />}>
                            Vista Previa
                        </Button>
                    </Tooltip>
                </Box>
                <TextField
                    fullWidth
                    label="Buscar por Código, Descripción, Categoría o Marca"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Box sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={filteredInventory}
                        columns={columns}
                        loading={loading}
                        localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                        pageSizeOptions={[10, 25, 50, 100]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10 } },
                        }}
                    />
                </Box>
            </Box>
            {/* Renderizamos el modal */}
            <StockPreviewModal
                open={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                stockData={previewData}
            />
        </Paper>
    );
};

export default StockReportPage;