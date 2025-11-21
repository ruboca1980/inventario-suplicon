import React, { createContext, useState, useMemo, useContext } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

export const CustomThemeContext = createContext({
    toggleTheme: () => {},
});

export const useTheme = () => useContext(CustomThemeContext);

export const CustomThemeProvider = ({ children }) => {
    const [mode, setMode] = useState('light');

    const themeMethods = useMemo(() => ({
        toggleTheme: () => {
            setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
        },
    }), []);

    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            ...(mode === 'light'
                ? {
                    // Palette para modo claro
                    primary: { main: '#942323' }, // Color rojo oscuro
                    secondary: { main: '#E5B50D' }, // Color naranja/ámbar
                    background: {
                        // AQUÍ ESTÁ EL CAMBIO
                        default: '#ebebf1ff', // Un gris muy claro y sutil para el fondo de la página
                        paper: '#FFFFFF',   // Los contenedores se mantienen blancos
                    },
                    text: { primary: '#212121' },
                }
                : {
                    // Palette para modo oscuro
                    primary: { main: '#942323' },
                    secondary: { main: '#E5B50D' },
                    background: {
                        default: '#121212',
                        paper: '#1E1E1E',
                    },
                    text: { primary: '#FFFFFF' },
                }),
        },
        typography: {
            fontFamily: '"Montserrat", "Roboto", "Arial", sans-serif',
            h5: { fontWeight: 700 },
        },
    }), [mode]);

    return (
        <CustomThemeContext.Provider value={themeMethods}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </CustomThemeContext.Provider>
    );
};