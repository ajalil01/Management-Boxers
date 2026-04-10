from fastapi import APIRouter, Depends, Query
from src.middlewares.authorization import require_role

from src.modules.analytics.admin.controller import AdminAnalyticsController

router = APIRouter(prefix="/analytics/admin", tags=["Admin Analytics"])


@router.get("/dashboard", dependencies=[Depends(require_role("admin"))])
async def dashboard():
    return await AdminAnalyticsController.dashboard()


@router.get("/coach-athletes", dependencies=[Depends(require_role("admin"))])
async def coach_athletes():
    return await AdminAnalyticsController.coach_athletes()


@router.get("/coaches-year", dependencies=[Depends(require_role("admin"))])
async def coaches_by_year(year: int = Query(...)):
    return await AdminAnalyticsController.coaches_by_year(year)


@router.get("/boxers", dependencies=[Depends(require_role("admin"))])
async def boxer_analytics(filter_type: str = Query("all")):
    return await AdminAnalyticsController.boxer_analytics(filter_type)

