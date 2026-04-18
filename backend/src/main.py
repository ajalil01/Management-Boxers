from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from src.api import api_router
from src.db.database import engine
from src.db.base import Base

from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from src.core.limiter import limiter


app = FastAPI(title="Management Boxers API")


# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # allow_origins=os.getenv("ALLOWED_ORIGINS", "").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization","Content-Type","Accept"]
)


# ---------------- RATE LIMITER ----------------
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)


# ---------------- ROUTES ----------------
app.include_router(api_router, prefix="/api")


# ---------------- STARTUP ----------------
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# ---------------- ROOT ----------------
@app.get("/")
async def root():
    return {"message": "Alive"}


# ---------------- STATIC ----------------
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

