import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Goal, GoalFormData } from '../../types';
import * as goalApi from '../../api/goalApi';

// Helper function to extract error message from API responses
const extractErrorMessage = (error: any): string => {
  if (!error) return 'Unknown error occurred';
  
  if (error.response?.data) {
    const data = error.response.data;
    
    // Handle string error messages
    if (typeof data === 'string') return data;
    
    // Handle FastAPI validation error format
    if (data.detail) {
      if (typeof data.detail === 'string') return data.detail;
      
      // Handle array of errors
      if (Array.isArray(data.detail)) {
        return data.detail.map((err: any) => 
          err.msg ? `${err.loc.join('.')}: ${err.msg}` : JSON.stringify(err)
        ).join('; ');
      }
      
      // Handle object with type/msg structure
      if (data.detail.msg) return data.detail.msg;
      
      return JSON.stringify(data.detail);
    }
    
    // Return stringified data if nothing else works
    return JSON.stringify(data);
  }
  
  // Use error message directly if available
  return error.message || 'Unknown error occurred';
};

// State type
interface GoalState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: GoalState = {
  goals: [],
  loading: false,
  error: null
};

// Async thunks
export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      return await goalApi.fetchGoals();
    } catch (error: any) {
      console.error('Error fetching goals:', error);
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (goalData: GoalFormData, { rejectWithValue }) => {
    try {
      console.log('Creating goal with data in slice:', goalData);
      return await goalApi.createGoal(goalData);
    } catch (error: any) {
      console.error('Error creating goal:', error);
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async ({ id, goalData }: { id: number, goalData: GoalFormData }, { rejectWithValue }) => {
    try {
      return await goalApi.updateGoal(id, goalData);
    } catch (error: any) {
      console.error(`Error updating goal ${id}:`, error);
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async (id: number, { rejectWithValue }) => {
    try {
      await goalApi.deleteGoal(id);
      return id;
    } catch (error: any) {
      console.error(`Error deleting goal ${id}:`, error);
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateGoalStatus = createAsyncThunk(
  'goals/updateGoalStatus',
  async ({ id, status }: { id: number, status: 'active' | 'completed' | 'archived' }, { rejectWithValue }) => {
    try {
      return await goalApi.updateGoalStatus(id, status);
    } catch (error: any) {
      console.error(`Error updating status for goal ${id}:`, error);
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Slice
const goalSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearGoalErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch goals
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action: PayloadAction<Goal[]>) => {
        state.loading = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create goal
      .addCase(createGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGoal.fulfilled, (state, action: PayloadAction<Goal>) => {
        state.loading = false;
        state.goals.push(action.payload);
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update goal
      .addCase(updateGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGoal.fulfilled, (state, action: PayloadAction<Goal>) => {
        state.loading = false;
        const index = state.goals.findIndex(goal => goal.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete goal
      .addCase(deleteGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGoal.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.goals = state.goals.filter(goal => goal.id !== action.payload);
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update goal status
      .addCase(updateGoalStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGoalStatus.fulfilled, (state, action: PayloadAction<Goal>) => {
        state.loading = false;
        const index = state.goals.findIndex(goal => goal.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      })
      .addCase(updateGoalStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearGoalErrors } = goalSlice.actions;
export default goalSlice.reducer; 