export interface Player {
    id: string;
    name: string;
    isReady?: boolean;
}
export type RoomType="classic" | "one_board"
export type RoomPlayerNumber = 2|3|4
export interface Room {
    id: string;
    hostId: string;
    players: Player[];
    status: "waiting" | "playing" | "finished";
    type:RoomType
    boardSize:number;
    roomPlayerNumber:RoomPlayerNumber
    createdAt: number;
    game?: Game;
    chat?: Message[];
}

export interface Game {
    id: string;
    roomId: string;
    players: PlayerState[];
    turn: string;
    status: "placing" | "playing" | "ended";
    winnerId?: string;
    startedAt: number;
    endedAt?: number;
}

export interface PlayerState {
    playerId: string;
    board?: Cell[][];
    ships: Ship[];
    shotsFired: Shot[];
    shotsReceived: Shot[];
    sunkEnemyShips:Ship[]
    isReady: boolean;
    isDie:boolean;
}

export interface Cell {
    x: number;
    y: number;
    hasShip: boolean;
    hit: boolean;
}

export interface Ship {
    id: string;
    playerId?:string
    type: "carrier" | "battleship" | "cruiser" | "submarine" | "destroyer";
    size: number;
    coordinates: { x: number; y: number }[];
    sunk: boolean;
    image?: string;
}

export interface Shot {
    x: number;
    y: number;
    hit: boolean;
    targetPlayerId?: string;
    firedAt: number;
}

export interface Message {
    id: string;
    roomId: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: number;
}
