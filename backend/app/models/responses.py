from pydantic import BaseModel
from typing import Literal, Optional


class NoteEvent(BaseModel):
    measure: int
    beat: float
    pitch: Optional[str] = None  # None for rests
    duration: str  # "quarter", "half", "whole", "eighth", "sixteenth"
    midi_number: Optional[int] = None
    is_rest: bool = False
    staff_position: float = 0.5  # 0.0 = top, 1.0 = bottom, for label placement


class SheetMetadata(BaseModel):
    key_signature: str = "C major"
    time_signature: str = "4/4"
    tempo_bpm: int = 120
    measure_count: int = 0
    clef: str = "treble"


class UploadResponse(BaseModel):
    sheet_id: str
    filename: str
    page_count: int


class OMRResponse(BaseModel):
    sheet_id: str
    status: Literal["complete", "failed"]
    notes: list[NoteEvent] = []
    musicxml: str = ""
    annotated_image_url: str = ""
    metadata: SheetMetadata = SheetMetadata()
    processing_time_ms: int = 0
    error: Optional[str] = None
