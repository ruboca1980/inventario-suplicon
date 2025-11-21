import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Box, Typography, List, ListItem, ListItemText, IconButton, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const SerialManager = ({ open, onClose, onSave, quantityNeeded }) => {
    const [currentSerial, setCurrentSerial] = useState('');
    const [serialsList, setSerialsList] = useState([]);

    useEffect(() => {
        if (open) {
            setSerialsList([]);
        }
    }, [open]);

    const handleAddSerial = () => {
        const trimmedSerial = currentSerial.trim();
        if (trimmedSerial === '' || serialsList.length >= quantityNeeded) return;

        if (serialsList.includes(trimmedSerial)) {
            alert(`El serial "${trimmedSerial}" ya ha sido ingresado en esta lista.`);
            setCurrentSerial('');
            return;
        }

        setSerialsList([...serialsList, trimmedSerial]);
        setCurrentSerial('');
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSerial();
        }
    };

    const handleRemoveSerial = (serialToRemove) => {
        setSerialsList(serialsList.filter(s => s !== serialToRemove));
    };

    const handleGenerateInternal = () => {
        const timestamp = Date.now();
        const internalSerial = `INT-${timestamp}`;
        setCurrentSerial(internalSerial);
    };

    const handleAccept = () => {
        if (serialsList.length !== quantityNeeded) {
            alert(`Debe ingresar exactamente ${quantityNeeded} seriales. Ha ingresado ${serialsList.length}.`);
            return;
        }
        // 1. Llama a la función para guardar y añadir el producto
        onSave(serialsList);
        // 2. Llama a la función para cerrar el modal
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Gestor de Seriales</DialogTitle>
            <DialogContent>
                <Typography variant="h6" gutterBottom>
                    Seriales Ingresados: {serialsList.length} de {quantityNeeded}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <TextField
                        label="Ingrese el Serial"
                        value={currentSerial}
                        onChange={(e) => setCurrentSerial(e.target.value)}
                        onKeyDown={handleKeyDown}
                        fullWidth
                        autoFocus
                    />
                    <Button variant="outlined" color="secondary" onClick={handleAddSerial}>Agregar</Button>
                </Box>
                <Button color="secondary" onClick={handleGenerateInternal} sx={{ mb: 2 }}>Generar Interno</Button>

                <Typography>Seriales en la lista:</Typography>
                <Paper variant="outlined" sx={{ minHeight: '150px', maxHeight: '200px', overflowY: 'auto' }}>
                    <List dense>
                        {serialsList.map((serial, index) => (
                            <ListItem key={index} secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveSerial(serial)}>
                                    <DeleteIcon />
                                </IconButton>
                            }>
                                <ListItemText primary={serial} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </DialogContent>
            <DialogActions>
                <Button color="inherit" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleAccept} variant="contained">Aceptar y Añadir</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SerialManager;