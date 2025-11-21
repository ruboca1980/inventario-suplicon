import React from 'react';
import { TextField, Box, Typography, Divider } from '@mui/material';

/**
 * Componente para editar los datos de Logística (transporte)
 * en la Nota de Entrega.
 * REFACTORIZADO para usar Flexbox en lugar de Grid.
 */
const DeliveryNoteLogistics = ({ logisticsData, setLogisticsData }) => {

  // Función genérica para manejar cambios en cualquier campo de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLogisticsData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    // Contenedor principal: apila verticalmente todas las filas
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* --- FILA 1: Conductor y Cédula --- */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        flexDirection: { xs: 'column', sm: 'row' } 
      }}>
        <TextField
          fullWidth
          label="Nombre del Conductor"
          name="conductorName"
          value={logisticsData.conductorName}
          onChange={handleChange}
          variant="outlined"
          sx={{ flex: { sm: 2 } }} 
        />
        <TextField
          fullWidth
          label="Cédula del Conductor"
          name="conductorId"
          value={logisticsData.conductorId}
          onChange={handleChange}
          variant="outlined"
          sx={{ flex: { sm: 1 } }}
        />
      </Box>

      {/* --- FILA 2: Ayudante y Cédula --- */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        flexDirection: { xs: 'column', sm: 'row' } 
      }}>
        <TextField
          fullWidth
          label="Nombre del Ayudante (Opcional)"
          name="ayudanteName"
          value={logisticsData.ayudanteName}
          onChange={handleChange}
          variant="outlined"
          sx={{ flex: { sm: 2 } }}
        />
        <TextField
          fullWidth
          label="Cédula del Ayudante (Opcional)"
          name="ayudanteId"
          value={logisticsData.ayudanteId}
          onChange={handleChange}
          variant="outlined"
          sx={{ flex: { sm: 1 } }}
        />
      </Box>

      {/* --- SEPARADOR ORGANIZATIVO --- */}
      <Divider sx={{ my: 2 }}>
        <Typography variant="caption" color="textSecondary" sx={{ px: 1 }}>
          Datos del Vehículo
        </Typography>
      </Divider>

      {/* --- FILA 3: Chuto (Camión) --- */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        flexDirection: { xs: 'column', sm: 'row' } 
      }}>
        {/* --- ¡CAMBIO 1 AQUÍ! --- */}
        <TextField
          fullWidth
          label="Chuto o Camión (Marca)"
          name="chutoMarca"
          value={logisticsData.chutoMarca}
          onChange={handleChange}
          variant="outlined"
          sx={{ flex: { sm: 1 } }}
        />
        <TextField
          fullWidth
          label="Modelo"
          name="chutoModelo"
          value={logisticsData.chutoModelo}
          onChange={handleChange}
          variant="outlined"
          sx={{ flex: { sm: 1 } }}
        />
        <TextField
          fullWidth
          label="Color"
          name="chutoColor"
          value={logisticsData.chutoColor}
          onChange={handleChange}
          variant="outlined"
          sx={{ flex: { sm: 1 } }}
        />
        <TextField
          fullWidth
          label="Placa"
          name="chutoPlaca"
          value={logisticsData.chutoPlaca}
          onChange={handleChange}
          variant="outlined"
          sx={{ flex: { sm: 1 } }}
        />
      </Box>

      {/* --- FILA 4: Batea (Remolque) --- */}
      {/* --- ¡CAMBIO 2 AQUÍ! --- */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        flexDirection: { xs: 'column', sm: 'row' } 
      }}>
        {/* Nuevo campo "Batea (Marca)" */}
        <TextField
          fullWidth
          label="Batea (Marca)"
          name="bateaMarca"
          value={logisticsData.bateaMarca}
          onChange={handleChange}
          variant="outlined"
          sx={{ flex: { sm: 1 } }} // 1/3 de ancho
        />
        <TextField
          fullWidth
          label="Batea (Color)"
          name="bateaColor"
          value={logisticsData.bateaColor}
          onChange={handleChange}
          variant="outlined"
          sx={{ flex: { sm: 1 } }} // 1/3 de ancho
        />
        <TextField
          fullWidth
          label="Batea (Placa)"
          name="bateaPlaca"
          value={logisticsData.bateaPlaca}
          onChange={handleChange}
          variant="outlined"
          sx={{ flex: { sm: 1 } }} // 1/3 de ancho
        />
      </Box>

    </Box>
  );
};

export default DeliveryNoteLogistics;