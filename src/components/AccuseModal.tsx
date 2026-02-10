import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Target, Check } from 'lucide-react';
import type { CardColor, CardNumber } from '../types/game';

interface AccuseModalProps {
    isOpen: boolean;
    onSubmit: (color: CardColor, number: CardNumber) => void;
    onCancel: () => void;
}

const COLORS: CardColor[] = ['Red', 'Yellow', 'Blue', 'Black'];

// Numbers available for each color
const getValidNumbers = (color: CardColor | null): CardNumber[] => {
    if (color === 'Black') {
        return [5, 6, 7];
    }
    return [1, 2, 3, 4];
};

const colorStyles: Record<CardColor, string> = {
    Red: 'bg-red-500 hover:bg-red-600 border-red-400',
    Yellow: 'bg-amber-500 hover:bg-amber-600 border-amber-400 text-gray-900',
    Blue: 'bg-blue-500 hover:bg-blue-600 border-blue-400',
    Black: 'bg-gray-700 hover:bg-gray-800 border-gray-500',
};

export function AccuseModal({ isOpen, onSubmit, onCancel }: AccuseModalProps) {
    const [selectedColor, setSelectedColor] = useState<CardColor | null>(null);
    const [selectedNumber, setSelectedNumber] = useState<CardNumber | null>(null);

    const validNumbers = getValidNumbers(selectedColor);

    const handleColorSelect = (color: CardColor) => {
        setSelectedColor(color);
        // Reset number if it's not valid for the new color
        if (selectedNumber && !getValidNumbers(color).includes(selectedNumber)) {
            setSelectedNumber(null);
        }
    };

    const handleSubmit = () => {
        if (selectedColor && selectedNumber) {
            onSubmit(selectedColor, selectedNumber);
        }
    };

    const handleClose = () => {
        setSelectedColor(null);
        setSelectedNumber(null);
        onCancel();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="glass rounded-2xl p-6 w-full max-w-md mx-4"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Target className="w-6 h-6 text-red-400" />
                                <h2 className="text-xl font-bold text-white">Accuse The Mole</h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <p className="text-gray-400 text-sm mb-6">
                            Select the color and number of the hidden Mole card.
                            <span className="text-jade"> Correct: +2 Jades.</span>
                            <span className="text-red-400"> Wrong: Opponent +1 Jade.</span>
                        </p>

                        {/* Color Selection */}
                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide">
                                Select Color
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {COLORS.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => handleColorSelect(color)}
                                        className={`py-3 px-2 rounded-xl border-2 font-semibold text-sm transition-all
                      ${colorStyles[color]}
                      ${selectedColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-dark scale-105' : ''}
                    `}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                            {selectedColor === 'Black' && (
                                <p className="text-xs text-gray-500 mt-2">Black cards have numbers 5, 6, 7</p>
                            )}
                        </div>

                        {/* Number Selection */}
                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide">
                                Select Number {selectedColor === 'Black' ? '(5-7)' : '(1-4)'}
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {validNumbers.map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setSelectedNumber(num)}
                                        className={`py-4 rounded-xl bg-surface-elevated hover:bg-surface-card 
                        border-2 border-transparent font-bold text-2xl transition-all
                        ${selectedNumber === num ? 'border-jade bg-jade/20' : ''}
                      `}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preview & Submit */}
                        <div className="flex items-center justify-between">
                            <div className="text-gray-400">
                                {selectedColor && selectedNumber ? (
                                    <span className="text-white font-semibold">
                                        Guess: {selectedColor} {selectedNumber}
                                    </span>
                                ) : (
                                    'Select color and number'
                                )}
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={!selectedColor || !selectedNumber}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl 
                  bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600
                  text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200"
                            >
                                <Check className="w-5 h-5" />
                                Confirm Accusation
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
