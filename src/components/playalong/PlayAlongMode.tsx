import { useMusicStore } from '../../store/musicStore';
import { usePlayAlong } from '../../hooks/usePlayAlong';
import { MicrophoneSetup } from './MicrophoneSetup';
import { FeedbackBadge } from './FeedbackBadge';
import { PitchMeter } from './PitchMeter';
import { PianoKeyboard } from '../player/PianoKeyboard';

export function PlayAlongMode() {
  const { feedback, sessionCorrect, sessionTotal } = useMusicStore();
  const { detectedNote, isListening, micError, expectedNote, startPlayAlong, stopPlayAlong } =
    usePlayAlong();

  const accuracy = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <MicrophoneSetup
          isListening={isListening}
          error={micError}
          onStart={startPlayAlong}
          onStop={stopPlayAlong}
        />

        {isListening && (
          <div className="flex items-center gap-4 text-sm text-brown-600">
            <span>
              Score: <strong className="text-brown-900">{sessionCorrect}/{sessionTotal}</strong>
            </span>
            <span>
              Accuracy: <strong className="text-amber-600">{accuracy}%</strong>
            </span>
          </div>
        )}
      </div>

      {/* Pitch detection display */}
      {isListening && (
        <div className="flex flex-col items-center gap-4">
          <PitchMeter
            detectedNote={detectedNote?.noteName ?? null}
            clarity={detectedNote?.clarity ?? 0}
            expectedNote={expectedNote}
          />

          {/* Feedback badge */}
          <div className="min-h-[72px] flex items-center">
            <FeedbackBadge feedback={feedback} expectedNote={expectedNote} />
          </div>

          {/* Visual piano */}
          <div className="w-full max-w-lg">
            <PianoKeyboard
              highlightedNote={expectedNote ?? undefined}
              userNote={detectedNote?.noteName}
              startOctave={3}
              endOctave={5}
            />
          </div>

          {expectedNote && (
            <p className="text-center text-brown-600 text-sm">
              Next note: <strong className="text-brown-900 font-mono text-base">{expectedNote}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
