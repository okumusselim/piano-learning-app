import time
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from app.models.requests import OMRProcessRequest
from app.models.responses import OMRResponse, NoteEvent, SheetMetadata
from app.services import file_store, vision_omr, musicxml_builder, note_labeler
from app.utils.music_theory import note_name_to_midi

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/omr/process", response_model=OMRResponse)
async def process_omr(request: OMRProcessRequest):
    """
    Run OMR on an uploaded sheet music file.
    Returns annotated image URL, MusicXML, and extracted notes.
    """
    if not file_store.sheet_exists(request.sheet_id):
        raise HTTPException(status_code=404, detail="Sheet not found. Please upload first.")

    start_ms = int(time.time() * 1000)

    try:
        # Load the appropriate page image
        page_name = f"page_{request.page_number}.jpg" if request.page_number > 0 else None
        try:
            if page_name:
                image_bytes = file_store.get_file(request.sheet_id, page_name)
            else:
                image_bytes, _ = file_store.get_original(request.sheet_id)
        except FileNotFoundError:
            image_bytes, _ = file_store.get_original(request.sheet_id)

        # Run vision OMR
        logger.info(f"Starting OMR for sheet_id={request.sheet_id}")
        omr_data = vision_omr.extract_notes(image_bytes)

        # Build MusicXML
        musicxml_str = musicxml_builder.build_musicxml(omr_data)
        file_store.save_file(request.sheet_id, "score.xml", musicxml_str.encode("utf-8"))

        # Generate annotated image
        annotated_bytes = note_labeler.annotate_image(image_bytes, omr_data)
        file_store.save_file(request.sheet_id, "annotated.jpg", annotated_bytes)

        # Build NoteEvent list for frontend
        note_events: list[NoteEvent] = []
        for measure in omr_data.get("measures", []):
            for note_data in measure.get("notes", []):
                pitch = note_data.get("pitch")
                midi_num = None
                if pitch:
                    try:
                        midi_num = note_name_to_midi(pitch)
                    except (ValueError, IndexError):
                        midi_num = None

                note_events.append(NoteEvent(
                    measure=measure.get("measure_number", 0),
                    beat=float(note_data.get("beat", 1.0)),
                    pitch=pitch,
                    duration=note_data.get("duration", "quarter"),
                    midi_number=midi_num,
                    is_rest=note_data.get("is_rest", False),
                    staff_position=float(note_data.get("staff_position", 0.5)),
                ))

        metadata = SheetMetadata(
            key_signature=omr_data.get("key_signature", "C major"),
            time_signature=omr_data.get("time_signature", "4/4"),
            tempo_bpm=omr_data.get("tempo_bpm", 120),
            measure_count=len(omr_data.get("measures", [])),
            clef=omr_data.get("clef", "treble"),
        )

        elapsed = int(time.time() * 1000) - start_ms
        logger.info(f"OMR complete for sheet_id={request.sheet_id} in {elapsed}ms, {len(note_events)} notes")

        return OMRResponse(
            sheet_id=request.sheet_id,
            status="complete",
            notes=note_events,
            musicxml=musicxml_str,
            annotated_image_url=f"/api/v1/sheet/{request.sheet_id}/annotated",
            metadata=metadata,
            processing_time_ms=elapsed,
        )

    except Exception as e:
        elapsed = int(time.time() * 1000) - start_ms
        logger.error(f"OMR failed for sheet_id={request.sheet_id}: {e}", exc_info=True)
        return OMRResponse(
            sheet_id=request.sheet_id,
            status="failed",
            error=str(e),
            processing_time_ms=elapsed,
        )


@router.get("/sheet/{sheet_id}/annotated")
async def get_annotated_image(sheet_id: str):
    """Serve the annotated sheet image."""
    from fastapi.responses import Response
    try:
        image_bytes = file_store.get_file(sheet_id, "annotated.jpg")
        return Response(content=image_bytes, media_type="image/jpeg")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Annotated image not found. Run OMR first.")
