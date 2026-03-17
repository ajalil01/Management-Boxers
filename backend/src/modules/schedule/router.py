from fastapi import APIRouter, Depends
from uuid import UUID

from src.modules.schedule.schema import ScheduleCreate, ScheduleUpdate, ScheduleResponseModel, ScheduleListResponseModel
from src.modules.schedule.controller import ScheduleController
from src.middlewares.authorization import require_role
from src.middlewares.authentication import get_current_user

router = APIRouter()

@router.post("/", response_model=ScheduleResponseModel, status_code=201, dependencies=[Depends(require_role("coach"))])
async def create_schedule(payload: ScheduleCreate, current_user: dict = Depends(get_current_user)):
    return await ScheduleController.create_schedule(payload, current_user)

@router.get("/", response_model=ScheduleListResponseModel, dependencies=[Depends(require_role("coach"))])
async def get_all_schedules(current_user: dict = Depends(get_current_user)):
    return await ScheduleController.get_all_schedules(current_user)

@router.get("/{schedule_id}", response_model=ScheduleResponseModel, dependencies=[Depends(require_role("coach"))])
async def get_schedule(schedule_id: UUID, current_user: dict = Depends(get_current_user)):
    return await ScheduleController.get_schedule_by_id(schedule_id, current_user)

@router.put("/{schedule_id}", response_model=ScheduleResponseModel, dependencies=[Depends(require_role("coach"))])
async def update_schedule(schedule_id: UUID, payload: ScheduleUpdate, current_user: dict = Depends(get_current_user)):
    return await ScheduleController.update_schedule(schedule_id, payload, current_user)

@router.delete("/{schedule_id}", response_model=ScheduleResponseModel, dependencies=[Depends(require_role("coach"))])
async def delete_schedule(schedule_id: UUID, current_user: dict = Depends(get_current_user)):
    return await ScheduleController.delete_schedule(schedule_id, current_user)