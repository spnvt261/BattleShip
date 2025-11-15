import { Game, Room, Shot } from "../types";

export function nextTurn(game: Game, currentPlayerId: string): string {
  const [p1, p2] = game.players;
  const next = p1.playerId === currentPlayerId ? p2.playerId : p1.playerId;
  game.turn = next;
  return next;
}

export function checkEndGame(game: Game): { ended: boolean; winnerId?: string } {
  // if any player's ships are all sunk -> game ends
  const [p1, p2] = game.players;
  const p1AllSunk = p1.ships.every(s => s.sunk);
  const p2AllSunk = p2.ships.every(s => s.sunk);
  if (p1AllSunk && !p2AllSunk) {
    return { ended: true, winnerId: p2.playerId };
  }
  if (p2AllSunk && !p1AllSunk) {
    return { ended: true, winnerId: p1.playerId };
  }
  if (p1AllSunk && p2AllSunk) {
    // tie not expected in battleship, but handle as ended with no winner
    return { ended: true };
  }
  return { ended: false };
}

export function checkEndGameOneBoardMode(game: Game,room:Room): { ended: boolean; winnerId?: string } {
  // if any player's ships are all sunk -> game ends
  if(game.players.filter(p=>p.isDie).length===(room.roomPlayerNumber-1)){
    return {ended:true,winnerId:game.players.find(p=>!p.isDie)?.playerId}
  }
  return { ended: false };
}

export function checkPlayerOut(game:Game,playerId:string){
  const player = game.players.find(p=>p.playerId===playerId);
  if(!player){
    throw "Player Not Found"
  }
  const playerAllSunk = player.ships.every(s => s.sunk);
  if(playerAllSunk){
    player.isDie=true;
    console.log('playerOut:',playerId);
  }
}


export function recordShot(shots: Shot[], x: number, y: number, hit: boolean, targetPlayerId?: string) {
  shots.push({ x, y, hit, targetPlayerId, firedAt: Date.now() });
}
