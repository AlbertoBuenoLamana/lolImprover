import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  IconButton,
  Button,
  Divider,
  LinearProgress,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  TextField,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  alpha,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FlagIcon from '@mui/icons-material/Flag';
import PersonIcon from '@mui/icons-material/Person';
import axios from '../../api/axios';
import { RootState } from '../../store';
import { fetchCreators, setVideoCreator } from '../../store/slices/creatorSlice';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { AnyAction } from 'redux';

// Manually define Creator type if needed
type Creator = {
  id: number;
  name: string;
  description?: string;
  website?: string;
};

// YouTube API interfaces
interface YT {
  Player: any;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

// Extend Window interface to include YT
declare global {
  interface Window {
    YT: YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoProgress {
  id: number;
  user_id: number;
  video_id: number;
  position_seconds: number;
  duration_seconds?: number;
  is_completed: boolean;
  last_watched: string;
  notes: string;
}

interface VideoCategory {
  id: number;
  name: string;
  description?: string;
}

interface VideoTutorial {
  id: number;
  title: string;
  creator: string;
  url: string;
  description?: string;
  upload_date?: string;
  video_type: string;
  key_points?: string;
  tags?: string[];
  category?: VideoCategory;
  category_id?: number;
  kemono_id?: string;
  service?: string;
  creator_id?: string;
  added_date?: string;
  published_date?: string;
  duration_seconds?: number;
}

// A custom component for the video player
const VideoPlayer: React.FC<{
  url: string;
  initialPosition?: number;
  onTimeUpdate: (currentTime: number) => void;
  onVideoEnd: () => void;
  onPause: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
}> = ({ url, initialPosition = 0, onTimeUpdate, onVideoEnd, onPause, onDurationChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(initialPosition);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const youtubePlayerRef = useRef<any>(null);
  
  // Check if URL is a YouTube URL
  const isYouTubeUrl = url.includes('youtube.com') || url.includes('youtu.be');
  
  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url?.split('v=')[1]?.split('&')[0] || 
                   url?.split('youtu.be/')[1]?.split('?')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&start=${Math.floor(initialPosition)}` : '';
  };

  useEffect(() => {
    // Set initial position when the component mounts (for direct videos only)
    if (!isYouTubeUrl && videoRef.current && initialPosition > 0) {
      videoRef.current.currentTime = initialPosition;
    }
    
    // For YouTube videos, we don't need to handle the loading state
    if (isYouTubeUrl) {
      setIsLoading(false);
      
      // Initialize YouTube Player API
      if (window.YT && window.YT.Player) {
        initYouTubePlayer();
      } else {
        // Load YouTube Player API if not already loaded
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        
        // Define callback for when API is ready
        window.onYouTubeIframeAPIReady = initYouTubePlayer;
      }
    }
    
    function initYouTubePlayer() {
      const videoId = url?.split('v=')[1]?.split('&')[0] || 
                     url?.split('youtu.be/')[1]?.split('?')[0];
      
      if (!videoId) return;
      
      // Find the iframe element
      const iframe = document.querySelector('iframe');
      if (!iframe || !iframe.id) {
        iframe?.setAttribute('id', 'youtube-player');
      }
      
      const playerId = iframe?.id || 'youtube-player';
      
      youtubePlayerRef.current = new window.YT.Player(playerId, {
        events: {
          'onReady': (event: any) => {
            console.log('YouTube player ready');
            // Get video duration when player is ready
            if (youtubePlayerRef.current && onDurationChange) {
              const duration = youtubePlayerRef.current.getDuration();
              console.log('YouTube video duration:', duration);
              setDuration(duration);
              onDurationChange(duration);
            }
          },
          'onStateChange': (event: any) => {
            // YT.PlayerState.PAUSED = 2
            if (event.data === window.YT.PlayerState.PAUSED) {
              try {
                const currentTime = youtubePlayerRef.current.getCurrentTime();
                console.log('YouTube video paused at:', currentTime);
                setCurrentTime(currentTime);
                onPause(currentTime);
              } catch (error) {
                console.error('Error getting YouTube current time:', error);
              }
            }
          },
          'onError': (event: any) => {
            console.error('YouTube player error:', event.data);
            setError('Error playing YouTube video. Please try again.');
          }
        }
      });
    }
  }, [initialPosition, isYouTubeUrl, url, onPause, onDurationChange]);

  useEffect(() => {
    // Only set up these listeners for direct videos
    if (isYouTubeUrl || !videoRef.current) return;
    
    const videoElement = videoRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
      onTimeUpdate(videoElement.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(videoElement.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onVideoEnd();
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(videoElement.duration);
      
      // Call the duration change callback if provided
      if (onDurationChange) {
        onDurationChange(videoElement.duration);
      }
    };

    const handleLoadingError = (e: Event) => {
      setIsLoading(false);
      setError('Failed to load video. Please try again later.');
      console.error('Video loading error:', e);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      onPause(videoElement.currentTime);
    };

    // Add event listeners
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('durationchange', handleDurationChange);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('error', handleLoadingError);
    videoElement.addEventListener('pause', handlePause);

    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement ||
        !!(document as any).webkitFullscreenElement ||
        !!(document as any).mozFullScreenElement ||
        !!(document as any).msFullscreenElement
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Cleanup event listeners
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('durationchange', handleDurationChange);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('error', handleLoadingError);
      videoElement.removeEventListener('pause', handlePause);
      
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [onTimeUpdate, onVideoEnd, isYouTubeUrl, onPause]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    const videoContainer = document.getElementById('video-container');
    if (!videoContainer) return;

    if (!isFullscreen) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if ((videoContainer as any).webkitRequestFullscreen) {
        (videoContainer as any).webkitRequestFullscreen();
      } else if ((videoContainer as any).mozRequestFullScreen) {
        (videoContainer as any).mozRequestFullScreen();
      } else if ((videoContainer as any).msRequestFullscreen) {
        (videoContainer as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Format time in HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box 
      id="video-container" 
      sx={{
        position: 'relative',
        width: '100%',
        bgcolor: 'black',
        borderRadius: 1,
        overflow: 'hidden',
        '&:hover .video-controls': {
          opacity: 1,
        },
      }}
    >
      {isLoading && !isYouTubeUrl && (
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      )}
      
      {error && (
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            bgcolor: alpha('#000', 0.7),
            zIndex: 10,
            p: 3,
          }}
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Box>
      )}
      
      {isYouTubeUrl ? (
        <Box
          component="iframe"
          src={getYouTubeEmbedUrl(url)}
          sx={{
            width: '100%',
            height: { xs: '240px', sm: '360px', md: '480px' },
            border: 'none',
          }}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title="Video player"
        />
      ) : (
        <video
          ref={videoRef}
          src={url}
          style={{ width: '100%', display: 'block' }}
          onClick={togglePlay}
        />
      )}
      
      {/* Only show custom controls for direct videos, not for YouTube */}
      {!isYouTubeUrl && (
        <Box 
          className="video-controls"
          sx={{ 
            position: 'absolute',
            bottom: 0,
            width: '100%',
            padding: 2,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))',
            opacity: 0,
            transition: 'opacity 0.3s',
          }}
        >
          {/* Progress bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'white', mr: 1, minWidth: 50 }}>
              {formatTime(currentTime)}
            </Typography>
            
            <Box sx={{ flexGrow: 1, mx: 1 }}>
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </Box>
            
            <Typography variant="caption" sx={{ color: 'white', ml: 1, minWidth: 50 }}>
              {formatTime(duration)}
            </Typography>
          </Box>
          
          {/* Controls */}
          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <IconButton color="primary" size="small" onClick={togglePlay}>
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
            </Grid>
            
            <Grid item>
              <IconButton color="primary" size="small" onClick={toggleMute}>
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
            </Grid>
            
            <Grid item>
              <IconButton color="primary" size="small" onClick={toggleFullscreen}>
                <FullscreenIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

const VideoPlayerPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  
  // State
  const [video, setVideo] = useState<VideoTutorial | null>(null);
  const [videoProgress, setVideoProgress] = useState<VideoProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [notes, setNotes] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [bookmarked, setBookmarked] = useState(false);
  
  // Get auth token
  const token = useSelector((state: RootState) => state.auth.token);
  const { creators } = useSelector((state: RootState) => state.creators);
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Fetch creators when component mounts
  useEffect(() => {
    dispatch(fetchCreators());
  }, [dispatch]);
  
  // Format time in HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Fetch video and progress on component mount
  useEffect(() => {
    if (!videoId) return;
    
    const fetchVideoAndProgress = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch video details
        const videoResponse = await axios.get(`/videos/${videoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setVideo(videoResponse.data);
        
        // Try to fetch existing progress
        try {
          const progressResponse = await axios.get(`/videos/progress/${videoId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setVideoProgress(progressResponse.data);
          setNotes(progressResponse.data.notes || '');
          setBookmarked(!!progressResponse.data.is_bookmarked);
        } catch (err) {
          // It's okay if there's no progress yet
          console.log('No existing progress found');
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load video');
        console.error('Error fetching video:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideoAndProgress();
  }, [videoId, token]);
  
  // Update progress handler
  const handleTimeUpdate = async (currentTime: number) => {
    if (!videoId) return;
    
    // Only save progress every 5 seconds to avoid too many requests
    if (videoProgress && Math.abs(videoProgress.position_seconds - currentTime) < 5) {
      return;
    }
    
    try {
      setSaveStatus('saving');
      
      await axios.post(`/videos/${videoId}/progress`, {
        position_seconds: Math.floor(currentTime),
        notes: notes,
        is_bookmarked: bookmarked
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSaveStatus('saved');
      
      // Update local progress
      setVideoProgress(prev => prev ? {
        ...prev,
        position_seconds: Math.floor(currentTime)
      } : null);
      
      // Reset save status after 2 seconds
      setTimeout(() => {
        if (setSaveStatus) {
          setSaveStatus('idle');
        }
      }, 2000);
    } catch (err) {
      console.error('Error saving progress:', err);
      setSaveStatus('error');
    }
  };
  
  // Handle pause - save current position
  const handlePause = async (currentTime: number) => {
    if (!videoId) return;
    
    console.log('Video paused at position:', currentTime);
    
    try {
      setSaveStatus('saving');
      
      const payload = {
        position_seconds: Math.floor(currentTime),
        notes: notes,
        is_bookmarked: bookmarked
      };
      
      console.log('Saving pause position:', payload);
      
      const response = await axios.post(`/videos/${videoId}/progress`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Pause position saved:', response.data);
      
      setSaveStatus('saved');
      
      // Update local progress
      setVideoProgress(prev => prev ? {
        ...prev,
        position_seconds: Math.floor(currentTime)
      } : {
        // Create a minimal progress object if none exists
        id: response.data.id,
        video_id: Number(videoId),
        user_id: response.data.user_id,
        position_seconds: Math.floor(currentTime),
        notes: notes,
        is_bookmarked: bookmarked,
        last_watched: new Date().toISOString(),
        is_completed: false,
        duration_seconds: 0,
        watch_progress: Math.floor(currentTime),
        is_watched: false,
        personal_notes: notes
      });
      
      // Reset save status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Error saving pause position:', err);
      setSaveStatus('error');
    }
  };
  
  // Handle video completion
  const handleVideoEnd = async () => {
    if (!videoId) return;
    
    try {
      await axios.post(`/videos/${videoId}/progress`, {
        position_seconds: 0,
        is_completed: true,
        notes: notes,
        is_bookmarked: bookmarked
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Update local progress
      setVideoProgress(prev => prev ? {
        ...prev,
        is_completed: true
      } : null);
    } catch (err) {
      console.error('Error marking video as completed:', err);
    }
  };
  
  // Save notes
  const saveNotes = async () => {
    if (!videoId) {
      console.error('Cannot save notes: Video ID is missing');
      setSaveStatus('error');
      return;
    }
    
    console.log('Saving notes for video ID:', videoId);
    console.log('Notes content:', notes);
    console.log('videoProgress:', videoProgress);
    
    try {
      setSaveStatus('saving');
      
      // Fallback for position if videoProgress is null
      const positionSeconds = videoProgress?.position_seconds || 0;
      
      const payload = {
        position_seconds: positionSeconds,
        notes: notes,
        is_bookmarked: bookmarked
      };
      
      console.log('Sending payload to backend:', payload);
      
      const response = await axios.post(`/videos/${videoId}/progress`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Backend response:', response.data);
      
      setSaveStatus('saved');
      
      // Update local progress
      setVideoProgress(prev => prev ? {
        ...prev,
        notes: notes
      } : {
        // Create a minimal progress object if none exists
        id: response.data.id,
        video_id: Number(videoId),
        user_id: response.data.user_id,
        position_seconds: positionSeconds,
        notes: notes,
        is_bookmarked: bookmarked,
        last_watched: new Date().toISOString(),
        is_completed: false,
        duration_seconds: 0,
        watch_progress: positionSeconds,
        is_watched: false,
        personal_notes: notes
      });
      
      // Reset save status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error: any) {
      console.error('Error saving notes:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Response error:', error.response.data);
        console.error('Status code:', error.response.status);
      } else if (error.request) {
        console.error('Request was made but no response was received');
        console.error(error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      setSaveStatus('error');
    }
  };
  
  // Toggle bookmark
  const toggleBookmark = async () => {
    if (!videoId) {
      console.error('Cannot toggle bookmark: Video ID is missing');
      return;
    }
    
    const newBookmarkStatus = !bookmarked;
    setBookmarked(newBookmarkStatus);
    
    try {
      const positionSeconds = videoProgress?.position_seconds || 0;
      
      const payload = {
        position_seconds: positionSeconds,
        notes: notes,
        is_bookmarked: newBookmarkStatus
      };
      
      console.log('Toggling bookmark with payload:', payload);
      
      const response = await axios.post(`/videos/${videoId}/progress`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Bookmark toggle response:', response.data);
      
      // Update local progress
      setVideoProgress(prev => prev ? {
        ...prev,
        is_bookmarked: newBookmarkStatus
      } : {
        // Create a minimal progress object if none exists
        id: response.data.id,
        video_id: Number(videoId),
        user_id: response.data.user_id,
        position_seconds: positionSeconds,
        notes: notes,
        is_bookmarked: newBookmarkStatus,
        last_watched: new Date().toISOString(),
        is_completed: false,
        duration_seconds: 0,
        watch_progress: positionSeconds,
        is_watched: false,
        personal_notes: notes
      });
    } catch (error: any) {
      console.error('Error toggling bookmark:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Response error:', error.response.data);
        console.error('Status code:', error.response.status);
      } else if (error.request) {
        console.error('Request was made but no response was received');
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      // Revert UI state on error
      setBookmarked(!newBookmarkStatus);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle duration change
  const handleDurationChange = async (duration: number) => {
    if (!videoId) return;
    
    console.log('Video duration detected:', duration);
    
    // Update video object with duration
    setVideo(prev => prev ? {
      ...prev,
      duration_seconds: duration
    } : null);
    
    // Update progress with duration too
    setVideoProgress(prev => prev ? {
      ...prev,
      duration_seconds: duration
    } : null);
    
    // Store the duration in local storage as a fallback
    localStorage.setItem(`video_duration_${videoId}`, duration.toString());
    
    // Also, update the server with this duration if needed
    try {
      // Only update if we have a video progress
      if (videoProgress) {
        await axios.post(`/videos/${videoId}/progress`, {
          position_seconds: videoProgress.position_seconds,
          duration_seconds: duration
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Updated video progress with duration:', duration);
      }
    } catch (error) {
      console.error('Error updating duration on server:', error);
    }
  };
  
  // Handle creator change
  const handleCreatorChange = async (e: SelectChangeEvent<unknown>) => {
    try {
      if (!video) return;
      
      const creatorId = Number(e.target.value);
      if (isNaN(creatorId)) return;
      
      // Call API to update the video's creator
      await dispatch(setVideoCreator({ videoId: Number(videoId), creatorId }));
      
      // Update local video state with new creator
      const selectedCreator = creators.find(c => c.id === creatorId);
      if (selectedCreator) {
        setVideo({
          ...video,
          creator: selectedCreator.name,
          creator_relation_id: creatorId
        } as VideoTutorial);
      }
      
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error setting creator:', error);
      setSaveStatus('error');
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error || !video) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Video not found'}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/video-tutorials')}
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/video-tutorials')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            {video.title}
          </Typography>
          
          <IconButton 
            color={bookmarked ? 'primary' : 'default'}
            onClick={toggleBookmark}
            sx={{ mr: 1 }}
          >
            {bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
          
          <IconButton>
            <ShareIcon />
          </IconButton>
        </Box>
        
        {/* Video Player */}
        <Paper 
          elevation={3} 
          sx={{ 
            mb: 3, 
            overflow: 'hidden',
            borderRadius: 2
          }}
        >
          <VideoPlayer
            url={video.url}
            initialPosition={videoProgress?.position_seconds || 0}
            onTimeUpdate={handleTimeUpdate}
            onVideoEnd={handleVideoEnd}
            onPause={handlePause}
            onDurationChange={handleDurationChange}
          />
        </Paper>
        
        {/* Save Status */}
        {saveStatus === 'saving' && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress color="primary" />
          </Box>
        )}
        
        {saveStatus === 'saved' && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="success">Progress saved!</Alert>
          </Box>
        )}
        
        {saveStatus === 'error' && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="error">Failed to save progress. Please try again.</Alert>
          </Box>
        )}
        
        {/* Video metadata */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  {video.title}
                </Typography>
                
                {video.category && (
                  <Chip 
                    label={video.category.name} 
                    color="primary" 
                    size="small"
                  />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="h6" component="span" sx={{ mr: 1 }}>
                  Creator:
                </Typography>
                
                {(user as any)?.is_admin ? (
                  <FormControl sx={{ minWidth: 200 }}>
                    <Select
                      value={(video as any).creator_relation_id || ''}
                      onChange={handleCreatorChange}
                      displayEmpty
                      size="small"
                    >
                      <MenuItem value="">
                        <em>Not assigned</em>
                      </MenuItem>
                      {creators.map((creator) => (
                        <MenuItem key={creator.id} value={creator.id}>
                          {creator.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Typography variant="body1">
                    {video.creator || 'Unknown'}
                  </Typography>
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                By {video.creator || 'Unknown Creator'} • {video.published_date ? new Date(video.published_date).toLocaleDateString() : (video.upload_date ? new Date(video.upload_date).toLocaleDateString() : 'Unknown date')}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                sx={{ mb: 2 }}
              >
                <Tab label="Description" />
                <Tab label="My Notes" />
                <Tab label="Key Points" />
              </Tabs>
              
              {activeTab === 0 && (
                <Box>
                  <Typography variant="body1" paragraph>
                    {video.description || 'No description available.'}
                  </Typography>
                  
                  {video.tags && video.tags.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      {video.tags.map((tag: string, index: number) => (
                        <Chip 
                          key={index} 
                          label={tag} 
                          size="small" 
                          sx={{ mr: 1, mb: 1 }} 
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              )}
              
              {activeTab === 1 && (
                <Box>
                  <TextField
                    label="Your Notes"
                    multiline
                    rows={6}
                    fullWidth
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Take notes about this video..."
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={saveNotes}
                    disabled={saveStatus === 'saving'}
                  >
                    {saveStatus === 'saving' ? 'Saving...' : 'Save Notes'}
                  </Button>
                </Box>
              )}
              
              {activeTab === 2 && (
                <Box>
                  {video.key_points ? (
                    <Typography variant="body1" paragraph>
                      {video.key_points}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No key points available for this video.
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            {/* Video completion status */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Progress
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={
                      videoProgress?.is_completed 
                        ? 100 
                        : (videoProgress?.position_seconds && (video?.duration_seconds || videoProgress?.duration_seconds))
                          ? Math.min(Math.round((videoProgress.position_seconds / ((video?.duration_seconds || videoProgress?.duration_seconds) || 1)) * 100), 100)
                          : 0
                    } 
                    sx={{ flexGrow: 1, mr: 2 }}
                  />
                  <Typography variant="body2">
                    {videoProgress?.is_completed
                      ? '100%'
                      : (videoProgress?.position_seconds && (video?.duration_seconds || videoProgress?.duration_seconds))
                        ? `${Math.min(Math.round((videoProgress.position_seconds / ((video?.duration_seconds || videoProgress?.duration_seconds) || 1)) * 100), 100)}%`
                        : '0%'
                    }
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {videoProgress?.is_completed ? (
                      <Chip 
                        icon={<FlagIcon />} 
                        label="Completed" 
                        color="success" 
                        size="small" 
                      />
                    ) : videoProgress?.position_seconds ? (
                      <Box>
                        <Typography variant="body2">
                          Current position: {formatTime(videoProgress.position_seconds)}
                        </Typography>
                        {video?.duration_seconds || videoProgress?.duration_seconds ? (
                          <Typography variant="body2" color="text.secondary">
                            Total duration: {formatTime(video?.duration_seconds || videoProgress?.duration_seconds || 0)}
                          </Typography>
                        ) : null}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not started yet
                      </Typography>
                    )}
                  </Box>
                  
                  {videoProgress?.last_watched && (
                    <Typography variant="body2" color="text.secondary">
                      Last watched: {new Date(videoProgress.last_watched).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
            
            {/* Related videos section - if we had related videos data */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Related Videos
                </Typography>
                
                <List disablePadding>
                  {/* This is a placeholder for related videos */}
                  <Typography variant="body2" color="text.secondary">
                    Related videos will appear here as you watch more content.
                  </Typography>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default VideoPlayerPage; 