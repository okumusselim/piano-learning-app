const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const note = NOTE_NAMES[midi % 12];
  return `${note}${octave}`;
}

export function noteNameToMidi(noteName: string): number {
  const enharmonics: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#',
    'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B',
  };
  let name = noteName;
  for (const [flat, sharp] of Object.entries(enharmonics)) {
    name = name.replace(flat, sharp);
  }
  let pitchClass: string;
  let octave: number;
  if (name.length >= 3 && name[1] === '#') {
    pitchClass = name.slice(0, 2);
    octave = parseInt(name.slice(2));
  } else {
    pitchClass = name[0];
    octave = parseInt(name.slice(1));
  }
  const semitone = NOTE_NAMES.indexOf(pitchClass);
  return (octave + 1) * 12 + semitone;
}

export function frequencyToMidi(freq: number): number {
  return Math.round(12 * Math.log2(freq / 440) + 69);
}

export function frequencyToNoteName(freq: number): string {
  return midiToNoteName(frequencyToMidi(freq));
}

// Returns display name without octave for simpler UI (e.g. "C", "F#")
export function pitchClass(noteName: string): string {
  return noteName.replace(/\d+$/, '');
}

export const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const BLACK_KEYS = ['C#', 'D#', 'F#', 'G#', 'A#'];

export function isBlackKey(noteName: string): boolean {
  const pc = pitchClass(noteName);
  return BLACK_KEYS.includes(pc);
}
