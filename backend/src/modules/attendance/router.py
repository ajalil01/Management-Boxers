from fastapi import APIRouter, Depends
from uuid import UUID

from src.modules.attendance.schema import AttendanceCreate, AttendanceResponseModel, AttendanceListResponseModel
from src.modules.attendance.controller import AttendanceController
from src.middlewares.authorization import require_role
from src.middlewares.authentication import get_current_user

router = APIRouter()

@router.post("/{session_id}/attendance", response_model=AttendanceListResponseModel, status_code=201, dependencies=[Depends(require_role("coach"))])
async def mark_attendance(session_id: UUID, payload: AttendanceCreate, current_user: dict = Depends(get_current_user)):
    return await AttendanceController.mark_attendance(session_id, payload, current_user)

@router.get("/{session_id}/attendance", response_model=AttendanceListResponseModel)
async def get_attendance(session_id: UUID, current_user: dict = Depends(get_current_user)):
    return await AttendanceController.get_attendance_by_session(session_id, current_user)

@router.get("/my-attendance", response_model=AttendanceListResponseModel, dependencies=[Depends(require_role("boxer"))])
async def get_my_attendance(current_user: dict = Depends(get_current_user)):
    return await AttendanceController.get_my_attendance(current_user)

@router.delete("/{session_id}/attendance/{boxer_id}", response_model=AttendanceResponseModel, dependencies=[Depends(require_role("coach"))])
async def unmark_attendance(session_id: UUID, boxer_id: UUID, current_user: dict = Depends(get_current_user)):
    return await AttendanceController.unmark_attendance(session_id, boxer_id, current_user)