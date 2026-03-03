"""Temporary file storage keyed by sheet_id (UUID)."""
import os
import uuid
import shutil
from pathlib import Path

from app.config import settings


def _sheet_dir(sheet_id: str) -> Path:
    return Path(settings.temp_dir) / sheet_id


def create_sheet(file_bytes: bytes, filename: str) -> str:
    """Save an uploaded file, return the sheet_id."""
    sheet_id = str(uuid.uuid4())
    dir_path = _sheet_dir(sheet_id)
    dir_path.mkdir(parents=True, exist_ok=True)

    ext = Path(filename).suffix.lower()
    (dir_path / f"original{ext}").write_bytes(file_bytes)
    # Store original filename for reference
    (dir_path / "meta.txt").write_text(filename)

    return sheet_id


def get_original(sheet_id: str) -> tuple[bytes, str]:
    """Return (bytes, extension) of the original uploaded file."""
    dir_path = _sheet_dir(sheet_id)
    for ext in [".jpg", ".jpeg", ".png", ".pdf"]:
        p = dir_path / f"original{ext}"
        if p.exists():
            return p.read_bytes(), ext
    raise FileNotFoundError(f"No original file for sheet_id={sheet_id}")


def save_file(sheet_id: str, name: str, data: bytes) -> str:
    """Save an intermediate file (annotated image, midi, musicxml) and return its path."""
    dir_path = _sheet_dir(sheet_id)
    dir_path.mkdir(parents=True, exist_ok=True)
    p = dir_path / name
    p.write_bytes(data)
    return str(p)


def get_file(sheet_id: str, name: str) -> bytes:
    """Retrieve a stored intermediate file."""
    p = _sheet_dir(sheet_id) / name
    if not p.exists():
        raise FileNotFoundError(f"File {name} not found for sheet_id={sheet_id}")
    return p.read_bytes()


def sheet_exists(sheet_id: str) -> bool:
    return _sheet_dir(sheet_id).exists()


def cleanup_sheet(sheet_id: str) -> None:
    dir_path = _sheet_dir(sheet_id)
    if dir_path.exists():
        shutil.rmtree(dir_path)
