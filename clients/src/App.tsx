import { Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import './App.css'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'

const RoomPage = lazy(() => import('./pages/RoomPage'));
const SetupPage = lazy(() => import('./pages/SetupPage'));
const GamePage = lazy(() => import('./pages/GamePage'));
const CheckPage = lazy(()=> import("./pages/CheckPage"))

const FallbackLoading = () => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-10 z-100">
            <div className="w-12 h-12 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-medium">{"Loading..."}</p>
        </div>
    )
}

function App() {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    return (
        <div className='min-h-screen w-full text-text px-2'>
            <Suspense fallback={<FallbackLoading />}>
                <Routes>
                    <Route path='/' element={<HomePage />} />
                    <Route path='/room/:roomId' element={<RoomPage />} />
                    <Route path='/:roomId' element={<CheckPage />} />
                    <Route path='/room/:roomId/setup' element={<SetupPage />} />
                    <Route path='/room/:roomId/fight' element={<GamePage />} />
                    {/* <Route path='/fight' element={<GamePage />} /> */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </div>
    )
}

export default App;
