from sqlalchemy import func, select
from uuid import UUID
from datetime import date, timedelta
from typing import List, Optional

from src.db.database import AsyncSessionLocal as async_session
from src.modules.rpe.rpe_model import RPEEntry
from src.modules.boxer.model import Boxer
from src.modules.rpe.utils.logger import logger



class RPEService:

    @staticmethod
    async def create_entry(
        boxer_id: UUID,
        session_rpe: int,
        entry_date: date,
        fatigue: Optional[int] = None,
        sleep_quality: Optional[int] = None,
        soreness: Optional[int] = None,
        stress: Optional[int] = None,
        notes: Optional[str] = None,
        session_id: Optional[UUID] = None
    ) -> RPEEntry:
        try:
            async with async_session() as session:
                async with session.begin():
                    # Check if entry already exists for this boxer + date
                    existing = await session.execute(
                        select(RPEEntry).where(
                            RPEEntry.boxer_id == boxer_id,
                            RPEEntry.entry_date == entry_date
                        )
                    )
                    if existing.scalars().first():
                        raise ValueError(f"RPE entry already exists for boxer on {entry_date}")

                    entry = RPEEntry(
                        boxer_id=boxer_id,
                        session_rpe=session_rpe,
                        entry_date=entry_date,
                        fatigue=fatigue,
                        sleep_quality=sleep_quality,
                        soreness=soreness,
                        stress=stress,
                        notes=notes,
                        session_id=session_id
                    )
                    session.add(entry)
                await session.refresh(entry)
                
                logger.info(f"[RPE] Entry created for boxer {boxer_id} on {entry_date}")
                return entry
                
        except Exception as e:
            logger.error(f"[RPE] Failed to create entry: {str(e)}")
            raise

    @staticmethod
    async def get_entry_by_id(entry_id: UUID) -> Optional[RPEEntry]:
        try:
            async with async_session() as session:
                result = await session.execute(
                    select(RPEEntry).where(RPEEntry.id == entry_id)
                )
                return result.scalars().first()
        except Exception as e:
            logger.error(f"[RPE] Error fetching entry {entry_id}: {str(e)}")
            raise

    @staticmethod
    async def get_entries_by_boxer(
        boxer_id: UUID,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        limit: int = 30
    ) -> List[RPEEntry]:
        try:
            async with async_session() as session:
                query = select(RPEEntry).where(RPEEntry.boxer_id == boxer_id)
                
                if start_date:
                    query = query.where(RPEEntry.entry_date >= start_date)
                if end_date:
                    query = query.where(RPEEntry.entry_date <= end_date)
                
                query = query.order_by(RPEEntry.entry_date.desc()).limit(limit)
                result = await session.execute(query)
                return list(result.scalars().all())
                
        except Exception as e:
            logger.error(f"[RPE] Error fetching entries for boxer {boxer_id}: {str(e)}")
            raise

    @staticmethod
    async def get_entries_by_coach(coach_id: UUID, limit: int = 100) -> List[RPEEntry]:
        try:
            async with async_session() as session:
                result = await session.execute(
                    select(RPEEntry)
                    .join(Boxer, RPEEntry.boxer_id == Boxer.id)
                    .where(Boxer.coach_id == coach_id)
                    .order_by(RPEEntry.entry_date.desc())
                    .limit(limit)
                )
                return list(result.scalars().all())
        except Exception as e:
            logger.error(f"[RPE] Error fetching entries for coach {coach_id}: {str(e)}")
            raise

    @staticmethod
    async def update_entry(
        entry_id: UUID,
        session_rpe: Optional[int] = None,
        fatigue: Optional[int] = None,
        sleep_quality: Optional[int] = None,
        soreness: Optional[int] = None,
        stress: Optional[int] = None,
        notes: Optional[str] = None,
        entry_date: Optional[date] = None,
        session_id: Optional[UUID] = None
    ) -> Optional[RPEEntry]:
        try:
            async with async_session() as session:
                result = await session.execute(
                    select(RPEEntry).where(RPEEntry.id == entry_id)
                )
                entry = result.scalars().first()
                
                if not entry:
                    return None

                if session_rpe is not None:
                    entry.session_rpe = session_rpe
                if fatigue is not None:
                    entry.fatigue = fatigue
                if sleep_quality is not None:
                    entry.sleep_quality = sleep_quality
                if soreness is not None:
                    entry.soreness = soreness
                if stress is not None:
                    entry.stress = stress
                if notes is not None:
                    entry.notes = notes
                if entry_date is not None:
                    entry.entry_date = entry_date
                if session_id is not None:
                    entry.session_id = session_id

                await session.commit()
                await session.refresh(entry)
                
                logger.info(f"[RPE] Entry updated: {entry_id}")
                return entry
                
        except Exception as e:
            logger.error(f"[RPE] Failed to update entry {entry_id}: {str(e)}")
            raise

    @staticmethod
    async def delete_entry(entry_id: UUID) -> bool:
        try:
            async with async_session() as session:
                async with session.begin():
                    result = await session.execute(
                        select(RPEEntry).where(RPEEntry.id == entry_id)
                    )
                    entry = result.scalars().first()
                    
                    if not entry:
                        return False
                    
                    await session.delete(entry)
                
                logger.info(f"[RPE] Entry deleted: {entry_id}")
                return True
                
        except Exception as e:
            logger.error(f"[RPE] Failed to delete entry {entry_id}: {str(e)}")
            raise

    @staticmethod
    async def get_boxer_stats(boxer_id: UUID, days: int = 14) -> dict:
        """Calculate rolling averages and trends for a boxer"""
        try:
            end_date = date.today()
            start_date = end_date - timedelta(days=days)
            
            async with async_session() as session:
                result = await session.execute(
                    select(RPEEntry)
                    .where(
                        RPEEntry.boxer_id == boxer_id,
                        RPEEntry.entry_date >= start_date,
                        RPEEntry.entry_date <= end_date
                    )
                    .order_by(RPEEntry.entry_date)
                )
                entries = list(result.scalars().all())
                
                if not entries:
                    return None
                
                # Calculate averages
                avg_rpe = sum(e.session_rpe for e in entries) / len(entries)
                avg_fatigue = sum(e.fatigue for e in entries if e.fatigue) / len([e for e in entries if e.fatigue]) if any(e.fatigue for e in entries) else None
                avg_sleep = sum(e.sleep_quality for e in entries if e.sleep_quality) / len([e for e in entries if e.sleep_quality]) if any(e.sleep_quality for e in entries) else None
                avg_soreness = sum(e.soreness for e in entries if e.soreness) / len([e for e in entries if e.soreness]) if any(e.soreness for e in entries) else None
                avg_stress = sum(e.stress for e in entries if e.stress) / len([e for e in entries if e.stress]) if any(e.stress for e in entries) else None
                
                # Trend: compare first half vs second half
                mid = len(entries) // 2
                if mid > 0:
                    first_half = sum(e.session_rpe for e in entries[:mid]) / mid
                    second_half = sum(e.session_rpe for e in entries[mid:]) / (len(entries) - mid)
                    
                    if second_half < first_half - 0.5:
                        trend = "improving"
                    elif second_half > first_half + 0.5:
                        trend = "declining"
                    else:
                        trend = "stable"
                else:
                    trend = "stable"
                
                return {
                    "avg_session_rpe": round(avg_rpe, 1),
                    "avg_fatigue": round(avg_fatigue, 1) if avg_fatigue else None,
                    "avg_sleep": round(avg_sleep, 1) if avg_sleep else None,
                    "avg_soreness": round(avg_soreness, 1) if avg_soreness else None,
                    "avg_stress": round(avg_stress, 1) if avg_stress else None,
                    "total_entries": len(entries),
                    "trend": trend
                }
                
        except Exception as e:
            logger.error(f"[RPE] Error calculating stats for boxer {boxer_id}: {str(e)}")
            raise