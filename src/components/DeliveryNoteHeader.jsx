import React from 'react';
import { TextField, Box } from '@mui/material';

/**
 * Componente para editar los datos del cliente en la Nota de Entrega.
 * (ACTUALIZADO con nuevo layout de 4 filas y campo 'orderNumber')
 */
const DeliveryNoteHeader = ({ customerData, setCustomerData }) => {

  // Función genérica para manejar cambios en cualquier campo de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    // Contenedor principal: apila verticalmente todas las filas
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* --- FILA 1: Nombre (más ancho) y RIF (más estrecho) --- */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        flexDirection: { xs: 'column', sm: 'row' } 
      }}>
        <TextField
          fullWidth
          label="Nombre o Razón Social"
          name="name"
          value={customerData.name}
          onChange={handleChange}
          variant="outlined"
          sx={{ flex: { sm: 3 } }} // 3/4 de ancho
        />
        <TextField
          fullWidth
          label="RIF"
          name="rif"
          value={customerData.rif}
          onChange={handleChange}
          variant="outlined"
          sx={{ flex: { sm: 1 } }} // 1/4 de ancho
        />
      </Box>

      {/* --- FILA 2: Dirección Fiscal (ancho completo) --- */}
      <TextField
        fullWidth
        label="Dirección Fiscal"
        name="address"
        value={customerData.address}
        onChange={handleChange}
        variant="outlined"
        multiline
        rows={2}
      />

      {/* --- FILA 3: Contacto (más ancho) y Teléfono (más estrecho) --- */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        flexDirection: { xs: 'column', sm: 'row' } 
      }}>
        <TextField
          fullWidth
          label="Persona Contacto"
          name="contactName"
          value={customerData.contactName}
          onChange={handleChange}
          variant="outlined"
          sx={{ flex: { sm: 2 } }} // 2/3 de ancho
        />
        <TextField
          fullWidth
          label="Teléfono"
          name="phone"
          value={customerData.phone}
          onChange={handleChange}
          variant="outlined"
          sx={{ flex: { sm: 1 } }} // 1/3 de ancho
        />
      </Box>

      {/* --- FILA 4: Correo (50%) y N° de Orden (50%) --- */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        flexDirection: { xs: 'column', sm: 'row' } 
      }}>
        <TextField
          fullWidth
          label="Correo"
          name="contactEmail"
          value={customerData.contactEmail}
          onChange={handleChange}
          variant="outlined"
          sx={{ flex: { sm: 1 } }} // 1/2 de ancho
        />
        <TextField
          fullWidth
          label="Número de Orden o Pedido"
          name="orderNumber"
          value={customerData.orderNumber}
          onChange={handleChange}
          variant="outlined"
          sx={{ flex: { sm: 1 } }} // 1/2 de ancho
        />
      </Box>

    </Box>
  );
};

export default DeliveryNoteHeader;