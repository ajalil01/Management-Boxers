from pydantic import BaseModel
from typing import List, Optional


class DashboardStats(BaseModel):
    total_coaches: int
    total_boxers: int
    coaches_this_month: int
    avg_boxers_per_coach: float


class DashboardStatsResponse(BaseModel):
    success: bool
    message: str
    data: DashboardStats


class CoachAthletes(BaseModel):
    coach_id: str
    full_name: str
    boxers_count: int


class CoachAthletesResponse(BaseModel):
    success: bool
    message: str
    data: List[CoachAthletes]


class MonthlyCount(BaseModel):
    month: int
    count: int


class YearlyCoachesResponse(BaseModel):
    success: bool
    message: str
    data: List[MonthlyCount]


class BoxerAnalyticsPoint(BaseModel):
    label: str
    count: int


class BoxerAnalyticsResponse(BaseModel):
    success: bool
    message: str
    data: List[BoxerAnalyticsPoint]

