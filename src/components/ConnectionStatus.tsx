import { motion } from 'framer-motion';
import { Wifi, WifiOff, Copy, Check, LogOut } from 'lucide-react';
import { useState } from 'react';

interface ConnectionStatusProps {
    roomId: string;
    playerName: string;
    isConnected: boolean;
    opponentConnected: boolean;
    opponentName?: string;
    onLeave: () => void;
}

export function ConnectionStatus({
    roomId,
    playerName,
    isConnected,
    opponentConnected,
    opponentName,
    onLeave,
}: ConnectionStatusProps) {
    const [copied, setCopied] = useState(false);

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
        >
            <div className="glass rounded-full px-4 py-2 flex items-center gap-4">
                {/* Room Code */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Room:</span>
                    <span className="font-mono font-bold text-jade">{roomId}</span>
                    <button
                        onClick={copyRoomCode}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                    >
                        {copied ? (
                            <Check className="w-3 h-3 text-jade" />
                        ) : (
                            <Copy className="w-3 h-3 text-gray-400" />
                        )}
                    </button>
                </div>

                <div className="w-px h-4 bg-white/20" />

                {/* Players */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        {isConnected ? (
                            <Wifi className="w-3 h-3 text-jade" />
                        ) : (
                            <WifiOff className="w-3 h-3 text-red-400" />
                        )}
                        <span className="text-xs text-gray-300">{playerName}</span>
                    </div>

                    <span className="text-xs text-gray-500">vs</span>

                    <div className="flex items-center gap-1.5">
                        {opponentConnected ? (
                            <Wifi className="w-3 h-3 text-jade" />
                        ) : (
                            <WifiOff className="w-3 h-3 text-red-400" />
                        )}
                        <span className="text-xs text-gray-300">
                            {opponentName || 'Waiting...'}
                        </span>
                    </div>
                </div>

                <div className="w-px h-4 bg-white/20" />

                {/* Leave Button */}
                <button
                    onClick={onLeave}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
                >
                    <LogOut className="w-3 h-3" />
                    Leave
                </button>
            </div>
        </motion.div>
    );
}
