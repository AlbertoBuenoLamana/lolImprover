/**
 * ComponentRegistry.ts
 * 
 * This file serves as a centralized registry of all components in the application.
 * It documents their purpose, location, and relationships to prevent duplication.
 */

export interface ComponentMetadata {
  /**
   * Component name
   */
  name: string;
  
  /**
   * Path to the component file relative to src/
   */
  path: string;
  
  /**
   * Brief description of the component's purpose
   */
  description: string;
  
  /**
   * Component category
   */
  category: 'layout' | 'ui' | 'page' | 'feature' | 'auth' | 'form' | 'util';
  
  /**
   * Components that this component depends on
   */
  dependencies: string[];
  
  /**
   * Components that depend on this component
   */
  usedBy: string[];
  
  /**
   * Props interface name
   */
  propsInterface?: string;
  
  /**
   * Example usage of the component
   */
  example?: string;
}

// Layout components
export const layoutComponents: Record<string, ComponentMetadata> = {
  Layout: {
    name: 'Layout',
    path: 'components/Layout/Layout.tsx',
    description: 'Main layout wrapper that includes Header, Sidebar, and Footer',
    category: 'layout',
    dependencies: ['Header', 'Sidebar', 'Footer'],
    usedBy: ['App'],
  },
  Header: {
    name: 'Header',
    path: 'components/Layout/Header.tsx',
    description: 'Application header with navigation and user menu',
    category: 'layout',
    dependencies: [],
    usedBy: ['Layout'],
  },
  Sidebar: {
    name: 'Sidebar',
    path: 'components/Layout/Sidebar.tsx',
    description: 'Navigation sidebar with links to main sections',
    category: 'layout',
    dependencies: [],
    usedBy: ['Layout'],
  },
  Footer: {
    name: 'Footer',
    path: 'components/Layout/Footer.tsx',
    description: 'Application footer with copyright information',
    category: 'layout',
    dependencies: [],
    usedBy: ['Layout'],
  },
};

// Auth components
export const authComponents: Record<string, ComponentMetadata> = {
  ProtectedRoute: {
    name: 'ProtectedRoute',
    path: 'components/Auth/ProtectedRoute.tsx',
    description: 'Route wrapper that checks for authentication',
    category: 'auth',
    dependencies: [],
    usedBy: ['App'],
  },
};

// Page components
export const pageComponents: Record<string, ComponentMetadata> = {
  HomePage: {
    name: 'HomePage',
    path: 'pages/HomePage.tsx',
    description: 'Main landing page of the application',
    category: 'page',
    dependencies: [],
    usedBy: ['App'],
  },
  LoginPage: {
    name: 'LoginPage',
    path: 'pages/Auth/LoginPage.tsx',
    description: 'User login page',
    category: 'page',
    dependencies: [],
    usedBy: ['App'],
  },
  RegisterPage: {
    name: 'RegisterPage',
    path: 'pages/Auth/RegisterPage.tsx',
    description: 'User registration page',
    category: 'page',
    dependencies: [],
    usedBy: ['App'],
  },
  ProfilePage: {
    name: 'ProfilePage',
    path: 'pages/ProfilePage.tsx',
    description: 'User profile page',
    category: 'page',
    dependencies: [],
    usedBy: ['App'],
  },
  NotFoundPage: {
    name: 'NotFoundPage',
    path: 'pages/NotFoundPage.tsx',
    description: '404 Not Found page',
    category: 'page',
    dependencies: [],
    usedBy: ['App'],
  },
};

// Video-related components
export const videoComponents: Record<string, ComponentMetadata> = {
  VideoTutorialsPage: {
    name: 'VideoTutorialsPage',
    path: 'pages/Videos/VideoTutorialsPage.tsx',
    description: 'Page displaying video tutorials with search and filter functionality',
    category: 'page',
    dependencies: [],
    usedBy: ['App'],
  },
  VideoPlayerPage: {
    name: 'VideoPlayerPage',
    path: 'pages/Videos/VideoPlayerPage.tsx',
    description: 'Video player page with notes and progress tracking',
    category: 'page',
    dependencies: [],
    usedBy: ['App'],
  },
  VideoFormPage: {
    name: 'VideoFormPage',
    path: 'pages/Videos/VideoFormPage.tsx',
    description: 'Form for creating or editing video tutorials',
    category: 'page',
    dependencies: [],
    usedBy: ['App'],
  },
  VideosPage: {
    name: 'VideosPage',
    path: 'pages/Videos/VideosPage.tsx',
    description: 'General videos listing page',
    category: 'page',
    dependencies: [],
    usedBy: ['App'],
  },
  CreatorsPage: {
    name: 'CreatorsPage',
    path: 'pages/Videos/CreatorsPage.tsx',
    description: 'Page listing video creators',
    category: 'page',
    dependencies: [],
    usedBy: ['App'],
  },
  VideoDetailPage: {
    name: 'VideoDetailPage',
    path: 'pages/Videos/VideoDetailPage.tsx',
    description: 'Detailed view of a video',
    category: 'page',
    dependencies: [],
    usedBy: ['App'],
  },
};

