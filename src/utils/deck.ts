import type { Card, CardColor, CardNumber } from '../types/game';

// Card distribution:
// Red, Yellow, Blue: numbers 1-4 (4 cards each = 12 cards)
// Black: numbers 5, 6, 7 (3 cards)
// Total: 15 cards

const STANDARD_COLORS: CardColor[] = ['Red', 'Yellow', 'Blue'];
const STANDARD_NUMBERS: CardNumber[] = [1, 2, 3, 4];
const BLACK_NUMBERS: CardNumber[] = [5, 6, 7];

/**
 * Creates a deck of 15 unique cards.
 * Red/Yellow/Blue have numbers 1-4, Black has numbers 5-7.
 */
export function createDeck(): Card[] {
    const deck: Card[] = [];

    // Add Red, Yellow, Blue cards (1-4)
    for (const color of STANDARD_COLORS) {
        for (const number of STANDARD_NUMBERS) {
            deck.push({
                id: `${color}-${number}`,
                color,
                number,
            });
        }
    }

    // Add Black cards (5, 6, 7)
    for (const number of BLACK_NUMBERS) {
        deck.push({
            id: `Black-${number}`,
            color: 'Black',
            number,
        });
    }

    return deck;
}

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffleDeck<T>(array: T[]): T[] {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

/**
 * Deal cards for a new game.
 * Returns: { player1Hand, player2Hand, moleCard, innocentCard }
 */
export function dealCards(): {
    player1Hand: Card[];
    player2Hand: Card[];
    moleCard: Card;
    innocentCard: Card;
} {
    const deck = shuffleDeck(createDeck());

    // First card is the Mole (hidden)
    const moleCard = deck[0];

    // Second card is the Innocent (revealed)
    const innocentCard = deck[1];

    // Remaining 13 cards: 7 to Player 1, 6 to Player 2
    const player1Hand = deck.slice(2, 9);  // indices 2-8 (7 cards)
    const player2Hand = deck.slice(9, 15); // indices 9-14 (6 cards)

    return {
        player1Hand,
        player2Hand,
        moleCard,
        innocentCard,
    };
}

/**
 * Get card display name
 */
export function getCardName(card: Card): string {
    return `${card.color} ${card.number}`;
}

/**
 * Get all possible card combinations for accuse UI
 */
export function getAllCardCombinations(): { color: CardColor; number: CardNumber }[] {
    const combinations: { color: CardColor; number: CardNumber }[] = [];

    // Red, Yellow, Blue cards (1-4)
    for (const color of STANDARD_COLORS) {
        for (const number of STANDARD_NUMBERS) {
            combinations.push({ color, number });
        }
    }

    // Black cards (5, 6, 7)
    for (const number of BLACK_NUMBERS) {
        combinations.push({ color: 'Black', number });
    }

    return combinations;
}
