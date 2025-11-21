import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Box, Typography, List, ListItem, ListItemText, Paper, Grid, IconButton } from '@mui/material';
import { getAvailableSerialsForProduct } from '../firebase/serialServices';

const SerialSelector = ({ open, onClose, onSave, productId, productDescription, quantityNeeded }) => {
    const [availableSerials, setAvailableSerials] = useState([]);
    const [selectedSerials, setSelectedSerials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && productId) {
            setLoading(true);
            const fetchSerials = async () => {
                const serials = await getAvailableSerialsForProduct(productId);
                setAvailableSerials(serials.map(s => s.serialNumber));
                setSelectedSerials([]);
                setLoading(false);
            };
            fetchSerials();
        }
    }, [open, productId]);
    // Función para mover un serial de "Disponibles" a "Seleccionados"
    const handleMoveToSelected = (serial) => {
        if (selectedSerials.length >= quantityNeeded) return;
        setAvailableSerials(availableSerials.filter(s => s !== serial));
        setSelectedSerials([...selectedSerials, serial]);
    };
    // Función para mover un serial de "Seleccionados" de vuelta a "Disponibles"
    const handleMoveToAvailable = (serial) => {
        setSelectedSerials(selectedSerials.filter(s => s !== serial));
        setAvailableSerials([...availableSerials, serial]);
    };
    
    const handleAccept = () => {
        if (selectedSerials.length !== quantityNeeded) {
            alert(`Debe seleccionar exactamente ${quantityNeeded} seriales. Ha seleccionado ${selectedSerials.length}.`);
            return;
        }
        onSave(selectedSerials);
        onClose();
    };
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md">
            <DialogTitle>Seleccionar Seriales para Salida</DialogTitle>
            <DialogContent>
                <Typography gutterBottom><strong>Producto:</strong> {productDescription}</Typography>
                <Typography variant="h6" gutterBottom>
                    Seriales Seleccionados: {selectedSerials.length} de {quantityNeeded}
                </Typography>
                <Grid container spacing={2} justifyContent="center" alignItems="center">
                    {/* Lista de Disponibles */}
                    <Grid item xs={5}>
                        <Typography variant="subtitle2">Disponibles</Typography>
                        <Paper sx={{ height: 250, overflow: 'auto' }}>
                            <List dense>
                                {loading ? <ListItem><ListItemText primary="Cargando..." /></ListItem> : availableSerials.map(serial => (
                                    // Al hacer clic, se mueve directamente a la otra lista
                                    <ListItem button key={serial} onClick={() => handleMoveToSelected(serial)}>
                                        <ListItemText primary={serial} />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>
                    {/* Espacio central */}
                    <Grid item xs={2} />
                    {/* Lista de Seleccionados */}
                    <Grid item xs={5}>
                        <Typography variant="subtitle2">Seleccionados</Typography>
                        <Paper sx={{ height: 250, overflow: 'auto' }}>
                            <List dense>
                                {selectedSerials.map(serial => (
                                    // Al hacer clic, se mueve directamente a la otra lista
                                    <ListItem button key={serial} onClick={() => handleMoveToAvailable(serial)}>
                                        <ListItemText primary={serial} />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleAccept} variant="contained">Aceptar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SerialSelector;