import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import { GameSession, GameSessionCreate } from '../../types';

interface GameSessionState {
  sessions: GameSession[];
  currentSession: GameSession | null;
  loading: boolean;
  error: string | null;
}

const initialState: GameSessionState = {
  sessions: [],
  currentSession: null,
  loading: false,
  error: null,
};

// Helper function to extract error message from API responses
const extractErrorMessage = (error: any): string => {
  if (!error) return 'Unknown error occurred';
  
  // If error response contains validation error details
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

// Get all game sessions
export const fetchGameSessions = createAsyncThunk(
  'gameSessions/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      // Get auth state from Redux
      const { auth } = getState() as { auth: { token: string | null } };
      
      // Use token from Redux state or fallback to localStorage
      const token = auth.token || localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('Authentication required. Please log in.');
      }
      
      console.log('Fetching game sessions with token:', token ? 'Token exists' : 'No token');
      
      const response = await axios.get('/game-sessions/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch game sessions:', error.response?.data || error.message);
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Get a single game session
export const fetchGameSession = createAsyncThunk(
  'gameSessions/fetchOne',
  async (id: number, { getState, rejectWithValue }) => {
    try {
      // Get auth state from Redux
      const { auth } = getState() as { auth: { token: string | null } };
      
      // Use token from Redux state or fallback to localStorage
      const token = auth.token || localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('Authentication required. Please log in.');
      }
      
      const response = await axios.get(`/game-sessions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch game session:', error.response?.data || error.message);
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Create a new game session
export const createGameSession = createAsyncThunk(
  'gameSessions/create',
  async (sessionData: GameSessionCreate, { getState, rejectWithValue }) => {
    try {
      // Get auth state from Redux
      const { auth } = getState() as { auth: { token: string | null } };
      
      // Use token from Redux state or fallback to localStorage
      const token = auth.token || localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('Authentication required. Please log in.');
      }
      
      const response = await axios.post('/game-sessions/', sessionData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to create game session:', error.response?.data || error.message);
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Update a game session
export const updateGameSession = createAsyncThunk(
  'gameSessions/update',
  async ({ id, sessionData }: { id: number; sessionData: GameSessionCreate }, { getState, rejectWithValue }) => {
    try {
      // Get auth state from Redux
      const { auth } = getState() as { auth: { token: string | null } };
      
      // Use token from Redux state or fallback to localStorage
      const token = auth.token || localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('Authentication required. Please log in.');
      }
      
      const response = await axios.put(`/game-sessions/${id}`, sessionData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to update game session:', error.response?.data || error.message);
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Delete a game session
export const deleteGameSession = createAsyncThunk(
  'gameSessions/delete',
  async (id: number, { getState, rejectWithValue }) => {
    try {
      // Get auth state from Redux
      const { auth } = getState() as { auth: { token: string | null } };
      
      // Use token from Redux state or fallback to localStorage
      const token = auth.token || localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('Authentication required. Please log in.');
      }
      
      await axios.delete(`/game-sessions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return id;
    } catch (error: any) {
      console.error('Failed to delete game session:', error.response?.data || error.message);
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const gameSessionSlice = createSlice({
  name: 'gameSessions',
  initialState,
  reducers: {
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all game sessions
    builder.addCase(fetchGameSessions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGameSessions.fulfilled, (state, action: PayloadAction<GameSession[]>) => {
      state.loading = false;
      state.sessions = action.payload;
    });
    builder.addCase(fetchGameSessions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Fetch a single game session
    builder.addCase(fetchGameSession.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGameSession.fulfilled, (state, action: PayloadAction<GameSession>) => {
      state.loading = false;
      state.currentSession = action.payload;
    });
    builder.addCase(fetchGameSession.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Create a new game session
    builder.addCase(createGameSession.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createGameSession.fulfilled, (state, action: PayloadAction<GameSession>) => {
      state.loading = false;
      state.sessions.push(action.payload);
      state.currentSession = action.payload;
    });
    builder.addCase(createGameSession.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Update a game session
    builder.addCase(updateGameSession.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateGameSession.fulfilled, (state, action: PayloadAction<GameSession>) => {
      state.loading = false;
      const index = state.sessions.findIndex(session => session.id === action.payload.id);
      if (index !== -1) {
        state.sessions[index] = action.payload;
      }
      state.currentSession = action.payload;
    });
    builder.addCase(updateGameSession.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Delete a game session
    builder.addCase(deleteGameSession.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteGameSession.fulfilled, (state, action: PayloadAction<number>) => {
      state.loading = false;
      state.sessions = state.sessions.filter(session => session.id !== action.payload);
      if (state.currentSession?.id === action.payload) {
        state.currentSession = null;
      }
    });
    builder.addCase(deleteGameSession.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearCurrentSession, clearError } = gameSessionSlice.actions;
export default gameSessionSlice.reducer;
