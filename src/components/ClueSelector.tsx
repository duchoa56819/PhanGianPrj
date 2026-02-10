import { motion } from 'framer-motion';
import { Check, X, MessageCircle } from 'lucide-react';
import type { Clue } from '../types/game';

interface ClueSelectorProps {
    clues: Clue[];
    onSelect: (clue: Clue) => void;
    onCancel: () => void;
}

export function ClueSelector({ clues, onSelect, onCancel }: ClueSelectorProps) {
    const getClueIcon = (type: string) => {
        switch (type) {
            case 'color': return '🎨';
            case 'number': return '🔢';
            case 'sequence': return '📈';
            default: return '💬';
        }
    };

    return (
        <motion.div
            className="glass rounded-2xl p-6 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-jade" />
                <h3 className="text-lg font-semibold text-white">Select a Clue to Give</h3>
            </div>

            <p className="text-sm text-gray-400 mb-4">
                Choose one of these truthful statements about your cards:
            </p>

            {clues.length === 0 ? (
                <p className="text-gray-400 text-center py-4">
                    No valid clues available. You need at least 2 cards of the same color/number or a sequence of 3+ numbers.
                </p>
            ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {clues.map((clue, index) => (
                        <motion.button
                            key={`${clue.type}-${index}`}
                            onClick={() => onSelect(clue)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl 
                bg-surface-elevated hover:bg-jade/20 border border-transparent hover:border-jade/50
                text-left transition-all duration-200"
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="text-2xl">{getClueIcon(clue.type)}</span>
                            <div className="flex-1">
                                <p className="text-white font-medium">"{clue.text}"</p>
                                <p className="text-xs text-gray-400 capitalize">{clue.type} clue</p>
                            </div>
                            <Check className="w-5 h-5 text-jade opacity-0 group-hover:opacity-100" />
                        </motion.button>
                    ))}
                </div>
            )}

            <div className="flex justify-end mt-4">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg 
            bg-surface-elevated hover:bg-red-500/20 text-gray-300 hover:text-red-400
            transition-all duration-200"
                >
                    <X className="w-4 h-4" />
                    Cancel
                </button>
            </div>
        </motion.div>
    );
}
