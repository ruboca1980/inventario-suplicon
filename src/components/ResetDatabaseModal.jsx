import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, CircularProgress
} from '@mui/material';
import { resetDatabase } from '../firebase/adminServices'; // Importamos el motor
import WarningIcon from '@mui/icons-material/Warning';

const RESET_KEY = 'reset'; // La clave que el usuario debe escribir

const ResetDatabaseModal = ({ open, onClose }) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const isButtonDisabled = confirmText !== RESET_KEY || isDeleting;

  const handleReset = async () => {
    if (confirmText !== RESET_KEY) return;

    setIsDeleting(true);
    setError('');

    try {
      await resetDatabase();
      setIsDeleting(false);
      setConfirmText('');
      alert('¡Base de datos reseteada con éxito! Recarga la página (F5).');
      onClose();
      // Forzar una recarga de la página para ver los cambios
      window.location.reload(); 
    } catch (err) {
      setError('Ocurrió un error. Revisa la consola.');
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
        <WarningIcon />
        ¡Acción Irreversible!
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Estás a punto de **borrar permanentemente** todas las colecciones de datos (Productos, Clientes, Inventario, Transacciones, etc.).
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Esto no borrará a los usuarios. Para confirmar esta acción, por favor escribe la palabra "<b>{RESET_KEY}</b>" en el campo de abajo.
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          label={`Escribe "${RESET_KEY}" para confirmar`}
          type="text"
          fullWidth
          variant="standard"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          disabled={isDeleting}
        />
        {error && (
          <Typography color="error" variant="caption" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>Cancelar</Button>
        <Button
          onClick={handleReset}
          color="error"
          variant="contained"
          disabled={isButtonDisabled}
          startIcon={isDeleting ? <CircularProgress size={20} /> : null}
        >
          {isDeleting ? 'Borrando...' : 'Borrar Base de Datos'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetDatabaseModal;