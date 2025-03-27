import React, { useEffect } from 'react';
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
import { GameSessionFormData } from '../../types';
import ChampionSelect from '../../components/GameSessions/ChampionSelect';

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
      notes: '',
    };
  };
  
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchGameSession(parseInt(id)));
    }
    
    return () => {
      dispatch(clearCurrentSession());
    };
  }, [dispatch, isEditMode, id]);
  
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
        notes: currentSession.notes || '',
      };
    }
    return getInitialValues();
  };
  
  const handleSubmit = async (values: GameSessionFormData) => {
    // Convert goals from array to object (dictionary)
    const goalsObject = values.goals?.reduce((obj: Record<string, boolean>, goal: { title: string; achieved: boolean }) => {
      obj[goal.title] = goal.achieved;
      return obj;
    }, {} as Record<string, boolean>) || {};
    
    // Create session data with only the fields expected by the backend
    const sessionData = {
      player_character: values.player_character || values.champion,
      enemy_character: values.enemy_character || values.enemy_champion,
      result: values.result,
      mood_rating: values.mood_rating,
      goals: goalsObject,
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Goals</Typography>
                      <Tooltip title="Add Goal">
                        <IconButton
                          color="primary"
                          onClick={() => {
                            setFieldValue('goals', [
                              ...values.goals,
                              { title: '', achieved: false },
                            ]);
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <FieldArray name="goals">
                      {({ push, remove, form }) => (
                        <div>
                          {values.goals && values.goals.map((goal: { title: string; achieved: boolean }, index: number) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={8}>
                                  <Field
                                    as={TextField}
                                    fullWidth
                                    name={`goals.${index}.title`}
                                    label="Goal Title"
                                    error={
                                      touched.goals && 
                                      Array.isArray(touched.goals) && 
                                      touched.goals[index] && 
                                      typeof touched.goals[index] === 'object' &&
                                      'title' in (touched.goals[index] as object) &&
                                      Boolean(errors.goals && 
                                      Array.isArray(errors.goals) && 
                                      errors.goals[index] && 
                                      typeof errors.goals[index] === 'object' &&
                                      'title' in (errors.goals[index] as object))
                                    }
                                    helperText={
                                      touched.goals && 
                                      Array.isArray(touched.goals) && 
                                      touched.goals[index] && 
                                      typeof touched.goals[index] === 'object' &&
                                      'title' in (touched.goals[index] as object) &&
                                      (errors.goals && 
                                      Array.isArray(errors.goals) && 
                                      errors.goals[index] && 
                                      typeof errors.goals[index] === 'object' &&
                                      'title' in (errors.goals[index] as object) ?
                                      String((errors.goals[index] as any).title) : null)
                                    }
                                  />
                                </Grid>
                                <Grid item xs={3}>
                                  <FormControlLabel
                                    control={
                                      <Field
                                        as={Radio}
                                        name={`goals.${index}.achieved`}
                                        checked={values.goals[index].achieved}
                                        onChange={() => {
                                          setFieldValue(`goals.${index}.achieved`, !values.goals[index].achieved);
                                        }}
                                      />
                                    }
                                    label="Achieved"
                                  />
                                </Grid>
                                <Grid item xs={1}>
                                  <IconButton
                                    color="error"
                                    onClick={() => {
                                      const newGoals = [...values.goals];
                                      newGoals.splice(index, 1);
                                      setFieldValue('goals', newGoals);
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Grid>
                              </Grid>
                            </Box>
                          ))}
                        </div>
                      )}
                    </FieldArray>
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
    </Container>
  );
};

export default GameSessionFormPage;
