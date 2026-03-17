import uuid
from sqlalchemy import Column, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy import UniqueConstraint
from src.db.base import Base
from datetime import datetime

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, index=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False)
    boxer_id = Column(UUID(as_uuid=True), ForeignKey("boxers.id"), nullable=False)
    attended_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    session = relationship("Session", backref="attendances")
    boxer = relationship("Boxer", backref="attendances")

    __table_args__ = (
        UniqueConstraint("session_id", "boxer_id", name="unique_session_boxer"),
    )