// Game session components
export const gameSessionComponents: Record<string, ComponentMetadata> = {
  GameSessionsPage: {
    name: 'GameSessionsPage',
    path: 'pages/GameSessions/GameSessionsPage.tsx',
    description: 'Page listing game sessions',
    category: 'page',
    dependencies: [],
    usedBy: ['App'],
  },
  GameSessionFormPage: {
    name: 'GameSessionFormPage',
    path: 'pages/GameSessions/GameSessionFormPage.tsx',
    description: 'Form for creating or editing game sessions',
    category: 'page',
    dependencies: ['GameSessionGoals'],
    usedBy: ['App'],
  },
  GameSessionGoals: {
    name: 'GameSessionGoals',
    path: 'components/Feature/GameSessionGoals.tsx',
    description: 'Component for selecting and tracking goals within game sessions',
    category: 'feature',
    dependencies: [],
    usedBy: ['GameSessionFormPage'],
  },
};

// Goals components
export const goalComponents: Record<string, ComponentMetadata> = {
  GoalManagementPage: {
    name: 'GoalManagementPage',
    path: 'pages/GoalManagementPage.tsx',
    description: 'Page for managing goals with tabs for active, completed, and archived goals',
    category: 'page',
    dependencies: ['GoalList', 'GoalForm'],
    usedBy: ['App'],
  },
  GoalList: {
    name: 'GoalList',
    path: 'components/Ui/GoalList.tsx',
    description: 'Component for displaying a list of goals with filtering and status management',
    category: 'ui',
    dependencies: ['GoalItem'],
    usedBy: ['GoalManagementPage'],
  },
  GoalItem: {
    name: 'GoalItem',
    path: 'components/Ui/GoalItem.tsx',
    description: 'Component for displaying individual goal items with actions',
    category: 'ui',
    dependencies: [],
    usedBy: ['GoalList'],
  },
  GoalForm: {
    name: 'GoalForm',
    path: 'components/Form/GoalForm.tsx',
    description: 'Form for creating or editing goals',
    category: 'form',
    dependencies: [],
    usedBy: ['GoalManagementPage'],
  },
};

// Admin components
export const adminComponents: Record<string, ComponentMetadata> = {
  AdminDashboard: {
    name: 'AdminDashboard',
    path: 'pages/Admin/AdminDashboard.tsx',
    description: 'Admin dashboard for site management',
    category: 'page',
    dependencies: [],
    usedBy: ['App'],
  },
};

// Helper functions to work with the registry
export const getAllComponents = (): ComponentMetadata[] => {
  return [
    ...Object.values(layoutComponents),
    ...Object.values(authComponents),
    ...Object.values(pageComponents),
    ...Object.values(videoComponents),
    ...Object.values(gameSessionComponents),
    ...Object.values(goalComponents),
    ...Object.values(adminComponents),
  ];
};

export const findComponentByName = (name: string): ComponentMetadata | undefined => {
  return getAllComponents().find(component => component.name === name);
};

export const findComponentsByCategory = (category: ComponentMetadata['category']): ComponentMetadata[] => {
  return getAllComponents().filter(component => component.category === category);
};

export const findDuplicateComponents = (): { [key: string]: ComponentMetadata[] } => {
  const componentsByName: { [key: string]: ComponentMetadata[] } = {};
  
  getAllComponents().forEach(component => {
    if (!componentsByName[component.name]) {
      componentsByName[component.name] = [];
    }
    componentsByName[component.name].push(component);
  });
  
  return Object.fromEntries(
    Object.entries(componentsByName).filter(([_, components]) => components.length > 1)
  );
}; 