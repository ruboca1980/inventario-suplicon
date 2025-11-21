import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, 
    MenuItem, FormControl, InputLabel, Select, Box 
} from '@mui/material';

const ProductForm = ({ open, onClose, onSave, productToEdit }) => {
    const initialState = {
        sku: '', description: '', category: '', brand: '', 
        unitOfMeasure: '', type: 'Material', minStockLevel: 0,
    };

    const [product, setProduct] = useState(initialState);

    // Creamos una referencia para cada campo del formulario
    const skuRef = useRef(null);
    const descriptionRef = useRef(null);
    const categoryRef = useRef(null);
    const brandRef = useRef(null);
    const unitOfMeasureRef = useRef(null);
    const typeRef = useRef(null);
    const minStockLevelRef = useRef(null);
    const saveButtonRef = useRef(null);

    useEffect(() => {
        if (productToEdit) {
            setProduct(productToEdit);
        } else {
            setProduct(initialState);
        }
        // Cuando el formulario se abre, enfocar el primer campo
        // Usamos un pequeño retraso para asegurar que el campo sea visible
        if (open) {
            setTimeout(() => {
                skuRef.current?.focus();
            }, 100);
        }
    }, [productToEdit, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });
    };

    const handleSave = () => {
        if (!product.sku || !product.description) {
            alert('Código y Descripción son campos obligatorios.');
            return;
        }
        onSave(product);
    };
    
    // Función para manejar el evento de presionar una tecla
    const handleKeyDown = (e, nextFieldRef) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevenir la acción por defecto (enviar formulario)
            // Mover el foco al siguiente campo si existe
            if (nextFieldRef && nextFieldRef.current) {
                // El método .focus() funciona directamente en los TextField de MUI
                // y en el botón. Para el Select, nos aseguramos de que lo haga.
                nextFieldRef.current.focus();
            }
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{productToEdit ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
            <DialogContent>
                <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
                    <TextField 
                        inputRef={skuRef}
                        onKeyDown={(e) => handleKeyDown(e, descriptionRef)}
                        margin="normal" required fullWidth label="Código (único)" name="sku" value={product.sku} onChange={handleChange} 
                    />
                    <TextField 
                        inputRef={descriptionRef}
                        onKeyDown={(e) => handleKeyDown(e, categoryRef)}
                        margin="normal" required fullWidth multiline rows={3} label="Descripción" name="description" value={product.description} onChange={handleChange} 
                    />
                    <TextField 
                        inputRef={categoryRef}
                        onKeyDown={(e) => handleKeyDown(e, brandRef)}
                        margin="normal" fullWidth label="Categoría" name="category" value={product.category} onChange={handleChange} 
                    />
                    <TextField 
                        inputRef={brandRef}
                        onKeyDown={(e) => handleKeyDown(e, unitOfMeasureRef)}
                        margin="normal" fullWidth label="Marca" name="brand" value={product.brand} onChange={handleChange} 
                    />
                    <TextField 
                        inputRef={unitOfMeasureRef}
                        onKeyDown={(e) => handleKeyDown(e, typeRef)}
                        margin="normal" fullWidth label="Unidad de Medida" name="unitOfMeasure" value={product.unitOfMeasure} onChange={handleChange} 
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Tipo</InputLabel>
                        <Select 
                            inputRef={typeRef}
                            onKeyDown={(e) => handleKeyDown(e, minStockLevelRef)}
                            name="type" value={product.type} label="Tipo" onChange={handleChange}
                        >
                            <MenuItem value="Material">Material</MenuItem>
                            <MenuItem value="Equipo">Equipo</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField 
                        inputRef={minStockLevelRef}
                        onKeyDown={(e) => handleKeyDown(e, saveButtonRef)}
                        margin="normal" fullWidth type="number" label="Stock Mínimo Deseado" name="minStockLevel" value={product.minStockLevel} onChange={handleChange} 
                        InputProps={{ inputProps: { min: 0 } }}
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

export default ProductForm;