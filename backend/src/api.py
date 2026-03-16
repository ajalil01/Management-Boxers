from fastapi import APIRouter
from src.modules.test.router import router as test_router
from src.modules.admin.router import router as admin_router
from src.modules.auth.router import router as auth_router

api_router = APIRouter()
api_router.include_router(test_router)
api_router.include_router(admin_router, prefix="/admins", tags=["Admins"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])