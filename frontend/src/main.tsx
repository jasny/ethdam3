import 'primereact/resources/themes/lara-light-cyan/theme.css'   // 👈 Theme
import 'primereact/resources/primereact.min.css'                 // 👈 Core CSS
import 'primeicons/primeicons.css'                               // 👈 Icons
import 'primeflex/primeflex.css'                                 // 👈 Utility CSS (optional)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
