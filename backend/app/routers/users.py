from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(
    user: schemas.UserCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)  # Require admin privileges
):
    """Create a new user (admin only)"""
    print(f"Admin {current_user.username} creating user: {user.email}, {user.username}")
    
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        print(f"Email already registered: {user.email}")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_username = db.query(models.User).filter(models.User.username == user.username).first()
    if db_username:
        print(f"Username already taken: {user.username}")
        raise HTTPException(status_code=400, detail="Username already taken")
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        is_admin=user.is_admin  # Allow setting admin status when creating
    )
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        print(f"User created successfully: {user.username}")
        return db_user
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user


@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.get("/", response_model=List[schemas.User])
def list_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)  # Require admin privileges
):
    """List all users (admin only)"""
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users


@router.put("/me", response_model=schemas.User)
def update_user_profile(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Update the current user's profile"""
    
    # Check if username is being changed and if it's already taken
    if user_update.username != current_user.username:
        db_user = db.query(models.User).filter(models.User.username == user_update.username).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    # Check if email is being changed and if it's already registered
    if user_update.email != current_user.email:
        db_user = db.query(models.User).filter(models.User.email == user_update.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # If password change is requested, verify current password
    if user_update.current_password:
        if not auth.verify_password(user_update.current_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        # Set new password
        if user_update.new_password:
            current_user.hashed_password = auth.get_password_hash(user_update.new_password)
    
    # Update other fields
    current_user.username = user_update.username
    current_user.email = user_update.email
    
    try:
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
