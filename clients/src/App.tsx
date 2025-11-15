import { Route, Routes, useNavigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import './App.css'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import CustomButton from "./components/customButton";

const RoomPage = lazy(() => import('./pages/RoomPage'));
const SetupPage = lazy(() => import('./pages/SetupPage'));
const GamePage = lazy(() => import('./pages/GamePage'));
const CheckPage = lazy(() => import("./pages/CheckPage"))
const GamePageSpecial = lazy(() => import("./pages/GamePageSpecial"))

const FallbackLoading = () => {
    const [goHome, setGoHome] = useState<boolean>(false)
    const navigate = useNavigate()
    useEffect(() => {
        const timer = setTimeout(() => {
            setGoHome(true)
        }, 3000)
        return () => {
            clearTimeout(timer)
        }
    }, [])
    return (
        <>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-100">
                <div className="w-12 h-12 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 font-medium">{"Loading..."}</p>
                {
                    // goHome && 
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-full mt-5 transition-all duration-500"
                        style={{
                            opacity:goHome?1:0,
                            marginTop:goHome?'1.5rem':'0'
                        }}  
                    >
                        <CustomButton 
                            label="Go Home Page"
                            onClick={()=>{
                                navigate("/")
                                window.location.reload()
                            }}
                        />
                    </div>
                }
            </div>
        </>

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
                    <Route path='/join/:roomId' element={<CheckPage />} />
                    <Route path='/room/:roomId/setup' element={<SetupPage />} />
                    <Route path='/room/:roomId/fight' element={<GamePage />} />
                    <Route path='/room/:roomId/fight-mode' element={<GamePageSpecial />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </div>
    )
}

export default App;
