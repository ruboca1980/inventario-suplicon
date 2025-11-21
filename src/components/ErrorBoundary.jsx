import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que el siguiente renderizado muestre la UI de repuesto.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo: error.toString() });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier UI de repuesto personalizada
      return (
        <Box sx={{ 
          height: '100vh', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          bgcolor: '#fafafa',
          p: 2
        }}>
          <Paper elevation={3} sx={{ 
            p: 5, 
            textAlign: 'center', 
            maxWidth: 600, 
            borderRadius: 4 
          }}>
            <ErrorOutlineIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            
            <Typography variant="h4" gutterBottom fontWeight="bold">
              ¡Ups! Algo salió mal.
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              Ocurrió un error inesperado en la aplicación. No te preocupes, tus datos están seguros.
            </Typography>

            {/* Mostrar detalles técnicos solo en desarrollo (opcional) */}
            {import.meta.env.DEV && this.state.errorInfo && (
               <Box sx={{ 
                 mt: 2, mb: 3, p: 2, 
                 bgcolor: '#ffebee', 
                 color: '#c62828', 
                 borderRadius: 1,
                 textAlign: 'left',
                 fontFamily: 'monospace',
                 fontSize: '0.8rem',
                 overflow: 'auto',
                 maxHeight: '100px'
               }}>
                 {this.state.errorInfo}
               </Box>
            )}

            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              onClick={this.handleReload}
              sx={{ mt: 2 }}
            >
              Recargar la Página
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;