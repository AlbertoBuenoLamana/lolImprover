# LoL Improve - Game Performance Tracking Application

A comprehensive application for tracking League of Legends game performance and managing video tutorials.

## Features

- Game session tracking with character selection and mood rating
- Dynamic goals tracking for each game session
- Video tutorial management with progress tracking
- Responsive design for desktop and mobile use

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Python with FastAPI
- **Database**: PostgreSQL
- **Authentication**: JWT-based

## Project Structure

```
lolImprove/
├── backend/           # Python FastAPI backend
│   ├── app/           # Main application code
│   ├── alembic/       # Database migrations
│   └── tests/         # Backend tests
├── frontend/          # React frontend
│   ├── public/        # Static files
│   └── src/           # React components and logic
└── docs/              # Documentation
```

## Getting Started

### Backend Setup

1. Install Python 3.9+ and PostgreSQL
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Set up the database:
   ```
   alembic upgrade head
   ```
5. Start the backend server:
   ```
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Install Node.js and npm
2. Navigate to the frontend directory:
   ```
   cd frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm start
   ```

## Development Approach

Following the recommended approach from the project specification:

1. Database schema design
2. Backend API development
3. Frontend component creation
4. Authentication implementation
5. Feature module development
6. Testing
7. Optimization
8. Deployment
