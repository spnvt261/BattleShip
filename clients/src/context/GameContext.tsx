// src/context/GameContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Room, Player, Game } from "../types/game";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useNotification } from "./NotifycationContext";
import { useAppSettings } from "./appSetting";

type GameContextType = {
    setRoomId: (id: string) => void;
    room: Room | null;
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
    const { t } = useAppSettings();
    const [player1, setPlayer1] = useState<Player | null>(null);
    const [player2, setPlayer2] = useState<Player | null>(null);
    const [game, setGame] = useState<Game | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null);
    const { getRoom, onRoomUpdate } = useSocket()
    
    const fetchRoom = useCallback(() => {
        if (!roomId) return;
        getRoom(roomId, (res) => {
            if (!res.room) {
                notify(t(`Room not found`), 'error')
                navigate("/")
                return;
            }
            setRoom(res.room)
        });
    }, [roomId]);

    useEffect(() => {
        if (!player1 && room) setPlayer1(room.players[0])
        if (!player2 && room) setPlayer2(room.players[1])
        if (!game && room?.game) setGame(room.game)
    }, [room])

    // Lắng nghe update từ server
    useEffect(() => {
        fetchRoom();
        const unsubscribe = onRoomUpdate((res) => {
            setPlayer1(res.room?.players[0] ?? null);
            setPlayer2(res.room?.players[1] ?? null);
            setGame(res.room?.game ?? null)
        });
        return () => {
            unsubscribe?.();
        };
    }, [roomId, onRoomUpdate]);

    const cleanRoom = () => {
        setPlayer1(null)
        setPlayer2(null)
        setRoom(null)
        setGame(null)
    }

    return (
        <GameContext.Provider value={{ setRoomId, room, setRoom, player1, setPlayer1, player2, setPlayer2, game, setGame, cleanRoom }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error("useGame must be used within GameProvider");
    return ctx;
};
