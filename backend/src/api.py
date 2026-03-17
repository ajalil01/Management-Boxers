from fastapi import APIRouter
from src.modules.test.router import router as test_router
from src.modules.admin.router import router as admin_router
from src.modules.auth.router import router as auth_router
from src.modules.coach.router import router as coach_router
from src.modules.boxer.router import router as boxer_router
from src.modules.schedule.router import router as schedule_router



api_router = APIRouter()
api_router.include_router(test_router)
api_router.include_router(admin_router, prefix="/admins", tags=["Admins"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(coach_router, prefix="/coaches", tags=["Coaches"])
api_router.include_router(boxer_router, prefix="/boxers", tags=["Boxers"])
api_router.include_router(schedule_router, prefix="/schedules", tags=["Schedules"])
