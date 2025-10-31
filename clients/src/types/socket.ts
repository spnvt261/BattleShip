import type { Game, Message, Player, Room, Shot } from "./game";

// Client → Server
export interface ClientToServerEvents {
    create_room: (name: string) => void;
    join_room: (roomId: string, player: Player) => void;
    leave_room: (roomId: string) => void;
    player_ready: (roomId: string) => void;
    fire: (roomId: string, shot: Shot) => void;
    send_message: (roomId: string, msg: Message) => void;
}

// Server → Client
export interface ServerToClientEvents {
    room_created: (room: Room) => void;
    room_joined: (room: Room) => void;
    room_updated: (room: Room) => void;
    player_left: (playerId: string) => void;
    game_started: (game: Game) => void;
    turn_switched: (playerId: string) => void;
    shot_result: (result: Shot) => void;
    game_ended: (winnerId: string) => void;
    new_message: (msg: Message) => void;
}
