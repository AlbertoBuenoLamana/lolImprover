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
} from '@mui/material';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { RootState } from '../store';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Welcome to LoL Improve
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          Track your League of Legends game performance and improve your skills with our comprehensive
          game tracking and video tutorial system.
        </Typography>
        
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
        
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <VideogameAssetIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5" component="h2">
                    Game Session Tracking
                  </Typography>
                </Box>
                <Typography>
                  Record your game sessions with detailed information about your character, enemy character,
                  game result, and mood. Set and track goals for each game to continuously improve your skills.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  component={RouterLink}
                  to={isAuthenticated ? "/game-sessions" : "/login"}
                >
                  {isAuthenticated ? "View Game Sessions" : "Login to Access"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  component={RouterLink}
                  to={isAuthenticated ? "/video-tutorials" : "/login"}
                >
                  {isAuthenticated ? "Browse Videos" : "Login to Access"}
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
