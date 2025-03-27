# Game Performance Tracking Application - Project Specification

## Core Application Requirements
### Technical Stack
- Frontend: React (Latest Version)
- Backend: Python (with FastAPI or Django)
- Database: PostgreSQL
- State Management: Redux or React Context
- Authentication: JWT-based

### Main Features

#### Game Session Tracking
1. Create New Game Entry with following fields:
   - Date/Time of Game
   - Player Character (Selector with internal search)
   - Enemy Character (Selector with internal search)
   - Game Result (Win/Lose)
   - Mood Rating (5-point emoji scale from very bad to very good)

#### Goals Tracking
- Dynamic goals tracking based on predefined goal templates
- Ability to add, edit, and track multiple goals per game session
- Goals categories might include:
  - Strategic objectives
  - Performance metrics
  - Personal improvement targets

#### Video Tutorial Management
1. Video Tutorial Section
   - JSON Import Functionality
   - Store video metadata in PostgreSQL
   - Support for both YouTube and direct .mp4 video links
   - Tracking features:
     * Mark videos as watched
     * Save viewing progress (hours, minutes, seconds)
     * Add personal notes for each video
   
2. Video Discovery Features
   - Filter by content creator
   - Sort by most recent
   - Search by video name
   - YouTube-like feed interface
   - Embedded video player supporting multiple sources

### Database Schema (PostgreSQL)
1. Game Sessions Table
   - id (Primary Key)
   - date
   - player_character
   - enemy_character
   - result
   - mood_rating
   - goals (JSON or related table)

2. Video Tutorials Table
   - id (Primary Key)
   - title
   - creator
   - url
   - description
   - is_watched
   - watch_progress
   - personal_notes
   - upload_date

### Technical Considerations
- Implement robust error handling
- Use TypeScript for type safety
- Implement responsive design
- Secure API endpoints
- Create comprehensive logging

### Recommended Development Approach
1. Start with database schema design
2. Develop backend API with Python
3. Create React frontend with modular components
4. Implement authentication
5. Develop tutorial and game tracking modules
6. Comprehensive testing
7. Performance optimization
8. Deployment and monitoring setup