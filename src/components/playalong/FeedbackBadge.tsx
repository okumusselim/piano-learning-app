import { motion, AnimatePresence } from 'framer-motion';
import type { FeedbackType } from '../../types/music';

interface FeedbackBadgeProps {
  feedback: FeedbackType;
  expectedNote?: string | null;
}

const feedbackConfig = {
  correct: {
    emoji: '⭐',
    text: 'Perfect!',
    bg: 'bg-green-100 border-green-300',
    text_color: 'text-green-800',
  },
  incorrect: {
    emoji: '🎵',
    text: 'Try again',
    bg: 'bg-amber-100 border-amber-300',
    text_color: 'text-amber-800',
  },
  waiting: {
    emoji: '👂',
    text: 'Listening...',
    bg: 'bg-blue-50 border-blue-200',
    text_color: 'text-blue-700',
  },
};

export function FeedbackBadge({ feedback, expectedNote }: FeedbackBadgeProps) {
  if (!feedback || feedback === null) return null;
  const config = feedbackConfig[feedback];

  return (
    <AnimatePresence>
      <motion.div
        key={feedback}
        initial={{ scale: 0.5, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`
          inline-flex items-center gap-2 px-5 py-3
          rounded-2xl border-2 shadow-lg
          font-nunito font-bold text-lg
          ${config.bg} ${config.text_color}
        `}
      >
        <span className="text-2xl">{config.emoji}</span>
        <div>
          <div>{config.text}</div>
          {feedback === 'incorrect' && expectedNote && (
            <div className="text-sm font-normal opacity-80">Play: {expectedNote}</div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
