from src.modules.analytics.admin.service import AdminAnalyticsService
from src.modules.analytics.admin.schema import (
    DashboardStatsResponse,
    CoachAthletesResponse,
    YearlyCoachesResponse,
    BoxerAnalyticsResponse
)


class AdminAnalyticsController:

    @staticmethod
    async def dashboard():
        data = await AdminAnalyticsService.get_dashboard_stats()

        return DashboardStatsResponse(
            success=True,
            message="Dashboard stats fetched successfully",
            data=data
        )

    @staticmethod
    async def coach_athletes():
        data = await AdminAnalyticsService.get_coach_athletes()

        return CoachAthletesResponse(
            success=True,
            message="Coach athletes fetched successfully",
            data=data
        )

    @staticmethod
    async def coaches_by_year(year: int):
        data = await AdminAnalyticsService.get_coaches_by_year(year)

        return YearlyCoachesResponse(
            success=True,
            message="Yearly coaches fetched successfully",
            data=data
        )

    @staticmethod
    async def boxer_analytics(filter_type: str):
        data = await AdminAnalyticsService.get_boxers_analytics(filter_type)

        return BoxerAnalyticsResponse(
            success=True,
            message="Boxer analytics fetched successfully",
            data=data
        )

