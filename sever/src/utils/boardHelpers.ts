import { Server } from "socket.io";
import { getRoom, getSafeRoom, rooms } from "../services/roomService";
import { socketToPlayer } from "../socket";
import { Cell, Ship, Shot } from "../types";
import { getPlayerState } from "../services/gameService";
import { checkPlayerOut } from "./gameHelpers";

export function createEmptyBoard(size = 10): Cell[][] {
    const board: Cell[][] = [];
    for (let x = 0; x < size; x++) {
        const row: Cell[] = [];
        for (let y = 0; y < size; y++) {
            row.push({ x, y, hasShip: false, hit: false });
        }
        board.push(row);
    }
    return board;
}

export function validateShips(ships: Ship[], boardSize = 10): { valid: boolean; reason?: string } {
    // Basic validations: correct sizes, coordinates in bound, no overlapping
    const occupied = new Set<string>();
    for (const ship of ships) {
        if (!ship.coordinates || ship.coordinates.length !== ship.size) {
            return { valid: false, reason: `Ship ${ship.id} coordinates length mismatch` };
        }
        for (const c of ship.coordinates) {
            if (c.x < 0 || c.x >= boardSize || c.y < 0 || c.y >= boardSize) {
                return { valid: false, reason: `Ship ${ship.id} has out-of-bounds coordinate` };
            }
            const key = `${c.x},${c.y}`;
            if (occupied.has(key)) {
                return { valid: false, reason: `Ship ${ship.id} overlaps another ship` };
            }
            occupied.add(key);
        }
    }
    return { valid: true };
}

export function markShipsOnBoard(board: Cell[][], ships: Ship[]) {
    for (const ship of ships) {
        for (const c of ship.coordinates) {
            const cell = board[c.x][c.y];
            if (cell) cell.hasShip = true;
        }
    }
}

export function checkShotHit(ships: Ship[], x: number, y: number): { hit: boolean; ship?: Ship; sunk?: boolean } {
    for (const ship of ships) {
        for (const coord of ship.coordinates) {
            if (coord.x === x && coord.y === y) {
                // mark hit on ship coordinates by leaving coordinates and using sunk calculation elsewhere
                // We'll consider a hit; sunk calculation should be called after marking this shot
                return { hit: true, ship: ship, sunk: false };
            }
        }
    }
    return { hit: false };
}

export function isShipSunk(ship: Ship, shots: Shot[]): boolean {
    return ship.coordinates.every(c => shots.some(s => s.x === c.x && s.y === c.y));
}

export function broadcastGameUpdate(roomId: string, io: Server) {
    const room = getRoom(roomId);
    if (!room) return;

    const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
    // console.log(socketsInRoom);

    for (const socketId of socketsInRoom) {
        const playerId = socketToPlayer.get(socketId);
        if (!playerId) continue;

        if (room.game) {
            const personalState = getPlayerState(room.game, playerId);
            io.to(socketId).emit("player_state_update", personalState);
        }

    }
}

export function checkCollision(
    roomId: string,
    io: Server
): { success: boolean; error?: string } {
    const room = rooms[roomId];
    const game = room?.game;

    if (!room || !game) return { success: false, error: "Game not found" };

    // key: "x,y"  | value: list ship info
    const occupied = new Map<
        string,
        { playerId: string; ship: Ship }[]
    >();

    // Gom tất cả tọa độ của tất cả tàu
    for (const player of game.players) {
        for (const ship of player.ships) {
            for (const c of ship.coordinates) {
                const key = `${c.x},${c.y}`;
                if (!occupied.has(key)) occupied.set(key, []);
                occupied.get(key)?.push({ playerId: player.playerId, ship });
            }
        }
    }

    // Check collision: ô nào có >= 2 tàu
    for (const [key, list] of occupied.entries()) {
        if (list.length < 2) continue; // không collision
        // console.log("COLLISION:", key, list);


        const [x, y] = key.split(",").map(Number);

        // Collision = auto hit
        const hit = true;

        // Ghi vào tất cả player
        game.players.forEach(p => {
            p.shotsReceived.push({
                x,
                y,
                hit,
                firedAt: Date.now(),
                targetPlayerId: undefined, // vì đây là collision tự nhiên
            });
        });

        // Kiểm tra từng tàu trong list
        list.forEach(({ playerId, ship }) => {
            const playerState = game.players.find(p => p.playerId === playerId);
            if (!playerState) return;

            const isSunk = isShipSunk(ship, playerState.shotsReceived);

            if (isSunk) {
                ship.sunk = true;

                // Báo sunk cho tất cả player
                game.players.forEach(ps => {
                    if(ps.playerId===playerId) return
                    ps.sunkEnemyShips.push(ship);
                });
            }

            // Kiểm tra player die
            checkPlayerOut(game, playerId);
        });
    }
    if (io) {
        game.turn = room.players[Math.floor(Math.random() * room.players.length)].id;
        io.to(roomId).emit("room_update", {
            room: getSafeRoom(room),
            players: room.players
        });

        const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
        for (const socketId of socketsInRoom) {
            const playerId = socketToPlayer.get(socketId);
            if (!playerId) continue;

            const personalState = getPlayerState(room.game!, playerId);
            io.to(socketId).emit("player_state_update", { playerState: personalState });
        }
    }
    return { success: true };
}
