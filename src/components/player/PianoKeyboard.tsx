interface PianoKeyboardProps {
  highlightedNote?: string | null;  // expected note (amber)
  userNote?: string | null;          // detected note (green if match, red if not)
  startOctave?: number;
  endOctave?: number;
}

function buildAllKeys(startOctave: number, endOctave: number) {
  const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const keys = [];
  for (let oct = startOctave; oct <= endOctave; oct++) {
    for (const name of allNotes) {
      keys.push({ note: `${name}${oct}`, isBlack: name.includes('#') });
    }
  }
  return keys;
}

export function PianoKeyboard({
  highlightedNote,
  userNote,
  startOctave = 3,
  endOctave = 5,
}: PianoKeyboardProps) {
  const allKeys = buildAllKeys(startOctave, endOctave);
  const whiteKeys = allKeys.filter((k) => !k.isBlack);

  const getKeyColor = (note: string, isBlack: boolean) => {
    const isExpected = highlightedNote === note;
    const isUser = userNote === note;
    const isMatch = isExpected && isUser;
    const isWrong = !isExpected && isUser && !!highlightedNote;

    if (isMatch) return isBlack ? 'bg-green-400' : 'bg-green-300';
    if (isExpected) return isBlack ? 'bg-amber-500' : 'bg-amber-300';
    if (isWrong) return isBlack ? 'bg-red-400' : 'bg-red-200';
    return isBlack ? 'bg-brown-800' : 'bg-white';
  };

  const whiteKeyWidth = 100 / whiteKeys.length;

  return (
    <div className="relative w-full h-28 bg-brown-900 rounded-2xl p-2 overflow-hidden select-none">
      <div className="relative w-full h-full">
        {/* White keys */}
        {whiteKeys.map((k, i) => (
          <div
            key={k.note}
            className={`
              absolute bottom-0 rounded-b-lg border border-amber-200/30
              transition-colors duration-100
              ${getKeyColor(k.note, false)}
            `}
            style={{
              left: `${i * whiteKeyWidth}%`,
              width: `${whiteKeyWidth - 0.3}%`,
              height: '100%',
            }}
            title={k.note}
          />
        ))}

        {/* Black keys — positioned between whites */}
        {whiteKeys.map((wk, i) => {
          const pitchClass = wk.note.replace(/\d+$/, '');
          const octave = parseInt(wk.note.replace(/[^0-9]/g, ''));
          const blackAfter: Record<string, string> = {
            C: `C#${octave}`, D: `D#${octave}`, F: `F#${octave}`,
            G: `G#${octave}`, A: `A#${octave}`,
          };
          const blackNote = blackAfter[pitchClass];
          if (!blackNote) return null;

          const bk = allKeys.find((k) => k.note === blackNote);
          if (!bk) return null;

          return (
            <div
              key={blackNote}
              className={`
                absolute z-10 rounded-b-md
                transition-colors duration-100
                ${getKeyColor(blackNote, true)}
              `}
              style={{
                left: `${(i + 0.65) * whiteKeyWidth}%`,
                width: `${whiteKeyWidth * 0.6}%`,
                height: '60%',
                top: 0,
              }}
              title={blackNote}
            />
          );
        })}
      </div>
    </div>
  );
}
