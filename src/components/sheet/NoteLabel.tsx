import { motion } from 'framer-motion';

interface NoteLabelProps {
  noteName: string;
  x: number;
  y: number;
  isActive?: boolean;
}

export function NoteLabel({ noteName, x, y, isActive = false }: NoteLabelProps) {
  return (
    <motion.div
      className={`
        absolute pointer-events-none select-none
        rounded-full px-1.5 py-0.5
        text-[11px] font-mono font-bold leading-none
        transition-all duration-150
        ${isActive
          ? 'bg-amber-400 text-brown-900 shadow-md scale-125 z-20'
          : 'bg-amber-200/90 text-brown-700 z-10'
        }
      `}
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -120%)`,
      }}
      animate={isActive ? { scale: 1.25 } : { scale: 1 }}
    >
      {noteName}
    </motion.div>
  );
}
