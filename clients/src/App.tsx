import { Route, Routes } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import NotFoundPage from './pages/NotFoundPage'
import SetupPage from './pages/SetupPage'

function App() {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    return (

        <div className='min-h-screen w-full bg-bg text-text px-2'>
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/setup' element={<SetupPage />} />
                <Route path='/room' element={<GamePage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </div>


    )
}

export default App
