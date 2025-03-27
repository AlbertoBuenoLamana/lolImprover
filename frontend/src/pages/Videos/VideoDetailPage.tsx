import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Divider,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { fetchVideo, updateVideoProgress, deleteVideo } from '../../store/slices/videoSlice';
import { RootState, AppDispatch } from '../../store';
import { VideoTutorial, VideoProgress } from '../../types';

interface VideoDetailPageProps {}

const VideoDetailPage: React.FC<VideoDetailPageProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Use type assertion for state.videos
  const { currentVideo, loading, error } = useSelector((state: RootState) => 
    state.videos as {
      currentVideo: (VideoTutorial & { progress?: VideoProgress }) | null;
      loading: boolean;
      error: string | null;
    }
  );
  
  const [notes, setNotes] = useState('');
  const [watched, setWatched] = useState(false);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchVideo(parseInt(id)));
    }
  }, [dispatch, id]);
  
  useEffect(() => {
    // Initialize form with current video progress data
    if (currentVideo?.progress) {
      setNotes(currentVideo.progress.personal_notes || '');
      setWatched(currentVideo.progress.is_watched || false);
    }
  }, [currentVideo]);
  
  const handleUpdateProgress = () => {
    if (id) {
      dispatch(updateVideoProgress({
        videoId: parseInt(id),
        progressData: {
          is_watched: watched,
          personal_notes: notes
        }
      }));
    }
  };
  
  const handleDeleteVideo = () => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      if (id) {
        dispatch(deleteVideo(parseInt(id)));
        navigate('/videos');
      }
    }
  };
  
  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url?.split('v=')[1]?.split('&')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };
  
  if (loading && !currentVideo) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!currentVideo && !loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Alert severity="error">
            Video not found. It may have been deleted or you don't have access to it.
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/videos')}
            sx={{ mt: 2 }}
          >
            Back to Videos
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => navigate('/videos')} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              {currentVideo?.title}
            </Typography>
          </Box>
          <Box>
            <IconButton
              color="primary"
              onClick={() => navigate(`/videos/edit/${id}`)}
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={handleDeleteVideo}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 0, overflow: 'hidden', mb: 3 }}>
              <Box
                component="iframe"
                src={getYouTubeEmbedUrl(currentVideo?.url || '')}
                sx={{
                  width: '100%',
                  height: { xs: '240px', sm: '360px', md: '480px' },
                  border: 'none',
                }}
                allowFullScreen
                title={currentVideo?.title}
              />
            </Paper>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {currentVideo?.description}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                {currentVideo?.tags && currentVideo.tags.map((tag: string, index: number) => (
                  <Chip
                    key={index}
                    label={tag}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Progress
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={watched}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWatched(e.target.checked)}
                  />
                }
                label="Mark as watched"
              />
              
              <TextField
                fullWidth
                label="Your Notes"
                multiline
                rows={6}
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
                sx={{ mt: 2, mb: 2 }}
              />
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleUpdateProgress}
              >
                Save Progress
              </Button>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Video Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Creator ID:</strong> {currentVideo?.creator_id}
              </Typography>
              
              {currentVideo?.created_at && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Created At:</strong> {new Date(currentVideo.created_at).toLocaleDateString()}
                </Typography>
              )}
              
              <Typography variant="body2">
                <strong>Duration:</strong> {currentVideo?.duration} minutes
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default VideoDetailPage;
