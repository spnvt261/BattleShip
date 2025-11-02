import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "./useSocket";
import { type Player } from "../types/game";
import { useNotification } from "../context/NotifycationContext";
import { useAppSettings } from "../context/appSetting";

interface UseRoomResult {
    roomId: string | undefined;
    player1: Player | null;
    player2: Player | null;
    refreshRoom: () => void;
}

export function useRoom(): UseRoomResult {
    const { roomId } = useParams<{ roomId: string }>();
    const { getRoom, onRoomUpdate } = useSocket();
    const {notify} = useNotification();
    const navigative = useNavigate();
    const {t} = useAppSettings();
    const [player1, setPlayer1] = useState<Player | null>(null);
    const [player2, setPlayer2] = useState<Player | null>(null);

    const fetchRoom = useCallback(() => {
        if (!roomId) return;
        getRoom(roomId, (res) => {
            console.log(res);
            
            if (!res.players) {
                setPlayer1(null);
                setPlayer2(null);
                notify(t(`Room not found`),'error')
                navigative("/")
                return;
            }
            setPlayer1(res.players[0] || null);
            setPlayer2(res.players[1] || null);
        });
    }, [roomId, getRoom]);

    useEffect(() => {
        fetchRoom();

        const unsubscribe = onRoomUpdate((res) => {
            console.log(res);
            if(res.room.game?.status == "placing"){
                navigative(`/room/${roomId}/setup`)
                return
            }
            if(res.room.game?.status == "playing"){
                navigative(`/room/${roomId}/fight`)
                return
            }
            setPlayer1(res.players[0] || null);
            setPlayer2(res.players[1] || null);
        });

        return () => {
            unsubscribe?.();
        };
    }, [fetchRoom, onRoomUpdate]);

    return { roomId, player1, player2, refreshRoom: fetchRoom };
}
