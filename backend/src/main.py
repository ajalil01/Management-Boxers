from fastapi import FastAPI
from src.api import api_router
from src.db.database import engine
from src.db.base import Base
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Management Boxers API")

# ✅ ADD THIS BLOCK
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
        # "http://localhost:5173",
        # "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "Alive"}

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")