import { useEffect, useRef } from "react";
import type { Player, Room } from "../types/game";
import { useNotification } from "../context/NotifycationContext";
import { useAppSettings } from "../context/appSetting";

export const useRoomNotify = (room: Room, player1: Player | null, player2: Player | null, player3: Player | null, player4: Player | null) => {
    const playersRef = useRef<(Player | null)[]>([player1, player2, player3, player4])
    const { notify } = useNotification();
    const { t, playerId,playerName } = useAppSettings();
    useEffect(() => {
        const prevPlayers = playersRef.current.filter(Boolean) as Player[];
        const currentPlayers = [player1, player2, player3, player4].filter(Boolean) as Player[];

        const prevIds = prevPlayers.map(p => p.id);
        const currIds = currentPlayers.map(p => p.id);

        // Ai join mới
        const joined = currentPlayers.filter(p => !prevIds.includes(p.id));
        joined.forEach(p => {
            notify(t("player_join", { player: p.name }), "success");
        });

        // Ai leave
        const left = prevPlayers.filter(p => !currIds.includes(p.id));
        left.forEach(p => {
            notify(t("player_left", { player: p.name }), "warning");
        });

        // Nếu bản thân mới vào phòng
        if(currIds[currIds.length-1]===playerId && currIds.length>1 &&prevIds.length===currIds.length){
            notify(t("player_join",{player: playerName}), "success");
        }

        playersRef.current = [player1, player2, player3, player4];
    }, [room.players.length])
}