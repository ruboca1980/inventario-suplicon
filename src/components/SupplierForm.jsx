import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Box } from '@mui/material';

const SupplierForm = ({ open, onClose, onSave, supplierToEdit }) => {
    const initialState = { name: '', rif: '', phone: '', address: '' };
    const [supplier, setSupplier] = useState(initialState);

    // Refs para cada campo
    const nameRef = useRef(null);
    const rifRef = useRef(null);
    const phoneRef = useRef(null);
    const addressRef = useRef(null);
    const saveButtonRef = useRef(null);

    useEffect(() => {
        if (supplierToEdit) {
            setSupplier(supplierToEdit);
        } else {
            setSupplier(initialState);
        }
        if (open) {
            setTimeout(() => {
                nameRef.current?.focus();
            }, 100);
        }
    }, [supplierToEdit, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSupplier({ ...supplier, [name]: value });
    };

    const handleSave = () => {
        if (!supplier.name || !supplier.rif) {
            alert('Nombre/Razón Social y RIF son campos obligatorios.');
            return;
        }
        onSave(supplier);
    };

    const handleKeyDown = (e, nextFieldRef) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            nextFieldRef.current?.focus();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{supplierToEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
            <DialogContent>
                <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
                    <TextField
                        inputRef={nameRef}
                        onKeyDown={(e) => handleKeyDown(e, rifRef)}
                        margin="normal" required fullWidth label="Nombre o Razón Social" name="name" value={supplier.name} onChange={handleChange}
                    />
                    <TextField
                        inputRef={rifRef}
                        onKeyDown={(e) => handleKeyDown(e, phoneRef)}
                        margin="normal" required fullWidth label="RIF" name="rif" value={supplier.rif} onChange={handleChange}
                    />
                    <TextField
                        inputRef={phoneRef}
                        onKeyDown={(e) => handleKeyDown(e, addressRef)}
                        margin="normal" fullWidth label="Teléfono" name="phone" value={supplier.phone} onChange={handleChange}
                    />
                    <TextField
                        inputRef={addressRef}
                        onKeyDown={(e) => handleKeyDown(e, saveButtonRef)}
                        margin="normal" fullWidth multiline rows={3} label="Dirección Fiscal" name="address" value={supplier.address} onChange={handleChange}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button ref={saveButtonRef} onClick={handleSave} variant="contained">Guardar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SupplierForm;