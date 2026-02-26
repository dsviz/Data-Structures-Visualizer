import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './app/App'
import { ThemeProvider } from './context/ThemeContext'
import './styles/globals.css'

import { AuthProvider } from './context/AuthContext'
import { HeaderProvider } from './context/HeaderContext.tsx'
import { LayoutProvider } from './context/LayoutContext.tsx'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <HeaderProvider>
            <LayoutProvider>
              <App />
            </LayoutProvider>
          </HeaderProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
