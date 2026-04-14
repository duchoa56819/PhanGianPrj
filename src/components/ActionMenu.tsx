import { motion } from 'framer-motion';
import { Search, UserX } from 'lucide-react';

interface ActionMenuProps {
    onExchangeInfo: () => void;
    onAccuse: () => void;
    disabled?: boolean;
}

export function ActionMenu({ onExchangeInfo, onAccuse, disabled }: ActionMenuProps) {
    return (
        <motion.div
            className="flex gap-4 justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <motion.button
                onClick={onExchangeInfo}
                disabled={disabled}
                className="flex items-center gap-3 px-6 py-4 rounded-xl 
          bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700
          text-white font-semibold shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Search className="w-6 h-6" />
                <div className="text-left">
                    <div className="text-lg">Tráo Đổi Thông Tin</div>
                    <div className="text-xs opacity-75">Đánh một lá bài & Ra dấu gợi ý</div>
                </div>
            </motion.button>

            <motion.button
                onClick={onAccuse}
                disabled={disabled}
                className="flex items-center gap-3 px-6 py-4 rounded-xl 
          bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700
          text-white font-semibold shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <UserX className="w-6 h-6" />
                <div className="text-left">
                    <div className="text-lg">Buộc Tội Phán Gian</div>
                    <div className="text-xs opacity-75">Chỉ điểm thẻ bài bị giấu</div>
                </div>
            </motion.button>
        </motion.div>
    );
}
