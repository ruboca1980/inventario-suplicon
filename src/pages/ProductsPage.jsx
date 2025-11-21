import React, { useState, useEffect } from 'react';
import { getProductsRealTime, addProduct, updateProduct, deleteProduct, checkSkuExists } from '../firebase/productServices';
import ProductForm from '../components/ProductForm.jsx';
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, CircularProgress, TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// 1. IMPORTAR EL HOOK
import { useSnackbar } from 'notistack';

const ProductsPage = () => {
  // 2. INICIALIZAR EL HOOK
  const { enqueueSnackbar } = useSnackbar();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = getProductsRealTime((fetchedProducts) => {
      setProducts(fetchedProducts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter(product => {
    const term = searchTerm.toLowerCase();
    return (
      product.sku.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      product.brand.toLowerCase().includes(term)
    );
  });

  const handleSave = async (productData) => {
    try {
      const sku = productData.sku.trim();
      if (!sku) {
        // 3. REEMPLAZO: Alerta de validación (Warning)
        enqueueSnackbar("El campo 'Código' no puede estar vacío.", { variant: 'warning' });
        return;
      }

      const skuExists = await checkSkuExists(sku, editingProduct ? editingProduct.id : null);
      if (skuExists) {
        // 3. REEMPLAZO: Alerta de error (Error)
        enqueueSnackbar(`El código "${sku}" ya existe. Usa uno único.`, { variant: 'error' });
        return;
      }

      if (editingProduct) {
        const dataToUpdate = { ...productData };
        delete dataToUpdate.id;
        await updateProduct(editingProduct.id, dataToUpdate);
        // 3. REEMPLAZO: Éxito al editar
        enqueueSnackbar('Producto actualizado correctamente.', { variant: 'success' });
      } else {
        await addProduct({ ...productData, createdAt: new Date() });
        // 3. REEMPLAZO: Éxito al crear
        enqueueSnackbar('Producto creado correctamente.', { variant: 'success' });
      }
      closeModal();
    } catch (error) {
      console.error("Error:", error);
      // 3. REEMPLAZO: Error general
      enqueueSnackbar("Error al guardar el producto.", { variant: 'error' });
    }
  };

  const handleDelete = async (productId) => {
    // OJO: Mantenemos window.confirm porque necesitamos que el usuario responda
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await deleteProduct(productId);
        // 3. REEMPLAZO: Éxito al borrar
        enqueueSnackbar('Producto eliminado.', { variant: 'success' });
      } catch (error) {
        console.error("Error:", error);
        enqueueSnackbar("Error al eliminar el producto.", { variant: 'error' });
      }
    }
  };

  const openModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Gestión de Productos
        </Typography>
        <Button variant="contained" color="primary" onClick={() => openModal()}>
          Añadir Nuevo Producto
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Buscar Producto (por código, descripción, categoría...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Marca</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Unidad</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>{product.type}</TableCell>
                  <TableCell>{product.unitOfMeasure}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => openModal(product)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(product.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {isModalOpen && (
        <ProductForm
          open={isModalOpen}
          onClose={closeModal}
          onSave={handleSave}
          productToEdit={editingProduct}
        />
      )}
    </Box>
  );
};

export default ProductsPage;