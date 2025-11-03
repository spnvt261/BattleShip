export interface Player {
    id: string;               // ID duy nhất (socket.id hoặc userId)
    name: string;             // Tên hiển thị của người chơi
    isReady?: boolean;        // Đã sẵn sàng bắt đầu trận chưa
}
export interface Room {
    id: string;                     // Mã phòng 
    hostId: string;                 // ID người tạo phòng
    players: Player[];              // Danh sách người chơi (tối đa 2)
    status: "waiting" | "playing" | "finished";
    createdAt: number;              // Thời gian tạo (timestamp)
    game?: Game;                    // Dữ liệu game hiện tại (nếu có)
    chat?: Message[];               // Lưu lịch sử chat (tùy chọn)
}

export interface Game {
    id: string;                       // ID trận đấu
    roomId: string;                   // ID phòng chứa trận này
    players: [PlayerState, PlayerState]; // Trạng thái 2 người chơi
    turn: string;                     // ID của người đang có lượt
    status: "placing" | "playing" | "ended";
    winnerId?: string;                // ID người thắng (sau khi end)
    startedAt: number;
    endedAt?: number;
}

export interface PlayerState {
    playerId: string;                 // Liên kết với Player.id
    board?: Cell[][];                  // Ma trận ô (10x10 hoặc tùy)
    ships: Ship[];                    // Tàu được đặt trên board
    shotsFired: Shot[];               // Các ô đã bắn
    isReady: boolean;                 // Đã đặt tàu xong chưa
}

export interface Cell {
    x: number;                        // Tọa độ cột
    y: number;                        // Tọa độ hàng
    hasShip: boolean;                 // Có tàu hay không
    hit: boolean;                     // Bị bắn trúng chưa
}

export interface Ship {
    id: string;                       // ID duy nhất cho mỗi tàu
    type: "carrier" | "battleship" | "cruiser" | "submarine" | "destroyer";
    size: number;                     // Số ô mà tàu chiếm (5, 4, 3, 3, 2)
    coordinates: { x: number; y: number }[]; // Danh sách ô mà tàu chiếm
    sunk: boolean;                    // Bị đánh chìm chưa
    image?:string;
}

export interface Shot {
    x: number;
    y: number;
    hit: boolean;                     // Có trúng tàu không
    targetPlayerId: string;           // ID người bị bắn
    firedAt: number;                  // Thời điểm bắn
}

export interface Message {
    id: string;
    roomId: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: number;
}
