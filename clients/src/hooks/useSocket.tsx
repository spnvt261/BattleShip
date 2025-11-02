// src/hooks/useGameSocket.ts
import { useEffect } from "react";
import * as gameSocketService from "../services/gameSocketService";
import { socket } from "../socket";

export function useSocket() {
  useEffect(() => {
    // Tß╗▒ ─æß╗Öng reconnect ─æ├ú ─æ╞░ß╗úc socket.io handle
    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("disconnect", () => console.log("Socket disconnected"));

    // Cleanup khi component unmount
    return () => {
      socket.off(); // remove tß║Ñt cß║ú listener
    };
  }, []);

  // Trß║ú vß╗ü to├án bß╗Ö service ─æß╗â component gß╗ìi trß╗▒c tiß║┐p
  return gameSocketService;
}
