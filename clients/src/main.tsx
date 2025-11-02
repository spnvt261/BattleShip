// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { store } from './store/index.ts'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { AppSettingsProvider } from './context/appSetting.tsx'
import { NotificationProvider } from './context/NotifycationContext.tsx'

createRoot(document.getElementById('root')!).render(
    // <StrictMode>
    <Provider store={store}>
        <BrowserRouter>
            <AppSettingsProvider >
                <NotificationProvider>
                    <App />
                </NotificationProvider>
            </AppSettingsProvider>
        </BrowserRouter>

    </Provider>

    // </StrictMode>,
)
