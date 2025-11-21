import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TextField
} from '@mui/material';

/**
 * Muestra la tabla de ítems para la Nota de Entrega.
 * Permite la edición en línea de Cantidad, Descripción, Marca y Seriales.
 */
const DeliveryNoteItemsTable = ({ itemsData, setItemsData }) => {

  // Maneja el cambio en un campo editable de la tabla
  const handleItemChange = (e, itemId) => {
    const { name, value } = e.target;

    setItemsData(prevItems =>
      prevItems.map(item => {
        // Encuentra el ítem que cambió
        if (item.id === itemId) {
          let newValue = value;

          // Si el campo es 'quantity', conviértelo a número
          if (name === 'quantity') {
            newValue = parseInt(value, 10) || 0;
          }
          // Si el campo es 'serials', guárdalo como un array
          // (Aunque lo editamos como texto, lo guardamos como array)
          if (name === 'serials') {
            newValue = value.split(',').map(s => s.trim());
          }

          return {
            ...item,
            [name]: newValue, // Esto funciona para 'description' y 'brand' también
          };
        }
        return item;
      })
    );
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          {/* --- ¡COLUMNAS ACTUALIZADAS! --- */}
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', width: '15%' }} align="right">Cantidad (Editable)</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Descripción (Editable)</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Marca (Editable)</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Seriales (Editable)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {itemsData.map((item) => (
            <TableRow key={item.id}>
              
              {/* --- 1. Cantidad (Editable) --- */}
              <TableCell align="right" sx={{ verticalAlign: 'top' }}>
                <TextField
                  fullWidth
                  variant="standard"
                  name="quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(e, item.id)}
                  sx={{
                    // Alinea el texto del input a la derecha
                    '& .MuiInputBase-input': {
                      textAlign: 'right'
                    }
                  }}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </TableCell>

              {/* --- 2. Descripción (Editable) --- */}
              <TableCell sx={{ verticalAlign: 'top' }}>
                <TextField
                  fullWidth
                  variant="standard"
                  name="description"
                  value={item.description}
                  onChange={(e) => handleItemChange(e, item.id)}
                  multiline
                />
              </TableCell>

              {/* --- 3. Marca (Editable) --- */}
              <TableCell sx={{ verticalAlign: 'top' }}>
                <TextField
                  fullWidth
                  variant="standard"
                  name="brand"
                  value={item.brand}
                  onChange={(e) => handleItemChange(e, item.id)}
                  multiline
                />
              </TableCell>

              {/* --- 4. Seriales (Editable) --- */}
              <TableCell sx={{ verticalAlign: 'top' }}>
                <TextField
                  fullWidth
                  variant="standard"
                  name="serials"
                  // Unimos el array de seriales con ", " para editarlo como texto
                  value={Array.isArray(item.serials) ? item.serials.join(', ') : ''}
                  onChange={(e) => handleItemChange(e, item.id)}
                  multiline
                  placeholder="Serial1, Serial2, ..."
                />
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DeliveryNoteItemsTable;