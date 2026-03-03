export interface NoteEvent {
  measure: number;
  beat: number;
  pitch: string | null;
  duration: string;
  midi_number: number | null;
  is_rest: boolean;
  staff_position: number;
}

export interface SheetMetadata {
  key_signature: string;
  time_signature: string;
  tempo_bpm: number;
  measure_count: number;
  clef: string;
}

export interface UploadResponse {
  sheet_id: string;
  filename: string;
  page_count: number;
}

export interface OMRResponse {
  sheet_id: string;
  status: 'complete' | 'failed';
  notes: NoteEvent[];
  musicxml: string;
  annotated_image_url: string;
  metadata: SheetMetadata;
  processing_time_ms: number;
  error?: string;
}

export interface NoteAnnotation {
  noteName: string;
  x: number;
  y: number;
  measure: number;
  isActive?: boolean;
}

// Tone.js-compatible note timeline entry
export interface PlaybackNote {
  time: number;       // seconds from start
  midi: number;
  duration: number;   // seconds
  noteName: string;
  measure: number;
}

export type PlaybackState = 'stopped' | 'playing' | 'paused';

export type FeedbackType = 'correct' | 'incorrect' | 'waiting' | null;
