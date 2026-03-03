"""Utility functions for note/MIDI conversions."""

NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

ENHARMONICS = {
    "Db": "C#", "Eb": "D#", "Fb": "E", "Gb": "F#",
    "Ab": "G#", "Bb": "A#", "Cb": "B",
}

DURATION_BEATS = {
    "whole": 4.0,
    "half": 2.0,
    "quarter": 1.0,
    "eighth": 0.5,
    "sixteenth": 0.25,
    "32nd": 0.125,
}


def midi_to_note_name(midi_num: int) -> str:
    """Convert MIDI number to scientific pitch notation (e.g. 60 → 'C4')."""
    octave = (midi_num // 12) - 1
    note = NOTE_NAMES[midi_num % 12]
    return f"{note}{octave}"


def note_name_to_midi(note_name: str) -> int:
    """Convert scientific pitch notation to MIDI number (e.g. 'C4' → 60)."""
    # Handle enharmonics
    for flat, sharp in ENHARMONICS.items():
        note_name = note_name.replace(flat, sharp)

    # Split pitch class from octave
    if len(note_name) >= 3 and note_name[1] == "#":
        pitch_class = note_name[:2]
        octave = int(note_name[2:])
    else:
        pitch_class = note_name[0]
        octave = int(note_name[1:])

    semitone = NOTE_NAMES.index(pitch_class)
    return (octave + 1) * 12 + semitone


def normalize_pitch(pitch: str) -> str:
    """Normalize a pitch string to sharp notation with proper octave."""
    for flat, sharp in ENHARMONICS.items():
        pitch = pitch.replace(flat, sharp)
    return pitch


def is_valid_pitch(pitch: str) -> bool:
    """Check if a pitch string is valid scientific notation."""
    try:
        midi = note_name_to_midi(pitch)
        return 21 <= midi <= 108  # piano range A0–C8
    except (ValueError, IndexError):
        return False


def is_valid_duration(duration: str) -> bool:
    return duration in DURATION_BEATS


def beats_for_duration(duration: str) -> float:
    return DURATION_BEATS.get(duration, 1.0)
