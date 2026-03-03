import { useRef, useState, useCallback } from 'react';
import { PitchDetector } from 'pitchy';
import { frequencyToNoteName, frequencyToMidi } from '../utils/noteHelpers';

interface DetectedNote {
  noteName: string;
  frequency: number;
  clarity: number;
  midi: number;
}

const CLARITY_THRESHOLD = 0.88;
// Piano range: A0 (27.5Hz) to C8 (4186Hz)
const MIN_FREQ = 27.5;
const MAX_FREQ = 4200;

export function usePitchDetection() {
  const [detectedNote, setDetectedNote] = useState<DetectedNote | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const detectorRef = useRef<PitchDetector<Float32Array> | null>(null);

  const startListening = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const audioCtx = new AudioContext({ sampleRate: 44100 });
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);
      analyserRef.current = analyser;

      const detector = PitchDetector.forFloat32Array(analyser.fftSize);
      detectorRef.current = detector;
      const inputBuffer = new Float32Array(detector.inputLength);

      const detect = () => {
        analyser.getFloatTimeDomainData(inputBuffer);
        const [frequency, clarity] = detector.findPitch(inputBuffer, audioCtx.sampleRate);

        if (clarity > CLARITY_THRESHOLD && frequency >= MIN_FREQ && frequency <= MAX_FREQ) {
          const midi = frequencyToMidi(frequency);
          const noteName = frequencyToNoteName(frequency);
          setDetectedNote({ noteName, frequency, clarity, midi });
        }

        animationRef.current = requestAnimationFrame(detect);
      };

      detect();
      setIsListening(true);
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access and try again.');
      } else {
        setError('Could not access microphone. Please check your device settings.');
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    detectorRef.current = null;
    setDetectedNote(null);
    setIsListening(false);
  }, []);

  return { detectedNote, isListening, error, startListening, stopListening };
}
