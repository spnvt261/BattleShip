import { useState } from "react"
import { useAppSettings } from "../../context/appSetting"
import CustomButton from "../customButton"
import CustomKeyField6 from "../CustomKeyField"
import { useSocket } from "../../hooks/useSocket"
import { useNotification } from "../../context/NotifycationContext"
import { useNavigate } from "react-router-dom"
import { FiClipboard } from "react-icons/fi"
import { useGame } from "../../context/GameContext"

interface Props {

}
const JoinRoomModal = ({ }: Props) => {
    const { t, playerName, playerId } = useAppSettings()
    const [roomId, setRoomId] = useState<string | undefined>(undefined);
    const { notify } = useNotification();
    const {setRoomId:setRoomIdProvider} = useGame()
    const { joinRoom } = useSocket();
    const [loading,setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const handleJoinRoom = () => {
        if (!roomId || roomId?.length < 6) {
            return
        }
        setLoading(true);
        notify(t("loading_join"),'loading')
        joinRoom(roomId, playerName, playerId, (res) => {
            if (!res.ok) {
                notify(t(`${res.error}`), 'error')
                setLoading(false)
                return
            }
            setRoomIdProvider(roomId);
            navigate(`/room/${roomId}`);
            notify(t("success"),'success')
        })  
    }
    return (
        <div>
            <div className="flex items-center justify-center">
                <CustomKeyField6
                    value={roomId}
                    onChange={(e) => { setRoomId(e.target.value) }}
                />
                <span
                    className="cursor-pointer p-2 border rounded-[.5rem] bg-transparent hover:bg-gray-500"
                    onClick={async () => {
                        try {
                            const text = await navigator.clipboard.readText();
                            if (/^\d{6}$/.test(text)) {
                                setRoomId(text);
                            }
                        } catch (err) {
                            console.error("Failed to read clipboard", err);
                        }
                    }}
                >
                    <FiClipboard className="text-text w-5 h-5" />
                </span>
            </div>


            <div className="flex justify-end">
                <CustomButton
                    label={t("confirm")}
                    className="mt-6"
                    onClick={() => handleJoinRoom()}
                    disabled={loading|| !roomId || roomId?.length < 6}
                />
            </div>
        </div>
    )
}

export default JoinRoomModal
