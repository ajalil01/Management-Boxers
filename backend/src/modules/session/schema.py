from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional, TYPE_CHECKING
from datetime import date, time

if TYPE_CHECKING:
    from src.modules.exercise.schema import ExerciseResponse

class SessionCreate(BaseModel):
    name: str
    session_date: date
    start_time: time
    end_time: time

class SessionUpdate(BaseModel):
    name: str | None = None
    session_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None

class SessionResponse(BaseModel):
    id: UUID
    name: str
    session_date: date
    start_time: time
    end_time: time
    schedule_id: UUID
    exercises: List['ExerciseResponse'] = []

    model_config = {
        "from_attributes": True,
        "json_encoders": {UUID: str, time: lambda t: t.strftime('%H:%M')},
    }

class SessionResponseModel(BaseModel):
    success: bool
    message: str
    data: SessionResponse | None

class SessionListResponseModel(BaseModel):
    success: bool
    message: str
    data: List[SessionResponse]

