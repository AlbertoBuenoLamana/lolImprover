from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import uvicorn
import logging
import traceback
import json

from . import models, schemas
from .database import engine, SessionLocal, get_db
from .auth import authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from .routers import users, game_sessions, videos, goals

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="LoL Improve API")

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Add middleware to log all requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    path = request.url.path
    method = request.method
    headers = dict(request.headers)
    
    # Don't log the full auth header for security
    if 'authorization' in headers:
        auth_header = headers['authorization']
        if auth_header.startswith('Bearer '):
            headers['authorization'] = f"Bearer {auth_header[7:15]}..."
    
    logger.info(f"Request: {method} {path}")
    logger.info(f"Headers: {json.dumps(headers)}")
    
    try:
        response = await call_next(request)
        logger.info(f"Response: {method} {path} - Status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Request failed: {method} {path}")
        logger.error(f"Error: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": str(e)},
        )

# Token endpoint for authentication
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        logger.warning(f"Failed login attempt for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    logger.info(f"Successful login for user: {user.username}")
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the LoL Improve API!"}

# Include routers
app.include_router(users.router)
app.include_router(game_sessions.router)
app.include_router(videos.router)
app.include_router(goals.router)

# Also include routers with /api prefix for backwards compatibility
app.include_router(users.router, prefix="/api")
app.include_router(game_sessions.router, prefix="/api")
app.include_router(videos.router, prefix="/api")
app.include_router(goals.router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
