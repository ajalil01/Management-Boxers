from sqlalchemy.future import select
from uuid import UUID

from src.db.database import AsyncSessionLocal as async_session
from src.modules.schedule.model import Schedule
from src.modules.schedule.utils.logger import logger


class ScheduleService:

    @staticmethod
    async def create_schedule(name: str, month: str, coach_id: UUID) -> Schedule:
        try:
            new_schedule = Schedule(name=name, month=month, coach_id=coach_id)

            async with async_session() as session:
                async with session.begin():
                    session.add(new_schedule)
                await session.refresh(new_schedule)

            logger.info(f"[Service] Schedule created: {new_schedule.id} for coach: {coach_id}")
            return new_schedule

        except Exception as e:
            logger.error(f"[Service] Failed to create schedule: {str(e)}")
            raise

    @staticmethod
    async def get_schedule_by_id(schedule_id: UUID) -> Schedule | None:
        try:
            async with async_session() as session:
                result = await session.execute(select(Schedule).where(Schedule.id == schedule_id))
                schedule = result.scalars().first()
                if schedule:
                    logger.debug(f"[Service] Found schedule by id: {schedule_id}")
                return schedule
        except Exception as e:
            logger.error(f"[Service] Error fetching schedule by id ({schedule_id}): {str(e)}")
            raise

    @staticmethod
    async def get_all_schedules_by_coach(coach_id: UUID) -> list[Schedule]:
        try:
            async with async_session() as session:
                result = await session.execute(select(Schedule).where(Schedule.coach_id == coach_id))
                schedules = result.scalars().all()
                logger.info(f"[Service] Fetched all schedules for coach: {coach_id} (count: {len(schedules)})")
                return schedules
        except Exception as e:
            logger.error(f"[Service] Error fetching schedules for coach ({coach_id}): {str(e)}")
            raise

    @staticmethod
    async def update_schedule(schedule_id: UUID, name: str | None = None, month: str | None = None) -> Schedule | None:
        try:
            async with async_session() as session:
                result = await session.execute(select(Schedule).where(Schedule.id == schedule_id))
                schedule = result.scalars().first()
                if not schedule:
                    return None

                if name:
                    schedule.name = name
                if month:
                    schedule.month = month

                await session.commit()
                await session.refresh(schedule)
                logger.info(f"[Service] Updated schedule: {schedule_id}")
                return schedule
        except Exception as e:
            logger.error(f"[Service] Failed to update schedule ({schedule_id}): {str(e)}")
            raise

    @staticmethod
    async def delete_schedule(schedule_id: UUID) -> bool:
        try:
            async with async_session() as session:
                async with session.begin():
                    result = await session.execute(select(Schedule).where(Schedule.id == schedule_id))
                    schedule = result.scalars().first()
                    if not schedule:
                        return False

                    await session.delete(schedule)

                logger.info(f"[Service] Deleted schedule: {schedule_id}")
                return True
        except Exception as e:
            logger.error(f"[Service] Failed to delete schedule ({schedule_id}): {str(e)}")
            raise