import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Music, Upload, FileImage } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadZoneProps {
  onFileAccepted: (file: File) => void;
  isLoading?: boolean;
}

const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/pdf': ['.pdf'],
};

export function UploadZone({ onFileAccepted, isLoading = false }: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: any[]) => {
      setError(null);
      if (rejected.length > 0) {
        const reason = rejected[0]?.errors?.[0]?.code;
        if (reason === 'file-too-large') {
          setError('File is too large. Maximum size is 10MB.');
        } else {
          setError('Only JPG, PNG, or PDF files are accepted.');
        }
        return;
      }
      if (accepted.length > 0) {
        onFileAccepted(accepted[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: isLoading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative cursor-pointer rounded-3xl border-2 border-dashed
          transition-all duration-300 ease-in-out
          flex flex-col items-center justify-center
          min-h-[280px] p-8
          ${isDragActive
            ? 'border-amber-500 bg-amber-50 scale-[1.01]'
            : 'border-amber-300 bg-peach-50 hover:border-amber-400 hover:bg-amber-50'
          }
          ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {/* Floating music note decorations */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          {['♩', '♪', '♫', '♬'].map((note, i) => (
            <motion.span
              key={i}
              className="absolute text-amber-200 text-2xl select-none"
              style={{
                left: `${15 + i * 22}%`,
                top: `${20 + (i % 2) * 40}%`,
              }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {note}
            </motion.span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {isDragActive ? (
            <motion.div
              key="dropping"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <Music className="w-16 h-16 text-amber-500" />
              <p className="text-xl font-bold text-amber-700 font-nunito">Drop it here!</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 text-center relative z-10"
            >
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                <Upload className="w-10 h-10 text-amber-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-brown-800 font-nunito mb-1">
                  Drop your sheet music here
                </p>
                <p className="text-brown-500 text-sm">
                  JPG, PNG or PDF · Any beginner learning book
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <FileImage className="w-4 h-4 text-amber-400" />
                <span className="text-amber-600 font-medium text-sm">
                  or click to browse files
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-red-600 text-sm text-center font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
