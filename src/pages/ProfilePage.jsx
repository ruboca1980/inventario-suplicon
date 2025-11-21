import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Avatar, Grid, Divider, Chip, Stack, InputAdornment
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import LockResetIcon from '@mui/icons-material/LockReset';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';

import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../firebase/config';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  // Estados del formulario
  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Cargar datos al iniciar
  useEffect(() => {
    if (user) {
      setName(user.name || user.displayName || '');
      setPhotoURL(user.photoURL || '');
      setPhone(user.phone || '');           // Cargar teléfono de Firestore
      setPosition(user.position || '');     // Cargar cargo de Firestore
      setDepartment(user.department || ''); // Cargar departamento de Firestore
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      enqueueSnackbar("El nombre no puede estar vacío.", { variant: 'warning' });
      return;
    }
    setLoading(true);
    try {
      // 1. Actualizar perfil básico en Auth (Solo soporta Nombre y Foto)
      await updateProfile(auth.currentUser, { displayName: name, photoURL: photoURL });
      
      // 2. Actualizar TODOS los datos en Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { 
        name: name, 
        photoURL: photoURL,
        phone: phone,
        position: position,
        department: department
      });
      
      enqueueSnackbar("Perfil actualizado correctamente.", { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Error al actualizar perfil.", { variant: 'error' });
    }
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      enqueueSnackbar(`Correo enviado a ${user.email}.`, { variant: 'info' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Error al enviar el correo.", { variant: 'error' });
    }
  };

  const getRoleInfo = (role) => {
    switch(role) {
      case 'programmer': return { label: 'Desarrollador', color: 'secondary' };
      case 'admin': return { label: 'Jefe (Admin)', color: 'primary' };
      default: return { label: 'Usuario', color: 'default' };
    }
  };
  const roleInfo = getRoleInfo(user?.role);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, px: 2, mb: 4 }}>
      <Paper elevation={3} sx={{ maxWidth: 600, width: '100%', borderRadius: 3, overflow: 'hidden' }}>
        
        {/* --- 1. ENCABEZADO CON COLORES CORPORATIVOS --- */}
        <Box sx={{ 
          height: 140, 
          // Gradiente Rojo -> Ámbar (Tus colores)
          background: 'linear-gradient(135deg, #942323 0%, #c62828 60%, #E5B50D 100%)',
          position: 'relative'
        }} />

        {/* --- 2. IDENTIDAD --- */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: -6, px: 3 }}>
          <Avatar 
            src={photoURL} 
            alt={name}
            sx={{ 
              width: 120, height: 120, 
              border: '4px solid white',
              boxShadow: 3,
              bgcolor: 'grey.300',
              fontSize: '3rem'
            }}
          >
            {name ? name.charAt(0).toUpperCase() : <PersonIcon fontSize="large"/>}
          </Avatar>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold">{name || 'Usuario'}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            <Chip 
              label={roleInfo.label} 
              color={roleInfo.color} 
              size="small" 
              sx={{ mt: 1, fontWeight: 'bold' }} 
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* --- 3. FORMULARIO VERTICAL --- */}
        <Box sx={{ px: { xs: 3, md: 5 }, pb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#555', display: 'flex', alignItems: 'center', gap: 1 }}>
            <BadgeIcon color="action" /> Información Personal
          </Typography>

          <Stack spacing={2.5}> {/* Stack apila todo verticalmente con espacio */}
            
            <TextField
              fullWidth
              label="Nombre Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              label="Correo Electrónico"
              value={user?.email}
              disabled
              variant="filled"
              InputProps={{ 
                startAdornment: <InputAdornment position="start"><EmailIcon color="action"/></InputAdornment>,
                sx: { borderRadius: 2 }
              }}
            />

            <TextField
              fullWidth
              label="Teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+58 412..."
              variant="outlined"
              InputProps={{ 
                startAdornment: <InputAdornment position="start"><PhoneIcon color="action"/></InputAdornment>,
                sx: { borderRadius: 2 } 
              }}
            />

             <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Cargo"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="Ej: Almacenista"
                        InputProps={{ 
                            startAdornment: <InputAdornment position="start"><WorkIcon color="action"/></InputAdornment>,
                            sx: { borderRadius: 2 } 
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Departamento"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Ej: Logística"
                        InputProps={{ 
                            startAdornment: <InputAdornment position="start"><BusinessIcon color="action"/></InputAdornment>,
                            sx: { borderRadius: 2 } 
                        }}
                    />
                </Grid>
             </Grid>

            <TextField
              fullWidth
              label="URL de Foto (Opcional)"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://..."
              variant="outlined"
              InputProps={{
                startAdornment: <InputAdornment position="start"><CameraAltIcon color="action"/></InputAdornment>,
                sx: { borderRadius: 2 }
              }}
            />

            <Button 
              variant="contained" 
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleUpdateProfile}
              disabled={loading}
              sx={{ borderRadius: 2, mt: 1, py: 1.2 }}
              fullWidth
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Stack>

          <Divider sx={{ my: 4 }} />

          {/* --- 4. ZONA DE SEGURIDAD --- */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: '#555' }}>
            Seguridad y Sesión
          </Typography>
          
          <Stack spacing={2}>
             <Button 
              variant="outlined" 
              color="warning" 
              startIcon={<LockResetIcon />}
              onClick={handlePasswordReset}
              sx={{ borderRadius: 2, justifyContent: 'flex-start' }}
            >
              Enviar correo para cambiar contraseña
            </Button>

            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<LogoutIcon />}
              onClick={logout}
              sx={{ borderRadius: 2, justifyContent: 'flex-start' }}
            >
              Cerrar Sesión
            </Button>
          </Stack>

        </Box>
      </Paper>
    </Box>
  );
};

export default ProfilePage;