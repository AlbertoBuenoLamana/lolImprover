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
        
        # Define comprehensive title lists for automatic categorization
        fundamental_titles = [
            "Snowball fundamentals",
            "Carrying 3 losing lanes Fundamentals",
            "Fundamentals to climb and how to play early (all elo's)",
            "Key Fundamentals explained to 1v9 every single game (very good vid)",
            "The Correct way to play for wincondition (MUST WATCH VID)",
            "How to COUNTER all invades.",
            "How to SMASH people in D1 elo (step by step explaining)",
            "Conditions for a gank to succeed"
        ]
        
        early_course_titles = [
            "How to get good on Any champion (champion mastery, RLY important video)",
            "#11 Early game 1v9 course: W-W CONCEPT",
            "#10 Early game 1v9 course: BASE TIMERS",
            "#9 Early game 1v9 course: GANK EXECUTION",
            "#8 Early game 1v9 course: WHEN TO FARM WHEN TO GANK.",
            "#7 Early game 1v9 course: ADVANCED JUNGLE TRACKING",
            "#6 Early game 1v9 course: DEEP WAVES UNDERSTANDING",
            "#5 Early game 1v9 course: INVADE LIKE A KING",
            "Understanding pathing options & Winconditions - Episode 3",
            "#2 Early game 1v9 course: CHAMPION IDENTITY",
            "#1 - Early Game 1v9 course: DRAFT"
        ]
        
        midgame_course_titles = [
            "Baron conditions presentation",
            "Midgame course episode 7: Tempo",
            "Midgame course episode 6: Baron usage",
            "Midgame course episode 5: How to play for baron",
            "Midgame course episode 4: Recognise the objective",
            "Midgame course episode 3: Pingpong",
            "Midgame course Lesson 2: WHW Concept (very important)",
            "Midgame course Lesson 1: Drake windows and execution"
        ]
        
        classes_titles = [
            "Ganking & Playing for wincon class",
            "Drakes & How to snowball",
            "Tempo class"
        ]
        
        practical_course_titles = [
            "How to play for wincondition & Planning - Practical course - Episode 11",
            "WW Concept - Practical course - Episode 10 (important)",
            "BASE TIMERS  - Practical course - Episode 9",
            "Practical course - Episode 8 - Rehearsal of the practical courses",
            "BEST way to GANK - Practical course - Episode 7 (insane video)",
            "When to farm when to gank - Practical course - Episode 6 (ganking jg version)",
            "When to farm when to gank - Practical course - Episode 6",
            "Perfect Jungle Tracking | Practical course - Episode 5",
            "Waves understanding and how to push | Practical course - Episode 5",
            "Art of Invading, 5 Level lead with these concepts | Practical course - Episode 4",
            "Understanding pathing options & Winconditions - Episode 3",
            "Camera control & Jungle tracking - Episode 2",
            "How to play mechanically well and predict enemy spells | Practical course - Episode 1"
        ]
        
        # Get category IDs from database if not provided
        if not category_mapping:
            category_mapping = {}
            
            # Try to find category IDs by name
            fundamentals_category = db.query(models.VideoCategory).filter(models.VideoCategory.name == "Fundamentals").first()
            early_game_category = db.query(models.VideoCategory).filter(models.VideoCategory.name == "Early Game Course").first()
            midgame_category = db.query(models.VideoCategory).filter(models.VideoCategory.name == "Midgame Course").first()
            classes_category = db.query(models.VideoCategory).filter(models.VideoCategory.name == "Classes").first()
            practical_category = db.query(models.VideoCategory).filter(models.VideoCategory.name == "Practical Course").first()
            
            # Create title-to-category mappings
            if fundamentals_category:
                for title in fundamental_titles:
                    category_mapping[title.lower()] = fundamentals_category.id
            
            if early_game_category:
                for title in early_course_titles:
                    category_mapping[title.lower()] = early_game_category.id
            
            if midgame_category:
                for title in midgame_course_titles:
                    category_mapping[title.lower()] = midgame_category.id
            
            if classes_category:
                for title in classes_titles:
                    category_mapping[title.lower()] = classes_category.id
            
            if practical_category:
                for title in practical_course_titles:
                    category_mapping[title.lower()] = practical_category.id
            
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
            
            # Determine category_id based on title
            category_id = None
            video_title = processed["title"].lower()
            
            # First check exact title matches
            if video_title in category_mapping:
                category_id = category_mapping[video_title]
            else:
                # Then check partial matches
                for pattern, cat_id in category_mapping.items():
                    if pattern in video_title or video_title in pattern:
                        category_id = cat_id
                        break
                        
                # If still no match, try additional pattern matching
                if category_id is None:
                    if any(ft.lower() in video_title for ft in fundamental_titles):
                        fundamentals_category = db.query(models.VideoCategory).filter(models.VideoCategory.name == "Fundamentals").first()
                        if fundamentals_category:
                            category_id = fundamentals_category.id
                    elif "early game" in video_title or "early-game" in video_title:
                        early_game_category = db.query(models.VideoCategory).filter(models.VideoCategory.name == "Early Game Course").first()
                        if early_game_category:
                            category_id = early_game_category.id
                    elif "midgame" in video_title or "mid game" in video_title or "mid-game" in video_title:
                        midgame_category = db.query(models.VideoCategory).filter(models.VideoCategory.name == "Midgame Course").first()
                        if midgame_category:
                            category_id = midgame_category.id
                    elif "class" in video_title:
                        classes_category = db.query(models.VideoCategory).filter(models.VideoCategory.name == "Classes").first()
                        if classes_category:
                            category_id = classes_category.id
                    elif "practical" in video_title:
                        practical_category = db.query(models.VideoCategory).filter(models.VideoCategory.name == "Practical Course").first()
                        if practical_category:
                            category_id = practical_category.id
            
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