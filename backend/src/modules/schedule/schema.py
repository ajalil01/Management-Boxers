from pydantic import BaseModel
from uuid import UUID
from typing import List

class ScheduleCreate(BaseModel):
    name: str
    month: str  # format: YYYY-MM

class ScheduleUpdate(BaseModel):
    name: str | None = None
    month: str | None = None

class ScheduleResponse(BaseModel):
    id: UUID
    name: str
    month: str
    coach_id: UUID

    model_config = {
        "from_attributes": True,
        "json_encoders": {UUID: str},
    }

class ScheduleResponseModel(BaseModel):
    success: bool
    message: str
    data: ScheduleResponse | None

class ScheduleListResponseModel(BaseModel):
    success: bool
    message: str
    data: List[ScheduleResponse]