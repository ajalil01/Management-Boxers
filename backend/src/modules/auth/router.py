from fastapi import APIRouter
from src.modules.auth.schema import LoginRequest, AuthResponseModel
from src.modules.auth.controller import AuthController

router = APIRouter()

@router.post("/login", response_model=AuthResponseModel)
async def login(payload: LoginRequest):
    return await AuthController.login(payload)