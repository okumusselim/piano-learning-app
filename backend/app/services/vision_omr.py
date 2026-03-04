"""
Optical Music Recognition via Claude vision API.
Converts a sheet music image to a structured JSON representation of notes.
"""
import json
import re
import logging
from typing import Any

import anthropic

from app.config import settings
from app.utils.image_utils import image_to_base64, detect_media_type
from app.utils.music_theory import is_valid_pitch, is_valid_duration

logger = logging.getLogger(__name__)

SHEET_MUSIC_PROMPT = """You are analyzing beginner piano sheet music from a learning book.
Extract all musical information and return ONLY valid JSON — no markdown, no explanation, just the JSON object.

Return this exact structure:
{
  "clef": "treble",
  "key_signature": "C major",
  "time_signature": "4/4",
  "tempo_bpm": 120,
  "measures": [
    {
      "measure_number": 1,
      "notes": [
        {
          "pitch": "C4",
          "duration": "quarter",
          "beat": 1.0,
          "is_rest": false,
          "staff_position": 0.5
        }
      ]
    }
  ]
}

Rules:
- clef: "treble", "bass", or "grand_staff"
- key_signature: e.g. "C major", "G major", "F major", "D minor"
- time_signature: e.g. "4/4", "3/4", "2/4", "6/8"
- tempo_bpm: integer, default 120 if not marked
- pitch: scientific notation — C4 = middle C, A4 = 440Hz
- duration: one of "whole", "half", "quarter", "eighth", "sixteenth"
- beat: 1-indexed beat within the measure (e.g. 1.0, 1.5, 2.0, 2.5)
- is_rest: true for rest notes (set pitch to null for rests)
- staff_position: 0.0 (top of staff area) to 1.0 (bottom), for label placement on screen
- For dotted notes, use the next longer duration as an approximation
- If a note is unclear, make your best estimate — do not omit any notes
- For grand staff (both clef), still list all notes from both staves in each measure

This is beginner sheet music — it will be simple melodies, not complex harmonies."""


def _parse_llm_json(raw: str) -> dict[str, Any]:
    """Extract and parse JSON from LLM response, handling markdown fences."""
    # Strip markdown code fences if present
    raw = raw.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw)
    if match:
        raw = match.group(1)
    return json.loads(raw)


def _validate_and_clean(data: dict[str, Any]) -> dict[str, Any]:
    """Validate the LLM output and clean up common issues."""
    # Ensure required keys
    data.setdefault("clef", "treble")
    data.setdefault("key_signature", "C major")
    data.setdefault("time_signature", "4/4")
    data.setdefault("tempo_bpm", 120)
    data.setdefault("measures", [])

    cleaned_measures = []
    for measure in data["measures"]:
        cleaned_notes = []
        for note in measure.get("notes", []):
            is_rest = note.get("is_rest", False)
            pitch = note.get("pitch")
            duration = note.get("duration", "quarter")

            # Validate duration
            if not is_valid_duration(duration):
                duration = "quarter"

            # Validate pitch for non-rests
            if not is_rest and pitch:
                if not is_valid_pitch(pitch):
                    logger.warning(f"Invalid pitch skipped: {pitch}")
                    continue

            cleaned_notes.append({
                "pitch": pitch if not is_rest else None,
                "duration": duration,
                "beat": float(note.get("beat", 1.0)),
                "is_rest": is_rest,
                "staff_position": float(note.get("staff_position", 0.5)),
            })

        if cleaned_notes:
            cleaned_measures.append({
                "measure_number": measure.get("measure_number", len(cleaned_measures) + 1),
                "notes": cleaned_notes,
            })

    data["measures"] = cleaned_measures
    return data


def extract_notes(image_bytes: bytes) -> dict[str, Any]:
    """
    Call Claude vision API to extract notes from sheet music image.
    Returns validated structured dict. Retries once on parse failure.
    """
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    media_type = detect_media_type(image_bytes)
    b64 = image_to_base64(image_bytes)

    def _call_api() -> str:
        message = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=8096,
            temperature=0,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": b64,
                            },
                        },
                        {
                            "type": "text",
                            "text": SHEET_MUSIC_PROMPT,
                        },
                    ],
                }
            ],
        )
        return message.content[0].text

    # First attempt
    try:
        raw = _call_api()
        data = _parse_llm_json(raw)
        return _validate_and_clean(data)
    except (json.JSONDecodeError, KeyError) as e:
        logger.warning(f"First OMR attempt failed: {e} — retrying")

    # Retry with a more explicit prompt
    retry_message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=8096,
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": b64,
                        },
                    },
                    {
                        "type": "text",
                        "text": SHEET_MUSIC_PROMPT
                        + "\n\nIMPORTANT: Return ONLY the JSON object, starting with { and ending with }. No other text.",
                    },
                ],
            }
        ],
    )
    raw = retry_message.content[0].text
    data = _parse_llm_json(raw)
    return _validate_and_clean(data)
