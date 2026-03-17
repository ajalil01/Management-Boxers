from fastapi import HTTPException, status
from uuid import UUID

from src.modules.attendance.schema import (
    AttendanceCreate,
    AttendanceResponse,
    AttendanceResponseModel,
    AttendanceListResponseModel
)
from src.modules.attendance.service import AttendanceService
from src.modules.session.service import SessionService
from src.modules.schedule.service import ScheduleService
from src.modules.boxer.service import BoxerService
from src.modules.attendance.utils.logger import logger


class AttendanceController:

    @staticmethod
    async def _verify_coach_owns_session(session_id: UUID, current_user: dict):
        session = await SessionService.get_session_by_id(session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        schedule = await ScheduleService.get_schedule_by_id(session.schedule_id)
        if str(schedule.coach_id) != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this session"
            )
        return session

    @staticmethod
    async def mark_attendance(session_id: UUID, payload: AttendanceCreate, current_user: dict) -> AttendanceListResponseModel:
        await AttendanceController._verify_coach_owns_session(session_id, current_user)

        # verify all boxers belong to this coach
        for boxer_id in payload.boxer_ids:
            boxer = await BoxerService.get_boxer_by_id(boxer_id)
            if not boxer:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Boxer {boxer_id} not found"
                )
            if str(boxer.coach_id) != current_user["id"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Boxer {boxer_id} does not belong to you"
                )

        records = await AttendanceService.mark_attendance(session_id, payload.boxer_ids)

        return AttendanceListResponseModel(
            success=True,
            message=f"{len(records)} boxers marked as attended",
            data=[AttendanceResponse.model_validate(r) for r in records]
        )

    @staticmethod
    async def get_attendance_by_session(session_id: UUID, current_user: dict) -> AttendanceListResponseModel:
        if current_user["role"] == "coach":
            await AttendanceController._verify_coach_owns_session(session_id, current_user)
        elif current_user["role"] == "boxer":
            # boxer can only see sessions they attended
            attendances = await AttendanceService.get_attendance_by_session(session_id)
            boxer_ids = [str(a.boxer_id) for a in attendances]
            if current_user["id"] not in boxer_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You were not part of this session"
                )

        attendances = await AttendanceService.get_attendance_by_session(session_id)

        return AttendanceListResponseModel(
            success=True,
            message="Attendance fetched successfully",
            data=[AttendanceResponse.model_validate(a) for a in attendances]
        )

    @staticmethod
    async def get_my_attendance(current_user: dict) -> AttendanceListResponseModel:
        boxer_id = UUID(current_user["id"])
        attendances = await AttendanceService.get_attendance_by_boxer(boxer_id)

        return AttendanceListResponseModel(
            success=True,
            message="Your attendance fetched successfully",
            data=[AttendanceResponse.model_validate(a) for a in attendances]
        )

    @staticmethod
    async def unmark_attendance(session_id: UUID, boxer_id: UUID, current_user: dict) -> AttendanceResponseModel:
        await AttendanceController._verify_coach_owns_session(session_id, current_user)

        deleted = await AttendanceService.unmark_attendance(session_id, boxer_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Attendance record not found"
            )

        logger.info(f"[Controller] Unmarked boxer: {boxer_id} from session: {session_id}")

        return AttendanceResponseModel(
            success=True,
            message="Boxer unmarked from session",
            data=None
        )