from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text, JSON, Float, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from .database import Base

# Define the GoalStatus enum
class GoalStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    archived = "archived"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    
    game_sessions = relationship("GameSession", back_populates="user")
    video_progress = relationship("VideoProgress", back_populates="user")
    goals = relationship("Goal", back_populates="user")


class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=func.now())
    player_character = Column(String, index=True)
    enemy_character = Column(String, index=True)
    result = Column(String)  # Win/Lose
    mood_rating = Column(Integer)  # 1-5 scale
    goals = Column(JSON)  # Store goals as JSON
    goal_progress = Column(JSON)  # Store goal progress as JSON
    notes = Column(Text, nullable=True)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="game_sessions")


class VideoCategory(Base):
    __tablename__ = "video_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text, nullable=True)
    
    videos = relationship("VideoTutorial", back_populates="category")


class Creator(Base):
    __tablename__ = "creators"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text, nullable=True)
    website = Column(String, nullable=True)
    
    # Relationships
    videos = relationship("VideoTutorial", back_populates="creator_obj")


class VideoTutorial(Base):
    __tablename__ = "video_tutorials"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    creator = Column(String, index=True)  # Keep for backward compatibility
    creator_relation_id = Column(Integer, ForeignKey("creators.id"), nullable=True)  # New relationship with different name
    url = Column(String)
    description = Column(Text, nullable=True)
    upload_date = Column(DateTime, nullable=True)
    video_type = Column(String)  # YouTube or direct mp4
    key_points = Column(Text, nullable=True)  # Important points from video
    
    # Fields for kemono integration
    kemono_id = Column(String, nullable=True, index=True)  # Original ID from kemono.su
    service = Column(String, nullable=True)  # Service (e.g., patreon)
    creator_id = Column(String, nullable=True)  # Keep original creator_id
    added_date = Column(DateTime, nullable=True)  # When it was added to kemono
    published_date = Column(DateTime, nullable=True)  # Original publish date
    tags = Column(JSON, nullable=True)  # Store tags as JSON array
    
    # Relationships
    category_id = Column(Integer, ForeignKey("video_categories.id"), nullable=True)
    category = relationship("VideoCategory", back_populates="videos")
    progress = relationship("VideoProgress", back_populates="video")
    creator_obj = relationship("Creator", back_populates="videos")


class VideoProgress(Base):
    __tablename__ = "video_progress"

    id = Column(Integer, primary_key=True, index=True)
    is_watched = Column(Boolean, default=False)
    watch_progress = Column(Float, default=0.0)  # Store seconds watched
    personal_notes = Column(Text, nullable=True)
    last_watched = Column(DateTime, default=func.now())
    is_bookmarked = Column(Boolean, default=False)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    video_id = Column(Integer, ForeignKey("video_tutorials.id"))
    
    user = relationship("User", back_populates="video_progress")
    video = relationship("VideoTutorial", back_populates="progress")


class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    status = Column(String, default="active")  # active, completed, archived
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="goals")
