import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

// Register PWA service worker with auto-update
registerSW({
  onNeedRefresh() {
    // Could show a toast: "New version available. Refresh to update."
    console.log('[ZenFlow] New version available');
  },
  onOfflineReady() {
    console.log('[ZenFlow] App ready to work offline');
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
