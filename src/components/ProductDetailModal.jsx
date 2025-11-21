import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  Typography, Grid, Box, Chip, Divider, CircularProgress 
} from '@mui/material';
import { getAvailableSerialsForProduct } from '../firebase/serialServices';

const ProductDetailModal = ({ open, onClose, product }) => {
  const [serials, setSerials] = useState([]);
  const [loadingSerials, setLoadingSerials] = useState(false);

  // Cuando se abre el modal o cambia el producto, buscamos sus seriales
  useEffect(() => {
    if (open && product && product.type === 'Equipo') {
      setLoadingSerials(true);
      getAvailableSerialsForProduct(product.id)
        .then(foundSerials => {
          setSerials(foundSerials);
          setLoadingSerials(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingSerials(false);
        });
    } else {
      setSerials([]); // Si es Material, no tiene seriales
    }
  }, [open, product]);

  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        Detalles del Producto
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        {/* Encabezado con Nombre y Stock Grande */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              {product.productName || product.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {product.id}
            </Typography>
          </Box>
          <PaperElevationStock stock={product.currentStock} min={product.minStockLevel} unit={product.unitOfMeasure} />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Información Técnica */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">Código (SKU)</Typography>
            <Typography variant="body1" fontWeight="medium">{product.sku}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">Marca</Typography>
            <Typography variant="body1" fontWeight="medium">{product.brand}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">Categoría</Typography>
            <Typography variant="body1" fontWeight="medium">{product.category}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">Tipo</Typography>
            <Chip label={product.type} size="small" color={product.type === 'Equipo' ? 'primary' : 'default'} />
          </Grid>
        </Grid>

        {/* Sección de Seriales (Solo para Equipos) */}
        {product.type === 'Equipo' && (
          <Box sx={{ backgroundColor: '#f9f9f9', p: 2, borderRadius: 2, border: '1px solid #eee' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Seriales Disponibles ({serials.length})
            </Typography>
            
            {loadingSerials ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : serials.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {serials.map((s) => (
                  <Chip 
                    key={s.id} 
                    label={s.serialNumber} 
                    variant="outlined" 
                    sx={{ bgcolor: 'white' }} 
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No se encontraron seriales en stock para este equipo.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="contained">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

// Pequeño componente interno para mostrar el cuadro de stock de colores
const PaperElevationStock = ({ stock, min, unit }) => {
  const isLow = stock <= (min || 5);
  return (
    <Box sx={{ 
      textAlign: 'center', 
      p: 1.5, 
      borderRadius: 2, 
      bgcolor: isLow ? '#ffebee' : '#e8f5e9',
      color: isLow ? '#c62828' : '#2e7d32',
      border: `1px solid ${isLow ? '#ffcdd2' : '#c8e6c9'}`
    }}>
      <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>DISPONIBLE</Typography>
      <Typography variant="h4" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
        {stock}
      </Typography>
      <Typography variant="caption">{unit}</Typography>
    </Box>
  );
};

export default ProductDetailModal;