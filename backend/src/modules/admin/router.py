from fastapi import APIRouter, Depends
from src.modules.admin.schema import AdminCreate, AdminResponseModel, AdminListResponseModel
from src.modules.admin.controller import AdminController
from src.middlewares.authentication import get_current_user
from src.middlewares.authorization import require_role
from uuid import UUID

router = APIRouter()

@router.post("/", response_model=AdminResponseModel, status_code=201)
async def create_admin(admin: AdminCreate):
    return await AdminController.create_admin(admin)

@router.get("/", response_model=AdminListResponseModel, dependencies=[Depends(require_role("admin"))])
async def get_all_admins():
    return await AdminController.get_all_admins()

@router.get("/{admin_id}", response_model=AdminResponseModel, dependencies=[Depends(require_role("admin"))])
async def get_admin(admin_id: UUID):
    return await AdminController.get_admin_by_id(admin_id)

@router.get("/me", response_model=AdminResponseModel)
async def get_current_admin(current_user = Depends(get_current_user)):
    return await AdminController.get_current_admin(current_user)

@router.put("/{admin_id}", response_model=AdminResponseModel, dependencies=[Depends(require_role("admin"))])
async def update_admin(admin_id: UUID, email: str | None = None, password: str | None = None):
    return await AdminController.update_admin(admin_id, email, password)

@router.delete("/{admin_id}", response_model=AdminResponseModel, dependencies=[Depends(require_role("admin"))])
async def delete_admin(admin_id: UUID):
    return await AdminController.delete_admin(admin_id)