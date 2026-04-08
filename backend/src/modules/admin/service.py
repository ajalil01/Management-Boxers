from src.modules.admin.model import Admin
from src.db.database import AsyncSessionLocal as async_session
from src.modules.admin.schema import AdminCreate, AdminResponse
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update, delete
from passlib.context import CryptContext
from src.modules.admin.utils.logger import logger
from uuid import UUID

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AdminService:
    @staticmethod
    async def create_admin(email: str, password: str) -> Admin:
        try:
            hashed_password = pwd_context.hash(password)
            new_admin = Admin(email=email, password=hashed_password)

            async with async_session() as session:
                async with session.begin():
                    session.add(new_admin)

                await session.refresh(new_admin)

            logger.info(f"[Service] Admin created: {new_admin.email} (id: {new_admin.id})")

            return new_admin  # <-- RETURN ORM OBJECT

        except Exception as e:
            logger.error(f"[Service] Failed to create admin ({email}): {str(e)}")
            raise


    @staticmethod
    async def get_admin_by_email(email: str) -> Admin | None:
        try:
            async with async_session() as session:
                result = await session.execute(select(Admin).where(Admin.email == email))
                admin = result.scalars().first()
                if admin:
                    logger.debug(f"[Service] Found admin by email: {email}")
                return admin
        except Exception as e:
            logger.error(f"[Service] Error fetching admin by email ({email}): {str(e)}")
            raise

    @staticmethod
    async def get_admin_by_id(admin_id: UUID) -> Admin | None:
        try:
            async with async_session() as session:
                result = await session.execute(
                    select(Admin).where(Admin.id == admin_id)
                )
                admin = result.scalars().first()

                if admin:
                    logger.debug(f"[Service] Found admin by id: {admin_id}")

                return admin

        except Exception as e:
            logger.error(f"[Service] Error fetching admin by id ({admin_id}): {str(e)}")
            raise
        
    @staticmethod
    async def get_all_admins() -> list[Admin]:
        try:
            async with async_session() as session:
                result = await session.execute(select(Admin))
                admins = result.scalars().all()
                logger.info(f"[Service] Fetched all admins (count: {len(admins)})")
                return admins
        except Exception as e:
            logger.error(f"[Service] Error fetching all admins: {str(e)}")
            raise

    @staticmethod
    async def update_admin(admin_id: UUID, email: str | None = None, password: str | None = None) -> Admin | None:
        try:
            async with async_session() as session:
                async with session.begin():
                    stmt = select(Admin).where(Admin.id == admin_id)
                    result = await session.execute(stmt)
                    admin = result.scalars().first()
                    if not admin:
                        return None

                    if email:
                        admin.email = email
                    if password:
                        admin.password = pwd_context.hash(password)

                await session.commit()
                await session.refresh(admin)
                logger.info(f"[Service] Updated admin: {admin_id}")
                return admin
        except Exception as e:
            logger.error(f"[Service] Failed to update admin ({admin_id}): {str(e)}")
            raise

    @staticmethod
    async def delete_admin(admin_id: UUID) -> bool:
        try:
            async with async_session() as session:
                async with session.begin():
                    stmt = select(Admin).where(Admin.id == admin_id)
                    result = await session.execute(stmt)
                    admin = result.scalars().first()
                    if not admin:
                        return False

                    await session.delete(admin)

                await session.commit()
                logger.info(f"[Service] Deleted admin: {admin_id}")
                return True
        except Exception as e:
            logger.error(f"[Service] Failed to delete admin ({admin_id}): {str(e)}")
            raise

    