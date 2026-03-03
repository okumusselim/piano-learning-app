import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.router import router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure temp directory exists
    os.makedirs(settings.temp_dir, exist_ok=True)
    logger.info(f"Piano Learning App starting (env={settings.environment})")
    logger.info(f"Temp dir: {settings.temp_dir}")
    yield
    logger.info("Piano Learning App shutting down")


app = FastAPI(
    title="Piano Learning App API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
async def root():
    return {"message": "Piano Learning App API", "docs": "/docs"}
