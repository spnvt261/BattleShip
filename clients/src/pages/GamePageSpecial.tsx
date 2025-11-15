import { useNavigate, useParams } from "react-router-dom"
import NotifyModal from "../components/modal/modalMatch/NotifiModal"
import ModalToggle from "../components/modal/ModalToggle"
import { useAppSettings } from "../context/appSetting"
import { useGameResource } from "../hooks/useGameResource"
import { useGame } from "../context/GameContext"
import { useAuth } from "../hooks/useAuth"
import { useNotification } from "../context/NotifycationContext"
import { useSocket } from "../hooks/useSocket"
import { useEffect, useMemo, useRef, useState } from "react"
import ConfirmModal from "../components/modal/ConfirmModal"
import { RxExit } from "react-icons/rx"
import ChatModal from "../components/modal/modalMatch/ChatModal"
import BoardBattle from "../components/gameEntity/BoardBattle"
import CustomButton from "../components/customButton"
import { CustomSelectTab } from "../components/CustomSelectTab"
import type { Player, PlayerState, Ship } from "../types/game"

const GamePageSpecial = () => {
    const { roomId } = useParams<{ roomId: string }>()
    const room = useGameResource(roomId!)
    const { notify } = useNotification()
    const navigate = useNavigate();
    const { leaveRoom, onGameOver } = useSocket()
    const { t, playerId, playerName } = useAppSettings()
    const { playerState, game, player1, player2, player3, player4 } = useGame()
    useAuth(room, game, { suppressNavigate: true });
    const [shipSunk, setShipSunk] = useState<Ship | undefined>(() => playerState?.sunkEnemyShips[playerState.sunkEnemyShips.length - 1]);
    const [playerDie, setPlayerDie] = useState<PlayerState | undefined>(undefined)
    const [playerTurn, setPlayerTurn] = useState<Player | null>(() => {
        switch (game?.turn) {
            case player1?.id: return player1
            case player2?.id: return player2
            case player3?.id: return player3
            case player4?.id: return player4
            default: return null
        }
    })
    const gridSize = useMemo(() => {
        if (typeof window === "undefined") return 40;
        return window.innerWidth <= 512 ? 30 : 40;
    }, []);
    const players = [player1, player2, player3, player4].filter(Boolean)
    const isFirstRender = useRef<boolean>(true)
    useEffect(() => {
        if (!game) return
        const playersDied = game?.players.filter(p => p.isDie)
        if (playersDied.length === 0) return
        setPlayerDie(playersDied[playersDied.length - 1])
    }, [game?.players.filter(p => p.isDie).length])
    useEffect(() => {
        if (!playerState?.sunkEnemyShips) return
        if (playerState?.sunkEnemyShips.length === 0) return
        if (isFirstRender.current) return
        setShipSunk(() => playerState?.sunkEnemyShips[playerState.sunkEnemyShips.length - 1]);
    }, [playerState?.sunkEnemyShips.length])

    useEffect(() => {
        if (!playerState?.ships) return;

        const sunkShips = playerState.ships.filter(s => s.sunk);
        if (sunkShips.length === 0) return;
        // Lấy ship mới nhất bị sunk
        if (isFirstRender.current) return
        setShipSunk(sunkShips[sunkShips.length - 1]);
    }, [playerState?.ships.filter(s => s.sunk).length])
    useEffect(() => {
        isFirstRender.current = false
    }, [])
    useEffect(() => {
        if (!game || !playerId) return
        const timeout = setTimeout(() => {
            setPlayerTurn(() => players.find(p => p?.id === game.turn)!)
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
            <div className="w-full max-w-[700px] flex gap-4 justify-between items-center mt-8">
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
                <div className={`relative px-2 mx-4 flex-1 flex items-center justify-center py-5 border-2 rounded-[0.5rem] overflow-hidden h-8
                        ${game?.turn === player1?.id ? "border-blue-500" : ""}
                        ${game?.turn === player2?.id ? "border-red-500" : ""}
                        ${game?.turn === player3?.id ? "border-green-500" : ""}
                        ${game?.turn === player4?.id ? "border-yellow-500" : ""}
                    `}>
                    <span
                        className={`absolute flex transition-all duration-500 ease-in-out w-full flex items-center justify-center
                            ${game?.turn === player1?.id ? "text-blue-500" : ""}
                            ${game?.turn === player2?.id ? "text-red-500" : ""}
                            ${game?.turn === player3?.id ? "text-green-500" : ""}
                            ${game?.turn === player4?.id ? "text-yellow-500" : ""}
                        `}
                    >
                        <span key={playerTurn?.id} className="block truncate fade-slide-enter fade-slide-enter-active"
                            style={{ maxWidth: playerTurn?.id === playerId ? '80%' : '90%' }}
                        >
                            {playerTurn?.id === playerId ? t("your_turn") : t("player_turn", { player: playerTurn?.name! })}
                        </span>
                    </span>
                </div>
                <ChatModal
                    roomId={roomId!}
                    className="mr-2"
                />
            </div>
            <div className={`relative flex justify-center items-center w-full max-w-[750px] min-h-[40px] [@media(max-width:512px)]:flex-col mt-8 transition-all duration-500 `}>
                <BoardBattle
                    key='board'
                    type={playerTurn?.id === playerId ? "canShot" : "view"}
                    roomId={roomId!}
                    gridSize={gridSize}
                    gridCount={room.boardSize}
                    shots={playerState?.shotsReceived}
                    listShipShow={playerState ? [...playerState.ships, ...playerState.sunkEnemyShips] : []}
                    showAxisLabels
                    players={players}
                />
            </div>
            <div className="w-full max-w-[700px]">
                <CustomSelectTab
                    label={""}
                    options={players.map(p => {
                        // if(p?.id===playerId) return p.name+t("you")
                        if (p) return p.id
                        return ""
                    })}
                    value={playerTurn?.id ?? ""}
                    renderLabel={(val) => {
                        switch (val) {
                            case playerId: return playerName + " (" + t("you") + ")"
                            case player1?.id: return player1?.name;
                            case player2?.id: return player2?.name;
                            case player3?.id: return player3?.name;
                            case player4?.id: return player4?.name;
                        }
                    }}
                    isDisabled={(val) => {
                        const p = game?.players.find(p=>p.playerId===val);
                        return p?.isDie?true:false;
                    }}
                    renderClassLabel={(val) => {
                        switch (val) {
                            case player1?.id: return "text-blue-500";
                            case player2?.id: return "text-red-500"
                            case player3?.id: return "text-green-500"
                            case player4?.id: return "text-yellow-500"
                        }
                    }}
                    className="w-full my-8"
                />
            </div>

            <NotifyModal key='notify-ship-sunk'
                // color={isMyTurn ? 'blue' : 'red'}
                color={
                    shipSunk && shipSunk.playerId === player1?.id ? "blue" :
                        shipSunk && shipSunk.playerId === player2?.id ? "red" :
                            shipSunk && shipSunk.playerId === player3?.id ? "green" :
                                shipSunk && shipSunk.playerId === player4?.id ? "yellow" :
                                    !shipSunk && playerId === player1?.id ? "blue" :
                                        !shipSunk && playerId === player2?.id ? "red" :
                                            !shipSunk && playerId === player3?.id ? "green" :
                                                !shipSunk && playerId === player4?.id ? "yellow" : "blue"
                }
                showIf={shipSunk}
                msDelay={0}
                msShow={1900}
                title={t("ship_sunk_player", {
                    player: shipSunk && shipSunk.playerId === player1?.id ? player1?.name || "" :
                        shipSunk && shipSunk.playerId === player2?.id ? player2?.name || "" :
                            shipSunk && shipSunk.playerId === player3?.id ? player3?.name || "" :
                                shipSunk && shipSunk.playerId === player4?.id ? player4?.name || "" : ""
                })}
            />
            <NotifyModal key='notify-player-die'
                // color={isMyTurn ? 'blue' : 'red'}
                color={
                    playerDie?.playerId === player1?.id ? "blue" :
                        playerDie?.playerId === player2?.id ? "red" :
                            playerDie?.playerId === player3?.id ? "green" :
                                playerDie?.playerId === player4?.id ? "yellow" : "blue"
                }
                showIf={playerDie}
                msDelay={0}
                msShow={1900}
                title={t("player_die", {
                    player:
                        playerDie?.playerId === player1?.id ? player1?.name || "" :
                            playerDie?.playerId === player2?.id ? player2?.name || "" :
                                playerDie?.playerId === player3?.id ? player3?.name || "" :
                                    playerDie?.playerId === player4?.id ? player4?.name || "" : ""
                })}
            />

            <NotifyModal key='notify-end-match'
                color={game?.winnerId === playerId ? 'blue' : 'red'}
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

export default GamePageSpecial