from fastapi import HTTPException, status
from src.modules.auth.schema import LoginRequest, TokenResponse, AuthResponseModel
from src.modules.auth.service import AuthService
from src.modules.auth.utils.logger import logger

class AuthController:

    @staticmethod
    async def login(payload: LoginRequest) -> AuthResponseModel:
        token = await AuthService.login(payload.email, payload.password)

        if not token:
            logger.warning(f"[Controller] Unauthorized login attempt: {payload.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        logger.info(f"[Controller] Admin logged in: {payload.email}")

        return AuthResponseModel(
            success=True,
            message="Login successful",
            data=TokenResponse(access_token=token)
        )