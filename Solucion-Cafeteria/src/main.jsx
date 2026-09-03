import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './Styles/Variables.css'   // ← Tokens de identidad Gaia Dynamics
import './Styles/Global.css'      // ← Reset + estilos base
import './Styles/Components.css'  // ← Clases utilitarias
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
