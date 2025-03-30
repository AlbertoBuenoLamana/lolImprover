import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import json

sys.path.append('.')
from app.models import GameSession
from app.database import get_db, Base

# Load environment variables from .env file
load_dotenv()

# Database connection setup - using the same configuration as in the app
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost/lolimprove")
if SQLALCHEMY_DATABASE_URL is None:
    # Fallback to a default URL if environment variable is not set
    SQLALCHEMY_DATABASE_URL = "postgresql://postgres:password@localhost/lolimprove"
    print(f"Warning: DATABASE_URL not found in environment variables. Using default: {SQLALCHEMY_DATABASE_URL}")
    
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def migrate_goals_data():
    """
    Migrate data from the 'goals' column to 'goal_progress' format.
    This script should be run after the database migration that removed the goals column.
    """
    db = SessionLocal()
    try:
        # Get all game sessions
        sessions = db.query(GameSession).all()
        
        updated_count = 0
        print(f"Found {len(sessions)} game sessions")
        
        for session in sessions:
            # Check if goal_progress is empty
            if not session.goal_progress or len(session.goal_progress) == 0:
                # Skip sessions without goal progress data
                continue
                
            print(f"Processing session {session.id}...")
            
            # The goals column should already be removed from the model
            # We're simply verifying that goal_progress data is in the correct format
            
            # For safety, convert goal_progress to a list if it's not already
            if isinstance(session.goal_progress, dict):
                # If it's a dict, convert to list
                converted_goals = []
                for goal_id, data in session.goal_progress.items():
                    # Try to get the title, fallback to using goal_id as string
                    title = data.get('title', f"Goal {goal_id}")
                    converted_goal = {
                        'goal_id': int(goal_id) if goal_id.isdigit() else 0,
                        'title': title,
                        'notes': data.get('notes', ''),
                        'progress_rating': data.get('progress_rating', 1)
                    }
                    converted_goals.append(converted_goal)
                session.goal_progress = converted_goals
                updated_count += 1
                
        if updated_count > 0:
            db.commit()
            print(f"Updated {updated_count} game sessions with converted goal_progress data")
        else:
            print("No game sessions needed updating")
            
    except Exception as e:
        print(f"Error migrating goals data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting goals data migration...")
    migrate_goals_data()
    print("Goals data migration completed") 