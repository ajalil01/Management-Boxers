from pydantic import BaseModel
from uuid import UUID
from typing import List
from datetime import datetime

class AttendanceCreate(BaseModel):
    boxer_ids: List[UUID]

class AttendanceResponse(BaseModel):
    id: UUID
    session_id: UUID
    boxer_id: UUID
    attended_at: datetime

    model_config = {
        "from_attributes": True,
        "json_encoders": {UUID: str},
    }

class AttendanceResponseModel(BaseModel):
    success: bool
    message: str
    data: AttendanceResponse | None

class AttendanceListResponseModel(BaseModel):
    success: bool
    message: str
    data: List[AttendanceResponse]