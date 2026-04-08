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

@router.get("/me", response_model=CurrentUserResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    user = current_user["user"]
    role = current_user["role"]
    
    # Map user fields to UserInfoResponse
    user_info = UserInfoResponse(
        id=str(getattr(user, 'id', '')),
        email=getattr(user, 'email', ''),
        role=role,
        full_name=getattr(user, 'full_name', None) or getattr(user, 'name', None),
        created_at=getattr(user, 'created_at', None)
    )
    
    return CurrentUserResponse(
        success=True,
        message="User retrieved successfully",
        data=user_info
    )
