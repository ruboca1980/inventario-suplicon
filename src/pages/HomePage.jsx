import React from 'react';
import { Link } from 'react-router-dom'; // Para navegar a otras páginas

const HomePage = () => {
  return (
    <div>
      <h1>Página de Inicio</h1>
      <p>Bienvenido al Sistema de Gestión de Inventario.</p>
      <nav>
        <Link to="/login">Iniciar Sesión</Link> | <Link to="/register">Registrarse</Link>
      </nav>
    </div>
  );
};

export default HomePage; 