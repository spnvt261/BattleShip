import { Server as IOServer, Socket } from "socket.io";
import { createRoom, joinRoom, setReady, leaveRoom, getRoom, startGame, rooms, getSafeRoom, kickPlayer } from "./services/roomService";
import { placeShips, attack, getPlayerState } from "./services/gameService";
import { addMessage } from "./services/chatService";
import { Player, PlayerState, RoomPlayerNumber, RoomType } from "./types";
import { broadcastGameUpdate } from "./utils/boardHelpers";

export const socketToPlayer: Map<string, string> = new Map();
// const socketToPlayer: Map<string, string> = new Map();
export function initSockets(io: IOServer) {
    io.on("connection", (socket: Socket) => {
        console.log("socket connected:", socket.id);

        // mapping from socket.id -> stable playerId provided by client
        // when client sends payload.playerId we store it here so on disconnect we can find which player left

        socket.on("create_room", (payload: { name: string, playerId: string, type:RoomType ,boardSize:number,roomPlayerNumber:RoomPlayerNumber }, cb: any) => {
            const playerId = payload?.playerId || socket.id;
            // store mapping
            socketToPlayer.set(socket.id, playerId);
            const room = createRoom(payload.name, playerId,payload.type,payload.boardSize,payload.roomPlayerNumber);
            socket.join(room.id);
            // return roomId and confirmed playerId
            cb && cb({ room: room, playerId });
            io.to(room.id).emit("room_update", {
                room: getSafeRoom(room),
                players: room.players
            });
        });

        socket.on("get_room", (payload: { roomId: string, playerId: string }, cb: any) => {
            const { roomId, playerId } = payload;
            const room = getRoom(roomId);
            if (!room) {
                return cb && cb({ error: "Room not found" });
            }
            socketToPlayer.set(socket.id, playerId);

            // JOIN socket vào room để nhận sự kiện realtime
            socket.join(roomId);

            cb && cb({
                room: getSafeRoom(room, playerId),
                players: room.players
            });
        });


        socket.on("join_room", (payload: { roomId: string; name: string; playerId?: string }, cb: any) => {
            const { roomId, name } = payload || {};
            if (!roomId || !/^\d{6}$/.test(roomId)) {
                return cb?.({ error: "Invalid roomId format. Expect 6 digits." });
            }
            const playerId = payload?.playerId || socketToPlayer.get(socket.id) || socket.id;
            // const currentPlayerId = socketToPlayer.get(socket.id);

            // 1️⃣ Kiểm tra xem đang ở room khác không
            // const roomsOfSocket = Array.from(socket.rooms); // socket.rooms là Set
            // const oldRoomSocketId = roomsOfSocket.find(r => r !== socket.id); // loại bỏ room mặc định là socket.id
            const oldRoomId = Object.entries(rooms).find(([_roomId, room]) =>
                room?.players[0]?.id === playerId || room?.players[1]?.id === playerId
            )?.[0]
            if (oldRoomId && oldRoomId !== roomId) {
                // leave room cũ
                // oldRoomId.map(roomId =>leaveRoom(oldRoomId, playerId)) ;
                leaveRoom(oldRoomId, playerId)
                // socketToPlayer.delete(oldRoomSocketId);
                socket.leave(oldRoomId);
                const oldRoom = getRoom(oldRoomId);
                io.to(oldRoomId).emit("room_update", {
                    room: oldRoom ? getSafeRoom(oldRoom) : oldRoom,
                    players: oldRoom?.players
                });
            }

            socketToPlayer.set(socket.id, playerId);
            const res = joinRoom(payload.roomId, payload.name, playerId);
            if (res.error) {
                cb && cb({ error: res.error });
                return;
            }
            socket.join(payload.roomId);
            const room = getRoom(payload.roomId);
            if (room)
                io.to(payload.roomId).emit("room_update", {
                    room: getSafeRoom(room),
                    players: room?.players
                });
            cb && cb({ ok: true, room, playerId });
        });

        socket.on("leave_room", (payload: { roomId: string; playerId?: string }, cb: any) => {
            const playerId = payload?.playerId || socketToPlayer.get(socket.id) || socket.id;
            leaveRoom(payload.roomId, playerId);
            // cleanup mapping for this socket
            socketToPlayer.delete(socket.id);
            socket.leave(payload.roomId);
            const room = getRoom(payload.roomId);
            if (room)
                io.to(payload.roomId).emit("room_update", {
                    room: getSafeRoom(room),
                    players: room?.players
                });
            cb && cb({ ok: true });
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
            // socket.join(payload.roomId);
            // const room = getRoom(payload.roomId);
            // io.to(payload.roomId).emit("room_update", { room, players: room?.players });
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

        socket.on("ready", (payload: { roomId: string; playerState: PlayerState }, cb: any) => {
            setReady(payload.roomId, payload.playerState, true, io);
            cb && cb({ ok: true });
        });

        socket.on("attack", (payload: { roomId: string; x: number; y: number; playerId: string }, cb: any) => {
            const { roomId, x, y } = payload;
            const playerId = payload.playerId || socketToPlayer.get(socket.id) || socket.id;
            socketToPlayer.set(socket.id, playerId);
            const res = attack(roomId, playerId, x, y, io);
            // broadcastGameUpdate(roomId,io)
            cb && cb(res);
        });

        socket.on("chat", (payload: { roomId: string; text: string; name: string; playerId: string }, cb: any) => {
            const { roomId, text, name } = payload;
            const playerId = payload.playerId || socketToPlayer.get(socket.id) || socket.id;
            socketToPlayer.set(socket.id, playerId);
            addMessage(roomId, playerId, name, text, io);
            cb && cb({ ok: true });
        });
        socket.on("kick_player", (payload: { roomId: string; playerId: string }, cb: any) => {
            const { roomId, playerId } = payload;
            const res = kickPlayer(roomId, playerId);
            if (res.error) return cb && cb(res);

            const targetSocketId = [...socketToPlayer.entries()]
                .find(([sockId, pId]) => pId === playerId)?.[0];
            console.log("Kick target socket123:", targetSocketId);
            if (targetSocketId) {   
                const targetSocket = io.sockets.sockets.get(targetSocketId);
                if (targetSocket) {
                    // 👇 gửi thông báo riêng cho người bị kick
                    targetSocket.emit("kicked", {
                        roomId,
                        message: "You have been kicked from the room by the host."
                    });
                    targetSocket.leave(roomId);
                }
            }
            if (res.room)
                io.to(roomId).emit("room_update", {
                    room: getSafeRoom(res.room),
                    players: res.room.players
                });

            cb && cb({ ok: true });
        });



        socket.on("disconnect", () => {
            // chỉ log hoặc đánh dấu disconnected
            const playerId = socketToPlayer.get(socket.id) || socket.id;
            console.log(`${playerId} disconnected but still in room`);
             // ❗ Xóa socket cũ khỏi map
            socketToPlayer.delete(socket.id);
        });

    });
}
