import { create } from 'zustand';
import type { GameState, GameActions, Player, Card, Clue, CardColor, CardNumber, HistoryEntry } from '../types/game';
import { dealCards } from '../utils/deck';

interface GameStore extends GameState, GameActions { }

const createInitialPlayer = (id: 1 | 2, hand: Card[]): Player => ({
    id,
    name: `Player ${id}`,
    hand,
    table: [],
    jades: 0,
});

export const useGameStore = create<GameStore>((set, get) => ({
    // Initial state
    players: [
        createInitialPlayer(1, []),
        createInitialPlayer(2, []),
    ],
    moleCard: null,
    innocentCard: null,
    currentPlayer: 1,
    startPlayer: 1,
    phase: 'setup',
    historyLog: [],
    selectedCard: null,
    winner: null,
    roundNumber: 1,

    // Actions
    initGame: () => {
        const { player1Hand, player2Hand, moleCard, innocentCard } = dealCards();

        set({
            players: [
                createInitialPlayer(1, player1Hand),
                createInitialPlayer(2, player2Hand),
            ],
            moleCard,
            innocentCard,
            currentPlayer: 1,
            startPlayer: 1,
            phase: 'playing',
            historyLog: [],
            selectedCard: null,
            winner: null,
            roundNumber: 1,
        });
    },

    selectCardToPlay: (card: Card) => {
        const state = get();
        const playerIndex = state.currentPlayer - 1;
        const player = state.players[playerIndex];

        // Verify card is in player's hand
        if (!player.hand.find(c => c.id === card.id)) return;

        // Move card from hand to table
        const newHand = player.hand.filter(c => c.id !== card.id);
        const newTable = [...player.table, card];

        const newPlayers = [...state.players] as [Player, Player];
        newPlayers[playerIndex] = {
            ...player,
            hand: newHand,
            table: newTable,
        };

        set({
            players: newPlayers,
            selectedCard: card,
            phase: 'selectingClue',
        });
    },

    confirmClue: (clue: Clue) => {
        const state = get();
        const { currentPlayer, selectedCard } = state;

        // Add to history
        const entry: HistoryEntry = {
            playerId: currentPlayer,
            action: 'clue',
            cardPlayed: selectedCard || undefined,
            clue,
            timestamp: Date.now(),
        };

        // Switch turns
        const nextPlayer = currentPlayer === 1 ? 2 : 1;

        set({
            historyLog: [...state.historyLog, entry],
            currentPlayer: nextPlayer as 1 | 2,
            selectedCard: null,
            phase: 'playing',
        });
    },

    cancelCardSelection: () => {
        const state = get();
        const { selectedCard, currentPlayer } = state;

        if (!selectedCard) return;

        // Move card back from table to hand
        const playerIndex = currentPlayer - 1;
        const player = state.players[playerIndex];

        const newTable = player.table.filter(c => c.id !== selectedCard.id);
        const newHand = [...player.hand, selectedCard];

        const newPlayers = [...state.players] as [Player, Player];
        newPlayers[playerIndex] = {
            ...player,
            hand: newHand,
            table: newTable,
        };

        set({
            players: newPlayers,
            selectedCard: null,
            phase: 'playing',
        });
    },

    startAccuse: () => {
        set({ phase: 'accusing' });
    },

    submitAccuse: (color: CardColor, number: CardNumber) => {
        const state = get();
        const { moleCard, currentPlayer } = state;

        if (!moleCard) return;

        const isCorrect = moleCard.color === color && moleCard.number === number;

        // Update jades
        const newPlayers = [...state.players] as [Player, Player];
        if (isCorrect) {
            newPlayers[currentPlayer - 1].jades += 2;
        } else {
            const opponentIndex = currentPlayer === 1 ? 1 : 0;
            newPlayers[opponentIndex].jades += 1;
        }

        // Add to history
        const entry: HistoryEntry = {
            playerId: currentPlayer,
            action: 'accuse',
            accuseGuess: { color, number },
            accuseResult: isCorrect ? 'correct' : 'wrong',
            timestamp: Date.now(),
        };

        // Check for winner
        let winner: 1 | 2 | null = null;
        if (newPlayers[0].jades >= 3) winner = 1;
        if (newPlayers[1].jades >= 3) winner = 2;

        set({
            players: newPlayers,
            historyLog: [...state.historyLog, entry],
            phase: winner ? 'gameOver' : 'roundEnd',
            winner,
        });
    },

    cancelAccuse: () => {
        set({ phase: 'playing' });
    },

    nextRound: () => {
        const state = get();
        const { player1Hand, player2Hand, moleCard, innocentCard } = dealCards();

        // Swap start player
        const newStartPlayer = state.startPlayer === 1 ? 2 : 1;

        set({
            players: [
                { ...state.players[0], hand: player1Hand, table: [] },
                { ...state.players[1], hand: player2Hand, table: [] },
            ],
            moleCard,
            innocentCard,
            currentPlayer: newStartPlayer as 1 | 2,
            startPlayer: newStartPlayer as 1 | 2,
            phase: 'playing',
            selectedCard: null,
            roundNumber: state.roundNumber + 1,
        });
    },

    resetGame: () => {
        const { player1Hand, player2Hand, moleCard, innocentCard } = dealCards();

        set({
            players: [
                createInitialPlayer(1, player1Hand),
                createInitialPlayer(2, player2Hand),
            ],
            moleCard,
            innocentCard,
            currentPlayer: 1,
            startPlayer: 1,
            phase: 'playing',
            historyLog: [],
            selectedCard: null,
            winner: null,
            roundNumber: 1,
        });
    },
}));
