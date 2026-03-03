"""
Draw note name labels on the sheet music image using Pillow.
"""
import io
import logging
from typing import Any

from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger(__name__)

# Warm amber color palette
LABEL_BG_COLOR = (245, 158, 11, 210)   # amber with alpha
LABEL_TEXT_COLOR = (92, 40, 14)        # dark brown
FONT_SIZE = 14


def annotate_image(image_bytes: bytes, omr_data: dict[str, Any]) -> bytes:
    """
    Draw note name labels on the sheet image.
    staff_position (0.0=top, 1.0=bottom) is used to place labels vertically.
    Notes are distributed horizontally across measures.
    Returns annotated image as JPEG bytes.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    overlay = Image.new("RGBA", img.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay)

    try:
        font = ImageFont.truetype("arial.ttf", FONT_SIZE)
    except (IOError, OSError):
        try:
            font = ImageFont.load_default(size=FONT_SIZE)
        except TypeError:
            font = ImageFont.load_default()

    width, height = img.size
    measures = omr_data.get("measures", [])
    total_measures = len(measures)
    if total_measures == 0:
        img = img.convert("RGB")
        out = io.BytesIO()
        img.save(out, format="JPEG", quality=90)
        return out.getvalue()

    measure_width = width / total_measures

    for measure_idx, measure in enumerate(measures):
        notes_in_measure = [n for n in measure.get("notes", []) if not n.get("is_rest") and n.get("pitch")]
        if not notes_in_measure:
            continue

        note_spacing = measure_width / (len(notes_in_measure) + 1)
        measure_x_start = measure_idx * measure_width

        for note_idx, note_data in enumerate(notes_in_measure):
            pitch = note_data.get("pitch", "")
            if not pitch:
                continue

            # Compute screen position
            x = int(measure_x_start + note_spacing * (note_idx + 1))
            staff_pos = float(note_data.get("staff_position", 0.5))
            # Staff area is roughly middle 60% of image height
            staff_top = height * 0.2
            staff_bottom = height * 0.8
            y = int(staff_top + staff_pos * (staff_bottom - staff_top))

            # Draw pill label
            label = pitch  # e.g. "C4"
            try:
                bbox = font.getbbox(label)
                text_w = bbox[2] - bbox[0]
                text_h = bbox[3] - bbox[1]
            except AttributeError:
                text_w, text_h = font.getsize(label)

            padding = 4
            rx0 = x - text_w // 2 - padding
            ry0 = y - text_h // 2 - padding - 18  # place above the note
            rx1 = x + text_w // 2 + padding
            ry1 = y - 18 + text_h // 2 + padding

            # Rounded rect pill
            draw.rounded_rectangle(
                [rx0, ry0, rx1, ry1],
                radius=6,
                fill=LABEL_BG_COLOR,
            )
            draw.text(
                (rx0 + padding, ry0 + padding),
                label,
                font=font,
                fill=LABEL_TEXT_COLOR,
            )

    # Flatten RGBA onto white background
    background = Image.new("RGBA", img.size, (255, 248, 240, 255))  # cream
    combined = Image.alpha_composite(background, img)
    combined = Image.alpha_composite(combined, overlay)
    combined = combined.convert("RGB")

    out = io.BytesIO()
    combined.save(out, format="JPEG", quality=90)
    return out.getvalue()
