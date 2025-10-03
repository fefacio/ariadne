import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import './index.css'
import App from './App.tsx'
import { SessionProvider } from './context/session/SessionProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <App/>
    </SessionProvider>
  </StrictMode>,
)
