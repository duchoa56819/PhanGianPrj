import type { Card, CardColor, CardNumber, Clue } from './game';

// Game mode
export type GameMode = 'local' | 'online';

// Player identifiers
export type PlayerId = 'P1' | 'P2';

// Room states
export type RoomState = 'WAITING' | 'PLAYING' | 'ROUND_END' | 'FINISHED';

// Online player data
export interface OnlinePlayer {
    id: PlayerId;
    name: string;
    connected: boolean;
    jades: number;
    hand: Card[];
    table: Card[];
}

// Log entry for Firebase
export interface LogEntry {
    playerId: PlayerId;
    action: 'join' | 'clue' | 'accuse' | 'round_start';
    message: string;
    cardPlayed?: Card;
    clue?: Clue;
    accuseGuess?: { color: CardColor; number: CardNumber };
    accuseResult?: 'correct' | 'wrong';
    timestamp: number;
}

// Firebase room data structure
export interface RoomData {
    gameState: RoomState;
    turn: PlayerId;
    roundNumber: number;
    startPlayer: PlayerId;
    players: {
        P1: OnlinePlayer;
        P2: OnlinePlayer | null;
    };
    board: {
        moleCard: Card;
        innocentCard: Card;
    };
    logs: LogEntry[];
    createdAt: number;
}

// Room info for lobby display
export interface RoomInfo {
    roomId: string;
    playerId: PlayerId;
    playerName: string;
}
