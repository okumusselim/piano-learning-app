import { create } from 'zustand';
import type { NoteEvent, SheetMetadata, PlaybackNote, PlaybackState, FeedbackType } from '../types/music';

interface MusicStore {
  // Sheet data
  sheetId: string | null;
  musicxml: string | null;
  notes: NoteEvent[];
  metadata: SheetMetadata | null;
  annotatedImageUrl: string | null;

  // Playback
  playbackNotes: PlaybackNote[];
  playbackState: PlaybackState;
  currentMeasure: number;
  currentNoteIndex: number;
  bpm: number;

  // Play-along
  isPlayAlongMode: boolean;
  feedback: FeedbackType;
  sessionCorrect: number;
  sessionTotal: number;

  // Actions
  setSheetData: (data: {
    sheetId: string;
    musicxml: string;
    notes: NoteEvent[];
    metadata: SheetMetadata;
    annotatedImageUrl: string;
  }) => void;
  setPlaybackNotes: (notes: PlaybackNote[]) => void;
  setPlaybackState: (state: PlaybackState) => void;
  setCurrentMeasure: (measure: number) => void;
  setCurrentNoteIndex: (index: number) => void;
  setBpm: (bpm: number) => void;
  setPlayAlongMode: (active: boolean) => void;
  setFeedback: (feedback: FeedbackType) => void;
  incrementCorrect: () => void;
  incrementTotal: () => void;
  resetSession: () => void;
  reset: () => void;
}

export const useMusicStore = create<MusicStore>((set) => ({
  sheetId: null,
  musicxml: null,
  notes: [],
  metadata: null,
  annotatedImageUrl: null,

  playbackNotes: [],
  playbackState: 'stopped',
  currentMeasure: 0,
  currentNoteIndex: 0,
  bpm: 120,

  isPlayAlongMode: false,
  feedback: null,
  sessionCorrect: 0,
  sessionTotal: 0,

  setSheetData: (data) =>
    set({
      sheetId: data.sheetId,
      musicxml: data.musicxml,
      notes: data.notes,
      metadata: data.metadata,
      annotatedImageUrl: data.annotatedImageUrl,
      bpm: data.metadata.tempo_bpm,
    }),

  setPlaybackNotes: (notes) => set({ playbackNotes: notes }),
  setPlaybackState: (state) => set({ playbackState: state }),
  setCurrentMeasure: (measure) => set({ currentMeasure: measure }),
  setCurrentNoteIndex: (index) => set({ currentNoteIndex: index }),
  setBpm: (bpm) => set({ bpm }),
  setPlayAlongMode: (active) => set({ isPlayAlongMode: active }),
  setFeedback: (feedback) => set({ feedback }),
  incrementCorrect: () => set((s) => ({ sessionCorrect: s.sessionCorrect + 1 })),
  incrementTotal: () => set((s) => ({ sessionTotal: s.sessionTotal + 1 })),
  resetSession: () => set({ sessionCorrect: 0, sessionTotal: 0, currentNoteIndex: 0, feedback: null }),
  reset: () =>
    set({
      sheetId: null,
      musicxml: null,
      notes: [],
      metadata: null,
      annotatedImageUrl: null,
      playbackNotes: [],
      playbackState: 'stopped',
      currentMeasure: 0,
      currentNoteIndex: 0,
      bpm: 120,
      isPlayAlongMode: false,
      feedback: null,
      sessionCorrect: 0,
      sessionTotal: 0,
    }),
}));
