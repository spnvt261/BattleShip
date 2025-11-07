// src/hooks/useGameSocket.ts
import { useEffect, useRef } from "react";
import * as gameSocketService from "../services/gameSocketService";
import { socket } from "../socketConfig";
import { useNotification } from "../context/NotifycationContext";
import { useAppSettings } from "../context/appSetting";

export function useSocket() {
    const { notify } = useNotification();
    const { t } = useAppSettings();
    const notifiedRef = useRef(false); 

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
            notifiedRef.current = false; 
        });

        socket.on("disconnect", () => {
            console.warn("⚠️ Socket disconnected");
        });

        socket.on("connect_error", (err) => {
            console.error("❌ Không thể kết nối tới server:", err.message);
            if (!notifiedRef.current) {
                notify(t("connect_error"), "error");
                notifiedRef.current = true;
            }
        });

        socket.on("reconnect_failed", () => {
            console.error("❌ Kết nối lại server thất bại sau 3 lần");
            notify(t("reconnect_failed"), "error");
            socket.disconnect();
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("connect_error");
            socket.off("reconnect_failed");
        };
    }, []);


    return { ...gameSocketService };
}
