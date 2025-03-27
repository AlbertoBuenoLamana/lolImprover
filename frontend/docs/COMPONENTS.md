# Component Documentation

This document provides an overview of all components in the application, their purpose, and their relationships.

## Layout Components

### Layout

Main layout wrapper that includes Header, Sidebar, and Footer

- **Path:** `components/Layout/Layout.tsx`
- **Dependencies:** Header, Sidebar, Footer
- **Used by:** App

### Header

Application header with navigation and user menu

- **Path:** `components/Layout/Header.tsx`
- **Dependencies:** None
- **Used by:** Layout

### Sidebar

Navigation sidebar with links to main sections

- **Path:** `components/Layout/Sidebar.tsx`
- **Dependencies:** None
- **Used by:** Layout

### Footer

Application footer with copyright information

- **Path:** `components/Layout/Footer.tsx`
- **Dependencies:** None
- **Used by:** Layout

## Auth Components

### ProtectedRoute

Route wrapper that checks for authentication

- **Path:** `components/Auth/ProtectedRoute.tsx`
- **Dependencies:** None
- **Used by:** App

## Ui Components

### VideoCard

Card displaying video information

- **Path:** `components/Ui/VideoCard.tsx`
- **Dependencies:** None
- **Used by:** VideoTutorialsPage

## Page Components

### HomePage

Main landing page of the application

- **Path:** `pages/HomePage.tsx`
- **Dependencies:** None
- **Used by:** App

### LoginPage

User login page

- **Path:** `pages/Auth/LoginPage.tsx`
- **Dependencies:** None
- **Used by:** App

### RegisterPage

User registration page

- **Path:** `pages/Auth/RegisterPage.tsx`
- **Dependencies:** None
- **Used by:** App

### ProfilePage

User profile page

- **Path:** `pages/ProfilePage.tsx`
- **Dependencies:** None
- **Used by:** App

### NotFoundPage

404 Not Found page

- **Path:** `pages/NotFoundPage.tsx`
- **Dependencies:** None
- **Used by:** App

### VideoTutorialsPage

Page displaying video tutorials with search and filter functionality

- **Path:** `pages/Videos/VideoTutorialsPage.tsx`
- **Dependencies:** VideoCard
- **Used by:** App

### VideoPlayerPage

Video player page with notes and progress tracking

- **Path:** `pages/Videos/VideoPlayerPage.tsx`
- **Dependencies:** None
- **Used by:** App

### VideoFormPage

Form for creating or editing video tutorials

- **Path:** `pages/Videos/VideoFormPage.tsx`
- **Dependencies:** None
- **Used by:** App

### VideosPage

General videos listing page

- **Path:** `pages/Videos/VideosPage.tsx`
- **Dependencies:** None
- **Used by:** App

### CreatorsPage

Page listing video creators

- **Path:** `pages/Videos/CreatorsPage.tsx`
- **Dependencies:** None
- **Used by:** App

### VideoDetailPage

Detailed view of a video

- **Path:** `pages/Videos/VideoDetailPage.tsx`
- **Dependencies:** None
- **Used by:** App

### VideoStatisticsPage

Page displaying video statistics

- **Path:** `pages/Videos/VideoStatisticsPage.tsx`
- **Dependencies:** None
- **Used by:** App

### GameSessionsPage

Page listing game sessions

- **Path:** `pages/GameSessions/GameSessionsPage.tsx`
- **Dependencies:** None
- **Used by:** App

### GameSessionFormPage

Form for creating or editing game sessions

- **Path:** `pages/GameSessions/GameSessionFormPage.tsx`
- **Dependencies:** None
- **Used by:** App

### AdminDashboard

Admin dashboard for site management

- **Path:** `pages/Admin/AdminDashboard.tsx`
- **Dependencies:** None
- **Used by:** App

