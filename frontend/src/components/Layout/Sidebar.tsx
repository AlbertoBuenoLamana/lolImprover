import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GroupIcon from '@mui/icons-material/Group';
import FlagIcon from '@mui/icons-material/Flag';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import { RootState } from '../../store';
import Logo from '../Ui/Logo';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/', requireAuth: false },
    { text: 'Game Sessions', icon: <VideogameAssetIcon />, path: '/game-sessions', requireAuth: true },
    { text: 'Goals', icon: <FlagIcon />, path: '/goals', requireAuth: true },
    { text: 'Video Tutorials', icon: <VideoLibraryIcon />, path: '/video-tutorials', requireAuth: true },
    { text: 'Champion Pools', icon: <SportsMartialArtsIcon />, path: '/champion-pools', requireAuth: true },
    { text: 'Creators', icon: <GroupIcon />, path: '/creators', requireAuth: true },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile', requireAuth: true },
    { text: 'Admin Dashboard', icon: <AdminPanelSettingsIcon />, path: '/admin', requireAuth: true, requireAdmin: true },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: (theme) => theme.palette.primary.main,
          color: 'white'
        }}
        onClick={() => handleNavigation('/')}
      >
        <Logo size="medium" variant="white" />
      </Box>
      
      <Divider />
      
      <List>
        {menuItems.map((item) => {
          // Skip auth-required items if not authenticated
          if (item.requireAuth && !isAuthenticated) {
            return null;
          }
          
          // Skip admin-required items if not admin
          if (item.requireAdmin && !(user as any)?.is_admin) {
            return null;
          }
          
          return (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;
