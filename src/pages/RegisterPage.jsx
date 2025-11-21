import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, Paper, TextField, Typography, Container, Link } from '@mui/material';
import logo from '../assets/logo_nuevo-removebg-preview.png';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
    }
    try {
      await signup(email, password, name);
      navigate('/dashboard');
    } catch (error) {
      setError('Error al crear la cuenta. ' + error.message);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
        <Paper elevation={6} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
            <img src={logo} alt="Logo Suplicon C.A." style={{ width: '250px', marginBottom: '16px' }} />
            <Typography component="h1" variant="h5">
                Crear Cuenta
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <TextField margin="normal" required fullWidth id="name" label="Nombre Completo" name="name" autoComplete="name" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
                <TextField margin="normal" required fullWidth id="email" label="Correo Electrónico" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextField margin="normal" required fullWidth name="password" label="Contraseña" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                {error && <Typography color="error" variant="body2" sx={{ mt: 2 }}>{error}</Typography>}
                <Button type="submit" fullWidth variant="contained" color="secondary" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
                    Registrarse
                </Button>
                <Link component={RouterLink} to="/login" variant="body2">
                    {"¿Ya tienes una cuenta? Inicia Sesión"}
                </Link>
            </Box>
        </Paper>
    </Container>
  );
};

export default RegisterPage;