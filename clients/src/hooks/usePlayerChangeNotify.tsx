import { useEffect, useRef } from "react";
import { useNotification } from "../context/NotifycationContext";
import { useAppSettings } from "../context/appSetting";
import { type Player } from "../types/game";

export function usePlayerChangeNotify(player1: Player | null, player2: Player | null) {
    const {playerId} = useAppSettings()
    const prevPlayers = useRef<{ p1: Player | null; p2: Player | null }>({
        p1: null,
        p2: null,
    });

    const { notify } = useNotification();
    const { t } = useAppSettings();
    useEffect(() => {
        const { p1: prev1, p2: prev2 } = prevPlayers.current;
        // ---- Player 2 Join ----
        if (!prev2 && player2) {
            notify(t("player_join", { player: player2.name }), "success");
        }

        // ---- Player 1 Leave ----
        if (prev1&& prev2 && !player2 && player1?.id===prev2.id && prev1.id!==playerId) {
            notify(t("player_left", { player: prev1.name }), "warning");
        }
        // ---- Player 2 Leave ----
        if (prev2 && !player2 && player1?.id!==prev2.id  && (player1 || player2)) {
            notify(t("player_left", { player: prev2.name }), "warning");
        }
        // ---- Cập nhật ref ----
        prevPlayers.current = { p1: player1, p2: player2 };
    }, [player2]);
}
