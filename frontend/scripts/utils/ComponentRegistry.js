/**
 * ComponentRegistry.js
 * 
 * CommonJS version of the ComponentRegistry for use in scripts.
 */

// Layout components
const layoutComponents = {
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
const authComponents = {
  ProtectedRoute: {
    name: 'ProtectedRoute',
    path: 'components/Auth/ProtectedRoute.tsx',
    description: 'Route wrapper that checks for authentication',
    category: 'auth',
    dependencies: [],
    usedBy: ['App'],
  },
};

// UI components
const uiComponents = {
  VideoCard: {
    name: 'VideoCard',
    path: 'components/Ui/VideoCard.tsx',
    description: 'Card displaying video information',
    category: 'ui',
    dependencies: [],
    usedBy: ['VideoTutorialsPage'],
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
  Logo: {
    name: 'Logo',
    path: 'components/Ui/Logo.tsx',
    description: 'A reusable logo component that displays the LoL Improve logo with consistent styling across the application',
    category: 'ui',
    dependencies: [],
    usedBy: ['Header', 'Footer', 'HomePage', 'LoginPage', 'RegisterPage'],
    propsInterface: 'LogoProps',
    example: '<Logo size="medium" variant="default" />'
  },
};

// Page components
const pageComponents = {
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
const videoComponents = {
  VideoTutorialsPage: {
    name: 'VideoTutorialsPage',
    path: 'pages/Videos/VideoTutorialsPage.tsx',
    description: 'Page displaying video tutorials with search and filter functionality',
    category: 'page',
    dependencies: ['VideoCard'],
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
  VideoStatisticsPage: {
    name: 'VideoStatisticsPage',
    path: 'pages/Videos/VideoStatisticsPage.tsx',
    description: 'Page displaying video statistics',
    category: 'page',
    dependencies: [],
    usedBy: ['App'],
  },
};

// Game session components
const gameSessionComponents = {
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
const goalComponents = {
  GoalManagementPage: {
    name: 'GoalManagementPage',
    path: 'pages/GoalManagementPage.tsx',
    description: 'Page for managing goals with tabs for active, completed, and archived goals',
    category: 'page',
    dependencies: ['GoalList', 'GoalForm'],
    usedBy: ['App'],
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
const adminComponents = {
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
const getAllComponents = () => {
  return [
    ...Object.values(layoutComponents),
    ...Object.values(authComponents),
    ...Object.values(uiComponents),
    ...Object.values(pageComponents),
    ...Object.values(videoComponents),
    ...Object.values(gameSessionComponents),
    ...Object.values(goalComponents),
    ...Object.values(adminComponents),
  ];
};

const findComponentByName = (name) => {
  return getAllComponents().find(component => component.name === name);
};

const findComponentsByCategory = (category) => {
  return getAllComponents().filter(component => component.category === category);
};

const findDuplicateComponents = () => {
  const componentsByName = {};
  
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

module.exports = {
  layoutComponents,
  authComponents,
  uiComponents,
  pageComponents,
  videoComponents,
  gameSessionComponents,
  goalComponents,
  adminComponents,
  getAllComponents,
  findComponentByName,
  findComponentsByCategory,
  findDuplicateComponents
}; 