import requests
import json
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from sqlalchemy.orm import Session

from .. import models, schemas

# Helper class to handle Kemono.su API integration
class KemonoService:
    BASE_URL = "https://kemono.su/api/v1"
    
    @staticmethod
    def fetch_videos(creator_id: str, service: str = "patreon") -> List[Dict[str, Any]]:
        """Fetch all videos from a creator"""
        all_data = []
        offset = 0
        has_more = True
        
        while has_more:
            url = f"{KemonoService.BASE_URL}/{service}/user/{creator_id}"
            params = {'o': offset}
            headers = {'accept': 'application/json'}
            
            try:
                response = requests.get(url, headers=headers, params=params)
                response.raise_for_status()
                data = response.json()
                
                if not data:
                    has_more = False
                    break
                    
                all_data.extend(data)
                print(f"Fetched {len(data)} items at offset {offset}")
                offset += 50
                
            except requests.exceptions.RequestException as e:
                print(f"Error fetching data: {e}")
                break
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON: {e}")
                break
        
        return all_data
    
    @staticmethod
    def categorize_videos(videos: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Categorize videos based on their titles"""
        # Define the categories and corresponding title patterns
        categories = {
            "Fundamentals": [
                "Snowball fundamentals",
                "Carrying 3 losing lanes Fundamentals",
                "Fundamentals to climb and how to play early",
                "Key Fundamentals explained to 1v9",
                "The Correct way to play for wincondition",
                "How to COUNTER all invades",
                "How to SMASH people in D1 elo",
                "Conditions for a gank to succeed"
            ],
            "Early Game Course": [
                "Early game 1v9 course",
                "champion mastery",
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
            ],
            "Midgame Course": [
                "Baron conditions",
                "Midgame course",
                "Tempo",
                "Baron usage",
                "How to play for baron",
                "Recognise the objective",
                "Pingpong",
                "WHW Concept",
                "Drake windows"
            ],
            "Classes": [
                "Ganking & Playing for wincon class",
                "Drakes & How to snowball",
                "Tempo class"
            ],
            "Practical Course": [
                "Practical course",
                "How to play for wincondition & Planning",
                "WW Concept",
                "BASE TIMERS",
                "Rehearsal of the practical courses",
                "BEST way to GANK",
                "When to farm when to gank",
                "Perfect Jungle Tracking",
                "Waves understanding",
                "Art of Invading",
                "Level lead",
                "Understanding pathing options",
                "Camera control & Jungle tracking",
                "How to play mechanically well"
            ],
            "Uncategorized": []
        }
        
        # Initialize result dictionary
        categorized = {category: [] for category in categories.keys()}
        
        # Categorize each video
        for video in videos:
            title = video.get('title', '').strip()
            categorized_flag = False
            
            # Check if the title matches any of our category patterns
            for category, patterns in categories.items():
                if category == "Uncategorized":
                    continue
                    
                for pattern in patterns:
                    if pattern.lower() in title.lower():
                        categorized[category].append(video)
                        categorized_flag = True
                        break
                
                if categorized_flag:
                    break
            
            # If not categorized, add to Uncategorized
            if not categorized_flag:
                categorized["Uncategorized"].append(video)
        
        return categorized
    
    @staticmethod
    def process_video(video: Dict[str, Any]) -> Dict[str, Any]:
        """Process a video to extract needed information"""
        # Make sure tags are properly processed as a list
        tags = video.get("tags", [])
        if isinstance(tags, str):
            # Try to parse a string that might be formatted as a PostgreSQL array
            if tags.startswith('{') and tags.endswith('}'):
                tags = tags[1:-1].split(',')
                tags = [tag.strip('"\'') for tag in tags]
            else:
                tags = [tags]
        elif not isinstance(tags, list):
            tags = []
            
        processed = {
            "kemono_id": video.get("id", ""),
            "title": video.get("title", ""),
            "creator": video.get("user", ""),
            "creator_id": video.get("user", ""),
            "service": video.get("service", ""),
            "added_date": video.get("added", ""),
            "published_date": video.get("published", ""),
            "description": "",
            "url": "",
            "key_points": video.get("content", "").replace("<p>", "").replace("</p>", "\n").strip(),
            "tags": tags,  # Using the properly processed tags
            "video_type": "direct" if video.get("file", {}).get("path", "").endswith(".mp4") else "embed"
        }
        
        # Extract video URL
        if video.get("file", {}).get("path", "").endswith(".mp4"):
            processed["url"] = f"https://kemono.su{video['file']['path']}"
            processed["video_type"] = "direct"
        elif video.get("embed", {}).get("url", ""):
            processed["url"] = video["embed"]["url"]
            processed["video_type"] = "embed"
            processed["description"] = video.get("embed", {}).get("description", "")
        
        return processed
    
    @staticmethod
    def import_videos(db: Session, creator_id: str, service: str = "patreon", 
                     category_mapping: Optional[Dict[str, int]] = None) -> Tuple[int, int, int, List[models.VideoTutorial]]:
        """Import videos from kemono.su into the database"""
        # Fetch videos
        raw_videos = KemonoService.fetch_videos(creator_id, service)
        total_videos = len(raw_videos)
        
        # Process videos
        imported_count = 0
        skipped_count = 0
        imported_videos = []
        
        for raw_video in raw_videos:
            # Process video data
            processed = KemonoService.process_video(raw_video)
            
            # Skip videos without URLs
            if not processed["url"]:
                skipped_count += 1
                continue
                
            # Try to find an existing video with the same title and URL to avoid duplicates
            existing = db.query(models.VideoTutorial).filter(
                models.VideoTutorial.title == processed["title"],
                models.VideoTutorial.url == processed["url"]
            ).first()
            
            if existing:
                skipped_count += 1
                continue
            
            # Determine category_id based on title if mapping provided
            category_id = None
            if category_mapping:
                video_title = processed["title"].lower()
                
                for pattern, cat_id in category_mapping.items():
                    if pattern.lower() in video_title:
                        category_id = cat_id
                        break
            
            # Ensure tags is a proper list
            if processed["tags"] and not isinstance(processed["tags"], list):
                if isinstance(processed["tags"], str):
                    # Handle PostgreSQL array format
                    if processed["tags"].startswith('{') and processed["tags"].endswith('}'):
                        processed["tags"] = processed["tags"][1:-1].split(',')
                        processed["tags"] = [tag.strip('"\'') for tag in processed["tags"]]
                    else:
                        processed["tags"] = [processed["tags"]]
                else:
                    processed["tags"] = []
                    
            # Create video with all columns that now exist in the database
            video = models.VideoTutorial(
                title=processed["title"],
                creator=processed["creator"],
                url=processed["url"],
                description=processed["description"],
                video_type=processed["video_type"],
                upload_date=datetime.fromisoformat(processed["published_date"].replace("Z", "+00:00")) if processed["published_date"] else None,
                key_points=processed["key_points"],
                kemono_id=processed["kemono_id"],
                service=processed["service"],
                creator_id=processed["creator_id"],
                added_date=datetime.fromisoformat(processed["added_date"].replace("Z", "+00:00")) if processed["added_date"] else None,
                published_date=datetime.fromisoformat(processed["published_date"].replace("Z", "+00:00")) if processed["published_date"] else None,
                tags=processed["tags"],
                category_id=category_id
            )
            
            db.add(video)
            db.commit()
            db.refresh(video)
            
            imported_videos.append(video)
            imported_count += 1
        
        return total_videos, imported_count, skipped_count, imported_videos 