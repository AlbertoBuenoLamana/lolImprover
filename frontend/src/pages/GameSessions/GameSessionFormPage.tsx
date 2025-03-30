import React, { useEffect, useState, useCallback } from 'react';
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
import GameSessionGoals from '../../components/Feature/GameSessionGoals';
import ReviewTimer from '../../components/GameSessions/ReviewTimer';
import { fetchGoals } from '../../store/slices/goalSlice';

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
  
  // Filter to only show active goals
  const activeGoals = goals.filter(goal => goal.status === 'active');
  
  // State to manage selected goals in the form
  const [selectedGoals, setSelectedGoals] = useState<GameSessionGoalProgress[]>([]);
  
  // State for notification when timer ends
  const [showTimerNotification, setShowTimerNotification] = useState<boolean>(false);
  
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
