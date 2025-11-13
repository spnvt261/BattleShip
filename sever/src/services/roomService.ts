import { socketToPlayer } from "../socket";
import { Room, Player, PlayerState, RoomType, RoomPlayerNumber } from "../types";
import { createGameForRoom, getPlayerState } from "./gameService";
import { Server } from "socket.io";

export const rooms: { [roomId: string]: Room } = {};

function generate6DigitRoomId(): string {
    let id: string;
    do {
        id = Math.floor(100000 + Math.random() * 900000).toString(); // 100000-999999
    } while (rooms[id]);
    return id;
}

export function createRoom(hostName: string, hostId: string, type:RoomType,boardSize:number,roomPlayerNumber:RoomPlayerNumber): Room {
    const id = generate6DigitRoomId();
    const host: Player = { id: hostId, name: hostName, isReady: false };
    const room: Room = {
        id,
        hostId: hostId,
        players: [host],
        status: "waiting",
        type: type??"classic",
        boardSize: boardSize??10,
        roomPlayerNumber:roomPlayerNumber??2,
        createdAt: Date.now(),
        chat: []
    };
    rooms[id] = room;
    return room;
}

export function getRoom(roomId: string): Room | undefined {
    // console.log(rooms);

    return rooms[roomId];
}

export function joinRoom(roomId: string, name: string, playerId: string): { room?: Room; error?: string } {
    const room = rooms[roomId];
    if (!room) return { error: "Room not found" };

    // nếu đã đủ 2 người, nhưng player đã trong room thì vẫn ok (rejoin)
    const existingIndex = room.players.findIndex(p => p.id === playerId);

    if (existingIndex !== -1) {
        // player đã ở trong room -> cập nhật tên (nếu khác) và trả về room
        if (room.players[existingIndex].name !== name) {
            room.players[existingIndex].name = name;
        }
        return { room };
    }

    if (room.players.length >= room.roomPlayerNumber) return { error: "Room is full" };
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
        // io.to(roomId).emit("room_update", {
        //     room: getSafeRoom(room),
        //     players: room.players
        // });
        io.to(roomId).emit("game_start", { game }); // game.status === 'placing'
    }

    return { game };
}

export function setReady(roomId: string, playerState: PlayerState, isReady: boolean, io?: Server) {
    const room = rooms[roomId];
    if (!room) return;
    const p = room.players.find(pl => pl.id === playerState.playerId);
    if (p) p.isReady = isReady;

    if (room.game) {
        room.game.players[0].playerId === playerState.playerId ? room.game.players[0] = { ...playerState, isReady: true } : room.game.players[1] = { ...playerState, isReady: true }

        // console.log(room.game.players);

    }



    // if both players ready => start game
    if (room.players.length === 2 && room.players.every(pl => pl.isReady)) {
        room.status = "playing";
        if (room.game) room.game.status = "playing";
        // if(room.game) room.game.turn = Math.random()<0.5 ? room.game.players[0].playerId : room.game.players[1].playerId  
        if (io && room.game) io.to(roomId).emit("turn_update", { playerId: Math.random() < 0.5 ? room.game.players[0].playerId : room.game.players[1].playerId })
    }
    // broadcast room update
    if (io) {
        io.to(roomId).emit("room_update", {
            room: getSafeRoom(room),
            players: room.players
        });
        ///////////////////////////////
        const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
        // console.log(socketsInRoom);

        for (const socketId of socketsInRoom) {
            const playerId = socketToPlayer.get(socketId);
            if (!playerId) continue;
            if (!room.game) continue;
            const personalState = getPlayerState(room.game, playerId);
            io.to(socketId).emit("player_state_update", { playerState: personalState });
        }
    }

}

export function broadcastRoomUpdate(roomId: string, io: Server) {
    const room = rooms[roomId];
    if (!room) return;
    io.to(roomId).emit("room_update", {
        room: getSafeRoom(room),
        players: room.players
    });
}

export const getSafeRoom = (room: Room, playerIdGet?: string): Room => ({
    ...room,
    game: room.game && {
        ...room.game,
        players: room.game.players.map(player => ({
            ...player,
            ships:
                (playerIdGet && player.playerId === playerIdGet)
                    ? player.ships // giữ nguyên nếu là chính mình
                    : player.ships.map(({ coordinates, ...rest }) => rest) // ẩn tọa độ đối thủ
        })) as [PlayerState, PlayerState],
    },
});

export function kickPlayer(roomId: string, playerId: string) {
    const room = getRoom(roomId);
    if (!room) return { error: "Room not found" };

    const index = room.players.findIndex(p => p.id === playerId);
    if (index === -1) return { error: "Player not found in room" };

    room.players.splice(index, 1);

    // nếu bạn có field hostId hoặc turn, nhớ cập nhật lại logic
    // ví dụ: nếu host bị kick thì chuyển host sang người còn lại

    return { ok: true, room };
}
