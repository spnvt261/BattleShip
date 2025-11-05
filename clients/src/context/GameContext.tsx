// src/context/GameContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Room, Player, Game, PlayerState } from "../types/game";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useNotification } from "./NotifycationContext";
import { useAppSettings } from "./appSetting";

type GameContextType = {
    setRoomId: (id: string) => void;
    room: Room | null;
    playerState: PlayerState | null;
    setRoom: (r: Room | null) => void;
    player1: Player | null;
    player2: Player | null;
    setPlayer1: (p: Player | null) => void;
    setPlayer2: (p: Player | null) => void;
    game: Game | null;
    setGame: (g: Game | null) => void;
    cleanRoom: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [room, setRoom] = useState<Room | null>(null);
    const navigate = useNavigate()
    const { notify } = useNotification()
    const { t, playerId } = useAppSettings();
    const [player1, setPlayer1] = useState<Player | null>(null);
    const [player2, setPlayer2] = useState<Player | null>(null);
    const [game, setGame] = useState<Game | null>(null);
    const [playerState, setPlayerState] = useState<PlayerState | null>(null)
    const [roomId, setRoomId] = useState<string | null>(null);
    // const [connected,setConnected] = useState<boolean>(false);
    const { getRoom, onRoomUpdate, onPlayerStateUpdate } = useSocket()
    const fetchData = useCallback(() => {
        if (!roomId) return;

        getRoom(roomId, playerId, (res) => {
            if (!res.room) {
                notify(t(`Room not found`), 'error')
                navigate("/")
                return;
            }
            setRoom(res.room)
            if(res.room.game?.players && (res.room.players[0].id===playerId || res.room.players[1].id===playerId)){
                setPlayerState( playerId===res.room.game.players[0].playerId? res.room.game.players[0]:res.room.game.players[1])
            }
        });

        
    }, [roomId]);

    useEffect(() => {
        if (!player1 && room) setPlayer1(room.players[0])
        if (!player2 && room) setPlayer2(room.players[1])
        if (!game && room?.game) setGame(room.game)
    }, [room])
    
    // Lắng nghe update từ server
    useEffect(() => {
        fetchData();
        const unsubscribe = onRoomUpdate((res) => {
            
            if (room && res.room.players.length === 1 && room.players.length === 2) {
                const playerLeaveRoom: Player = room.players.filter(p => p.id !== res.room.players[0].id)[0]
                notify(t("player_left", { player: playerLeaveRoom?.name || "" }), 'warning')
                cleanRoom()
                navigate("/")
            }
            setPlayer1(res.room?.players[0] ?? null);
            setPlayer2(res.room?.players[1] ?? null);
            if (res.room.game) setGame(res.room.game)
        });
        return () => {
            unsubscribe?.();
        };
    }, [roomId, onRoomUpdate, player2, player1, game]);
    
    useEffect(() => {
        const unsubscribe = onPlayerStateUpdate((res) => {
            setPlayerState(res.playerState)
        });
        return () => {
            unsubscribe?.();
        };
    }, [])

    const cleanRoom = () => {
        setPlayer1(null)
        setPlayer2(null)
        setPlayerState(null)
        setGame(null)
        setRoom(null)
        setRoomId(null)
    }

    return (
        <GameContext.Provider value={{
            setRoomId,
            room, setRoom,
            player1, setPlayer1,
            player2, setPlayer2,
            playerState,
            game, setGame,
            cleanRoom
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error("useGame must be used within GameProvider");
    return ctx;
};
