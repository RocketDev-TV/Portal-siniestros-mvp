/**
 * Portal de Siniestros MVP — Punto de entrada del cliente
 * ---------------------------------------------------------------
 * Autor:      Ignacio Ivan Herrera Gomez
 * Copyright:  © 2026 Ignacio Ivan Herrera Gomez. Todos los derechos reservados.
 * Licencia:   Software propietario. Queda prohibida la reproducción,
 *             distribución, comunicación pública o modificación total o
 *             parcial de este código sin autorización previa y por
 *             escrito del autor.
 * ---------------------------------------------------------------
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
