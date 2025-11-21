import React, { useState, useEffect } from 'react';
import { getSuppliersRealTime, addSupplier, updateSupplier, deleteSupplier } from '../firebase/supplierServices';
import SupplierForm from '../components/SupplierForm.jsx';
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, CircularProgress, TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// 1. IMPORTAR NOTISTACK
import { useSnackbar } from 'notistack';

const SuppliersPage = () => {
  // 2. INICIALIZAR
  const { enqueueSnackbar } = useSnackbar();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = getSuppliersRealTime((fetchedSuppliers) => {
      setSuppliers(fetchedSuppliers);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredSuppliers = suppliers.filter(supplier => {
    const term = searchTerm.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(term) ||
      supplier.rif.toLowerCase().includes(term) ||
      (supplier.phone && supplier.phone.toLowerCase().includes(term))
    );
  });

  const handleSave = async (supplierData) => {
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, supplierData);
        // 3. NOTIFICACIÓN DE ÉXITO (Actualizar)
        enqueueSnackbar('Proveedor actualizado correctamente.', { variant: 'success' });
      } else {
        await addSupplier(supplierData);
        // 3. NOTIFICACIÓN DE ÉXITO (Crear)
        enqueueSnackbar('Proveedor creado correctamente.', { variant: 'success' });
      }
      closeModal();
    } catch (error) {
      console.error("Error guardando proveedor:", error);
      // 3. NOTIFICACIÓN DE ERROR
      enqueueSnackbar("Error al guardar el proveedor.", { variant: 'error' });
    }
  };

  const handleDelete = async (supplierId) => {
    if (window.confirm("¿Seguro que quieres eliminar este proveedor?")) {
      try {
        await deleteSupplier(supplierId);
        // 3. NOTIFICACIÓN DE ÉXITO (Borrar)
        enqueueSnackbar('Proveedor eliminado.', { variant: 'success' });
      } catch (error) {
        console.error("Error eliminando proveedor:", error);
        // 3. NOTIFICACIÓN DE ERROR
        enqueueSnackbar("Error al eliminar el proveedor.", { variant: 'error' });
      }
    }
  };

  const openModal = (supplier = null) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingSupplier(null);
    setIsModalOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">Gestión de Proveedores</Typography>
        <Button variant="contained" color="primary" onClick={() => openModal()}>
          Añadir Proveedor
        </Button>
      </Box>

      {/* Campo de búsqueda */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Buscar Proveedor (por nombre, RIF, teléfono...)"
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
                <TableCell>Nombre / Razón Social</TableCell>
                <TableCell>RIF</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuppliers.map(supplier => (
                <TableRow key={supplier.id}>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.rif}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell>{supplier.address}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => openModal(supplier)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(supplier.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {isModalOpen && (
        <SupplierForm
          open={isModalOpen}
          onClose={closeModal}
          onSave={handleSave}
          supplierToEdit={editingSupplier}
        />
      )}
    </Box>
  );
};

export default SuppliersPage;