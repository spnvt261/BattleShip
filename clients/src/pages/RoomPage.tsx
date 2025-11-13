import { useEffect, useState } from "react"
import { FiCheck, FiCopy } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom"
import { useAppSettings } from "../context/appSetting";
import { useSocket } from "../hooks/useSocket";
import { useNotification } from "../context/NotifycationContext";
import CustomButton from "../components/customButton";
import { useGame } from "../context/GameContext";
import { IoClose } from "react-icons/io5";
import { useAuth } from "../hooks/useAuth";
import { useGameResource } from "../hooks/useGameResource";
import ChatModal from "../components/modal/modalMatch/ChatModal";
import { useRoomNotify } from "../hooks/useRoomNotify";



const RoomPage = () => {
    const { roomId } = useParams<{ roomId: string }>()
    const room = useGameResource(roomId!);
    const { player1, player2, player3, player4, game } = useGame();
    useAuth(room, game);
    // usePlayerChangeNotify(player1, player2);
    useRoomNotify(room,player1,player2,player3,player4)
    const [copied, setCopied] = useState(false);
    const { leaveRoom, startGame, kickPlayer, onKicked, onGameStart } = useSocket();
    const { t, playerId } = useAppSettings()
    const navigate = useNavigate();
    const { notify } = useNotification();
    const [loading, setLoading] = useState<boolean>(false);

    const handleCopy = () => {
        if (!roomId) return;

        // Tạo URL đầy đủ
        const link = `${window.location.origin}/join/${roomId}`;

        // Modern Clipboard API (Chrome, Edge, Safari mới)
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(link)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch(err => {
                    console.warn("Clipboard write failed:", err);
                    fallbackCopy(link);
                });
        } else {
            // Fallback cho Safari hoặc môi trường không an toàn
            fallbackCopy(link);
        }
    };

    //fallback cho Safari / HTTP
    const fallbackCopy = (text: string) => {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand("copy");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Fallback copy failed", err);
        }
        document.body.removeChild(textarea);
    };

    useEffect(() => {
        if (!roomId) return;
        if (!player1) return;

        const players = [player1, player2, player3, player4];
        if (players.filter(Boolean).length <= room.roomPlayerNumber && players.every(p=>p?.id!==playerId)) {
            navigate(`/join/${roomId}`)
        }

    }, [player1, player2, player3, player4])

    useEffect(() => {
        const unsubscribeKick = onKicked((res) => {
            console.log(res);

            if (res) {
                notify(t(res.message), 'warning')
                navigate("/")
            }
        })
        const unsubstartgame = onGameStart((res) => {
            if (res.game) {
                navigate(`/room/${room.id}/setup`)
            }

        })
        return () => {
            unsubscribeKick?.()
            unsubstartgame?.();
        }
    }, [])

    const handleStartGame = () => {
        setLoading(true)
        if (!player1 || !player2) {
            notify(t("Not enough players"), 'error')
            setLoading(false)
            return;
        }
        startGame(room.id, playerId)
    }

    const handleLeaveRoom = () => {
        leaveRoom(room.id, playerId)
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
                    className="relative bg-panel shadow-[0_15px_40px_rgba(0,0,0,0.6)] p-4"
                    style={{
                        clipPath: "polygon(20px 0%, 100% 0%, 100% 40px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% calc(100% - 20px), 0% 20px)",
                    }}
                >
                    <ChatModal
                        className="absolute top-2 right-3"
                        roomId={roomId!}
                    />


                    <div className="flex flex-col gap-4">
                        <p className="mx-auto w-fit text-text flex items-center gap-3 [@media(max-width:512px)]:flex-col">
                            {t("room_of_player", { player: player1?.name || "" })}
                            <span className="px-2 py-1 font-bold border border-border rounded-[.5rem] flex items-center gap-2">
                                ID: {roomId}
                                <span
                                    onClick={handleCopy}
                                    className="p-1 bg-border border border-border rounded-[.5rem] active:scale-[1.1] transition-all duration-[100]"
                                >
                                    {copied ? <FiCheck className="text-green-500" /> : <FiCopy className="cursor-pointer" />}
                                </span>
                            </span>
                        </p>
                        <div className="grid grid-cols-2 gap-3 min-h-[100px] my-6">
                            <div className="relative min-h-[100px] border rounded-[1rem] overflow-hidden p-3 border-blue-500 flex-1 flex items-center justify-center">
                                <p className="w-fit max-w-[100%] mx-auto break-words overflow-hidden text-center">
                                    {player1 ? `${player1.name}` : <span className="text-blue-500">{t("wating_player")}</span>}
                                </p>
                                {
                                    player1?.id === playerId && <span className="absolute bottom-1 left-1/2 -translate-x-1/2">[ {t("you")} ]</span>
                                }

                            </div>
                            <div className="relative min-h-[100px] border rounded-[1rem] overflow-hidden p-3 border-red-500 flex-1 flex items-center justify-center">
                                <p className="w-fit max-w-[100%] mx-auto break-words overflow-hidden text-center">
                                    {player2 ? player2.name : <span className="text-red-500">{t("wating_player")}</span>}
                                </p>
                                {
                                    player2?.id === playerId && <span className="absolute bottom-1 left-1/2 -translate-x-1/2">[ {t("you")} ]</span>
                                }
                                {
                                    player2 && player1?.id === playerId && <CustomButton
                                        label=""
                                        Icon={<IoClose className="text-text" />}
                                        className="absolute top-1 right-1 bg-transparent shadow-0 border-none border-gray-700 hover:bg-transparent hover:scale-[1.05] transition-scale duration-200"
                                        onClick={() => {
                                            roomId && kickPlayer(roomId, player2.id)
                                        }}
                                    />
                                }
                            </div>
                            {
                                room.roomPlayerNumber > 2 &&
                                <div className="relative min-h-[100px] border rounded-[1rem] overflow-hidden p-3 border-green-500 flex-1 flex items-center justify-center">
                                    <p className="w-fit max-w-[100%] mx-auto break-words overflow-hidden text-center">
                                        {player3 ? player3.name : <span className="text-green-500">{t("wating_player")}</span>}
                                    </p>
                                    {
                                        player3?.id === playerId && <span className="absolute bottom-1 left-1/2 -translate-x-1/2">[ {t("you")} ]</span>
                                    }
                                    {
                                        player3 && player1?.id === playerId && <CustomButton
                                            label=""
                                            Icon={<IoClose className="text-text" />}
                                            className="absolute top-1 right-1 bg-transparent shadow-0 border-none border-gray-700 hover:bg-transparent hover:scale-[1.05] transition-scale duration-200"
                                            onClick={() => {
                                                roomId && kickPlayer(roomId, player3.id)
                                            }}
                                        />
                                    }
                                </div>
                            }
                            {
                                room.roomPlayerNumber === 4 &&
                                <div className="relative min-h-[100px] border rounded-[1rem] overflow-hidden p-3 border-yellow-500 flex-1 flex items-center justify-center">
                                    <p className="w-fit max-w-[100%] mx-auto break-words overflow-hidden text-center">
                                        {player4 ? player4.name : <span className="text-yellow-500">{t("wating_player")}</span>}
                                    </p>
                                    {
                                        player4?.id === playerId && <span className="absolute bottom-1 left-1/2 -translate-x-1/2">[ {t("you")} ]</span>
                                    }
                                    {
                                        player4 && player1?.id === playerId && <CustomButton
                                            label=""
                                            Icon={<IoClose className="text-text" />}
                                            className="absolute top-1 right-1 bg-transparent shadow-0 border-none border-gray-700 hover:bg-transparent hover:scale-[1.05] transition-scale duration-200"
                                            onClick={() => {
                                                roomId && kickPlayer(roomId, player4.id)
                                            }}
                                        />
                                    }
                                </div>
                            }
                        </div>
                        <div className="flex gap-4 justify-end">
                            <CustomButton
                                label={t("exit")}
                                className="bg-red-400 hover:bg-red-500"
                                onClick={() => handleLeaveRoom()}
                                disabled={loading}
                            />
                            {
                                // player1?.id === playerId &&
                                <CustomButton
                                    label={loading ? t("starting") : playerId === player1?.id ? t("start") : t("wait_start")}
                                    className=""
                                    onClick={() => handleStartGame()}
                                    disabled={loading || playerId !== player1?.id || [player1, player2, player3, player4].filter(Boolean).length!==room.roomPlayerNumber }
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