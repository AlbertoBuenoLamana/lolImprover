import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '../../api/axios';

interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
  stats?: {
    game_sessions_count?: number;
    videos_watched_count?: number;
    goals_achieved_count?: number;
    win_rate?: number;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
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

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('Attempting to login user:', credentials.username);
      
      // Use FormData with the correct content type
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      
      const response = await axios.post('/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const { access_token } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', access_token);
      
      // Get user data
      const userResponse = await axios.get('/users/me');
      
      return {
        user: userResponse.data,
        token: access_token,
      };
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error.message);
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('Attempting to register user:', userData);
      // Use the axios instance with configured baseURL
      const response = await axios.post('/users/', userData);
      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Registration failed:', error.response?.data || error.message);
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      
      if (!auth.token) {
        return rejectWithValue('No token found');
      }
      
      // Use the axios instance which already handles the auth token
      const response = await axios.get('/users/me');
      
      return response.data;
    } catch (error: any) {
      // If token is invalid, clear it
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData: { username: string; email: string; current_password?: string; new_password?: string }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      
      if (!auth.token) {
        return rejectWithValue('No token found');
      }
      
      const response = await axios.put('/users/me', profileData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Get current user
    builder.addCase(getCurrentUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(getCurrentUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.isAuthenticated = false;
      state.token = null;
    });
    
    // Update user profile
    builder.addCase(updateUserProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
