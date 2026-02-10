import { dbRef, dbSet, dbGet, dbUpdate } from '../lib/firebase';
import { dealCards } from './deck';
import type { RoomData, OnlinePlayer, PlayerId } from '../types/onlineTypes';
import type { Card } from '../types/game';

// Characters for room ID generation (no confusing chars like 0/O, 1/I/L)
const ROOM_ID_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Generate a random 4-character room ID
 */
export function generateRoomId(): string {
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += ROOM_ID_CHARS.charAt(Math.floor(Math.random() * ROOM_ID_CHARS.length));
    }
    return result;
}

/**
 * Check if a room exists
 */
export async function checkRoomExists(roomId: string): Promise<boolean> {
    const snapshot = await dbGet(dbRef(`rooms/${roomId}`));
    return snapshot.exists();
}

/**
 * Create a new room
 */
export async function createRoom(playerName: string): Promise<{ roomId: string; playerId: PlayerId }> {
    // Generate unique room ID
    let roomId = generateRoomId();
    let attempts = 0;

    while (await checkRoomExists(roomId) && attempts < 10) {
        roomId = generateRoomId();
        attempts++;
    }

    // Deal initial cards
    const { player1Hand, player2Hand, moleCard, innocentCard } = dealCards();

    // Create P1 data
    const p1: OnlinePlayer = {
        id: 'P1',
        name: playerName,
        connected: true,
        jades: 0,
        hand: player1Hand,
        table: [],
    };

    // Initial room data
    const roomData: RoomData = {
        gameState: 'WAITING',
        turn: 'P1',
        roundNumber: 1,
        startPlayer: 'P1',
        players: {
            P1: p1,
            P2: null,
        },
        board: {
            moleCard,
            innocentCard,
        },
        logs: [{
            playerId: 'P1',
            action: 'join',
            message: `${playerName} created the room`,
            timestamp: Date.now(),
        }],
        createdAt: Date.now(),
        // Store P2's hand separately (will be assigned when P2 joins)
        _p2Hand: player2Hand as unknown,
    } as RoomData & { _p2Hand: Card[] };

    await dbSet(dbRef(`rooms/${roomId}`), roomData);

    return { roomId, playerId: 'P1' };
}

/**
 * Join an existing room
 */
export async function joinRoom(
    roomId: string,
    playerName: string
): Promise<{ success: boolean; error?: string; playerId?: PlayerId }> {
    const snapshot = await dbGet(dbRef(`rooms/${roomId}`));

    if (!snapshot.exists()) {
        return { success: false, error: 'Room not found. Check the code and try again.' };
    }

    const roomData = snapshot.val() as RoomData & { _p2Hand?: Card[] };

    // Check if P2 slot is taken (P2 could be null, undefined, or an object)
    const p2Exists = roomData.players?.P2 != null;

    if (p2Exists) {
        // Check if P2 is actually connected - if not, they might have left
        if (roomData.players.P2?.connected === false) {
            // P2 disconnected, allow rejoining by resetting P2
            console.log('P2 was disconnected, allowing rejoin');
        } else if (roomData.players.P2?.connected === true) {
            return { success: false, error: 'Room is full. The host should create a new room.' };
        }
    }

    // Check game state - allow joining if waiting or if P2 disconnected
    if (roomData.gameState !== 'WAITING' && roomData.players?.P2?.connected === true) {
        return { success: false, error: 'Game already in progress. Ask the host to create a new room.' };
    }

    // Create P2 data with pre-dealt hand
    const p2: OnlinePlayer = {
        id: 'P2',
        name: playerName,
        connected: true,
        jades: 0,
        hand: roomData._p2Hand || [],
        table: [],
    };

    // Update room with P2 and start game
    await dbUpdate(dbRef(`rooms/${roomId}`), {
        'players/P2': p2,
        'gameState': 'PLAYING',
        '_p2Hand': null, // Clear temporary storage
    });

    // Add log entry
    const newLog = {
        playerId: 'P2',
        action: 'join',
        message: `${playerName} joined the room`,
        timestamp: Date.now(),
    };

    const logs = [...(roomData.logs || []), newLog];
    await dbUpdate(dbRef(`rooms/${roomId}`), { logs });

    return { success: true, playerId: 'P2' };
}

/**
 * Reset a room (delete and allow reuse)
 */
export async function resetRoom(roomId: string): Promise<void> {
    await dbSet(dbRef(`rooms/${roomId}`), null);
}

/**
 * Leave/disconnect from a room
 */
export async function leaveRoom(roomId: string, playerId: PlayerId): Promise<void> {
    await dbUpdate(dbRef(`rooms/${roomId}/players/${playerId}`), {
        connected: false,
    });
}

/**
 * Delete a room (for cleanup)
 */
export async function deleteRoom(roomId: string): Promise<void> {
    await dbSet(dbRef(`rooms/${roomId}`), null);
}
