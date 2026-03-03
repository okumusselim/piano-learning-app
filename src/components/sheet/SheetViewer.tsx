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
    const notes: NoteAnnotation[] = [];
    try {
      const measures = osmd.GraphicSheet?.MeasureList;
      if (!measures) return;

      let noteIndex = 0;
      measures.forEach((staffMeasures, measureIdx) => {
        staffMeasures?.forEach((measure) => {
          measure?.staffEntries?.forEach((entry) => {
            entry?.graphicalVoiceEntries?.forEach((voiceEntry) => {
              voiceEntry?.notes?.forEach((graphicalNote) => {
                const sourceNote = (graphicalNote as any).sourceNote;
                const pitch = sourceNote?.Pitch;
                if (!pitch) return;

                const noteName = `${pitch.FundamentalNote}${pitch.Octave}`;
                const pos = (graphicalNote as any).PositionAndShape?.AbsolutePosition;
                if (!pos) return;

                // Convert OSMD units to pixels
                // OSMD uses a unit system where ~10 units ≈ 1 measure width
                const containerWidth = containerRef.current?.clientWidth ?? 800;
                const containerHeight = containerRef.current?.clientHeight ?? 400;
                const sheet = osmd.GraphicSheet;
                const pageWidth = (sheet as any).MusicPages?.[0]?.PositionAndShape?.Size?.width ?? 200;
                const pageHeight = (sheet as any).MusicPages?.[0]?.PositionAndShape?.Size?.height ?? 280;

                const x = (pos.x / pageWidth) * containerWidth;
                const y = (pos.y / pageHeight) * containerHeight;

                notes.push({
                  noteName,
                  x,
                  y,
                  measure: measureIdx,
                });
                noteIndex++;
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
