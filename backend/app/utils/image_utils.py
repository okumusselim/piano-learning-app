"""Image preprocessing utilities for sheet music."""
import io
import base64
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter


MAX_WIDTH = 2000
MAX_HEIGHT = 3000


def preprocess_image(image_bytes: bytes) -> bytes:
    """Resize, sharpen and enhance contrast for better OMR accuracy."""
    img = Image.open(io.BytesIO(image_bytes))

    # Convert to RGB (handles RGBA, palette, etc.)
    if img.mode != "RGB":
        img = img.convert("RGB")

    # Resize if too large, maintaining aspect ratio
    w, h = img.size
    if w > MAX_WIDTH or h > MAX_HEIGHT:
        ratio = min(MAX_WIDTH / w, MAX_HEIGHT / h)
        img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)

    # Slight sharpening helps with scanned sheets
    img = img.filter(ImageFilter.SHARPEN)

    # Boost contrast slightly
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.2)

    out = io.BytesIO()
    img.save(out, format="JPEG", quality=92)
    return out.getvalue()


def pdf_to_images(pdf_bytes: bytes) -> list[bytes]:
    """Convert a PDF to a list of page images (one per page)."""
    try:
        from pdf2image import convert_from_bytes
    except ImportError:
        raise RuntimeError("pdf2image is not installed or poppler is missing")

    pil_images = convert_from_bytes(pdf_bytes, dpi=200, fmt="jpeg")
    result = []
    for img in pil_images:
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=92)
        result.append(buf.getvalue())
    return result


def image_to_base64(image_bytes: bytes) -> str:
    """Encode image bytes to base64 string for API calls."""
    return base64.b64encode(image_bytes).decode("utf-8")


def detect_media_type(image_bytes: bytes) -> str:
    """Detect image media type from magic bytes."""
    if image_bytes[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if image_bytes[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    return "image/jpeg"
