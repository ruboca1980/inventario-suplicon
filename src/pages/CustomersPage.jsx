import React, { useState, useEffect } from 'react';
import { getCustomersRealTime, addCustomer, updateCustomer, deleteCustomer } from '../firebase/customerServices';
import CustomerForm from '../components/CustomerForm.jsx';
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, CircularProgress, TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// 1. IMPORTAR NOTISTACK
import { useSnackbar } from 'notistack';

const CustomersPage = () => {
  // 2. INICIALIZAR
  const { enqueueSnackbar } = useSnackbar();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = getCustomersRealTime((fetchedCustomers) => {
      setCustomers(fetchedCustomers);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Lógica de filtrado
  const filteredCustomers = customers.filter(customer => {
    const term = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(term) ||
      customer.rif.toLowerCase().includes(term) ||
      (customer.phone && customer.phone.toLowerCase().includes(term))
    );
  });

  const handleSave = async (customerData) => {
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, customerData);
        // 3. NOTIFICACIÓN DE ÉXITO (Actualizar)
        enqueueSnackbar('Cliente actualizado correctamente.', { variant: 'success' });
      } else {
        await addCustomer(customerData);
        // 3. NOTIFICACIÓN DE ÉXITO (Crear)
        enqueueSnackbar('Cliente creado correctamente.', { variant: 'success' });
      }
      closeModal();
    } catch (error) {
      console.error("Error guardando cliente:", error);
      // 3. NOTIFICACIÓN DE ERROR
      enqueueSnackbar("Error al guardar el cliente.", { variant: 'error' });
    }
  };

  const handleDelete = async (customerId) => {
    if (window.confirm("¿Seguro que quieres eliminar este cliente?")) {
      try {
        await deleteCustomer(customerId);
        // 3. NOTIFICACIÓN DE ÉXITO (Borrar)
        enqueueSnackbar('Cliente eliminado.', { variant: 'success' });
      } catch (error) {
        console.error("Error eliminando cliente:", error);
        // 3. NOTIFICACIÓN DE ERROR
        enqueueSnackbar("Error al eliminar el cliente.", { variant: 'error' });
      }
    }
  };

  const openModal = (customer = null) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCustomer(null);
    setIsModalOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">Gestión de Clientes</Typography>
        <Button variant="contained" color="primary" onClick={() => openModal()}>
          Añadir Cliente
        </Button>
      </Box>

      {/* Campo de búsqueda */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Buscar Cliente (por nombre, RIF, teléfono...)"
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
              {filteredCustomers.map(customer => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.rif}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => openModal(customer)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(customer.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {isModalOpen && (
        <CustomerForm
          open={isModalOpen}
          onClose={closeModal}
          onSave={handleSave}
          customerToEdit={editingCustomer}
        />
      )}
    </Box>
  );
};

export default CustomersPage;