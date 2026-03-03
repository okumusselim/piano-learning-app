import logging
from fastapi import APIRouter, UploadFile, File, HTTPException

from app.config import settings
from app.models.responses import UploadResponse
from app.services import file_store
from app.utils.image_utils import pdf_to_images, preprocess_image

logger = logging.getLogger(__name__)
router = APIRouter()

ALLOWED_TYPES = {
    "image/jpeg", "image/jpg", "image/png",
    "application/pdf",
}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}


@router.post("/upload", response_model=UploadResponse)
async def upload_sheet(file: UploadFile = File(...)):
    """Accept a sheet music file (JPG/PNG/PDF) and store it for processing."""

    # Validate content type
    content_type = (file.content_type or "").lower()
    filename = file.filename or "upload"
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if content_type not in ALLOWED_TYPES and ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail="Unsupported file type. Please upload a JPG, PNG, or PDF.",
        )

    # Read and size-check
    file_bytes = await file.read()
    max_bytes = settings.max_file_size_mb * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {settings.max_file_size_mb}MB.",
        )

    # Determine page count for PDFs
    page_count = 1
    if content_type == "application/pdf" or ext == ".pdf":
        try:
            pages = pdf_to_images(file_bytes)
            page_count = len(pages)
            # Store the first page as the primary image for OMR
            processed_bytes = preprocess_image(pages[0])
            sheet_id = file_store.create_sheet(processed_bytes, filename.replace(".pdf", ".jpg"))
            # Store remaining pages
            for i, page in enumerate(pages[1:], 1):
                processed_page = preprocess_image(page)
                file_store.save_file(sheet_id, f"page_{i}.jpg", processed_page)
        except Exception as e:
            logger.error(f"PDF processing failed: {e}")
            raise HTTPException(status_code=422, detail=f"Could not process PDF: {str(e)}")
    else:
        try:
            processed_bytes = preprocess_image(file_bytes)
        except Exception as e:
            logger.error(f"Image processing failed: {e}")
            raise HTTPException(status_code=422, detail=f"Could not process image: {str(e)}")
        sheet_id = file_store.create_sheet(processed_bytes, filename)

    logger.info(f"Uploaded sheet_id={sheet_id}, pages={page_count}")
    return UploadResponse(sheet_id=sheet_id, filename=filename, page_count=page_count)
