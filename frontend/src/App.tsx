import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import GameSessionsPage from './pages/GameSessions/GameSessionsPage';
import GameSessionFormPage from './pages/GameSessions/GameSessionFormPage';
import VideoFormPage from './pages/Videos/VideoFormPage';
import VideoTutorialsPage from './pages/Videos/VideoTutorialsPage';
import VideoPlayerPage from './pages/Videos/VideoPlayerPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { getCurrentUser } from './store/slices/authSlice';
import { RootState, AppDispatch } from './store';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CreatorsPage from './pages/Videos/CreatorsPage';
import GoalManagementPage from './pages/GoalManagementPage';
import type { User } from './types';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading, token, user } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    // On app load, if token exists in localStorage but we're not authenticated yet, get user data
    const storedToken = localStorage.getItem('token');
    if (storedToken && !isAuthenticated && !loading) {
      console.log('Found token in localStorage, loading user data...');
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated, loading]);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={
            (user as any)?.is_admin ? <RegisterPage /> : <Navigate to="/login" replace />
          } />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="game-sessions" element={<GameSessionsPage />} />
            <Route path="game-sessions/new" element={<GameSessionFormPage />} />
            <Route path="game-sessions/:id" element={<GameSessionFormPage />} />
            
            {/* Video tutorials routes */}
            <Route path="video-tutorials" element={<VideoTutorialsPage />} />
            <Route path="video-tutorials/new" element={<VideoFormPage />} />
            <Route path="video-tutorials/edit/:id" element={<VideoFormPage />} />
            <Route path="video-tutorials/:videoId" element={<VideoPlayerPage />} />
            
            {/* Goals routes */}
            <Route path="goals" element={<GoalManagementPage />} />
            
            <Route path="profile" element={<ProfilePage />} />
            <Route path="creators" element={<CreatorsPage />} />
          </Route>
          
          {/* Admin routes */}
          <Route path="admin" element={
            isAuthenticated ? 
              ((user as any)?.is_admin ? <AdminDashboard /> : <Navigate to="/" replace />)
              : <Navigate to="/login" replace />
          } />
          
          {/* Fallback routes */}
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Box>
  );
};

export default App;
