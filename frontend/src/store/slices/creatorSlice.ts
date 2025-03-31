import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import { RootState } from '../index';

// Types
export interface Creator {
  id: number;
  name: string;
  description?: string;
  platform: string;
  platform_id: string;
  url?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatorState {
  creators: Creator[];
  currentCreator: Creator | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: CreatorState = {
  creators: [],
  currentCreator: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCreators = createAsyncThunk(
  'creators/fetchCreators',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/videos/creators/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch creators');
    }
  }
);

export const fetchCreatorById = createAsyncThunk(
  'creators/fetchCreatorById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/videos/creators/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch creator');
    }
  }
);

export const createCreator = createAsyncThunk(
  'creators/createCreator',
  async (creatorData: Omit<Creator, 'id'>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/videos/creators/', creatorData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create creator');
    }
  }
);

export const updateCreator = createAsyncThunk(
  'creators/updateCreator',
  async ({ id, creatorData }: { id: number; creatorData: Partial<Creator> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/videos/creators/${id}`, creatorData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update creator');
    }
  }
);

export const deleteCreator = createAsyncThunk(
  'creators/deleteCreator',
  async (id: number, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/videos/creators/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete creator');
    }
  }
);

// Slice
const creatorSlice = createSlice({
  name: 'creators',
  initialState,
  reducers: {
    clearCreatorError(state) {
      state.error = null;
    },
    setCurrentCreator(state, action: PayloadAction<Creator | null>) {
      state.currentCreator = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch creators
      .addCase(fetchCreators.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCreators.fulfilled, (state, action) => {
        state.loading = false;
        state.creators = action.payload;
      })
      .addCase(fetchCreators.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch creator by ID
      .addCase(fetchCreatorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCreatorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCreator = action.payload;
      })
      .addCase(fetchCreatorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create creator
      .addCase(createCreator.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCreator.fulfilled, (state, action) => {
        state.loading = false;
        state.creators.push(action.payload);
      })
      .addCase(createCreator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update creator
      .addCase(updateCreator.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCreator.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.creators.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.creators[index] = action.payload;
        }
        if (state.currentCreator && state.currentCreator.id === action.payload.id) {
          state.currentCreator = action.payload;
        }
      })
      .addCase(updateCreator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete creator
      .addCase(deleteCreator.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCreator.fulfilled, (state, action) => {
        state.loading = false;
        state.creators = state.creators.filter(c => c.id !== action.payload);
        if (state.currentCreator && state.currentCreator.id === action.payload) {
          state.currentCreator = null;
        }
      })
      .addCase(deleteCreator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCreatorError, setCurrentCreator } = creatorSlice.actions;
export default creatorSlice.reducer; 