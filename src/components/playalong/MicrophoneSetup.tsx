import { Mic, MicOff } from 'lucide-react';
import { Button } from '../ui/Button';

interface MicrophoneSetupProps {
  isListening: boolean;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
}

export function MicrophoneSetup({ isListening, error, onStart, onStop }: MicrophoneSetupProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {error && (
        <p className="text-red-600 text-sm text-center max-w-xs">{error}</p>
      )}

      <Button
        variant={isListening ? 'secondary' : 'primary'}
        size="lg"
        onClick={isListening ? onStop : onStart}
        className="gap-3"
      >
        {isListening ? (
          <>
            <MicOff className="w-6 h-6" />
            Stop Listening
          </>
        ) : (
          <>
            <Mic className="w-6 h-6" />
            Start Play-Along
          </>
        )}
      </Button>

      {isListening && (
        <p className="text-sm text-brown-500 text-center">
          Play each note on your piano — I'm listening!
        </p>
      )}
    </div>
  );
}
