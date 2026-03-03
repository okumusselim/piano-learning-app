import { useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import { useMusicStore } from '../store/musicStore';
import type { PlaybackNote } from '../types/music';

// Salamander Grand Piano – official Tone.js CDN
const SOUNDFONT_BASE = 'https://tonejs.github.io/audio/salamander/';

let samplerInstance: Tone.Sampler | null = null;
let samplerReady = false;

function getSampler(): Promise<Tone.Sampler> {
  if (samplerInstance && samplerReady) return Promise.resolve(samplerInstance);

  return new Promise((resolve) => {
    samplerInstance = new Tone.Sampler({
      urls: {
        A0: 'A0.mp3',
        C1: 'C1.mp3',
        'D#1': 'Ds1.mp3',
        'F#1': 'Fs1.mp3',
        A1: 'A1.mp3',
        C2: 'C2.mp3',
        'D#2': 'Ds2.mp3',
        'F#2': 'Fs2.mp3',
        A2: 'A2.mp3',
        C3: 'C3.mp3',
        'D#3': 'Ds3.mp3',
        'F#3': 'Fs3.mp3',
        A3: 'A3.mp3',
        C4: 'C4.mp3',
        'D#4': 'Ds4.mp3',
        'F#4': 'Fs4.mp3',
        A4: 'A4.mp3',
        C5: 'C5.mp3',
        'D#5': 'Ds5.mp3',
        'F#5': 'Fs5.mp3',
        A5: 'A5.mp3',
        C6: 'C6.mp3',
        'D#6': 'Ds6.mp3',
        'F#6': 'Fs6.mp3',
        A6: 'A6.mp3',
        C7: 'C7.mp3',
        'D#7': 'Ds7.mp3',
        'F#7': 'Fs7.mp3',
        A7: 'A7.mp3',
        C8: 'C8.mp3',
      },
      baseUrl: SOUNDFONT_BASE,
      onload: () => {
        samplerReady = true;
        resolve(samplerInstance!);
      },
    }).toDestination();
  });
}

export function usePlayback() {
  const { playbackNotes, bpm, setPlaybackState, setCurrentMeasure, setCurrentNoteIndex } =
    useMusicStore();
  const scheduledIds = useRef<number[]>([]);

  const clearScheduled = useCallback(() => {
    scheduledIds.current.forEach((id) => Tone.Transport.clear(id));
    scheduledIds.current = [];
  }, []);

  const play = useCallback(
    async (notes?: PlaybackNote[]) => {
      const notesToPlay = notes ?? playbackNotes;
      if (!notesToPlay.length) return;

      await Tone.start();
      const sampler = await getSampler();

      // Set BPM
      Tone.Transport.bpm.value = bpm;

      // Clear previous
      clearScheduled();
      Tone.Transport.stop();
      Tone.Transport.cancel();

      // Schedule each note
      notesToPlay.forEach((n, i) => {
        const id = Tone.Transport.schedule((time) => {
          sampler.triggerAttackRelease(
            Tone.Frequency(n.midi, 'midi').toNote(),
            Math.max(n.duration - 0.02, 0.05),
            time
          );
          setCurrentNoteIndex(i);
          setCurrentMeasure(n.measure);
        }, n.time);
        scheduledIds.current.push(id as unknown as number);
      });

      // Mark stopped when all notes done
      const totalDuration = notesToPlay[notesToPlay.length - 1].time +
        notesToPlay[notesToPlay.length - 1].duration + 0.5;
      Tone.Transport.schedule(() => {
        setPlaybackState('stopped');
        setCurrentMeasure(0);
        setCurrentNoteIndex(-1);
      }, totalDuration);

      Tone.Transport.start();
      setPlaybackState('playing');
    },
    [playbackNotes, bpm, clearScheduled, setPlaybackState, setCurrentMeasure, setCurrentNoteIndex]
  );

  const pause = useCallback(() => {
    Tone.Transport.pause();
    setPlaybackState('paused');
  }, [setPlaybackState]);

  const resume = useCallback(async () => {
    await Tone.start();
    Tone.Transport.start();
    setPlaybackState('playing');
  }, [setPlaybackState]);

  const stop = useCallback(() => {
    clearScheduled();
    Tone.Transport.stop();
    Tone.Transport.cancel();
    setPlaybackState('stopped');
    setCurrentMeasure(0);
    setCurrentNoteIndex(-1);
  }, [clearScheduled, setPlaybackState, setCurrentMeasure, setCurrentNoteIndex]);

  const setTempoLive = useCallback(
    (newBpm: number) => {
      Tone.Transport.bpm.value = newBpm;
      useMusicStore.getState().setBpm(newBpm);
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearScheduled();
      Tone.Transport.stop();
    };
  }, [clearScheduled]);

  return { play, pause, resume, stop, setTempoLive };
}
