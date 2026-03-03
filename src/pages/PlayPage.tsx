import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { SheetViewer } from '../components/sheet/SheetViewer';
import { PlaybackBar } from '../components/player/PlaybackBar';
import { TempoControl } from '../components/player/TempoControl';
import { PlayAlongMode } from '../components/playalong/PlayAlongMode';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useMusicStore } from '../store/musicStore';

export function PlayPage() {
  const navigate = useNavigate();
  const { sheetId, musicxml, currentMeasure, currentNoteIndex } = useMusicStore();

  useEffect(() => {
    if (!sheetId) navigate('/');
  }, [sheetId, navigate]);

  if (!musicxml) return null;

  return (
    <div className="min-h-screen bg-cream px-4 py-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-5">
        {/* Header */}
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="ghost" onClick={() => navigate('/sheet')}>
            <ArrowLeft className="w-4 h-4" />
            Sheet
          </Button>
          <h1 className="font-nunito text-2xl font-extrabold text-brown-800">Practice</h1>
        </motion.div>

        {/* Sheet music with cursor */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card padded={false}>
            <SheetViewer
              musicxml={musicxml}
              currentMeasure={currentMeasure}
              activeNoteIndex={currentNoteIndex}
            />
          </Card>
        </motion.div>

        {/* Playback controls */}
        <motion.div
          className="flex flex-wrap gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <PlaybackBar />
          <TempoControl />
        </motion.div>

        {/* Play-along section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <h2 className="font-nunito text-lg font-bold text-brown-800 mb-4">
              🎹 Play Along
            </h2>
            <PlayAlongMode />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
