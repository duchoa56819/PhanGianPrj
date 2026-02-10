// Card colors and numbers
export type CardColor = 'Red' | 'Yellow' | 'Blue' | 'Black';
export type CardNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Card interface
export interface Card {
    id: string;
    color: CardColor;
    number: CardNumber;
}

// Clue types
export type ClueType = 'color' | 'number' | 'sequence';

export interface Clue {
    type: ClueType;
    text: string;
    details: {
        color?: CardColor;
        number?: CardNumber;
        count?: number;
        sequenceLength?: number;
    };
}

// Player interface
export interface Player {
    id: 1 | 2;
    name: string;
    hand: Card[];
    table: Card[];
    jades: number;
}

// Game phases
export type GamePhase =
    | 'setup'
    | 'playing'
    | 'selectingCard'
    | 'selectingClue'
    | 'accusing'
    | 'roundEnd'
    | 'gameOver';

// History log entry
export interface HistoryEntry {
    playerId: 1 | 2;
    action: 'clue' | 'accuse';
    cardPlayed?: Card;
    clue?: Clue;
    accuseGuess?: { color: CardColor; number: CardNumber };
    accuseResult?: 'correct' | 'wrong';
    timestamp: number;
}

// Game state interface
export interface GameState {
    players: [Player, Player];
    moleCard: Card | null;
    innocentCard: Card | null;
    currentPlayer: 1 | 2;
    startPlayer: 1 | 2;
    phase: GamePhase;
    historyLog: HistoryEntry[];
    selectedCard: Card | null;
    winner: 1 | 2 | null;
    roundNumber: number;
}

// Store actions
export interface GameActions {
    initGame: () => void;
    selectCardToPlay: (card: Card) => void;
    confirmClue: (clue: Clue) => void;
    cancelCardSelection: () => void;
    startAccuse: () => void;
    submitAccuse: (color: CardColor, number: CardNumber) => void;
    cancelAccuse: () => void;
    nextRound: () => void;
    resetGame: () => void;
}
