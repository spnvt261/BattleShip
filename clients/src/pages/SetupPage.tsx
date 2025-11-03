import { AiOutlineDrag } from "react-icons/ai";
import BoardSetup, { type BoardSetupRef } from "../components/gameEntity/BoardSetup"
import { useAppSettings } from "../context/appSetting"
import { FaRotateLeft } from "react-icons/fa6";
import { FaRandom } from "react-icons/fa";
import { useEffect, useMemo, useRef } from "react";
import { useNotification } from "../context/NotifycationContext";
import { useGame } from "../context/GameContext";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import ModalToggle from "../components/modal/ModalToggle";
import ConfirmModal from "../components/modal/ConfirmModal";
import { RxExit } from "react-icons/rx";
const SetupPage = () => {
    const { t, playerId } = useAppSettings();
    const { roomId } = useParams<{ roomId: string }>()
    const { ready, leaveRoom } = useSocket()
    const { player1, player2, setRoomId, room, cleanRoom,game } = useGame();
    const { notify } = useNotification();
    const navigate = useNavigate();
    const boardRef = useRef<BoardSetupRef>(null);
    const handleReady = () => {
        if (!boardRef.current) return;
        console.log("Ships:", boardRef.current?.getShips())
        roomId && ready(roomId, playerId)
    };
    const gridSize = useMemo(() => {
        if (typeof window === "undefined") return 40;
        return window.innerWidth <= 512 ? 30 : 40;
    }, []);
    // const handleShipsChange = (ships: Record<string, { x: number; y: number; isVertical: boolean }>) => {
    //    
    //     // console.log("Ships updated:", ships);
    // };
    
    useEffect(() => {
        if (!roomId) {
            return
        }

        if(game && game.status!=='placing'){
            notify(t('error'), 'error')
            navigate("/")
            return;
        }

        if (!room) setRoomId(roomId)
        if (!player1 && !player2) {

            return
        }
        
        if (playerId !== player1?.id && playerId !== player2?.id) {
            notify(t('error'), 'error')
            navigate("/")
            return;
        }

        if(player1?.isReady && player2?.isReady){
            setTimeout(()=>{
                navigate(`/room/${roomId}/fight`)
            },3500)
        }
    }, [player1,player2,game])

    return (
        <div className="relative flex justify-center items-center px-2 py-10 [@media(max-width:512px)]:flex-col">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-2 mt-4">
                    <ModalToggle
                        btnLabel=""
                        Icon={<RxExit className="text-text" />}
                        formTitle={t("confirm_out")}
                        classNameBtn="bg-transparent border border-gray-700 hover:bg-transparent hover:scale-[1.05] transition-scale duration-200 rotate-180"
                        children={
                            <ConfirmModal onConfirm={() => {
                                roomId && leaveRoom(roomId, playerId)
                                cleanRoom();
                                notify(t("leave"), 'warning')
                                navigate("/")
                            }}
                            />}
                        btnWidth="fit"
                    />
                </div>
                <div className="flex justify-between gap-2 mb-4">
                    <div className="relative px-2 flex items-center justify-center w-1/2 py-5 border-2 border-blue-500 rounded-[0.5rem] overflow-hidden h-8">
                        <span
                            className={`absolute text-blue-500 transition-all duration-500 ease-in-out ${player1?.isReady ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
                        >
                            {player1?.name}
                            {
                                player1?.id === playerId && <span className=" ml-2">({t("you")})</span>
                            }
                        </span>
                        <span
                            className={`absolute transition-all duration-500 ease-in-out ${player1?.isReady
                                ? 'translate-y-0 opacity-100 animate-rainbow'
                                : 'translate-y-full opacity-0'
                                }`}
                        >
                            {t("ready")}
                        </span>

                    </div>
                    <div className="relative px-2 flex items-center justify-center w-1/2 py-5 border-2 border-red-500 rounded-[0.5rem] overflow-hidden h-8">
                        <span
                            className={`absolute text-red-500 transition-all duration-500 ease-in-out ${player2?.isReady ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
                        >
                            {player2?.name}
                            {
                                player2?.id === playerId && <span className="ml-2">({t("you")})</span>
                            }
                        </span>
                        <span
                            className={`absolute transition-all duration-500 ease-in-out ${player2?.isReady
                                ? 'translate-y-0 opacity-100 animate-rainbow'
                                : 'translate-y-full opacity-0'
                                }`}
                        >
                            {t("ready")}
                        </span>
                    </div>
                </div>
                <div className="flex justify-center w-full p-2 border-2 border-border">
                    <p>{t("deployFleet")}</p>
                </div>
                <BoardSetup
                    ref={boardRef}
                    // onSetupChange={handleShipsChange}
                    gridCount={10}
                    className="mt-10"
                    gridSize={gridSize}

                />
                <div className="w-full flex justify-center items-center mt-4">
                    <button
                        onClick={handleReady}
                        className="px-8 py-2 bg-btn-bg2 text-btn-text clip-hexagon hover:bg-gray-100 hover:bg-red-400">
                        {t("ready")}
                    </button>
                </div>
            </div>
            <div className="flex flex-col justify-center gap-4 items-center mt-10 w-[200px] [@media(max-width:512px)]:w-full ">
                <div className="border-2 border-border mx-10 text-text">
                    <div className="w-full flex flex-col justify-center items-center text-text py-8">
                        <p className="w-full text-center px-1 pb-0">{t("dragToMove")}</p>
                        <AiOutlineDrag size={40} />
                    </div>
                    <div className="w-full flex flex-col justify-center items-center text-text py-8">
                        <p className="w-full text-center px-1 pb-0">{t("clickToRotate")}</p>
                        <FaRotateLeft size={40} />
                    </div>
                </div>
                <div className=" flex items-center justify-center mx-10 w-[60px] h-[60px] mt-4 bg-btn-bg2 text-btn-text rounded-full hover:bg-btn-hover">
                    <button onClick={() => {
                        boardRef.current?.randomizeShips()
                    }}>
                        <FaRandom size={30} />
                    </button>
                </div>
            </div>
            {
                player1?.isReady && player2?.isReady &&
                <div className="absolute top-0 left-0 w-full h-full bg-black/30 flex items-center justify-center">
                    <span className="countdown text-white text-8xl font-bold"></span>
                </div>
            }
        </div>
    )
}

export default SetupPage
