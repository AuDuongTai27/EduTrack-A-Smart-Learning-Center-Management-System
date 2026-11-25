import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { installAuthFetchInterceptor } from './api/authApi'
import App from './App.tsx'
import './assets/css/brand-system.css'
import './assets/css/modal-system.css'

installAuthFetchInterceptor()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
