import uuid
from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.db.base import Base

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)  # Changed to Text for longer descriptions
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False)

    session = relationship("Session", back_populates="exercises")  # UPDATE THIS

    