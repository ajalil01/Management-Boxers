import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from src.db.base import Base
from sqlalchemy import DateTime
from datetime import datetime



class Coach(Base):
    __tablename__ = "coaches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)