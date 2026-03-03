import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type?: 'info' | 'error' | 'success';
  visible: boolean;
}

const typeStyles = {
  info: 'bg-amber-100 text-amber-900 border-amber-300',
  error: 'bg-red-100 text-red-900 border-red-200',
  success: 'bg-green-100 text-green-900 border-green-200',
};

export function Toast({ message, type = 'info', visible }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`
            fixed bottom-6 left-1/2 -translate-x-1/2
            px-5 py-3 rounded-2xl border shadow-lg
            text-sm font-medium z-50
            ${typeStyles[type]}
          `}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
