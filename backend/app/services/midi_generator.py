"""Generate MIDI from MusicXML using music21."""
import logging
import io
import tempfile
import os

from music21 import converter

logger = logging.getLogger(__name__)


def musicxml_to_midi(musicxml_str: str) -> bytes:
    """Convert a MusicXML string to MIDI bytes."""
    # music21 needs to read from a file or string
    s = converter.parseData(musicxml_str, format="musicxml")

    with tempfile.NamedTemporaryFile(suffix=".mid", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        s.write("midi", fp=tmp_path)
        with open(tmp_path, "rb") as f:
            midi_bytes = f.read()
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

    return midi_bytes
