# Battleship — Backend realtime (Node.js + TypeScript + Socket.IO)

Tài liệu ngắn gọn bằng tiếng Việt để bạn (dev) dễ đọc, hiểu luồng hoạt động và cách chạy / mở rộng code.

## Tổng quan

Đây là backend realtime cho trò chơi Battleship. Dự án dùng Node.js + TypeScript và Socket.IO để giao tiếp realtime giữa client và server. Toàn bộ trạng thái (rooms, game, chat) được lưu trong RAM — không dùng database.

Mục tiêu: cho phép 2 người chơi tạo/join phòng, đặt tàu, bắn nhau, chat realtime và kết thúc trận đấu.

## Công nghệ sử dụng
- Node.js (runtime)
- TypeScript (kiểm tra kiểu)
- Express (HTTP, có 1 endpoint đơn giản để kiểm tra server chạy)
- Socket.IO (realtime bi-directional)
- dotenv (cấu hình PORT)

## Cấu trúc dự án (quan trọng)

backend (thư mục `sever/` trong workspace)

```
sever/
├── package.json
├── tsconfig.json
├── .env
└── src/
    ├── index.ts          # Entry: khởi tạo Express + Socket.IO
    ├── socket.ts         # Đăng ký tất cả socket event handlers
    ├── types.ts          # Interface TypeScript: Player, Room, Game, Ship, Shot, Cell, Message
    ├── services/
    │   ├── roomService.ts
    │   ├── gameService.ts
    │   └── chatService.ts
    └── utils/
        ├── boardHelpers.ts
        └── gameHelpers.ts
```

Các file chính:
- `src/types.ts` — định nghĩa giao diện dữ liệu (player, room, game ...)
- `src/services/roomService.ts` — tạo/join/leave phòng, set ready, giữ `rooms` trong RAM
- `src/services/gameService.ts` — logic đặt tàu, bắn, kiểm tra trúng/trượt/sunk, kết thúc game
- `src/services/chatService.ts` — lưu message vào `room.chat` và broadcast
- `src/utils/boardHelpers.ts` — helper thao tác board, validate ships, check hit/sunk
- `src/utils/gameHelpers.ts` — xác định lượt kế tiếp, check end game
- `src/socket.ts` — ánh xạ Socket.IO events <-> dịch vụ
- `src/index.ts` — khởi tạo server

## Luồng event (Socket.IO)

Server/Client dùng các event chính sau:

Client → Server:
- `create_room` { name } → server trả về `{ roomId }` và socket join room
- `join_room` { roomId, name } → server thêm player vào room (max 2)
- `place_ships` { roomId, ships } → gửi mảng `Ship` sau khi người chơi đặt tàu
- `ready` { roomId, playerId } → cập nhật ready; nếu cả 2 ready sẽ khởi tạo game
- `attack` { roomId, x, y } → người chơi bắn ô (x,y)
- `chat` { roomId, text, name } → gửi tin nhắn chat
- `leave_room` { roomId } → rời phòng

Server → Client:
- `room_update` { room, players } — gửi khi trạng thái phòng thay đổi
- `game_start` { game } — khi game bắt đầu (sau cả 2 ready hoặc đặt xong)
- `hit` / `miss` { x, y, hit, sunk, attackerId, targetId } — kết quả lượt bắn
- `game_over` { winnerId } — khi có người thắng
- `chat` { message } — broadcast message mới trong room

Lưu ý: client nên lắng nghe `room_update` để cập nhật UI phòng (danh sách người chơi, trạng thái ready, game status ...).

## State lưu trong RAM

File `src/services/roomService.ts` export một object:

```ts
export const rooms: { [roomId: string]: Room } = {};
```

Mỗi `Room` có thể chứa `game?: Game` và `chat?: Message[]`. Khi server restart, mọi state mất. Đây là thiết kế đơn giản cho demo/local.

## Cách chạy (dev & build)

1. Mở PowerShell, chuyển đến thư mục `sever`:

