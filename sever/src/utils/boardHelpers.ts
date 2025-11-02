import { Cell, Ship } from "../types";

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

export function isShipSunk(ship: Ship, shots: { x: number; y: number }[]): boolean {
  return ship.coordinates.every(c => shots.some(s => s.x === c.x && s.y === c.y));
}
