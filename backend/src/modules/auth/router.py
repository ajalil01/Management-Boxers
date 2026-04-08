from fastapi import APIRouter, Depends
from src.modules.auth.schema import LoginRequest, AuthResponseModel, CurrentUserResponse, UserInfoResponse
from src.modules.auth.controller import AuthController
from src.modules.auth.dependencies import get_current_user

router = APIRouter()

@router.post("/admin/login", response_model=AuthResponseModel)
async def admin_login(payload: LoginRequest):
    return await AuthController.login(payload)

@router.post("/coach/login", response_model=AuthResponseModel)
async def coach_login(payload: LoginRequest):
    return await AuthController.login_coach(payload)

@router.post("/boxer/login", response_model=AuthResponseModel)
async def boxer_login(payload: LoginRequest):
    return await AuthController.login_boxer(payload)

# SIMPLE endpoint to get current user from token
@router.get("/me")
async def get_current_user_info(current_user = Depends(get_current_user)):
    return {
        "success": True,
        "message": "User retrieved successfully",
        "data": {
            "id": str(current_user.id),  # Convert UUID to string
            "email": current_user.email,
            "role": current_user.__tablename__.rstrip('s')  # 'admins' -> 'admin'
        }
    }

