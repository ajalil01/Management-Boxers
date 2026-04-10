from sqlalchemy import select, func, extract
from datetime import datetime
from src.db.database import AsyncSessionLocal as async_session

from src.modules.coach.model import Coach
from src.modules.boxer.model import Boxer


class AdminAnalyticsService:

    @staticmethod
    async def get_dashboard_stats():
        async with async_session() as session:

            # total coaches
            total_coaches = (await session.execute(
                select(func.count(Coach.id))
            )).scalar()

            # total boxers
            total_boxers = (await session.execute(
                select(func.count(Boxer.id))
            )).scalar()

            # coaches this month
            now = datetime.utcnow()
            coaches_this_month = (await session.execute(
                select(func.count(Coach.id)).where(
                    extract("month", Coach.created_at) == now.month,
                    extract("year", Coach.created_at) == now.year
                )
            )).scalar()

            avg = total_boxers / total_coaches if total_coaches else 0

            return {
                "total_coaches": total_coaches,
                "total_boxers": total_boxers,
                "coaches_this_month": coaches_this_month,
                "avg_boxers_per_coach": round(avg, 2)
            }

    @staticmethod
    async def get_coach_athletes():
        async with async_session() as session:
            result = await session.execute(
                select(
                    Coach.id,
                    Coach.full_name,
                    func.count(Boxer.id).label("count")
                )
                .join(Boxer, Coach.id == Boxer.coach_id)
                .group_by(Coach.id)
                .order_by(func.count(Boxer.id).desc())
            )

            return [
                {
                    "coach_id": str(row.id),
                    "full_name": row.full_name,
                    "boxers_count": row.count
                }
                for row in result
            ]

    @staticmethod
    async def get_coaches_by_year(year: int):
        async with async_session() as session:
            result = await session.execute(
                select(
                    extract("month", Coach.created_at).label("month"),
                    func.count(Coach.id).label("count")
                )
                .where(extract("year", Coach.created_at) == year)
                .group_by("month")
                .order_by("month")
            )

            return [
                {"month": int(row.month), "count": row.count}
                for row in result
            ]

    @staticmethod
    async def get_boxers_analytics(filter_type: str):
        async with async_session() as session:

            if filter_type == "monthly":
                group = extract("month", Boxer.created_at)
            elif filter_type == "weekly":
                group = extract("week", Boxer.created_at)
            elif filter_type == "yearly":
                group = extract("year", Boxer.created_at)
            else:
                # all together
                total = (await session.execute(
                    select(func.count(Boxer.id))
                )).scalar()

                return [{"label": "all", "count": total}]

            result = await session.execute(
                select(
                    group.label("label"),
                    func.count(Boxer.id).label("count")
                )
                .group_by("label")
                .order_by("label")
            )

            return [
                {"label": str(row.label), "count": row.count}
                for row in result
            ]
        

