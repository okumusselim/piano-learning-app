import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { useMusicStore } from '../store/musicStore';
import { usePitchDetection } from './usePitchDetection';
import { usePlayback } from './usePlayback';

const AUTO_RESUME_DELAY_MS = 3000;
const LAGGING_THRESHOLD_MS = 2500;
const TEMPO_SLOW_FACTOR = 0.9;
const MIN_BPM = 40;

export function usePlayAlong() {
  const {
    playbackNotes,
    currentNoteIndex,
    playbackState,
    bpm,
    setFeedback,
    setCurrentNoteIndex,
    incrementCorrect,
    incrementTotal,
    setBpm,
  } = useMusicStore();

  const { detectedNote, isListening, error: micError, startListening, stopListening } =
    usePitchDetection();
  const { pause, resume } = usePlayback();

  const lastNoteTimeRef = useRef<number>(Date.now());
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expectedNoteRef = useRef<string | null>(null);

  // Track expected note
  useEffect(() => {
    const nonRestNotes = playbackNotes.filter((n) => n.noteName);
    const expected = nonRestNotes[currentNoteIndex] ?? null;
    expectedNoteRef.current = expected?.noteName ?? null;
  }, [currentNoteIndex, playbackNotes]);

  // Detect lagging: if same note is expected for too long, slow down
  useEffect(() => {
    if (!isListening || playbackState !== 'playing') return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastNoteTimeRef.current;
      if (elapsed > LAGGING_THRESHOLD_MS) {
        const newBpm = Math.max(bpm * TEMPO_SLOW_FACTOR, MIN_BPM);
        Tone.Transport.bpm.value = newBpm;
        setBpm(Math.round(newBpm));
        lastNoteTimeRef.current = Date.now(); // reset so we don't keep slowing
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isListening, playbackState, bpm, setBpm]);

  // React to detected notes
  useEffect(() => {
    if (!isListening || !detectedNote || playbackState === 'stopped') return;
    const expected = expectedNoteRef.current;
    if (!expected) return;

    incrementTotal();

    if (detectedNote.noteName === expected) {
      // Correct note
      setFeedback('correct');
      incrementCorrect();
      setCurrentNoteIndex(currentNoteIndex + 1);
      lastNoteTimeRef.current = Date.now();

      // Clear any pending resume timer
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);

      // Resume if paused
      if (playbackState === 'paused') {
        resume();
      }

      // Clear feedback after 1s
      setTimeout(() => setFeedback(null), 1000);
    } else {
      // Wrong note
      setFeedback('incorrect');

      if (playbackState === 'playing') {
        pause();
      }

      // Auto-resume after delay
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = setTimeout(() => {
        setFeedback(null);
        resume();
      }, AUTO_RESUME_DELAY_MS);
    }
  }, [detectedNote]);  // eslint-disable-line react-hooks/exhaustive-deps

  const startPlayAlong = useCallback(async () => {
    await startListening();
    useMusicStore.getState().setPlayAlongMode(true);
    useMusicStore.getState().resetSession();
  }, [startListening]);

  const stopPlayAlong = useCallback(() => {
    stopListening();
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    useMusicStore.getState().setPlayAlongMode(false);
    useMusicStore.getState().setFeedback(null);
  }, [stopListening]);

  return {
    detectedNote,
    isListening,
    micError,
    expectedNote: expectedNoteRef.current,
    startPlayAlong,
    stopPlayAlong,
  };
}
