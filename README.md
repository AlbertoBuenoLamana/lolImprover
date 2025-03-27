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
│   ├── src/           # React components and logic
│   ├── scripts/       # Component management scripts
│   └── docs/          # Documentation
└── docs/              # Project documentation
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

## Component Management System

To prevent component duplication and maintain consistent documentation, the project includes a component registry and management system:

### Setup Component System

```
npm run component:setup
```

This initializes the necessary directories and generates initial documentation.

### Create a New Component

```
npm run component:create ComponentName "Component description" category
```

Example:
```
npm run component:create VideoCard "Card displaying video information" ui
```

The component registry is automatically updated when new components are created, so no manual registry updates are needed.

### Audit Components

```
npm run component:audit
```

Analyzes the codebase for potential component duplications and issues.

### Generate Component Documentation

```
npm run docs:generate
```

### Test Registry Updates

```
npm run component:test-registry
```

Tests the automated registry update functionality.

For more details, see [Component System Documentation](frontend/docs/COMPONENT_SYSTEM.md).

## Cursor IDE Integration

The project includes a `.cursorrules` file that helps Cursor IDE understand the component structure and prevent duplication. This configuration:

1. Defines component categories and paths
2. Provides rules for component naming and creation
3. Sets up commands for component management
4. Maps documentation resources

When using Cursor, you can:
- Check if a component already exists before creating a new one
- Follow consistent naming conventions
- Create components using the provided templates
- Find existing components easily

For more details on using the component system with Cursor, see [Cursor Guide](frontend/docs/CURSOR_GUIDE.md).

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
