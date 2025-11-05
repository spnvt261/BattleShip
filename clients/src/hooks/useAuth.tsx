import { useEffect } from "react";
import { useAppSettings } from "../context/appSetting";
import type { Game, Room } from "../types/game";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotifycationContext";
import { useGame } from "../context/GameContext";

export const useAuth = (room: Room | null, game: Game | null, options?: { suppressNavigate?: boolean }) => {
    const { playerId, t } = useAppSettings();
    const navigate = useNavigate()
    const { notify } = useNotification();
    const { cleanRoom } = useGame();

    useEffect(() => {
        if (!room) return
        const [player1, player2] = room.players
        if (!player1 && !player2) return
        // console.log(player1,player2);
        
        if (player1?.id !== playerId && player2?.id !== playerId) {
            notify(t("Room is full"), "warning");
            cleanRoom()
            navigate("/")
            return;
        }
        if (options?.suppressNavigate) return;
        if (game) {
            if (game.status === 'placing') {
                navigate(`/room/${room.id}/setup`)
                return
            } else if (game.status === 'playing') {
                navigate(`/room/${room.id}/fight`)
            } else {
                notify(t("match_finish"), "error")
                cleanRoom();
                navigate("/");
            }
        }
    }, [room, game, playerId])
}

