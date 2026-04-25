from pydantic import BaseModel, Field, model_validator
from uuid import UUID
from typing import List, Optional
from datetime import date
from datetime import datetime


class RPEEntryBase(BaseModel):
    session_rpe: int = Field(..., ge=1, le=10, description="Session difficulty 1-10")
    fatigue: Optional[int] = Field(None, ge=1, le=10)
    sleep_quality: Optional[int] = Field(None, ge=1, le=10)
    soreness: Optional[int] = Field(None, ge=1, le=10)
    stress: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = None
    entry_date: date
    session_id: Optional[UUID] = None


class RPEEntryCreate(RPEEntryBase):
    boxer_id: UUID


class RPEEntryUpdate(BaseModel):
    session_rpe: Optional[int] = Field(None, ge=1, le=10)
    fatigue: Optional[int] = Field(None, ge=1, le=10)
    sleep_quality: Optional[int] = Field(None, ge=1, le=10)
    soreness: Optional[int] = Field(None, ge=1, le=10)
    stress: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = None
    entry_date: Optional[date] = None
    session_id: Optional[UUID] = None


class RPEEntryResponse(RPEEntryBase):
    id: UUID
    boxer_id: UUID
    created_at: datetime
    
    model_config = {
        "from_attributes": True,
        "json_encoders": {UUID: str},
    }


class RPEEntryResponseModel(BaseModel):
    success: bool
    message: str
    data: Optional[RPEEntryResponse] = None


class RPEEntryListResponseModel(BaseModel):
    success: bool
    message: str
    data: List[RPEEntryResponse]


class RPEStats(BaseModel):
    boxer_id: UUID
    boxer_name: str
    avg_session_rpe: float
    avg_fatigue: Optional[float]
    avg_sleep: Optional[float]
    avg_soreness: Optional[float]
    avg_stress: Optional[float]
    total_entries: int
    trend: str  # "improving", "stable", "declining"


class RPEStatsResponseModel(BaseModel):
    success: bool
    message: str
    data: Optional[RPEStats] = None


class BoxerRPEHistory(BaseModel):
    boxer_id: UUID
    boxer_name: str
    entries: List[RPEEntryResponse]


class RPEHistoryResponseModel(BaseModel):
    success: bool
    message: str
    data: Optional[BoxerRPEHistory] = None

    