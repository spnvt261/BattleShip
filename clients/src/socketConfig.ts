// src/socket.ts
import { io, type Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents, InternalSocketEvents } from "./types/socket";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ||
 "http://192.168.0.101:3000";

// const SERVER_URL ="http://192.168.0.101:3000";

export const socket: Socket<ServerToClientEvents & InternalSocketEvents, ClientToServerEvents> = io(SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 3,     
  reconnectionDelay: 500,     
  timeout: 3000,
});
