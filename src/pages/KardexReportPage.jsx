import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem, Autocomplete, TextField, Button, CircularProgress, Tooltip } from '@mui/material'; 
import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import VisibilityIcon from '@mui/icons-material/Visibility'; // Icono para vista previa
import { getProductsRealTime } from '../firebase/productServices';
import { getProductKardex } from '../firebase/reportServices';
import KardexPreviewModal from '../components/KardexPreviewModal.jsx'; // Importar el nuevo modal

const KardexReportPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [filteredProductsForSelect, setFilteredProductsForSelect] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [kardexData, setKardexData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [productLoading, setProductLoading] = useState(true);
    // Estados para el modal
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = getProductsRealTime((fetchedProducts) => {
            setProducts(fetchedProducts);
            const uniqueCategories = [...new Set(fetchedProducts.map(p => p.category).filter(Boolean))].sort();
            setCategories(uniqueCategories);
            setProductLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            setFilteredProductsForSelect(products.filter(p => p.category === selectedCategory));
        } else {
            setFilteredProductsForSelect(products);
        }
        setSelectedProduct(null);
        setKardexData([]);
    }, [selectedCategory, products]);

    // La función ahora solo carga los datos y abre el modal
    const handleGenerateAndShowPreview = async () => {
        if (!selectedProduct) {
            alert("Por favor, seleccione un producto.");
            return;
        }
        setLoading(true);
        try {
            const data = await getProductKardex(selectedProduct.id);
            setKardexData(data);
            setIsPreviewOpen(true); // Abre el modal después de cargar los datos
        } catch (error) {
            alert("Error al generar el Kardex.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { field: 'date', headerName: 'Fecha', width: 120 },
        { field: 'correlative', headerName: 'Correlativo', width: 130 },
        { field: 'type', headerName: 'Tipo', width: 100 },
        { field: 'entityName', headerName: 'Proveedor / Cliente', flex: 1 },
        { field: 'quantity', headerName: 'Cantidad', type: 'number', width: 100, align: 'right', headerAlign: 'right' },
        { field: 'balance', headerName: 'Saldo', type: 'number', width: 100, align: 'right', headerAlign: 'right' },
    ];

    return (
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h4">Reporte Kardex por Producto</Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
                <FormControl sx={{ flex: { xs: 1, md: 3 } }} fullWidth>
                    <InputLabel id="category-select-label">Filtrar por Categoría</InputLabel>
                    <Select
                        labelId="category-select-label"
                        value={selectedCategory}
                        label="Filtrar por Categoría"
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        disabled={productLoading}
                    >
                        <MenuItem value=""><em>Todas las Categorías</em></MenuItem>
                        {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                    </Select>
                </FormControl>
                
                <Autocomplete sx={{ flex: { xs: 1, md: 5 } }}
                    options={filteredProductsForSelect}
                    getOptionLabel={(option) => `(${option.sku}) ${option.description}`}
                    value={selectedProduct}
                    onChange={(event, newValue) => setSelectedProduct(newValue)}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => <TextField {...params} label="Seleccionar Producto" />}
                    disabled={productLoading}
                    fullWidth
                />
                
                {/* El botón ahora abre la vista previa */}
                <Tooltip title="Generar y ver vista previa">
                    <Button sx={{ flex: { xs: 1, md: 2 }, height: '56px' }}
                        variant="contained"
                        onClick={handleGenerateAndShowPreview} // Llama a la nueva función
                        disabled={!selectedProduct || loading}
                        fullWidth
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <VisibilityIcon />}
                    >
                        {loading ? 'Generando...' : 'Ver Kardex'}
                    </Button>
                </Tooltip>
            </Box>

            {/* La tabla ahora es solo una referencia visual, el reporte principal está en el modal */}
            <Box sx={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={kardexData} // Muestra los datos cargados
                    columns={columns}
                    loading={loading}
                    localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                        sorting: { sortModel: [{ field: 'date', sort: 'desc' }] } // Orden descendente en pantalla
                    }}
                />
            </Box>

            {/* Renderizamos el modal de vista previa */}
            <KardexPreviewModal
                open={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                kardexData={kardexData}
                productInfo={selectedProduct} // Pasamos la info del producto seleccionado
            />
        </Paper>
    );
};

export default KardexReportPage;