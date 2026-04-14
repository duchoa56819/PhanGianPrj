import { useState } from 'react';
import { motion } from 'framer-motion';
import { NotebookPen, X, Minus } from 'lucide-react';

const colorBg: Record<string, string> = {
    Red: 'bg-red-500/20 border-red-500',
    Yellow: 'bg-amber-500/20 border-amber-500',
    Blue: 'bg-blue-500/20 border-blue-500',
    Black: 'bg-gray-500/20 border-gray-500',
};

interface NotepadProps {
    playerId: 1 | 2;
    isOpen: boolean;
    onToggle: () => void;
    position: 'left' | 'right';
    autoEliminatedIds?: string[];
}

export function Notepad({ playerId, isOpen, onToggle, position, autoEliminatedIds = [] }: NotepadProps) {
    const [marks, setMarks] = useState<Record<string, 'eliminated' | 'suspected' | null>>({});

    const toggleMark = (id: string) => {
        if (autoEliminatedIds.includes(id)) return; // Cannot toggle auto-eliminated cards
        setMarks(prev => {
            const current = prev[id];
            if (!current) return { ...prev, [id]: 'eliminated' };
            if (current === 'eliminated') return { ...prev, [id]: 'suspected' };
            return { ...prev, [id]: null };
        });
    };

    const clearAll = () => setMarks({});

    const isLeft = position === 'left';
    const positionClasses = isLeft
        ? 'left-4'
        : 'right-4';
    const buttonRoundedClass = isLeft
        ? 'rounded-r-xl'
        : 'rounded-l-xl';
    const buttonPositionClass = isLeft
        ? 'left-0'
        : 'right-0';
    const slideDirection = isLeft ? -340 : 340;

    return (
        <div className={`fixed ${positionClasses} top-1/2 -translate-y-1/2 z-40`}>
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className={`absolute ${buttonPositionClass} top-1/2 -translate-y-1/2 p-3 ${buttonRoundedClass} 
                    bg-surface-elevated hover:bg-surface-card transition-colors`}
            >
                <div className="flex flex-col items-center gap-1">
                    <NotebookPen className="w-5 h-5" />
                    <span className="text-xs font-medium">P{playerId}</span>
                </div>
            </button>

            {/* Panel */}
            <motion.div
                className="glass rounded-xl overflow-hidden w-72"
                initial={false}
                animate={{
                    x: isOpen ? 0 : slideDirection,
                    opacity: isOpen ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
            >
                <div className="p-3 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
                        <NotebookPen className="w-4 h-4" />
                        Player {playerId}'s Notepad
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={clearAll}
                            className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            Clear
                        </button>
                        <button
                            onClick={onToggle}
                            className="text-gray-400 hover:text-white transition-colors p-0.5 rounded hover:bg-white/10"
                            title="Minimize"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="p-3">
                    <p className="text-xs text-gray-400 mb-2">
                        ❌ eliminated → ⭐ suspected → clear
                    </p>

                    {/* Standard Colors Section (1-4) */}
                    <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">R / Y / B (1-4)</p>
                        <div className="grid grid-cols-5 gap-1">
                            {/* Header */}
                            <div className="text-xs text-gray-500 font-medium">#</div>
                            {[1, 2, 3, 4].map(n => (
                                <div key={n} className="text-xs text-gray-400 font-bold text-center">{n}</div>
                            ))}

                            {/* Rows for R, Y, B */}
                            {['Red', 'Yellow', 'Blue'].map(color => (
                                <div key={color} className="contents">
                                    <div
                                        className={`text-xs font-medium px-1 py-0.5 rounded ${color === 'Red' ? 'text-red-400' :
                                            color === 'Yellow' ? 'text-amber-400' :
                                                'text-blue-400'
                                            }`}
                                    >
                                        {color.charAt(0)}
                                    </div>
                                    {[1, 2, 3, 4].map(number => {
                                        const id = `${color}-${number}`;
                                        let mark = marks[id];
                                        if (autoEliminatedIds.includes(id)) {
                                            mark = 'eliminated';
                                        }

                                        return (
                                            <button
                                                key={id}
                                                onClick={() => toggleMark(id)}
                                                className={`w-7 h-7 rounded border-2 flex items-center justify-center
                                                    transition-all duration-200 hover:scale-110 text-xs
                                                    ${colorBg[color]}
                                                    ${mark === 'eliminated' ? 'opacity-40' : ''}
                                                    ${mark === 'suspected' ? 'ring-2 ring-jade' : ''}
                                                `}
                                            >
                                                {mark === 'eliminated' && <X className="w-3 h-3 text-red-400" />}
                                                {mark === 'suspected' && <span className="text-jade text-[10px]">⭐</span>}
                                                {!mark && <span className="text-white/50">{number}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Black Section (5-7) */}
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Black (5-7)</p>
                        <div className="grid grid-cols-4 gap-1">
                            {/* Header */}
                            <div className="text-xs text-gray-500 font-medium">#</div>
                            {[5, 6, 7].map(n => (
                                <div key={n} className="text-xs text-gray-400 font-bold text-center">{n}</div>
                            ))}

                            {/* Black row */}
                            <div className="text-xs font-medium px-1 py-0.5 rounded text-gray-400">
                                B
                            </div>
                            {[5, 6, 7].map(number => {
                                const id = `Black-${number}`;
                                let mark = marks[id];
                                if (autoEliminatedIds.includes(id)) {
                                    mark = 'eliminated';
                                }

                                return (
                                    <button
                                        key={id}
                                        onClick={() => toggleMark(id)}
                                        className={`w-7 h-7 rounded border-2 flex items-center justify-center
                                            transition-all duration-200 hover:scale-110 text-xs
                                            ${colorBg['Black']}
                                            ${mark === 'eliminated' ? 'opacity-40' : ''}
                                            ${mark === 'suspected' ? 'ring-2 ring-jade' : ''}
                                        `}
                                    >
                                        {mark === 'eliminated' && <X className="w-3 h-3 text-red-400" />}
                                        {mark === 'suspected' && <span className="text-jade text-[10px]">⭐</span>}
                                        {!mark && <span className="text-white/50">{number}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
