import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, AlertCircle, RotateCcw, Trophy, Play } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getValidClues } from '../utils/clues';
import { PlayerArea } from './PlayerArea';
import { ActionMenu } from './ActionMenu';
import { ClueSelector } from './ClueSelector';
import { AccuseModal } from './AccuseModal';
import { HistoryLog } from './HistoryLog';
import { Notepad } from './Notepad';
import { Card } from './Card';

export function GameBoard() {
    const [historyOpen, setHistoryOpen] = useState(false);
    const [notepad1Open, setNotepad1Open] = useState(false);
    const [notepad2Open, setNotepad2Open] = useState(false);

    const {
        players,
        moleCard,
        innocentCard,
        currentPlayer,
        phase,
        historyLog,
        selectedCard,
        winner,
        roundNumber,
        initGame,
        selectCardToPlay,
        confirmClue,
        cancelCardSelection,
        startAccuse,
        submitAccuse,
        cancelAccuse,
        nextRound,
        resetGame,
    } = useGameStore();

    // Get current player data
    const currentPlayerData = players[currentPlayer - 1];

    // Calculate valid clues when in clue selection phase - only clues about the played card
    // Filter out clues that the current player has already used in previous turns
    const previousClues = historyLog
        .filter(entry => entry.playerId === currentPlayer && entry.action === 'clue' && entry.clue)
        .map(entry => entry.clue!);
    const validClues = phase === 'selectingClue' && selectedCard
        ? getValidClues(currentPlayerData.hand, currentPlayerData.table, selectedCard, previousClues)
        : [];

    // Setup screen
    if (phase === 'setup') {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <motion.div
                    className="glass rounded-3xl p-12 text-center max-w-lg"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-jade to-emerald-400 bg-clip-text text-transparent">
                        🔮 Jade Detective
                    </h1>
                    <p className="text-xl text-gray-300 mb-2">Truy Tìm Nội Gián</p>
                    <p className="text-gray-400 mb-8">
                        A deduction card game for 2 players. Find the hidden Mole card to win!
                    </p>

                    <div className="glass rounded-xl p-4 mb-8 text-left text-sm space-y-2 text-gray-300">
                        <p>🎴 15 cards, 1 hidden Mole, 1 revealed Innocent</p>
                        <p>🔄 Take turns: Play a card + Give a clue, or Accuse</p>
                        <p>💎 Correct accusation: +2 Jades. Wrong: Opponent +1</p>
                        <p>🏆 First to 3 Jades wins!</p>
                    </div>

                    <motion.button
                        onClick={initGame}
                        className="flex items-center gap-3 px-8 py-4 mx-auto rounded-xl 
              bg-gradient-to-r from-jade to-emerald-600 hover:from-emerald-500 hover:to-jade
              text-white font-bold text-lg shadow-lg shadow-jade/30"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Play className="w-6 h-6" />
                        Start Game
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    // Game Over screen
    if (phase === 'gameOver' && winner) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <motion.div
                    className="glass rounded-3xl p-12 text-center max-w-lg"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <Trophy className="w-20 h-20 text-amber-400 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold mb-4 text-amber-400">
                        Player {winner} Wins!
                    </h1>
                    <p className="text-gray-300 mb-8">
                        Congratulations! You collected 3 Jade tokens.
                    </p>

                    <div className="flex gap-4 justify-center">
                        <motion.button
                            onClick={resetGame}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl 
                bg-gradient-to-r from-jade to-emerald-600
                text-white font-semibold"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <RotateCcw className="w-5 h-5" />
                            Play Again
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Round End screen
    if (phase === 'roundEnd') {
        const lastEntry = historyLog[historyLog.length - 1];
        const wasCorrect = lastEntry?.accuseResult === 'correct';

        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <motion.div
                    className="glass rounded-3xl p-12 text-center max-w-lg"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${wasCorrect ? 'text-jade' : 'text-red-400'}`} />
                    <h2 className="text-3xl font-bold mb-4">
                        {wasCorrect ? 'Correct Accusation!' : 'Wrong Accusation!'}
                    </h2>

                    {moleCard && (
                        <div className="mb-6">
                            <p className="text-gray-400 mb-2">The Mole was:</p>
                            <div className="flex justify-center">
                                <Card card={moleCard} size="lg" />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-8 justify-center mb-8">
                        {players.map(p => (
                            <div key={p.id} className="text-center">
                                <p className="text-gray-400">Player {p.id}</p>
                                <div className="flex items-center gap-1 justify-center">
                                    <Gem className="w-5 h-5 text-jade" />
                                    <span className="text-2xl font-bold text-jade">{p.jades}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <motion.button
                        onClick={nextRound}
                        className="flex items-center gap-2 px-8 py-4 mx-auto rounded-xl 
              bg-gradient-to-r from-blue-600 to-blue-800
              text-white font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <RotateCcw className="w-5 h-5" />
                        Start Next Round
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-jade">🔮 Jade Detective</h1>
                    <p className="text-sm text-gray-400">Round {roundNumber}</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-6">
                        {players.map(p => (
                            <div
                                key={p.id}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full 
                  ${currentPlayer === p.id ? 'bg-jade/20 ring-2 ring-jade' : 'bg-surface-elevated'}`}
                            >
                                <span className="text-sm font-medium">P{p.id}</span>
                                <Gem className="w-4 h-4 text-jade" />
                                <span className="font-bold text-jade">{p.jades}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={resetGame}
                        className="p-2 rounded-lg bg-surface-elevated hover:bg-surface-card transition-colors"
                        title="Reset Game"
                    >
                        <RotateCcw className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Main Game Area */}
            <div className="max-w-5xl mx-auto">
                {/* Player 1 Area (Top) */}
                <PlayerArea
                    player={players[0]}
                    isActive={currentPlayer === 1 && phase === 'playing'}
                    isCurrentPlayer={currentPlayer === 1}
                    onCardSelect={selectCardToPlay}
                    selectedCard={selectedCard}
                    position="top"
                />

                {/* Center Area: Mole slot + Innocent + Actions */}
                <div className="glass rounded-2xl p-6 my-4">
                    <div className="flex items-center justify-around mb-6">
                        {/* Mole Card (Hidden) */}
                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                                🕵️ The Mole (Hidden)
                            </p>
                            {moleCard && <Card card={moleCard} faceDown />}
                        </div>

                        {/* Innocent Card (Revealed) */}
                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                                ✅ Innocent (Revealed)
                            </p>
                            {innocentCard && <Card card={innocentCard} disabled />}
                        </div>
                    </div>

                    {/* Action Area */}
                    <AnimatePresence mode="wait">
                        {phase === 'playing' && (
                            <motion.div
                                key="actions"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <p className="text-center text-gray-400 mb-4">
                                    Player {currentPlayer}'s turn - Select a card from your hand to play, or accuse
                                </p>
                                <ActionMenu
                                    onExchangeInfo={() => { }}
                                    onAccuse={startAccuse}
                                    disabled={false}
                                />
                            </motion.div>
                        )}

                        {phase === 'selectingClue' && (
                            <motion.div
                                key="clues"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <ClueSelector
                                    clues={validClues}
                                    onSelect={confirmClue}
                                    onCancel={cancelCardSelection}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Player 2 Area (Bottom) */}
                <PlayerArea
                    player={players[1]}
                    isActive={currentPlayer === 2 && phase === 'playing'}
                    isCurrentPlayer={currentPlayer === 2}
                    onCardSelect={selectCardToPlay}
                    selectedCard={selectedCard}
                    position="bottom"
                />
            </div>

            {/* Side Panels */}
            <HistoryLog
                entries={historyLog}
                isOpen={historyOpen}
                onToggle={() => setHistoryOpen(!historyOpen)}
            />
            {/* Player 1 Notepad (Left) */}
            <Notepad
                playerId={1}
                isOpen={notepad1Open}
                onToggle={() => setNotepad1Open(!notepad1Open)}
                position="left"
            />

            {/* Player 2 Notepad (Right) */}
            <Notepad
                playerId={2}
                isOpen={notepad2Open}
                onToggle={() => setNotepad2Open(!notepad2Open)}
                position="right"
            />

            {/* Accuse Modal */}
            <AccuseModal
                isOpen={phase === 'accusing'}
                onSubmit={submitAccuse}
                onCancel={cancelAccuse}
            />
        </div>
    );
}
