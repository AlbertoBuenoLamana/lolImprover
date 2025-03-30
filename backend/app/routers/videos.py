from fastapi import APIRouter, Depends, HTTPException, status, Body, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy import or_, and_

from .. import models, schemas, auth
from ..database import get_db
from ..services.kemono_service import KemonoService

router = APIRouter(
    prefix="/videos",
    tags=["videos"],
    responses={404: {"description": "Not found"}},
)


# Helper function to migrate creators from videos
def migrate_creators_from_videos(
    db: Session,
    current_user: models.User
):
    """Create Creator entries for all existing videos"""
    # Get all unique creator names from videos
    videos = db.query(models.VideoTutorial).all()
    unique_creators = set()
    for video in videos:
        if video.creator and video.creator.strip():
            unique_creators.add(video.creator.strip())
    
    # Create Creator for each unique name
    created_creators = []
    for creator_name in unique_creators:
        # Check if creator already exists by name
        existing_creator = db.query(models.Creator).filter(models.Creator.name == creator_name).first()
        if not existing_creator:
            # Create new creator
            new_creator = models.Creator(name=creator_name)
            db.add(new_creator)
            db.commit()
            db.refresh(new_creator)
            created_creators.append(new_creator)
            
            # Update all videos with this creator
            videos_to_update = db.query(models.VideoTutorial).filter(models.VideoTutorial.creator == creator_name).all()
            for video in videos_to_update:
                video.creator_relation_id = new_creator.id
            db.commit()
        else:
            created_creators.append(existing_creator)
    
    return created_creators


