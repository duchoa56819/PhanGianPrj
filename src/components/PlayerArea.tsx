import { motion } from 'framer-motion';
import { Eye, EyeOff, Gem } from 'lucide-react';
import { useState } from 'react';
import type { Player, Card as CardType } from '../types/game';
import { Card, CardBack } from './Card';

interface PlayerAreaProps {
    player: Player;
    isActive: boolean;
    isCurrentPlayer: boolean;
    onCardSelect?: (card: CardType) => void;
    selectedCard?: CardType | null;
    position: 'top' | 'bottom';
}

export function PlayerArea({
    player,
    isActive,
    isCurrentPlayer,
    onCardSelect,
    selectedCard,
    position
}: PlayerAreaProps) {
    const [isHandVisible, setIsHandVisible] = useState(true);

    // Only show hand when it's the player's turn (local multiplayer privacy)
    const shouldShowHand = isCurrentPlayer && isHandVisible;

    return (
        <motion.div
            className={`glass rounded-2xl p-4 ${position === 'top' ? 'mb-4' : 'mt-4'} 
        ${isCurrentPlayer ? 'ring-2 ring-jade' : ''}`}
            initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">
                        {player.name}
                        {isCurrentPlayer && (
                            <span className="ml-2 text-sm text-jade animate-pulse">
                                ← Your Turn
                            </span>
                        )}
                    </h3>

                    {/* Jade Count */}
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-jade/20 jade-glow">
                        <Gem className="w-4 h-4 text-jade" />
                        <span className="font-bold text-jade">{player.jades}</span>
                    </div>
                </div>

                {/* Visibility Toggle */}
                {isCurrentPlayer && (
                    <button
                        onClick={() => setIsHandVisible(!isHandVisible)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated 
              hover:bg-surface-card transition-colors text-sm"
                    >
                        {isHandVisible ? (
                            <>
                                <EyeOff className="w-4 h-4" />
                                Hide Hand
                            </>
                        ) : (
                            <>
                                <Eye className="w-4 h-4" />
                                Show Hand
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Played Cards (Table) */}
            {player.table.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                        Played Cards
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {player.table.map((card) => (
                            <Card
                                key={card.id}
                                card={card}
                                disabled
                                size="sm"
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Hand */}
            <div>
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                    Hand ({player.hand.length} cards)
                </p>
                <div className="flex flex-wrap gap-2">
                    {shouldShowHand ? (
                        player.hand.map((card) => (
                            <Card
                                key={card.id}
                                card={card}
                                onClick={() => isActive && onCardSelect?.(card)}
                                selected={selectedCard?.id === card.id}
                                disabled={!isActive}
                            />
                        ))
                    ) : (
                        player.hand.map((card) => (
                            <CardBack key={card.id} />
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
}
