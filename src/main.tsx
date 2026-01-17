import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import { ThemeProvider } from './context/ThemeContext'
import './styles/globals.css'

import { AuthProvider } from './context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
