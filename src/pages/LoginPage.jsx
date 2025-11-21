import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Box, Button, Paper, TextField, Typography, Link, CircularProgress, 
  IconButton, InputAdornment 
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import logo from '../assets/logo_nuevo-removebg-preview.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, user, loading } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (error) {
      console.error(error);
      setError('Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  if (loading) {
      return (
          <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress />
          </Box>
      );
  }

  return (
    // La tarjeta de login flotante, ya no hay Container envolviendo
    <Paper 
      elevation={10} // Sombra fuerte para resaltar sobre el fondo de color
      sx={{ 
        p: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        borderRadius: 3,
        backgroundColor: '#fff' // Fondo blanco puro y limpio
      }}
    >
      <img src={logo} alt="Logo Suplicon C.A." style={{ width: '220px', marginBottom: '20px' }} />
      
      <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
        Bienvenido
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
        <TextField 
          margin="normal" required fullWidth 
          id="email" label="Correo Electrónico" name="email" 
          autoComplete="email" autoFocus 
          value={email} onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
        />
        
        <TextField 
          margin="normal" required fullWidth 
          name="password" label="Contraseña" 
          type={showPassword ? 'text' : 'password'} 
          id="password" autoComplete="current-password" 
          value={password} onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          InputProps={{ 
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {error && <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: 'center' }}>{error}</Typography>}
        
        <Button 
          type="submit" 
          fullWidth 
          variant="contained" 
          color="secondary" 
          size="large"
          sx={{ mt: 4, mb: 2, py: 1.5, fontWeight: 'bold' }} 
        >
          Ingresar
        </Button>
        
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Link 
            component={RouterLink} 
            to="/register" 
            variant="body2" 
            sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 'medium' }}
          >
            ¿No tienes una cuenta? <span style={{ fontWeight: 'bold' }}>Regístrate</span>
          </Link>
        </Box>
      </Box>
    </Paper>
  );
};

export default LoginPage;