import { motion } from 'framer-motion';
import type { Card as CardType } from '../types/game';

interface CardProps {
    card: CardType;
    faceDown?: boolean;
    onClick?: () => void;
    selected?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const colorStyles: Record<string, { bg: string; border: string; text: string }> = {
    Red: {
        bg: 'from-red-500 to-red-700',
        border: 'border-red-400',
        text: 'text-white',
    },
    Yellow: {
        bg: 'from-amber-400 to-amber-600',
        border: 'border-amber-300',
        text: 'text-gray-900',
    },
    Blue: {
        bg: 'from-blue-500 to-blue-700',
        border: 'border-blue-400',
        text: 'text-white',
    },
    Black: {
        bg: 'from-gray-700 to-gray-900',
        border: 'border-gray-500',
        text: 'text-white',
    },
};

const sizeStyles = {
    sm: 'w-12 h-18 text-lg',
    md: 'w-16 h-24 text-2xl',
    lg: 'w-20 h-30 text-3xl',
};

export function Card({ card, faceDown, onClick, selected, disabled, size = 'md' }: CardProps) {
    const style = colorStyles[card.color];

    if (faceDown) {
        return (
            <motion.div
                className={`${sizeStyles[size]} rounded-xl bg-gradient-to-br from-indigo-800 to-purple-900 
          border-2 border-indigo-500 flex items-center justify-center shadow-card card-shine`}
                initial={{ scale: 0, rotateY: 180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="text-3xl">🔮</div>
            </motion.div>
        );
    }

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            className={`
        ${sizeStyles[size]} rounded-xl bg-gradient-to-br ${style.bg} 
        border-2 ${style.border} flex flex-col items-center justify-center 
        shadow-card card-shine font-bold ${style.text}
        ${selected ? 'ring-4 ring-jade ring-offset-2 ring-offset-surface-dark scale-110' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        transition-all duration-200
      `}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={disabled ? {} : { y: -4 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <span className="text-xs opacity-75">{card.color}</span>
            <span>{card.number}</span>
        </motion.button>
    );
}

// Card back component for hidden hands
export function CardBack({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    return (
        <div
            className={`${sizeStyles[size]} rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 
        border-2 border-slate-500 flex items-center justify-center shadow-card blur-sm`}
        >
            <span className="text-2xl">?</span>
        </div>
    );
}
