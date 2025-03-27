from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/game-sessions",
    tags=["game sessions"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=schemas.GameSession, status_code=status.HTTP_201_CREATED)
def create_game_session(
    game_session: schemas.GameSessionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_game_session = models.GameSession(
        **game_session.dict(),
        user_id=current_user.id
    )
    db.add(db_game_session)
    db.commit()
    db.refresh(db_game_session)
    return db_game_session


@router.get("/", response_model=List[schemas.GameSession])
def read_game_sessions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    game_sessions = db.query(models.GameSession).filter(
        models.GameSession.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return game_sessions


@router.get("/{game_session_id}", response_model=schemas.GameSession)
def read_game_session(
    game_session_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_game_session = db.query(models.GameSession).filter(
        models.GameSession.id == game_session_id,
        models.GameSession.user_id == current_user.id
    ).first()
    if db_game_session is None:
        raise HTTPException(status_code=404, detail="Game session not found")
    return db_game_session


@router.put("/{game_session_id}", response_model=schemas.GameSession)
def update_game_session(
    game_session_id: int,
    game_session: schemas.GameSessionBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_game_session = db.query(models.GameSession).filter(
        models.GameSession.id == game_session_id,
        models.GameSession.user_id == current_user.id
    ).first()
    if db_game_session is None:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    for key, value in game_session.dict().items():
        setattr(db_game_session, key, value)
    
    db.commit()
    db.refresh(db_game_session)
    return db_game_session


@router.delete("/{game_session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_game_session(
    game_session_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_game_session = db.query(models.GameSession).filter(
        models.GameSession.id == game_session_id,
        models.GameSession.user_id == current_user.id
    ).first()
    if db_game_session is None:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    db.delete(db_game_session)
    db.commit()
    return None
