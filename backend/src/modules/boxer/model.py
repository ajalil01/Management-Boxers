import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.db.base import Base
from sqlalchemy import DateTime
from datetime import datetime


class Boxer(Base):
    __tablename__ = "boxers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    password = Column(String, nullable=False)
    picture = Column(String, nullable=True)
    coach_id = Column(UUID(as_uuid=True), ForeignKey("coaches.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    coach = relationship("Coach", backref="boxers")