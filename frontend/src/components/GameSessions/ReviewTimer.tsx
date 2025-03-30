import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  LinearProgress, 
  Paper, 
  IconButton,
  Tooltip
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AlarmIcon from '@mui/icons-material/Alarm';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

// Duration in seconds (10 minutes = 600 seconds)
const TIMER_DURATION = 600;

interface ReviewTimerProps {
  onTimerComplete?: () => void;
}

const ReviewTimer: React.FC<ReviewTimerProps> = ({ onTimerComplete }) => {
  const [timeLeft, setTimeLeft] = useState<number>(TIMER_DURATION);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Play sound function with multiple fallbacks
  const playSound = () => {
    if (isMuted) return;
    
    // Try to play the audio element if it exists
    if (audioRef.current) {
      const playPromise = audioRef.current.play();
      
      // Handle play() promise failures
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Error playing audio:', error);
          // Fallback to Web Audio API
          try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = context.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, context.currentTime); // Beep at 800Hz
            oscillator.connect(context.destination);
            oscillator.start();
            setTimeout(() => oscillator.stop(), 200); // Beep for 200ms
          } catch (err) {
            console.warn('Web Audio API fallback failed:', err);
          }
        });
      }
    } else {
      // If no audio element, use Web Audio API directly
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, context.currentTime);
        oscillator.connect(context.destination);
        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
      } catch (err) {
        console.warn('Web Audio API failed:', err);
      }
    }
  };

  // Create audio element when component mounts
  useEffect(() => {
    try {
      // Use multiple fallback options for audio
      audioRef.current = new Audio('/audio/timer-beep.mp3');
      
      // If local file fails, try online sources
      audioRef.current.addEventListener('error', () => {
        console.warn('Local audio file failed to load, using built-in beep');
        audioRef.current = null; // Will trigger the Web Audio API fallback
      });
      
      audioRef.current.volume = 0.7;
    } catch (err) {
      console.warn('Audio initialization failed:', err);
      audioRef.current = null;
    }
    
    return () => {
      // Clean up interval when component unmounts
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Start the timer
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            if (intervalRef.current) {
              window.clearInterval(intervalRef.current);
            }
            
            // Play sound when timer completes
            playSound();
            setTimeout(() => playSound(), 700);
            setTimeout(() => playSound(), 1400);
            
            // Notify parent component
            if (onTimerComplete) {
              onTimerComplete();
            }
            
            setIsRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
  };

  // Pause the timer
  const pauseTimer = () => {
    if (isRunning && intervalRef.current) {
      window.clearInterval(intervalRef.current);
      setIsRunning(false);
    }
  };

  // Reset the timer
  const resetTimer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    setIsRunning(false);
    setTimeLeft(TIMER_DURATION);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress for the progress bar (inverted: 0% at start, 100% at end)
  const progress = ((TIMER_DURATION - timeLeft) / TIMER_DURATION) * 100;

  // Determine color based on time left
  const getColor = () => {
    if (timeLeft < 60) return 'error';  // Last minute: red
    if (timeLeft < 180) return 'warning';  // Last 3 minutes: yellow/orange
    return 'primary';  // Default: blue
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        borderRadius: 2,
        border: timeLeft === 0 ? '2px solid #f44336' : 'none',
        backgroundColor: timeLeft === 0 ? 'rgba(244, 67, 54, 0.1)' : 'background.paper'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <AlarmIcon sx={{ mr: 1, color: getColor() }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Review Timer
        </Typography>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            fontFamily: 'monospace', 
            fontWeight: 'bold',
            color: timeLeft === 0 ? 'error.main' : getColor()
          }}
        >
          {formatTime(timeLeft)}
        </Typography>
      </Box>
      
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ 
          height: 8, 
          borderRadius: 4, 
          mb: 2, 
          backgroundColor: 'rgba(0,0,0,0.1)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: timeLeft === 0 ? '#f44336' : undefined
          }
        }}
        color={getColor()}
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {timeLeft === 0 ? (
            <span style={{ color: '#f44336', fontWeight: 'bold' }}>Time's up!</span>
          ) : isRunning ? (
            'Timer running...'
          ) : (
            'Start timer for review'
          )}
        </Typography>
        
        <Box>
          <Tooltip title={isMuted ? "Unmute" : "Mute"}>
            <IconButton 
              size="small" 
              onClick={toggleMute}
              color={isMuted ? "default" : "primary"}
            >
              {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Reset">
            <IconButton 
              size="small" 
              onClick={resetTimer}
              sx={{ ml: 1 }}
              disabled={timeLeft === TIMER_DURATION}
            >
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
          
          {isRunning ? (
            <Tooltip title="Pause">
              <IconButton 
                color="primary" 
                onClick={pauseTimer}
                sx={{ ml: 1 }}
              >
                <PauseIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={timeLeft === 0 ? "Restart" : "Start"}>
              <IconButton 
                color="primary" 
                onClick={timeLeft === 0 ? resetTimer : startTimer}
                sx={{ ml: 1 }}
              >
                <PlayArrowIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      
      {/* Hidden notification text for screen readers */}
      {timeLeft === 0 && (
        <span className="sr-only" aria-live="assertive">
          Time's up! Your 10-minute review period has ended.
        </span>
      )}
    </Paper>
  );
};

export default ReviewTimer; 