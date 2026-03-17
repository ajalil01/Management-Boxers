from fastapi import HTTPException, status
from uuid import UUID

from src.modules.schedule.schema import (
    ScheduleCreate,
    ScheduleUpdate,
    ScheduleResponse,
    ScheduleResponseModel,
    ScheduleListResponseModel
)
from src.modules.schedule.service import ScheduleService
from src.modules.schedule.utils.logger import logger


class ScheduleController:

    @staticmethod
    async def create_schedule(payload: ScheduleCreate, current_user: dict) -> ScheduleResponseModel:
        coach_id = UUID(current_user["id"])

        new_schedule = await ScheduleService.create_schedule(
            name=payload.name,
            month=payload.month,
            coach_id=coach_id
        )

        return ScheduleResponseModel(
            success=True,
            message="Schedule created successfully",
            data=ScheduleResponse.model_validate(new_schedule)
        )

    @staticmethod
    async def get_schedule_by_id(schedule_id: UUID, current_user: dict) -> ScheduleResponseModel:
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

        return ScheduleResponseModel(
            success=True,
            message="Schedule fetched successfully",
            data=ScheduleResponse.model_validate(schedule)
        )

    @staticmethod
    async def get_all_schedules(current_user: dict) -> ScheduleListResponseModel:
        coach_id = UUID(current_user["id"])
        schedules = await ScheduleService.get_all_schedules_by_coach(coach_id)

        return ScheduleListResponseModel(
            success=True,
            message="Schedules fetched successfully",
            data=[ScheduleResponse.model_validate(s) for s in schedules]
        )

    @staticmethod
    async def update_schedule(schedule_id: UUID, payload: ScheduleUpdate, current_user: dict) -> ScheduleResponseModel:
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

        updated_schedule = await ScheduleService.update_schedule(
            schedule_id,
            name=payload.name,
            month=payload.month
        )

        logger.info(f"[Controller] Schedule updated: {schedule_id}")

        return ScheduleResponseModel(
            success=True,
            message="Schedule updated successfully",
            data=ScheduleResponse.model_validate(updated_schedule)
        )

    @staticmethod
    async def delete_schedule(schedule_id: UUID, current_user: dict) -> ScheduleResponseModel:
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

        await ScheduleService.delete_schedule(schedule_id)

        logger.info(f"[Controller] Schedule deleted: {schedule_id}")

        return ScheduleResponseModel(
            success=True,
            message="Schedule deleted successfully",
            data=None
        )