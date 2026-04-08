from fastapi import HTTPException, status
from src.modules.admin.schema import (
    AdminCreate,
    AdminResponse,
    AdminResponseModel,
    AdminListResponseModel
)
from src.modules.admin.service import AdminService
from src.modules.admin.utils.logger import logger
from uuid import UUID




class AdminController:

    @staticmethod
    async def create_admin(admin_create: AdminCreate):
        existing = await AdminService.get_admin_by_email(admin_create.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        new_admin = await AdminService.create_admin(
            admin_create.email,
            admin_create.password
        )

        return AdminResponseModel(
            success=True,
            message="Admin created successfully",
            data=new_admin
        )

    @staticmethod
    async def get_admin_by_id(admin_id: UUID) -> AdminResponseModel | None:
        admin = await AdminService.get_admin_by_id(admin_id)
        if not admin:
            logger.warning(f"Admin not found: {admin_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Admin not found"
            )

        return AdminResponseModel(
            success=True,
            message="Admin fetched successfully",
            data=AdminResponse.model_validate(admin)
        )

    @staticmethod
    async def get_all_admins():
        admins = await AdminService.get_all_admins()

        return AdminListResponseModel(
            success=True,
            message="Admins fetched successfully",
            data=[AdminResponse.model_validate(a) for a in admins]
        )

    @staticmethod
    async def update_admin(admin_id: UUID, email: str | None = None, password: str | None = None):
        updated_admin = await AdminService.update_admin(admin_id, email, password)

        if not updated_admin:
            logger.warning(f"Tried to update non-existing admin: {admin_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Admin not found"
            )

        logger.info(f"Admin updated: {admin_id}")

        return AdminResponseModel(
            success=True,
            message="Admin updated successfully",
            data=AdminResponse.model_validate(updated_admin)
        )

    @staticmethod
    async def delete_admin(admin_id: UUID):
        deleted = await AdminService.delete_admin(admin_id)

        if not deleted:
            logger.warning(f"Tried to delete non-existing admin: {admin_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Admin not found"
            )

        logger.info(f"Admin deleted: {admin_id}")

        return AdminResponseModel(
            success=True,
            message="Admin deleted successfully",
            data=None
        )
    
    