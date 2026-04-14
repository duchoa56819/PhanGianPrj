import { motion } from 'framer-motion';
import { History, MessageCircle, Target, Check, X } from 'lucide-react';
import type { HistoryEntry } from '../types/game';
import { getCardName } from '../utils/deck';

interface HistoryLogProps {
    entries: HistoryEntry[];
    isOpen: boolean;
    onToggle: () => void;
}

export function HistoryLog({ entries, isOpen, onToggle }: HistoryLogProps) {
    return (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40">
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-l-xl 
          bg-surface-elevated hover:bg-surface-card transition-colors"
            >
                <History className="w-5 h-5" />
            </button>

            {/* Panel */}
            <motion.div
                className="glass rounded-xl overflow-hidden w-80"
                initial={false}
                animate={{
                    x: isOpen ? 0 : 340,
                    opacity: isOpen ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
            >
                <div className="p-4 border-b border-white/10">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Lịch Sử Trận Đấu
                    </h3>
                </div>

                <div className="max-h-96 overflow-y-auto p-2">
                    {entries.length === 0 ? (
                        <p className="text-gray-400 text-center py-8 text-sm">
                            Chưa có lượt nào
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {entries.map((entry, index) => (
                                <motion.div
                                    key={entry.timestamp}
                                    className="p-3 rounded-lg bg-surface-elevated text-sm"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-jade">
                                            Người chơi {entry.playerId}
                                        </span>
                                        {entry.action === 'clue' ? (
                                            <MessageCircle className="w-3 h-3 text-blue-400" />
                                        ) : (
                                            <Target className="w-3 h-3 text-red-400" />
                                        )}
                                    </div>

                                    {entry.action === 'clue' && (
                                        <>
                                            {entry.cardPlayed && (
                                                <p className="text-gray-300">
                                                    Đã đánh <span className="font-medium text-white">
                                                        {getCardName(entry.cardPlayed)}
                                                    </span>
                                                </p>
                                            )}
                                            {entry.clue && (
                                                <p className="text-gray-400 italic">
                                                    "{entry.clue.text}"
                                                </p>
                                            )}
                                        </>
                                    )}

                                    {entry.action === 'accuse' && entry.accuseGuess && (
                                        <div className="flex items-center gap-2">
                                            <p className="text-gray-300">
                                                Đã đoán: <span className="font-medium text-white">
                                                    {entry.accuseGuess.color} {entry.accuseGuess.number}
                                                </span>
                                            </p>
                                            {entry.accuseResult === 'correct' ? (
                                                <span className="flex items-center gap-1 text-jade text-xs">
                                                    <Check className="w-3 h-3" /> Chính xác
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-400 text-xs">
                                                    <X className="w-3 h-3" /> Sai rồi
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
