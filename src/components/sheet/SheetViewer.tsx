import { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { NoteLabel } from './NoteLabel';
import type { NoteAnnotation } from '../../types/music';

interface SheetViewerProps {
  musicxml: string;
  currentMeasure?: number;
  activeNoteIndex?: number;
}

export function SheetViewer({ musicxml, currentMeasure = 0, activeNoteIndex = -1 }: SheetViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const [annotations, setAnnotations] = useState<NoteAnnotation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !musicxml) return;

    const osmd = new OpenSheetMusicDisplay(containerRef.current, {
      autoResize: true,
      backend: 'svg',
      drawTitle: false,
      drawComposer: false,
      drawLyricist: false,
      drawSubtitle: false,
      drawPartNames: false,
      followCursor: true,
    });

    osmdRef.current = osmd;

    osmd.load(musicxml).then(() => {
      osmd.render();
      setIsLoaded(true);
      extractAnnotations(osmd);
    }).catch((err: Error) => {
      console.error('OSMD render error:', err);
    });

    return () => {
      // OSMD doesn't have a destroy method, just clear the container
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [musicxml]);

  // Advance cursor to current measure during playback
  useEffect(() => {
    if (!osmdRef.current || !isLoaded) return;
    try {
      const cursor = osmdRef.current.cursor;
      if (cursor) {
        cursor.reset();
        // Advance cursor to the current measure
        let steps = 0;
        while (!cursor.Iterator.EndReached && steps < 500) {
          const measureNum = cursor.Iterator.CurrentMeasureIndex;
          if (measureNum >= currentMeasure) break;
          cursor.next();
          steps++;
        }
        cursor.show();
      }
    } catch {
      // cursor may not be available
    }
  }, [currentMeasure, isLoaded]);

  function extractAnnotations(osmd: OpenSheetMusicDisplay) {
    // Maps OSMD NoteEnum (0-6) to letter names
    const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

    const notes: NoteAnnotation[] = [];
    try {
      const measures = osmd.GraphicSheet?.MeasureList;
      if (!measures) return;

      // Use the rendered SVG viewBox for accurate unit-to-pixel conversion.
      // Falls back to OSMD's internal page size, then to safe defaults.
      const containerWidth = containerRef.current?.clientWidth ?? 800;
      const containerHeight = containerRef.current?.clientHeight ?? 400;
      const svg = containerRef.current?.querySelector('svg');
      const vb = svg?.viewBox?.baseVal;
      const sheet = osmd.GraphicSheet;
      const pageWidth =
        (vb?.width && vb.width > 0 ? vb.width : null) ??
        (sheet as any).MusicPages?.[0]?.PositionAndShape?.Size?.width ??
        200;
      const pageHeight =
        (vb?.height && vb.height > 0 ? vb.height : null) ??
        (sheet as any).MusicPages?.[0]?.PositionAndShape?.Size?.height ??
        280;

      measures.forEach((staffMeasures, measureIdx) => {
        staffMeasures?.forEach((measure) => {
          measure?.staffEntries?.forEach((entry) => {
            entry?.graphicalVoiceEntries?.forEach((voiceEntry) => {
              voiceEntry?.notes?.forEach((graphicalNote) => {
                const sourceNote = (graphicalNote as any).sourceNote;
                const pitch = sourceNote?.Pitch;
                if (!pitch) return;

                // FundamentalNote is a numeric NoteEnum (0=C … 6=B); map to letter
                const letter = NOTE_LETTERS[pitch.FundamentalNote as number] ?? String(pitch.FundamentalNote);
                const noteName = `${letter}${pitch.Octave}`;

                const pos = (graphicalNote as any).PositionAndShape?.AbsolutePosition;
                if (!pos) {
                  console.warn('No position for note', noteName, '— skipping label');
                  return;
                }

                // OSMD AbsolutePosition is in OSMD units where 1 unit = 10 SVG user units
                const OSMD_UNIT = 10;
                const x = (pos.x * OSMD_UNIT / pageWidth) * containerWidth;
                const y = (pos.y * OSMD_UNIT / pageHeight) * containerHeight;

                notes.push({ noteName, x, y, measure: measureIdx });
              });
            });
          });
        });
      });
    } catch (e) {
      console.warn('Could not extract note annotations from OSMD:', e);
    }
    setAnnotations(notes);
  }

  return (
    <div className="relative w-full bg-cream rounded-2xl overflow-hidden">
      {/* OSMD renders into this div */}
      <div ref={containerRef} className="w-full" />

      {/* Note name label overlays */}
      <div className="absolute inset-0 pointer-events-none">
        {annotations.map((ann, i) => (
          <NoteLabel
            key={i}
            noteName={ann.noteName}
            x={ann.x}
            y={ann.y}
            isActive={i === activeNoteIndex}
          />
        ))}
      </div>
    </div>
  );
}
