from typing import List, Optional, Dict, Any, Union, Literal
from pydantic import BaseModel, EmailStr, HttpUrl, field_validator
from datetime import datetime


# Game Session Goal Progress schemas - moved up to avoid circular dependency
class GameSessionGoalProgress(BaseModel):
    goal_id: int
    title: str
    notes: Optional[str] = None
    progress_rating: int  # 1-5 rating


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: str
    is_admin: Optional[bool] = False  # Allow specifying admin status when creating users


class UserUpdate(UserBase):
    username: str
    email: EmailStr
    current_password: Optional[str] = None
    new_password: Optional[str] = None


class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool = False

    class Config:
        from_attributes = True


class UserInDB(User):
    hashed_password: str


# Game Session schemas
class GameSessionBase(BaseModel):
    player_character: str
    enemy_character: str
    result: str  # Win/Lose
    mood_rating: int  # 1-5 scale
    goal_progress: Optional[List[GameSessionGoalProgress]] = None
    notes: Optional[str] = None


class GameSessionCreate(GameSessionBase):
    date: Optional[datetime] = None


class GameSession(GameSessionBase):
    id: int
    date: datetime
    user_id: int

    class Config:
        from_attributes = True


# Video Category schemas
class VideoCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None


class VideoCategoryCreate(VideoCategoryBase):
    pass


class VideoCategory(VideoCategoryBase):
    id: int
    
    class Config:
        from_attributes = True


# Creator schemas
class CreatorBase(BaseModel):
    name: str
    description: Optional[str] = None
    website: Optional[str] = None


class CreatorCreate(CreatorBase):
    pass


class Creator(CreatorBase):
    id: int

    class Config:
        from_attributes = True


# Video Tutorial schemas
class VideoTutorialBase(BaseModel):
    title: str
    creator: str  # Keep for backwards compatibility
    url: str
    description: Optional[str] = None
    video_type: str  # YouTube or direct mp4
    key_points: Optional[str] = None
    category_id: Optional[int] = None
    creator_relation_id: Optional[int] = None  # New field for creator relationship


class VideoTutorialCreate(VideoTutorialBase):
    upload_date: Optional[datetime] = None
    kemono_id: Optional[str] = None
    service: Optional[str] = None
    creator_id: Optional[str] = None  # Keep original creator_id for kemono
    added_date: Optional[datetime] = None
    published_date: Optional[datetime] = None
    tags: Optional[List[str]] = None


class VideoTutorial(VideoTutorialBase):
    id: int
    upload_date: Optional[datetime] = None
    kemono_id: Optional[str] = None
    service: Optional[str] = None
    creator_id: Optional[str] = None  # Keep original creator_id for kemono
    added_date: Optional[datetime] = None
    published_date: Optional[datetime] = None
    tags: Optional[List[str]] = None

    class Config:
        from_attributes = True
    
    @field_validator('tags', mode='before')
    @classmethod
    def validate_tags(cls, v):
        # Handle PostgreSQL array format
        if isinstance(v, str):
            if v.startswith('{') and v.endswith('}'):
                # Convert PostgreSQL array syntax to Python list
                tags = v[1:-1].split(',')
                return [tag.strip('"\'') for tag in tags]
            return [v]
        return v


# Extended video tutorial with category
class VideoTutorialWithCategory(VideoTutorial):
    category: Optional[VideoCategory] = None
    creator_obj: Optional[Creator] = None  # Include creator info
    progress_data: Optional[Dict[str, Any]] = None  # Include progress information if requested

    class Config:
        from_attributes = True


# Video Progress schemas
class VideoProgressBase(BaseModel):
    is_watched: bool = False
    watch_progress: float = 0.0
    personal_notes: Optional[str] = None
    is_bookmarked: bool = False
    
    # Frontend compatibility fields
    position_seconds: Optional[float] = None
    notes: Optional[str] = None
    is_completed: Optional[bool] = None
    
    # In Pydantic v2, we don't need complex validators for field aliases
    # We'll handle the mapping in the API endpoints instead
    
    class Config:
        # This will make it possible to both accept and return the 'notes' field
        populate_by_name = True


class VideoProgressCreate(VideoProgressBase):
    video_id: int


class VideoProgress(VideoProgressBase):
    id: int
    last_watched: datetime
    user_id: int
    video_id: int

    class Config:
        from_attributes = True
        # This will make it possible to both accept and return the 'notes' field
        populate_by_name = True


# Kemono Import schemas
class KemonoImportRequest(BaseModel):
    creator_id: str
    service: str = "patreon"
    category_mapping: Optional[Dict[str, int]] = None  # Map video titles/patterns to category IDs


class KemonoVideo(BaseModel):
    id: str
    title: str
    added: datetime
    published: datetime
    service: str
    creator: str
    content: Optional[str] = None
    file: Optional[Dict[str, Any]] = None
    embed: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None


class ImportResult(BaseModel):
    total_videos: int
    imported_videos: int
    skipped_videos: int
    videos: List[VideoTutorial]
    creators_processed: bool = True  # Indicate that creator entities were processed
    
    @field_validator('videos', mode='before')
    @classmethod
    def validate_videos(cls, videos_list):
        if not isinstance(videos_list, list):
            return videos_list
            
        # Process tags for each video
        for video in videos_list:
            if hasattr(video, 'tags') and isinstance(video.tags, str):
                if video.tags.startswith('{') and video.tags.endswith('}'):
                    # Convert PostgreSQL array syntax to Python list
                    tags = video.tags[1:-1].split(',')
                    video.tags = [tag.strip('"\'') for tag in tags]
                elif video.tags:  # If it's a non-empty string but not a PostgreSQL array
                    video.tags = [video.tags]
        
        return videos_list


# Token schemas for authentication
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# Goal schemas
class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Literal["active", "completed", "archived"] = "active"


class GoalCreate(GoalBase):
    pass


class Goal(GoalBase):
    id: int
    created_at: datetime
    updated_at: datetime
    user_id: int

    class Config:
        from_attributes = True


class GoalStatusUpdate(BaseModel):
    status: Literal["active", "completed", "archived"]
