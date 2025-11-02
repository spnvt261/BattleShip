import { Room, Player } from "../types";
import { createGameForRoom } from "./gameService";
import { Server } from "socket.io";

export const rooms: { [roomId: string]: Room } = {};

function generate6DigitRoomId(): string {
    let id: string;
    do {
        id = Math.floor(100000 + Math.random() * 900000).toString(); // 100000-999999
    } while (rooms[id]);
    return id;
}

export function createRoom(hostName: string, hostId: string): Room {
    const id = generate6DigitRoomId();
    const host: Player = { id: hostId, name: hostName, isReady: false };
    const room: Room = {
        id,
        hostId: hostId,
        players: [host],
        status: "waiting",
        createdAt: Date.now(),
        chat: []
    };
    rooms[id] = room;
    return room;
}

export function getRoom(roomId: string): Room | undefined {
    return rooms[roomId];
}

export function joinRoom(roomId: string, name: string, playerId: string): { room?: Room; error?: string } {
    const room = rooms[roomId];
    if (!room) return { error: "Room not found" };
    if (room.players.length >= 2) return { error: "Room is full" };
    const player: Player = { id: playerId, name, isReady: false };
    room.players.push(player);
    return { room };
}

export function leaveRoom(roomId: string, playerId: string) {
    const room = rooms[roomId];
    if (!room) return;
    room.players = room.players.filter(p => p.id !== playerId);
    // if room empty, delete
    if (room.players.length === 0) delete rooms[roomId];
    else {
        // if game was playing, mark finished
        if (room.game) {
            room.game.status = "ended";
            room.status = "finished";
        }
    }
}

export function startGame(roomId: string, requesterPlayerId: string, io?: Server): { error?: string; game?: any } {
    const room = rooms[roomId];
    // console.log(1);
    // 
    if (!room) return { error: "Room not found" };
    // console.log(2);
    
    if (room.players[0].id !== requesterPlayerId) return { error: "Only host can start the game" };
    // console.log(3);
    if (room.players.length !== 2) return { error: "Need 2 players to start" };
    // console.log(4);
    // create game (gameService will prepare player states / boards)
    const game = createGameForRoom(room);
    // set initial flow: placing phase first
    game.status = "placing";
    room.game = game;
    room.status = "playing";

    // notify room: clients should switch to placing-mode (place ships)
    if (io) {
        io.to(roomId).emit("room_update", { room, players: room.players });
        io.to(roomId).emit("game_start", { game }); // game.status === 'placing'
    }

    return { game };
}

export function setReady(roomId: string, playerId: string, isReady: boolean, io?: Server) {
    const room = rooms[roomId];
    if (!room) return;
    const p = room.players.find(pl => pl.id === playerId);
    if (p) p.isReady = isReady;

    // broadcast room update
    if (io) io.to(roomId).emit("room_update", { room, players: room.players });

    // if both players ready => start game
    if (room.players.length === 2 && room.players.every(pl => pl.isReady)) {
        const game = createGameForRoom(room);
        room.game = game;
        room.status = "playing";
        if (io) io.to(roomId).emit("game_start", { game });
    }
}

export function broadcastRoomUpdate(roomId: string, io: Server) {
    const room = rooms[roomId];
    if (!room) return;
    io.to(roomId).emit("room_update", { room, players: room.players });
}
