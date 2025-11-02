import { Server as IOServer, Socket } from "socket.io";
import { createRoom, joinRoom, setReady, leaveRoom, getRoom, startGame } from "./services/roomService";
import { placeShips, attack } from "./services/gameService";
import { addMessage } from "./services/chatService";
import { Player } from "./types";

export function initSockets(io: IOServer) {
    io.on("connection", (socket: Socket) => {
        console.log("socket connected:", socket.id);

        // mapping from socket.id -> stable playerId provided by client
        // when client sends payload.playerId we store it here so on disconnect we can find which player left
        const socketToPlayer: Map<string, string> = new Map();

        socket.on("create_room", (payload: { name: string, playerId?: string }, cb: any) => {
            const playerId = payload?.playerId || socket.id;
            // store mapping
            socketToPlayer.set(socket.id, playerId);
            const room = createRoom(payload.name, playerId);
            socket.join(room.id);
            // return roomId and confirmed playerId
            cb && cb({ roomId: room.id, playerId });
            io.to(room.id).emit("room_update", { room, players: room.players });
        });

        socket.on("get_room", (payload: { roomId: string }, cb: any) => {
            const { roomId } = payload;
            const room = getRoom(roomId); // Lấy room từ service
            if (!room) {
                return cb && cb({ error: "Room not found" });
            }
            // Trả room cho client qua callback
            cb && cb({ roomId: room.id, players: room.players });
        });


        socket.on("join_room", (payload: { roomId: string; name: string; playerId?: string }, cb: any) => {
            const { roomId, name } = payload || {};
            if (!roomId || !/^\d{6}$/.test(roomId)) {
                return cb?.({ error: "Invalid roomId format. Expect 6 digits." });
            }
            const playerId = payload?.playerId || socket.id;
            socketToPlayer.set(socket.id, playerId);
            const res = joinRoom(payload.roomId, payload.name, playerId);
            if (res.error) {
                cb && cb({ error: res.error });
                return;
            }
            socket.join(payload.roomId);
            const room = getRoom(payload.roomId);
            io.to(payload.roomId).emit("room_update", { room, players: room?.players });
            cb && cb({ ok: true, room, playerId });
        });

        //New event: host starts the room -> game enters 'placing' phase
        socket.on("start_game", (payload: { roomId: string; playerId?: string }, cb: any) => {
            const playerId = payload?.playerId || socketToPlayer.get(socket.id) || socket.id;
            socketToPlayer.set(socket.id, playerId);
            const res = startGame(payload.roomId, playerId, io);
            if (res.error) {
                cb && cb({ error: res.error });
                return;
            }
            cb && cb({ ok: true, game: res.game });
        });

        socket.on("place_ships", (payload: { roomId: string; ships: any[]; playerId?: string }, cb: any) => {
            const { roomId, ships } = payload;
            const playerId = payload?.playerId || socketToPlayer.get(socket.id) || socket.id;
            // ensure mapping
            socketToPlayer.set(socket.id, playerId);
            const res = placeShips(roomId, playerId, ships, io);
            cb && cb(res);
        });

        socket.on("ready", (payload: { roomId: string; playerId: string }, cb: any) => {
            setReady(payload.roomId, payload.playerId, true, io);
            cb && cb({ ok: true });
        });

        socket.on("attack", (payload: { roomId: string; x: number; y: number; playerId?: string }, cb: any) => {
            const { roomId, x, y } = payload;
            const playerId = payload?.playerId || socketToPlayer.get(socket.id) || socket.id;
            socketToPlayer.set(socket.id, playerId);
            const res = attack(roomId, playerId, x, y, io);
            cb && cb(res);
        });

        socket.on("chat", (payload: { roomId: string; text: string; name: string; playerId?: string }, cb: any) => {
            const { roomId, text, name } = payload;
            const playerId = payload?.playerId || socketToPlayer.get(socket.id) || socket.id;
            socketToPlayer.set(socket.id, playerId);
            addMessage(roomId, playerId, name, text, io);
            cb && cb({ ok: true });
        });

        socket.on("leave_room", (payload: { roomId: string; playerId?: string }, cb: any) => {
            const playerId = payload?.playerId || socketToPlayer.get(socket.id) || socket.id;
            leaveRoom(payload.roomId, playerId);
            // cleanup mapping for this socket
            socketToPlayer.delete(socket.id);
            socket.leave(payload.roomId);
            const room = getRoom(payload.roomId);
            io.to(payload.roomId).emit("room_update", { room, players: room?.players });
            cb && cb({ ok: true });
        });

        socket.on("disconnect", () => {
            // chỉ log hoặc đánh dấu disconnected
            const playerId = socketToPlayer.get(socket.id) || socket.id;
            console.log(`${playerId} disconnected but still in room`);
        });

    });
}
