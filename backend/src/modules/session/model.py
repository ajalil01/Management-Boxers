import uuid
from sqlalchemy import Column, String, Date, Time, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.db.base import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, index=True)
    name = Column(String, nullable=False)
    session_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)  # ADD THIS
    end_time = Column(Time, nullable=False)    # ADD THIS
    schedule_id = Column(UUID(as_uuid=True), ForeignKey("schedules.id"), nullable=False)

    schedule = relationship("Schedule", backref="sessions")
    exercises = relationship("Exercise", back_populates="session", cascade="all, delete-orphan")  # UPDATE THIS

    