import { Midi } from '@tonejs/midi';
import { midiToNoteName } from './noteHelpers';
import type { PlaybackNote, NoteEvent } from '../types/music';

export function parseMidiBlob(arrayBuffer: ArrayBuffer): PlaybackNote[] {
  const midi = new Midi(arrayBuffer);
  const notes: PlaybackNote[] = [];

  midi.tracks.forEach((track) => {
    track.notes.forEach((n) => {
      notes.push({
        time: n.time,
        midi: n.midi,
        duration: n.duration,
        noteName: midiToNoteName(n.midi),
        measure: 0, // will be assigned from NoteEvent list if needed
      });
    });
  });

  // Sort by time
  notes.sort((a, b) => a.time - b.time);
  return notes;
}

/**
 * Build a playback timeline directly from NoteEvents (fallback if no MIDI blob).
 * Converts beats to seconds using bpm.
 */
export function noteEventsToPlaybackNotes(events: NoteEvent[], bpm: number): PlaybackNote[] {
  const beatDuration = 60 / bpm;
  const durationMap: Record<string, number> = {
    whole: 4, half: 2, quarter: 1, eighth: 0.5, sixteenth: 0.25,
  };

  let currentTime = 0;
  const notes: PlaybackNote[] = [];

  for (const e of events) {
    if (e.is_rest || !e.pitch || e.midi_number === null) {
      const beats = durationMap[e.duration] ?? 1;
      currentTime += beats * beatDuration;
      continue;
    }
    const beats = durationMap[e.duration] ?? 1;
    const duration = beats * beatDuration;
    notes.push({
      time: currentTime,
      midi: e.midi_number,
      duration,
      noteName: e.pitch,
      measure: e.measure,
    });
    currentTime += duration;
  }

  return notes;
}
