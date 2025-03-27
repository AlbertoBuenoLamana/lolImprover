import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath('backend'))

from app.database import get_db, engine
from app.models import VideoTutorial, Creator
from sqlalchemy.orm import Session

def create_creators():
    # Create a database session
    db = next(get_db())
    try:
        # Get all unique creator names from videos
        videos = db.query(VideoTutorial).all()
        unique_creators = set()
        for video in videos:
            if video.creator and video.creator.strip():
                unique_creators.add(video.creator.strip())
        
        print(f"Found {len(unique_creators)} unique creators")
        
        # Create Creator for each unique name
        created_creators = []
        for creator_name in unique_creators:
            # Check if creator already exists by name
            existing_creator = db.query(Creator).filter(Creator.name == creator_name).first()
            if not existing_creator:
                # Create new creator
                new_creator = Creator(name=creator_name)
                db.add(new_creator)
                db.commit()
                db.refresh(new_creator)
                created_creators.append(new_creator)
                
                # Update all videos with this creator
                videos_to_update = db.query(VideoTutorial).filter(VideoTutorial.creator == creator_name).all()
                for video in videos_to_update:
                    video.creator_relation_id = new_creator.id
                db.commit()
                
                print(f"Created creator: {creator_name} (ID: {new_creator.id})")
            else:
                created_creators.append(existing_creator)
                print(f"Creator already exists: {creator_name} (ID: {existing_creator.id})")
        
        print(f"Processed {len(created_creators)} creators")
    finally:
        db.close()

if __name__ == "__main__":
    print("Creating creators from existing videos...")
    create_creators()
    print("Done!") 