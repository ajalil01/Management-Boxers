from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from uuid import UUID
from datetime import datetime

from src.db.database import AsyncSessionLocal as async_session
from src.modules.attendance.model import Attendance
from src.modules.attendance.utils.logger import logger


class AttendanceService:

    @staticmethod
    async def mark_attendance(session_id: UUID, boxer_ids: list[UUID]) -> list[Attendance]:
        try:
            records = []
            async with async_session() as db:
                async with db.begin():
                    for boxer_id in boxer_ids:
                        existing = await db.execute(
                            select(Attendance).where(
                                Attendance.session_id == session_id,
                                Attendance.boxer_id == boxer_id
                            )
                        )
                        if existing.scalars().first():
                            continue  # already marked, skip

                        attendance = Attendance(
                            session_id=session_id,
                            boxer_id=boxer_id,
                            attended_at=datetime.utcnow()
                        )
                        db.add(attendance)
                        records.append(attendance)

                # refresh all new records
                for record in records:
                    await db.refresh(record)

            logger.info(f"[Service] Marked {len(records)} boxers for session: {session_id}")
            return records

        except Exception as e:
            logger.error(f"[Service] Failed to mark attendance: {str(e)}")
            raise

    @staticmethod
    async def get_attendance_by_session(session_id: UUID) -> list[Attendance]:
        try:
            async with async_session() as db:
                result = await db.execute(
                    select(Attendance).where(Attendance.session_id == session_id)
                )
                attendances = result.scalars().all()
                logger.info(f"[Service] Fetched attendance for session: {session_id} (count: {len(attendances)})")
                return attendances
        except Exception as e:
            logger.error(f"[Service] Error fetching attendance for session ({session_id}): {str(e)}")
            raise

    @staticmethod
    async def get_attendance_by_boxer(boxer_id: UUID) -> list[Attendance]:
        try:
            async with async_session() as db:
                result = await db.execute(
                    select(Attendance).where(Attendance.boxer_id == boxer_id)
                )
                attendances = result.scalars().all()
                logger.info(f"[Service] Fetched attendance for boxer: {boxer_id} (count: {len(attendances)})")
                return attendances
        except Exception as e:
            logger.error(f"[Service] Error fetching attendance for boxer ({boxer_id}): {str(e)}")
            raise

    @staticmethod
    async def unmark_attendance(session_id: UUID, boxer_id: UUID) -> bool:
        try:
            async with async_session() as db:
                async with db.begin():
                    result = await db.execute(
                        select(Attendance).where(
                            Attendance.session_id == session_id,
                            Attendance.boxer_id == boxer_id
                        )
                    )
                    attendance = result.scalars().first()
                    if not attendance:
                        return False

                    await db.delete(attendance)

                logger.info(f"[Service] Unmarked boxer: {boxer_id} from session: {session_id}")
                return True
        except Exception as e:
            logger.error(f"[Service] Failed to unmark attendance: {str(e)}")
            raise