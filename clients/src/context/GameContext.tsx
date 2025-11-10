import { createContext, useCallback, useContext, useEffect, useMemo, useState, type FC, type ReactNode } from "react"
import type { Game, Player, PlayerState, Room } from "../types/game"
import { useNavigate } from "react-router-dom";
import { useNotification } from "./NotifycationContext";
import { useAppSettings } from "./appSetting";
import { useSocket } from "../hooks/useSocket";

type GameState = {
    room: Room | null;
    player1: Player | null;
    player2: Player | null;
    playerState: PlayerState | null;
    game: Game | null;
}
type GameActions = {
    loadRoom: (id: string) => Promise<void>;
    cleanRoom: () => void
}

const GameStateContext = createContext<GameState | undefined>(undefined)
const GameActionsContext = createContext<GameActions | undefined>(undefined)

export const GameProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const { notify } = useNotification();
    const { t, playerId } = useAppSettings();
    const { getRoom, onRoomUpdate,onPlayerStateUpdate } = useSocket();
    const [room, setRoom] = useState<Room | null>(null);
    const [player1, setPlayer1] = useState<Player | null>(null);
    const [player2, setPlayer2] = useState<Player | null>(null);
    const [playerState, setPlayerState] = useState<PlayerState | null>(null);
    const [game, setGame] = useState<Game | null>(null);

    const cleanRoom = useCallback(() => {
        setRoom(null);
        setPlayer1(null);
        setPlayer2(null);
        setPlayerState(null);
        setGame(null)
    }, [])

    const loadRoom = useCallback(async (roomId: string) => {
        return new Promise<void>((resolve, reject) => {
            getRoom(roomId, playerId, (res) => {
                if (!res.room) {
                    notify(t("Room not found"), 'error');
                    navigate("/")
                    reject(t("Room not found"))
                    return
                }
                setRoom(res.room)
                setPlayer1(res.room.players[0] ?? null)
                setPlayer2(res.room.players[1] ?? null)
                setGame(res.room.game ?? null)
                if (res.room.game?.players) {
                    setPlayerState(playerId === res.room.players[0].id ? res.room.game.players[0] : res.room.game.players[1])
                }
                resolve();
            })
        })
    }, [playerId])

    useEffect(() => {
        const unsubroom = onRoomUpdate((res) => {
            if (room && res.room.players.length === 1 && room.players.length === 2 && room.status !== 'waiting') {
                const playerLeaveRoom: Player = room.players.filter(p => p.id !== res.room.players[0].id)[0]
                notify(t("player_left", { player: playerLeaveRoom?.name || "" }), 'warning')
                cleanRoom()
                navigate("/")
            }

            setRoom(res.room)
            setPlayer1(res.room.players[0] ?? null)
            setPlayer2(res.room.players[1] ?? null)
            setGame(res.room.game ?? null)
        })

        const unsubplayerstate = onPlayerStateUpdate((res) => {
            // console.log(res.playerState);
            
            setPlayerState(prev => {
                if (!prev) return res.playerState;

                return {
                    ...prev,
                    // chỉ cập nhật những field thay đổi
                    shotsFired: res.playerState.shotsFired ?? prev.shotsFired,
                    shotsReceived: res.playerState.shotsReceived ?? prev.shotsReceived,
                    sunkEnemyShips: res.playerState.sunkEnemyShips ?? prev.sunkEnemyShips,
                    isReady: res.playerState.isReady ?? prev.isReady,
                    // giữ nguyên ships nếu không có thay đổi
                    ships: res.playerState.ships?.length ? res.playerState.ships : prev.ships,
                };
            });
        })
        return () => {
            unsubroom?.();
            unsubplayerstate?.();
        }
    }, [player2, player1])
    const stateValue = useMemo(() => ({
        game,
        player1,
        player2,
        playerState,
        room
    }), [game,
        player1,
        player2,
        playerState,])
    const actionsValue = useMemo(() => ({ cleanRoom, loadRoom }), [cleanRoom, loadRoom])
    return (
        <GameStateContext.Provider value={stateValue}>
            <GameActionsContext.Provider value={actionsValue}>
                {children}
            </GameActionsContext.Provider>

        </GameStateContext.Provider>
    )
}

export const useGame = () => {
    const ctx = useContext(GameStateContext)
    if (!ctx) throw new Error("useGame must be used within GameProvider");
    return ctx
}

export const useGameActions = () => {
    const ctx = useContext(GameActionsContext)
    if (!ctx) throw new Error("useGame must be used within GameProvider");
    return ctx
}