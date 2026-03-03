import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.services import file_store, midi_generator

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/midi/{sheet_id}")
async def get_midi(sheet_id: str):
    """Generate and return MIDI file for the processed sheet."""
    if not file_store.sheet_exists(sheet_id):
        raise HTTPException(status_code=404, detail="Sheet not found.")

    # Try cached MIDI first
    try:
        midi_bytes = file_store.get_file(sheet_id, "score.mid")
        return Response(
            content=midi_bytes,
            media_type="audio/midi",
            headers={"Content-Disposition": f'attachment; filename="sheet_{sheet_id}.mid"'},
        )
    except FileNotFoundError:
        pass

    # Generate from MusicXML
    try:
        musicxml_bytes = file_store.get_file(sheet_id, "score.xml")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="MusicXML not found. Run OMR first.")

    try:
        musicxml_str = musicxml_bytes.decode("utf-8")
        midi_bytes = midi_generator.musicxml_to_midi(musicxml_str)
        file_store.save_file(sheet_id, "score.mid", midi_bytes)
        logger.info(f"Generated MIDI for sheet_id={sheet_id}, {len(midi_bytes)} bytes")
    except Exception as e:
        logger.error(f"MIDI generation failed for sheet_id={sheet_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"MIDI generation failed: {str(e)}")

    return Response(
        content=midi_bytes,
        media_type="audio/midi",
        headers={"Content-Disposition": f'attachment; filename="sheet_{sheet_id}.mid"'},
    )
