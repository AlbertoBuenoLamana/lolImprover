from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/goals",
    tags=["goals"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=schemas.Goal, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal: schemas.GoalCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new goal for the current user."""
    db_goal = models.Goal(
        **goal.model_dump(),
        user_id=current_user.id
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal


@router.get("/", response_model=List[schemas.Goal])
def read_goals(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all goals for the current user, optionally filtered by status."""
    query = db.query(models.Goal).filter(
        models.Goal.user_id == current_user.id
    )
    
    if status:
        query = query.filter(models.Goal.status == status)
    
    goals = query.order_by(models.Goal.created_at.desc()).offset(skip).limit(limit).all()
    return goals


@router.get("/{goal_id}", response_model=schemas.Goal)
def read_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get a specific goal by ID."""
    db_goal = db.query(models.Goal).filter(
        models.Goal.id == goal_id,
        models.Goal.user_id == current_user.id
    ).first()
    
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return db_goal


@router.put("/{goal_id}", response_model=schemas.Goal)
def update_goal(
    goal_id: int,
    goal: schemas.GoalBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Update a goal by ID."""
    db_goal = db.query(models.Goal).filter(
        models.Goal.id == goal_id,
        models.Goal.user_id == current_user.id
    ).first()
    
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    for key, value in goal.model_dump().items():
        setattr(db_goal, key, value)
    
    # Update the updated_at timestamp
    db_goal.updated_at = datetime.now()
    
    db.commit()
    db.refresh(db_goal)
    return db_goal


@router.patch("/{goal_id}/status", response_model=schemas.Goal)
def update_goal_status(
    goal_id: int,
    status_update: schemas.GoalStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Update only the status of a goal."""
    db_goal = db.query(models.Goal).filter(
        models.Goal.id == goal_id,
        models.Goal.user_id == current_user.id
    ).first()
    
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    db_goal.status = status_update.status
    db_goal.updated_at = datetime.now()
    
    db.commit()
    db.refresh(db_goal)
    return db_goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Delete a goal by ID."""
    db_goal = db.query(models.Goal).filter(
        models.Goal.id == goal_id,
        models.Goal.user_id == current_user.id
    ).first()
    
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    db.delete(db_goal)
    db.commit()
    return None 