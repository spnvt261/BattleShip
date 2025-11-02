// src/services/gameSocketService.ts
import { socket } from "../socket";
import type { Player, Ship, Game, Room } from "../types/game";

// ---- Emit các action ----
export const createRoom = (name: string, playerId:string, cb?: (res: any) => void) =>
    socket.emit("create_room", { name ,playerId}, cb);

export const joinRoom = (roomId: string, name: string,playerId:string, cb?: (res: any) => void) =>
    socket.emit("join_room", { roomId, name, playerId }, cb);

export const leaveRoom = (roomId: string,playerId:string, cb?: (res: any) => void) =>
    socket.emit("leave_room", { roomId, playerId }, cb);

export const startGame = (roomId: string,playerId:string, cb?: (res: any) => void) => {
    socket.emit("start_game", { roomId, playerId }, cb);
}
    

export const placeShips = (roomId: string, ships: Ship[], cb?: (res: any) => void) =>
    socket.emit("place_ships", { roomId, ships }, cb);

export const ready = (roomId: string, playerId: string, cb?: (res: any) => void) =>
    socket.emit("ready", { roomId, playerId }, cb);

export const attack = (roomId: string, x: number, y: number, cb?: (res: any) => void) =>
    socket.emit("attack", { roomId, x, y }, cb);

export const sendChat = (roomId: string, name: string, text: string, cb?: (res: any) => void) =>
    socket.emit("chat", { roomId, name, text }, cb);



// ---- Listen các event từ server ----
export const onRoomUpdate = (cb: (payload: { room: Room; players: Player[] }) => void) =>{
    socket.on("room_update", cb);
    return () => socket.off("room_update", cb); 
}
export const onGameStart = (cb: (payload: { game: Game }) => void) =>
    socket.on("game_start", cb);

export const onHit = (cb: (payload: { x: number; y: number; playerId: string }) => void) =>
    socket.on("hit", cb);

export const onMiss = (cb: (payload: { x: number; y: number; playerId: string }) => void) =>
    socket.on("miss", cb);

export const onGameOver = (cb: (payload: { winner: string }) => void) =>
    socket.on("game_over", cb);

export const onChat = (cb: (msg: { roomId: string; name: string; text: string }) => void) =>
    socket.on("chat", cb);

export const getRoom = (roomId: string, cb: (res: { roomId: string; players: Player[] }) => void) =>
    socket.emit("get_room", { roomId }, cb);

