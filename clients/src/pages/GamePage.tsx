import { useEffect, useMemo, useState } from "react";
import BoardBattle from "../components/gameEntity/BoardBattle"
import { useAppSettings } from "../context/appSetting"
import ModalToggle from "../components/modal/ModalToggle";
import { RxExit } from "react-icons/rx";
import ConfirmModal from "../components/modal/ConfirmModal";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useGame } from "../context/GameContext";
import { useNotification } from "../context/NotifycationContext";
import CustomButton from "../components/customButton";
import { useAuth } from "../hooks/useAuth";
import { useGameResource } from "../hooks/useGameResource";
import NotifyModal from "../components/modal/modalMatch/NotifiModal";
import ChatModal from "../components/modal/modalMatch/ChatModal";


interface Props {

}
const GamePage = ({

}: Props) => {
    const { roomId } = useParams<{ roomId: string }>();
    const room = useGameResource(roomId!)
    // console.log('GamePage');
    const { leaveRoom, onGameOver } = useSocket()
    const { notify } = useNotification()
    const navigate = useNavigate();
    const { playerState, game } = useGame()
    const { t, playerId } = useAppSettings()
    const [isMyTurn, setIsMyTurn] = useState<boolean>(game?.turn === playerId ? true : false)
    const [shipSunk, setShipSunk] = useState<number>(0);
    useAuth(room, game, { suppressNavigate: true });
    const gridSize = useMemo(() => {
        if (typeof window === "undefined") return 40;
        return window.innerWidth <= 512 ? 30 : 40;
    }, []);

    useEffect(() => {
        if (!playerState?.sunkEnemyShips) return
        if (playerState?.sunkEnemyShips.length === 0) return
        setShipSunk(prev => prev + 1);
    }, [playerState?.sunkEnemyShips.length])

    useEffect(() => {
        if (!playerState?.ships) return
        if (playerState.ships.every(ship => ship.sunk === false)) return
        setShipSunk(prev => prev + 1);
    }, [JSON.stringify(playerState?.ships)])

    useEffect(() => {
        if (!game || !playerId) return
        const timeout = setTimeout(() => {
            setIsMyTurn(game.turn === playerId)
        }, 1000)
        const unsubscribe = onGameOver((res) => {
            console.log(res);
        })
        return () => {
            unsubscribe?.()
            clearTimeout(timeout)
        }
    }, [game])

    return (
        <div className="w-full min-h-[100dvh] flex flex-col items-center overflow-y-auto">
            <div className="w-full max-w-[700px] flex justify-between items-center mt-8">
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
                                notify(t("leave"), 'warning')
                                navigate("/")

                            }}
                        />}
                />
                <ChatModal 
                    roomId={roomId!}
                    className="mr-2"
                />
            </div>
            <div className={`relative w-full max-w-[750px] min-h-[40px] [@media(max-width:512px)]:flex-col mt-8 transition-all duration-500 `}>
                <div
                    className="absolute w-fit flex flex-col items-center transition-all duration-500"
                    style={
                        gridSize !== 30 ? {
                            top: '0',
                            left: isMyTurn ? 0 : gridSize * 11,
                            transform: `scale(${!isMyTurn ? 0.7 : 1})`,
                            transformOrigin: "top"
                        }
                            : {
                                top: isMyTurn ? 0 : gridSize * 14,
                                left: '50%',
                                transform: `translateX(-50%) scale(${!isMyTurn ? 0.7 : 1})`,
                                transformOrigin: "top"
                            }
                    }
                >
                    <span className={`w-full p-2 text-center border-2 border-btn-bg`} style={!isMyTurn ? { borderColor: 'red' } : {}}>{isMyTurn ? t("your_turn") : t("enemy_fleet")}</span>
                    <BoardBattle
                        key='enemyBoard'
                        roomType={room.type}
                        type={game?.status === 'ended' || !isMyTurn ? "view" : "canShot"}
                        gridSize={gridSize}
                        roomId={roomId ?? ""}
                        shots={playerState?.shotsFired}
                        listShipShow={playerState? playerState.sunkEnemyShips:[]}
                        className={!isMyTurn ? "mt-[40px] [@media(max-width:512px)]:mt-4" : ""}
                        showAxisLabels={isMyTurn}
                        // small={!isMyTurn}
                    />
                </div>
                <div
                    className="absolute w-fit flex flex-col items-center transition-all duration-500"
                    style={
                        gridSize !== 30 ? {
                            top: '0',
                            left: !isMyTurn ? 0 : gridSize * 11,
                            transform: `scale(${isMyTurn ? 0.7 : 1})`,
                            transformOrigin: "top"
                        }
                            : {
                                top: !isMyTurn ? 0 : gridSize * 14,
                                left: '50%',
                                transform: `translateX(-50%) scale(${isMyTurn ? 0.7 : 1})`,
                                transformOrigin: "top"
                            }
                    }
                >
                    <span className="w-full p-2 text-center border-2 border-btn-bg" style={!isMyTurn ? { borderColor: 'red' } : {}}>{isMyTurn ? t("your_fleet") : t("enemy_turn")}</span>
                    <BoardBattle
                        key='myBoard'
                        roomType={room.type}
                        type="view"
                        roomId={roomId}
                        gridSize={gridSize}
                        shots={playerState?.shotsReceived}
                        listShipShow={playerState? playerState.ships:[]}
                        className={isMyTurn ? "mt-[40px] [@media(max-width:512px)]:mt-4" : ""}
                        showAxisLabels={!isMyTurn}
                        // small={isMyTurn}
                    />
                </div>
            </div>
            <NotifyModal key='notify-ship-sunk'
                // color={isMyTurn ? 'blue' : 'red'}
                color={'red'}
                showIf={shipSunk}
                msDelay={0}
                msShow={1900}
                title={t("ship_sunk")}
            />
            <NotifyModal key='notify-turn'
                color={isMyTurn ? 'blue' : 'red'}
                showIf={game?.turn}
                msDelay={1000}
                msShow={2000}
                title={isMyTurn ? t("your_turn") : t("enemy_turn")}
            />

            <NotifyModal key='notify-end-match'
                color={isMyTurn ? 'blue' : 'red'}
                showIf={game && game.winnerId && game.status === "ended" ? true : false}
                msDelay={0}
                msShow={0}
                children={<>
                    <div
                        className="relative bg-panel p-4 rounded-[.75rem] flex flex-col justify-center items-center"
                    >

                        <h2 className="text-3xl font-bold my-8 text-[2rem]"
                            style={{ color: game?.winnerId === playerId ? "var(--color-accent)" : "red" }}
                        >{game?.winnerId === playerId ? t("win").toLocaleUpperCase() : t("loose").toLocaleUpperCase()}
                        </h2>
                        <div className="flex justify-center w-full">
                            <CustomButton
                                label={t("back_to_home")}
                                onClick={() => {
                                    roomId && leaveRoom(roomId, playerId)
                                    navigate("/")
                                }}
                            />
                        </div>

                    </div>
                </>}
            />
        </div>
    )
}

export default GamePage