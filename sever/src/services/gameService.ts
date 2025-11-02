import { rooms } from "./roomService";
import { Game, PlayerState, Ship, Shot } from "../types";
import { createEmptyBoard, validateShips, markShipsOnBoard, checkShotHit, isShipSunk } from "../utils/boardHelpers";
import { nextTurn, checkEndGame, recordShot } from "../utils/gameHelpers";
import { Server } from "socket.io";

function makeId() {
    return Math.random().toString(36).substring(2, 9);
}

export function createGameForRoom(room: any): Game {
    const id = makeId();
    const playerStates: [PlayerState, PlayerState] = [
        {
            playerId: room.players[0].id,
            board: createEmptyBoard(10),
            ships: [],
            shotsFired: [],
            isReady: false,
        },
        {
            playerId: room.players[1].id,
            board: createEmptyBoard(10),
            ships: [],
            shotsFired: [],
            isReady: false,
        },
    ];

    const turn = room.players[Math.floor(Math.random() * room.players.length)].id;

    const game: Game = {
        id,
        roomId: room.id,
        players: playerStates,
        turn,
        status: "placing",
        startedAt: Date.now(),
    };
    room.game = game;
    return game;
}

export function placeShips(roomId: string, playerId: string, ships: Ship[], io?: Server): { success: boolean; error?: string } {
    const room = rooms[roomId];
    if (!room) return { success: false, error: "Room not found" };
    if (!room.game) {
        // create a game in placing status
        createGameForRoom(room);
    }
    const game: Game = room.game as Game;
    const validation = validateShips(ships, 10);
    if (!validation.valid) return { success: false, error: validation.reason };

    const ps = game.players.find(p => p.playerId === playerId);
    if (!ps) return { success: false, error: "Player not found in game" };

    ps.ships = ships.map(s => ({ ...s, sunk: false }));
    // mark ships on board
    markShipsOnBoard(ps.board, ps.ships);
    ps.isReady = true;

    // if both players ready -> start playing
    if (game.players.every(p => p.isReady)) {
        game.status = "playing";
        game.startedAt = Date.now();
        // pick random turn if not set
        if (!game.turn) game.turn = game.players[Math.floor(Math.random() * 2)].playerId;
        if (io) io.to(roomId).emit("game_start", { game });
    }

    // broadcast updated room
    if (io) io.to(roomId).emit("room_update", { room, players: room.players });

    return { success: true };
}

export function attack(roomId: string, attackerId: string, x: number, y: number, io?: Server): { success: boolean; error?: string } {
    const room = rooms[roomId];
    if (!room || !room.game) return { success: false, error: "Game not found" };
    const game = room.game;
    if (game.status !== "playing") return { success: false, error: "Game not in playing state" };
    if (game.turn !== attackerId) return { success: false, error: "Not your turn" };

    const attackerState = game.players.find(p => p.playerId === attackerId)!;
    const targetState = game.players.find(p => p.playerId !== attackerId)!;

    // prevent duplicate shots at same coords by same attacker
    if (attackerState.shotsFired.some(s => s.x === x && s.y === y)) {
        return { success: false, error: "Coordinate already fired" };
    }

    // check hit
    const hitInfo = checkShotHit(targetState.ships, x, y);
    let hit = hitInfo.hit;

    // mark target board cell
    if (targetState.board[x] && targetState.board[x][y]) targetState.board[x][y].hit = true;

    // record shot
    recordShot(attackerState.shotsFired as Shot[], x, y, hit, targetState.playerId);

    // if hit, mark ship sunk if all coordinates hit
    let sunk = false;
    if (hit && hitInfo.ship) {
        const ship = hitInfo.ship;
        // if after this shot all coords are hit -> sunk
        const shotsOnTarget = attackerState.shotsFired.concat([]); // includes recent
        // check every coordinate: is there a hit recorded on target board
        sunk = isShipSunk(ship, targetState.shotsFired.map(s => ({ x: s.x, y: s.y })).concat([{ x, y }]));
        if (sunk) {
            // mark ship as sunk
            const s = targetState.ships.find(ss => ss.id === ship.id);
            if (s) s.sunk = true;
        }
    }

    // emit result to room
    if (io) {
        const payload = { x, y, hit, sunk, attackerId, targetId: targetState.playerId };
        io.to(roomId).emit(hit ? "hit" : "miss", payload);
    }

    // check end game
    const end = checkEndGame(game);
    if (end.ended) {
        game.status = "ended";
        game.endedAt = Date.now();
        game.winnerId = end.winnerId;
        room.status = "finished";
        if (io) io.to(roomId).emit("game_over", { winnerId: game.winnerId });
    } else {
        // advance turn (simple rule: switch each time)
        nextTurn(game, attackerId);
    }

    // broadcast room update
    if (io) io.to(roomId).emit("room_update", { room, players: room.players });

    return { success: true };
}
