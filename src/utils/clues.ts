import type { Card, Clue, CardColor, CardNumber } from '../types/game';

/**
 * Generates all valid clues based on a player's total cards (hand + table).
 * The clue must include/apply to the card being played.
 * 
 * Valid clue types:
 * (a) Color Count: "Tôi có [2/3/4] thẻ cùng màu [Color]." (must include played card's color)
 * (b) Number Count: "Tôi có [2/3] thẻ cùng số [Number]." (must include played card's number)
 * (c) Sequence: "Tôi có [3/4/5/6/7] thẻ liên tiếp." (must include played card's number)
 */
export function getValidClues(hand: Card[], tableCards: Card[], playedCard?: Card, previousClues: Clue[] = []): Clue[] {
    const allCards = [...hand, ...tableCards];
    const clues: Clue[] = [];

    const colorVN: Record<string, string> = {
        Red: 'đỏ',
        Yellow: 'vàng',
        Blue: 'xanh',
        Black: 'đen'
    };

    // Build a set of previously used clue keys to prevent repetition
    // - Color clues: keyed by color (e.g. "color:Red") — same color can't be reused even with different count
    // - Number clues: keyed by number (e.g. "number:3") — same number can't be reused even with different count  
    // - Sequence clues: keyed as "sequence" — any sequence clue blocks all future sequence clues
    const usedClueKeys = new Set<string>();
    for (const prev of previousClues) {
        switch (prev.type) {
            case 'color':
                if (prev.details.color) usedClueKeys.add(`color:${prev.details.color}`);
                break;
            case 'number':
                if (prev.details.number) usedClueKeys.add(`number:${prev.details.number}`);
                break;
            case 'sequence':
                usedClueKeys.add('sequence');
                break;
        }
    }

    // (a) Color Count Clues - only if played card matches this color
    const colorCounts = countByColor(allCards);
    for (const [color, count] of Object.entries(colorCounts)) {
        if (count >= 2) {
            // Skip if this color clue was already used in a previous turn
            if (usedClueKeys.has(`color:${color}`)) continue;
            // Only add if the played card matches this color (or no specific card)
            if (!playedCard || playedCard.color === color) {
                clues.push({
                    type: 'color',
                    text: `Tôi có ${count} thẻ cùng màu ${colorVN[color]}`,
                    details: {
                        color: color as CardColor,
                        count,
                    },
                });
            }
        }
    }

    // (b) Number Count Clues - only if played card matches this number
    const numberCounts = countByNumber(allCards);
    for (const [numStr, count] of Object.entries(numberCounts)) {
        if (count >= 2) {
            const num = parseInt(numStr) as CardNumber;
            // Skip if this number clue was already used in a previous turn
            if (usedClueKeys.has(`number:${num}`)) continue;
            // Only add if the played card matches this number (or no specific card)
            if (!playedCard || playedCard.number === num) {
                clues.push({
                    type: 'number',
                    text: `Tôi có ${count} thẻ cùng số ${num}`,
                    details: {
                        number: num,
                        count,
                    },
                });
            }
        }
    }

    // (c) Sequence Clues - only if played card's number is part of the sequence
    const sequences = findSequences(allCards);
    for (const seqInfo of sequences) {
        // Skip if any sequence clue was already used in a previous turn
        if (usedClueKeys.has('sequence')) continue;
        // Only add if the played card's number is in the sequence range
        if (!playedCard || (playedCard.number >= seqInfo.start && playedCard.number <= seqInfo.end)) {
            clues.push({
                type: 'sequence',
                text: `Tôi có ${seqInfo.length} thẻ liên tiếp`,
                details: {
                    sequenceLength: seqInfo.length,
                },
            });
        }
    }

    return clues;
}

/**
 * Count cards by color
 */
function countByColor(cards: Card[]): Record<CardColor, number> {
    const counts: Record<CardColor, number> = {
        Red: 0,
        Yellow: 0,
        Blue: 0,
        Black: 0,
    };

    for (const card of cards) {
        counts[card.color]++;
    }

    return counts;
}

/**
 * Count cards by number
 */
function countByNumber(cards: Card[]): Record<number, number> {
    // Numbers 1-4 for Red/Yellow/Blue, 5-7 for Black
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };

    for (const card of cards) {
        counts[card.number]++;
    }

    return counts;
}

/**
 * Find all sequences (3 or more consecutive numbers)
 * Returns array of sequence info objects with start, end, and length
 */
interface SequenceInfo {
    start: number;
    end: number;
    length: number;
}

function findSequences(cards: Card[]): SequenceInfo[] {
    // Get unique numbers present
    const numbers = new Set(cards.map(c => c.number));
    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

    if (sortedNumbers.length < 3) return [];

    const sequences: SequenceInfo[] = [];

    // Find all consecutive sequences — only keep the longest (exact) sequence per range
    let seqStart = sortedNumbers[0];
    let seqEnd = sortedNumbers[0];

    for (let i = 1; i < sortedNumbers.length; i++) {
        if (sortedNumbers[i] === sortedNumbers[i - 1] + 1) {
            seqEnd = sortedNumbers[i];
        } else {
            // Check if we have a valid sequence (3+)
            const length = seqEnd - seqStart + 1;
            if (length >= 3) {
                sequences.push({ start: seqStart, end: seqEnd, length });
            }
            seqStart = sortedNumbers[i];
            seqEnd = sortedNumbers[i];
        }
    }

    // Don't forget the last sequence
    const length = seqEnd - seqStart + 1;
    if (length >= 3) {
        sequences.push({ start: seqStart, end: seqEnd, length });
    }

    return sequences;
}

/**
 * Check if a card matches a clue criteria
 * Useful for highlighting relevant cards
 */
export function cardMatchesClue(card: Card, clue: Clue): boolean {
    switch (clue.type) {
        case 'color':
            return card.color === clue.details.color;
        case 'number':
            return card.number === clue.details.number;
        case 'sequence':
            return true; // Sequences don't highlight specific cards
        default:
            return false;
    }
}
