import { getSafeRoom, rooms } from "./roomService";
import { Game, PlayerState, Room, Ship, Shot } from "../types";
import { createEmptyBoard, validateShips, markShipsOnBoard, checkShotHit, isShipSunk } from "../utils/boardHelpers";
import { nextTurn, checkEndGame, recordShot, checkPlayerOut, checkEndGameOneBoardMode } from "../utils/gameHelpers";
import { Server } from "socket.io";
import { socketToPlayer } from "../socket";

export const getPlayerState = (game: Game, playerId: string): PlayerState | undefined => {
    if (game.status !== "playing") return undefined;
    return game.players?.find(p => p.playerId === playerId)
}

function makeId() {
    return Math.random().toString(36).substring(2, 9);
}

export function createGameForRoom(room: Room): Game {
    const id = makeId();
    const playerStates: PlayerState[] = room.players.map(p => {
        return {
            playerId: p.id,
            isDie: false,
            isReady: false,
            ships: [],
            shotsFired: [],
            shotsReceived: [],
            sunkEnemyShips: []
        }
    })
    const turn = room.players[Math.floor(Math.random() * room.players.length)].id;

    const game: Game = {
        id,
        roomId: room.id,
        players: playerStates,
        turn: room.type === "classic" ? turn : "",
        status: "placing",
        startedAt: Date.now(),
    };
    room.game = game;
    return game;
}

export function placeShips(roomId: string, playerId: string, ships: Ship[], io?: Server) {

}

export function attack(roomId: string, attackerId: string, x: number, y: number, io?: Server): { success: boolean; error?: string } {
    const room = rooms[roomId];
    if (!room || !room.game) return { success: false, error: "Game not found" };
    // console.log(attackerId);

    if (room.type === 'classic') {
        return attackInClassicMode(roomId, attackerId, x, y, io)
    }
    if (room.type === 'one_board') {
        return attackInOneBoardMode(roomId, attackerId, x, y, io)
    }
    return { success: true }
}

function attackInOneBoardMode(roomId: string, attackerId: string, x: number, y: number, io?: Server): { success: boolean; error?: string } {
    const room = rooms[roomId];
    if (!room || !room.game) return { success: false, error: "Game not found" };
    const game = room.game;
    if (game.status !== "playing") return { success: false, error: "Game not in playing state" };
    if (game.turn !== attackerId) return { success: false, error: "Not your turn" };

    const shipsOtherPlayer: Ship[] = []

    game.players.forEach(playerState => {
        shipsOtherPlayer.push(...playerState.ships)
    })

    const attackerState = game.players.find(p => p.playerId === attackerId)!;
    const attackerIndex = game.players.filter(p=>!p.isDie).findIndex(p => p.playerId === attackerId);


    if (attackerState.shotsReceived.some(s => s.x === x && s.y === y) || checkShotHit(attackerState.ships, x, y).hit) {
        return { success: false, error: "Can't shot this Coordinate" };
    }

    const hitInfo = checkShotHit(shipsOtherPlayer, x, y);
    let hit = hitInfo.hit;
    game.players.forEach(playerState => {
        if (playerState.playerId === attackerId) return
        recordShot(playerState.shotsReceived as Shot[], x, y, hit);
        // checkPlayerOut(game, playerState.playerId)
    })
    recordShot(attackerState.shotsReceived as Shot[], x, y, hit);

    let sunk = false;
    if (hit && hitInfo.ship) {
        const ship = hitInfo.ship;
        // const shotsOnTarget = attackerState.shotsFired.concat([]); 
        sunk = isShipSunk(ship, attackerState.shotsReceived);
        if (sunk) {
            const s = shipsOtherPlayer.find(ss => ss.id === ship.id && ss.playerId === ship.playerId);
            if (s) {
                s.sunk = true;
                game.players.forEach(playerState => {
                    checkPlayerOut(game, playerState.playerId)
                    if (s.playerId === playerState.playerId) return
                    playerState.sunkEnemyShips.push(s)
                })
            }

        }
    }
      if (io) {
        const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
        for (const socketId of socketsInRoom) {
            const playerId = socketToPlayer.get(socketId);
            if (!playerId) continue;

            const personalState = getPlayerState(room.game, playerId);
            io.to(socketId).emit("player_state_update", { playerState: personalState });
        }
    }
    const playerAlive = game.players.filter(p => !p.isDie)
    // check end game
    const end = checkEndGameOneBoardMode(game, room);
    console.log('shot: ',x,y + 'End: ',end);
    
    if (end.ended) {
        game.status = "ended";
        game.endedAt = Date.now();
        game.winnerId = end.winnerId;
        room.status = "finished";

        if (io) io.to(roomId).emit("game_over", { winnerId: end.winnerId });
    }
    else {
        // advance turn (simple rule: switch each time)
        game.turn = hit ? attackerId : attackerIndex === (playerAlive.length - 1) ? playerAlive[0].playerId : playerAlive[attackerIndex + 1].playerId
    }


    if(io){
         io.to(roomId).emit("room_update", {
            room: getSafeRoom(room),
            players: room.players
        });
    }


    return { success: true }
}

function attackInClassicMode(roomId: string, attackerId: string, x: number, y: number, io?: Server): { success: boolean; error?: string } {
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
    // if (targetState.board[x] && targetState.board[x][y]) targetState.board[x][y].hit = true;
    // console.log(attackerState.shotsFired);

    // record shot
    recordShot(attackerState.shotsFired as Shot[], x, y, hit, targetState.playerId);
    recordShot(targetState.shotsReceived as Shot[], x, y, hit, targetState.playerId);
    // console.log('attacker: ',attackerState.shotsFired);
    // console.log('target: ',targetState.shotsReceived,x,y,hit);


    game.turn = hit ? attackerId : targetState.playerId
    // if hit, mark ship sunk if all coordinates hit
    let sunk = false;
    if (hit && hitInfo.ship) {
        const ship = hitInfo.ship;

        // const shotsOnTarget = attackerState.shotsFired.concat([]); 
        sunk = isShipSunk(ship, targetState.shotsReceived);
        if (sunk) {
            const s = targetState.ships.find(ss => ss.id === ship.id);
            if (s) {
                s.sunk = true;
                attackerState.sunkEnemyShips.push(s)
            }

        }
    }

    // emit result to room
    if (io) {
        const payload = { x, y, hit, sunk, attackerId, targetId: targetState.playerId };
        io.to(roomId).emit(hit ? "hit" : "miss", payload);
        io.to(roomId).emit("turn_update", { playerId: game.turn });


        ///////////////////////////////
        const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
        // console.log(socketsInRoom);

        for (const socketId of socketsInRoom) {
            const playerId = socketToPlayer.get(socketId);
            if (!playerId) continue;

            const personalState = getPlayerState(room.game, playerId);
            io.to(socketId).emit("player_state_update", { playerState: personalState });
        }
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
        if (!hit) nextTurn(game, attackerId);
    }

    // broadcast room update
    if (io) io.to(roomId).emit("room_update", {
        room: getSafeRoom(room),
        players: room.players
    });

    return { success: true };
}
