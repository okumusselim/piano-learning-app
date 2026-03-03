"""
Convert OMR JSON output to MusicXML via music21.
"""
import logging
from typing import Any

from music21 import stream, note, chord, meter, key, tempo, clef as m21_clef
from music21 import duration as m21_duration

logger = logging.getLogger(__name__)

DURATION_MAP = {
    "whole": 4.0,
    "half": 2.0,
    "quarter": 1.0,
    "eighth": 0.5,
    "sixteenth": 0.25,
    "32nd": 0.125,
}

CLEF_MAP = {
    "treble": m21_clef.TrebleClef,
    "bass": m21_clef.BassClef,
    "grand_staff": m21_clef.TrebleClef,  # simplified: use treble for single staff
}


def build_musicxml(omr_data: dict[str, Any]) -> str:
    """
    Convert structured OMR dict to MusicXML string.
    Returns the MusicXML as a string.
    """
    s = stream.Score()
    part = stream.Part()

    # Clef
    clef_class = CLEF_MAP.get(omr_data.get("clef", "treble"), m21_clef.TrebleClef)
    part.append(clef_class())

    # Key signature
    key_str = omr_data.get("key_signature", "C major")
    try:
        if "major" in key_str.lower():
            tonic = key_str.replace("major", "").strip()
            ks = key.Key(tonic, "major")
        elif "minor" in key_str.lower():
            tonic = key_str.replace("minor", "").strip()
            ks = key.Key(tonic, "minor")
        else:
            ks = key.Key("C", "major")
        part.append(ks)
    except Exception as e:
        logger.warning(f"Could not parse key signature '{key_str}': {e}")
        part.append(key.Key("C", "major"))

    # Time signature
    ts_str = omr_data.get("time_signature", "4/4")
    try:
        ts = meter.TimeSignature(ts_str)
        part.append(ts)
    except Exception as e:
        logger.warning(f"Could not parse time signature '{ts_str}': {e}")
        part.append(meter.TimeSignature("4/4"))

    # Tempo
    bpm = omr_data.get("tempo_bpm", 120)
    try:
        mm = tempo.MetronomeMark(number=int(bpm))
        part.append(mm)
    except Exception as e:
        logger.warning(f"Could not set tempo {bpm}: {e}")

    # Notes
    for measure_data in omr_data.get("measures", []):
        m = stream.Measure(number=measure_data.get("measure_number", 0))

        for note_data in measure_data.get("notes", []):
            dur_name = note_data.get("duration", "quarter")
            dur_quarters = DURATION_MAP.get(dur_name, 1.0)
            d = m21_duration.Duration(quarterLength=dur_quarters)

            if note_data.get("is_rest") or not note_data.get("pitch"):
                r = note.Rest()
                r.duration = d
                m.append(r)
            else:
                pitch_str = note_data["pitch"]
                try:
                    n = note.Note(pitch_str)
                    n.duration = d
                    m.append(n)
                except Exception as e:
                    logger.warning(f"Skipping invalid note '{pitch_str}': {e}")
                    r = note.Rest()
                    r.duration = d
                    m.append(r)

        if len(m) > 0:
            part.append(m)

    s.append(part)

    # Export to MusicXML string using music21 9.x API
    from music21.musicxml.m21ToXml import GeneralObjectExporter
    xml_bytes = GeneralObjectExporter(s).parse()
    return xml_bytes.decode("utf-8")
