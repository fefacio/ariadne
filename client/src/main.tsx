import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import './index.css'
import App from './App.tsx'
import { SessionProvider } from './context/session/SessionProvider.tsx';
import { UIStateProvider } from './context/uiState/UIStateProvider.tsx';
import { GlobalConfigProvider } from './context/globalConfig/GlobalConfigProvider.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SessionProvider>
            <GlobalConfigProvider>
                <UIStateProvider>
                    <App/>
                </UIStateProvider>
            </GlobalConfigProvider>
        </SessionProvider>
    </StrictMode>,
)
