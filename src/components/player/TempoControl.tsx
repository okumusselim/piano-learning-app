import { useMusicStore } from '../../store/musicStore';
import { usePlayback } from '../../hooks/usePlayback';

export function TempoControl() {
  const bpm = useMusicStore((s) => s.bpm);
  const { setTempoLive } = usePlayback();

  return (
    <div className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-2xl px-5 py-3 shadow-sm border border-amber-100">
      <span className="text-sm font-medium text-brown-600 whitespace-nowrap">Tempo</span>
      <input
        type="range"
        min={40}
        max={200}
        value={bpm}
        onChange={(e) => setTempoLive(Number(e.target.value))}
        className="w-28 accent-amber-500"
        aria-label="Tempo in BPM"
      />
      <span className="text-sm font-bold text-brown-800 w-12 text-right">{bpm} BPM</span>
    </div>
  );
}
