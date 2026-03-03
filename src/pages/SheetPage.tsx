import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play } from 'lucide-react';
import { SheetViewer } from '../components/sheet/SheetViewer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useMusicStore } from '../store/musicStore';
import { getMidiUrl } from '../api/client';
import { parseMidiBlob, noteEventsToPlaybackNotes } from '../utils/midiParser';

export function SheetPage() {
  const navigate = useNavigate();
  const { sheetId, musicxml, notes, metadata, annotatedImageUrl, setPlaybackNotes } =
    useMusicStore();

  // Redirect home if no sheet loaded
  useEffect(() => {
    if (!sheetId) navigate('/');
  }, [sheetId, navigate]);

  // Load MIDI for playback
  useEffect(() => {
    if (!sheetId || !notes.length) return;
    // Try to fetch MIDI, fall back to building from NoteEvents
    fetch(getMidiUrl(sheetId))
      .then((res) => {
        if (!res.ok) throw new Error('MIDI not ready');
        return res.arrayBuffer();
      })
      .then((buf) => {
        const playbackNotes = parseMidiBlob(buf);
        setPlaybackNotes(playbackNotes);
      })
      .catch(() => {
        // Fallback: derive from NoteEvents
        const playbackNotes = noteEventsToPlaybackNotes(notes, metadata?.tempo_bpm ?? 120);
        setPlaybackNotes(playbackNotes);
      });
  }, [sheetId, notes, metadata, setPlaybackNotes]);

  if (!musicxml) return null;

  return (
    <div className="min-h-screen bg-cream px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="text-center">
            <h1 className="font-nunito text-2xl font-extrabold text-brown-800">
              Your Sheet Music
            </h1>
            {metadata && (
              <p className="text-brown-400 text-sm">
                {metadata.key_signature} · {metadata.time_signature} · {metadata.tempo_bpm} BPM
              </p>
            )}
          </div>

          <Button variant="primary" onClick={() => navigate('/play')}>
            <Play className="w-4 h-4" />
            Play
          </Button>
        </motion.div>

        {/* Annotated image view */}
        {annotatedImageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card padded={false}>
              <img
                src={annotatedImageUrl}
                alt="Sheet music with note labels"
                className="w-full rounded-3xl"
              />
            </Card>
          </motion.div>
        )}

        {/* OSMD interactive view */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <Card padded={false}>
            <SheetViewer musicxml={musicxml} />
          </Card>
        </motion.div>

        {/* Metadata */}
        {metadata && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <Card>
              <div className="flex flex-wrap gap-6 justify-center text-center">
                <div>
                  <p className="text-xs text-brown-400 uppercase tracking-wide mb-1">Key</p>
                  <p className="font-nunito font-bold text-brown-800">{metadata.key_signature}</p>
                </div>
                <div>
                  <p className="text-xs text-brown-400 uppercase tracking-wide mb-1">Time</p>
                  <p className="font-nunito font-bold text-brown-800">{metadata.time_signature}</p>
                </div>
                <div>
                  <p className="text-xs text-brown-400 uppercase tracking-wide mb-1">Tempo</p>
                  <p className="font-nunito font-bold text-brown-800">{metadata.tempo_bpm} BPM</p>
                </div>
                <div>
                  <p className="text-xs text-brown-400 uppercase tracking-wide mb-1">Measures</p>
                  <p className="font-nunito font-bold text-brown-800">{metadata.measure_count}</p>
                </div>
                <div>
                  <p className="text-xs text-brown-400 uppercase tracking-wide mb-1">Notes found</p>
                  <p className="font-nunito font-bold text-brown-800">
                    {notes.filter((n) => !n.is_rest).length}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