```powershell
cd d:\Projects\BattleShip\sever
```

2. Cài dependencies:

```powershell
npm install
```

3. Chạy ở chế độ phát triển (hot reload):

```powershell
npm run dev
```

4. Build production và chạy:

```powershell
npm run build
npm start
```

Mặc định server lắng nghe biến môi trường `PORT` (cấu hình trong `.env`, ví dụ `PORT=3000`).

## Cách đọc/hiểu code nhanh

- Bắt đầu từ `src/index.ts` — khởi tạo server và gọi `initSockets(io)`.
- Mở `src/socket.ts` — ở đây định nghĩa listener cho các event từ client. Mỗi event gọi service tương ứng.
- `roomService` giữ `rooms` trong RAM. Tìm logic tạo phòng, join, leave, setReady. Khi ready và đủ 2 người thì gọi tạo game.
- `gameService` thực hiện: tạo game, lưu ship của mỗi người, đánh dấu ô bị bắn, kiểm tra hit/miss/sunk, xác định end game.
- `chatService` chỉ lưu message vào `room.chat` và phát `chat` cho toàn bộ room.

## Cách build chức năng mới — hướng dẫn ngắn

1. Nếu muốn thêm rule mới (ví dụ: cho phép bắn tiếp khi trúng):
   - Mở `src/services/gameService.ts` → tìm hàm `attack`.
   - Chỉnh logic sau khi xử lý `hit`: nếu `hit` thì không gọi `nextTurn`, vẫn giữ `game.turn = attackerId`.

2. Nếu muốn validate hình dạng tàu (phải thẳng, không L-shape):
   - Mở `src/utils/boardHelpers.ts` → hàm `validateShips` hiện còn đơn giản.
   - Thêm kiểm tra: các coordinates của ship phải cùng x hoặc cùng y, và liên tiếp.

3. Nếu muốn lưu nhiều phòng hơn (scale) hoặc duy trì sau restart:
   - Thêm database (Redis for in-memory persistence, hoặc Postgres) và chuyển chỗ lưu `rooms` sang service tương ứng.

4. Muốn thêm tests:
   - Thêm jest hoặc vitest, viết unit test cho `boardHelpers` và `gameService.attack`.

## Lưu ý về bảo mật & production

- Vì state trong RAM, deploy nhiều instance (horizontal scaling) cần đồng bộ state (sử dụng Redis hoặc DB chung).
- Xác thực: Hiện tại server dùng socket.id làm playerId và không có cơ chế auth. Thêm JWT nếu cần xác thực.
- Rate limit / anti-cheat: cần validate input từ client (ví dụ coordinates trong khoảng hợp lệ) và chống replay.

## Ví dụ ngắn interaction (pseudo)

1) Player A tạo phòng: `create_room { name: "Alice" }` → server trả `{ roomId }
2) Player B join: `join_room { roomId, name: "Bob" }`
3) Cả hai gửi `place_ships` với mảng ship.
4) Mỗi người gọi `ready` → server gửi `game_start` khi cả 2 ready.
5) Alice bắn: `attack { roomId, x: 3, y: 5 }` → server emit `hit` hoặc `miss` cho room.
6) Khi một bên tất cả ship `sunk` → server emit `game_over { winnerId }`.

## Gợi ý mở rộng
- Thêm API REST để lấy lịch sử phòng (từ DB) hoặc trạng thái hiện tại.
- Thêm replay: lưu danh sách actions trong `room.game` để replay sau này.
- Thêm log/metrics (pino, prom-client).

---

Nếu bạn muốn, tôi có thể tiếp tục và: 
- Viết 1 client demo (HTML + JS) để test realtime.
- Tạo unit tests cho `boardHelpers` và `gameService`.
- Thêm validations chặt hơn cho ship placement.

Bạn muốn mình làm tiếp phần nào? Chỉ định 1-2 mục ưu tiên và tôi sẽ triển khai.
