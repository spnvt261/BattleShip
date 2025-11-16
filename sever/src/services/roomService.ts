import { socketToPlayer } from "../socket";
import { Room, Player, PlayerState, RoomType, RoomPlayerNumber } from "../types";
import { checkCollision } from "../utils/boardHelpers";
import { checkEndGameOneBoardMode, playerDie } from "../utils/gameHelpers";
import { createGameForRoom, getPlayerState } from "./gameService";
import { Server } from "socket.io";

export const rooms: { [roomId: string]: Room } = {};

// Xoá room nếu game đã end hơn 2 tiếng
export function cleanupRooms() {
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    const now = Date.now();

    for (const roomId in rooms) {
        const room = rooms[roomId];
        if (!room) continue;

        // Chỉ xoá room đã kết thúc
        if (room.status !== "finished") continue;

        // Room chưa có game hoặc game chưa end => bỏ qua
        const game = room.game;
        if (!game) continue;
        if (game.status !== "ended") continue;
        if (!game.endedAt) continue;

        // Nếu đã end > 2 tiếng thì xoá
        if (now - game.endedAt >= TWO_HOURS) {
            delete rooms[roomId];
            console.log(`[CLEANUP] Removed room ${roomId} (ended more than 2 hours ago)`);
        }
    }
}

function generate6DigitRoomId(): string {
    let id: string;
    do {
        id = Math.floor(100000 + Math.random() * 900000).toString(); // 100000-999999
    } while (rooms[id]);
    return id;
}

export function createRoom(hostName: string, hostId: string, type: RoomType, boardSize: number, roomPlayerNumber: RoomPlayerNumber): Room {
    cleanupRooms()
    const id = generate6DigitRoomId();
    const host: Player = { id: hostId, name: hostName, isReady: false };
    const room: Room = {
        id,
        hostId: hostId,
        players: [host],
        status: "waiting",
        type: type ?? "classic",
        boardSize: boardSize ?? 10,
        roomPlayerNumber: roomPlayerNumber ?? 2,
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

export function leaveRoom(roomId: string, playerId: string, io?: Server) {
    const room = rooms[roomId];
    if (!room) return;
    if (room.type === 'classic' || (room.type === 'one_board' && room.game?.status==='placing')
        || (room.type === 'one_board' && room.status==='waiting')
    ) room.players = room.players.filter(p => p.id !== playerId);
    // if room empty, delete
    if (room.players.length === 0) delete rooms[roomId];
    else {
        // if game was playing, mark finished
        if (room.game) {
            if (room.type === 'classic' || (room.type === 'one_board' && room.game.status==='placing')) {
                room.game.status = "ended";
                room.status = "finished";
            } else if (room.type === 'one_board') {
                const playerOut = room.game.players.find(p => p.playerId === playerId)
                if (!playerOut) {
                    throw "Player Not Found"
                }
                playerDie(room, playerId)


                const end = checkEndGameOneBoardMode(room.game, room);
                if (end.ended) {
                    room.game.status = "ended";
                    room.game.endedAt = Date.now();
                    room.game.winnerId = end.winnerId;
                    room.status = "finished";

                    if (io) {
                        io.to(roomId).emit("game_over", { winnerId: end.winnerId });
                    }
                }
            }

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
    if (room.players.length !== room.roomPlayerNumber) return { error: "Need full players to start" };
    // console.log(4);
    // create game (gameService will prepare player states / boards)
    const game = createGameForRoom(room);
    // set initial flow: placing phase first
    game.status = "placing";
    room.game = game;
    room.status = "playing";

    // notify room: clients should switch to placing-mode (place ships)
    if (io) {
        io.to(roomId).emit("room_update", {
            room: getSafeRoom(room),
            players: room.players
        });
        io.to(roomId).emit("game_start", { game }); // game.status === 'placing'
    }

    return { game };
}

export function setReady(roomId: string, playerState: PlayerState, isReady: boolean, io?: Server) {
    const room = rooms[roomId];
    if (!room) return;
    const p = room.players.find(pl => pl.id === playerState.playerId);
    if (p) p.isReady = isReady;
    const game = room.game;
    if (game) {
        // room.game.players[0].playerId === playerState.playerId ? room.game.players[0] = { ...playerState, isReady: true } : room.game.players[1] = { ...playerState, isReady: true }
        const playerIndex = game.players.findIndex(p => p.playerId === playerState.playerId)
        game.players[playerIndex] = {
            ...playerState,
            isReady: true
        }
    }



    // if all players ready => start game
    if (room.players.length === room.roomPlayerNumber && room.players.every(pl => pl.isReady)) {
        room.status = "playing";
        if (room.game) room.game.status = "playing";
        if (io && room.type === 'one_board') checkCollision(roomId, io)
        // if(room.game) room.game.turn = Math.random()<0.5 ? room.game.players[0].playerId : room.game.players[1].playerId  
        // if (io && room.game) io.to(roomId).emit("turn_update", { playerId: Math.random() < 0.5 ? room.game.players[0].playerId : room.game.players[1].playerId })
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
        })) as PlayerState[],
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
