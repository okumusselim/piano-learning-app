import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UploadZone } from '../components/upload/UploadZone';
import { Spinner } from '../components/ui/Spinner';
import { useUpload } from '../hooks/useUpload';

const STEPS = [
  { icon: '📄', title: 'Upload', desc: 'Drop in a photo of your sheet music' },
  { icon: '🎵', title: 'See Notes', desc: 'Every note gets labelled automatically' },
  { icon: '🎹', title: 'Play Along', desc: 'Practice at your own pace with live feedback' },
];

export function HomePage() {
  const navigate = useNavigate();
  const { stage, error, processFile } = useUpload();

  // Navigate to sheet page once processing is done
  useEffect(() => {
    if (stage === 'done') {
      navigate('/sheet');
    }
  }, [stage, navigate]);

  const isLoading = stage === 'uploading' || stage === 'processing';

  const stageLabel =
    stage === 'uploading' ? 'Uploading your sheet...' :
    stage === 'processing' ? 'Recognising notes with AI...' : '';

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-start px-4 py-12">
      {/* Hero */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-6xl mb-4">🎹</div>
        <h1 className="font-nunito text-4xl sm:text-5xl font-extrabold text-brown-800 mb-3">
          Piano Pal
        </h1>
        <p className="text-brown-500 text-lg max-w-md mx-auto">
          Upload your sheet music and start learning — note by note, at your own pace.
        </p>
      </motion.div>

      {/* Upload zone */}
      <motion.div
        className="w-full max-w-xl mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[280px] bg-peach-50 rounded-3xl border-2 border-dashed border-amber-300">
            <Spinner size="lg" label={stageLabel} />
          </div>
        ) : (
          <UploadZone onFileAccepted={processFile} isLoading={isLoading} />
        )}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-center text-red-600 text-sm"
          >
            {error}
          </motion.p>
        )}
      </motion.div>

      {/* Steps */}
      <motion.div
        className="w-full max-w-xl grid grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center p-4 bg-white rounded-2xl shadow-sm border border-amber-100"
          >
            <span className="text-3xl mb-2">{step.icon}</span>
            <p className="font-nunito font-bold text-brown-800 text-sm">{step.title}</p>
            <p className="text-brown-400 text-xs mt-0.5">{step.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
