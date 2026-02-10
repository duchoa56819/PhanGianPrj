import { useState, useEffect, useCallback } from 'react';
import { dbRef, dbOnValue, dbUpdate, dbOnDisconnect } from '../lib/firebase';
import { dealCards } from '../utils/deck';
import { getValidClues } from '../utils/clues';
import type { RoomData, PlayerId, OnlinePlayer, LogEntry } from '../types/onlineTypes';
import type { Card, Clue, CardColor, CardNumber } from '../types/game';

interface UseOnlineGameReturn {
    // State
    roomData: RoomData | null;
    isLoading: boolean;
    error: string | null;
    myPlayer: OnlinePlayer | null;
    opponentPlayer: OnlinePlayer | null;
    isMyTurn: boolean;
    validClues: Clue[];

    // Actions
    playCard: (card: Card) => Promise<void>;
    confirmClue: (clue: Clue) => Promise<void>;
    cancelCardSelection: () => Promise<void>;
    startAccuse: () => void;
    submitAccuse: (color: CardColor, number: CardNumber) => Promise<void>;
    cancelAccuse: () => void;
    nextRound: () => Promise<void>;

    // UI State
    selectedCard: Card | null;
    isAccusing: boolean;
}

export function useOnlineGame(roomId: string, playerId: PlayerId): UseOnlineGameReturn {
    const [roomData, setRoomData] = useState<RoomData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [isAccusing, setIsAccusing] = useState(false);

    // Subscribe to room updates
    useEffect(() => {
        const roomRef = dbRef(`rooms/${roomId}`);

        const unsubscribe = dbOnValue(roomRef, (snapshot) => {
            if (snapshot.exists()) {
                setRoomData(snapshot.val() as RoomData);
                setError(null);
            } else {
                setError('Room not found');
            }
            setIsLoading(false);
        }, (err) => {
            setError(err.message);
            setIsLoading(false);
        });

        // Set up presence (mark as disconnected when leaving)
        const playerRef = dbRef(`rooms/${roomId}/players/${playerId}/connected`);
        dbUpdate(dbRef(`rooms/${roomId}/players/${playerId}`), { connected: true });
        dbOnDisconnect(playerRef).set(false);

        return () => unsubscribe();
    }, [roomId, playerId]);

    // Derived state
    const myPlayer = roomData?.players[playerId] || null;
    const opponentId: PlayerId = playerId === 'P1' ? 'P2' : 'P1';
    const opponentPlayer = roomData?.players[opponentId] || null;
    const isMyTurn = roomData?.turn === playerId && roomData?.gameState === 'PLAYING';

    // Calculate valid clues when a card is selected - only clues about the played card
    // Filter out clues that this player has already used in previous turns
    const previousClues = (roomData?.logs || [])
        .filter(log => log.playerId === playerId && log.action === 'clue' && log.clue)
        .map(log => log.clue!);
    const validClues = selectedCard && myPlayer
        ? getValidClues(myPlayer.hand || [], myPlayer.table || [], selectedCard, previousClues)
        : [];

    // Play a card from hand to table
    const playCard = useCallback(async (card: Card) => {
        console.log('playCard called:', {
            card,
            hasRoomData: !!roomData,
            hasMyPlayer: !!myPlayer,
            isMyTurn,
            roomTurn: roomData?.turn,
            playerId,
            gameState: roomData?.gameState
        });

        if (!roomData || !myPlayer) {
            console.log('playCard: roomData or myPlayer is missing');
            return;
        }

        if (!isMyTurn) {
            console.log('playCard: Not my turn - roomData.turn:', roomData.turn, 'playerId:', playerId);
            return;
        }

        // Ensure arrays exist (Firebase returns null for empty arrays)
        const currentHand = myPlayer.hand || [];
        const currentTable = myPlayer.table || [];

        const newHand = currentHand.filter(c => c.id !== card.id);
        const newTable = [...currentTable, card];

        console.log('playCard: updating Firebase with', { newHand, newTable });

        await dbUpdate(dbRef(`rooms/${roomId}/players/${playerId}`), {
            hand: newHand,
            table: newTable,
        });

        setSelectedCard(card);
        console.log('playCard: card selected', card);
    }, [roomData, myPlayer, isMyTurn, roomId, playerId]);

    // Confirm clue and switch turns
    const confirmClue = useCallback(async (clue: Clue) => {
        if (!roomData || !selectedCard) return;

        const newLog: LogEntry = {
            playerId,
            action: 'clue',
            message: `${myPlayer?.name} played ${selectedCard.color} ${selectedCard.number} and said: "${clue.text}"`,
            cardPlayed: selectedCard,
            clue,
            timestamp: Date.now(),
        };

        const nextTurn: PlayerId = playerId === 'P1' ? 'P2' : 'P1';

        await dbUpdate(dbRef(`rooms/${roomId}`), {
            turn: nextTurn,
            logs: [...(roomData.logs || []), newLog],
        });

        setSelectedCard(null);
    }, [roomData, selectedCard, playerId, myPlayer, roomId]);

    // Cancel card selection (move card back)
    const cancelCardSelection = useCallback(async () => {
        if (!selectedCard || !myPlayer) return;

        // Ensure arrays exist (Firebase returns null for empty arrays)
        const currentTable = myPlayer.table || [];
        const currentHand = myPlayer.hand || [];

        const newTable = currentTable.filter(c => c.id !== selectedCard.id);
        const newHand = [...currentHand, selectedCard];

        await dbUpdate(dbRef(`rooms/${roomId}/players/${playerId}`), {
            hand: newHand,
            table: newTable,
        });

        setSelectedCard(null);
    }, [selectedCard, myPlayer, roomId, playerId]);

    // Start accusation
    const startAccuse = useCallback(() => {
        setIsAccusing(true);
    }, []);

    // Submit accusation
    const submitAccuse = useCallback(async (color: CardColor, number: CardNumber) => {
        if (!roomData) return;

        const moleCard = roomData.board.moleCard;
        const isCorrect = moleCard.color === color && moleCard.number === number;

        // Update jades
        const updates: Record<string, unknown> = {};

        if (isCorrect) {
            updates[`players/${playerId}/jades`] = (myPlayer?.jades || 0) + 2;
        } else {
            updates[`players/${opponentId}/jades`] = (opponentPlayer?.jades || 0) + 1;
        }

        // Check for winner
        const myNewJades = isCorrect ? (myPlayer?.jades || 0) + 2 : (myPlayer?.jades || 0);
        const oppNewJades = !isCorrect ? (opponentPlayer?.jades || 0) + 1 : (opponentPlayer?.jades || 0);

        let newGameState: string = 'ROUND_END';
        if (myNewJades >= 3 || oppNewJades >= 3) {
            newGameState = 'FINISHED';
        }

        // Add log
        const newLog: LogEntry = {
            playerId,
            action: 'accuse',
            message: `${myPlayer?.name} accused ${color} ${number} - ${isCorrect ? 'CORRECT!' : 'Wrong!'}`,
            accuseGuess: { color, number },
            accuseResult: isCorrect ? 'correct' : 'wrong',
            timestamp: Date.now(),
        };

        updates['gameState'] = newGameState;
        updates['logs'] = [...(roomData.logs || []), newLog];

        await dbUpdate(dbRef(`rooms/${roomId}`), updates);

        setIsAccusing(false);
    }, [roomData, playerId, myPlayer, opponentPlayer, opponentId, roomId]);

    // Cancel accusation
    const cancelAccuse = useCallback(() => {
        setIsAccusing(false);
    }, []);

    // Start next round
    const nextRound = useCallback(async () => {
        if (!roomData) return;

        const { player1Hand, player2Hand, moleCard, innocentCard } = dealCards();

        const newStartPlayer: PlayerId = roomData.startPlayer === 'P1' ? 'P2' : 'P1';

        await dbUpdate(dbRef(`rooms/${roomId}`), {
            gameState: 'PLAYING',
            turn: newStartPlayer,
            startPlayer: newStartPlayer,
            roundNumber: roomData.roundNumber + 1,
            'players/P1/hand': player1Hand,
            'players/P1/table': [],
            'players/P2/hand': player2Hand,
            'players/P2/table': [],
            'board/moleCard': moleCard,
            'board/innocentCard': innocentCard,
        });
    }, [roomData, roomId]);

    return {
        roomData,
        isLoading,
        error,
        myPlayer,
        opponentPlayer,
        isMyTurn,
        validClues,
        playCard,
        confirmClue,
        cancelCardSelection,
        startAccuse,
        submitAccuse,
        cancelAccuse,
        nextRound,
        selectedCard,
        isAccusing,
    };
}