# Video Category Endpoints
@router.post("/categories/", response_model=schemas.VideoCategory, status_code=status.HTTP_201_CREATED)
def create_video_category(
    category: schemas.VideoCategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new video category"""
    db_category = models.VideoCategory(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.get("/categories/", response_model=List[schemas.VideoCategory])
def read_video_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all video categories"""
    categories = db.query(models.VideoCategory).offset(skip).limit(limit).all()
    return categories


@router.get("/categories/{category_id}", response_model=schemas.VideoCategory)
def read_video_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get a specific video category"""
    db_category = db.query(models.VideoCategory).filter(models.VideoCategory.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category


@router.put("/categories/{category_id}", response_model=schemas.VideoCategory)
def update_video_category(
    category_id: int,
    category: schemas.VideoCategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Update a video category"""
    db_category = db.query(models.VideoCategory).filter(models.VideoCategory.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for key, value in category.dict().items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_video_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Delete a video category"""
    db_category = db.query(models.VideoCategory).filter(models.VideoCategory.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(db_category)
    db.commit()
    return None


# Kemono Import Endpoints
@router.post("/kemono/import", response_model=schemas.ImportResult)
def import_kemono_videos(
    import_request: schemas.KemonoImportRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Import videos from kemono.su"""
    total, imported, skipped, videos = KemonoService.import_videos(
        db, 
        import_request.creator_id, 
        import_request.service,
        import_request.category_mapping
    )
    
    creators_processed = False
    # If videos were imported, run the create_creators script
    if imported > 0:
        try:
            # Process creators directly 
            migrate_creators_from_videos(db=db, current_user=current_user)
            creators_processed = True
        except Exception as e:
            # Log error but don't fail the import
            print(f"Error processing creators: {str(e)}")
    
    return {
        "total_videos": total,
        "imported_videos": imported,
        "skipped_videos": skipped,
        "videos": videos,
        "creators_processed": creators_processed
    }


@router.get("/kemono/preview/{creator_id}", response_model=Dict[str, List])
def preview_kemono_videos(
    creator_id: str,
    service: str = "patreon",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Preview videos from kemono.su without importing them"""
    # Fetch videos from kemono.su
    raw_videos = KemonoService.fetch_videos(creator_id, service)
    
    # Categorize videos
    categorized_videos = KemonoService.categorize_videos(raw_videos)
    
    # Process each video to extract the information we need
    result = {}
    for category, videos in categorized_videos.items():
        result[category] = [KemonoService.process_video(video) for video in videos]
    
    return result


@router.post("/", response_model=schemas.VideoTutorial, status_code=status.HTTP_201_CREATED)
def create_video_tutorial(
    video: schemas.VideoTutorialCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_video = models.VideoTutorial(**video.dict())
    db.add(db_video)
    db.commit()
    db.refresh(db_video)
    return db_video


@router.post("/import", status_code=status.HTTP_201_CREATED)
def import_videos(
    videos: List[Dict[str, Any]] = Body(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Import multiple videos from JSON data"""
    created_videos = []
    for video_data in videos:
        # Convert data to our schema format
        video = schemas.VideoTutorialCreate(
            title=video_data.get("title"),
            creator=video_data.get("creator"),
            url=video_data.get("url"),
            description=video_data.get("description", ""),
            video_type=video_data.get("video_type", "YouTube"),
            upload_date=video_data.get("upload_date")
        )
        
        # Create the video in the database
        db_video = models.VideoTutorial(**video.dict())
        db.add(db_video)
        db.commit()
        db.refresh(db_video)
        created_videos.append(db_video)
    
    return {"message": f"Successfully imported {len(created_videos)} videos"}


@router.get("/", response_model=List[schemas.VideoTutorialWithCategory])
def read_videos(
    skip: int = 0,
    limit: int = 100,
    creator: str = None,
    category_id: int = None,
    title: str = None,
    tag: str = None,
    creator_name: str = None,
    expand: str = None,
    sort_by: str = "published_date",
    sort_order: str = "desc",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """
    Get all videos with optional filtering and sorting.
    
    - **sort_by**: Field to sort by (published_date, title, last_watched)
    - **sort_order**: 'asc' or 'desc'
    - **title**: Filter by title (partial match)
    - **tag**: Filter by tag
    - **creator**: Filter by creator name (legacy field)
    - **creator_name**: Filter by creator name (using creator_obj relationship)
    - **expand**: Comma-separated list of related data to include ('creator', 'progress')
    """
    query = db.query(models.VideoTutorial)
    
    # Apply filters
    if creator:
        query = query.filter(models.VideoTutorial.creator == creator)
    
    if category_id:
        query = query.filter(models.VideoTutorial.category_id == category_id)
    
    if title:
        query = query.filter(models.VideoTutorial.title.ilike(f'%{title}%'))
    
    if tag:
        query = query.filter(models.VideoTutorial.tags.contains([tag]))
    
    if creator_name:
        query = query.join(models.Creator).filter(models.Creator.name.ilike(f'%{creator_name}%'))
    
    # Join with category and creator if needed
    expand_options = expand.split(',') if expand else []
    
    if 'creator' in expand_options or not expand:
        query = query.options(joinedload(models.VideoTutorial.creator_obj))
        
    if 'category' in expand_options or not expand:
        query = query.options(joinedload(models.VideoTutorial.category))
    
    # Apply sorting
    if sort_by:
        sort_field = None
        last_watched_sort = False  # Initialize this flag
        
        if sort_by == "title":
            sort_field = models.VideoTutorial.title
        elif sort_by == "creator":
            sort_field = models.VideoTutorial.creator
        elif sort_by == "published_date":
            sort_field = models.VideoTutorial.published_date
        elif sort_by == "last_watched":
            # We can't sort by last_watched directly in the main query
            # So we'll use a different approach after fetching the data
            last_watched_sort = True
        else:
            # Default to sorting by id if an invalid sort field is provided
            sort_field = models.VideoTutorial.id
        
        # Only apply the sort if we have a valid sort field
        if sort_field:
            if sort_order.lower() == "asc":
                query = query.order_by(sort_field.asc())
            else:
                query = query.order_by(sort_field.desc())
    
    videos = query.offset(skip).limit(limit).all()
    
    # If progress information is requested, fetch and attach it
    if 'progress' in expand_options:
        # Get all video IDs
        video_ids = [video.id for video in videos]
        
        # Fetch progress for these videos for the current user
        progress_records = db.query(models.VideoProgress).filter(
            models.VideoProgress.video_id.in_(video_ids),
            models.VideoProgress.user_id == current_user.id
        ).all()
        
        # Create a mapping from video_id to progress
        progress_map = {p.video_id: p for p in progress_records}
        
        # Attach progress to each video
        for video in videos:
            progress = progress_map.get(video.id)
            if progress:
                # Create a dictionary with both backend and frontend field names
                progress_dict = {
                    "id": progress.id,
                    "last_watched": progress.last_watched,
                    "user_id": progress.user_id,
                    "video_id": progress.video_id,
                    "is_watched": progress.is_watched,
                    "watch_progress": progress.watch_progress,
                    "personal_notes": progress.personal_notes,
                    "is_bookmarked": progress.is_bookmarked,
                    # Frontend compatibility fields
                    "notes": progress.personal_notes,
                    "position_seconds": progress.watch_progress,
                    "is_completed": progress.is_watched
                }
                # Use a different attribute name to avoid conflict with the relationship
                setattr(video, "progress_data", progress_dict)
        
        # If we need to sort by last_watched, do it after attaching progress
        if last_watched_sort:
            def get_last_watched(video):
                if hasattr(video, "progress_data") and video.progress_data.get("last_watched"):
                    return video.progress_data["last_watched"]
                return datetime.min

            videos.sort(
                key=get_last_watched, 
                reverse=(sort_order.lower() != "asc")
            )
    
    return videos


@router.get("/{video_id}", response_model=schemas.VideoTutorialWithCategory)
def read_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_video = db.query(models.VideoTutorial).filter(models.VideoTutorial.id == video_id).first()
    if db_video is None:
        raise HTTPException(status_code=404, detail="Video not found")
    return db_video


@router.put("/{video_id}", response_model=schemas.VideoTutorial)
def update_video(
    video_id: int,
    video: schemas.VideoTutorialCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Update a video"""
    db_video = db.query(models.VideoTutorial).filter(models.VideoTutorial.id == video_id).first()
    if db_video is None:
        raise HTTPException(status_code=404, detail="Video not found")
    
    for key, value in video.dict().items():
        setattr(db_video, key, value)
    
    db.commit()
    db.refresh(db_video)
    return db_video


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Delete a video"""
    db_video = db.query(models.VideoTutorial).filter(models.VideoTutorial.id == video_id).first()
    if db_video is None:
        raise HTTPException(status_code=404, detail="Video not found")
    
    db.delete(db_video)
    db.commit()
    return None


@router.post("/{video_id}/progress", response_model=schemas.VideoProgress)
def update_video_progress(
    video_id: int,
    progress: schemas.VideoProgressBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Check if video exists
    db_video = db.query(models.VideoTutorial).filter(models.VideoTutorial.id == video_id).first()
    if db_video is None:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Check if progress record exists
    db_progress = db.query(models.VideoProgress).filter(
        models.VideoProgress.video_id == video_id,
        models.VideoProgress.user_id == current_user.id
    ).first()
    
    # Convert to dict and handle field mappings
    progress_dict = {}
    
    # Handle position_seconds -> watch_progress
    if progress.position_seconds is not None:
        progress_dict["watch_progress"] = progress.position_seconds
    
    # Handle is_completed -> is_watched
    if progress.is_completed is not None:
        progress_dict["is_watched"] = progress.is_completed
    
    # Handle notes -> personal_notes (prefer notes if both are provided)
    if progress.notes is not None:
        progress_dict["personal_notes"] = progress.notes
    elif progress.personal_notes is not None:
        progress_dict["personal_notes"] = progress.personal_notes
    
    # Handle is_bookmarked
    if progress.is_bookmarked is not None:
        progress_dict["is_bookmarked"] = progress.is_bookmarked
    
    if db_progress:
        # Update existing progress
        for key, value in progress_dict.items():
            setattr(db_progress, key, value)
        db_progress.last_watched = datetime.utcnow()
    else:
        # Create new progress record
        db_progress = models.VideoProgress(
            **progress_dict,
            video_id=video_id,
            user_id=current_user.id
        )
        db.add(db_progress)
    
    db.commit()
    db.refresh(db_progress)
    
    # Create the response
    response = schemas.VideoProgress(
        id=db_progress.id,
        last_watched=db_progress.last_watched,
        user_id=db_progress.user_id,
        video_id=db_progress.video_id,
        is_watched=db_progress.is_watched,
        watch_progress=db_progress.watch_progress,
        personal_notes=db_progress.personal_notes,
        is_bookmarked=getattr(db_progress, "is_bookmarked", None),
        # Map back to frontend fields
        notes=db_progress.personal_notes,
        position_seconds=db_progress.watch_progress,
        is_completed=db_progress.is_watched
    )
    
    return response


@router.get("/progress/{video_id}", response_model=schemas.VideoProgress)
def get_video_progress(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_progress = db.query(models.VideoProgress).filter(
        models.VideoProgress.video_id == video_id,
        models.VideoProgress.user_id == current_user.id
    ).first()
    
    if db_progress is None:
        raise HTTPException(status_code=404, detail="Video progress not found")
    
    # Create the response with field mappings
    response = schemas.VideoProgress(
        id=db_progress.id,
        last_watched=db_progress.last_watched,
        user_id=db_progress.user_id,
        video_id=db_progress.video_id,
        is_watched=db_progress.is_watched,
        watch_progress=db_progress.watch_progress,
        personal_notes=db_progress.personal_notes,
        is_bookmarked=getattr(db_progress, "is_bookmarked", None),
        # Map to frontend fields
        notes=db_progress.personal_notes,
        position_seconds=db_progress.watch_progress,
        is_completed=db_progress.is_watched
    )
    
    return response


# Add these new endpoints for the creators
@router.get("/creators/", response_model=List[schemas.Creator])
def get_creators(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all creator entries"""
    creators = db.query(models.Creator).offset(skip).limit(limit).all()
    return creators


@router.post("/creators/", response_model=schemas.Creator, status_code=status.HTTP_201_CREATED)
def create_creator(
    creator: schemas.CreatorCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new creator"""
    # Check if creator with this name already exists
    db_creator = db.query(models.Creator).filter(models.Creator.name == creator.name).first()
    if db_creator:
        raise HTTPException(status_code=400, detail="Creator with this name already exists")
    
    # Create new creator
    db_creator = models.Creator(**creator.dict())
    db.add(db_creator)
    db.commit()
    db.refresh(db_creator)
    return db_creator


@router.get("/creators/{creator_id}", response_model=schemas.Creator)
def get_creator(
    creator_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get a specific creator by ID"""
    creator = db.query(models.Creator).filter(models.Creator.id == creator_id).first()
    if creator is None:
        raise HTTPException(status_code=404, detail="Creator not found")
    return creator


@router.put("/creators/{creator_id}", response_model=schemas.Creator)
def update_creator(
    creator_id: int, 
    creator_update: schemas.CreatorCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Update a creator"""
    db_creator = db.query(models.Creator).filter(models.Creator.id == creator_id).first()
    if db_creator is None:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    # Check if updating to a name that already exists
    existing = db.query(models.Creator).filter(
        models.Creator.name == creator_update.name,
        models.Creator.id != creator_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Creator with this name already exists")
    
    # Get the old name before updating
    old_name = db_creator.name
    
    # Update creator
    for key, value in creator_update.dict().items():
        setattr(db_creator, key, value)
    
    db.commit()
    db.refresh(db_creator)
    
    # If the name changed, update all videos associated with this creator
    if old_name != creator_update.name:
        # Update videos by creator_relation_id
        videos = db.query(models.VideoTutorial).filter(
            models.VideoTutorial.creator_relation_id == creator_id
        ).all()
        
        for video in videos:
            video.creator = creator_update.name
        
        db.commit()
    
    return db_creator


@router.delete("/creators/{creator_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_creator(
    creator_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Delete a creator"""
    # Check if creator exists
    db_creator = db.query(models.Creator).filter(models.Creator.id == creator_id).first()
    if db_creator is None:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    # Check if creator is used in any videos
    videos_with_creator = db.query(models.VideoTutorial).filter(
        models.VideoTutorial.creator_relation_id == creator_id
    ).count()
    
    if videos_with_creator > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete creator: used in {videos_with_creator} videos"
        )
    
    # Delete creator
    db.delete(db_creator)
    db.commit()
    return None


@router.get("/creators/{creator_id}/videos", response_model=List[schemas.VideoTutorial])
def get_creator_videos(
    creator_id: int, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all videos by a specific creator"""
    videos = db.query(models.VideoTutorial).filter(
        models.VideoTutorial.creator_relation_id == creator_id
    ).offset(skip).limit(limit).all()
    
    return videos


# Add endpoint to associate creator with video
@router.put("/{video_id}/set-creator/{creator_id}", response_model=schemas.VideoTutorial)
def set_video_creator(
    video_id: int, 
    creator_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Associate a creator with a video"""
    # Check if video exists
    db_video = db.query(models.VideoTutorial).filter(models.VideoTutorial.id == video_id).first()
    if db_video is None:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Check if creator exists
    db_creator = db.query(models.Creator).filter(models.Creator.id == creator_id).first()
    if db_creator is None:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    # Update video with creator
    db_video.creator_relation_id = creator_id
    # Also update the text field for backwards compatibility
    db_video.creator = db_creator.name
    
    db.commit()
    db.refresh(db_video)
    return db_video


@router.post("/creators/migrate-from-videos", response_model=List[schemas.Creator])
def migrate_creators_from_videos_endpoint(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    """Create Creator entries for all existing videos"""
    return migrate_creators_from_videos(db, current_user)


@router.get("/recently-watched/", response_model=List[schemas.VideoTutorialWithCategory])
def read_recently_watched_videos(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """
    Get videos recently watched by the current user, ordered by last_watched timestamp.
    """
    # Query videos with their progress, joined through the video_progress table
    query = (
        db.query(models.VideoTutorial)
        .join(
            models.VideoProgress,
            (models.VideoTutorial.id == models.VideoProgress.video_id) & 
            (models.VideoProgress.user_id == current_user.id)
        )
        .options(
            joinedload(models.VideoTutorial.category),
            joinedload(models.VideoTutorial.creator_obj)
        )
        .order_by(models.VideoProgress.last_watched.desc())
    )
    
    videos = query.offset(skip).limit(limit).all()
    
    return videos


@router.get("/bookmarked/", response_model=List[schemas.VideoTutorialWithCategory])
def read_bookmarked_videos(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """
    Get videos bookmarked by the current user.
    """
    # Query videos with their progress, joined through the video_progress table
    query = (
        db.query(models.VideoTutorial)
        .join(
            models.VideoProgress,
            (models.VideoTutorial.id == models.VideoProgress.video_id) & 
            (models.VideoProgress.user_id == current_user.id) &
            (models.VideoProgress.is_bookmarked == True)
        )
        .options(
            joinedload(models.VideoTutorial.category),
            joinedload(models.VideoTutorial.creator_obj)
        )
        .order_by(models.VideoProgress.last_watched.desc())
    )
    
    videos = query.offset(skip).limit(limit).all()
    
    return videos


@router.get("/search/", response_model=List[schemas.VideoTutorialWithCategory])
def search_videos(
    q: str = None,
    creator_id: int = None,
    category_id: int = None,
    tags: List[str] = Query(None),
    min_published_date: datetime = None,
    max_published_date: datetime = None,
    watched: bool = None,
    bookmarked: bool = None,
    sort_by: str = "published_date",
    sort_order: str = "desc",
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """
    Advanced search for videos with multiple filter options.
    
    - **q**: General search query (searches title and description)
    - **creator_id**: Filter by specific creator ID
    - **category_id**: Filter by specific category ID
    - **tags**: Filter by one or more tags
    - **min_published_date**: Filter videos published after this date
    - **max_published_date**: Filter videos published before this date
    - **watched**: Filter by watched status
    - **bookmarked**: Filter by bookmarked status
    - **sort_by**: Field to sort by (published_date, title, last_watched)
    - **sort_order**: 'asc' or 'desc'
    """
    # Start with base query
    query = db.query(models.VideoTutorial)
    
    # Apply text search if provided
    if q:
        search_query = f"%{q}%"
        query = query.filter(
            or_(
                models.VideoTutorial.title.ilike(search_query),
                models.VideoTutorial.description.ilike(search_query)
            )
        )
    
    # Apply specific filters
    if creator_id:
        query = query.filter(models.VideoTutorial.creator_relation_id == creator_id)
    
    if category_id:
        query = query.filter(models.VideoTutorial.category_id == category_id)
    
    if tags:
        for tag in tags:
            # For PostgreSQL JSON array contains
            query = query.filter(models.VideoTutorial.tags.contains([tag]))
    
    if min_published_date:
        query = query.filter(models.VideoTutorial.published_date >= min_published_date)
    
    if max_published_date:
        query = query.filter(models.VideoTutorial.published_date <= max_published_date)
    
    # Apply watched/bookmark filters if requested
    if watched is not None or bookmarked is not None:
        # We need to join with video_progress for these filters
        progress_join_conditions = [
            models.VideoTutorial.id == models.VideoProgress.video_id,
            models.VideoProgress.user_id == current_user.id
        ]
        
        query = query.join(
            models.VideoProgress,
            and_(*progress_join_conditions)
        )
        
        if watched is not None:
            query = query.filter(models.VideoProgress.is_watched == watched)
        
        if bookmarked is not None:
            query = query.filter(models.VideoProgress.is_bookmarked == bookmarked)
    
    # Apply sorting
    if sort_by:
        sort_field = None
        last_watched_sort = False  # Initialize this flag
        
        if sort_by == "title":
            sort_field = models.VideoTutorial.title
        elif sort_by == "creator":
            sort_field = models.VideoTutorial.creator
        elif sort_by == "published_date":
            sort_field = models.VideoTutorial.published_date
        elif sort_by == "last_watched":
            # We can't sort by last_watched directly in the main query
            # So we'll use a different approach after fetching the data
            last_watched_sort = True
        else:
            # Default to sorting by id if an invalid sort field is provided
            sort_field = models.VideoTutorial.id
        
        # Only apply the sort if we have a valid sort field
        if sort_field:
            if sort_order.lower() == "asc":
                query = query.order_by(sort_field.asc())
            else:
                query = query.order_by(sort_field.desc())
    
    # Apply eager loading
    query = query.options(
        joinedload(models.VideoTutorial.category),
        joinedload(models.VideoTutorial.creator_obj)
    )
    
    # Apply pagination
    videos = query.offset(skip).limit(limit).all()
    
    # If progress information is requested, fetch and attach it
    if 'progress' in expand_options:
        # Get all video IDs
        video_ids = [video.id for video in videos]
        
        # Fetch progress for these videos for the current user
        progress_records = db.query(models.VideoProgress).filter(
            models.VideoProgress.video_id.in_(video_ids),
            models.VideoProgress.user_id == current_user.id
        ).all()
        
        # Create a mapping from video_id to progress
        progress_map = {p.video_id: p for p in progress_records}
        
        # Attach progress to each video
        for video in videos:
            progress = progress_map.get(video.id)
            if progress:
                # Create a dictionary with both backend and frontend field names
                progress_dict = {
                    "id": progress.id,
                    "last_watched": progress.last_watched,
                    "user_id": progress.user_id,
                    "video_id": progress.video_id,
                    "is_watched": progress.is_watched,
                    "watch_progress": progress.watch_progress,
                    "personal_notes": progress.personal_notes,
                    "is_bookmarked": progress.is_bookmarked,
                    # Frontend compatibility fields
                    "notes": progress.personal_notes,
                    "position_seconds": progress.watch_progress,
                    "is_completed": progress.is_watched
                }
                # Use a different attribute name to avoid conflict with the relationship
                setattr(video, "progress_data", progress_dict)
        
        # If we need to sort by last_watched, do it after attaching progress
        if last_watched_sort:
            def get_last_watched(video):
                if hasattr(video, "progress_data") and video.progress_data.get("last_watched"):
                    return video.progress_data["last_watched"]
                return datetime.min

            videos.sort(
                key=get_last_watched, 
                reverse=(sort_order.lower() != "asc")
            )
    
    return videos


@router.post("/update-categories", status_code=status.HTTP_200_OK)
def update_video_categories(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    """Update categories for all videos based on their titles (admin only)"""
    # Define title lists for each category
    fundamental_titles = [
        "Snowball fundamentals",
        "Carrying 3 losing lanes Fundamentals",
        "Fundamentals to climb and how to play early",
        "Key Fundamentals explained to 1v9",
        "The Correct way to play for wincondition",
        "How to COUNTER all invades",
        "How to SMASH people in D1 elo",
        "Conditions for a gank to succeed"
    ]
    
    early_course_titles = [
        "How to get good on Any champion",
        "Early game 1v9 course",
        "W-W CONCEPT",
        "BASE TIMERS",
        "GANK EXECUTION",
        "WHEN TO FARM WHEN TO GANK",
        "ADVANCED JUNGLE TRACKING",
        "DEEP WAVES UNDERSTANDING",
        "INVADE LIKE A KING",
        "Understanding pathing options & Winconditions",
        "CHAMPION IDENTITY",
        "DRAFT"
    ]
    
    midgame_course_titles = [
        "Baron conditions",
        "Midgame course",
        "Tempo",
        "Baron usage",
        "How to play for baron",
        "Recognise the objective",
        "Pingpong",
        "WHW Concept",
        "Drake windows"
    ]
    
    classes_titles = [
        "class",
        "Ganking & Playing for wincon class",
        "Drakes & How to snowball",
        "Tempo class"
    ]
    
    practical_course_titles = [
        "Practical course",
        "wincondition & Planning",
        "WW Concept",
        "Rehearsal of the practical courses",
        "BEST way to GANK",
        "When to farm when to gank",
        "Perfect Jungle Tracking",
        "Waves understanding",
        "Art of Invading",
        "Camera control & Jungle tracking",
        "How to play mechanically well"
    ]
    
    # Get category IDs
    fundamentals_category = db.query(models.VideoCategory).filter(models.VideoCategory.name == "Fundamentals").first()
    early_game_category = db.query(models.VideoCategory).filter(models.VideoCategory.name == "Early Game Course").first()
    midgame_category = db.query(models.VideoCategory).filter(models.VideoCategory.name == "Midgame Course").first()
    classes_category = db.query(models.VideoCategory).filter(models.VideoCategory.name == "Classes").first()
    practical_category = db.query(models.VideoCategory).filter(models.VideoCategory.name == "Practical Course").first()
    
    # Get all videos without categories
    videos = db.query(models.VideoTutorial).filter(
        models.VideoTutorial.category_id.is_(None)
    ).all()
    
    updated_count = 0
    
    # Update videos based on title matches
    for video in videos:
        title = video.title.lower()
        updated = False
        
        # Check fundamentals
        if fundamentals_category and any(pattern.lower() in title for pattern in fundamental_titles):
            video.category_id = fundamentals_category.id
            updated = True
        # Check early game course
        elif early_game_category and any(pattern.lower() in title for pattern in early_course_titles):
            video.category_id = early_game_category.id
            updated = True
        # Check midgame course
        elif midgame_category and any(pattern.lower() in title for pattern in midgame_course_titles):
            video.category_id = midgame_category.id
            updated = True
        # Check classes
        elif classes_category and any(pattern.lower() in title for pattern in classes_titles):
            video.category_id = classes_category.id
            updated = True
        # Check practical course
        elif practical_category and any(pattern.lower() in title for pattern in practical_course_titles):
            video.category_id = practical_category.id
            updated = True
        
        if updated:
            updated_count += 1
    
    db.commit()
    
    return {
        "message": f"Updated categories for {updated_count} videos",
        "total_videos": len(videos),
        "updated_videos": updated_count
    }
