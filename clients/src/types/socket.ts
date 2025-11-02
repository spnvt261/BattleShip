import type { Game, Player, Room, Ship } from "./game";

export type ServerToClientEvents = {
  room_update: (payload: { room: Room; players: Player[] }) => void;
  game_start: (payload: { game: Game }) => void;
  hit: (payload: { x: number; y: number; playerId: string }) => void;
  miss: (payload: { x: number; y: number; playerId: string }) => void;
  game_over: (payload: { winner: string }) => void;
  chat: (msg: { roomId: string; name: string; text: string }) => void;
};

export type ClientToServerEvents = {
    create_room: (data: { name: string, playerId:string }, cb?: (res: { roomId: string }) => void) => void;
    get_room: (data: { roomId: string}, cb?: (res: { roomId: string; players: Player[];error:any }) => void) => void;
    join_room: (data: { roomId: string; name: string, playerId:string }, cb?: (res: any) => void) => void;
    leave_room: (data: { roomId: string; playerId:string }, cb?: (res: any) => void) => void;
    start_game: (payload: { roomId: string; playerId?: string }, cb: any) => void;
    place_ships: (data: { roomId: string; ships: Ship[] }, cb?: (res: any) => void) => void;
    ready: (data: { roomId: string; playerId: string }, cb?: (res: any) => void) => void;
    attack: (data: { roomId: string; x: number; y: number }, cb?: (res: any) => void) => void;
    chat: (data: { roomId: string; name: string; text: string }, cb?: (res: any) => void) => void;
};
