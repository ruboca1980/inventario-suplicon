import React, { useState, useEffect } from 'react';
import { getStaffRealTime, addStaff, updateStaff, deleteStaff } from '../firebase/staffServices';
import StaffForm from '../components/StaffForm.jsx';
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, CircularProgress, TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// 1. IMPORTAR NOTISTACK
import { useSnackbar } from 'notistack';

const StaffPage = () => {
  // 2. INICIALIZAR
  const { enqueueSnackbar } = useSnackbar();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = getStaffRealTime((fetchedStaff) => {
      setStaff(fetchedStaff);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredStaff = staff.filter(person => {
    const term = searchTerm.toLowerCase();
    return (
      person.name.toLowerCase().includes(term) ||
      person.nationalId.toLowerCase().includes(term) ||
      person.position.toLowerCase().includes(term)
    );
  });

  const handleSave = async (staffData) => {
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, staffData);
        // 3. NOTIFICACIÓN DE ÉXITO (Actualizar)
        enqueueSnackbar('Personal actualizado correctamente.', { variant: 'success' });
      } else {
        await addStaff(staffData);
        // 3. NOTIFICACIÓN DE ÉXITO (Crear)
        enqueueSnackbar('Personal añadido correctamente.', { variant: 'success' });
      }
      closeModal();
    } catch (error) {
      console.error("Error guardando personal:", error);
      // 3. NOTIFICACIÓN DE ERROR
      enqueueSnackbar("Error al guardar el registro.", { variant: 'error' });
    }
  };

  const handleDelete = async (staffId) => {
    if (window.confirm("¿Seguro que quieres eliminar este registro?")) {
      try {
        await deleteStaff(staffId);
        // 3. NOTIFICACIÓN DE ÉXITO (Borrar)
        enqueueSnackbar('Registro eliminado.', { variant: 'success' });
      } catch (error) {
        console.error("Error eliminando personal:", error);
        // 3. NOTIFICACIÓN DE ERROR
        enqueueSnackbar("Error al eliminar el registro.", { variant: 'error' });
      }
    }
  };

  const openModal = (person = null) => {
    setEditingStaff(person);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingStaff(null);
    setIsModalOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">Gestión de Personal</Typography>
        <Button variant="contained" color="primary" onClick={() => openModal()}>
          Añadir Personal
        </Button>
      </Box>

      {/* Campo de búsqueda */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Buscar Personal (por nombre, cédula, cargo...)"
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
                <TableCell>Nombre Completo</TableCell>
                <TableCell>Cédula</TableCell>
                <TableCell>Cargo</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStaff.map(person => (
                <TableRow key={person.id}>
                  <TableCell>{person.name}</TableCell>
                  <TableCell>{person.nationalId}</TableCell>
                  <TableCell>{person.position}</TableCell>
                  <TableCell>{person.department}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => openModal(person)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(person.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {isModalOpen && (
        <StaffForm
          open={isModalOpen}
          onClose={closeModal}
          onSave={handleSave}
          staffToEdit={editingStaff}
        />
      )}
    </Box>
  );
};

export default StaffPage;