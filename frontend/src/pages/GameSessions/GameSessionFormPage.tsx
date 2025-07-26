import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, FieldArray, FormikErrors, FormikTouched } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Rating,
  Card,
  CardContent,
  Tooltip,
  Snackbar,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { 
  fetchGameSession, 
  createGameSession, 
  updateGameSession, 
  clearCurrentSession 
} from '../../store/slices/gameSessionSlice';
import { RootState, AppDispatch } from '../../store';
import { GameSessionFormData, Goal, GameSessionGoalProgress, GameSessionCreate } from '../../types';
import ChampionSelect from '../../components/GameSessions/ChampionSelect';
import ChampionCategorySelector from '../../components/GameSessions/ChampionCategorySelector';
import GameSessionGoals from '../../components/Feature/GameSessionGoals';
import ReviewTimer from '../../components/GameSessions/ReviewTimer';
import { fetchGoals } from '../../store/slices/goalSlice';
import { fetchChampionPools } from '../../store/slices/championPoolSlice';
import ChampionCard from '../../components/Ui/ChampionCard';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';

// Validation schema
const GameSessionSchema = Yup.object().shape({
  player_character: Yup.string().required('Player character is required'),
  enemy_character: Yup.string().required('Enemy character is required'),
  result: Yup.string().required('Result is required'),
  mood_rating: Yup.number()
    .min(1, 'Mood rating must be at least 1')
    .max(5, 'Mood rating must be at most 5')
    .required('Mood rating is required'),
  goals: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required('Goal title is required'),
      achieved: Yup.boolean(),
    })
  ),
  notes: Yup.string(),
});

interface GameSessionState {
  currentSession: any;
  loading: boolean;
  error: string | null;
}

const GameSessionFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { currentSession, loading, error } = useSelector((state: RootState) => state.gameSessions as GameSessionState);
  const { goals } = useSelector((state: RootState) => state.goals);
  const { pools, loading: poolsLoading } = useSelector((state: RootState) => state.championPools);
  
  // Filter to only show active goals
  const activeGoals = goals.filter(goal => goal.status === 'active');
  
  // State to manage selected goals in the form
  const [selectedGoals, setSelectedGoals] = useState<GameSessionGoalProgress[]>([]);
  
  // State for notification when timer ends
  const [showTimerNotification, setShowTimerNotification] = useState<boolean>(false);
  
  // State for the voice reminder
  const [reminderIntervalSeconds, setReminderIntervalSeconds] = useState<string>('60');
  const [isReminderActive, setIsReminderActive] = useState<boolean>(false);
  const reminderTimerId = useRef<NodeJS.Timeout | null>(null);
  const speechSynth = window.speechSynthesis; // Reference to speech synthesis
  
  const isEditMode = !!id;
  
  // Function to safely extract error message
  const getErrorMessage = (error: any) => {
    if (!error) return null;
    
    // If error is already a string, return it
    if (typeof error === 'string') return error;
    
    // If error is an object with a message property
    if (error.msg) return error.msg;
    
    // If error is an object with another structure, try to extract useful info
    if (typeof error === 'object') {
      if (JSON.stringify(error) !== '{}') {
        return JSON.stringify(error);
      }
    }
    
    // Fallback error message
    return 'An unexpected error occurred';
  };
  
  // Initial form values
  const getInitialValues = (): GameSessionFormData => {
    return {
      date: new Date().toISOString().split('T')[0],
      champion: '',
      enemy_champion: '',
      player_character: '',
      enemy_character: '',
      result: 'win',
      kda: '0/0/0',
      cs: 0,
      vision_score: 0,
      mood_rating: 3,
      goals: [],
      goal_progress: [],
      notes: '',
    };
  };
  
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchGameSession(parseInt(id)));
    }
    
    // Load the goals for the user
    dispatch(fetchGoals());
    
    // Load champion pools
    dispatch(fetchChampionPools());
    
    return () => {
      dispatch(clearCurrentSession());
    };
  }, [dispatch, isEditMode, id]);
  
  // Initialize selected goals from current session if in edit mode
  useEffect(() => {
    if (isEditMode && currentSession && currentSession.goal_progress) {
      setSelectedGoals(currentSession.goal_progress);
    }
  }, [isEditMode, currentSession]);
  
  const getFormValues = (): GameSessionFormData => {
    if (isEditMode && currentSession) {
      const goalsArray = Object.entries(currentSession.goals || {}).map(
        ([title, achieved]) => ({ title, achieved: achieved as boolean })
      );
      
      return {
        date: currentSession.date || new Date().toISOString().split('T')[0],
        champion: currentSession.player_character || '',
        enemy_champion: currentSession.enemy_character || '',
        player_character: currentSession.player_character || '',
        enemy_character: currentSession.enemy_character || '',
        result: (currentSession.result?.toLowerCase() as 'win' | 'loss') || 'win',
        kda: currentSession.kda || '0/0/0',
        cs: currentSession.cs || 0,
        vision_score: currentSession.vision_score || 0,
        mood_rating: currentSession.mood_rating || 3,
        goals: goalsArray,
        goal_progress: currentSession.goal_progress || [],
        notes: currentSession.notes || '',
      };
    }
    return getInitialValues();
  };
  
  // Add goal to the selected goals
  const handleAddGoal = (goalId: number) => {
    const goalToAdd = goals.find(g => g.id === goalId);
    if (goalToAdd) {
      setSelectedGoals(prev => [
        ...prev,
        {
          goal_id: goalId,
          title: goalToAdd.title,
          notes: '',
          progress_rating: 3 // Default rating
        }
      ]);
    }
  };
  
  // Remove goal from selected goals
  const handleRemoveGoal = (goalId: number) => {
    setSelectedGoals(prev => prev.filter(g => g.goal_id !== goalId));
  };
  
  // Update notes for a goal
  const handleGoalNotesChange = (goalId: number, notes: string) => {
    setSelectedGoals(prev => 
      prev.map(g => g.goal_id === goalId ? { ...g, notes } : g)
    );
  };
  
  // Update progress rating for a goal
  const handleGoalProgressChange = (goalId: number, progress: number) => {
    setSelectedGoals(prev => 
      prev.map(g => g.goal_id === goalId ? { ...g, progress_rating: progress } : g)
    );
  };
  
  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    setShowTimerNotification(true);
    // Optional: Auto-scroll to notes section
    const notesElement = document.getElementById('notes');
    if (notesElement) {
      notesElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      notesElement.focus();
    }
  }, []);

  // Close notification
  const handleCloseNotification = () => {
    setShowTimerNotification(false);
  };
  
  // Function to speak the reminder phrase
  const speakReminder = useCallback(() => {
    if (!speechSynth) {
      console.error("Web Speech API not supported in this browser.");
      alert("Speech synthesis not supported in this browser.");
      setIsReminderActive(false); // Disable if not supported
      return;
    }

    // Create the utterance
    const utterance = new SpeechSynthesisUtterance("¿Qué es lo siguiente?");

    // Attempt to set Spanish voice
    const voices = speechSynth.getVoices();
    const spanishVoice = voices.find(voice => voice.lang.startsWith('es'));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    } else {
      utterance.lang = 'es-ES'; // Fallback to setting language
      console.warn("Spanish voice not found, using default voice with lang='es-ES'.");
    }

    utterance.rate = 1; // Adjust rate as needed
    utterance.pitch = 1; // Adjust pitch as needed

    // Speak the phrase
    speechSynth.speak(utterance);
  }, [speechSynth]);

  // Function to toggle the reminder
  const handleToggleReminder = () => {
    if (isReminderActive) {
      // Stop the reminder
      if (reminderTimerId.current) {
        clearInterval(reminderTimerId.current);
        reminderTimerId.current = null;
      }
      setIsReminderActive(false);
      // Optionally cancel any ongoing speech
      if (speechSynth.speaking) {
         speechSynth.cancel();
      }
    } else {
      // Start the reminder
      const interval = parseInt(reminderIntervalSeconds, 10);
      if (isNaN(interval) || interval <= 0) {
        alert("Please enter a valid positive number for the interval in seconds.");
        return;
      }

      // Speak immediately
      speakReminder();

      // Start the interval
      reminderTimerId.current = setInterval(() => {
        speakReminder();
      }, interval * 1000); // Convert seconds to milliseconds

      setIsReminderActive(true);
    }
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    // Pre-load voices (optional but good practice)
    if (speechSynth) {
      speechSynth.getVoices(); // Call once to potentially trigger voice loading
      speechSynth.onvoiceschanged = () => {
         console.log("Speech synthesis voices loaded.");
      };
    }

    return () => {
      if (reminderTimerId.current) {
        clearInterval(reminderTimerId.current);
      }
      // Stop any speech when navigating away
      if (speechSynth && speechSynth.speaking) {
        speechSynth.cancel();
      }
    };
  }, [speechSynth]);
  
  const handleSubmit = async (values: GameSessionFormData) => {
    // Create session data with only the fields expected by the backend
    // Use the GameSessionCreate type which matches what the API expects
    const sessionData: GameSessionCreate = {
      player_character: values.player_character || values.champion,
      enemy_character: values.enemy_character || values.enemy_champion,
      result: values.result,
      mood_rating: values.mood_rating,
      // No longer using the goalsObject derived from values.goals
      goal_progress: selectedGoals,
      notes: values.notes,
      // Only send date if provided and it's a valid ISO string
      ...(values.date && { date: new Date(values.date).toISOString() })
    };
    
    console.log('Sending game session data:', sessionData);
    
    if (isEditMode && id) {
      await dispatch(updateGameSession({ id: parseInt(id), sessionData }));
    } else {
      await dispatch(createGameSession(sessionData));
    }
    
    navigate('/game-sessions');
  };
  
  // Handle selecting a champion from pool
  const handleSelectChampionFromPool = (championName: string, setFieldValue: any) => {
    setFieldValue('player_character', championName);
  };
  
  if (isEditMode && loading && !currentSession) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            color="primary"
            sx={{ mr: 2 }}
            onClick={() => navigate('/game-sessions')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isEditMode ? 'Edit Game Session' : 'New Game Session'}
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {getErrorMessage(error)}
          </Alert>
        )}
        
        <Paper sx={{ p: 3 }}>
          <Formik
            initialValues={getFormValues()}
            validationSchema={GameSessionSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, setFieldValue }) => (
              <Form>
                <Grid container spacing={3}>
                  {/* Champion Pool Section */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Your Champion Pools</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Select a champion from your pools or search below
                    </Typography>
                    
                    {poolsLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : pools.length > 0 ? (
                      <ChampionCategorySelector
                        pools={pools}
                        loading={poolsLoading}
                        onSelectChampion={(championName) => handleSelectChampionFromPool(championName, setFieldValue)}
                        selectedChampionName={values.player_character}
                      />
                    ) : (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        You don't have any champion pools yet. <Button size="small" onClick={() => navigate('/champion-pools')}>Create a pool</Button>
                      </Alert>
                    )}
                    <Divider sx={{ my: 2 }} />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <ChampionSelect
                      id="player_character"
                      name="player_character"
                      label="Player Character"
                      value={values.player_character}
                      onChange={(value) => setFieldValue('player_character', value)}
                      error={touched.player_character && Boolean(errors.player_character)}
                      helperText={touched.player_character && errors.player_character ? String(errors.player_character) : undefined}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <ChampionSelect
                      id="enemy_character"
                      name="enemy_character"
                      label="Enemy Character"
                      value={values.enemy_character}
                      onChange={(value) => setFieldValue('enemy_character', value)}
                      error={touched.enemy_character && Boolean(errors.enemy_character)}
                      helperText={touched.enemy_character && errors.enemy_character ? String(errors.enemy_character) : undefined}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Game Result</FormLabel>
                      <Field as={RadioGroup} row name="result">
                        <FormControlLabel value="win" control={<Radio />} label="Win" />
                        <FormControlLabel value="loss" control={<Radio />} label="Loss" />
                      </Field>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box>
                      <FormLabel component="legend">Mood Rating</FormLabel>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating
                          name="mood_rating"
                          value={values.mood_rating}
                          onChange={(event: React.SyntheticEvent, newValue: number | null) => {
                            setFieldValue('mood_rating', newValue);
                          }}
                        />
                        <Box sx={{ ml: 2 }}>
                          {['😡', '😕', '😐', '🙂', '😄'][values.mood_rating - 1] || ''}
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>
                  
                  {/* Review Timer */}
                  <Grid item xs={12}>
                    <Box sx={{ my: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        Set Review Timer
                        <Tooltip title="Set a 10-minute timer to focus on your game review">
                          <span style={{ marginLeft: '8px', fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>
                            (Recommended)
                          </span>
                        </Tooltip>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Use this timer to limit your review to 10 minutes. Focus on key points and avoid overthinking.
                      </Typography>
                      <ReviewTimer onTimerComplete={handleTimerComplete} />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box mt={2}>
                      <GameSessionGoals
                        activeGoals={activeGoals}
                        selectedGoals={selectedGoals}
                        onAddGoal={handleAddGoal}
                        onRemoveGoal={handleRemoveGoal}
                        onGoalNotesChange={handleGoalNotesChange}
                        onGoalProgressChange={handleGoalProgressChange}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      id="notes"
                      name="notes"
                      label="Notes"
                      multiline
                      rows={4}
                      error={touched.notes && Boolean(errors.notes)}
                      helperText={touched.notes && errors.notes}
                    />
                  </Grid>
                  
                  {/* --- Reminder Feature --- */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>Voice Reminder</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                     <TextField
                       fullWidth
                       label="Reminder Interval (seconds)"
                       type="number"
                       value={reminderIntervalSeconds}
                       onChange={(e) => setReminderIntervalSeconds(e.target.value)}
                       disabled={isReminderActive} // Disable input while active
                       inputProps={{ min: "1" }}
                     />
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                     <Button
                       variant="contained"
                       color={isReminderActive ? "secondary" : "primary"}
                       onClick={handleToggleReminder}
                       startIcon={<SpeakerNotesIcon />}
                       fullWidth
                     >
                       {isReminderActive ? 'Stop Reminder' : 'Start Reminder'}
                     </Button>
                  </Grid>
                   {/* --- End Reminder Feature --- */}
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/game-sessions')}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} /> : isEditMode ? 'Update' : 'Create'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
      
      {/* Timer complete notification */}
      <Snackbar
        open={showTimerNotification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        message="⏰ Time's up! 10-minute review period has ended."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{
          sx: {
            backgroundColor: 'error.dark',
            fontWeight: 'bold'
          }
        }}
        action={
          <Button color="inherit" size="small" onClick={handleCloseNotification}>
            OK
          </Button>
        }
      />
    </Container>
  );
};

export default GameSessionFormPage;
