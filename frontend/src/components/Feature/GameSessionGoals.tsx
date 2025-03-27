import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Divider,
  Rating,
  IconButton,
  Card,
  CardContent,
  Chip,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Goal, GameSessionGoalProgress } from '../../types';
import GoalItem from '../Ui/GoalItem';

/**
 * GameSessionGoals
 * 
 * Goals selection and progress for game sessions
 * 
 * @category feature
 */

export interface GameSessionGoalsProps {
  activeGoals: Goal[];
  selectedGoals: GameSessionGoalProgress[];
  onAddGoal: (goalId: number) => void;
  onRemoveGoal: (goalId: number) => void;
  onGoalNotesChange: (goalId: number, notes: string) => void;
  onGoalProgressChange: (goalId: number, progress: number) => void;
  loading?: boolean;
}

const GameSessionGoals: React.FC<GameSessionGoalsProps> = ({
  activeGoals,
  selectedGoals,
  onAddGoal,
  onRemoveGoal,
  onGoalNotesChange,
  onGoalProgressChange,
  loading = false
}) => {
  // Start with goal selector shown by default
  const [showGoalSelector, setShowGoalSelector] = useState(true);
  
  // Find goals that aren't already selected
  const availableGoals = activeGoals.filter(
    goal => !selectedGoals.some(selected => selected.goal_id === goal.id)
  );

  // Hide the selector automatically when there are no more goals to add
  useEffect(() => {
    if (availableGoals.length === 0) {
      setShowGoalSelector(false);
    }
  }, [availableGoals.length]);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2">
          Goals for this Session
        </Typography>
        
        {availableGoals.length > 0 && (
          <Button
            variant="outlined"
            startIcon={showGoalSelector ? undefined : <AddIcon />}
            onClick={() => setShowGoalSelector(!showGoalSelector)}
          >
            {showGoalSelector ? 'Hide Goals' : 'Select Goals'}
          </Button>
        )}
      </Box>
      
      {/* Goal selection area */}
      {showGoalSelector && (
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            Select goals for this session:
          </Typography>
          
          <Box maxHeight={300} overflow="auto" p={1}>
            {availableGoals.length > 0 ? (
              availableGoals.map(goal => (
                <Box key={goal.id} mb={1} display="flex" alignItems="center">
                  <Typography variant="body1" flex={1}>
                    {goal.title}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => goal.id && onAddGoal(goal.id)}
                    startIcon={<AddIcon />}
                  >
                    Add
                  </Button>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                No more goals available to add. Create new goals in the Goals tab.
              </Typography>
            )}
          </Box>
          <Divider sx={{ my: 2 }} />
        </Box>
      )}
      
      {/* Selected goals */}
      <Box>
        {selectedGoals.length > 0 ? (
          <Typography variant="subtitle1" gutterBottom>
            Your goals for this session:
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" align="center">
            {availableGoals.length > 0 
              ? "Select goals from above to track during this session." 
              : activeGoals.length === 0
                ? "You don't have any active goals. Go to the Goals tab to create goals before tracking them in sessions."
                : "No goals available. Create new goals in the Goals tab."}
          </Typography>
        )}
        
        {selectedGoals.map((goalProgress) => {
          // Find the corresponding goal in activeGoals
          const goal = activeGoals.find(g => g.id === goalProgress.goal_id);
          
          if (!goal) return null;
          
          return (
            <Card key={goalProgress.goal_id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6">
                    {goal.title}
                  </Typography>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => onRemoveGoal(goalProgress.goal_id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {goal.description}
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Progress Rating
                    </Typography>
                    <Rating
                      name={`progress-${goalProgress.goal_id}`}
                      value={goalProgress.progress_rating}
                      onChange={(_, newValue) => {
                        onGoalProgressChange(goalProgress.goal_id, newValue || 0);
                      }}
                      precision={1}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes on progress for this goal"
                      multiline
                      rows={2}
                      value={goalProgress.notes}
                      onChange={(e) => onGoalNotesChange(goalProgress.goal_id, e.target.value)}
                      variant="outlined"
                      size="small"
                      placeholder="How did you do on this goal? What worked well? What could be improved?"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Paper>
  );
};

export default GameSessionGoals;
