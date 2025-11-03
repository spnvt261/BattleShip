import type { Game, Player, Room, Ship } from "./game";

export interface InternalSocketEvents {
  reconnect_failed: () => void;
  connect_error: (err: Error) => void;
}

export type ServerToClientEvents = {
    room_update: (payload: { room: Room; players: Player[] }) => void;
    game_start: (payload: { game: Game }) => void;
    hit: (payload: { x: number; y: number; playerId: string }) => void;
    miss: (payload: { x: number; y: number; playerId: string }) => void;
    game_over: (payload: { winner: string }) => void;
    chat: (msg: { roomId: string; name: string; text: string }) => void;
};

export type ClientToServerEvents = {
    create_room: (
        data: { name: string, playerId: string },
        cb?: (res: { room: Room; playerId: string;error?:string }) => void
    ) => void;
    get_room: (
        data: { roomId: string }, 
        cb?: (res: { room?: Room; players?: Player[]; error?: string }) => void
    ) => void;
    join_room: (
        data: { roomId: string; name: string, playerId: string }, 
        cb?: (res: { ok?: boolean; error?: string; room?: Room; playerId?: string }) => void
    ) => void;
    leave_room: (
        data: { roomId: string; playerId: string }, 
        cb?: (res: { ok?: boolean; error?: string }) => void
    ) => void;
    start_game: (
        payload: { roomId: string; playerId?: string }, 
        cb?: (res: { ok?: boolean; error?: string; game?: Game }) => void
    ) => void;
    place_ships: (
        data: { roomId: string; ships: Ship[] }, 
        cb?: (res: { success: boolean; error?: string }) => void
    ) => void;
    ready: (
        data: { roomId: string; playerId: string }, 
        cb?: (res: { ok?: boolean }) => void
    ) => void;
    attack: (
        data: { roomId: string; x: number; y: number }, 
        cb?: (res: { success: boolean; error?: string }) => void
    ) => void;
    chat: (
        data: { roomId: string; name: string; text: string; playerId?: string },
        cb?: (res: { ok?: boolean }) => void
    ) => void;
};
