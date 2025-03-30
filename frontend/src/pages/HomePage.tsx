import React from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Container,
  Paper,
  Divider,
} from '@mui/material';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import FlagIcon from '@mui/icons-material/Flag';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { RootState } from '../store';
import Logo from '../components/Ui/Logo';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Logo size="large" variant="default" sx={{ mb: 3 }} />
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Welcome to LoL Improve
          </Typography>
          <Typography variant="h5" align="center" color="text.secondary" paragraph>
            Track your League of Legends game performance and improve your skills with our comprehensive
            game tracking and video tutorial system.
          </Typography>
        </Box>
        
        {!isAuthenticated && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={RouterLink}
              to="/login"
            >
              Login
            </Button>
          </Box>
        )}

        {isAuthenticated && user && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 4, 
              mt: 4, 
              borderRadius: 2,
              bgcolor: 'background.paper',
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9))',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DashboardIcon color="primary" sx={{ fontSize: 30, mr: 2 }} />
              <Typography variant="h5">Your Dashboard</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="h4">{user.stats?.game_sessions_count || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Game Sessions</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="h4">{user.stats?.goals_achieved_count || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Goals Achieved</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="h4">{user.stats?.videos_watched_count || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Videos Watched</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 5 } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <VideogameAssetIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5" component="h2">
                    Game Sessions
                  </Typography>
                </Box>
                <Typography>
                  Record your game sessions with detailed information about your character, enemy character,
                  game result, and mood. Set and track goals for each game to continuously improve your skills.
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  component={RouterLink}
                  to={isAuthenticated ? "/game-sessions" : "/login"}
                >
                  {isAuthenticated ? "View Game Sessions" : "Login to Access"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 5 } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FlagIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5" component="h2">
                    Goals
                  </Typography>
                </Box>
                <Typography>
                  Set clear, achievable goals to improve your gameplay. Track your progress, mark goals as complete,
                  and use them in your game sessions to focus your improvement efforts.
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  component={RouterLink}
                  to={isAuthenticated ? "/goals" : "/login"}
                >
                  {isAuthenticated ? "Manage Goals" : "Login to Access"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 5 } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <VideoLibraryIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5" component="h2">
                    Video Tutorials
                  </Typography>
                </Box>
                <Typography>
                  Access a library of video tutorials to improve your gameplay. Track your progress,
                  mark videos as watched, and take personal notes for each video. Import video collections
                  from JSON files.
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  component={RouterLink}
                  to={isAuthenticated ? "/video-tutorials" : "/login"}
                >
                  {isAuthenticated ? "Browse Videos" : "Login to Access"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 5 } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5" component="h2">
                    Creators
                  </Typography>
                </Box>
                <Typography>
                  Discover and follow top League of Legends content creators. Browse their video collections,
                  learn from their tutorials, and improve your gameplay with expert advice from the community.
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  component={RouterLink}
                  to={isAuthenticated ? "/creators" : "/login"}
                >
                  {isAuthenticated ? "View Creators" : "Login to Access"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 5 } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5" component="h2">
                    Your Profile
                  </Typography>
                </Box>
                <Typography>
                  View and update your personal profile. Track your overall statistics, manage your account settings,
                  and see a summary of your progress. Keep your information up to date for a personalized experience.
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="contained" 
                  color="primary"
                  component={RouterLink}
                  to={isAuthenticated ? "/profile" : "/login"}
                >
                  {isAuthenticated ? "View Profile" : "Login to Access"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;
