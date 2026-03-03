import { motion } from 'framer-motion';

interface PitchMeterProps {
  detectedNote: string | null;
  clarity: number;
  expectedNote: string | null;
}

export function PitchMeter({ detectedNote, clarity, expectedNote }: PitchMeterProps) {
  const isMatch = detectedNote && expectedNote && detectedNote === expectedNote;
  const hasSignal = clarity > 0.7;

  return (
    <div className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-2xl px-4 py-2 border border-amber-100 shadow-sm">
      {/* Signal strength bars */}
      <div className="flex items-end gap-0.5 h-6">
        {[0.3, 0.5, 0.7, 0.9].map((threshold, i) => (
          <motion.div
            key={i}
            className={`w-1.5 rounded-sm transition-colors duration-150 ${
              clarity >= threshold ? 'bg-amber-400' : 'bg-amber-100'
            }`}
            style={{ height: `${40 + i * 15}%` }}
          />
        ))}
      </div>

      {/* Detected note display */}
      <div className="flex items-baseline gap-1">
        <span className="text-xs text-brown-400">Hearing:</span>
        <motion.span
          key={detectedNote}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={`
            font-mono font-bold text-base
            ${isMatch ? 'text-green-600' : hasSignal ? 'text-brown-800' : 'text-brown-300'}
          `}
        >
          {hasSignal && detectedNote ? detectedNote : '–'}
        </motion.span>
      </div>

      {isMatch && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-green-500 text-lg"
        >
          ✓
        </motion.span>
      )}
    </div>
  );
}
