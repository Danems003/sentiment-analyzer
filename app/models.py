# models.py
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base  # используем базу из database.py

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    sentiment = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


