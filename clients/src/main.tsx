// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AppSettingsProvider } from './context/appSetting.tsx'
import { NotificationProvider } from './context/NotifycationContext.tsx'
import { GameProvider } from './context/GameContext.tsx'

createRoot(document.getElementById('root')!).render(
    // <StrictMode>
    <BrowserRouter>
        <NotificationProvider>

            <AppSettingsProvider >
                <GameProvider>
                    <App />
                </GameProvider>
            </AppSettingsProvider>

        </NotificationProvider>
    </BrowserRouter>

    // </StrictMode>,
)
