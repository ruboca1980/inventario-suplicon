import { createTheme } from '@mui/material/styles';

// Creamos nuestro tema personalizado
const theme = createTheme({
    // La paleta de colores define los colores principales de la app
    palette: {
        mode: 'dark', // Usaremos un modo oscuro que combina bien con el logo
        primary: {
            main: '#942323', // El rojo oscuro del logo para elementos principales
        },
        secondary: {
            main: '#E5B50D', // El amarillo/dorado para elementos secundarios o resaltados
        },
        background: {
            default: '#121212', // Un fondo oscuro casi negro
            paper: '#1E1E1E',   // Un gris oscuro para superficies como tablas y modales
        },
        text: {
            primary: '#FFFFFF', // Texto principal blanco
            secondary: '#B3B3B3', // Texto secundario gris claro
        },
    },
    // También podemos personalizar la tipografía si quisiéramos
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
        h4: {
            fontWeight: 600, // Títulos un poco más audaces
        },
    },
});

export default theme;