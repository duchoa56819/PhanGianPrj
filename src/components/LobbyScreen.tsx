import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, LogIn, Copy, Check, Loader2, Wifi, WifiOff } from 'lucide-react';
import { createRoom, joinRoom } from '../utils/roomUtils';
import type { PlayerId } from '../types/onlineTypes';

interface LobbyScreenProps {
    onJoinGame: (roomId: string, playerId: PlayerId, playerName: string) => void;
    onPlayLocal: () => void;
}

export function LobbyScreen({ onJoinGame, onPlayLocal }: LobbyScreenProps) {
    const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);

    const handleCreateRoom = async () => {
        if (!playerName.trim()) {
            setError('Vui lòng nhập tên của bạn');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { roomId, playerId } = await createRoom(playerName.trim());
            setCreatedRoomId(roomId);
            setIsWaiting(true);

            // Pass to game (the game component will listen for P2)
            onJoinGame(roomId, playerId, playerName.trim());
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            if (errorMessage.includes('PERMISSION_DENIED')) {
                setError('Từ chối quyền truy cập Firebase. Kiểm tra lại rules.');
            } else {
                setError(`Không thể tạo phòng: ${errorMessage}`);
            }
            console.error('Create room error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinRoom = async () => {
        if (!playerName.trim()) {
            setError('Vui lòng nhập tên của bạn');
            return;
        }
        if (!roomCode.trim() || roomCode.length !== 4) {
            setError('Vui lòng nhập mã phòng hợp lệ (4 ký tự)');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await joinRoom(roomCode.toUpperCase(), playerName.trim());

            if (result.success && result.playerId) {
                onJoinGame(roomCode.toUpperCase(), result.playerId, playerName.trim());
            } else {
                setError(result.error || 'Không thể vào phòng');
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            if (errorMessage.includes('PERMISSION_DENIED')) {
                setError('Từ chối quyền truy cập Firebase. Kiểm tra lại rules.');
            } else {
                setError(`Không thể vào phòng: ${errorMessage}`);
            }
            console.error('Join room error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const copyRoomCode = () => {
        if (createdRoomId) {
            navigator.clipboard.writeText(createdRoomId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <motion.div
                className="glass rounded-3xl p-8 w-full max-w-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-jade to-emerald-400 bg-clip-text text-transparent">
                        🔮 Phán Gian
                    </h1>
                    <p className="text-gray-400">Chế độ chơi Trực tuyến</p>
                </div>

                {/* Main Menu */}
                {mode === 'menu' && (
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <button
                            onClick={() => setMode('create')}
                            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl
                                bg-gradient-to-r from-jade to-emerald-600 hover:from-emerald-500 hover:to-jade
                                text-white font-semibold text-lg transition-all hover:scale-[1.02]"
                        >
                            <Plus className="w-5 h-5" />
                            Tạo Phòng
                        </button>

                        <button
                            onClick={() => setMode('join')}
                            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl
                                bg-surface-elevated hover:bg-surface-card border border-white/10
                                text-white font-semibold text-lg transition-all hover:scale-[1.02]"
                        >
                            <LogIn className="w-5 h-5" />
                            Vào Phòng
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-surface-dark text-gray-500 text-sm">hoặc</span>
                            </div>
                        </div>

                        <button
                            onClick={onPlayLocal}
                            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl
                                bg-surface-card hover:bg-surface-elevated border border-white/5
                                text-gray-400 font-medium transition-all"
                        >
                            <Users className="w-5 h-5" />
                            Chơi Offline (Cùng chung thiết bị)
                        </button>
                    </motion.div>
                )}

                {/* Create Room */}
                {mode === 'create' && (
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {!isWaiting ? (
                            <>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Tên của bạn</label>
                                    <input
                                        type="text"
                                        value={playerName}
                                        onChange={(e) => setPlayerName(e.target.value)}
                                        placeholder="Nhập tên của bạn"
                                        className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-white/10
                                            text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-jade"
                                        maxLength={20}
                                    />
                                </div>

                                {error && (
                                    <p className="text-red-400 text-sm">{error}</p>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setMode('menu')}
                                        className="px-6 py-3 rounded-xl bg-surface-card hover:bg-surface-elevated
                                            text-gray-400 font-medium transition-colors"
                                    >
                                        Quay lại
                                    </button>
                                    <button
                                        onClick={handleCreateRoom}
                                        disabled={isLoading}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                                            bg-gradient-to-r from-jade to-emerald-600
                                            text-white font-semibold disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            'Tạo Phòng'
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-jade/20 text-jade mb-6">
                                    <Wifi className="w-4 h-4" />
                                    Đã Tạo Phòng
                                </div>

                                <p className="text-gray-400 mb-2">Mã số Phỏng:</p>
                                <div className="flex items-center justify-center gap-3 mb-6">
                                    <span className="text-4xl font-mono font-bold tracking-widest text-white">
                                        {createdRoomId}
                                    </span>
                                    <button
                                        onClick={copyRoomCode}
                                        className="p-2 rounded-lg bg-surface-elevated hover:bg-surface-card transition-colors"
                                    >
                                        {copied ? (
                                            <Check className="w-5 h-5 text-jade" />
                                        ) : (
                                            <Copy className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center justify-center gap-2 text-gray-400">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Đang chờ đối thủ vào phòng...
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Join Room */}
                {mode === 'join' && (
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Tên của bạn</label>
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                placeholder="Nhập tên của bạn"
                                className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-white/10
                                    text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-jade"
                                maxLength={20}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Mã Phòng</label>
                            <input
                                type="text"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                placeholder="XXXX"
                                className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-white/10
                                    text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-jade
                                    font-mono text-center text-2xl tracking-widest uppercase"
                                maxLength={4}
                            />
                        </div>

                        {error && (
                            <p className="text-red-400 text-sm">{error}</p>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setMode('menu')}
                                className="px-6 py-3 rounded-xl bg-surface-card hover:bg-surface-elevated
                                    text-gray-400 font-medium transition-colors"
                            >
                                Quay lại
                            </button>
                            <button
                                onClick={handleJoinRoom}
                                disabled={isLoading}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                                    bg-gradient-to-r from-blue-600 to-blue-700
                                    text-white font-semibold disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    'Vào Phòng'
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Firebase Status */}
                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <WifiOff className="w-3 h-3" />
                    Powered by Firebase
                </div>
            </motion.div>
        </div>
    );
}
