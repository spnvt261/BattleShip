// src/socket.ts
import { io, type Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "./types/socket";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

// **Đây là điểm quan trọng**: typed socket
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
  autoConnect: true,
  reconnection: true,
});
