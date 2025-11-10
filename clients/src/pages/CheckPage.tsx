import { useNavigate, useParams } from "react-router-dom"
import { useGame } from "../context/GameContext"
import { useAppSettings } from "../context/appSetting"
import { useEffect } from "react"
import { useNotification } from "../context/NotifycationContext"
import { useSocket } from "../hooks/useSocket"
import { useGameResource } from "../hooks/useGameResource"

const CheckPage = () => {
    // console.log('CheckPage');
    const { roomId } = useParams<{ roomId: string }>()
    const room = useGameResource(roomId!);
    const { playerId, t, playerName } = useAppSettings();
    const { player1, player2 } = useGame()
    const { joinRoom } = useSocket()
    const { notify } = useNotification();
    const navigate = useNavigate()
    useEffect(() => {
        if (!room) return
        if (player1 && player2) {
            if (player1.id !== playerId && player2.id !== playerId) {
                notify(t(`Room is full`), 'warning')
                navigate("/")
                return;
            }
            if(player1.id === playerId || player2.id === playerId){
                navigate(`/room/${roomId}`)
            }
        } else {
            joinRoom(room.id, playerName, playerId, (res) => {
                if (res.ok) {
                    navigate(`/room/${roomId}`)
                }
            })
        }
    }, [player1, player2])
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-10 z-100">
            <div className="w-12 h-12 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-medium">{"Loading..."}</p>
        </div>
    )
}

export default CheckPage