from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
import os

from . import models, schemas, auth
from .database import engine, SessionLocal, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="LoL Improve API", description="API for tracking League of Legends game performance and tutorials")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Admin user credentials
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "lalbertol")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "albertoalagon0@gmail.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin_password_change_me")  # Change this in production!

# Create admin user on startup
@app.on_event("startup")
async def create_admin_user():
    db = SessionLocal()
    try:
        # Check if admin user exists
        admin = db.query(models.User).filter(
            (models.User.username == ADMIN_USERNAME) | 
            (models.User.email == ADMIN_EMAIL)
        ).first()
        
        if not admin:
            print(f"Creating admin user: {ADMIN_USERNAME}")
            hashed_password = auth.get_password_hash(ADMIN_PASSWORD)
            admin_user = models.User(
                username=ADMIN_USERNAME,
                email=ADMIN_EMAIL,
                hashed_password=hashed_password,
                is_admin=True  # We'll add this field to the model
            )
            db.add(admin_user)
            db.commit()
            print(f"Admin user created successfully: {ADMIN_USERNAME}")
        else:
            # Ensure the existing user has admin privileges
            if not getattr(admin, 'is_admin', False):
                admin.is_admin = True
                db.commit()
                print(f"Updated user to admin: {admin.username}")
    except Exception as e:
        print(f"Error creating admin user: {str(e)}")
        db.rollback()
    finally:
        db.close()

# Authentication endpoint
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/")
def read_root():
    return {"message": "Welcome to LoL Improve API"}


# Include routers from other modules
from .routers import users, game_sessions, videos

app.include_router(users.router)
app.include_router(game_sessions.router)
app.include_router(videos.router)
