# src/modules/session/controller.py
from fastapi import HTTPException, status
from uuid import UUID

from src.modules.session.schema import (
    SessionCreate,
    SessionUpdate,
    SessionResponse,
    SessionResponseModel,
    SessionListResponseModel
)
from src.modules.session.service import SessionService
from src.modules.schedule.service import ScheduleService
from src.modules.session.utils.logger import logger


class SessionController:

    @staticmethod
    async def create_session(schedule_id: UUID, payload: SessionCreate, current_user: dict) -> SessionResponseModel:
        schedule = await ScheduleService.get_schedule_by_id(schedule_id)

        if not schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Schedule not found"
            )

        if str(schedule.coach_id) != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this schedule"
            )

        new_session = await SessionService.create_session(
            name=payload.name,
            session_date=payload.session_date,
            start_time=payload.start_time,
            end_time=payload.end_time,
            schedule_id=schedule_id
        )

        return SessionResponseModel(
            success=True,
            message="Session created successfully",
            data=SessionResponse.model_validate(new_session)
        )

    @staticmethod
    async def get_session_by_id(session_id: UUID, current_user: dict) -> SessionResponseModel:
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

        return SessionResponseModel(
            success=True,
            message="Session fetched successfully",
            data=SessionResponse.model_validate(session)
        )

    @staticmethod
    async def get_all_sessions(schedule_id: UUID, current_user: dict) -> SessionListResponseModel:
        schedule = await ScheduleService.get_schedule_by_id(schedule_id)

        if not schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Schedule not found"
            )

        if str(schedule.coach_id) != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this schedule"
            )

        sessions = await SessionService.get_all_sessions_by_schedule(schedule_id)

        return SessionListResponseModel(
            success=True,
            message="Sessions fetched successfully",
            data=[SessionResponse.model_validate(s) for s in sessions]
        )

    @staticmethod
    async def update_session(session_id: UUID, payload: SessionUpdate, current_user: dict) -> SessionResponseModel:
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

        updated_session = await SessionService.update_session(
            session_id,
            name=payload.name,
            session_date=payload.session_date,
            start_time=payload.start_time,  # ADD THIS
            end_time=payload.end_time       # ADD THIS
        )

        logger.info(f"[Controller] Session updated: {session_id}")

        return SessionResponseModel(
            success=True,
            message="Session updated successfully",
            data=SessionResponse.model_validate(updated_session)
        )

    @staticmethod
    async def delete_session(session_id: UUID, current_user: dict) -> SessionResponseModel:
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

        await SessionService.delete_session(session_id)

        logger.info(f"[Controller] Session deleted: {session_id}")

        return SessionResponseModel(
            success=True,
            message="Session deleted successfully",
            data=None
        )
    
    