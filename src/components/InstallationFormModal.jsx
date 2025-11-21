import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Grid, Typography, Box 
} from '@mui/material'; // Quitamos 'Alert' de MUI porque usaremos notistack
import SaveIcon from '@mui/icons-material/Save';
import LinkIcon from '@mui/icons-material/Link';

// Importamos la función para guardar en Firebase
import { registerInstallation } from '../firebase/installationServices';

// --- ¡NUEVA IMPORTACIÓN! ---
import { useSnackbar } from 'notistack';
// ---------------------------

const InstallationFormModal = ({ open, onClose, item }) => {
  // --- ¡HOOK DE NOTIFICACIONES! ---
  const { enqueueSnackbar } = useSnackbar();
  // --------------------------------

  const [installationDate, setInstallationDate] = useState(new Date().toISOString().split('T')[0]);
  const [macolla, setMacolla] = useState('');
  const [pozo, setPozo] = useState('');
  const [technician, setTechnician] = useState('');
  const [reportUrl, setReportUrl] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  
  // Ya no necesitamos el estado 'error' local porque usaremos notificaciones flotantes
  // const [error, setError] = useState(''); 

  useEffect(() => {
    if (open) {
      setInstallationDate(new Date().toISOString().split('T')[0]);
      setMacolla('');
      setPozo('');
      setTechnician('');
      setReportUrl('');
      setIsSaving(false);
    }
  }, [open, item]);

  const handleSave = async () => {
    // 1. Validaciones con NOTIFICACIÓN DE ERROR
    if (!macolla || !pozo || !reportUrl) {
      enqueueSnackbar('Por favor completa la Macolla, el Pozo y el Enlace del reporte.', { 
        variant: 'warning' // Color amarillo/naranja
      });
      return;
    }

    setIsSaving(true);

    try {
      const installData = {
        installationDate: installationDate,
        location: { macolla, pozo }, 
        technician: technician || 'No especificado',
        reportUrl: reportUrl
      };

      await registerInstallation(item.id, installData);

      // 2. Éxito con NOTIFICACIÓN VERDE
      enqueueSnackbar('¡Instalación registrada con éxito!', { 
        variant: 'success' // Color verde
      });
      
      onClose(true); 

    } catch (err) {
      console.error(err);
      // 3. Error con NOTIFICACIÓN ROJA
      enqueueSnackbar('Hubo un error al guardar. Revisa la consola.', { 
        variant: 'error' // Color rojo
      });
      setIsSaving(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        Registrar Instalación
        <Typography variant="subtitle2" color="text.secondary">
           Equipo: {item.productName} ({item.serialNumber})
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Fecha de Instalación */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="date"
              label="Fecha de Instalación"
              value={installationDate}
              onChange={(e) => setInstallationDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Ubicación (Macolla y Pozo) */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Macolla"
              value={macolla}
              onChange={(e) => setMacolla(e.target.value)}
              placeholder="Ej: M-24"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Pozo"
              value={pozo}
              onChange={(e) => setPozo(e.target.value)}
              placeholder="Ej: PZ-05"
            />
          </Grid>

          {/* Técnico */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Técnico Instalador"
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
              placeholder="Nombre del responsable"
            />
          </Grid>

          {/* Enlace al Reporte */}
          <Grid item xs={12}>
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
              <Typography variant="caption" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <LinkIcon fontSize="small" />
                ENLACE DEL REPORTE DIGITAL
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="Pegar enlace aquí (Google Drive, Dropbox...)"
                value={reportUrl}
                onChange={(e) => setReportUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                helperText="Sube el PDF a tu nube y pega el link público aquí."
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose(false)} color="inherit" disabled={isSaving}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          startIcon={<SaveIcon />}
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : 'Registrar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InstallationFormModal;