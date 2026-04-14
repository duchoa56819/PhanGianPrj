import { motion } from 'framer-motion';
import type { Card as CardType } from '../types/game';

// Face down card gradient override
const backGradient = 'bg-gradient-to-br from-emerald-800 to-emerald-950';

interface CardProps {
    card: CardType;
    faceDown?: boolean;
    onClick?: () => void;
    selected?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const colorConfig: Record<string, {
    bgGradient: string;
    numBg: string;
    numText: string;
    borderColor: string;
    glowColor: string;
}> = {
    Red: {
        bgGradient: 'bg-gradient-to-br from-red-500 to-red-800',
        numBg: 'bg-red-600',
        numText: 'text-white',
        borderColor: 'border-red-400/60',
        glowColor: 'rgba(239, 68, 68, 0.6)',
    },
    Yellow: {
        bgGradient: 'bg-gradient-to-br from-amber-400 to-amber-700',
        numBg: 'bg-amber-500',
        numText: 'text-white',
        borderColor: 'border-amber-400/60',
        glowColor: 'rgba(245, 158, 11, 0.6)',
    },
    Blue: {
        bgGradient: 'bg-gradient-to-br from-blue-500 to-blue-800',
        numBg: 'bg-blue-600',
        numText: 'text-white',
        borderColor: 'border-blue-400/60',
        glowColor: 'rgba(59, 130, 246, 0.6)',
    },
    Black: {
        bgGradient: 'bg-gradient-to-br from-gray-700 to-gray-900',
        numBg: 'bg-gray-800',
        numText: 'text-gray-100',
        borderColor: 'border-gray-400/40',
        glowColor: 'rgba(100, 116, 139, 0.6)',
    },
};
const sizeStyles = {
    sm: { container: 'w-14 h-20', numBadge: 'w-5 h-5 text-[10px]', numBadgeBR: 'w-4 h-4 text-[8px]' },
    md: { container: 'w-20 h-28', numBadge: 'w-7 h-7 text-sm', numBadgeBR: 'w-5 h-5 text-[10px]' },
    lg: { container: 'w-24 h-36', numBadge: 'w-8 h-8 text-base', numBadgeBR: 'w-6 h-6 text-xs' },
};

export function Card({ card, faceDown, onClick, selected, disabled, size = 'md' }: CardProps) {
    const config = colorConfig[card.color];
    const sz = sizeStyles[size];

    if (faceDown) {
        return (
            <motion.div
                className={`${sz.container} rounded-xl overflow-hidden border-2 border-emerald-600/50 
                    shadow-lg relative cursor-default`}
                initial={{ scale: 0, rotateY: 180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className={`absolute inset-0 w-full h-full ${backGradient}`} />
                {/* Subtle dark overlay */}
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border border-emerald-400/30 flex items-center justify-center bg-white/5">
                        <div className="w-4 h-4 rounded-full bg-emerald-400/20" />
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            className={`
                ${sz.container} rounded-xl overflow-hidden relative
                border-2 ${config.borderColor} shadow-lg card-premium
                ${selected ? 'card-selected ring-[3px] ring-jade ring-offset-2 ring-offset-surface-dark scale-110' : ''}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                transition-all duration-200
            `}
            style={selected ? { boxShadow: `0 0 20px ${config.glowColor}, 0 4px 20px rgba(0,0,0,0.3)` } : undefined}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={disabled ? {} : { y: -6, scale: 1.05 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            {/* Card background */}
            <div className={`absolute inset-0 w-full h-full ${config.bgGradient}`} />

            {/* Shine overlay */}
            <div className="card-shine-overlay" />

            {/* Number badge - top left */}
            <div className={`absolute top-1 left-1 ${sz.numBadge} ${config.numBg} ${config.numText}
                rounded-full flex items-center justify-center font-black shadow-md
                border border-white/30 z-10`}
            >
                {card.number}
            </div>

            {/* Number badge - bottom right */}
            <div className={`absolute bottom-1 right-1 ${sz.numBadgeBR} ${config.numBg} ${config.numText}
                rounded-full flex items-center justify-center font-bold shadow-md
                border border-white/30 z-10 rotate-180`}
            >
                {card.number}
            </div>

            {/* Bottom gradient for readability */}
            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </motion.button>
    );
}

// Card back component for hidden hands
export function CardBack({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sz = sizeStyles[size];
    return (
        <div
            className={`${sz.container} rounded-xl overflow-hidden
                border-2 border-slate-500/40 shadow-lg blur-[2px] relative`}
        >
            <div className={`absolute inset-0 w-full h-full ${backGradient}`} />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <span className="text-2xl text-white/60">?</span>
            </div>
        </div>
    );
}
