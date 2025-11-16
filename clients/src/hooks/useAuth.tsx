import { useEffect } from "react";
import { useAppSettings } from "../context/appSetting";
import type { Game, Room } from "../types/game";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotifycationContext";

export const useAuth = (room: Room | null, game: Game | null, options?: { suppressNavigate?: boolean }) => {
    const { playerId, t } = useAppSettings();
    const navigate = useNavigate()
    const { notify } = useNotification();
    useEffect(() => {
        if (!room) return
        const players = room.players.filter(Boolean)
        if (players.length === 0) return
        if (players.every(p => p.id !== playerId)) {
            notify(t("Room is full"), "warning");
            navigate("/")
            return;
        }
        // if (player1&&player2&& player1.id !== playerId && player2.id !== playerId) {
        //     notify(t("Room is full"), "warning");
        //     navigate("/")
        //     return;
        // }
        if (options?.suppressNavigate) return;
        if (game) {
            if (game.status === 'placing') {
                navigate(`/room/${room.id}/setup`)
                return
            } else if (game.status === 'playing') {
                if (room.type === 'classic') {
                    navigate(`/room/${room.id}/fight`)
                } else if (room.type === 'one_board') {
                    navigate(`/room/${room.id}/fight-mode`)
                }

            } else {
                notify(t("match_finish"), "error")
                navigate("/");
            }
        }
    }, [room, game, playerId])
}

