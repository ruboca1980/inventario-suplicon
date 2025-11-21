import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Box } from '@mui/material';

const StaffForm = ({ open, onClose, onSave, staffToEdit }) => {
    const initialState = { name: '', employeeId: '', nationalId: '', position: '', department: '' };
    const [staffMember, setStaffMember] = useState(initialState);

    // Refs para cada campo
    const nameRef = useRef(null);
    const nationalIdRef = useRef(null);
    const employeeIdRef = useRef(null);
    const positionRef = useRef(null);
    const departmentRef = useRef(null);
    const saveButtonRef = useRef(null);

    useEffect(() => {
        if (staffToEdit) {
            setStaffMember(staffToEdit);
        } else {
            setStaffMember(initialState);
        }
        if (open) {
            setTimeout(() => {
                nameRef.current?.focus();
            }, 100);
        }
    }, [staffToEdit, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStaffMember({ ...staffMember, [name]: value });
    };

    const handleSave = () => {
        if (!staffMember.name || !staffMember.nationalId) {
            alert('Nombre y Cédula son campos obligatorios.');
            return;
        }
        onSave(staffMember);
    };

    const handleKeyDown = (e, nextFieldRef) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            nextFieldRef.current?.focus();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{staffToEdit ? 'Editar Personal' : 'Nuevo Personal'}</DialogTitle>
            <DialogContent>
                <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
                    <TextField
                        inputRef={nameRef}
                        onKeyDown={(e) => handleKeyDown(e, nationalIdRef)}
                        margin="normal" required fullWidth label="Nombre Completo" name="name" value={staffMember.name} onChange={handleChange}
                    />
                    <TextField
                        inputRef={nationalIdRef}
                        onKeyDown={(e) => handleKeyDown(e, employeeIdRef)}
                        margin="normal" required fullWidth label="Cédula de Identidad" name="nationalId" value={staffMember.nationalId} onChange={handleChange}
                    />
                    <TextField
                        inputRef={employeeIdRef}
                        onKeyDown={(e) => handleKeyDown(e, positionRef)}
                        margin="normal" fullWidth label="ID de Empleado (Opcional)" name="employeeId" value={staffMember.employeeId} onChange={handleChange}
                    />
                    <TextField
                        inputRef={positionRef}
                        onKeyDown={(e) => handleKeyDown(e, departmentRef)}
                        margin="normal" fullWidth label="Cargo" name="position" value={staffMember.position} onChange={handleChange}
                    />
                    <TextField
                        inputRef={departmentRef}
                        onKeyDown={(e) => handleKeyDown(e, saveButtonRef)}
                        margin="normal" fullWidth label="Departamento" name="department" value={staffMember.department} onChange={handleChange}
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

export default StaffForm;