from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from src.core.config import settings
from src.modules.admin.service import AdminService
from src.modules.coach.service import CoachService
from src.modules.boxer.service import BoxerService
from src.modules.auth.utils.logger import logger

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        
        if user_id is None or role is None:
            raise credentials_exception
            
    except JWTError as e:
        logger.error(f"JWT validation error: {str(e)}")
        raise credentials_exception
    
    # Fetch user based on role
    user = None
    if role == "admin":
        user = await AdminService.get_admin_by_id(int(user_id))
    elif role == "coach":
        user = await CoachService.get_coach_by_id(int(user_id))
    elif role == "boxer":
        user = await BoxerService.get_boxer_by_id(int(user_id))
    else:
        raise credentials_exception
    
    if user is None:
        raise credentials_exception
    
    return {"user": user, "role": role, "user_id": user_id}

