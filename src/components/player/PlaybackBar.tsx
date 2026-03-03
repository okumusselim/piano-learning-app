import { Play, Pause, Square } from 'lucide-react';
import { Button } from '../ui/Button';
import { useMusicStore } from '../../store/musicStore';
import { usePlayback } from '../../hooks/usePlayback';

export function PlaybackBar() {
  const { playbackState, playbackNotes } = useMusicStore();
  const { play, pause, resume, stop } = usePlayback();

  const handlePlayPause = async () => {
    if (playbackState === 'stopped') {
      await play();
    } else if (playbackState === 'playing') {
      pause();
    } else if (playbackState === 'paused') {
      await resume();
    }
  };

  return (
    <div className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-2xl px-5 py-3 shadow-sm border border-amber-100">
      <Button
        variant="primary"
        size="md"
        onClick={handlePlayPause}
        disabled={!playbackNotes.length}
        aria-label={playbackState === 'playing' ? 'Pause' : 'Play'}
      >
        {playbackState === 'playing' ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
        <span className="hidden sm:inline">
          {playbackState === 'playing' ? 'Pause' : playbackState === 'paused' ? 'Resume' : 'Play'}
        </span>
      </Button>

      <Button
        variant="ghost"
        size="md"
        onClick={stop}
        disabled={playbackState === 'stopped'}
        aria-label="Stop"
      >
        <Square className="w-5 h-5" />
        <span className="hidden sm:inline">Stop</span>
      </Button>

      {playbackState !== 'stopped' && (
        <div className="flex items-center gap-2 ml-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-sm text-brown-600 font-medium">
            {playbackState === 'playing' ? 'Playing...' : 'Paused'}
          </span>
        </div>
      )}
    </div>
  );
}
