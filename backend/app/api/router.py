from fastapi import APIRouter
from app.api.endpoints import upload, omr, midi, health

router = APIRouter()

router.include_router(health.router, tags=["health"])
router.include_router(upload.router, prefix="/api/v1", tags=["upload"])
router.include_router(omr.router, prefix="/api/v1", tags=["omr"])
router.include_router(midi.router, prefix="/api/v1", tags=["midi"])
