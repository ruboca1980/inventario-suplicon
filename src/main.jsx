import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'  
import App from './App.jsx'

// --- ¡IMPORTAR EL SALVAVIDAS! ---
import ErrorBoundary from './components/ErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Envolvemos TODO dentro del ErrorBoundary */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)