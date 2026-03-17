import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.db.base import Base

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, index=True)
    name = Column(String, nullable=False)
    month = Column(String, nullable=False)  # format: YYYY-MM e.g. 2026-03
    coach_id = Column(UUID(as_uuid=True), ForeignKey("coaches.id"), nullable=False)

    coach = relationship("Coach", backref="schedules")
    # sessions = relationship("Session", backref="schedule", cascade="all, delete-orphan")