import { useEffect, useMemo, useRef, useState } from "react";
import BoardBattle from "../components/gameEntity/BoardBattle"
import { useAppSettings } from "../context/appSetting"
import ModalToggle from "../components/modal/ModalToggle";
import { RxExit } from "react-icons/rx";
import ConfirmModal from "../components/modal/ConfirmModal";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useGame } from "../context/GameContext";
import { useNotification } from "../context/NotifycationContext";
import { AnimatePresence, motion } from "framer-motion";
import CustomButton from "../components/customButton";
import { useAuth } from "../hooks/useAuth";


interface Props {

}
const GamePage = ({

}: Props) => {
    const { roomId } = useParams<{ roomId: string }>();
    const { leaveRoom, onGameOver } = useSocket()
    const { notify } = useNotification()
    const navigate = useNavigate();
    const { cleanRoom, setRoomId, room, playerState, game } = useGame()
    const { t, playerId } = useAppSettings()
    const [isMyTurn, setIsMyTurn] = useState<boolean | undefined>(undefined)
    const [showTurnNotice, setShowTurnNotice] = useState(false);
    // const [winnerId, setWinnerId] = useState<string | undefined>(undefined);
    const [shipSunk, setShipSunk] = useState<number>(0);
    const [shipSunkNotice, setShipSunkNotice] = useState<boolean | undefined>(undefined);
    const isFirstRender = useRef(true);
    const isFirstTurnRender = useRef(true);
    useAuth(room, game, { suppressNavigate: true });
    const gridSize = useMemo(() => {
        if (typeof window === "undefined") return 40;
        return window.innerWidth <= 512 ? 30 : 40;
    }, []);

    useEffect(() => {
        if (!roomId) {
            return
        }
        if (!room) setRoomId(roomId)
    }, [roomId])

    useEffect(() => {
        if (!game || !playerId) return;
        setShowTurnNotice(true);
        setIsMyTurn(game.turn === playerId ? true : false)
        const timer = setTimeout(() => {
            setShowTurnNotice(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, [isMyTurn]);

    useEffect(() => {
        if (!game || !playerId || !playerState || shipSunk === 0) return;
        // console.log(shipSunk);
        if (isFirstRender.current) {
            // Bỏ qua lần render đầu tiên
            isFirstRender.current = false;
            return;
        }

        setShipSunkNotice(true);
        const timer = setTimeout(() => {
            setShipSunkNotice(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, [shipSunk]);

    useEffect(() => {
        if (!playerState?.sunkEnemyShips || !playerState.ships) return

        setShipSunk(shipSunk + 1);
    }, [playerState?.sunkEnemyShips.length, JSON.stringify(playerState?.ships)])

    useEffect(() => {
        if (!game || !playerId) return
        if (isFirstTurnRender.current) {
            setIsMyTurn(game.turn === playerId);
            isFirstTurnRender.current = false;
            return;
        } else {
            setTimeout(() => {
                setIsMyTurn(game.turn === playerId)
            }, 1000)
        }

        const unsubscribe = onGameOver((res) => {
            // if (res.winnerId) setWinnerId(res.winnerId)
            console.log(res);
        })
        return () => {
            unsubscribe?.()
        }
    }, [game])
    return (
        <div className="w-full min-h-[100dvh] flex flex-col items-center overflow-y-auto">
            <div className="w-full max-w-[700px] flex justify-between mt-8">
                <ModalToggle
                    btnLabel=""
                    formTitle={t("confirm_out")}
                    btnWidth="fit"
                    classNameBtn="ml-2 bg-transparent border border-gray-700 hover:bg-transparent hover:scale-[1.05] transition-all duration-200 rotate-180"
                    Icon={<RxExit className="text-text" />}
                    children={
                        <ConfirmModal
                            onConfirm={() => {
                                roomId && leaveRoom(roomId, playerId)
                                cleanRoom();
                                notify(t("leave"), 'warning')
                                navigate("/")

                            }}
                        />}
                />
                <button
                    onClick={() => setIsMyTurn(!isMyTurn)}
                >

                </button>
            </div>
            <AnimatePresence mode="wait">
                {
                    isMyTurn ?
                        <motion.div
                            key="myTurn"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5 }}
                            className="flex gap-10 [@media(max-width:512px)]:flex-col mt-8"
                        >
                            <div className="w-fit flex flex-col  justify-center items-center">
                                <span className={`w-full p-2 text-center border-2 border-btn-bg`}>{t("your_turn")}</span>
                                <BoardBattle
                                    key='enemyBoard'
                                    type= {game?.status==='ended'?"view":"canShot"}
                                    gridSize={gridSize}
                                    roomId={roomId ?? ""}
                                    shotsFired={playerState?.shotsFired}
                                    listShipShow={playerState?.sunkEnemyShips}
                                    showAxisLabels
                                />
                            </div>

                            <div className="flex flex-col items-center mb-8">
                                <span className="w-full p-2 text-center border-2 border-btn-bg">{t("your_fleet")}</span>
                                <BoardBattle
                                    key='myBoard'
                                    type="view"
                                    className="mt-[40px] [@media(max-width:512px)]:mt-4"
                                    roomId={roomId}
                                    shotsRecevied={playerState?.shotsReceived}
                                    listShipShow={playerState?.ships}
                                    small
                                />
                            </div>
                        </motion.div> :
                        <motion.div
                            key="enemyTurn"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.5 }}
                            className="flex gap-10 [@media(max-width:512px)]:flex-col mt-8"
                        >
                            <div className="w-fit flex flex-col  justify-center items-center">
                                <span className="w-full p-2 text-center border-2 border-red-500">{t("enemy_turn")}</span>
                                <BoardBattle
                                    key='myBoard2'
                                    type="view"
                                    gridSize={gridSize}
                                    roomId={roomId ?? ""}
                                    shotsFired={playerState?.shotsReceived}
                                    listShipShow={playerState?.ships}
                                    showAxisLabels
                                />
                            </div>

                            <div className="flex flex-col items-center mb-8">
                                <span className="w-full p-2 text-center border-2 border-red-500">{t("enemy_fleet")}</span>
                                <BoardBattle
                                    key='enemyBoard2'
                                    type="view"
                                    className="mt-[40px] [@media(max-width:512px)]:mt-4"
                                    roomId={roomId}
                                    shotsRecevied={playerState?.shotsFired}
                                    listShipShow={playerState?.sunkEnemyShips}
                                    small
                                />
                            </div>
                        </motion.div>
                }
            </AnimatePresence>

            <AnimatePresence>
                {showTurnNotice && (
                    <>
                        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            initial={{ opacity: 0, scale: 1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="relative w-[90%] max-w-md">
                                <div
                                    className="absolute -inset-[2px] bg-transparent pointer-events-none"
                                    style={{
                                        clipPath: "polygon(21px 0%, 100% 0%, 100% 42.8px, 100% calc(100% - 21px), calc(100% - 21px) 100%, 0% 100%, 0% calc(100% - 21px), 0% 21px)",
                                        background: isMyTurn ? 'var(--color-accent)' : 'red',
                                    }}
                                />

                                <div
                                    className={`relative shadow-[0_15px_40px_rgba(0,0,0,0.6)] p-6 bg-panel`}
                                    style={{
                                        clipPath: "polygon(20px 0%, 100% 0%, 100% 40px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% calc(100% - 20px), 0% 20px)",
                                    }}
                                >
                                    {/* <button
                                            onClick={() => setShowTurnNotice(false)}
                                            className="absolute top-3 right-3 text-text rounded-[.75rem] p-1 hover:bg-btn-hover z-10"
                                        >
                                            <AiOutlineClose size={24} />
                                        </button> */}


                                    <h2 className="text-xl font-bold mb-4 pr-8">{isMyTurn ? t("your_turn") : t("enemy_turn")}</h2>

                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {shipSunkNotice === true && (
                    <>
                        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            initial={{ opacity: 0, scale: 1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="relative w-[90%] max-w-md">
                                <div
                                    className="absolute -inset-[2px] bg-transparent pointer-events-none"
                                    style={{
                                        clipPath: "polygon(21px 0%, 100% 0%, 100% 42.8px, 100% calc(100% - 21px), calc(100% - 21px) 100%, 0% 100%, 0% calc(100% - 21px), 0% 21px)",
                                        background: 'red',
                                    }}
                                />

                                <div
                                    className={`relative shadow-[0_15px_40px_rgba(0,0,0,0.6)] p-6 bg-panel`}
                                    style={{
                                        clipPath: "polygon(20px 0%, 100% 0%, 100% 40px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% calc(100% - 20px), 0% 20px)",
                                    }}
                                >
                                    <h2 className="text-xl font-bold mb-4 pr-8">{t("ship_sunk")}</h2>

                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {
                    game && game.winnerId && game.status==="ended" &&
                    (
                        <>
                            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                                initial={{ opacity: 0, scale: 1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="relative w-[90%] max-w-md">
                                    <div
                                        className="absolute p-[.25rem] -inset-[3px] bg-transparent pointer-events-none rounded-[1rem] "
                                        style={{
                                            // clipPath: "polygon(21px 0%, 100% 0%, 100% 42.8px, 100% calc(100% - 21px), calc(100% - 21px) 100%, 0% 100%, 0% calc(100% - 21px), 0% 21px)",
                                            background: game.winnerId === playerId ? "var(--color-accent)" : "var(--color-ship-sunk)",
                                        }}
                                    />

                                    <div
                                        className="relative bg-panel p-4 rounded-[.75rem] flex flex-col justify-center items-center"
                                    // style={{
                                    //     clipPath: "polygon(20px 0%, 100% 0%, 100% 40px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% calc(100% - 20px), 0% 20px)",
                                    // }}
                                    >

                                        <h2 className="text-3xl font-bold my-8 text-[2rem]"
                                            style={{ color: game.winnerId === playerId ? "var(--color-accent)" : "red" }}
                                        >{game.winnerId === playerId ? t("win").toLocaleUpperCase() : t("loose").toLocaleUpperCase()}
                                        </h2>
                                        <div className="flex justify-center w-full">
                                            <CustomButton
                                                label={t("back_to_home")}
                                                onClick={() => {
                                                    roomId&& leaveRoom(roomId,playerId)
                                                    cleanRoom()
                                                    navigate("/")
                                                }}
                                            />
                                        </div>

                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
            </AnimatePresence>

        </div>
    )
}

export default GamePage