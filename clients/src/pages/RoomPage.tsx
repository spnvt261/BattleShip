import { useEffect, useState } from "react"
import { FiCheck, FiCopy } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom"
import { useAppSettings } from "../context/appSetting";
import { useSocket } from "../hooks/useSocket";
import { useNotification } from "../context/NotifycationContext";
import CustomButton from "../components/customButton";
import { usePlayerChangeNotify } from "../hooks/usePlayerChangeNotify";
import { useGame } from "../context/GameContext";



const RoomPage = () => {
    const { room, player1, player2, setRoomId, cleanRoom, game } = useGame();
    const { roomId } = useParams<{ roomId: string }>()
    usePlayerChangeNotify(player1, player2);
    const [copied, setCopied] = useState(false);
    const { leaveRoom, joinRoom, startGame } = useSocket();
    const { t, playerId, playerName } = useAppSettings()
    const navigate = useNavigate();
    const { notify } = useNotification();
    const [loading, setLoading] = useState<boolean>(false);
    
    const handleCopy = () => {
        if (roomId) navigator.clipboard.writeText(roomId).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // 3s trở về icon copy
        });
    };


    useEffect(() => {
        if (!roomId) {
            return
        }
        if (!room) setRoomId(roomId)



    }, [roomId])

    useEffect(() => {
        if (!roomId) return
        if (game) {
            if (game.status == 'placing') {
                navigate(`/room/${roomId}/setup`)
            }
        }
    }, [game])

    useEffect(() => {
        if (!roomId || (!player1 && !player2)) return;
        const currentPlayerInRoom = playerId === player1?.id || player2?.id === playerId;

        if (!currentPlayerInRoom) {
            if (!player1 || !player2) {
                joinRoom(roomId, playerName, playerId, (res) => {
                    if(res.ok){

                    }

                });
            } else {
                // Room full và người này không có trong room → notify
                notify(t("Room is full"), "warning");
                navigate("/");
            }
        }

    }, [player1])

    const handleStartGame = () => {
        setLoading(true)
        if (!player1 || !player2) {
            notify(t("Not enough players"), 'error')
            setLoading(false)
            return;
        }
        roomId && playerId && startGame(roomId, playerId, (res) => {
            // console.log(res);
            if (res.error) {
                
            } else if (res.ok) {

            }
        })
    }

    const handleLeaveRoom = () => {
        roomId && leaveRoom(roomId, playerId)
        cleanRoom();
        notify(t("leave"), 'warning')
        navigate("/")
    }

    return (
        <div className="w-full min-h-[100vh] flex justify-center items-center">
            <div className="relative w-[95%] max-w-[600px]">
                <div
                    className="absolute -inset-[2px] bg-transparent pointer-events-none"
                    style={{
                        clipPath: "polygon(21px 0%, 100% 0%, 100% 42.8px, 100% calc(100% - 21px), calc(100% - 21px) 100%, 0% 100%, 0% calc(100% - 21px), 0% 21px)",
                        background: "var(--color-border)",
                    }}
                />

                <div
                    className="relative bg-panel shadow-[0_15px_40px_rgba(0,0,0,0.6)] p-6"
                    style={{
                        clipPath: "polygon(20px 0%, 100% 0%, 100% 40px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% calc(100% - 20px), 0% 20px)",
                    }}
                >
                    <div className="flex flex-col gap-4">
                        <p className="mx-auto w-fit text-text flex items-center gap-3">
                            {t("room_of_player", { player: player1?.name || "" })}
                            <span className="px-2 py-1 font-bold border border-border rounded-[.5rem] flex items-center gap-2">
                                ID: {roomId}
                                <span
                                    onClick={handleCopy}
                                    className="p-1 bg-border border border-border rounded-[.5rem]"
                                >
                                    {copied ? <FiCheck className="text-green-500" /> : <FiCopy className="cursor-pointer" />}
                                </span>
                            </span>
                        </p>
                        <div className="flex gap-3 items-stretch min-h-[100px] my-6">
                            <div className="relative max-w-[50%] border rounded-[1rem] p-3 border-blue-500 flex-1 flex items-center justify-center">
                                <p className="w-fit max-w-[100%] mx-auto break-words overflow-hidden text-center">
                                    {player1 ? `${player1.name}` : <span className="text-blue-500">{t("wating_player")}</span>}
                                </p>
                                {
                                    player1?.id === playerId && <span className="absolute bottom-1 left-1/2 -translate-x-1/2">[ {t("you")} ]</span>
                                }

                            </div>
                            <div className="relative max-w-[50%] border rounded-[1rem] p-3 border-red-500 flex-1 flex items-center justify-center">
                                <p className="w-fit max-w-[100%] mx-auto break-words overflow-hidden text-center">
                                    {player2 ? player2.name : <span className="text-red-500">{t("wating_player")}</span>}
                                </p>
                                {
                                    player2?.id === playerId && <span className="absolute bottom-1 left-1/2 -translate-x-1/2">[ {t("you")} ]</span>
                                }
                            </div>
                        </div>
                        <div className="flex gap-4 justify-end">
                            <CustomButton
                                label="Rời phòng"
                                className="bg-red-400 hover:bg-red-500"
                                onClick={() => handleLeaveRoom()}
                                disabled={loading}
                            />
                            {
                                player1?.id === playerId &&
                                <CustomButton
                                    label="Bắt đầu"
                                    className=""
                                    onClick={() => handleStartGame()}
                                    disabled={loading || !player1 || !player2}
                                />
                            }

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoomPage