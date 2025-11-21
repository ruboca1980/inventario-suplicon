import React from 'react';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { CustomThemeProvider } from './context/ThemeContext';
import { CssBaseline } from '@mui/material';

// --- ¡NUEVA IMPORTACIÓN! ---
import { SnackbarProvider } from 'notistack';
// ---------------------------

function App() {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      <AuthProvider>
        {/* --- ¡ENVOLVEMOS LA APP AQUÍ! --- */}
        <SnackbarProvider 
          maxSnack={3} // Máximo 3 notificaciones a la vez
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // Esquina inferior derecha
          autoHideDuration={3000} // Desaparecen solas a los 3 segundos
        >
          <AppRouter />
        </SnackbarProvider>
        {/* -------------------------------- */}
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;