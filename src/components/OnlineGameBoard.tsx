import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, AlertCircle, RotateCcw, Trophy, Loader2 } from 'lucide-react';
import { useOnlineGame } from '../hooks/useOnlineGame';
import { ActionMenu } from './ActionMenu';
import { ClueSelector } from './ClueSelector';
import { AccuseModal } from './AccuseModal';
import { HistoryLog } from './HistoryLog';
import { Notepad } from './Notepad';
import { ConnectionStatus } from './ConnectionStatus';
import { Card } from './Card';
import type { PlayerId } from '../types/onlineTypes';
import type { Card as CardType, Player, HistoryEntry } from '../types/game';

interface OnlineGameBoardProps {
    roomId: string;
    playerId: PlayerId;
    playerName: string;
    onLeave: () => void;
}

export function OnlineGameBoard({ roomId, playerId, playerName, onLeave }: OnlineGameBoardProps) {
    const [historyOpen, setHistoryOpen] = useState(false);
    const [notepadOpen, setNotepadOpen] = useState(false);

    const {
        roomData,
        isLoading,
        error,
        myPlayer,
        opponentPlayer,
        isMyTurn,
        validClues,
        playCard,
        confirmClue,
        cancelCardSelection,
        startAccuse,
        submitAccuse,
        cancelAccuse,
        nextRound,
        selectedCard,
        isAccusing,
    } = useOnlineGame(roomId, playerId);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass rounded-2xl p-8 text-center">
                    <Loader2 className="w-12 h-12 text-jade animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Connecting to game...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !roomData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass rounded-2xl p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400 mb-4">{error || 'Failed to load game'}</p>
                    <button
                        onClick={onLeave}
                        className="px-6 py-2 rounded-xl bg-surface-elevated hover:bg-surface-card text-white"
                    >
                        Back to Lobby
                    </button>
                </div>
            </div>
        );
    }

    // Waiting for opponent
    if (roomData.gameState === 'WAITING') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass rounded-2xl p-8 text-center max-w-md">
                    <h2 className="text-2xl font-bold text-jade mb-4">Room Created!</h2>
                    <p className="text-gray-400 mb-2">Share this code with your opponent:</p>
                    <p className="text-4xl font-mono font-bold text-white mb-6 tracking-widest">{roomId}</p>
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Waiting for opponent to join...
                    </div>
                    <button
                        onClick={onLeave}
                        className="mt-6 px-6 py-2 rounded-xl bg-surface-elevated hover:bg-surface-card text-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    // Convert online players to local Player format for components
    const toLocalPlayer = (p: typeof myPlayer, id: 1 | 2): Player => ({
        id,
        name: p?.name || `Player ${id}`,
        hand: p?.hand || [],
        table: p?.table || [],
        jades: p?.jades || 0,
    });

    const players: Player[] = playerId === 'P1'
        ? [toLocalPlayer(myPlayer, 1), toLocalPlayer(opponentPlayer, 2)]
        : [toLocalPlayer(opponentPlayer, 1), toLocalPlayer(myPlayer, 2)];

    const myPlayerNum: 1 | 2 = playerId === 'P1' ? 1 : 2;

    // Convert logs to history entries
    const historyLog: HistoryEntry[] = (roomData.logs || [])
        .filter(log => log.action === 'clue' || log.action === 'accuse')
        .map((log) => ({
            playerId: (log.playerId === 'P1' ? 1 : 2) as 1 | 2,
            action: log.action as 'clue' | 'accuse',
            cardPlayed: log.cardPlayed,
            clue: log.clue,
            accuseGuess: log.accuseGuess,
            accuseResult: log.accuseResult,
            timestamp: log.timestamp,
        }));

    // Determine phase
    let phase: 'playing' | 'selectingClue' | 'accusing' | 'roundEnd' | 'gameOver' = 'playing';
    if (selectedCard && isMyTurn) phase = 'selectingClue';
    if (isAccusing) phase = 'accusing';
    if (roomData.gameState === 'ROUND_END') phase = 'roundEnd';
    if (roomData.gameState === 'FINISHED') phase = 'gameOver';

    // Find winner
    const winner = players.find(p => p.jades >= 3);

    // Handle card selection for my player only
    const handleCardSelect = (card: CardType) => {
        if (isMyTurn && !selectedCard) {
            playCard(card);
        }
    };

    // Game Over screen
    if (phase === 'gameOver' && winner) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <ConnectionStatus
                    roomId={roomId}
                    playerName={playerName}
                    isConnected={myPlayer?.connected || false}
                    opponentConnected={opponentPlayer?.connected || false}
                    opponentName={opponentPlayer?.name}
                    onLeave={onLeave}
                />
                <motion.div
                    className="glass rounded-3xl p-12 text-center max-w-lg"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <Trophy className="w-20 h-20 text-amber-400 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold mb-4 text-amber-400">
                        {winner.id === myPlayerNum ? 'You Win!' : `${opponentPlayer?.name} Wins!`}
                    </h1>
                    <p className="text-gray-300 mb-8">
                        {winner.id === myPlayerNum ? 'Congratulations!' : 'Better luck next time!'}
                    </p>
                    <button
                        onClick={onLeave}
                        className="flex items-center gap-2 px-6 py-3 mx-auto rounded-xl 
                            bg-gradient-to-r from-jade to-emerald-600
                            text-white font-semibold"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Back to Lobby
                    </button>
                </motion.div>
            </div>
        );
    }

    // Round End screen
    if (phase === 'roundEnd') {
        const lastLog = roomData.logs[roomData.logs.length - 1];
        const wasCorrect = lastLog?.accuseResult === 'correct';

        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <ConnectionStatus
                    roomId={roomId}
                    playerName={playerName}
                    isConnected={myPlayer?.connected || false}
                    opponentConnected={opponentPlayer?.connected || false}
                    opponentName={opponentPlayer?.name}
                    onLeave={onLeave}
                />
                <motion.div
                    className="glass rounded-3xl p-12 text-center max-w-lg"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${wasCorrect ? 'text-jade' : 'text-red-400'}`} />
                    <h2 className="text-3xl font-bold mb-4">
                        {wasCorrect ? 'Correct Accusation!' : 'Wrong Accusation!'}
                    </h2>

                    <div className="mb-6">
                        <p className="text-gray-400 mb-2">The Mole was:</p>
                        <div className="flex justify-center">
                            <Card card={roomData.board.moleCard} size="lg" />
                        </div>
                    </div>

                    <div className="flex gap-8 justify-center mb-8">
                        <div className="text-center">
                            <p className="text-gray-400">{myPlayer?.name}</p>
                            <div className="flex items-center gap-1 justify-center">
                                <Gem className="w-5 h-5 text-jade" />
                                <span className="text-2xl font-bold text-jade">{myPlayer?.jades}</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400">{opponentPlayer?.name}</p>
                            <div className="flex items-center gap-1 justify-center">
                                <Gem className="w-5 h-5 text-jade" />
                                <span className="text-2xl font-bold text-jade">{opponentPlayer?.jades}</span>
                            </div>
                        </div>
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
            {/* Connection Status Bar */}
            <ConnectionStatus
                roomId={roomId}
                playerName={playerName}
                isConnected={myPlayer?.connected || false}
                opponentConnected={opponentPlayer?.connected || false}
                opponentName={opponentPlayer?.name}
                onLeave={onLeave}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 mt-12">
                <div>
                    <h1 className="text-2xl font-bold text-jade">🔮 Jade Detective</h1>
                    <p className="text-sm text-gray-400">Round {roomData.roundNumber}</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-6">
                        {/* Show my player and opponent with jades */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full 
                            ${isMyTurn ? 'bg-jade/20 ring-2 ring-jade' : 'bg-surface-elevated'}`}
                        >
                            <span className="text-sm font-medium">{myPlayer?.name} (You)</span>
                            <Gem className="w-4 h-4 text-jade" />
                            <span className="font-bold text-jade">{myPlayer?.jades}</span>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full 
                            ${!isMyTurn && roomData.gameState === 'PLAYING' ? 'bg-jade/20 ring-2 ring-jade' : 'bg-surface-elevated'}`}
                        >
                            <span className="text-sm font-medium">{opponentPlayer?.name}</span>
                            <Gem className="w-4 h-4 text-jade" />
                            <span className="font-bold text-jade">{opponentPlayer?.jades}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Game Area */}
            <div className="max-w-5xl mx-auto">
                {/* Opponent Area (Top) - Show cards face down */}
                <div className="glass rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-300">
                            {opponentPlayer?.name}'s Area
                            {!isMyTurn && <span className="ml-2 text-jade text-sm">(Their Turn)</span>}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">Hand: {opponentPlayer?.hand.length || 0}</span>
                        </div>
                    </div>

                    {/* Opponent's table cards (visible) */}
                    <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-2">Played Cards</p>
                        <div className="flex gap-2 flex-wrap min-h-[60px]">
                            {(opponentPlayer?.table || []).map(card => (
                                <Card key={card.id} card={card} size="sm" />
                            ))}
                            {(!opponentPlayer?.table || opponentPlayer.table.length === 0) && (
                                <span className="text-gray-600 text-sm">No cards played yet</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Center Area: Mole slot + Innocent + Actions */}
                <div className="glass rounded-2xl p-6 my-4">
                    <div className="flex items-center justify-around mb-6">
                        {/* Mole Card (Hidden) */}
                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                                🕵️ The Mole (Hidden)
                            </p>
                            <Card card={roomData.board.moleCard} faceDown />
                        </div>

                        {/* Innocent Card (Revealed) */}
                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                                ✅ Innocent (Revealed)
                            </p>
                            <Card card={roomData.board.innocentCard} disabled />
                        </div>
                    </div>

                    {/* Action Area */}
                    <AnimatePresence mode="wait">
                        {isMyTurn && phase === 'playing' && (
                            <motion.div
                                key="actions"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <p className="text-center text-jade mb-4 font-semibold">
                                    Your turn - Select a card from your hand to play, or accuse
                                </p>
                                <ActionMenu
                                    onExchangeInfo={() => { }}
                                    onAccuse={startAccuse}
                                    disabled={false}
                                />
                            </motion.div>
                        )}

                        {!isMyTurn && phase === 'playing' && (
                            <motion.div
                                key="waiting"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-center py-4"
                            >
                                <div className="flex items-center justify-center gap-2 text-gray-400">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Waiting for {opponentPlayer?.name}'s move...
                                </div>
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

                {/* My Area (Bottom) */}
                <div className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">
                            Your Hand
                            {isMyTurn && <span className="ml-2 text-jade text-sm">(Your Turn)</span>}
                        </h3>
                    </div>

                    {/* My played cards */}
                    <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Your Played Cards</p>
                        <div className="flex gap-2 flex-wrap min-h-[60px]">
                            {(myPlayer?.table || []).map(card => (
                                <Card key={card.id} card={card} size="sm" />
                            ))}
                            {(!myPlayer?.table || myPlayer.table.length === 0) && (
                                <span className="text-gray-600 text-sm">No cards played yet</span>
                            )}
                        </div>
                    </div>

                    {/* My hand */}
                    <div>
                        <p className="text-xs text-gray-500 mb-2">Click a card to play</p>
                        <div className="flex gap-2 flex-wrap">
                            {(myPlayer?.hand || []).map(card => (
                                <motion.div
                                    key={card.id}
                                    whileHover={isMyTurn ? { scale: 1.05, y: -5 } : {}}
                                    whileTap={isMyTurn ? { scale: 0.95 } : {}}
                                >
                                    <Card
                                        card={card}
                                        onClick={() => handleCardSelect(card)}
                                        disabled={!isMyTurn || !!selectedCard}
                                        selected={selectedCard?.id === card.id}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Side Panels */}
            <HistoryLog
                entries={historyLog}
                isOpen={historyOpen}
                onToggle={() => setHistoryOpen(!historyOpen)}
            />
            <Notepad
                playerId={myPlayerNum as 1 | 2}
                isOpen={notepadOpen}
                onToggle={() => setNotepadOpen(!notepadOpen)}
                position="left"
            />

            {/* Accuse Modal */}
            <AccuseModal
                isOpen={isAccusing}
                onSubmit={submitAccuse}
                onCancel={cancelAccuse}
            />
        </div>
    );
}
